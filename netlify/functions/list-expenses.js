import { getMethod, listRecords, response } from "./_utils.js";

export default async (request) => {
  if (getMethod(request) !== "GET") {
    return response(405, { error: "Method not allowed" });
  }

  const records = await listRecords();
  return response(200, { records });
};
