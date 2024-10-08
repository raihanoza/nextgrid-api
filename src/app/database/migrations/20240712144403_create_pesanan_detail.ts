import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('pesanandetail', (table) => {
        table.increments('id').primary();
        table.integer('pesananheaderid').unsigned().references('id').inTable('pesananheader').onDelete('CASCADE');
        table.string('product').nullable();
        table.integer('qty').nullable(); 
        table.decimal('harga', 10, 2).nullable(); 
        table.decimal('totalharga', 10, 2).nullable(); 
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('pesanandetail');
}

