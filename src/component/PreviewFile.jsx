'use client';

import mammoth from 'mammoth';
import { useState, useEffect } from 'react';

export default function PreviewFile({file}) {
    const [preview, setPreview] = useState(null);

    // Trigger handleFileChange once when the file is loaded
    useEffect(() => {
        if (file) {
            createPreview();
        }
    }, [file]); // This useEffect will run when the file is set

    // Clean up object URL when component is unmounted or file changes
    useEffect(() => {
        return () => {
            if (preview && file && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const createPreview = async () => {
        try {
            if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                // Convert DOCX to HTML
                const arrayBuffer = await file.arrayBuffer();
                const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
                setPreview(html);
            } else {
                // Generate object URL for other file types
                setPreview(URL.createObjectURL(file));
            }
        } catch (error) {
            console.error('Error generating preview:', error);
            setPreview(null); // Reset preview on error
        }
    };

    return (
        <div>
            {/* Preview Section */}
            {preview && (
                <div>
                    {/* Image Preview */}
                    {file && file.type.startsWith('image/') && (
                        <img
                            src={preview}
                            alt="Image Preview"
                            style={{ maxWidth: '650px', maxHeight: '500px' }}
                        />
                    )}

                    {/* PDF Preview */}
                    {file && file.type === 'application/pdf' && (
                        <iframe
                            src={preview}
                            type="application/pdf"
                            width="650px"
                            height="500px"
                        />
                    )}

                    {/* DOCX Preview */}
                    {file &&
                        file.type ===
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && (
                            <iframe
                                srcDoc={preview} // Use srcDoc to set the HTML content directly
                                width="650px"
                                height="500px"
                                style={{
                                    border: '1px solid #ddd',
                                    overflowY: 'auto',
                                }}
                            />
                        )}
                </div>
            )}
        </div>
    );
}
