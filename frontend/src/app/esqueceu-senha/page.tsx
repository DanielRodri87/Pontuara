import React from 'react';
import Image from 'next/image';
import Navbar from '../../components/navbar/Navbar';
import ForgotPasswordCard from '../../components/auth/ForgotPasswordCard';
import ParticleBackground from '../../components/particles/ParticleBackground';
import Footer from '../../components/footer/Footer';
import styles from './page.module.css';

export default function EsqueceuSenhaPage() {
  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <ParticleBackground />
        <div className={styles.backgroundLayer} aria-hidden="true">
      
        </div>
        <div className={styles.container}>
          <ForgotPasswordCard />
        </div>
      </main>
      <Footer />
    </div>
  );
}
