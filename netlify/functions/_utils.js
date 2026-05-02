import { getStore } from "@netlify/blobs";

export const store = getStore("expense-forms");

export function response(statusCode, body) {
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}

export function parseBody(event) {
  if (typeof event?.body === "string") {
    try {
      return JSON.parse(event.body);
    } catch {
      return {};
    }
  }

  if (typeof event?.json === "function") {
    return event.json().catch(() => ({}));
  }

  return {};
}

export function getMethod(event) {
  return event?.httpMethod || event?.method || "";
}

export function getQueryParam(event, key) {
  const fromClassic = event?.queryStringParameters?.[key];
  if (fromClassic) {
    return fromClassic;
  }

  if (event?.url) {
    try {
      return new URL(event.url).searchParams.get(key);
    } catch {
      return null;
    }
  }

  return null;
}

export async function parseBodyAsync(event) {
  const parsed = parseBody(event);
  if (parsed && typeof parsed.then === "function") {
    return parsed;
  }
  return parsed;
}

export async function saveRecord(record) {
  await store.set(record.id, JSON.stringify(record));
  return record;
}

export async function getRecord(id) {
  const raw = await store.get(id, { type: "text" });
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function deleteRecord(id) {
  await store.delete(id);
}

export async function listRecords() {
  const all = [];
  let cursor;

  do {
    const page = await store.list({ cursor });
    cursor = page.cursor;

    for (const blob of page.blobs || []) {
      const raw = await store.get(blob.key, { type: "text" });
      if (!raw) {
        continue;
      }
      try {
        const parsed = JSON.parse(raw);
        all.push(parsed);
      } catch {
        // Skip malformed entries.
      }
    }
  } while (cursor);

  return all;
}
