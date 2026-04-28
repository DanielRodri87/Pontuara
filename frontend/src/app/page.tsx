'use client';

import React, { useEffect } from 'react';
import Navbar from '@/components/navbar/Navbar';
import HeroSection from '@/components/hero/HeroSection';
import LoginCard from '@/components/auth/LoginCard';
import ParticleBackground from '@/components/particles/ParticleBackground';
import AboutSection from '@/components/about/AboutSection';
import FaqSection from '@/components/faq/FaqSection';
import Footer from '@/components/footer/Footer';
import styles from './page.module.css';

export default function LoginPage() {
  useEffect(() => {
    // Handle scroll to hash on load
    const hash = window.location.hash;
    if (hash) {
      const id = hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          const navHeight = 73;
          const top = el.getBoundingClientRect().top + window.scrollY - navHeight;
          window.scrollTo({ top, behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);

  return (
    <div className={styles.page}>
      {/* Navbar */}
      <Navbar />

      {/* Hero Section com Login Card */}
      <main id="login" className={styles.main}>
        <ParticleBackground />
        <div className={styles.heroContainer}>
          <div className={styles.contentWrapper}>
            <HeroSection />
          </div>
          <div className={styles.cardWrapper}>
            <LoginCard />
          </div>
        </div>
      </main>

      {/* Seção Sobre Nós */}
      <div id="about">
        <AboutSection />
      </div>

      {/* Seção Dúvidas Frequentes */}
      <div id="faq">
        <FaqSection />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
