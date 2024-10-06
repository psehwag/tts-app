// components/PdfUploader.jsx
'use client';

import { useState } from 'react';
import TextToSpeech from './TextToSpeech';

const PdfUploader = () => {
    const [text, setText] = useState('');
    const [error, setError] = useState('');

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch("/api/extracttext", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Error uploading PDF');
                }

                const data = await response.json();
                setText(data.text); // Set the extracted text
                setError(''); // Clear any previous errors
            } catch (err) {
                setError('Error extracting text from PDF');
                console.error(err);
            }
        }
    };

    return (
        <div>
            <input
                type="file"
                accept=".pdf,.docx,.txt,image/*"
                onChange={handleFileChange}
                required
            />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {text && (
                <div>
                    <h3>Extracted Text:</h3>
                    <pre>{text}</pre>
                    <TextToSpeech pdftext={text}/>
                </div>
                
            )}
        </div>
    );
};

export default PdfUploader;
