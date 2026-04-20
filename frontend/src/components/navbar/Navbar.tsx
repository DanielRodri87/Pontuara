import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo}>
          <Image 
            src="/images/Logo.svg" 
            alt="Pontuara Logo"
            width={40}
            height={40}
          />
        </div>

        {/* Navigation Links */}
        <ul className={styles.navLinks}>
          <li><Link href="#login">Login</Link></li>
          <li><Link href="#about">Sobre Nós</Link></li>
          <li><Link href="#faq">Perguntas Frequentes</Link></li>
        </ul>

        {/* Cadastre-se Button */}
        <button className={styles.cadastreBtn}>
          Cadastre-se
        </button>
      </div>
    </nav>
  );
}
