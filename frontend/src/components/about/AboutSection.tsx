'use client';

import React from 'react';
import Image from 'next/image';
import styles from './AboutSection.module.css';

export default function AboutSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 className={`${styles.title} reveal delay-1`}>Sobre Nós</h2>
          <p className={`${styles.subtitle} reveal delay-2`}>
            A base tecnológica para uma gestão de ponto estratégica, segura e escalável, fundamentada em dados.
          </p>
        </header>

        <div className={styles.grid}>
          {/* Card 1: Registre */}
          <div className={`${styles.card} ${styles.card1} reveal delay-3`}>
            <div className={`${styles.iconWrapper} ${styles.iconRegistre}`}>
              <Image src="/images/Compasso.svg" alt="Registre" width={24} height={24} />
            </div>
            <h3 className={`${styles.cardTitle} ${styles.card1Title}`}>Registre</h3>
            <p className={`${styles.cardText} ${styles.card1Text}`}>
              Capture entradas, saídas e intervalos com precisão tecnológica. Reduza erros manuais e simplifique o fechamento da folha de ponto.
            </p>
          </div>

          {/* Card 2: Escale */}
          <div className={`${styles.card} ${styles.card2} reveal delay-4`}>
            <div className={`${styles.iconWrapper} ${styles.iconEscale}`}>
              <Image src="/images/Raio.svg" alt="Escale" width={24} height={24} />
            </div>
            <h3 className={`${styles.cardTitle} ${styles.card2Title}`}>Escale</h3>
            <p className={`${styles.cardText} ${styles.card2Text}`}>
              Processamento de dados de jornada robusto e de alta performance, ideal para empresas com milhares de colaboradores.
            </p>
          </div>

          {/* Card 3: Flexibilidade */}
          <div className={`${styles.card} ${styles.card3} reveal delay-5`}>
            <div className={`${styles.iconWrapper} ${styles.iconFlex}`}>
              <Image src="/images/Modelos.svg" alt="Flexibilidade" width={24} height={24} />
            </div>
            <h3 className={`${styles.cardTitle} ${styles.card3Title}`}>Flexibilidade de Modelos</h3>
            <p className={`${styles.cardText} ${styles.card3Text}`}>
              Acompanhe colaboradores em qualquer modelo: presencial, híbrido ou remoto, com ferramentas acessíveis e intuitivas.
            </p>
          </div>

          {/* Card 4: Conformidade */}
          <div className={`${styles.card} ${styles.card4} reveal delay-6`}>
            <div className={styles.card4Content}>
              <h3 className={`${styles.cardTitle} ${styles.card4Title}`}>Conformidade Legal e Segurança</h3>
              <p className={`${styles.cardText} ${styles.card4Text}`}>
                Garante o cuprimento das normas de CLT (Art. 74) e promove a segurança jurídica, com validação contínua e trilhas de auditoria.
              </p>
            </div>
            <div className={styles.card4Icon}>
              <Image src="/images/Seguro.svg" alt="Segurança" width={48} height={48} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
