import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
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
    await writeFile(path, buffer);

    // ここで必要に応じて画像の処理やデータベースへの保存などを行う

    return NextResponse.json({ success: true, filename });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
