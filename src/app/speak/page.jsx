'use client'
import React, { useState } from 'react';
import PdfUploader from '@/component/PdfUploader';
import PreviewFile from '@/component/PreviewFile';
import ExtractedText from '@/component/ExtractedText';
import TranslatorConfig from '@/component/TranslatorConfig';

const FileManager = () => {
    const [file, setFile] = useState(null);
    const [text, setText] = useState('');
    const [error, setError] = useState('');
    const [showTranslatorConfig, setShowTranslatorConfig] = useState(false);

    const handleFileChange = async (e) => {
        const uploadedFile = e.target.files[0];
        if (uploadedFile) {
            setFile(uploadedFile);
        }
    }

    const handleSubmitAndExtract = async () => {
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

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            {!file && (
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '20px' }}>
                        Transform Your Documents or Images <br />
                        into <span style={{ color: '#0070f3' }}>Spoken Words</span>
                    </h2>
                    <div>
                        {/* <Image src="/images/docx.png" alt="Docs" width={64} height={64} />
                        <Image src="/images/pdf.png" alt="PDF" width={64} height={64} />
                        <Image src="/images/jpg.png" alt="JPG" width={64} height={64} />
                        <Image src="/images/png.png" alt="PNG" width={64} height={64} /> */}
                    </div>
                    <h6 style={{ marginBottom: '10px' }}>Drag and Drop your document here</h6>
                    <h6 style={{ marginBottom: '10px' }}>Or</h6>
                    <label style={{ display: 'inline-block', cursor: 'pointer', padding: '10px', backgroundColor: '#0070f3', color: '#fff', borderRadius: '5px' }}>
                        Upload from Device
                        <input type="file" accept=".pdf,.docx,.txt,image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                    </label>
                    <div />
                </div>
            )}
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            {file && (
                <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                    <div style={{ flex: 1 }}>
                        <PreviewFile file={file} />
                    </div>
                    {!showTranslatorConfig && (
                        <div style={{ flex: 1 }}>
                            {!text ? (
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ marginBottom: '20px' }}>
                                        Speak will read your document aloud, highlighting the text in sync with your chosen language and voice.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleSubmitAndExtract}
                                        style={{
                                            padding: '10px 20px',
                                            backgroundColor: '#0070f3',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Submit & Extract
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <ExtractedText text={text} />
                                    <button
                                        type="button"
                                        onClick={() => setShowTranslatorConfig(true)}
                                        style={{
                                            marginTop: '20px',
                                            padding: '10px 20px',
                                            backgroundColor: '#0070f3',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    {showTranslatorConfig && (
                        <div style={{ flex: 1 }}>
                            <TranslatorConfig text={text} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default FileManager;
