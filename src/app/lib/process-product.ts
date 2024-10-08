import db from "./db";

export async function getDataProduct() {
  const products = await db("products")
    .join("brands", "products.brand_id", "=", "brands.id")
    .select("products.*", "brands.name as brand_name");
  return products;
}

export async function getProductById(id: number) {
  const product = await db("products")
    .join("brands", "products.brand_id", "=", "brands.id")
    .select("products.*", "brands.name as brand_name")
    .where("products.id", id)
    .first();
  return product;
}

export async function addDataProduct(data: any,trx: any) {
  const product = await trx("products").insert(data);
  return product;
}

export async function updateDataProduct(id: any, data: any) {
  const product = await db("products").where({ id }).update(data);
  return product;
}

export async function deleteDataProduct(id: number) {
  const process = await db("products").where({ id }).del();
  return process;
}
