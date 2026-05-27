'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import local from './funcionario.module.css';
import { supabase } from '@/services/supabase';
import { exportTrabalhosCSV } from '@/services/csv';
import PeriodFilter from '@/components/periodFilter/PeriodFilter';
import PendingApproval from '@/components/pendingApproval/PendingApproval';
import Sidebar from '@/components/sidebar/Sidebar';

// Tipagens conforme o banco de dados e backend
/**
 * Representa um registro de trabalho associado a um usuário.
 * @interface Trabalho
 */
interface Trabalho {
  /** ID único do trabalho no banco de dados. */
  id: string;
  /** ID do empregador ou funcionário dono deste registro. */
  empregador_id: string;
  /** Título principal do trabalho realizado. */
  titulo: string;
  /** ID do projeto associado ao trabalho. */
  idprojeto?: string | null;
  /** Categoria visual (ícone) do trabalho (ex: 'pencil', 'people', 'clipboard'). */
  categoria?: string;
  /** Descrição textual do trabalho. */
  descricao?: string;
  /** Duração em formato interval retornado pelo backend/Supabase. */
  duracao?: string | null;
  /** Data e hora de criação do registro no banco. */
  criado_em: string;
}

interface Projeto {
  id: string;
  titulo: string;
  descricao?: string | null;
  idempresa?: string | null;
}

interface UsuarioPerfil {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  telefone?: string | null;
  tipo_usuario: 'funcionario' | 'empregador';
  idempresa?: string | null;
  pendente?: boolean;
}

/**
 * Componente principal da Dashboard do Funcionário.
 * Gerencia a exibição e controle do ponto (tracker ao vivo),
 * sumário semanal de horas e o CRUD de registros de trabalho.
 * 
 * @returns {JSX.Element} A interface da tela de funcionário.
 */
export default function FuncionarioDashboard() {

  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Sistema de Toasts para feedback visual
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showPopup = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Estados dos Trabalhos e Modal
  const [activeModal, setActiveModal] = useState<'none' | 'new' | 'edit' | 'delete'>('none');
  const [trabalhos, setTrabalhos] = useState<Trabalho[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [selectedTrabalho, setSelectedTrabalho] = useState<Trabalho | null>(null);
  const [formData, setFormData] = useState({ titulo: '', descricao: '', idprojeto: '', duracao: '', categoria: 'clipboard' });

  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [exportPeriod, setExportPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [listPeriod, setListPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [needsCompanySetup, setNeedsCompanySetup] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [pendingProfile, setPendingProfile] = useState<UsuarioPerfil | null>(null);
  const [companyCode, setCompanyCode] = useState('');

  useEffect(() => {
    if (!supabase) {
      router.push('/');
      return;
    }
    const supabaseClient = supabase;

    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();

        if (error || !session) {
          router.push('/');
          return;
        }

        const currentUser = session.user;
        localStorage.setItem('access_token', session.access_token);
        localStorage.setItem('user', JSON.stringify(currentUser));

        const { data: usuarios } = await api.get('/api/v1/usuarios/');
        const usuario = usuarios.find((item: any) => item.id === currentUser.id || item.email === currentUser.email);
        const appUser = { ...currentUser, perfil: usuario, idempresa: usuario?.idempresa };

        if (usuario?.tipo_usuario === 'empregador') {
          router.push('/admin');
          return;
        }

        setUser(appUser);
        setPendingProfile(usuario || null);

        if (!usuario?.idempresa) {
          setNeedsCompanySetup(true);
          return;
        }

        // Se tem empresa mas está pendente, bloqueia o acesso
        if (usuario?.pendente) {
          setIsPendingApproval(true);
          return;
        }

        setNeedsCompanySetup(false);
        setIsPendingApproval(false);
        fetchProjetos(usuario?.idempresa);
        fetchTrabalhos(currentUser.id);

      } catch (err) {
        console.error("Erro ao checar sessão:", err);
        router.push('/');
      }
    };

    checkUser();

    const { data: authListener } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        router.push('/');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (!timerStartedAt) return;

    const intervalId = window.setInterval(() => {
      setElapsedMs(Date.now() - timerStartedAt);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [timerStartedAt]);

  // Polling: verifica periodicamente se o usuário foi aprovado
  useEffect(() => {
    if (!isPendingApproval || !pendingProfile?.id) return;

    const checkApproval = async () => {
      try {
        const { data: usuarios } = await api.get('/api/v1/usuarios/');
        const usuarioAtual = usuarios.find((u: any) => u.id === pendingProfile.id);

        if (usuarioAtual && !usuarioAtual.pendente) {
          // Aprovado! Recarrega os dados e libera o dashboard
          setIsPendingApproval(false);
          setPendingProfile(usuarioAtual);
          const appUser = { ...user, perfil: usuarioAtual, idempresa: usuarioAtual.idempresa };
          setUser(appUser);
          fetchProjetos(usuarioAtual.idempresa);
          fetchTrabalhos(user?.id || usuarioAtual.id);
          showPopup('Você foi aprovado! Bem-vindo ao sistema.', 'success');
        }
      } catch (err) {
        console.error('Erro ao verificar aprovação:', err);
      }
    };

    // Verifica imediatamente ao entrar na tela
    checkApproval();

    const intervalId = window.setInterval(checkApproval, 15000); // a cada 15 segundos

    return () => window.clearInterval(intervalId);
  }, [isPendingApproval, pendingProfile?.id]);

  /**
   * Busca e filtra todos os trabalhos associados ao ID do usuário atual.
   * @param {string} userId O ID único do usuário autenticado.
   */
  const fetchTrabalhos = async (userId: string) => {
    try {
      const { data } = await api.get('/api/v1/trabalhos/');
      setTrabalhos(data.filter((t: Trabalho) => t.empregador_id === userId));
    } catch (error) {
      console.error('Erro ao buscar trabalhos', error);
    }
  };

  const fetchProjetos = async (idempresa?: string | null) => {
    try {
      const { data } = await api.get('/api/v1/projetos/');
      setProjetos(idempresa ? data.filter((projeto: Projeto) => projeto.idempresa === idempresa) : []);
    } catch (error) {
      console.error('Erro ao buscar projetos', error);
    }
  };

  const getGoogleProfileNames = () => {
    const metadata = user?.user_metadata || {};
    const fullName = String(metadata.full_name || metadata.name || user?.email?.split('@')[0] || 'Usuário').trim();
    const nameParts = fullName.split(' ').filter(Boolean);

    return {
      nome: String(metadata.given_name || nameParts[0] || 'Usuário'),
      sobrenome: String(metadata.family_name || nameParts.slice(1).join(' ') || 'Google'),
    };
  };

  const handleCompleteCompanySetup = async () => {
    if (!user) return;
    const normalizedCode = companyCode.trim();

    if (!normalizedCode) {
      showPopup('Informe o código da empresa.', 'error');
      return;
    }

    setLoading(true);
    try {
      const { data: empresas } = await api.get('/api/v1/empresas/');
      const empresa = empresas.find((item: any) => item.codigoempresa === normalizedCode);

      if (!empresa) {
        showPopup('Código da empresa não encontrado.', 'error');
        return;
      }

      const names = getGoogleProfileNames();
      const payload = {
        nome: pendingProfile?.nome || names.nome,
        sobrenome: pendingProfile?.sobrenome || names.sobrenome,
        email: pendingProfile?.email || user.email,
        telefone: pendingProfile?.telefone || undefined,
        tipo_usuario: pendingProfile?.tipo_usuario || 'funcionario',
        idempresa: empresa.id,
        pendente: true,
      };

      const { data: usuario } = pendingProfile
        ? await api.put(`/api/v1/usuarios/${pendingProfile.id}`, payload)
        : await api.post('/api/v1/usuarios/', { id: user.id, ...payload });

      const appUser = { ...user, perfil: usuario, idempresa: usuario.idempresa };
      setUser(appUser);
      setPendingProfile(usuario);
      setNeedsCompanySetup(false);
      setCompanyCode('');
      // Após vincular, bloqueia o acesso até o admin aprovar
      setIsPendingApproval(true);
    } catch (error) {
      console.error('Erro ao vincular conta Google à empresa', error);
      showPopup('Erro ao vincular conta à empresa.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    setTimerStartedAt(Date.now());
    setElapsedMs(0);
  };

  const stopTimer = () => {
    const finalElapsedMs = timerStartedAt ? Date.now() - timerStartedAt : elapsedMs;
    setTimerStartedAt(null);
    setElapsedMs(finalElapsedMs);
    openModal('new', undefined, formatMsAsTimeValue(finalElapsedMs));
  };

  const parseIntervalToMs = (value?: string | null) => {
    if (!value) return 0;

    const dayMatch = value.match(/(\d+)\s+day/);
    const days = dayMatch ? Number(dayMatch[1]) : 0;
    const timeMatch = value.match(/(\d{1,3}):(\d{2})(?::(\d{2}))?/);
    if (!timeMatch) return 0;

    const hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);
    const seconds = Number(timeMatch[3] || 0);

    return (((days * 24 + hours) * 60 + minutes) * 60 + seconds) * 1000;
  };

  const formatMsAsClock = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds].map((part) => part.toString().padStart(2, '0')).join(':');
  };

  const formatMsAsTimeValue = (ms: number) => {
    return formatMsAsClock(ms);
  };

  const formatIntervalForInput = (value?: string | null) => {
    if (!value) return '';
    const match = value.match(/(\d{1,3}):(\d{2})(?::(\d{2}))?/);
    if (!match) return '';

    const hours = Number(match[1]).toString().padStart(2, '0');
    const minutes = match[2];
    const seconds = match[3] || '00';

    return `${hours}:${minutes}:${seconds}`;
  };

  const formatIntervalForDisplay = (value?: string | null) => {
    const inputValue = formatIntervalForInput(value);
    return inputValue ? inputValue.slice(0, 5) : '--';
  };

  const getWeekDates = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(today.getDate() - today.getDay());

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      return date;
    });
  };

  const isSameDay = (firstDate: Date, secondDate: Date) => {
    return firstDate.getFullYear() === secondDate.getFullYear()
      && firstDate.getMonth() === secondDate.getMonth()
      && firstDate.getDate() === secondDate.getDate();
  };

  const calculateWeekSummary = () => {
    const weekDates = getWeekDates();

    return weekDates.map((date) => {
      return trabalhos.reduce((total, trabalho) => {
        const trabalhoDate = new Date(trabalho.criado_em);
        if (!isSameDay(trabalhoDate, date)) return total;
        return total + parseIntervalToMs(trabalho.duracao);
      }, 0);
    });
  };

  /**
   * Formata a duração em milissegundos para uma string humanamente legível.
   * Ex: 2h 30m ou apenas 45m.
   * @param {number} ms Duração total em milissegundos.
   * @returns {string} String formatada com horas e minutos.
   */
  const formatDuration = (ms: number) => {
    if (ms === 0) return '--';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  };

  const weekDates = getWeekDates();
  const weekData = calculateWeekSummary();
  const totalMs = weekData.reduce((acc, curr) => acc + curr, 0);
  const totalHours = totalMs / (1000 * 60 * 60);
  const progressPercent = Math.min(100, Math.round((totalHours / 40) * 100));
  const currentTimeSpan = formatMsAsClock(elapsedMs);

  /**
   * Retorna placeholder enquanto o registro de expediente não existir no schema atual.
   * @returns {string} String com o horário de entrada formatado ou '--:--' caso não haja registro.
   */
  const formatEntryTime = () => {
    if (!timerStartedAt) return '--:--';
    return new Date(timerStartedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // Filtra trabalhos pelo período selecionado na listagem
  const trabalhosFiltrados = React.useMemo(() => {
    const [yearStr, monthStr] = listPeriod.split('-');
    const filterYear = parseInt(yearStr, 10);
    const filterMonth = parseInt(monthStr, 10) - 1; // 0-indexed
    return trabalhos.filter((t) => {
      const d = new Date(t.criado_em);
      return d.getFullYear() === filterYear && d.getMonth() === filterMonth;
    });
  }, [trabalhos, listPeriod]);

  const getProjetoTitulo = (idprojeto?: string | null) => {
    if (!idprojeto) return 'Sem Projeto';
    return projetos.find(projeto => projeto.id === idprojeto)?.titulo || 'Projeto não encontrado';
  };

  const formatIntervalForApi = (value: string) => {
    if (!value) return undefined;
    return value.length === 5 ? `${value}:00` : value;
  };

  /**
   * Abre o modal e configura os dados do formulário dependendo da ação (novo, editar, deletar).
   * @param {'new' | 'edit' | 'delete'} type O tipo de modal a ser aberto.
   * @param {Trabalho} [trabalho] Os dados do trabalho, caso seja uma edição ou exclusão.
   */
  const openModal = (type: 'new' | 'edit' | 'delete', trabalho?: Trabalho, duracaoInicial = '') => {
    if (trabalho) setSelectedTrabalho(trabalho);
    if (type === 'new') setFormData({ titulo: '', descricao: '', idprojeto: '', duracao: duracaoInicial, categoria: 'clipboard' });
    if (type === 'edit' && trabalho) {
      setFormData({ 
        titulo: trabalho.titulo, 
        descricao: trabalho.descricao || '',
        idprojeto: trabalho.idprojeto || '',
        duracao: formatIntervalForInput(trabalho.duracao),
        categoria: trabalho.categoria || 'clipboard', 
      });
    }
    setActiveModal(type);
  };

  /**
   * Fecha o modal ativo e reseta os estados associados.
   */
  const closeModal = () => {
    setActiveModal('none');
    setSelectedTrabalho(null);
  };

  /**
   * Realiza a criação de um novo registro de trabalho.
   * Utiliza os dados preenchidos no modal e envia via POST para a API.
   */
  const handleCreateWork = async () => {
    setLoading(true);
    try {
      await api.post('/api/v1/trabalhos/', {
        empregador_id: user.id,
        titulo: formData.titulo,
        descricao: formData.descricao,
        idprojeto: formData.idprojeto || undefined,
        categoria: formData.categoria,
        duracao: formatIntervalForApi(formData.duracao),
      });
      await fetchTrabalhos(user.id);
      showPopup('Trabalho registrado com sucesso!', 'success');
      closeModal();
    } catch (error) {
      showPopup('Erro ao registrar trabalho.', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Realiza a atualização de um registro de trabalho existente.
   * Utiliza o ID do trabalho selecionado e envia os novos dados via PUT para a API.
   */
  const handleUpdateWork = async () => {
    if (!selectedTrabalho) return;
    setLoading(true);
    try {
      await api.put(`/api/v1/trabalhos/${selectedTrabalho.id}`, {
        titulo: formData.titulo,
        descricao: formData.descricao,
        idprojeto: formData.idprojeto || null,
        categoria: formData.categoria,
        duracao: formatIntervalForApi(formData.duracao) || null,
      });
      await fetchTrabalhos(user.id);
      showPopup('Trabalho atualizado com sucesso!', 'success');
      closeModal();
    } catch (error) {
      showPopup('Erro ao editar trabalho.', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Deleta o registro de trabalho previamente selecionado.
   * Envia uma requisição DELETE para a API.
   */
  const handleDeleteWork = async () => {
    if (!selectedTrabalho) return;
    setLoading(true);
    try {
      await api.delete(`/api/v1/trabalhos/${selectedTrabalho.id}`);
      await fetchTrabalhos(user.id);
      showPopup('Trabalho deletado com sucesso!', 'success');
      closeModal();
    } catch (error) {
      showPopup('Erro ao excluir trabalho.', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Desloga o usuário atual através da API do Supabase e limpa os dados locais.
   */
  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  /**
   * Retorna o SVG correto dependendo da categoria definida.
   * @param {string} categoria O tipo/nome da categoria do trabalho.
   * @returns {JSX.Element} Ícone SVG correspondente.
   */
  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case 'pencil':
        return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3A7AFE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>;
      case 'people':
        return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
      default: // clipboard
        return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A6651E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path></svg>;
    }
  };

  if (!user) return <p style={{ padding: '40px', textAlign: 'center' }}>Carregando perfil...</p>;

  // Tela de bloqueio para usuários pendentes
  if (isPendingApproval) {
    return (
      <PendingApproval
        userName={pendingProfile?.nome || getGoogleProfileNames().nome}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className={local.layout}>
      
      {/* Feedback Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          padding: '16px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px',
          backgroundColor: toast.type === 'success' ? '#10B981' : '#EF4444', color: '#FFF',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontWeight: 500,
          animation: 'slideIn 0.3s ease-out'
        }}>
          {toast.message}
        </div>
      )}

      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

      <Sidebar 
        user={user} 
        sidebarExpanded={sidebarExpanded} 
        setSidebarExpanded={setSidebarExpanded} 
        handleLogout={handleLogout}
        themeColor="#3A7AFE"
      />

      {/* Conteúdo Principal */}
      <main className={`${local.main} ${sidebarExpanded ? '' : local.sidebarCollapsed}`}>          <div className={local.exportRow}>
            <PeriodFilter period={exportPeriod} onChange={setExportPeriod} />
            <button className={local.exportBtn} onClick={() => {
              const [yearStr, monthStr] = exportPeriod.split('-');
              const year = parseInt(yearStr, 10);
              const month = parseInt(monthStr, 10) - 1; // 0-indexed
              const exported = exportTrabalhosCSV(trabalhos, getProjetoTitulo, 'funcionario', year, month);
              if (!exported) showPopup('Nenhuma tarefa encontrada neste período.', 'error');
            }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Exportar CSV
        </button>
          </div>

        <div className={local.topWidgets}>
          <div className={local.controlPanel}>
             <div className={local.controlInfo}>
              <div className={local.label}>Painel de Controle</div>
              <div className={local.time}>{currentTimeSpan}</div>
              <div className={local.subtitle}>Entrou hoje às: {formatEntryTime()}</div>
            </div>
            <div className={local.controlActions}>
              {timerStartedAt ? (
                <button
                  className={local.btnEncerrar}
                  onClick={stopTimer}
                  disabled={loading}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"></rect></svg>
                  Encerrar
                </button>
              ) : (
                <button
                  className={local.btnIniciar}
                  onClick={startTimer}
                  disabled={loading}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  Iniciar
                </button>
              )}
            </div>
          </div>

          <div className={local.tracker}>
            <h3>Tracker</h3>
            <p>Você está a {progressPercent}% de concluir sua meta semanal de trabalho</p>
            <div className={local.progressTrack}>
              <div className={local.progressFill} style={{ width: `${progressPercent}%`, transition: 'width 0.5s ease' }}></div>
            </div>
            <div className={local.progressLabels}>
              <span>Progresso</span>
              <span>{Math.floor(totalHours)}/40 Horas</span>
            </div>
          </div>
        </div>

        {/* Registros de Trabalho */}
        <div className={local.sectionHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h2 className={local.sectionTitle}>Registros de Trabalho</h2>
            <PeriodFilter period={listPeriod} onChange={setListPeriod} />
          </div>
          <button className={local.btnNovoTrabalho} onClick={() => openModal('new')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Novo trabalho
          </button>
        </div>

        {/* Resumo do período filtrado */}
        {trabalhosFiltrados.length > 0 && (
          <div className={local.periodSummary}>
            <div className={local.summaryItem}>
              <span className={local.summaryLabel}>Tarefas</span>
              <span className={local.summaryValue}>{trabalhosFiltrados.length}</span>
            </div>
            <div className={local.summaryDivider}></div>
            <div className={local.summaryItem}>
              <span className={local.summaryLabel}>Total de Horas</span>
              <span className={local.summaryValue}>{formatDuration(
                trabalhosFiltrados.reduce((acc, t) => acc + parseIntervalToMs(t.duracao), 0)
              )}</span>
            </div>
            <div className={local.summaryDivider}></div>
            <div className={local.summaryItem}>
              <span className={local.summaryLabel}>Média por Tarefa</span>
              <span className={local.summaryValue}>{formatDuration(
                trabalhosFiltrados.reduce((acc, t) => acc + parseIntervalToMs(t.duracao), 0) / trabalhosFiltrados.length
              )}</span>
            </div>
          </div>
        )}

        <div className={local.workList}>
          {trabalhos.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Nenhum trabalho registrado ainda.</p>
          ) : trabalhosFiltrados.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Nenhum trabalho encontrado neste período.</p>
          ) : (
            trabalhosFiltrados.map((trab) => (
              <div key={trab.id} className={local.workItem}>
                <div className={local.itemLeft}>
                  <div className={local.itemIcon}>
                    {getCategoryIcon(trab.categoria || 'clipboard')}
                  </div>
                  <div className={local.itemInfo}>
                    <div className={local.title}>{trab.titulo}</div>
                    <div className={local.subtitle}>{getProjetoTitulo(trab.idprojeto)}</div>
                  </div>
                </div>
                <div className={local.itemRight}>
                  <div className={local.durationBlock}>
                    <div className={local.label}>Duração</div>
                    <div className={local.time}>{formatIntervalForDisplay(trab.duracao)}</div>
                  </div>
                  <div className={local.itemActions}>
                    <button className={local.iconBtn} onClick={() => openModal('edit', trab)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button className={`${local.iconBtn} ${local.delete}`} onClick={() => openModal('delete', trab)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sumário Semanal Dinâmico */}
        <div className={local.summaryCard}>
          <div className={local.summaryHeader}>
            <h3>Sumário semanal</h3>
            <p>Veja a quantidade de horas trabalhadas por você durante essa semana</p>
          </div>

          <div className={local.weekGrid}>
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, idx) => (
              <div key={day} className={`${local.dayCard} ${new Date().getDay() === idx ? local.active : ''}`}>
                <span className={local.dayLabel}>{day} {weekDates[idx].toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                <span className={local.dayValue}>{formatDuration(weekData[idx])}</span>
              </div>
            ))}
            <div className={local.totalCard}>
              <span className={local.dayLabel}>Total da Semana</span>
              <span className={local.dayValue}>{formatDuration(totalMs)}</span>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL EXATO: NOVO / EDITAR */}
      {(activeModal === 'new' || activeModal === 'edit') && (
        <div className={local.modalOverlay} onClick={closeModal}>
          <div className={local.modalContent} onClick={e => e.stopPropagation()}>
            <div className={local.modalHeader}>
              <h2 className={local.modalTitle}>{activeModal === 'new' ? 'Novo trabalho' : 'Editar Trabalho'}</h2>
              <button className={local.closeBtn} onClick={closeModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className={local.formGroup}>
              <label className={local.formLabel}>Título</label>
              <input 
                type="text" 
                className={local.formInput} 
                placeholder="Ex: Correção de Bugs no Backend" 
                value={formData.titulo}
                onChange={e => setFormData({...formData, titulo: e.target.value})}
              />
            </div>

            <div className={local.formGroup}>
              <label className={local.formLabel}>Descrição</label>
              <input 
                type="text" 
                className={local.formInput} 
                placeholder="Ex: Desenvolvimento da Landing Page" 
                value={formData.descricao}
                onChange={e => setFormData({...formData, descricao: e.target.value})}
              />
            </div>

            <div className={local.formRow}>
              <div className={local.formGroup}>
                <label className={local.formLabel}>Duração</label>
                <div className={local.inputWithIcon}>
                  <div className={local.inputIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </div>
                  <input 
                    type="text"
                    inputMode="numeric"
                    placeholder="HH:MM:SS"
                    className={`${local.formInput} ${local.pl}`} 
                    value={formData.duracao}
                    onChange={e => setFormData({...formData, duracao: e.target.value})}
                  />
                </div>
              </div>

              <div className={local.formGroup}>
                <label className={local.formLabel}>Projeto</label>
                <select
                  className={local.formInput}
                  value={formData.idprojeto}
                  onChange={e => setFormData({...formData, idprojeto: e.target.value})}
                >
                  <option value="">Sem projeto</option>
                  {projetos.map(projeto => (
                    <option key={projeto.id} value={projeto.id}>{projeto.titulo}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={local.formGroup}>
              <label className={local.formLabel}>Categoria</label>
              <div className={local.projectTypes}>
                  <button 
                    type="button"
                    className={`${local.typeBtn} ${formData.categoria === 'clipboard' ? local.active : ''}`}
                    onClick={() => setFormData({...formData, categoria: 'clipboard'})}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path></svg>
                  </button>
                  <button 
                    type="button"
                    className={`${local.typeBtn} ${formData.categoria === 'pencil' ? local.active : ''}`}
                    onClick={() => setFormData({...formData, categoria: 'pencil'})}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                  </button>
                  <button 
                    type="button"
                    className={`${local.typeBtn} ${formData.categoria === 'people' ? local.active : ''}`}
                    onClick={() => setFormData({...formData, categoria: 'people'})}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </button>
                </div>
            </div>

            <button 
              className={local.modalActionBtn} 
              onClick={activeModal === 'new' ? handleCreateWork : handleUpdateWork}
              disabled={loading || !formData.titulo}
            >
              {loading ? (activeModal === 'new' ? 'Criando...' : 'Salvando...') : (activeModal === 'new' ? 'Criar trabalho' : 'Editar trabalho')}
            </button>
          </div>
        </div>
      )}

      {/* MODAL EXATO: DELETAR */}
      {activeModal === 'delete' && (
        <div className={local.modalOverlay} onClick={closeModal}>
          <div className={local.deleteModalContent} onClick={e => e.stopPropagation()}>
            <div className={local.alertIconWrapper}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            
            <h2 className={local.deleteTitle}>Deletar trabalho?</h2>
            <p className={local.deleteText}>Você tem certeza que quer excluir esse trabalho? Essa ação não pode ser desfeita.</p>

            <button className={local.modalActionBtn} onClick={handleDeleteWork} disabled={loading}>
              {loading ? 'Deletando...' : 'Deletar'}
            </button>
            <button className={local.cancelBtn} onClick={closeModal}>Cancelar</button>
          </div>
        </div>
      )}

      {needsCompanySetup && (
        <div className={local.modalOverlay}>
          <div className={local.modalContent} onClick={e => e.stopPropagation()}>
            <div className={local.modalHeader}>
              <h2 className={local.modalTitle}>Vincular empresa</h2>
            </div>

            <div className={local.formGroup}>
              <label className={local.formLabel}>Código da empresa</label>
              <input
                type="text"
                className={local.formInput}
                placeholder="Digite o código compartilhado pela empresa"
                value={companyCode}
                onChange={e => setCompanyCode(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              className={local.modalActionBtn}
              onClick={handleCompleteCompanySetup}
              disabled={loading || !companyCode.trim()}
            >
              {loading ? 'Vinculando...' : 'Vincular conta'}
            </button>
            <button className={local.cancelBtn} onClick={handleLogout} disabled={loading}>
              Sair
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
