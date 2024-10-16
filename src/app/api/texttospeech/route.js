import { PollyClient, SynthesizeSpeechCommand, DescribeVoicesCommand } from '@aws-sdk/client-polly';
import { NextResponse } from 'next/server'; // Import NextResponse
import languageMap from '@/utils/languageUtil';

// Create a Polly client
const polly = new PollyClient({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

export async function POST(req) {
    const { text, rate, pitch, voiceId, engine } = await req.json();
    console.log(text + rate + pitch + voiceId + engine);

    let ssml = '';
    if(pitch){
    ssml = `
    <speak>
        <prosody rate="${rate}" pitch="${pitch}">
            ${text}
        </prosody>
    </speak>`;
    } else {
        ssml = `
    <speak>
        <prosody rate="${rate}">
            ${text}
        </prosody>
    </speak>`;
    }

    const params = {
        Text: ssml,
        OutputFormat: 'mp3',
        VoiceId: voiceId,
        TextType: 'ssml',
        Engine: engine,
    };
    // const params = {
    //     Text: text,
    //     OutputFormat: 'MP3',
    //     VoiceId: languageCode, // e.g., 'Joanna' for English
    // };

    const command = new SynthesizeSpeechCommand(params);

    try {
        const { AudioStream } = await polly.send(command);

        // Ensure the audio stream is valid
        if (!AudioStream) {
            return NextResponse.json('Audio stream not found', { status: 404 });
        }

        // Create a response with the audio stream as binary data
        const audioBuffer = await streamToBuffer(AudioStream); // Convert stream to buffer
        return new Response(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Disposition': 'attachment; filename="speech.mp3"',
            },
        });
    } catch (error) {
        console.error('Error synthesizing speech:', error);
        return NextResponse.json('Error synthesizing speech', { status: 500 });
    }
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
    const params = {
        Engine: 'standard' || 'neural' || 'long-form' || 'generative',
        IncludeAdditionalLanguageCodes: true,
    };

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
