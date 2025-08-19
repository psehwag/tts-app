'use client';
import React, { useState } from 'react';
import PdfUploader from '@/component/PdfUploader';
import PreviewFile from '@/component/PreviewFile';
import ExtractedText from '@/component/ExtractedText';
import TranslatorConfig from '@/component/TranslatorConfig';
import styles from './page.module.css'; // Import the CSS module

const page = () => {
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

    const handleTextUpdate = (newText) => {
        setText(newText);
      };

    return (
        <div className={styles.container}>
            {!file && (
                <div className={styles.header}>
                    <h2>
                        Transform Your Documents or Images <br />
                        into <span>Spoken Words</span>
                    </h2>
                    <div className={styles.dragDropArea}>
                        <h3>Drag and Drop</h3>
                        <span>your document here or browse</span>
                        <div>
                            <label className={styles.uploadButton}>
                                Upload from Device
                                <input type="file" accept=".pdf,.docx,.txt,image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                            </label>
                        </div>
                    </div>
                </div>
            )}
            {error && <p className={styles.errorMessage}>{error}</p>}
            {file && (
                <div className={styles.filePreviewContainer}>
                    <div className={styles.previewFile}>
                        <PreviewFile file={file} />
                    </div>
                    {!showTranslatorConfig && (
                        <div className={styles.actionContainer}>
                            {!text ? (
                                <>
                                    <p style={{ marginBottom: '20px' }}>
                                        Speak will read your document aloud, highlighting the text in sync with your chosen language and voice.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleSubmitAndExtract}
                                    >
                                        Submit & Extract
                                    </button>
                                </>
                            ) : (
                                <>
                                    <ExtractedText text={text} onTextUpdate={handleTextUpdate}/>
                                    <button
                                        type="button"
                                        className={styles.nextButton}
                                        onClick={() => setShowTranslatorConfig(true)}
                                    >
                                        Next
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                    {showTranslatorConfig && (
                        <div className={styles.previewFile}>
                            <TranslatorConfig text={text} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default page;
