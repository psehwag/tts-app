
import HeaderBanner from "../component/HeaderBanner";
import Link from "next/link";
import styles from '../styles/texttospeech.module.css';

export default function Home() {
  return (
    <div className="hero-area">
      <HeaderBanner />
      <div className="container">
        <div className={styles.text_to_speech_wrapper}>
          <Link href="/speak">Try Me</Link>
        </div>
      </div>
    </div>
  );
}
