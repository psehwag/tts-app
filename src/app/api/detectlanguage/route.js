// app/api/detect/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        // const { text } = await req.json();
        const text = 'Prashant Sehwag Senior Software Developer Experienced Java Developer with over 3 years of proven';
        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }
        console.log("Text to detetct: " + text);
        // Make a POST request to LibreTranslate language detection API
        const response = await fetch('https://libretranslate.com/detect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
            }),
        });

        if (!response.ok) {
            throw new Error('Language detection failed');
        }

        const data = await response.json();
        console.log("Return data: " + data);
        // Return the detected language(s)
        return NextResponse.json({ detectedLanguages: data }, { status: 200 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Language detection failed' }, { status: 500 });
    }
}
