import { NextRequest, NextResponse } from 'next/server';

// Vision APIのRESTエンドポイント
const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

// 環境変数からAPIキーを安全に取得
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY;

// JANコードの妥当性をチェックする簡易的な関数
// EAN-13のチェックデジット検証 (最後の1桁が正しく計算されているか)
function validateJanCode(code: string) {
  if (code.length !== 13) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(code[i], 10);
    if (isNaN(digit)) return false;
    sum += (i % 2 === 0) ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(code[12], 10);
}

// POSTリクエストを処理するハンドラ関数
export async function POST(req: NextRequest) {
  if (!apiKey) {
    return NextResponse.json(
      { message: 'Server configuration error: API Key is not defined.' },
      { status: 500 }
    );
  }
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ message: 'Image data is required.' }, { status: 400 });
    }

    // Vision APIへのリクエストボディを構築
    const requestBody = {
      requests: [
        {
          image: {
            content: imageBase64,
          },
          features: [
            {
              // BARCODE_DETECTIONの代わりにTEXT_DETECTIONを使用
              type: 'TEXT_DETECTION',
            },
          ],
        },
      ],
    };

    // fetch APIを使ってVision APIにリクエストを送信
    const apiResponse = await fetch(`${VISION_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const apiData = await apiResponse.json();
    console.log('Vision API Response:', JSON.stringify(apiData, null, 2));

    if (!apiResponse.ok || apiData.error) {
      console.error('Vision API Error:', apiData.error);
      return NextResponse.json(
        { message: 'Vision API returned an error.', error: apiData.error },
        { status: apiResponse.status }
      );
    }
    
    // 検出されたすべてのテキストを抽出
    const fullText = apiData.responses[0]?.fullTextAnnotation?.text || '';
    
    // 1. テキストからすべての空白と改行を除去
    const cleanedText = fullText.replace(/\s/g, '');
    
    // 2. クリーンなテキストから連続した13桁の数字を検索
    const regex = /(\d{13})/;
    const matches = cleanedText.match(regex);

    if (matches && matches[0]) {
      const candidateCode = matches[0];
      // 3. 抽出した数字がJANコードとして妥当か検証
      if (validateJanCode(candidateCode)) {
        return NextResponse.json({ jancode: candidateCode }, { status: 200 });
      }
    }
    
    // JANコードが見つからない、または妥当でない場合
    return NextResponse.json({ jancode: null, message: 'No valid JAN code detected.' }, { status: 200 });

  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
