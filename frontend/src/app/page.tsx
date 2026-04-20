import React from 'react';
import Navbar from '@/components/navbar/Navbar';
import HeroSection from '@/components/hero/HeroSection';
import LoginCard from '@/components/auth/LoginCard';
import ParticleBackground from '@/components/particles/ParticleBackground';
import styles from './page.module.css';

export default function LoginPage() {
  return (
    <div className={styles.page}>
      {/* Navbar */}
      <Navbar />

      {/* Hero Section com Login Card */}
      <main className={styles.main}>
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
    </div>
  );
}
