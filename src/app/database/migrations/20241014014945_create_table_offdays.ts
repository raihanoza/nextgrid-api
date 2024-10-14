import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('offdays', (table) => {
        table.increments('id').primary();
        table.date('date').notNullable();
        table.string('keterangan').notNullable();
        table.string('status').notNullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('offdays');
}

