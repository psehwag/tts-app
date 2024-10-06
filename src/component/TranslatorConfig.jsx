import React, { useState, useEffect } from 'react';

const TranslatorConfig = ({ text }) => {
    const [languages, setLanguages] = useState({});
    const [voice, setVoice] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const response = await fetch('/api/texttospeech', { cache: 'no-store' });
                const data = await response.json();
                setLanguages(data.languages);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching voices:', error);
                setLoading(false);
            }
        };

        fetchLanguages();
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <div>
                <label>
                    Select Language for Audio Output
                    <div>
                        <select
                            id="targetSelect"
                            onChange={(e) => {
                                setSelectedLanguage(e.target.value);
                                setVoice(null); // Reset voice when language changes
                            }}>
                            <option value="">Select a language</option>
                            {Object.entries(languages).map(([langCode, langData]) => (
                                <option key={langCode} value={langCode}>
                                    {langData.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </label>
                {selectedLanguage && languages[selectedLanguage]?.voices && (
                    <label>
                        Select Voice for Audio Output
                        <div>
                            <select
                                id="voiceSelect"
                                onChange={(e) => setVoice(e.target.value)}>
                                <option value="">Select a voice</option>
                                {languages[selectedLanguage].voices.map((voiceData) => (
                                    <option key={voiceData.voiceId} value={voiceData.voiceId}>
                                        {voiceData.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </label>
                )}
            </div>
        </div>
    );
};

export default TranslatorConfig;
