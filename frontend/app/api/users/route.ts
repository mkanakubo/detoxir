import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sub, weight, age, sleepTime } = body;

    // バリデーション
    if (!sub) {
      return NextResponse.json(
        { error: 'User sub is required' },
        { status: 400 }
      );
    }

    if (!weight || !age || !sleepTime) {
      return NextResponse.json(
        { error: 'Weight, age, and sleep time are required' },
        { status: 400 }
      );
    }

    // バックエンドAPIにデータを送信
    const response = await fetch(`https://atlas-api-845348887893.asia-northeast1.run.app/api/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth0_id: sub,
        weight_kg: parseFloat(weight),
        age: parseInt(age),
        sleepTime,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to save user data to backend' },
        { status: 500 }
      );
    }

    const userData = await response.json();

    return NextResponse.json({
      success: true,
      message: 'User data saved successfully',
      data: userData,
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sub = searchParams.get('sub');

    if (!sub) {
      return NextResponse.json(
        { error: 'User sub is required' },
        { status: 400 }
      );
    }

    // バックエンドからユーザーデータを取得
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/v1/users?auth0_id=${encodeURIComponent(sub)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      const errorData = await response.text();
      console.error('Backend API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch user data from backend' },
        { status: 500 }
      );
    }

    const userData = await response.json();

    return NextResponse.json({
      success: true,
      data: userData,
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
