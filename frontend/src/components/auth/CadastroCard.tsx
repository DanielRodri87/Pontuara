'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/services/api';
import styles from './CadastroCard.module.css';

/**
 * Componente que renderiza o fluxo de cadastro em etapas (wizard).
 * Coleta informações do usuário e, no final, registra no backend via API.
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
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateCompanyCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    let hasNumber = false;
    for (let i = 0; i < 15; i++) {
      const char = chars.charAt(Math.floor(Math.random() * chars.length));
      if (/[0-9]/.test(char)) hasNumber = true;
      code += char;
    }
    if (!hasNumber) {
      const randIndex = Math.floor(Math.random() * 15);
      code = code.substring(0, randIndex) + Math.floor(Math.random() * 10) + code.substring(randIndex + 1);
    }
    return code;
  };

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
   * Valida os dados do formulário antes de enviar.
   * 
   * @returns {boolean} True se todos os dados são válidos, false caso contrário.
   */
  const validateFormData = (): boolean => {
    setErrorMsg('');

    if (!formData.firstName.trim()) {
      setErrorMsg('Por favor, preencha o nome.');
      return false;
    }

    if (!formData.lastName.trim()) {
      setErrorMsg('Por favor, preencha o sobrenome.');
      return false;
    }

    // Validação de email
    if (!formData.email.trim()) {
      setErrorMsg('Por favor, preencha o email.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setErrorMsg('Por favor, insira um email válido (ex: usuario@dominio.com).');
      return false;
    }

    // Validação de senha forte
    const passwordErrors: string[] = [];
    if (formData.password.length < 8) {
      passwordErrors.push('pelo menos 8 caracteres');
    }
    if (!/[A-Z]/.test(formData.password)) {
      passwordErrors.push('uma letra maiúscula');
    }
    if (!/[a-z]/.test(formData.password)) {
      passwordErrors.push('uma letra minúscula');
    }
    if (!/[0-9]/.test(formData.password)) {
      passwordErrors.push('um número');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(formData.password)) {
      passwordErrors.push('um caractere especial');
    }
    if (passwordErrors.length > 0) {
      setErrorMsg(`A senha deve conter: ${passwordErrors.join(', ')}.`);
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('As senhas não coincidem.');
      return false;
    }

    // Validação de telefone (se preenchido)
    if (formData.phone.trim()) {
      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (phoneDigits.length < 10 || phoneDigits.length > 11) {
        setErrorMsg('Telefone inválido. Use o formato (DDD) XXXXX-XXXX.');
        return false;
      }
    }

    if (!formData.userType) {
      setErrorMsg('Por favor, selecione o tipo de usuário.');
      return false;
    }

    return true;
  };

  /**
   * Requisitos de senha para exibição visual.
   */
  const passwordRequirements = [
    { label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
    { label: 'Uma letra maiúscula', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'Uma letra minúscula', test: (p: string) => /[a-z]/.test(p) },
    { label: 'Um número', test: (p: string) => /[0-9]/.test(p) },
    { label: 'Um caractere especial', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(p) },
  ];

  /**
   * Formata o telefone automaticamente enquanto o usuário digita.
   */
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    let formatted = raw;
    if (raw.length > 0) {
      if (raw.length <= 2) {
        formatted = `(${raw}`;
      } else if (raw.length <= 7) {
        formatted = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
      } else if (raw.length <= 11) {
        formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
      } else {
        formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7, 11)}`;
      }
    }
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  /**
   * Submete o formulário de cadastro para o backend.
   */
  const submitSignup = async () => {
    if (!validateFormData()) {
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      let empresaId: string | undefined;

      if (formData.userType === 'funcionario') {
        if (!formData.inviteCode.trim()) {
          setErrorMsg('Informe o código da organização para continuar.');
          setLoading(false);
          return;
        }

        const { data: empresas } = await api.get('/api/v1/empresas/');
        const empresa = empresas.find((item: any) => item.codigoempresa === formData.inviteCode.trim());
        if (!empresa) {
          setErrorMsg('Código da organização não encontrado.');
          setLoading(false);
          return;
        }
        empresaId = empresa.id;
      }

      // Chama o endpoint de signup no backend
      const response = await api.post('/api/v1/auth/signup', {
        nome: formData.firstName,
        sobrenome: formData.lastName,
        email: formData.email,
        telefone: formData.phone,
        password: formData.password,
        tipo_usuario: formData.userType,
        idempresa: empresaId,
        pendente: formData.userType === 'funcionario',
      });

      console.log('Usuário cadastrado com sucesso:', response.data);

      if (formData.userType === 'empregador') {
        const code = generateCompanyCode();
        // O schema atual de empresas tem apenas `nome` e `codigoempresa`.
        // Enquanto não houver campo de nome da empresa no formulário, usamos o nome do empregador como placeholder.
        const { data: empresa } = await api.post('/api/v1/empresas/', {
          nome: `${formData.firstName} ${formData.lastName}`.trim(),
          codigoempresa: code,
        });
        await api.put(`/api/v1/usuarios/${response.data.id}`, {
          idempresa: empresa.id,
          pendente: false,
        });
        setGeneratedCode(code);
      }

      setShowPopup(true);
    } catch (error: any) {
      console.error('Erro ao cadastrar:', error);
      if (error.response && error.response.data && error.response.data.detail) {
        setErrorMsg(error.response.data.detail);
      } else if (error.response && error.response.status === 422) {
        setErrorMsg('Dados inválidos. Verifique os campos preenchidos.');
      } else if (error.response && error.response.status === 409) {
        setErrorMsg('Este email já está cadastrado. Use outro email ou faça login.');
      } else {
        setErrorMsg('Erro ao criar conta. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Valida apenas os campos da etapa atual antes de avançar.
   * 
   * @param {number} currentStep - A etapa atual (1, 2 ou 3).
   * @returns {boolean} True se a etapa está válida.
   */
  const validateStep = (currentStep: number): boolean => {
    setErrorMsg('');

    if (currentStep === 1) {
      if (!formData.firstName.trim()) {
        setErrorMsg('Por favor, preencha o nome.');
        return false;
      }
      if (!formData.lastName.trim()) {
        setErrorMsg('Por favor, preencha o sobrenome.');
        return false;
      }
      return true;
    }

    if (currentStep === 2) {
      // Validação de email
      if (!formData.email.trim()) {
        setErrorMsg('Por favor, preencha o email.');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setErrorMsg('Por favor, insira um email válido (ex: usuario@dominio.com).');
        return false;
      }

      // Validação de telefone (se preenchido)
      if (formData.phone.trim()) {
        const phoneDigits = formData.phone.replace(/\D/g, '');
        if (phoneDigits.length < 10 || phoneDigits.length > 11) {
          setErrorMsg('Telefone inválido. Use o formato (DDD) XXXXX-XXXX.');
          return false;
        }
      }

      // Validação de senha forte
      const passwordErrors: string[] = [];
      if (formData.password.length < 8) {
        passwordErrors.push('pelo menos 8 caracteres');
      }
      if (!/[A-Z]/.test(formData.password)) {
        passwordErrors.push('uma letra maiúscula');
      }
      if (!/[a-z]/.test(formData.password)) {
        passwordErrors.push('uma letra minúscula');
      }
      if (!/[0-9]/.test(formData.password)) {
        passwordErrors.push('um número');
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(formData.password)) {
        passwordErrors.push('um caractere especial');
      }
      if (passwordErrors.length > 0) {
        setErrorMsg(`A senha deve conter: ${passwordErrors.join(', ')}.`);
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setErrorMsg('As senhas não coincidem.');
        return false;
      }

      return true;
    }

    // Step 3: valida no submit final
    return true;
  };

  /**
   * Avança para a próxima etapa do cadastro ou finaliza o processo.
   * 
   * @param {React.FormEvent} e - O evento do formulário submetido.
   */
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();

    // Valida os campos da etapa atual antes de avançar
    if (!validateStep(step)) {
      return;
    }

    if (step < 3) {
      // Limpa erro ao avançar com sucesso
      setErrorMsg('');
      setStep(step + 1);
    } else {
      // Última etapa: validar o restante e submeter
      submitSignup();
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

      {errorMsg && (
        <div style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px', textAlign: 'center', fontWeight: '500' }}>
          {errorMsg}
        </div>
      )}

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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
                disabled={loading}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="phone" className={styles.label}>TELEFONE</label>
              <input
                type="tel"
                id="phone"
                className={styles.input}
                placeholder="(DD) 9XXXX-XXXX"
                value={formData.phone}
                onChange={handlePhoneChange}
                disabled={loading}
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
                  disabled={loading}
                />
                {/* Indicadores de requisitos da senha */}
                {formData.password.length > 0 && (
                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {passwordRequirements.map((req, idx) => {
                      const passed = req.test(formData.password);
                      return (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '11px',
                          fontWeight: 500,
                          color: passed ? '#10B981' : '#9CA3AF',
                          transition: 'color 0.2s ease',
                        }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            {passed ? (
                              <polyline points="20 6 9 17 4 12"></polyline>
                            ) : (
                              <circle cx="12" cy="12" r="10"></circle>
                            )}
                          </svg>
                          {req.label}
                        </div>
                      );
                    })}
                  </div>
                )}
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
                  disabled={loading}
                />
                {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#EF4444',
                    marginTop: '4px',
                  }}>
                    As senhas não coincidem
                  </span>
                )}
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
                  onClick={() => !loading && setFormData(prev => ({ ...prev, userType: 'funcionario' }))}
                >
                  <div className={`${styles.radioCircle} ${formData.userType === 'funcionario' ? styles.selected : ''}`}></div>
                  <span className={styles.radioLabel}>Funcionário</span>
                </div>
                <div 
                  className={styles.radioOption} 
                  onClick={() => !loading && setFormData(prev => ({ ...prev, userType: 'empregador' }))}
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
                disabled={loading}
              />
            </div>
          </>
        )}

        <button type="submit" className={styles.nextBtn} disabled={loading}>
          {loading ? 'Cadastrando...' : (step === 3 ? 'Cadastrar' : 'Próximo Passo')}
          {!loading && step !== 3 && (
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
            <button onClick={handleBack} className={styles.backLink} disabled={loading}>
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
                  <button onClick={copyToClipboard} className={styles.copyBtn} title="Copiar código" type="button">
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
              type="button"
            >
              Voltar ao login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
