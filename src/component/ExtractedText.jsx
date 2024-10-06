import { useState } from "react";
import styles from '../styles/texttospeech.module.css'; // Importing CSS module for styling

const ExtractedText = ({ text: initialText }) => {
    const [text, setText] = useState(initialText);

    return (
        <div className={styles.text_to_speech_wrapper}>
            ExtractedText
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text here..."
                rows={6}
                cols={50}
            />
        </div>
    )
}

export default ExtractedText;