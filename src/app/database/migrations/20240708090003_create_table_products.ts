import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {

    await knex.schema.createTable('products', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.integer('brand_id').unsigned().references('id').inTable('brands').onDelete('CASCADE');
        table.float('price').notNullable();
      });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('products');
}

