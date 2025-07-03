import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  // Extrai os parâmetros da URL
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
  }

  try {
    const response = await axios.get(`https://api.lzt.market/${id}`, {
      headers: {
        'accept': 'application/json',
        'authorization': `Bearer ${process.env.API_BEARER_TOKEN}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: 'Failed to fetch product details' }, { status: 500 });
  }
}