// app/api/feedback/route.ts (App Router)
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const response = await fetch('https://script.google.com/macros/s/AKfycby7midv5ks1xt_oai49RuZxbt1iTLRWysKvkwm7vS3MEW6zUouGtTm2i2yTI8DqYf_W/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.status !== 'success') {
      return NextResponse.json(
        { error: result.message || 'Failed to save data to Google Sheet' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Feedback saved successfully' });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}