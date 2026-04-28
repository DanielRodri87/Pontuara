'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './CadastroCard.module.css';

export default function CadastroCard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = async () => {
    // Try the modern File System Access API for a more native feel
    if (typeof window !== 'undefined' && 'showOpenFilePicker' in window) {
      try {
        const [fileHandle] = await (window as any).showOpenFilePicker({
          types: [{
            description: 'Imagens',
            accept: { 'image/*': ['.png', '.gif', '.jpeg', '.jpg', '.webp'] }
          }],
          excludeAcceptAllOption: true,
          multiple: false
        });
        const file = await fileHandle.getFile();
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfileImage(reader.result as string);
        };
        reader.readAsDataURL(file);
        return;
      } catch (err) {
        // User cancelled or error, fallback to standard input if it's not a cancel
        if ((err as Error).name === 'AbortError') return;
      }
    }
    
    // Fallback for browsers that don't support the new API
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      console.log('Final data:', formData);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className={`${styles.card} reveal`}>
      <div className={styles.header}>
        <span className={styles.stepIndicator}>ETAPA {step} DE 3</span>
        <div className={styles.progressBars}>
          <div className={`${styles.bar} ${step >= 1 ? styles.active : ''}`}></div>
          <div className={`${styles.bar} ${step >= 2 ? styles.active : ''}`}></div>
          <div className={`${styles.bar} ${step >= 3 ? styles.active : ''}`}></div>
        </div>
      </div>

      <div className={styles.titleContainer}>
        <h2 className={styles.title}>Sua gestão inteligente começa aqui!</h2>
        <p className={styles.subtitle}>
          Crie sua conta na Pontuará e comece a pontuar horas com inteligência.
        </p>
      </div>

      <form onSubmit={handleNext} className={styles.form}>
        {step === 1 && (
          <>
            <div className={styles.profileSection}>
              <div className={styles.avatarPlaceholder}>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className={styles.profilePreview} 
                  />
                ) : (
                  <Image 
                    src="/images/profile.svg" 
                    alt="Profile Placeholder" 
                    width={20} 
                    height={20} 
                    className={styles.avatarIcon}
                  />
                )}
                <div className={styles.addPhotoBtn} onClick={handleImageClick}>
                  <Image 
                    src="/images/camera.svg" 
                    alt="Add Photo" 
                    width={18} 
                    height={18} 
                    className={styles.cameraIcon}
                  />
                </div>
              </div>
              <span className={styles.profileLabel}>FOTO DE PERFIL</span>
            </div>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label htmlFor="firstName" className={styles.label}>NOME</label>
                <input
                  type="text"
                  id="firstName"
                  className={styles.input}
                  placeholder="Ex: Lucas"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="lastName" className={styles.label}>SEGUNDO NOME</label>
                <input
                  type="text"
                  id="lastName"
                  className={styles.input}
                  placeholder="Ex: Sampaio"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>EMAIL</label>
              <input
                type="email"
                id="email"
                className={styles.input}
                placeholder="username@pontuara.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="phone" className={styles.label}>TELEFONE</label>
              <input
                type="text"
                id="phone"
                className={styles.input}
                placeholder="(DDD) 0000000-0000"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label htmlFor="password" className={styles.label}>SENHA</label>
                <input
                  type="password"
                  id="password"
                  className={styles.input}
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>CONFIRME SUA SENHA</label>
                <input
                  type="password"
                  id="confirmPassword"
                  className={styles.input}
                  placeholder="••••••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </>
        )}

        <button type="submit" className={styles.nextBtn}>
          Próximo Passo
          <Image 
            src="/images/setacad.svg" 
            alt="Seta" 
            width={20} 
            height={20} 
            className={styles.btnIcon}
          />
        </button>
      </form>

      <div className={styles.footer}>
        <div className={styles.footerContent}>
          {step > 1 && (
            <button onClick={handleBack} className={styles.backLink}>
              <Image 
                src="/images/back.svg" 
                alt="Back" 
                width={16} 
                height={16} 
                className={styles.backIcon}
              />
              Voltar Etapa
            </button>
          )}
          <span className={styles.loginText}>
            Já possui uma conta? <Link href="/" className={styles.loginLink}>Logar</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
