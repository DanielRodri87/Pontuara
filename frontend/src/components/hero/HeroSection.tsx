import React from 'react';
import styles from './HeroSection.module.css';

/**
 * Componente principal (Hero) exibido na parte superior da página inicial.
 * Apresenta o título principal e uma breve descrição do produto.
 * 
 * @returns {JSX.Element} Seção Hero renderizada.
 */
export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.contentColumn}>
          <div className={`${styles.badge} reveal delay-6`}>
            <span className={styles.dot}></span>
            <span className={styles.badgeText}>ACOMPANHE AO VIVO</span>
          </div>
          <h1 className={`${styles.mainTitle} reveal delay-7`}>
            Inovação digital para o seu <span className={styles.highlight}>controle de ponto</span>.
          </h1>
          <p className={`${styles.description} reveal delay-8`}>
            Chega de complicar o controle de jornada. Organize o tempo da sua equipe com simplicidade, precisão e tudo em um só lugar
          </p>
        </div>
        <div className={styles.cardColumn}>
        </div>
      </div>
    </section>
  );
}