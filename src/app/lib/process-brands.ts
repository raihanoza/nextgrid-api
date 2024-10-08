import db from "./db";

export async function getDataBrands() {
  const brands = await db("brands").select("*");
  return brands;
}
