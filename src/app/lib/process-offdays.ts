import db from "./db";

export async function getDataOffDays() {
  const offdays = await db("offdays").select("*");
  return offdays;
}
