import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const pageSize = 999; // You can adjust this value as needed

    const apiUrl = `https://api.lzt.market/riot?page=${page}&pmax=2000&order_by=price_to_up&country[]=BRA&inv_min=1000&per_page=${pageSize}`;

    const response = await fetch(apiUrl, {
      headers: {
        'accept': 'application/json',
        'authorization': `Bearer ${process.env.API_BEARER_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Assuming the API returns total items count. If not, you might need to adjust this.
    const totalItems = data.total || data.items.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    return NextResponse.json({
      items: data.items,
      currentPage: parseInt(page),
      totalPages: totalPages,
      totalItems: totalItems
    });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: 'Failed to fetch Valorant accounts' }, { status: 500 });
  }
}
