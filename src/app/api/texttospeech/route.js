import { PollyClient, SynthesizeSpeechCommand, DescribeVoicesCommand } from '@aws-sdk/client-polly';

// Create a Polly client
const polly = new PollyClient({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

export async function POST(req) {
    const { text, languageCode } = await req.json();

    const params = {
        Text: text,
        OutputFormat: 'MP3',
        VoiceId: languageCode, // e.g., 'Joanna' for English
    };

    const command = new SynthesizeSpeechCommand(params);

    try {
        const data = await polly.send(command);
        const audioStream = data.AudioStream;

        // Ensure the audio stream is valid
        if (!audioStream) {
            return new Response('Audio stream not found', { status: 404 });
        }

        return new Response(audioStream, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Disposition': 'attachment; filename="speech.mp3"',
            },
        });
    } catch (error) {
        console.error('Error synthesizing speech:', error);
        return new Response('Error synthesizing speech', { status: 500 });
    }
}

export async function GET() {

    // const input = { // DescribeVoicesInput || "neural" || "long-form" || "generative"
    //     Engine: "standard",
    //     // LanguageCode: "arb" || "cmn-CN" || "cy-GB" || "da-DK" || "de-DE" || "en-AU" || "en-GB" || "en-GB-WLS" || "en-IN" || "en-US" || "es-ES"
    //     //  || "es-MX" || "es-US" || "fr-CA" || "fr-FR" || "is-IS" || "it-IT" || "ja-JP" || "hi-IN" || "ko-KR" || "nb-NO" || "nl-NL" || "pl-PL"
    //     //  || "pt-BR" || "pt-PT" || "ro-RO" || "ru-RU" || "sv-SE" || "tr-TR" || "en-NZ" || "en-ZA" || "ca-ES" || "de-AT" || "yue-CN" || "ar-AE" 
    //     //  || "fi-FI" || "en-IE" || "nl-BE" || "fr-BE" || "cs-CZ" || "de-CH",
    //    IncludeAdditionalLanguageCodes: true,
    // };

    const params = {
        Engine: 'standard',  // You can specify 'neural' as well for Neural Text-to-Speech
    };

    try {
        const command = new DescribeVoicesCommand(params);
        const result = await polly.send(command);
        console.log(JSON.stringify(result, null, 2));
        const voices = result.Voices;

        // Group by Language
        const languages = voices.reduce((acc, voice) => {
            const langCode = voice.LanguageCode;
            const langName = voice.LanguageName;

            if (!acc[langCode]) {
                acc[langCode] = { name: langName, voices: [] };
            }

            acc[langCode].voices.push({
                voiceId: voice.Id,
                gender: voice.Gender,
                name: voice.Name,
            });

            return acc;
        }, {});

        const sortedLanguages = Object.entries(languages)
            .sort(([, langA], [, langB]) => langA.name.localeCompare(langB.name))
            .reduce((acc, [langCode, langData]) => {
                acc[langCode] = langData;
                return acc;
            }, {});

        return new Response(JSON.stringify({ languages: sortedLanguages }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error describing voices:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        });
    }
}
