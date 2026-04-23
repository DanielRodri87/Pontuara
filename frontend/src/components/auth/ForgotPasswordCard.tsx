'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '../../services/api';
import styles from './ForgotPasswordCard.module.css';

export default function ForgotPasswordCard() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Chamada para o backend para recuperação de senha
      const response = await api.post('/api/v1/auth/forgot-password', {
        email,
      });

      setSuccessMsg('Link de recuperação enviado para seu e-mail!');
      setEmail('');
    } catch (error: any) {
      if (error.response?.status === 404) {
        setErrorMsg('E-mail não encontrado no sistema.');
      } else if (error.response?.status === 400) {
        setErrorMsg('Por favor, insira um e-mail válido.');
      } else {
        setErrorMsg('Ocorreu um erro ao enviar o link. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.iconContainer}>
        <Image
          className={styles.lockIcon}
          src="/images/Overlay.png"
          alt="Recuperar senha"
          width={56}
          height={56}
          priority
        />
      </div>

      <h2 className={styles.title}>Perdeu o caminho?</h2>
      <p className={styles.subtitle}>
        Não se preocupe! O Pontuará ajudará 
        você a recuperar o seu acesso
      </p>

      {errorMsg && (
        <div className={styles.errorMessage}>
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className={styles.successMessage}>
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>EMAIL</label>
          <input
            type="email"
            id="email"
            className={styles.input}
            placeholder="@pontuara.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading || !!successMsg}
          />
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={loading || !!successMsg}
        >
          {loading ? 'Enviando...' : 'Recuperar Senha'}
        </button>
      </form>

      <div className={styles.linkContainer}>
        <Link href="/" className={styles.backLink}>
          ← Voltar ao Login
        </Link>
      </div>
    </div>
  );
}
