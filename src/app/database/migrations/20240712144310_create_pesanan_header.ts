import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('pesananheader', (table) => {
        table.increments('id').primary();
        table.date('tglbukti').nullable();
        table.string('customer').nullable();
        table.string('keterangan').nullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('pesananheader');
}

