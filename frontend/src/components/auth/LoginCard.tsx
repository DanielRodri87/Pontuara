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
      <h2 className={`${styles.title} reveal delay-9`}>Comece a cuidar do seu tempo</h2>
      
      {/* Descrição */}
      <p className={`${styles.subtitle} reveal delay-10`}>Preencha as suas credenciais para entrar.</p>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Email Input */}
        <div className={`${styles.inputGroup} reveal delay-11`}>
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
        <div className={`${styles.inputGroup} reveal delay-12`}>
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

        <div className="reveal delay-13">
          <button type="submit" className={styles.loginBtn}>
            Login
          </button>
        </div>

        <div className="reveal delay-14">
          <button type="button" className={styles.googleBtn}>
            <Image 
              src="/images/Google.svg" 
              alt="Google"
              width={20}
              height={20}
            />
            <span>Logar com Google</span>
          </button>
        </div>
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
