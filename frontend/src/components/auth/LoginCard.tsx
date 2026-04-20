'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './LoginCard.module.css';

export default function LoginCard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar lógica de login
    console.log('Login:', { email, password });
  };

  return (
    <div className={styles.card}>
      {/* Título */}
      <h2 className={styles.title}>Comece a cuidar do seu tempo</h2>
      
      {/* Descrição */}
      <p className={styles.subtitle}>Preencha as suas credenciais para entrar.</p>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Email Input */}
        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>EMAIL</label>
          <input
            type="email"
            id="email"
            className={styles.input}
            placeholder="username@pontuara.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password Input */}
        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>SENHA</label>
          <input
            type="password"
            id="password"
            className={styles.input}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Login Button */}
        <button type="submit" className={styles.loginBtn}>
          Login
        </button>

        {/* Google Login Button */}
        <button type="button" className={styles.googleBtn}>
          <Image 
            src="/images/Google.svg" 
            alt="Google"
            width={20}
            height={20}
          />
          <span>Logar com Google</span>
        </button>
      </form>

      {/* Footer Links */}
      <div className={styles.footer}>
        <Link href="/esqueceu-senha" className={styles.forgotLink}>
          Esqueceu a senha?
        </Link>
        <span className={styles.divider}>•</span>
        <span className={styles.noAccount}>
          Não possui email? <Link href="/cadastro" className={styles.signupLink}>Cadastre-se</Link>
        </span>
      </div>
    </div>
  );
}
