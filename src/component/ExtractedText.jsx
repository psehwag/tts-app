import { useState } from "react";
import styles from '../styles/texttospeech.module.css'; // Importing CSS module for styling

const ExtractedText = ({ text, onTextUpdate }) => {
    const [localText, setLocalText] = useState(text);

    const handleChange = (e) => {
        const newValue = e.target.value;
        setLocalText(newValue);   
        if(onTextUpdate) {
            onTextUpdate(newValue);
        }
      };

    return (
        <div className={styles.text_to_speech_wrapper}>
            <textarea
                value={localText}
                onChange={handleChange}
                placeholder="Enter your text here..."
                rows={6}
                cols={50}
            />
        </div>
    )
}

export default ExtractedText;