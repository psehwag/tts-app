// app/api/translate/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { text, sourceLanguage, targetLanguage } = await req.json();

    if (!text || !sourceLanguage || !targetLanguage) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Make a POST request to LibreTranslate API using fetch
    const response = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: 'What is your name ?',
        source: 'auto',
        target: 'hi',
        format: 'text',
      }),
    });

    if (!response.ok) {
      throw new Error('Translation failed');
    }

    const data = await response.json();
    console.log("Translated text: "+data.translatedText);
    // Return the translated text
    return NextResponse.json({ translatedText: data.translatedText }, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
