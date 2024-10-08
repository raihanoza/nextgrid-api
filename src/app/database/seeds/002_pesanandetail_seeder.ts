import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("pesanandetail").del();

    // Inserts seed entries
    await knex("pesanandetail").insert([
        { id: 1, pesananheaderid: 1, product: "sabun", qty: 1, harga: 10000, totalharga: 10000 },
        { id: 2, pesananheaderid: 1, product: "shampoo", qty: 2, harga: 15000, totalharga: 30000 },
        { id: 3, pesananheaderid: 2, product: "pasta gigi", qty: 1, harga: 10000, totalharga: 10000 },
        { id: 4, pesananheaderid: 2, product: "sikat gigi", qty: 2, harga: 15000, totalharga: 30000 },
        
    ]);
};
