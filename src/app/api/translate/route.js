// app/api/translate/route.js
import { NextResponse } from 'next/server';
import { TranslateClient, TranslateTextCommand } from '@aws-sdk/client-translate';
import { franc } from 'franc';
import { iso6393 } from 'iso-639-3';// To convert `franc` language codes to ISO639-1 codes
import { pollyandTranslatorLanguageMap } from '@/utils/languageUtil';

// Create an Amazon Translate client
const client = new TranslateClient({
  region: 'ap-south-1',
  credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Utility function to split text into byte-size chunks
const splitTextIntoChunks = (text, chunkSize = 9500) => {
  const encoder = new TextEncoder();
  const chunks = [];
  let currentPosition = 0;
  while (currentPosition < text.length) {
    const chunk = text.slice(currentPosition, currentPosition + chunkSize);
    const bytes = encoder.encode(chunk);
    if (bytes.length <= chunkSize) {
      chunks.push(chunk);
    } else {
      // Handle case where slicing doesn't perfectly split by bytes
      chunks.push(chunk.slice(0, chunkSize));
    }
    currentPosition += chunkSize;
  }
  return chunks;
};

// Convert `franc` output to ISO639-1 language codes
const getISO6391LanguageCode = (francCode) => {
  const match = iso6393.find((lang) => lang.iso6393 === francCode);
  return match ? match.iso6391 : null;
};

export async function POST(req) {
  try {
    // Parse the request body
    const { text, targetLanguage } = await req.json();
    // Validate the inputs
    if (!text || !targetLanguage) {
      return NextResponse.json({ error: "Text and target language are required" }, { status: 400 });
    }
    const targetLangCode = pollyandTranslatorLanguageMap.get(targetLanguage);
    console.log("Selected code is:::: "+ targetLanguage+ ", Target Language Code:::: "+targetLangCode);
    let langCode = text.length > 50 ? franc(text.substring(0, 50)) : franc(text);
    console.log("Franc Language code: "+langCode);
    if (!langCode || langCode === 'und') {
      return NextResponse.json({ error: 'Unable to detect source language' }, { status: 400 });
    }
    let languageCode = getISO6391LanguageCode(langCode);
    console.log("Language code: "+languageCode);
    if(!languageCode){
      languageCode = "auto";// Automatically detect the source language
    }
    // Split the text into chunks to handle AWS Translate's size limit
    const textChunks = splitTextIntoChunks(text);
    let translatedChunks = [];

    // Loop through each chunk and translate it
    for (const chunk of textChunks) {
      const params = {
        Text: chunk,
        TargetLanguageCode: targetLangCode, // Target language (e.g., 'es' for Spanish)
        SourceLanguageCode: languageCode 
      };

      // Send the translation request for the current chunk
      const command = new TranslateTextCommand(params);
      const data = await client.send(command);
      translatedChunks.push(data.TranslatedText); // Collect the translated chunks
    }

    // Combine the translated chunks and return the full translated text
    const translatedText = translatedChunks.join(' ');
    return NextResponse.json({ translatedText }, { status: 200 });

  } catch (error) {
    console.error("Error translating text:", error);
    // Return error response
    return NextResponse.json({ error: "Failed to translate text" }, { status: 500 });
  }
}

// export async function POST(req) {
//   try {
//     const { text, sourceLanguage, targetLanguage } = await req.json();

//     if (!text || !sourceLanguage || !targetLanguage) {
//       return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
//     }

//     // Make a POST request to LibreTranslate API using fetch
//     const response = await fetch('https://libretranslate.com/translate', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         q: 'What is your name ?',
//         source: 'auto',
//         target: 'hi',
//         format: 'text',
//       }),
//     });

//     if (!response.ok) {
//       throw new Error('Translation failed');
//     }

//     const data = await response.json();
//     console.log("Translated text: "+data.translatedText);
//     // Return the translated text
//     return NextResponse.json({ translatedText: data.translatedText }, { status: 200 });
//   } catch (error) {
//     console.error('Error:', error);
//     return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
//   }
// }
