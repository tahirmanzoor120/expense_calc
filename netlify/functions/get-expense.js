import { getMethod, getQueryParam, getRecord, response } from "./_utils.js";

export default async (request) => {
  if (getMethod(request) !== "GET") {
    return response(405, { error: "Method not allowed" });
  }

  const id = getQueryParam(request, "id");
  if (!id) {
    return response(400, { error: "Missing id" });
  }

  const record = await getRecord(id);
  if (!record) {
    return response(404, { error: "Record not found" });
  }

  return response(200, record);
};
