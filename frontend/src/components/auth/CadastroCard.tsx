'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './CadastroCard.module.css';

/**
 * Componente que renderiza o fluxo de cadastro em etapas (wizard).
 * Coleta informações do usuário e, no final, pode gerar um convite ou registrar o usuário.
 * 
 * @returns {JSX.Element} Cartão de cadastro multi-etapas.
 */
export default function CadastroCard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: '',
    inviteCode: '',
  });
  const [showPopup, setShowPopup] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Abre o seletor de arquivos de imagem utilizando File System Access API
   * ou faz o fallback para um input clássico.
   */
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

  /**
   * Atualiza a imagem de perfil no estado a partir do input de arquivo clássico.
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - Evento de alteração do input.
   */
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

  /**
   * Manipula alterações em inputs genéricos do formulário.
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - Evento de alteração do input.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  /**
   * Avança para a próxima etapa do cadastro ou finaliza o processo.
   * 
   * @param {React.FormEvent} e - O evento do formulário submetido.
   */
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      if (!formData.userType) {
        // Optional: you could show a nicer error here
        alert("Por favor, selecione o tipo de usuário (Funcionário ou Empregador).");
        return;
      }

      if (formData.userType === 'empregador') {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let code = '';
        let hasNumber = false;
        for (let i = 0; i < 15; i++) {
          const char = chars.charAt(Math.floor(Math.random() * chars.length));
          if (/[0-9]/.test(char)) hasNumber = true;
          code += char;
        }
        // Garante que tenha pelo menos um número
        if (!hasNumber) {
          const randIndex = Math.floor(Math.random() * 15);
          code = code.substring(0, randIndex) + Math.floor(Math.random() * 10) + code.substring(randIndex + 1);
        }
        setGeneratedCode(code);
      } else {
        console.log('Final data:', formData);
      }
      
      setShowPopup(true);
    }
  };

  /**
   * Copia o código de convite gerado para a área de transferência do usuário.
   */
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      // Optional: show a small toast or change copy icon briefly
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  /**
   * Retorna para a etapa anterior no formulário de cadastro.
   */
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

        {step === 3 && (
          <>
            <div className={styles.inputGroup}>
              <label className={styles.label}>TIPO DE USUÁRIO</label>
              <div className={styles.radioGroup}>
                <div 
                  className={styles.radioOption} 
                  onClick={() => setFormData(prev => ({ ...prev, userType: 'funcionario' }))}
                >
                  <div className={`${styles.radioCircle} ${formData.userType === 'funcionario' ? styles.selected : ''}`}></div>
                  <span className={styles.radioLabel}>Funcionário</span>
                </div>
                <div 
                  className={styles.radioOption} 
                  onClick={() => setFormData(prev => ({ ...prev, userType: 'empregador' }))}
                >
                  <div className={`${styles.radioCircle} ${formData.userType === 'empregador' ? styles.selected : ''}`}></div>
                  <span className={styles.radioLabel}>Empregador</span>
                </div>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="inviteCode" className={styles.label}>CONVITE PARA FUNCIONÁRIOS</label>
              <input
                type="text"
                id="inviteCode"
                className={styles.input}
                placeholder="Informe o código da sua organização"
                value={formData.inviteCode}
                onChange={handleChange}
                required={formData.userType === 'funcionario'}
              />
            </div>
          </>
        )}

        <button type="submit" className={styles.nextBtn}>
          {step === 3 ? 'Cadastrar' : 'Próximo Passo'}
          {step !== 3 && (
            <Image 
              src="/images/setacad.svg" 
              alt="Seta" 
              width={20} 
              height={20} 
              className={styles.btnIcon}
            />
          )}
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

      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContent}>
            <svg className={styles.checkIcon} viewBox="0 0 52 52">
              <circle className={styles.checkCircle} cx="26" cy="26" r="25" fill="none" />
              <path className={styles.checkPath} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
            
            {formData.userType === 'empregador' ? (
              <>
                <h3 className={styles.popupTitle}>Organização criada!</h3>
                <p className={styles.popupText}>
                  Copie o código abaixo e compartilhe com seus funcionários.
                </p>
                <div className={styles.codeContainer}>
                  <span className={styles.codeValue}>{generatedCode}</span>
                  <button onClick={copyToClipboard} className={styles.copyBtn} title="Copiar código">
                    <Image 
                      src="/images/copy.svg" 
                      alt="Copiar" 
                      width={20} 
                      height={20} 
                      className={styles.copyIcon}
                    />
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className={styles.popupTitle}>Bem-vindo(a) ao Pontuará!</h3>
                <p className={styles.popupText}>
                  Seu cadastro foi realizado com sucesso. Agora você já pode acessar o sistema.
                </p>
              </>
            )}

            <button 
              onClick={() => {
                setShowPopup(false);
                window.location.href = '/';
              }} 
              className={styles.closeBtn}
            >
              Voltar ao login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
