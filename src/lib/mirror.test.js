import { describe, expect, it, vi } from "vitest";
import { deadCount, enqueue, flushQueue, localStampToIso, mirrorRows, pendingCount, signInWithPin, toDeliveryRecord, toReadingRecord, usernameToEmail } from "./mirror";

const TANK_ROWS = [{ id: "tank-uuid-1", station_id: "totalVilankulo", name: "Tank 1" }];
const TANK_IDS = { "totalVilankulo|Tank 1": "tank-uuid-1" };

function memoryStorage() {
  const data = {};
  return { getItem: (key) => data[key] ?? null, setItem: (key, value) => { data[key] = value; } };
}

function fakeClient({ session = true, upsertResult = { error: null, status: 201 }, tanks = TANK_ROWS, upsert } = {}) {
  const upsertFn = upsert || vi.fn().mockResolvedValue(upsertResult);
  const client = {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: session ? { user: { email: "total@fueltank.local" } } : null } }),
      signOut: vi.fn().mockResolvedValue({}),
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn((table) => (table === "tanks"
      ? { select: vi.fn().mockResolvedValue({ data: tanks, error: null }) }
      : { upsert: upsertFn })),
  };
  return { client, upsert: upsertFn };
}

const READING = { id: "r1", date: "2026-06-02 11:55:01", station: "TOTAL VILANKULO", tank: "Tank 1", product: "Diesel", mm: 450, liters: 4452, percentage: 15.1, ullage: 25000, operator: "Maria" };
const queueReading = (storage, overrides = {}) => enqueue(storage, { kind: "reading", row: { ...READING, ...overrides }, isEdit: false });

describe("usernameToEmail", () => {
  it("maps a username to the hidden login email", () => {
    expect(usernameToEmail(" TOTAL ")).toBe("total@fueltank.local");
  });
});

describe("localStampToIso", () => {
  it("reads station wall-clock time as Mozambique time (UTC+2) whatever the phone's timezone", () => {
    expect(localStampToIso("2026-06-02 11:55:01")).toBe("2026-06-02T09:55:01.000Z");
    expect(localStampToIso("2026-06-02 6:27:54")).toBe("2026-06-02T04:27:54.000Z");
  });

  it("rejects unreadable stamps and stamps that already carry a timezone", () => {
    expect(localStampToIso("not a date")).toBeNull();
    expect(localStampToIso("2026-10-20T08:00:00Z")).toBeNull();
  });
});

describe("toReadingRecord", () => {
  it("maps an app row to a database record", () => {
    expect(toReadingRecord(READING, TANK_IDS)).toMatchObject({ legacy_id: "r1", station_id: "totalVilankulo", tank_id: "tank-uuid-1", mm: 450, operator: "Maria" });
  });

  it("returns null when the station or tank is unknown", () => {
    expect(toReadingRecord({ ...READING, station: "TEST" }, TANK_IDS)).toBeNull();
    expect(toReadingRecord({ ...READING, tank: "Tank 9" }, TANK_IDS)).toBeNull();
  });
});

describe("toDeliveryRecord", () => {
  it("maps a delivery row and falls back to the created time for updated_at", () => {
    const row = { id: "d1", deliveryId: "TRUCK-1", date: "2026-06-02 11:55:01", updatedAt: "", station: "TOTAL VILANKULO", tank: "Tank 1", initialMm: 10, finalMm: 28, deliveredLiters: 48, invoiceLiters: 50, variance: -2 };
    const record = toDeliveryRecord(row, TANK_IDS);
    expect(record).toMatchObject({ legacy_id: "d1", delivery_id: "TRUCK-1", delivered_liters: 48, variance: -2 });
    expect(record.updated_at).toBe(record.taken_at);
  });
});

describe("flushQueue", () => {
  it("sends queued readings and empties the queue", async () => {
    const storage = memoryStorage();
    const { client, upsert } = fakeClient();
    queueReading(storage);

    expect(await flushQueue(storage, client)).toEqual({ sent: 1, pending: 0 });
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ legacy_id: "r1" }), { onConflict: "legacy_id", ignoreDuplicates: true });
  });

  it("keeps jobs queued when there is no signed-in session", async () => {
    const storage = memoryStorage();
    const { client, upsert } = fakeClient({ session: false });
    queueReading(storage);

    expect(await flushQueue(storage, client)).toEqual({ sent: 0, pending: 1 });
    expect(upsert).not.toHaveBeenCalled();
  });

  it("keeps a job queued on a network or server failure", async () => {
    const storage = memoryStorage();
    queueReading(storage);

    expect(await flushQueue(storage, fakeClient({ upsertResult: { error: { message: "Failed to fetch" }, status: 0 } }).client)).toEqual({ sent: 0, pending: 1 });
    expect(await flushQueue(storage, fakeClient({ upsertResult: { error: { message: "down" }, status: 503 } }).client)).toEqual({ sent: 0, pending: 1 });
    expect(deadCount(storage)).toBe(0);
  });

  it("parks a job the database will never accept instead of retrying forever", async () => {
    const storage = memoryStorage();
    const { client } = fakeClient({ upsertResult: { error: { code: "42501", message: "row-level security" }, status: 403 } });
    queueReading(storage);

    expect(await flushQueue(storage, client)).toEqual({ sent: 0, pending: 0 });
    expect(deadCount(storage)).toBe(1);
  });

  it("keeps everything queued when the login can see no tanks, instead of dropping jobs", async () => {
    const storage = memoryStorage();
    const { client, upsert } = fakeClient({ tanks: [] });
    queueReading(storage);

    expect(await flushQueue(storage, client)).toEqual({ sent: 0, pending: 1 });
    expect(upsert).not.toHaveBeenCalled();
    expect(deadCount(storage)).toBe(0);
  });

  it("parks rows with an unknown tank without losing them", async () => {
    const storage = memoryStorage();
    queueReading(storage, { tank: "Tank 9" });

    expect(await flushQueue(storage, fakeClient().client)).toEqual({ sent: 0, pending: 0 });
    expect(deadCount(storage)).toBe(1);
  });

  it("uses a real upsert for edits so changes overwrite the old row", async () => {
    const storage = memoryStorage();
    const { client, upsert } = fakeClient();
    enqueue(storage, { kind: "reading", row: READING, isEdit: true });

    await flushQueue(storage, client);

    expect(upsert).toHaveBeenCalledWith(expect.anything(), { onConflict: "legacy_id", ignoreDuplicates: false });
  });

  it("does nothing when the cloud mirror is switched off", async () => {
    const storage = memoryStorage();
    queueReading(storage);
    expect(await flushQueue(storage, null)).toEqual({ sent: 0, pending: 1 });
  });

  it("keeps a reading saved while a flush is already sending", async () => {
    const storage = memoryStorage();
    let releaseUpsert;
    const gate = new Promise((resolve) => { releaseUpsert = resolve; });
    const { client, upsert } = fakeClient({ upsert: vi.fn().mockImplementation(async () => { await gate; return { error: null, status: 201 }; }) });
    queueReading(storage, { id: "first" });

    const running = flushQueue(storage, client);
    await vi.waitFor(() => expect(upsert).toHaveBeenCalledTimes(1));
    queueReading(storage, { id: "saved-during-flush" });
    releaseUpsert();
    const result = await running;

    expect(result).toEqual({ sent: 1, pending: 1 });
    expect(pendingCount(storage)).toBe(1);
  });
});

describe("mirrorRows", () => {
  it("queues every row and stays safe when the cloud mirror is switched off", async () => {
    const storage = memoryStorage();

    const result = await mirrorRows(storage, "reading", [READING, { ...READING, id: "r2" }]);

    expect(result).toEqual({ sent: 0, pending: 2 });
    expect(pendingCount(storage)).toBe(2);
  });
});

describe("signInWithPin", () => {
  it("keeps an existing session for the same person", async () => {
    const { client } = fakeClient();
    expect(await signInWithPin("TOTAL", "1234", client)).toBe(true);
    expect(client.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it("drops the previous worker's session before signing in someone else", async () => {
    const { client } = fakeClient();
    expect(await signInWithPin("PETROMOC", "1234", client)).toBe(true);
    expect(client.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(client.auth.signInWithPassword).toHaveBeenCalledWith({ email: "petromoc@fueltank.local", password: "1234#fueltank" });
  });

  it("leaves no session behind when the new sign-in fails", async () => {
    const { client } = fakeClient();
    client.auth.signInWithPassword.mockResolvedValue({ error: { message: "bad" } });
    expect(await signInWithPin("PETROMOC", "0000", client)).toBe(false);
    expect(client.auth.signOut).toHaveBeenCalled();
  });
});
