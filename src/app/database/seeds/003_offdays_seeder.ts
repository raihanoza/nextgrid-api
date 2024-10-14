import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("offdays").del();

    // Inserts seed entries
    await knex("offdays").insert([
        { id: 1, date: '2024-09-16', keterangan: "Maulid Nabi", status: 'AKTIF' },
        { id: 2, date: '2024-08-17', keterangan: "Hari Kemerdekaan", status: 'AKTIF' },
        { id: 3, date: '2024-06-01', keterangan: "Hari Lahir Pancasila", status: 'AKTIF' },
        { id: 4, date: '2024-06-17', keterangan: "Idul Adha", status: 'AKTIF' },
        
    ]);
};
