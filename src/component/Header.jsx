import Link from "next/link";
import styles from '../styles/header.module.css';

export default function Header() {

    return (
        <div className="nav_bar">
            <div className="container">
                <div className={styles.header}>
                    {/* Logo */}
                    <img src="/images/logo.png" alt="Logo" className={styles.logo} />

                    {/* Navigation Menu */}
                    <nav>
                        <ul className={styles.nav}>
                            <li>
                                <Link href="/">Home</Link>
                            </li>
                        </ul>
                    </nav>
                    <div></div>
                </div>
            </div>
        </div>
    )

}