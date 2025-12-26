import styles from '../styles/banner.module.css'; // Importing CSS module for styling
import Link from "next/link";
import txtospeech from '../styles/texttospeech.module.css';


export default function HeaderBanner() {
  return (
      <div className={styles.flex_elem}>
        <div className={styles.header_banner}>
          <div>Transform</div>
          <div className={styles.banner_content_normal}>Your Documents or Images </div>
          <div>into <span className={styles.highlight_text}>Spoken</span> Words</div>
          <span>Generate text and audio from your images,<br />
            and let them speak for you.</span>
            <div className={txtospeech.text_to_speech_wrapper}>
              <Link href="/speak" className="inline-display">Try Me</Link>
            </div>
        </div>
        <div className={styles.hero_banner}>
          <img src="/images/speak-hero.png" alt="speak-hero" />
        </div>
      </div>
      
  );
}
