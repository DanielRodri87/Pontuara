'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import local from './funcionario.module.css';
import { supabase } from '@/services/supabase';

// Tipagens conforme o banco de dados e backend
interface Trabalho {
  id: string;
  empregador_id: string;
  titulo: string;
  projeto?: string;
  categoria?: string;
  descricao?: string; // Usaremos para armazenar a "Duração"
  criado_em: string;
}

interface Expediente {
  id: string;
  funcionario_id: string;
  data_hora_inicio: string;
  data_hora_fim: string | null;
}

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
  const [selectedTrabalho, setSelectedTrabalho] = useState<Trabalho | null>(null);
  const [formData, setFormData] = useState({ titulo: '', projeto: '', duracao: '', categoria: 'clipboard' });

  // Estados dos Expedientes e Tracker ao Vivo
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [activeExpediente, setActiveExpediente] = useState<Expediente | null>(null);
  const [currentTimeSpan, setCurrentTimeSpan] = useState<string>('00:00:00');

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          router.push('/');
          return;
        }

        const currentUser = session.user;
        localStorage.setItem('access_token', session.access_token);
        localStorage.setItem('user', JSON.stringify(currentUser));

        setUser(currentUser);
        fetchTrabalhos(currentUser.id);
        fetchExpedientes(currentUser.id);

      } catch (err) {
        console.error("Erro ao checar sessão:", err);
        router.push('/');
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
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
    let interval: NodeJS.Timeout;
    if (activeExpediente) {
      interval = setInterval(() => {
        const start = new Date(activeExpediente.data_hora_inicio).getTime();
        const now = new Date().getTime();
        const diff = now - start;
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setCurrentTimeSpan(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    } else {
      setCurrentTimeSpan('00:00:00');
    }
    return () => clearInterval(interval);
  }, [activeExpediente]);

  const fetchTrabalhos = async (userId: string) => {
    try {
      const { data } = await api.get('/api/v1/trabalhos/');
      setTrabalhos(data.filter((t: Trabalho) => t.empregador_id === userId));
    } catch (error) {
      console.error('Erro ao buscar trabalhos', error);
    }
  };

  const fetchExpedientes = async (userId: string) => {
    try {
      const { data } = await api.get('/api/v1/expedientes/');
      const userExpedientes = data.filter((e: Expediente) => e.funcionario_id === userId);
      setExpedientes(userExpedientes);
      
      const active = userExpedientes.find((e: Expediente) => !e.data_hora_fim);
      setActiveExpediente(active || null);
    } catch (error) {
      console.error('Erro ao buscar expedientes', error);
    }
  };

  const handleToggleExpediente = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (activeExpediente) {
        await api.put(`/api/v1/expedientes/${activeExpediente.id}`, { data_hora_fim: new Date().toISOString() });
        showPopup('Expediente encerrado com sucesso!', 'success');
      } else {
        await api.post('/api/v1/expedientes/', { funcionario_id: user.id, data_hora_inicio: new Date().toISOString() });
        showPopup('Expediente iniciado! Bom trabalho.', 'success');
      }
      await fetchExpedientes(user.id);
    } catch (error) {
      showPopup('Erro ao registrar o ponto.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateWeekSummary = () => {
    const today = new Date();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay());
    sunday.setHours(0, 0, 0, 0);

    const weekDaysMs = [0, 0, 0, 0, 0, 0, 0];
    
    expedientes.forEach(exp => {
      const start = new Date(exp.data_hora_inicio);
      if (start >= sunday) {
        const end = exp.data_hora_fim ? new Date(exp.data_hora_fim) : new Date();
        const diff = end.getTime() - start.getTime();
        weekDaysMs[start.getDay()] += diff;
      }
    });

    return weekDaysMs;
  };

  const formatDuration = (ms: number) => {
    if (ms === 0) return '--';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  };

  const weekData = calculateWeekSummary();
  const totalMs = weekData.reduce((acc, curr) => acc + curr, 0);
  const totalHours = totalMs / (1000 * 60 * 60);
  const progressPercent = Math.min(100, Math.round((totalHours / 40) * 100));

  const formatEntryTime = () => {
    if (!activeExpediente) return '--:--';
    const start = new Date(activeExpediente.data_hora_inicio);
    return `${start.getHours().toString().padStart(2, '0')}h ${start.getMinutes().toString().padStart(2, '0')}m`;
  };

  const openModal = (type: 'new' | 'edit' | 'delete', trabalho?: Trabalho) => {
    if (trabalho) setSelectedTrabalho(trabalho);
    if (type === 'new') setFormData({ titulo: '', projeto: '', duracao: '', categoria: 'clipboard' });
    if (type === 'edit' && trabalho) {
      setFormData({ 
        titulo: trabalho.titulo, 
        projeto: trabalho.projeto || '', 
        duracao: trabalho.descricao || '', 
        categoria: trabalho.categoria || 'clipboard', 
      });
    }
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal('none');
    setSelectedTrabalho(null);
  };

  const handleCreateWork = async () => {
    setLoading(true);
    try {
      await api.post('/api/v1/trabalhos/', {
        empregador_id: user.id,
        titulo: formData.titulo,
        projeto: formData.projeto,
        categoria: formData.categoria,
        descricao: formData.duracao
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

  const handleUpdateWork = async () => {
    if (!selectedTrabalho) return;
    setLoading(true);
    try {
      await api.put(`/api/v1/trabalhos/${selectedTrabalho.id}`, {
        titulo: formData.titulo,
        projeto: formData.projeto,
        categoria: formData.categoria,
        descricao: formData.duracao
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

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

      {/* Sidebar Lateral */}
      <aside className={local.sidebar}>
        <div>
          <div className={local.brand}>
            <img src="/images/Logo.svg" alt="Pontuara Logo" />
          </div>
          <nav>
            <button className={local.navItem}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"></rect><rect x="14" y="3" width="7" height="5" rx="1"></rect><rect x="14" y="12" width="7" height="9" rx="1"></rect><rect x="3" y="16" width="7" height="5" rx="1"></rect></svg>
              Dashboard
            </button>
          </nav>
        </div>

        <div className={local.sidebarBottom}>
          <div className={local.profileCard}>
            <img src={user.user_metadata?.avatar_url || "/images/profile.svg"} alt="avatar" className={local.avatar} />
            <div className={local.profileInfo}>
              <span className={local.name}>{user.user_metadata?.nome || user.email.split('@')[0]}</span>
              <span className={local.role}>{user.user_metadata?.tipo_usuario === 'empregador' ? 'Gestor' : 'Funcionário'}</span>
            </div>
          </div>
          <button className={local.logoutBtn} onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className={local.main}>
        <button className={local.exportBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Exportar CSV
        </button>

        <div className={local.topWidgets}>
          <div className={local.controlPanel}>
             <div className={local.controlInfo}>
              <div className={local.label}>Painel de Controle</div>
              <div className={local.time}>{currentTimeSpan}</div>
              <div className={local.subtitle}>Entrou hoje às: {formatEntryTime()}</div>
            </div>
            <div className={local.controlActions}>
              <button 
                className={activeExpediente ? local.btnEncerrar : local.btnIntervalo} 
                style={!activeExpediente ? { backgroundColor: '#3A7AFE', color: '#FFF' } : {}}
                onClick={handleToggleExpediente}
                disabled={loading}
              >
                {activeExpediente ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><rect x="9" y="9" width="6" height="6"></rect></svg>
                    Encerrar Expediente
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    Iniciar Expediente
                  </>
                )}
              </button>
            </div>
          </div>

          <div className={local.tracker}>
            <h3>Tracker</h3>
            <p>Você está a {progressPercent}% de concluir sua meta semanal de trabalho</p>
            <div className={local.progressTrack}>
              <div className={local.progressFill} style={{ width: `${progressPercent}%`, transition: 'width 0.5s ease' }}></div>
            </div>
            <div className={local.progressLabels}>
              <span>Progress</span>
              <span>{Math.floor(totalHours)}/40 Hours</span>
            </div>
          </div>
        </div>

        {/* Registros de Trabalho */}
        <div className={local.sectionHeader}>
          <h2 className={local.sectionTitle}>Registros de Trabalho</h2>
          <button className={local.btnNovoTrabalho} onClick={() => openModal('new')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Novo trabalho
          </button>
        </div>

        <div className={local.workList}>
          {trabalhos.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Nenhum trabalho registrado ainda.</p>
          ) : (
            trabalhos.map((trab) => (
              <div key={trab.id} className={local.workItem}>
                <div className={local.itemLeft}>
                  <div className={local.itemIcon}>
                    {getCategoryIcon(trab.categoria || 'clipboard')}
                  </div>
                  <div className={local.itemInfo}>
                    <div className={local.title}>{trab.titulo}</div>
                    <div className={local.subtitle}>{trab.projeto || 'Sem Projeto'}</div>
                  </div>
                </div>
                <div className={local.itemRight}>
                  <div className={local.durationBlock}>
                    <div className={local.label}>Duration</div>
                    <div className={local.time}>{trab.descricao || '--'}</div>
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
                <span className={local.dayLabel}>{day}</span>
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
              <label className={local.formLabel}>Nome do projeto</label>
              <input 
                type="text" 
                className={local.formInput} 
                placeholder="Ex: Projeto Pontuará" 
                value={formData.projeto}
                onChange={e => setFormData({...formData, projeto: e.target.value})}
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
                    className={`${local.formInput} ${local.pl}`} 
                    placeholder="Selecione" 
                    value={formData.duracao}
                    onChange={e => setFormData({...formData, duracao: e.target.value})}
                  />
                </div>
              </div>

              <div className={local.formGroup}>
                <label className={local.formLabel}>Projeto</label>
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

    </div>
  );
}