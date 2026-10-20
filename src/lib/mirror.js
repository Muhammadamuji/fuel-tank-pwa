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

// App timestamps are local "YYYY-MM-DD HH:MM:SS"; devices run on Mozambique time.
export function localStampToIso(stamp) {
  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2}):?(\d{2})?/.exec(String(stamp || "").trim());
  if (!match) return null;
  const [, year, month, day, hour, minute, second = "0"] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
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

function readQueue(storage) {
  try {
    const saved = JSON.parse(storage.getItem(QUEUE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function writeQueue(storage, queue) {
  try {
    storage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Storage full or blocked: the Sheets copy is still the source of truth in this phase.
  }
}

export function enqueue(storage, job) {
  writeQueue(storage, [...readQueue(storage), job]);
}

export function pendingCount(storage) {
  return readQueue(storage).length;
}

async function loadTankIds(client) {
  const { data, error } = await client.from("tanks").select("id,station_id,name");
  if (error) throw error;
  return Object.fromEntries(data.map((tank) => [tankKey(tank.station_id, tank.name), tank.id]));
}

async function sendJob(client, job, tankIds) {
  const record = job.kind === "reading" ? toReadingRecord(job.row, tankIds) : toDeliveryRecord(job.row, tankIds);
  if (!record) return; // Row can't be mapped (unknown station/tank): drop it rather than retry forever.
  const table = job.kind === "reading" ? "readings" : "deliveries";
  const { error } = await client.from(table).upsert(record, { onConflict: "legacy_id", ignoreDuplicates: !job.isEdit });
  if (error) throw error;
}

// Sends every queued job; jobs that fail stay in the queue for the next attempt.
export async function flushQueue(storage, client = supabase) {
  const queue = readQueue(storage);
  if (!client || queue.length === 0) return { sent: 0, pending: queue.length };
  const { data: sessionData } = await client.auth.getSession();
  if (!sessionData?.session) return { sent: 0, pending: queue.length };

  let tankIds;
  try {
    tankIds = await loadTankIds(client);
  } catch {
    return { sent: 0, pending: queue.length };
  }

  const remaining = [];
  let sent = 0;
  for (const job of queue) {
    try {
      await sendJob(client, job, tankIds);
      sent += 1;
    } catch {
      remaining.push(job);
    }
  }
  writeQueue(storage, remaining);
  return { sent, pending: remaining.length };
}

export async function mirrorRows(storage, kind, rows, isEdit = false) {
  rows.forEach((row) => enqueue(storage, { kind, row, isEdit }));
  return flushQueue(storage);
}

export async function signInWithPin(username, pin, client = supabase) {
  if (!client) return false;
  const { error } = await client.auth.signInWithPassword({ email: usernameToEmail(username), password: `${pin}${PIN_SUFFIX}` });
  return !error;
}

export async function signOutCloud(client = supabase) {
  if (client) await client.auth.signOut();
}
