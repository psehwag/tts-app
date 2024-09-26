"use client"
import { useState } from "react";
import Header from "./_component/Header";
import TextToSpeech from "./_component/TextToSpeech";
import Banner from "./_component/HeaderBanner";

export default function Home() {
    const[showTTS, setShowTTS] = useState(false);
  return (
    <div>
      <Header/>
      <div className="hero-area">
        <Banner/>
        <div className="container">
          <div className="demo_button">
            <button onClick={(e) => setShowTTS(true)}>Try Me</button>
          </div>
          {showTTS && <TextToSpeech/>}
        </div>
      </div>
    </div>
  );
}
