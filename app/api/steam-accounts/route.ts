import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch("https://api.lzt.market/steam?page=18&pmax=2000", {
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
    return NextResponse.json({ error: 'Failed to fetch Steam accounts' }, { status: 500 });
  }
}