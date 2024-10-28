import { PollyClient, SynthesizeSpeechCommand, DescribeVoicesCommand } from '@aws-sdk/client-polly';
import { NextResponse } from 'next/server'; // Import NextResponse
import { languageMap } from '@/utils/languageUtil';

// Create a Polly client
const polly = new PollyClient({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

export async function POST(req) {
    const { text, volume, rate, pitch, voiceId, engine } = await req.json();
    const formattedText = formatTextForPollyTTS(text);

    // Chunk the formatted text into smaller SSML segments
    const ssmlChunks = chunkSSML(formattedText, volume, rate, pitch);

    const audioBuffers = [];

    for (const ssml of ssmlChunks) {
        console.log("SSML ::: " + ssml);
        const params = {
            Text: ssml,
            OutputFormat: 'mp3',
            VoiceId: voiceId,
            TextType: 'ssml',
            Engine: engine,
        };

        const command = new SynthesizeSpeechCommand(params);

        try {
            const { AudioStream } = await polly.send(command);

            // Ensure the audio stream is valid
            if (!AudioStream) {
                return NextResponse.json('Audio stream not found', { status: 404 });
            }

            // Convert stream to buffer
            const audioBuffer = await streamToBuffer(AudioStream);
            audioBuffers.push(audioBuffer);
        } catch (error) {
            console.error('Error synthesizing speech:', error);
            return NextResponse.json('Error synthesizing speech', { status: 500 });
        }
    }

    // Concatenate all audio buffers into a single response
    const combinedAudioBuffer = Buffer.concat(audioBuffers);

    return new Response(combinedAudioBuffer, {
        headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Disposition': 'attachment; filename="speech.mp3"',
        },
    });
}

// Helper function to format text for Polly TTS
function formatTextForPollyTTS(text) {
    // Replace special characters with HTML-safe entities
    const escapeChars = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;',
    };

    const escapedText = text.replace(/[&<>"']/g, char => escapeChars[char]);

    // Split the text into lines or paragraphs
    const sections = escapedText.split(/\n\s*\n/);
    let formatText = ``;

    sections.forEach((section, index) => {
        const trimmedSection = section.trim();
        if (trimmedSection) {
            // Add a pause between sections
            if (index > 0) {
                formatText += `<break time="1s"/>`;
            }

            // Split the section into sentences
            const sentences = trimmedSection.split(/(?<=[।.])\s+/); 
            sentences.forEach(sentence => {
                formatText += sentence.trim() + `<break time="500ms"/>`;
            });
        }
    });
    return formatText;
}

// Helper function to chunk SSML input into manageable sizes for Polly
function chunkSSML(ssml, volume, rate, pitch, maxLength = 3000) {
    const chunks = [];
    let prosodyStart = `<speak><prosody volume="${volume}" rate="${rate}"${pitch ? ` pitch="${pitch}"` : ''}>`;
    let currentChunk = prosodyStart;
    const parts = ssml.split(/(<break[^>]*\/?>)/); 

    for (const part of parts) {
        const partLength = currentChunk.length + part.length;

        // If adding this part exceeds the maxLength, push the current chunk and reset
        if (partLength > maxLength) {
            currentChunk += '</prosody></speak>';
            chunks.push(currentChunk); 
            currentChunk = prosodyStart;
        }

        currentChunk += part;
    }

    // Push the last chunk if it has content
    if (currentChunk !== prosodyStart) {
        currentChunk += '</prosody></speak>';
        chunks.push(currentChunk);
    }

    return chunks;
}

// Helper function to convert stream to buffer
function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
}

export async function GET() {
    // const params = {
    //     Engine: 'standard' || 'neural' || 'long-form' || 'generative',
    //     IncludeAdditionalLanguageCodes: true,
    // };

    try {
        const command = new DescribeVoicesCommand();
        const { Voices } = await polly.send(command);
        //Sample structure of Voices
        // [{
        //     Gender: 'Female',
        //     Id: 'Raveena',
        //     LanguageCode: 'en-IN',
        //     LanguageName: 'Indian English',
        //     Name: 'Raveena',
        //     SupportedEngines: [ 'standard' ]
        //   },
        //   {
        //     AdditionalLanguageCodes: [ 'hi-IN' ],
        //     Gender: 'Female',
        //     Id: 'Aditi',
        //     LanguageCode: 'en-IN',
        //     LanguageName: 'Indian English',
        //     Name: 'Aditi',
        //     SupportedEngines: [ 'standard' ]
        //   },
        //   {
        //     Gender: 'Female',
        //     Id: 'Emma',
        //     LanguageCode: 'en-GB',
        //     LanguageName: 'British English',
        //     Name: 'Emma',
        //     SupportedEngines: [ 'neural', 'standard' ]
        //   }]
        // Create a structured map to hold languages and their associated voices
        const allLanguages = new Map(
            Array.from(languageMap, ([langCode, name]) => [langCode, { name, voices: [] }]));

        Voices.forEach((voice) => {
            const { Gender, Id, Name, SupportedEngines } = voice; // Destructure the required properties

            const primaryLangEntry = allLanguages.get(voice.LanguageCode);
            if (primaryLangEntry) {
                primaryLangEntry.voices.push({ Gender, Id, Name, SupportedEngines }); // Push only the required properties
            }

            // Add voices to their additional languages
            voice.AdditionalLanguageCodes?.forEach((addLangCode) => {
                const additionalLangEntry = allLanguages.get(addLangCode);
                if (additionalLangEntry) {
                    additionalLangEntry.voices.push({ Gender, Id, Name, SupportedEngines }); // Push only the required properties
                }
            });
        });

        // Sort languages by their names
        const sortedLanguages = Object.fromEntries(
            Array.from(allLanguages.entries())
                .sort(([, langA], [, langB]) => langA.name.localeCompare(langB.name))
        );

        return NextResponse.json({ languages: sortedLanguages }, { status: 200 });
    } catch (error) {
        console.error('Error describing voices:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
