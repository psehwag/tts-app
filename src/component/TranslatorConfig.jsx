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

    const [translating, setTranslating] = useState(false);

    const volumeOptions = ["x-soft", "soft", "medium", "loud", "x-loud"];
    const volumeLabels = {
    "x-soft": "X-Soft",
    "soft": "Soft",
    "medium": "Medium",
    "loud": "Loud",
    "x-loud": "X-Loud",
    };

    const rateOptions = ["x-slow", "slow", "medium", "fast", "x-fast"];
    const rateLabels = {
    "x-slow": "X-Slow",
    "slow": "Slow",
    "medium": "Medium",
    "fast": "Fast",
    "x-fast": "X-Fast",
    };

    const pitchOptions = ["x-low", "low", "medium", "high", "x-high"];

    const pitchLabels = {
    "x-low": "X-Low",
    "low": "Low",
    "medium": "Medium",
    "high": "High",
    "x-high": "X-High",
    };

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
        const validEngine = validEngines[0];
        setSelectedEngine(validEngine);
        if(validEngine === 'neural'){
            setPitch('');
        }
    }

    const handleTextUpdate = (newText) => {
        setTranslatedText(newText);
      };

    const handleLanguageChange = (e) => {
        const selectedLangCode = e.target.value;
        setSelectedLanguage(selectedLangCode);
        const voicesColl = languages[selectedLangCode].voices;
        setVoices(voicesColl);
        const firstVoice = voicesColl[0];
        setSelectedVoice(firstVoice);
        const { SupportedEngines } = firstVoice;
        const validEngines = SupportedEngines.filter(engine => engine !== 'generative');
        const validEngine = validEngines[0];
        setSelectedEngine(validEngine);
        if(validEngine === 'neural'){
            setPitch('');
        }
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
    try {
        setTranslating(true);
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                targetLanguage: selectedLanguage
            })
        });

        const data = await response.json();
        if (response.ok) {
            setTranslatedText(data.translatedText); // Show translated text
        } else {
            console.error('Error:', data.error);
        }
    } catch (error) {
        console.error('Error calling the translation API:', error);
    } finally {
        setTranslating(false); 
      }
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
            body: JSON.stringify({ text:translatedText, volume, rate, pitch, voiceId, selectedLanguage, engine:selectedEngine}),
        });

        if (response.ok) {
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudioURL(audioUrl);
        } else {
            console.error('Failed to synthesize speech');
        }
    }

    if (loading) {
        return <div className={styles.loaderWrapper}>
            <div className={styles.loader}></div>
      </div>;
    }

    return (
        <div className={styles.translatorConfigContainer}>
            {!translating && !translatedText && languages && Object.keys(languages).length > 0 && (
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
                     <label className={styles.configLabel}>
                        Select Voice for Audio Output

                        <div className={styles.voiceGrid}>
                        {voices.map((voice) => (
                            <label
                                key={voice.Id}
                                className={`${styles.voiceCard} ${
                                selectedVoice?.Id === voice.Id ? styles.active : ""
                                }`}
                            >
                                {/* Hidden radio */}
                                <input
                                type="radio"
                                name="voice"
                                value={voice.Id}
                                checked={selectedVoice?.Id === voice.Id}
                                onChange={() => handleVoiceChange({ target: { value: voice.Id } })}
                                className={styles.hiddenRadio}
                                />

                                {/* Image */}
                                <img src = {
                                    voice.Gender === "Female"
                                      ? "/images/female.png"
                                      : "/images/man.png"
                                  }
                                 
                                alt={voice.Name}
                                className={styles.voiceImage}
                                />

                                {/* Label */}
                                <span className={styles.voiceName}>{voice.Name}</span>
                            </label>
                            ))}
                        </div>
                    </label>

                    {voices.length > 0 && (
                        <div className={styles.configSection}>
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
                                        Volume: <span className={styles.highlightBlue}><strong>{volumeLabels[volume]}</strong></span>

                                        <input
                                            type="range"
                                            min="0"
                                            max={volumeOptions.length - 1}
                                            step="1"
                                            value={volumeOptions.indexOf(volume)}
                                            onChange={(e) =>
                                            setVolume(volumeOptions[Number(e.target.value)])
                                            }
                                            className={styles.volumeSlider}
                                        />

                                        <div className={styles.sliderLabels}>
                                            {volumeOptions.map((opt) => (
                                            <span key={opt}>{volumeLabels[opt]}</span>
                                            ))}
                                        </div>
                                    </label>
                                    <label className={styles.configLabel}>
                                    Rate Control: <span className={styles.highlightBlue}><strong>{rateLabels[rate]}</strong></span>

                                    <input
                                        type="range"
                                        min="0"
                                        max={rateOptions.length - 1}
                                        step="1"
                                        value={rateOptions.indexOf(rate)}
                                        onChange={(e) =>
                                        setRate(rateOptions[Number(e.target.value)])
                                        }
                                        className={styles.rateSlider}
                                    />

                                    <div className={styles.sliderLabels}>
                                        {rateOptions.map((opt) => (
                                        <span key={opt}>{rateLabels[opt]}</span>
                                        ))}
                                    </div>
                                    </label>

                                    {selectedEngine && selectedEngine !== 'neural' && selectedEngine !== 'long-form' && (

                                    <label className={styles.configLabel}>
                                        Pitch Control: <span className={styles.highlightBlue}><strong>{pitchLabels[pitch]}</strong></span>

                                        <input
                                        type="range"
                                        min="0"
                                        max={pitchOptions.length - 1}
                                        step="1"
                                        value={pitchOptions.indexOf(pitch)}
                                        onChange={(e) =>
                                            setPitch(pitchOptions[Number(e.target.value)])
                                        }
                                        className={styles.pitchSlider}
                                        />

                                        <div className={styles.sliderLabels}>
                                        {pitchOptions.map((opt) => (
                                            <span key={opt}>{pitchLabels[opt]}</span>
                                        ))}
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
           {translating ? (
                /* 🔄 LOADER */
                <div className={styles.loaderWrapper}>
                    <div className={styles.loader}></div>
                </div>

                ) : translatedText ? (
                /* ✅ TRANSLATED OUTPUT */
                <>
                    <ExtractedText
                    text={translatedText}
                    onTextUpdate={handleTextUpdate}
                    />

                {!audioURL && (
                    <button type="button" onClick={handleTextToSpeech}>
                        Speak
                    </button>
                )}

                {audioURL && (
                    <div className={styles.autoArea}>
                        <audio controls autoPlay>
                            <source src={audioURL} type="audio/mp3" />
                        </audio>
                    </div>
                    )}
                </>

                ) : null}

        </div>
    );
};

export default TranslatorConfig;
