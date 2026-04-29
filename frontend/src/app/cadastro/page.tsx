import React from 'react';
import Navbar from '@/components/navbar/Navbar';
import CadastroCard from '@/components/auth/CadastroCard';
import ParticleBackground from '@/components/particles/ParticleBackground';
import Footer from '@/components/footer/Footer';
import styles from '../page.module.css'; // Reusing global layout styles
import cadastroStyles from './cadastro.module.css';

/**
 * Página de cadastro de novos usuários ou organizações.
 * Inclui o componente CadastroCard para guiar o usuário em etapas.
 * 
 * @returns {JSX.Element} Página de cadastro.
 */
export default function CadastroPage() {
  return (
    <div className={styles.page}>
      <Navbar />
      
      <main className={styles.main}>
        <ParticleBackground />
        
        <div className={cadastroStyles.cadastroContainer}>
          <div className={cadastroStyles.wideCardWrapper}>
            <CadastroCard />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
