import { getDataPesananHeader } from "@/app/lib/process-pesananheader";
import { NextRequest, NextResponse } from "next/server";

// Define the expected sort direction types
type SortDirection = 'ASC' | 'DESC';

export async function POST(req: NextRequest) {
  try {
    const { customer, keterangan, tglbukti, sortColumn, sortDirection, page, limit } = await req.json();

    // Validate sortDirection
    const validatedSortDirection: SortDirection = 
      (sortDirection === 'ASC' || sortDirection === 'DESC') 
        ? sortDirection 
        : 'ASC'; // Default to 'ASC' if invalid or undefined

    // Prepare the parameters
    const params = {
      customer: customer || '',
      keterangan: keterangan || '',
      tglbukti: tglbukti || '',
      sortColumn: sortColumn || 'customer', // Default to sorting by 'id'
      sortDirection: validatedSortDirection,
      limit: Number(limit) || 10, // Number of items per page
      page: Number(page) || 1, // Current page number
    };

    // Fetch data using the provided parameters
    const data = await getDataPesananHeader(params);

    // Create a response object containing the filters and data
    const response = {
      data: data, // Extracting just the data from the response
      totalCount: data.totalCount, // Include total count from getDataPesananHeader
      totalPages: data.totalPages, // Include total pages from getDataPesananHeader
      page: data.page, // Current page
      limit: data.limit // Limit per page
    };

    return NextResponse.json(response); // Return the response as JSON
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
