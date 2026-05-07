'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/services/api'; // O seu cliente axios já configurado
import { supabase } from '@/services/supabase';
import styles from './LoginCard.module.css';

/**
 * Componente de cartão de login da plataforma.
 * Oferece login por e-mail/senha ou integração OAuth com Google.
 * 
 * @returns {JSX.Element} O formulário de login.
 */
export default function LoginCard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  /**
   * Manipula a submissão do formulário de login tradicional.
   * 
   * @param {React.FormEvent} e - O evento de envio do formulário.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await api.post('/api/v1/auth/login', {
        email,
        password,
      });

      console.log("Resposta do servidor:", response.data); // Verifique o console do navegador (F12)

      // O FastAPI costuma retornar os dados direto ou dentro de um campo 'user'
      const token = response.data.access_token;
      const user = response.data.user || response.data; // Tenta pegar o user ou o objeto raiz

      if (token && user) {
        localStorage.setItem('access_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Pequeno delay para garantir que o storage foi gravado antes do redirect
        setTimeout(() => {
          router.push('/funcionario');
        }, 100);
      } else {
        setErrorMsg('Erro: Dados de sessão não recebidos.');
      }

    } catch (error: any) {
      console.error("Erro no login:", error);
      setErrorMsg('Falha na autenticação. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };
  /**
   * Inicia o fluxo de login OAuth através do Google (Supabase).
   */
  const handleGoogleLogin = async () => {
    if (!supabase) {
      setErrorMsg('Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no frontend.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/funcionario`,
      },
    });

    if (error) {
      setErrorMsg('Nao foi possivel iniciar o login com Google.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <h2 className={`${styles.title} reveal delay-9`}>Comece a cuidar do seu tempo</h2>
      <p className={`${styles.subtitle} reveal delay-10`}>Preencha as suas credenciais para entrar.</p>

      {errorMsg && (
        <div style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px', textAlign: 'center', fontWeight: '500' }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
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
            disabled={loading}
          />
        </div>

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
            disabled={loading}
          />
        </div>

        <div className="reveal delay-13">
          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading ? 'A validar...' : 'Login'}
          </button>
        </div>

        <div className="reveal delay-14">
          <button type="button" className={styles.googleBtn} onClick={handleGoogleLogin} disabled={loading}>
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