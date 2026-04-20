import React from 'react';
import styles from '../page.module.css';

export default function EsqueceuSenhaPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Recuperar Senha</h1>
        <p className={styles.subtitle}>Enviaremos um link para seu e-mail</p>
        
        <form className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">E-mail</label>
            <input type="email" id="email" placeholder="nome@empresa.com" />
          </div>
          
          <div className={styles.actions}>
            <button type="button" className={styles.button}>Enviar Resgate</button>
            <a href="/" className={styles.link} style={{ textAlign: 'center', marginTop: '1rem' }}>Voltar para o Login</a>
          </div>
        </form>
      </div>
    </div>
  );
}
