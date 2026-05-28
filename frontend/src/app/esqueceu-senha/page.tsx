import React from 'react';
import Image from 'next/image';
import Navbar from '../../components/navbar/Navbar';
import ForgotPasswordCard from '../../components/auth/ForgotPasswordCard';
import ParticleBackground from '../../components/particles/ParticleBackground';
import Footer from '../../components/footer/Footer';
import styles from './page.module.css';

/**
 * Password recovery page.
 * Renders the flow where the user can request a password reset.
 *
 * @returns {JSX.Element} "Forgot password" page.
 */
export default function EsqueceuSenhaPage() {
  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <ParticleBackground />
        <div className={styles.backgroundLayer} aria-hidden="true">
      
        </div>
        <div className={styles.container}>
          <React.Suspense fallback={<div>Carregando...</div>}>
            <ForgotPasswordCard />
          </React.Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
