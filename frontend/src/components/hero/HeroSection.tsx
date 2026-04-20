import React from 'react';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.contentColumn}>
          <div className={styles.badge}>
            <span className={styles.dot}></span>
            <span className={styles.badgeText}>ACOMPANHE AO VIVO</span>
          </div>
          <h1 className={styles.mainTitle}>
            Inovação digital para o seu <span className={styles.highlight}>controle de ponto</span>.
          </h1>
          <p className={styles.description}>
            Chega de complicar o controle de jornada. Organize o tempo da sua equipe com simplicidade, precisão e tudo em um só lugar
          </p>
        </div>
        <div className={styles.cardColumn}>
        </div>
      </div>
    </section>
  );
}