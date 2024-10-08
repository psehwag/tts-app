import { useState, useEffect } from 'react';
import styles from '../styles/translatorconfig.module.css'; // Using CSS Modules

const TranslatorConfig = () => {
    const [languages, setLanguages] = useState({});
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [selectedEngine, setSelectedEngine] = useState('');
    const [volume, setVolume] = useState('medium');
    const [rate, setRate] = useState('slow');
    const [pitch, setPitch] = useState('low');
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
        setSelectedEngine(validEngines[0]);
    };

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    return (
        <div className={styles.translatorConfigContainer}>
            {languages && Object.keys(languages).length > 0 && (
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
                </div>
            )}
        </div>
    );
};

export default TranslatorConfig;
