import db from "./db";
export async function getPesananDetailById(id: number) {
    const pesanandetail = await db("pesanandetail")
      .select(
        "pesanandetail.id",
        "pesananheader.id as pesananheaderid",
        "pesananheader.customer as customernama",
        "pesanandetail.product",
        "pesanandetail.qty",
        "pesanandetail.harga",
        "pesanandetail.totalharga"
      )
      .join("pesananheader", "pesanandetail.pesananheaderid", "=", "pesananheader.id")
      .where("pesanandetail.pesananheaderid", id);
    return pesanandetail;
  }

  export async function processStoreDetail(id: number,data: any) {
     await Promise.all(
      data.map((detail: any) =>
        db("pesanandetail").insert({
          pesananheaderid: id,
          product: detail.product,
          qty: detail.qty,
          harga: detail.harga,
          totalharga: detail.totalharga,
        })
      )
    );

    return data;

  }