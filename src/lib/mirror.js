import { supabase } from "./supabase";

// Phase 1 of the Supabase move: Google Sheets stays the source of truth,
// every reading and delivery is also copied to Supabase so the two can be compared.

export const PIN_SUFFIX = "#fueltank";
const QUEUE_KEY = "fuelTankMirrorQueue";
const STATION_IDS = {
  "PETROMOC VILANKULO": "petromocVilankulo",
  "TOTAL VILANKULO": "totalVilankulo",
};

export function usernameToEmail(username) {
  const clean = String(username).trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
  return `${clean}@fueltank.local`;
}

const MOZAMBIQUE_OFFSET = "+02:00";
const pad2 = (value) => String(value).padStart(2, "0");

// App timestamps are "YYYY-MM-DD HH:MM:SS" wall-clock time at the station (Mozambique, UTC+2),
// whatever timezone the phone itself is set to.
export function localStampToIso(stamp) {
  const match = /^(\d{4})-(\d{2})-(\d{2})[ ](\d{1,2}):(\d{2}):?(\d{2})?$/.exec(String(stamp || "").trim());
  if (!match) return null;
  const [, year, month, day, hour, minute, second = "0"] = match;
  const date = new Date(`${year}-${month}-${day}T${pad2(hour)}:${minute}:${pad2(second)}${MOZAMBIQUE_OFFSET}`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function tankKey(stationId, tankName) {
  return `${stationId}|${tankName}`;
}

export function toReadingRecord(row, tankIds) {
  const stationId = STATION_IDS[row.station];
  const tankId = tankIds[tankKey(stationId, row.tank)];
  const takenAt = localStampToIso(row.date);
  if (!stationId || !tankId || !takenAt) return null;
  return {
    legacy_id: String(row.id),
    taken_at: takenAt,
    station_id: stationId,
    tank_id: tankId,
    mm: Number(row.mm) || 0,
    liters: Number(row.liters) || 0,
    percentage: Number(row.percentage) || 0,
    ullage: Number(row.ullage) || 0,
    operator: row.operator || "Not entered",
  };
}

export function toDeliveryRecord(row, tankIds) {
  const stationId = STATION_IDS[row.station];
  const tankId = tankIds[tankKey(stationId, row.tank)];
  const takenAt = localStampToIso(row.date);
  if (!stationId || !tankId || !takenAt) return null;
  return {
    legacy_id: String(row.id),
    delivery_id: row.deliveryId || "TRUCK-DELIVERY-NOT-ENTERED",
    taken_at: takenAt,
    updated_at: localStampToIso(row.updatedAt) || takenAt,
    station_id: stationId,
    tank_id: tankId,
    initial_mm: Number(row.initialMm) || 0,
    final_mm: Number(row.finalMm) || 0,
    initial_liters: Number(row.initialLiters) || 0,
    final_liters: Number(row.finalLiters) || 0,
    delivered_liters: Number(row.deliveredLiters) || 0,
    invoice_liters: Number(row.invoiceLiters) || 0,
    variance: Number(row.variance) || 0,
    reference: row.reference || "Not entered",
    truck_plate: row.truckPlate || "Not entered",
    driver_name: row.driverName || "Not entered",
    operator: row.operator || "Not entered",
  };
}

const QUEUE_KEY_DEAD = "fuelTankMirrorDead";

function readList(storage, key) {
  try {
    const saved = JSON.parse(storage.getItem(key) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function writeList(storage, key, list) {
  try {
    storage.setItem(key, JSON.stringify(list));
  } catch {
    // Storage full or blocked: the Sheets copy is still the source of truth in this phase.
  }
}

function newJobId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function enqueue(storage, job) {
  writeList(storage, QUEUE_KEY, [...readList(storage, QUEUE_KEY), { ...job, id: job.id || newJobId() }]);
}

export function pendingCount(storage) {
  return readList(storage, QUEUE_KEY).length;
}

export function deadCount(storage) {
  return readList(storage, QUEUE_KEY_DEAD).length;
}

// Jobs the database will never accept are parked here for inspection instead of retried forever.
function bury(storage, job, reason) {
  writeList(storage, QUEUE_KEY_DEAD, [...readList(storage, QUEUE_KEY_DEAD), { job, reason, at: new Date().toISOString() }]);
}

async function loadTankIds(client) {
  const { data, error } = await client.from("tanks").select("id,station_id,name");
  if (error) throw error;
  return Object.fromEntries(data.map((tank) => [tankKey(tank.station_id, tank.name), tank.id]));
}

const isRetryable = (status) => !status || status >= 500 || status === 401 || status === 408 || status === 429;

// Returns "sent", "retry" (keep queued) or "dead" (can never succeed).
async function sendJob(client, job, tankIds) {
  const record = job.kind === "reading" ? toReadingRecord(job.row, tankIds) : toDeliveryRecord(job.row, tankIds);
  if (!record) return { outcome: "dead", reason: "unknown station, tank or date" };
  const table = job.kind === "reading" ? "readings" : "deliveries";
  const { error, status } = await client.from(table).upsert(record, { onConflict: "legacy_id", ignoreDuplicates: !job.isEdit });
  if (!error) return { outcome: "sent" };
  return isRetryable(status) ? { outcome: "retry" } : { outcome: "dead", reason: `${status} ${error.code || ""} ${error.message || ""}`.trim() };
}

async function runFlush(storage, client) {
  const snapshot = readList(storage, QUEUE_KEY);
  if (!client || snapshot.length === 0) return { sent: 0, pending: snapshot.length };
  const { data: sessionData } = await client.auth.getSession();
  if (!sessionData?.session) return { sent: 0, pending: snapshot.length };

  let tankIds;
  try {
    tankIds = await loadTankIds(client);
  } catch {
    return { sent: 0, pending: snapshot.length };
  }
  // No visible tanks means this login has no usable profile yet: keep everything queued.
  if (Object.keys(tankIds).length === 0) return { sent: 0, pending: snapshot.length };

  const finished = new Set();
  let sent = 0;
  for (const job of snapshot) {
    let result;
    try {
      result = await sendJob(client, job, tankIds);
    } catch {
      result = { outcome: "retry" };
    }
    if (result.outcome === "sent") sent += 1;
    if (result.outcome === "dead") bury(storage, job, result.reason);
    if (result.outcome !== "retry") finished.add(job.id);
  }
  // Re-read so jobs queued while we were sending are kept.
  const remaining = readList(storage, QUEUE_KEY).filter((job) => !finished.has(job.id));
  writeList(storage, QUEUE_KEY, remaining);
  return { sent, pending: remaining.length };
}

let activeFlush = null;

// Only one flush runs at a time; callers during a flush share its result.
export function flushQueue(storage, client = supabase) {
  if (!activeFlush) {
    activeFlush = runFlush(storage, client).finally(() => { activeFlush = null; });
  }
  return activeFlush;
}

export async function mirrorRows(storage, kind, rows, isEdit = false) {
  rows.forEach((row) => enqueue(storage, { kind, row, isEdit }));
  if (activeFlush) await activeFlush.catch(() => {}); // let the running flush finish, then send the new jobs
  return flushQueue(storage);
}

// Makes sure the cloud session belongs to the person logging in, never a previous worker.
export async function signInWithPin(username, pin, client = supabase) {
  if (!client) return false;
  const email = usernameToEmail(username);
  const { data } = await client.auth.getSession();
  if (data?.session?.user?.email === email) return true;
  await client.auth.signOut({ scope: "local" });
  const { error } = await client.auth.signInWithPassword({ email, password: `${pin}${PIN_SUFFIX}` });
  return !error;
}

export async function signOutCloud(client = supabase) {
  if (client) await client.auth.signOut({ scope: "local" });
}
