'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '../../services/api';
import styles from './ForgotPasswordCard.module.css';

/**
 * Componente de cartão para recuperação de senha.
 * Exibe um formulário solicitando o e-mail do usuário para envio do link.
 * 
 * @returns {JSX.Element} Cartão de recuperação de senha.
 */
export default function ForgotPasswordCard() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  /**
   * Manipula a submissão do formulário de recuperação de senha.
   * Realiza a requisição na API para o disparo de e-mail.
   * 
   * @param {React.FormEvent} e - O evento de submissão do formulário.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
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
    <div className={`${styles.card} reveal`}>
      <div className={styles.iconContainer}>
        <Image
          className={styles.lockIcon}
          src="/images/overlay.svg"
          alt="Recuperar senha"
          width={32}
          height={32}
          priority
        />
      </div>

      <h2 className={styles.title}>Perdeu o caminho?</h2>
      <p className={styles.subtitle}>
        Não se preocupe! O Pontuará ajudará você a recuperar o seu acesso.
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
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>@</span>
            <input
              type="email"
              id="email"
              className={styles.input}
              placeholder="pontuara.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || !!successMsg}
            />
          </div>
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={loading || !!successMsg}
        >
          {loading ? 'Enviando...' : 'Recuperar Senha'}
        </button>
      </form>

      <div className={styles.footer}>
        <Link href="/" className={styles.backLink}>
          <Image 
            src="/images/back.svg" 
            alt="Back" 
            width={16} 
            height={16} 
            className={styles.backIcon}
          />
          Voltar ao Login
        </Link>
      </div>
    </div>
  );
}
