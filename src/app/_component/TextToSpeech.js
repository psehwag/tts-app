"use client";
import { useState, useEffect } from "react";
import styles from '../../styles/texttospeach.module.css'; // Importing CSS module for styling


export default function TextToSpeech() {
  const [text, setText] = useState("");
  const [speed, setSpeed] = useState(150);
  const [pitch, setPitch] = useState(40);
  const [variant, setVariant] = useState("+f4");
  const [audioURL, setAudioURL] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isButtonEnabled, setIsButtonEnabled] = useState(true);

  const minSpeed = 80; // Define min speed
  const maxSpeed = 260; // Define max speed
  const minPitch = 0; // Define min pitch
  const maxPitch = 99; // Define max pitch

  // Function to delete the previous audio file
  const deletePreviousAudio = async () => {
    if (audioURL) {
      try {
        await fetch("/api/deleteaudio", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filePath: audioURL }),
        });
        setAudioURL(null);
      } catch (err) {
        console.error("Failed to delete the previous audio file:", err);
      }
    }
  };

  const handleTextToSpeech = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Text is required.");
      return;
    }
    setLoading(true);
    setError(null);
    // Delete the old audio file before converting new text
    await deletePreviousAudio();
    //setAudioURL(null); // Clear previous audio URL to ensure new one is shown
    const sanitizedText = text.replace(/(\r\n|\n|\r)/gm, ", ");
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text:sanitizedText, speed, pitch, variant }),
      });

      if (response.ok) {
        const { filePath } = await response.json();
        setAudioURL(filePath);
      } else {
        setError("Failed to convert text to speech.");
      }
    } catch (err) {
      setError("An error occurred while processing the request.");
      console.error("Error in fetch:", err);
    } finally {
      setLoading(false);
      setIsButtonEnabled(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0]; // Get the first file

    if (file) {
      const reader = new FileReader();
      
      // Define the callback to run after the file is read
      reader.onload = function(e) {
        setText(e.target.result); // Set file content to state
      };

      // Read the file as text
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    setIsButtonEnabled(true);
  }, [text, speed, pitch, variant]);

  return (
    <div className={styles.text_to_speach_wrapper}>
      <h1>Upload and Read a Text File</h1>
      {/* File input to upload file */}
      <input type="file" accept=".txt" onChange={handleFileUpload} />
      <h1>Text-to-Speech Converter</h1>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your text here..."
          rows={6}
          cols={50}
          required
        />
        <div className={styles.flex_elem}>
          <div className={styles.speach_attributes}>
            <label>Speed (80 - 260): {speed}</label>
            <input 
              type="range" 
              min={minSpeed} 
              max={maxSpeed} 
              value={speed} 
              style={{ background: `linear-gradient(to right, #01A1ED ${(speed - minSpeed) / (maxSpeed - minSpeed) * 100}%, #ddd ${(speed - minSpeed) / (maxSpeed - minSpeed) * 100}%)`, }}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </div>
          <div className={styles.speach_attributes}>
            <label>Pitch (0 - 99): {pitch} </label>
            <input 
              type="range" 
              min={minPitch} 
              max={maxPitch} 
              value={pitch} 
              style={{ background: `linear-gradient(to right, #01A1ED ${(pitch - minPitch) / (maxPitch - minPitch) * 100}%, #ddd ${(pitch - minPitch) / (maxPitch - minPitch) * 100}%)`, }}
              onChange={(e) => setPitch(Number(e.target.value))}
            />
          </div>
          <div className={styles.speach_attributes}>
          <label htmlFor="dropdown">Choose Variant:</label>
          <select id="dropdown" value={variant} onChange={(e) => setVariant(e.target.value)}>
            <option value="+m1">Male 1</option>
            <option value="+m2">Male 2</option>
            <option value="+m3">Male 3</option>
            <option value="+m4">Male 4</option>
            <option value="+m5">Male 5</option>
            <option value="+m6">Male 6</option>
            <option value="+m7">Male 7</option>
            <option value="+f1">Female 1</option>
            <option value="+f2">Female 2</option>
            <option value="+f3">Female 3</option>
            <option value="+f4">Female 4</option>
            <option value="+croak">Croak</option>
            <option value="+whisper">Whisper</option>
          </select>
          </div>
        </div>
        
        <div className="demo_button">
          <button onClick={handleTextToSpeech} type="submit" disabled={loading || !isButtonEnabled}>
            {loading ? "Processing..." : "Convert to Speech"}
          </button>
        </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {audioURL && (
        <div>
          <h1>Listen to audio:</h1>
          <audio controls>
            <source src={audioURL} type="audio/wav" />
          </audio>
          <br/>
          <a href={audioURL} download>
            Download Audio
          </a>
        </div>
      )}
    </div>
  );
}
