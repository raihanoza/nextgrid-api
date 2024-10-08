// Import Knex configuration
import db from "@/app/lib/db";
import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  


  const trx = await db.transaction();

  try {
    // Lock the row for the given ID
    const rows = await trx('products')
      .where('id', 11)
      .forUpdate()
      .select();

    if (rows.length === 0) {
      throw new Error('Row not found');
    }

    // Perform the desired operation, e.g., updating or processing the row
    // Example: Updating a column value
    // await trx('your_table')
    //   .where('id', id)
    //   .update({ column_name: 'new_value' });

    // Commit the transaction
    // await trx.commit();  

    return NextResponse.json({ status: true, message: 'Row successfully locked and updated' });
  } catch (error : any) {
    // Rollback the transaction in case of an error
    await trx.rollback();
    console.error('Error during transaction:', error);
    return NextResponse.json({ status: false, message: `Transaction failed: ${error.message}` }, { status: 500 });
  }
}
