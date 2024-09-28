"use client"
import { useState } from "react";
import TextToSpeech from "../component/TextToSpeech";
import HeaderBanner from "../component/HeaderBanner";

export default function Home() {
  const [showTTS, setShowTTS] = useState(false);
  return (
    <div className="hero-area">
      <HeaderBanner />
      <div className="container">
        <div className="demo_button">
          <button onClick={(e) => setShowTTS(true)}>Try Me</button>
        </div>
        {showTTS && <TextToSpeech />}
      </div>
    </div>
  );
}
