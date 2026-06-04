'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/services/supabase';
import { api } from '@/services/api';
import Sidebar from '@/components/sidebar/Sidebar';
import { exportTrabalhosCSV } from '@/services/csv';
import PeriodFilter from '@/components/periodFilter/PeriodFilter';
import BadgeSelector from '@/components/badgeSelector/BadgeSelector';
import { ICONS_DATA, COLORS_DATA, encodeProjetoBadget, decodeProjetoBadget } from '@/utils/badgeData';
import { Users, Clock, Timer, ClipboardList } from 'lucide-react';
import local from './admin.module.css';

interface Projeto {
  id: string;
  titulo: string;
  descricao?: string | null;
  badgets?: string | number | null;
  idempresa?: string | null;
}

interface Usuario {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  tipo_usuario: 'funcionario' | 'empregador';
  idempresa?: string | null;
  pendente?: boolean;
  criado_em: string;
}

interface Trabalho {
  id: string;
  empregador_id: string;
  titulo: string;
  descricao?: string | null;
  categoria?: string | null;
  idprojeto?: string | null;
  duracao?: string | null;
  criado_em: string;
}

interface IndividualData {
  usuario: Usuario;
  trabalhos: Trabalho[];
  tarefas: number;
  horasMs: number;
}

const PROJECT_COLORS = ['#2563EB', '#14B8A6', '#F97316', '#8B5CF6', '#EC4899', '#22C55E', '#0EA5E9', '#F59E0B'];

/**
 * Admin dashboard page for employers.
 */
export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Toast for visual feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Modals
  const [activeModal, setActiveModal] = useState<'none' | 'new' | 'edit' | 'delete' | 'indivDetails'>('none');
  const [formData, setFormData] = useState({ titulo: '', descricao: '', badgets: ICONS_DATA[0].id, badgetColor: COLORS_DATA[0].id });
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [trabalhos, setTrabalhos] = useState<Trabalho[]>([]);
  const [selectedProjeto, setSelectedProjeto] = useState<Projeto | null>(null);
  const [loading, setLoading] = useState(false);

  // CSV export period
  const [geralExportPeriod, setGeralExportPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [indivExportPeriod, setIndivExportPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Overall chart
  const [chartTab, setChartTab] = useState<'Horas' | 'Produtividade'>('Horas');

  // Individual profile
  const [indivIndex, setIndivIndex] = useState(0);

  useEffect(() => {
    setIndivIndex(0);
  }, [usuarios.length]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        if (!supabase) {
          router.push('/');
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          router.push('/');
          return;
        }

        const { data: usuarios } = await api.get('/api/v1/usuarios/');
        const usuario = usuarios.find((item: any) => item.id === session.user.id || item.email === session.user.email);
        const appUser = { ...session.user, perfil: usuario, idempresa: usuario?.idempresa };

        if (usuario?.tipo_usuario !== 'empregador') {
          router.push('/funcionario');
          return;
        }

        setUser(appUser);
        await fetchDashboardData(usuario?.idempresa);
      } catch (err) {
        console.error(err);
        router.push('/');
      }
    };
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/');
  };

  const openModal = (type: 'new' | 'edit' | 'delete' | 'indivDetails', proj?: any) => {
    if (proj && type === 'edit') {
      const badget = getProjetoBadget(proj.badgets);
      setSelectedProjeto(proj);
      setFormData({ titulo: proj.titulo, descricao: proj.descricao || '', badgets: badget.icon.id, badgetColor: badget.color.id });
    } else if (type === 'new') {
      setSelectedProjeto(null);
      setFormData({ titulo: '', descricao: '', badgets: ICONS_DATA[0].id, badgetColor: COLORS_DATA[0].id });
    } else if (proj && type === 'delete') {
      setSelectedProjeto(proj);
    }
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal('none');
    setSelectedProjeto(null);
  };

  const getProjetoBadget = (badgets?: string | number | null) => {
    return decodeProjetoBadget(badgets);
  };

  const encodeBadget = () => {
    return encodeProjetoBadget(Number(formData.badgets), Number(formData.badgetColor));
  };

  const fetchDashboardData = async (idempresa?: string | null) => {
    try {
      const [{ data: projetosData }, { data: usuariosData }, { data: trabalhosData }] = await Promise.all([
        api.get('/api/v1/projetos/'),
        api.get('/api/v1/usuarios/'),
        api.get('/api/v1/trabalhos/'),
      ]);

      const usuariosEmpresa = idempresa ? usuariosData.filter((usuario: Usuario) => usuario.idempresa === idempresa) : [];
      const projetosEmpresa = idempresa ? projetosData.filter((projeto: Projeto) => projeto.idempresa === idempresa) : [];
      const usuarioIds = new Set(usuariosEmpresa.map((usuario: Usuario) => usuario.id));
      const trabalhosEmpresa = trabalhosData.filter((trabalho: Trabalho) => usuarioIds.has(trabalho.empregador_id));

      setUsuarios(usuariosEmpresa);
      setProjetos(projetosEmpresa);
      setTrabalhos(trabalhosEmpresa);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard', error);
    }
  };

  const handleCreateProjeto = async () => {
    setLoading(true);
    try {
      await api.post('/api/v1/projetos/', {
        titulo: formData.titulo,
        descricao: formData.descricao || undefined,
        badgets: encodeBadget(),
        idempresa: user?.idempresa || undefined,
      });
      await fetchDashboardData(user?.idempresa);
      closeModal();
    } catch (error) {
      console.error('Erro ao criar projeto', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProjeto = async () => {
    if (!selectedProjeto) return;
    setLoading(true);
    try {
      await api.put(`/api/v1/projetos/${selectedProjeto.id}`, {
        titulo: formData.titulo,
        descricao: formData.descricao || null,
        badgets: encodeBadget(),
        idempresa: selectedProjeto.idempresa || user?.idempresa || null,
      });
      await fetchDashboardData(user?.idempresa);
      closeModal();
    } catch (error) {
      console.error('Erro ao editar projeto', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProjeto = async () => {
    if (!selectedProjeto) return;
    setLoading(true);
    try {
      await api.delete(`/api/v1/projetos/${selectedProjeto.id}`);
      await fetchDashboardData(user?.idempresa);
      closeModal();
    } catch (error) {
      console.error('Erro ao deletar projeto', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUsuario = async (usuarioId: string) => {
    setLoading(true);
    try {
      await api.put(`/api/v1/usuarios/${usuarioId}`, { pendente: false });
      await fetchDashboardData(user?.idempresa);
    } catch (error) {
      console.error('Erro ao aprovar usuário', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectUsuario = async (usuarioId: string) => {
    setLoading(true);
    try {
      await api.delete(`/api/v1/usuarios/${usuarioId}`);
      await fetchDashboardData(user?.idempresa);
    } catch (error) {
      console.error('Erro ao recusar usuário', error);
    } finally {
      setLoading(false);
    }
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

  const formatDuration = (ms: number) => {
    if (!ms) return '--';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  };

  const formatDurationShort = (ms: number) => {
    const hours = ms / (1000 * 60 * 60);
    return `${hours.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}h`;
  };

  const getWeekDates = () => {
    const today = new Date();
    const mondayOffset = today.getDay() === 0 ? -6 : 1 - today.getDay();
    const weekStart = new Date(today);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(today.getDate() + mondayOffset);

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

  const isSameMonth = (date: Date, reference: Date) => {
    return date.getFullYear() === reference.getFullYear() && date.getMonth() === reference.getMonth();
  };

  const funcionarios = usuarios.filter((usuario) => usuario.tipo_usuario === 'funcionario');
  const funcionariosAtivos = funcionarios.filter((usuario) => !usuario.pendente);
  const funcionariosPendentes = funcionarios.filter((usuario) => usuario.pendente);
  const totalTrabalhosMs = trabalhos.reduce((total, trabalho) => total + parseIntervalToMs(trabalho.duracao), 0);
  const trabalhosMes = trabalhos.filter((trabalho) => isSameMonth(new Date(trabalho.criado_em), new Date()));
  const totalMensalMs = trabalhosMes.reduce((total, trabalho) => total + parseIntervalToMs(trabalho.duracao), 0);
  const tempoMedioTrabalhoMs = trabalhos.length ? totalTrabalhosMs / trabalhos.length : 0;

  const weekDates = getWeekDates();
  const horasPorDia = weekDates.map((date) => {
    const totalMs = trabalhos.reduce((total, trabalho) => {
      const trabalhoDate = new Date(trabalho.criado_em);
      if (!isSameDay(trabalhoDate, date)) return total;
      return total + parseIntervalToMs(trabalho.duracao);
    }, 0);

    return {
      label: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase(),
      value: totalMs / (1000 * 60 * 60),
      color: '#2563EB',
    };
  });

  const horasPorProjeto = projetos.map((projeto, index) => {
    const totalMs = trabalhos.reduce((total, trabalho) => {
      if (trabalho.idprojeto !== projeto.id) return total;
      return total + parseIntervalToMs(trabalho.duracao);
    }, 0);

    return {
      label: projeto.titulo,
      value: totalMs / (1000 * 60 * 60),
      color: PROJECT_COLORS[index % PROJECT_COLORS.length],
    };
  }).filter((item) => item.value > 0);

  const chartData = chartTab === 'Horas' ? horasPorDia : horasPorProjeto;
  const maxDataValue = Math.max(...chartData.map((item) => item.value), 1);
  const maxChartValue = Math.ceil((maxDataValue * 1.2) / 5) * 5 || 5;

  const individualData: IndividualData[] = funcionariosAtivos.map((usuario) => {
    const trabalhosUsuario = trabalhos.filter((trabalho) => trabalho.empregador_id === usuario.id);
    const horasMs = trabalhosUsuario.reduce((total, trabalho) => total + parseIntervalToMs(trabalho.duracao), 0);

    return {
      usuario,
      trabalhos: trabalhosUsuario,
      tarefas: trabalhosUsuario.length,
      horasMs,
    };
  });
  const currentIndiv = individualData[indivIndex] || null;

  return (
    <div className={local.layout}>
      <Sidebar
        user={user}
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
        handleLogout={handleLogout}
        themeColor="#3A7AFE"
        showCode={true}
      />

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          padding: '16px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px',
          backgroundColor: toast.type === 'success' ? '#10B981' : '#EF4444', color: '#FFF',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontWeight: 500,
          animation: 'slideInToast 0.3s ease-out'
        }}>
          {toast.message}
        </div>
      )}

      <style>{`@keyframes slideInToast { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

      <main className={`${local.main} ${sidebarExpanded ? '' : local.sidebarCollapsed}`}>

        {/* Top cards */}
        <div className={local.topCards}>
          <div className={local.statCard}>
            <div className={local.cardHeader}>
              <div className={local.cardIcon} style={{ color: '#3A7AFE', display: 'flex', alignItems: 'center' }}>
                <Users size={20} />
              </div>
            </div>
            <div className={local.cardTitle}>Colaboradores Ativos</div>
            <div className={local.cardValue}>{funcionariosAtivos.length}</div>
          </div>

          <div className={local.statCard}>
            <div className={local.cardHeader}>
              <div className={local.cardIcon} style={{ color: '#3A7AFE', display: 'flex', alignItems: 'center' }}>
                <Clock size={20} />
              </div>
            </div>
            <div className={local.cardTitle}>Horas Mensais Totais</div>
            <div className={local.cardValue}>{formatDurationShort(totalMensalMs)}</div>
          </div>

          <div className={local.statCard}>
            <div className={local.cardHeader}>
              <div className={local.cardIcon} style={{ color: '#3A7AFE', display: 'flex', alignItems: 'center' }}>
                <Timer size={18} />
              </div>
            </div>
            <div className={local.cardTitle}>Tempo Médio de Trabalhos Cadastrados</div>
            <div className={local.cardValue}>{formatDuration(tempoMedioTrabalhoMs)}</div>
          </div>

          <div className={local.statCard}>
            <div className={local.cardHeader}>
              <div className={local.cardIcon} style={{ color: '#3A7AFE', display: 'flex', alignItems: 'center' }}>
                <ClipboardList size={20} />
              </div>
            </div>
            <div className={local.cardTitle}>Aprovações Pendentes</div>
            <div className={local.cardValue}>{funcionariosPendentes.length}</div>
          </div>
        </div>

        {/* Projects */}
        <div className={local.sectionHeader}>
          <h2 className={local.sectionTitle}>Projetos</h2>
          <button className={local.btnNovo} onClick={() => openModal('new')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Novo projeto
          </button>
        </div>

        <div className={local.projectList}>
          {projetos.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Nenhum projeto cadastrado ainda.</p>
          ) : projetos.map(proj => (
            <div key={proj.id} className={local.projectItem}>
              <div className={local.projectLeft}>
                <div className={local.projectIcon} style={{ 
                  color: getProjetoBadget(proj.badgets).color.hex,
                  background: 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {React.createElement(getProjetoBadget(proj.badgets).icon.component, { size: 20 })}
                </div>
                <div className={local.projectInfo}>
                  <div className={local.title}>{proj.titulo}</div>
                  <div className={local.desc}>{proj.descricao || 'Sem descrição'}</div>
                </div>
              </div>
              <div className={local.projectActions}>
                <button className={local.iconBtn} onClick={() => openModal('edit', proj)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button className={`${local.iconBtn} ${local.delete}`} onClick={() => openModal('delete', proj)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard grid (charts) */}
        <div className={local.dashboardGrid}>
          {/* Overall */}
          <div className={local.geralCard}>
            <div className={local.geralHeader}>
              <h3>Geral</h3>
              <div className={local.dateNav}>
                <button><img src="/images/tempograficos.svg" alt="Prev" /></button>
                <span>
                  {weekDates[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  {' - '}
                  {weekDates[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </span>
                <button><img src="/images/tempograficos.svg" alt="Next" style={{ transform: 'scaleX(-1)' }} /></button>
              </div>
            </div>

            <div className={local.geralControls}>
              <span className={local.subtitle}>Comportamento geral</span>
              <div className={local.chartTabs}>
                {(['Horas', 'Produtividade'] as const).map(tab => (
                  <button
                    key={tab}
                    className={`${local.tabBtn} ${chartTab === tab ? local.active : ''}`}
                    onClick={() => setChartTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className={local.chartContainer}>
              <div className={local.yAxis}>
                <span>{Math.ceil(maxChartValue)}H</span>
                <span>{Math.ceil(maxChartValue * 0.8)}H</span>
                <span>{Math.ceil(maxChartValue * 0.6)}H</span>
                <span>{Math.ceil(maxChartValue * 0.4)}H</span>
                <span>{Math.ceil(maxChartValue * 0.2)}H</span>
                <span>0H</span>
              </div>
              <div className={local.gridLines}>
                <div className={local.gridLine}></div>
                <div className={`${local.gridLine} ${local.dashed}`}></div>
                <div className={`${local.gridLine} ${local.dashed}`}></div>
                <div className={`${local.gridLine} ${local.dashed}`}></div>
                <div className={`${local.gridLine} ${local.dashed}`}></div>
                <div className={local.gridLine}></div>
              </div>

              {chartData.length === 0 ? (
                <div className={local.emptyChart}>Nenhuma hora cadastrada para exibir.</div>
              ) : chartData.map((item) => {
                const val = item.value;
                const heightPercent = (val / maxChartValue) * 100;
                return (
                  <div key={item.label} className={local.chartBarWrapper}>
                    <div className={local.chartBar} style={{ height: `${heightPercent}%`, backgroundColor: item.color }} title={`${item.label}: ${val.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}h`}></div>
                    <span className={local.chartLabel}>{item.label}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 24 }}>
              <PeriodFilter period={geralExportPeriod} onChange={setGeralExportPeriod} />
              <button className={local.btnExportar} style={{ marginTop: 0, width: 'auto', flex: 1 }} onClick={() => {
              const [yearStr, monthStr] = geralExportPeriod.split('-');
              const year = parseInt(yearStr, 10);
              const month = parseInt(monthStr, 10) - 1;
              const getProjNome = (idprojeto?: string | null) => {
                if (!idprojeto) return 'Sem Projeto';
                return projetos.find(p => p.id === idprojeto)?.titulo || 'Projeto não encontrado';
              };
              const exported = exportTrabalhosCSV(trabalhos, getProjNome, 'geral', year, month);
              if (!exported) showToast('Nenhuma tarefa encontrada neste período.', 'error');
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Exportar CSV
            </button>
            </div>
          </div>

          {/* Individual */}
          <div className={local.indivCard}>
            <h3>Individual</h3>

            {currentIndiv ? (
              <>
                <div className={local.indivProfile}>
                  <div className={local.indivAvatarWrapper}>
                    <img src="/images/profile.svg" alt="Avatar" className={local.indivAvatar} />
                  </div>
                  <div className={local.indivName}>{currentIndiv.usuario.nome} {currentIndiv.usuario.sobrenome}</div>
                  <div className={local.indivRole}>{currentIndiv.usuario.email}</div>
                </div>

                <div className={local.indivNav}>
                  <button
                    className={local.navArrow}
                    onClick={() => setIndivIndex(prev => prev > 0 ? prev - 1 : Math.max(individualData.length - 1, 0))}
                  >
                    <img src="/images/tempograficos.svg" alt="Prev" />
                  </button>
                  <button
                    className={local.navArrow}
                    onClick={() => setIndivIndex(prev => prev < individualData.length - 1 ? prev + 1 : 0)}
                  >
                    <img src="/images/tempograficos.svg" alt="Next" style={{ transform: 'scaleX(-1)' }} />
                  </button>
                </div>

                <div className={local.indivStats}>
                  <div className={local.statRow}>
                    <div className={local.statLabel} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Timer size={20} />
                      Trabalhos
                    </div>
                    <div className={local.statVal}>{currentIndiv.tarefas}</div>
                  </div>
                  <div className={local.statRow}>
                    <div className={local.statLabel} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={20} />
                      Horas Trabalhadas
                    </div>
                    <div className={local.statVal}>{formatDuration(currentIndiv.horasMs)}</div>
                  </div>
                </div>

                <button className={local.btnVisualizar} onClick={() => openModal('indivDetails')}>Visualizar mais</button>
              </>
            ) : (
              <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center' }}>Nenhum funcionário disponível.</p>
            )}
          </div>
        </div>

        {/* Pending approvals */}
        <div className={local.approvalsCard}>
          <h3>Aprovações Pendentes</h3>
          <table className={local.table}>
            <thead>
              <tr>
                <th>COLABORADOR</th>
                <th>DATA SOLICITAÇÃO</th>
                <th>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {funcionariosPendentes.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ color: '#6b7280', textAlign: 'center' }}>Nenhuma aprovação pendente.</td>
                </tr>
              ) : funcionariosPendentes.map((funcionario) => (
                <tr key={funcionario.id}>
                  <td>
                    <div className={local.colabCell}>
                      <img src="/images/profile.svg" alt={funcionario.nome} className={local.colabAvatar} />
                      <div className={local.colabInfo}>
                        <span className={local.name}>{funcionario.nome} {funcionario.sobrenome}</span>
                        <span className={local.email}>{funcionario.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>{new Date(funcionario.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td>
                    <div className={local.actionBtns}>
                      <button className={local.actionBtn} onClick={() => handleApproveUsuario(funcionario.id)} disabled={loading}><img src="/images/aceitar.svg" alt="Aceitar" /></button>
                      <button className={local.actionBtn} onClick={() => handleRejectUsuario(funcionario.id)} disabled={loading}><img src="/images/recusar.svg" alt="Recusar" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>

      {/* Project CRUD modals */}
      {(activeModal === 'new' || activeModal === 'edit') && (
        <div className={local.modalOverlay} onClick={closeModal}>
          <div className={local.modalContent} onClick={e => e.stopPropagation()}>
            <div className={local.modalHeader}>
              <h2 className={local.modalTitle}>{activeModal === 'new' ? 'Novo projeto' : 'Editar Projeto'}</h2>
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
                onChange={e => setFormData({ ...formData, titulo: e.target.value })}
              />
            </div>

            <div className={local.formGroup}>
              <label className={local.formLabel}>Descrição</label>
              <input
                type="text"
                className={local.formInput}
                placeholder="Ex: Projeto Pontuará"
                value={formData.descricao}
                onChange={e => setFormData({ ...formData, descricao: e.target.value })}
              />
            </div>

            <BadgeSelector
              selectedIconId={Number(formData.badgets)}
              selectedColorId={Number(formData.badgetColor)}
              onIconChange={(id) => setFormData({ ...formData, badgets: id })}
              onColorChange={(id) => setFormData({ ...formData, badgetColor: id })}
            />

            <button
              className={local.modalActionBtn}
              onClick={activeModal === 'new' ? handleCreateProjeto : handleUpdateProjeto}
              disabled={loading || !formData.titulo}
            >
              {loading ? 'Salvando...' : activeModal === 'new' ? 'Criar projeto' : 'Editar projeto'}
            </button>
          </div>
        </div>
      )}

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

            <h2 className={local.deleteTitle}>Deletar projeto?</h2>
            <p className={local.deleteText}>Você tem certeza que quer excluir esse projeto? Essa ação não pode ser desfeita.</p>

            <button className={local.modalActionBtn} onClick={handleDeleteProjeto} disabled={loading}>
              {loading ? 'Deletando...' : 'Deletar'}
            </button>
            <button className={local.cancelBtn} onClick={closeModal}>Cancelar</button>
          </div>
        </div>
      )}

      {activeModal === 'indivDetails' && currentIndiv && (
        <div className={local.modalOverlay} onClick={closeModal}>
          <div className={local.indivModalContent} onClick={e => e.stopPropagation()}>
            <button className={local.closeBtn} onClick={closeModal}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <div className={local.indivAvatarWrapper}>
              <img src="/images/profile.svg" alt="Avatar" className={local.indivAvatar} />
            </div>
            <div className={local.indivName}>{currentIndiv.usuario.nome} {currentIndiv.usuario.sobrenome}</div>
            <div className={local.indivRole} style={{ marginBottom: 24 }}>{currentIndiv.usuario.email}</div>

            <div className={local.indivStats}>
              <div className={local.statRow}>
                <div className={local.statLabel} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Timer size={20} />
                  Trabalhos
                </div>
                <div className={local.statVal}>{currentIndiv.tarefas}</div>
              </div>
              <div className={local.statRow}>
                <div className={local.statLabel} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={20} />
                  Horas Trabalhadas
                </div>
                <div className={local.statVal}>{formatDuration(currentIndiv.horasMs)}</div>
              </div>
            </div>

            <div className={local.workListTitle}>Trabalhos cadastrados</div>
            <div className={local.workListModal}>
              {currentIndiv.trabalhos.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '13px' }}>Nenhum trabalho cadastrado.</p>
              ) : currentIndiv.trabalhos.map(trabalho => {
                const projeto = projetos.find((proj) => proj.id === trabalho.idprojeto);

                return (
                <div key={trabalho.id} className={local.projectItem} style={{ padding: '12px 16px' }}>
                  <div className={local.projectLeft}>
                    <div className={local.projectIcon} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', color: getProjetoBadget(projeto?.badgets).color.hex }}>
                      {React.createElement(getProjetoBadget(projeto?.badgets).icon.component, { size: 16 })}
                    </div>
                    <div className={local.projectInfo}>
                      <div className={local.title}>{trabalho.titulo}</div>
                      <div className={local.desc} style={{ fontSize: 10 }}>
                        {projeto?.titulo || 'Sem projeto'} - {formatDuration(parseIntervalToMs(trabalho.duracao))}
                      </div>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto', width: '100%' }}>
              <PeriodFilter period={indivExportPeriod} onChange={setIndivExportPeriod} />
              <button className={local.btnExportar} style={{ marginTop: 0, width: 'auto', flex: 1 }} onClick={() => {
              const [yearStr, monthStr] = indivExportPeriod.split('-');
              const year = parseInt(yearStr, 10);
              const month = parseInt(monthStr, 10) - 1;
              const getProjNome = (idprojeto?: string | null) => {
                if (!idprojeto) return 'Sem Projeto';
                return projetos.find(p => p.id === idprojeto)?.titulo || 'Projeto não encontrado';
              };
              const exported = exportTrabalhosCSV(currentIndiv.trabalhos, getProjNome, `individual-${currentIndiv.usuario.nome}-${currentIndiv.usuario.sobrenome}`, year, month);
              if (!exported) showToast('Nenhuma tarefa encontrada neste período.', 'error');
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Exportar CSV
            </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
