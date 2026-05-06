'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { api } from '../../services/api';
import styles from './ForgotPasswordCard.module.css';

/**
 * Componente de cartão para recuperação de senha.
 * Exibe um formulário solicitando o e-mail do usuário para envio do link.
 * 
 * @returns {JSX.Element} Cartão de recuperação de senha.
 */
export default function ForgotPasswordCard() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  
  useEffect(() => {
    // 1. Verificar query params (?token_hash=...)
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');
    
    if (tokenHash && type === 'recovery') {
      setToken(tokenHash);
      setStep('reset');
      return;
    }

    // 2. Verificar fragment (#error=... ou #access_token=...)
    // O Supabase às vezes envia os dados no fragmento da URL
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1)); // remove o '#'
      
      const error = params.get('error_description');
      if (error) {
        setErrorMsg(decodeURIComponent(error.replace(/\+/g, ' ')));
        return;
      }

      const accessToken = params.get('access_token');
      const recoveryType = params.get('type');
      if (accessToken && recoveryType === 'recovery') {
        setToken(accessToken);
        setStep('reset');
      }
    }
  }, [searchParams]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  /**
   * Solicita o envio do código de recuperação.
   */
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.post('/api/v1/auth/forgot-password', {
        email,
        redirectTo: window.location.origin + '/esqueceu-senha',
      });

      setSuccessMsg('Código ou link de recuperação enviado para seu e-mail!');
      setStep('reset');
    } catch (error: any) {
      if (error.response?.status === 404) {
        setErrorMsg('E-mail não encontrado no sistema.');
      } else {
        setErrorMsg('Erro ao enviar o código. Verifique o e-mail e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Realiza a redefinição da senha.
   */
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setErrorMsg('As senhas não coincidem.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.post('/api/v1/auth/reset-password', {
        email: email || undefined,
        token,
        new_password: newPassword,
      });

      setSuccessMsg('Senha redefinida com sucesso!');
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.detail || 'Erro ao redefinir senha. O código pode estar expirado.');
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

      <h2 className={styles.title}>
        {step === 'email' ? 'Perdeu o caminho?' : 'Nova Senha'}
      </h2>
      <p className={styles.subtitle}>
        {step === 'email' 
          ? 'Não se preocupe! O Pontuará ajudará você a recuperar o seu acesso.' 
          : 'Insira o código enviado para seu e-mail e sua nova senha.'}
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

      {step === 'email' ? (
        <form onSubmit={handleRequestReset} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>EMAIL</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>@</span>
              <input
                type="email"
                id="email"
                className={styles.input}
                placeholder="exemplo@pontuara.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar Código'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="token" className={styles.label}>CÓDIGO / TOKEN</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>#</span>
              <input
                type="text"
                id="token"
                className={styles.input}
                placeholder="Insira o código"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                disabled={loading || !!successMsg && successMsg.includes('sucesso')}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="newPassword" className={styles.label}>NOVA SENHA</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>*</span>
              <input
                type="password"
                id="newPassword"
                className={styles.input}
                placeholder="******"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading || !!successMsg && successMsg.includes('sucesso')}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>CONFIRMAR SENHA</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>*</span>
              <input
                type="password"
                id="confirmPassword"
                className={styles.input}
                placeholder="******"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading || !!successMsg && successMsg.includes('sucesso')}
              />
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading || !!successMsg && successMsg.includes('sucesso')}
          >
            {loading ? 'Redefinindo...' : 'Alterar Senha'}
          </button>

          <button
            type="button"
            className={styles.backButton}
            onClick={() => setStep('email')}
            disabled={loading}
          >
            Voltar para E-mail
          </button>
        </form>
      )}

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
