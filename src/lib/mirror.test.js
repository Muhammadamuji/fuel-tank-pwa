import { describe, expect, it, vi } from "vitest";
import { enqueue, flushQueue, localStampToIso, pendingCount, toDeliveryRecord, toReadingRecord, usernameToEmail } from "./mirror";

const TANK_IDS = { "totalVilankulo|Tank 1": "tank-uuid-1" };

function memoryStorage() {
  const data = {};
  return { getItem: (key) => data[key] ?? null, setItem: (key, value) => { data[key] = value; } };
}

function fakeClient({ session = true, upsertError = null } = {}) {
  const upsert = vi.fn().mockResolvedValue({ error: upsertError });
  const client = {
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: session ? {} : null } }) },
    from: vi.fn((table) => (table === "tanks"
      ? { select: vi.fn().mockResolvedValue({ data: [{ id: "tank-uuid-1", station_id: "totalVilankulo", name: "Tank 1" }], error: null }) }
      : { upsert })),
  };
  return { client, upsert };
}

const READING = { id: "r1", date: "2026-06-02 11:55:01", station: "TOTAL VILANKULO", tank: "Tank 1", product: "Diesel", mm: 450, liters: 4452, percentage: 15.1, ullage: 25000, operator: "Maria" };

describe("usernameToEmail", () => {
  it("maps a username to the hidden login email", () => {
    expect(usernameToEmail(" TOTAL ")).toBe("total@fueltank.local");
  });
});

describe("localStampToIso", () => {
  it("round-trips the local wall-clock time", () => {
    const back = new Date(localStampToIso("2026-06-02 11:55:01"));
    expect([back.getFullYear(), back.getMonth(), back.getDate(), back.getHours(), back.getMinutes()]).toEqual([2026, 5, 2, 11, 55]);
  });

  it("returns null for unreadable stamps", () => {
    expect(localStampToIso("not a date")).toBeNull();
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
    enqueue(storage, { kind: "reading", row: READING, isEdit: false });

    const result = await flushQueue(storage, client);

    expect(result).toEqual({ sent: 1, pending: 0 });
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ legacy_id: "r1" }), { onConflict: "legacy_id", ignoreDuplicates: true });
    expect(pendingCount(storage)).toBe(0);
  });

  it("keeps jobs queued when there is no signed-in session", async () => {
    const storage = memoryStorage();
    const { client, upsert } = fakeClient({ session: false });
    enqueue(storage, { kind: "reading", row: READING, isEdit: false });

    expect(await flushQueue(storage, client)).toEqual({ sent: 0, pending: 1 });
    expect(upsert).not.toHaveBeenCalled();
  });

  it("keeps a job queued when the database rejects it", async () => {
    const storage = memoryStorage();
    const { client } = fakeClient({ upsertError: { message: "boom" } });
    enqueue(storage, { kind: "reading", row: READING, isEdit: false });

    expect(await flushQueue(storage, client)).toEqual({ sent: 0, pending: 1 });
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
    enqueue(storage, { kind: "reading", row: READING, isEdit: false });
    expect(await flushQueue(storage, null)).toEqual({ sent: 0, pending: 1 });
  });
});
