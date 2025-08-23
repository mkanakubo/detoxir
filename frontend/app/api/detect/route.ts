import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { 
          success: false,
          message: '画像が提供されていません',
          error: 'No image provided' 
        },
        { status: 400 }
      );
    }

    // 画像をバイナリデータとして読み込む
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 保存するファイルパスを生成
    const timestamp = Date.now();
    const filename = `barcode-${timestamp}.jpg`;
    const path = join(process.cwd(), 'public', 'uploads', filename);

    // 画像を保存
    // await writeFile(path, buffer);

    // 成功レスポンスを返す
    return NextResponse.json({
      success: true,
      message: '画像の送信に成功しました',
      data: {
        filename,
        timestamp,
        filepath: `/uploads/${filename}` // クライアントサイドでアクセス可能なパス
      }
    });

  } catch (error) {
    console.error('Detection error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: '画像の送信に失敗しました',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
