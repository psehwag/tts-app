import { useState, useEffect } from 'react';
import styles from '../styles/translatorconfig.module.css'; // Using CSS Modules
import ExtractedText from './ExtractedText';

const TranslatorConfig = ({text: initialText }) => {
    const [text, setText] = useState(initialText);
    const [languages, setLanguages] = useState({});
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [selectedEngine, setSelectedEngine] = useState('');
    const [volume, setVolume] = useState('medium');
    const [rate, setRate] = useState('slow');
    const [pitch, setPitch] = useState('low');
    const [translatedText, setTranslatedText] = useState('');
    const [audioURL, setAudioURL] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const response = await fetch('/api/texttospeech', { cache: 'no-store' });
                const data = await response.json();
                updateInitialData(data.languages);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching voices:', error);
                setLoading(false);
            }
        };

        fetchLanguages();
    }, []);

    function updateInitialData(languagesColl) {
        setLanguages(languagesColl);
        const [firstLangCode, firstLangData] = Object.entries(languagesColl)[0];
        setSelectedLanguage(firstLangCode);
        const voicesColl = firstLangData.voices;
        setVoices(voicesColl);
        const firstVoice = voicesColl[0];
        setSelectedVoice(firstVoice);
        const { SupportedEngines } = firstVoice;
        const validEngines = SupportedEngines.filter(engine => engine !== 'generative');
        setSelectedEngine(validEngines[0]);
    }

    const handleLanguageChange = (e) => {
        const selectedLangCode = e.target.value;
        setSelectedLanguage(selectedLangCode);
        const voicesColl = languages[selectedLangCode].voices;
        setVoices(voicesColl);
        const firstVoice = voicesColl[0];
        setSelectedVoice(firstVoice);
        const { SupportedEngines } = firstVoice;
        const validEngines = SupportedEngines.filter(engine => engine !== 'generative');
        setSelectedEngine(validEngines[0]);
    };

    const handleVoiceChange = (e) => {
        const voiceId = e.target.value;
        const voice = voices.find(v => v.Id === voiceId);
        setSelectedVoice(voice);
        const { SupportedEngines } = voice;
        const validEngines = SupportedEngines.filter(engine => engine !== 'generative');
        const validEngine = validEngines[0];
        setSelectedEngine(validEngine);
        if(validEngine === 'neural'){
            setPitch('');
        }
    };

    const handleTranslate = async () => {
        setTranslatedText("आपका नाम क्या है?");
        // try {
        //     // Detect language first
        //     const sourceLanguage = await detectLanguage();
        //     console.log("Detected source language:", sourceLanguage);

        //     // Make translation request
        //     const response = await fetch('/api/translate', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify({
        //             text,
        //             sourceLanguage,
        //             targetLanguage: selectedLanguage,
        //         }),
        //     });

        //     if (!response.ok) {
        //         throw new Error('Error in translation');
        //     }

        //     const data = await response.json();
        //     console.log("Translated text:", data.translatedText);
        //     setTranslatedText(data.translatedText);
        // } catch (error) {
        //     console.error('Error translating text:', error);
        // }
    };

    const detectLanguage = async () => {
        const textToDetect = text.substring(0, 100); // Detect language from the first 100 characters
        try {
            const response = await fetch('/api/detectlanguage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: textToDetect }),
            });

            if (!response.ok) {
                throw new Error('Error detecting language');
            }

            const data = await response.json();
            return data.detectedLanguages[0]?.language || 'Unknown';
        } catch (error) {
            console.error('Error detecting language:', error);
            return 'Unknown'; // Return 'Unknown' if detection fails
        }
    };

    const handleTextToSpeech = async () => {
        const voiceId = selectedVoice.Id;
        const response = await fetch('/api/texttospeech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text:translatedText, rate, pitch, voiceId, engine:selectedEngine}),
        });

        if (response.ok) {
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudioURL(audioUrl);
            const audio = new Audio(audioUrl);
            audio.play();
        } else {
            console.error('Failed to synthesize speech');
        }
    }

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    return (
        <div className={styles.translatorConfigContainer}>
            {!translatedText && languages && Object.keys(languages).length > 0 && (
                <div className={styles.configSection}>
                    <label className={styles.configLabel}>
                        Select Language for Audio Output
                        <div>
                            <select
                                id="languageSelect"
                                value={selectedLanguage}
                                onChange={handleLanguageChange}
                                className={styles.configSelect}
                            >
                                {Object.entries(languages).map(([langCode, langData]) => (
                                    <option key={langCode} value={langCode}>
                                        {langData.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </label>
                    {voices.length > 0 && (
                        <div className={styles.configSection}>
                            <label className={styles.configLabel}>
                                Select Voice for Audio Output
                                <div>
                                    <select
                                        id="voiceSelect"
                                        value={selectedVoice?.Id || ''}
                                        onChange={handleVoiceChange}
                                        className={styles.configSelect}
                                    >
                                        {voices.map((voice) => (
                                            <option key={voice.Id} value={voice.Id}>
                                                {voice.Name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </label>
                            {selectedVoice && selectedVoice.SupportedEngines?.length > 0 && (
                                <div className={styles.configSection}>
                                    <label className={styles.configLabel}>
                                        Select Engine
                                        <div>
                                            <select
                                                id="engineSelect"
                                                value={selectedEngine}
                                                onChange={(e) => setSelectedEngine(e.target.value)}
                                                className={styles.configSelect}
                                            >
                                                {selectedVoice.SupportedEngines.filter(engine => engine !== 'generative').map(engine => (
                                                    <option key={engine} value={engine}>
                                                        {engine}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </label>
                                    <label className={styles.configLabel}>
                                        Set Volume
                                        <div>
                                            <select
                                                id="volumeSelect"
                                                value={volume}
                                                onChange={(e) => setVolume(e.target.value)}
                                                className={styles.configSelect}
                                            >
                                                <option value="x-soft">X-Soft</option>
                                                <option value="soft">Soft</option>
                                                <option value="medium">Medium</option>
                                                <option value="loud">Loud</option>
                                                <option value="x-loud">X-Loud</option>
                                            </select>
                                        </div>
                                    </label>
                                    <label className={styles.configLabel}>
                                        Rate Control
                                        <div>
                                            <select
                                                id="rateSelect"
                                                value={rate}
                                                onChange={(e) => setRate(e.target.value)}
                                                className={styles.configSelect}
                                            >
                                                <option value="x-slow">X-Slow</option>
                                                <option value="slow">Slow</option>
                                                <option value="medium">Medium</option>
                                                <option value="fast">Fast</option>
                                                <option value="x-fast">X-Fast</option>
                                            </select>
                                        </div>
                                    </label>
                                    {selectedEngine && selectedEngine !== 'neural' && selectedEngine !== 'long-form' && (

                                        <label className={styles.configLabel}>
                                            Pitch Control
                                            <div>
                                                <select
                                                    id="pitchSelect"
                                                    value={pitch}
                                                    onChange={(e) => setPitch(e.target.value)}
                                                    className={styles.configSelect}
                                                >
                                                    <option value="x-low">X-Low</option>
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                    <option value="x-high">X-High</option>
                                                </select>
                                            </div>
                                        </label>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    <button type="button" onClick={handleTranslate}>Translate</button>
                </div>
            )}
            {translatedText && (<>
                <ExtractedText text={translatedText}/>
                <button type="button" onClick={handleTextToSpeech}>Speak</button>
                {audioURL && (
        <div>
          <h1>Listen to audio:</h1>
          <audio controls>
            <source src={audioURL} type="audio/mp3" />
          </audio>
          <br />
          <a href={audioURL} download>
            Download Audio
          </a>
        </div>
      )}
                </>
            )}
        </div>
    );
};

export default TranslatorConfig;
