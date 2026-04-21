"use client";
import React, { useState } from 'react';
import styles from '../page.module.css'; // Reusing styles from login for simplicity

export default function CadastroPage() {
  const [step, setStep] = useState(1);
  
  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));
  
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Cadastro (Passo {step} de 3)</h1>
        
        <form className={styles.form}>
          {step === 1 && (
            <div className="step-1">
              <div className={styles.inputGroup}>
                <label>Dados Pessoais</label>
                <input type="text" placeholder="Nome Completo" />
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="step-2">
              <div className={styles.inputGroup}>
                <label>Contato</label>
                <input type="email" placeholder="E-mail" />
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="step-3">
              <div className={styles.inputGroup}>
                <label>Senha</label>
                <input type="password" placeholder="Defina sua senha" />
              </div>
            </div>
          )}
          
          <div className={styles.actions} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {step > 1 ? (
              <button type="button" onClick={prevStep} className={styles.button} style={{ background: 'var(--muted)', width: '48%' }}>
                Voltar
              </button>
            ) : <div style={{ width: '48%' }} />}
            
            {step < 3 ? (
              <button type="button" onClick={nextStep} className={styles.button} style={{ width: '48%' }}>
                Próximo
              </button>
            ) : (
              <button type="submit" className={styles.button} style={{ width: '48%' }}>
                Finalizar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
