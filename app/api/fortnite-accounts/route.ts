import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch("https://api.lzt.market/fortnite", {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.API_BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();
    console.log('API Response:', data); // Log the raw response

    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      return NextResponse.json({ error: 'Failed to parse API response' }, { status: 500 });
    }

    if (!jsonData || !jsonData.items) {
      return NextResponse.json({ error: 'Invalid data structure from API' }, { status: 500 });
    }

    return NextResponse.json(jsonData);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: 'Failed to fetch Fortnite accounts' }, { status: 500 });
  }
}
    