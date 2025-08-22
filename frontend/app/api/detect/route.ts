import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ message: 'Detect route is active' });
  // TODO: フロントエンドから画像を受け取って、OCR解析でJANコードを取得する処理を実装
}
