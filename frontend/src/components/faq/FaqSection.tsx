'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './FaqSection.module.css';

const faqData = [
  {
    id: 1,
    question: 'O sistema possui validade legal e atende às normas da CLT?',
    answer: 'Sim. Nossa plataforma é totalmente aderente à Consolidação das Leis do Trabalho (CLT), em especial ao Artigo 74, §2º, e às portarias vigentes. Utilizamos criptografia de ponta a ponta e armazenamento seguro em nuvem para garantir a integridade dos registros, protegendo sua empresa contra passivos trabalhistas.',
  },
  {
    id: 2,
    question: 'Como funciona o registro para colaboradores em home office ou jornadas flexíveis?',
    answer: 'O registro é realizado de forma digital, permitindo que o colaborador marque início, pausas e término da jornada de qualquer local, geralmente por meio de aplicativo ou sistema web. Em jornadas flexíveis, o sistema adapta-se aos horários variáveis, registrando corretamente as horas trabalhadas e permitindo acompanhamento pelos gestores.',
  },
  {
    id: 3,
    question: 'O sistema suporta empresas com um grande volume de funcionários?',
    answer: 'Sim, o sistema é projetado para suportar um grande volume de funcionários, garantindo desempenho e estabilidade mesmo com múltiplos registros simultâneos. Além disso, utiliza estruturas que permitem escalabilidade, acompanhando o crescimento da empresa sem comprometer a eficiência.',
  },
  {
    id: 4,
    question: 'É possível exportar os dados para fechar a folha de pagamento?',
    answer: 'Sim, os dados podem ser exportados em formato CSV, permitindo que sejam facilmente importados por sistemas de folha de pagamento. Isso facilita o fechamento da folha, agiliza o processamento das informações e reduz a necessidade de lançamentos manuais, minimizando erros.',
  }
];

export default function FaqSection() {
  const [openCardId, setOpenCardId] = useState<number>(1);

  const handleCardClick = (id: number) => {
    if (openCardId !== id) {
      setOpenCardId(id);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>

        {/* Efeito de Fundo Premium */}
        <div className={styles.glowEffect}></div>

        <div className={styles.leftColumn}>
          <h2 className={`${styles.title} reveal delay-1`}>Dúvidas Frequentes</h2>
          <p className={`${styles.subtitle} reveal delay-2`}>
            Tudo o que você precisa saber para modernizar o controle de ponto da sua empresa com segurança e tecnologia.
          </p>
        </div>

        <div className={styles.rightColumn}>
          {faqData.map((faq, index) => {
            const isOpen = openCardId === faq.id;

            return (
              <div
                key={faq.id}
                className={`${styles.card} ${isOpen ? styles.open : styles.closed} reveal`}
                style={{ animationDelay: `${0.1 + index * 0.08}s` }}
                onClick={() => handleCardClick(faq.id)}
              >
                <div className={styles.cardHeader}>
                  <h3 className={styles.question}>{faq.question}</h3>
                  <div className={`${styles.iconWrapper} ${isOpen ? styles.iconOpen : styles.iconClosed}`}>
                    <Image
                      src="/images/Seta.svg"
                      alt="Seta"
                      width={16}
                      height={16}
                    />
                  </div>
                </div>

                <div className={styles.cardContent}>
                  <p className={styles.answer}>{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
