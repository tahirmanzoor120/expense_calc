import { deleteRecord, getMethod, getQueryParam, getRecord, response } from "./_utils.js";

export default async (request) => {
  if (getMethod(request) !== "DELETE") {
    return response(405, { error: "Method not allowed" });
  }

  const id = getQueryParam(request, "id");
  if (!id) {
    return response(400, { error: "Missing id" });
  }

  const existing = await getRecord(id);
  if (!existing) {
    return response(404, { error: "Record not found" });
  }

  await deleteRecord(id);
  return response(200, { id, deleted: true });
};
