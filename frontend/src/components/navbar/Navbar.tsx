'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

/**
 * Barra de navegação principal (Navbar).
 * Inclui responsividade, barra de progresso de scroll da página e links âncora.
 * 
 * @returns {JSX.Element} Componente de barra de navegação.
 */
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Alterna a visibilidade do menu de navegação em dispositivos móveis.
   */
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

  /**
   * Manipula o clique nos links da navbar. Realiza o scroll suave caso esteja na home,
   * ou redireciona o usuário para a âncora na home se estiver em outra página.
   * 
   * @param {string} id - O ID do elemento âncora na home page.
   */
  const handleNavClick = (id: string) => {
    if (pathname === '/') {
      const el = document.getElementById(id);
      if (el) {
        const navHeight = 73;
        const top = el.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    } else {
      router.push(`/#${id}`);
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
          <li className="reveal delay-2"><button onClick={() => handleNavClick('login')}>Login</button></li>
          <li className="reveal delay-3"><button onClick={() => handleNavClick('about')}>Sobre Nós</button></li>
          <li className="reveal delay-4"><button onClick={() => handleNavClick('faq')}>Perguntas Frequentes</button></li>
          <li className={styles.mobileOnly}>
            <Link href="/cadastro" className={styles.cadastreBtnMobile} onClick={() => setIsMenuOpen(false)}>
              Cadastre-se
            </Link>
          </li>
        </ul>

        {/* Cadastre-se Button (Desktop) */}
        <div className="reveal delay-5">
          <Link href="/cadastro" className={styles.cadastreBtn}>
            Cadastre-se
          </Link>
        </div>
      </div>
    </nav>
  );
}
