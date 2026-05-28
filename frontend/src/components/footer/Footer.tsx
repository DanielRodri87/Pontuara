import React from 'react';
import Image from 'next/image';
import styles from './Footer.module.css';

/**
 * Application footer component.
 * Shows copyright, logo, and contact.
 *
 * @returns {JSX.Element} Rendered footer.
 */
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Copyright */}
        <div className={`${styles.copy} reveal delay-18`}>
          © 2024 PONTUARÁ. ALL RIGHTS RESERVED
        </div>

        {/* Center logo */}
        <div className={`${styles.logoWrapper} reveal delay-19`}>
          <Image
            src="/images/Logo.svg"
            alt="Pontuara Logo"
            width={32}
            height={32}
          />
        </div>

        {/* Contact email */}
        <div className={`${styles.contact} reveal delay-20`}>
          CONTATO@PONTUARA.COM
        </div>
      </div>
    </footer>
  );
}
