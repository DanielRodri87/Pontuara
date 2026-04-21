'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    let requestRunning = false;

    const handleScroll = () => {
      if (requestRunning) return;
      requestRunning = true;

      requestAnimationFrame(() => {
        const el = document.documentElement;
        const scrollTop = el.scrollTop || document.body.scrollTop;
        const scrollHeight = el.scrollHeight - el.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        
        setScrollProgress(progress);
        requestRunning = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const navHeight = 73; // altura aproximada da navbar fixa
      const top = el.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      {/* Barra de progresso de scroll */}
      <div
        className={styles.progressBar}
        style={{ width: `${scrollProgress}%` }}
      />

      <div className={styles.container}>
        {/* Logo */}
        <div className="reveal delay-1">
          <div className={styles.logo}>
            <Image
              src="/images/Logo.svg"
              alt="Pontuara Logo"
              width={40}
              height={40}
            />
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`${styles.menuButton} ${isMenuOpen ? styles.open : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className={styles.hamburger}></span>
        </button>

        {/* Navigation Links */}
        <ul className={`${styles.navLinks} ${isMenuOpen ? styles.active : ''}`}>
          <li className="reveal delay-2"><button onClick={() => scrollTo('login')}>Login</button></li>
          <li className="reveal delay-3"><button onClick={() => scrollTo('about')}>Sobre Nós</button></li>
          <li className="reveal delay-4"><button onClick={() => scrollTo('faq')}>Perguntas Frequentes</button></li>
          <li className={styles.mobileOnly}>
            <button className={styles.cadastreBtnMobile}>Cadastre-se</button>
          </li>
        </ul>

        {/* Cadastre-se Button (Desktop) */}
        <div className="reveal delay-5">
          <button className={styles.cadastreBtn}>
            Cadastre-se
          </button>
        </div>
      </div>
    </nav>
  );
}
