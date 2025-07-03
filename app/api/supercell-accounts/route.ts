import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch("https://prod-api.lzt.market/supercell?pmax=1000", {
      headers: {
        'accept': 'application/json',
        'authorization': `Bearer ${process.env.API_BEARER_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: 'Failed to fetch Supercell accounts' }, { status: 500 });
  }
}