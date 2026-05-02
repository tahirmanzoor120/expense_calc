import { getMethod, parseBodyAsync, response, saveRecord } from "./_utils.js";

export default async (request) => {
  if (getMethod(request) !== "POST") {
    return response(405, { error: "Method not allowed" });
  }

  const incoming = await parseBodyAsync(request);
  const now = new Date().toISOString();
  const id = incoming.id || globalThis.crypto.randomUUID();

  const record = {
    ...incoming,
    id,
    createdAt: incoming.createdAt || now,
    updatedAt: now
  };

  await saveRecord(record);
  return response(200, { id: record.id, updatedAt: record.updatedAt });
};
