// app/api/extract/route.js
import { NextResponse } from 'next/server';
import Tesseract from 'tesseract.js';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { TextractClient, DetectDocumentTextCommand } from '@aws-sdk/client-textract';

const textractClient = new TextractClient({
    region: "ap-south-1", // e.g., "us-east-1"
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,      // Replace with your Access Key ID
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Replace with your Secret Access Key
    },
});

export async function POST(request) {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || file.size === 0) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const mimeType = file.type; // Get the file's MIME type

    try {
        // Handle PDF files
        if (mimeType === 'application/pdf') {
            const buffer = Buffer.from(await file.arrayBuffer());
            const data = await pdfParse(buffer);
            return NextResponse.json({ text: data.text });
        }

        // Handle DOCX files
        if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer); // Create a Uint8Array from the arrayBuffer

            // Use Mammoth to extract text from DOCX file
            const result = await mammoth.extractRawText({ buffer: uint8Array });
            return NextResponse.json({ text: result.value });
        }

        // Handle plain text files
        if (mimeType === 'text/plain') {
            const text = await file.text();
            return NextResponse.json({ text });
        }

        // Handle image files (JPEG, PNG, etc.)
        if (mimeType.startsWith('image/')) {
            const arrayBuffer = await file.arrayBuffer();
            const imageBytes = new Uint8Array(arrayBuffer); // Convert to Uint8Array for AWS Textract

            // Use AWS Textract to extract text from the image
            const command = new DetectDocumentTextCommand({
                Document: { Bytes: imageBytes },
            });

            const textractResponse = await textractClient.send(command);

            // Extract detected text
            const detectedText = textractResponse.Blocks
                .filter(block => block.BlockType === 'LINE')
                .map(block => block.Text)
                .join('\n');

            console.log("=========Inside AMAZON textract ==========");

            return NextResponse.json({ text: detectedText });
            // console.log("inside image processor");
            // const buffer = await file.arrayBuffer();
            // const imageBuffer = Buffer.from(buffer);

            // try {
            //     const result = await Tesseract.recognize(imageBuffer, 'eng', {
            //         logger: m => console.log(m),
            //     });

            //     return new Response(JSON.stringify({ text: result.data.text }), {
            //         headers: { 'Content-Type': 'application/json' },
            //     });
            // } catch (error) {
            //     return new Response(JSON.stringify({ error: error.message }), {
            //         headers: { 'Content-Type': 'application/json' },
            //         status: 500,
            //     });
            // }
        }

        return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    } catch (error) {
        console.error('Error processing file:', error);
        return NextResponse.json({ error: 'Error processing file' }, { status: 500 });
    }
}
