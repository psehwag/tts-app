import Link from 'next/link';
import styles from '../../styles/banner.module.css'; // Importing CSS module for styling

export default function Banner() {
  return (
    <div className="container">
        <div className={styles.flex_elem}>
            <div className={styles.header_banner}>
                    <div>Transform</div>
                    <div className={styles.banner_content_normal}>Your Documents or Images </div>
                    <div>into <span className={styles.highlight_text}>Spoken</span> Words</div>
                    <span>Generate text and audio from your images,<br/>
                    and let them speak for you.</span>
            </div>
            <div className={styles.hero_banner}>
                <img src="/images/speak-hero.png" alt="speak-hero"  />
            </div>
        </div>
    </div>
  );
}
