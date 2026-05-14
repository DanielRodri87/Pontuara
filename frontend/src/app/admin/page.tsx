'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/services/supabase';
import Sidebar from '@/components/sidebar/Sidebar';
import { icons } from 'lucide-react';
import local from './admin.module.css';

// Mock Data
const MOCK_PROJECTS = [
  { id: '1', titulo: 'Artemis', desc: 'Projeto que envolve aplicação web para o cliente otimizar seus processos', icon: 'Compasso' },
];

const MOCK_CHART_DATA = {
  Horas: [22, 15, 34, 27, 20, 8, 38], // Seg a Dom
  Produtividade: [12, 18, 14, 25, 22, 10, 5],
  Intervalos: [4, 3, 5, 4, 3, 2, 1]
};

const MOCK_INDIVIDUALS = [
  { id: '1', nome: 'Iago Roberto', role: 'Front-end Developer', tarefas: 412, horas: '162h', avatar: '/images/Profile1.png' },
  { id: '2', nome: 'Rita de Cássia', role: 'UX/UI Designer', tarefas: 340, horas: '140h', avatar: '/images/Profile2.png' },
  { id: '3', nome: 'Daniel', role: 'Back-end Developer', tarefas: 280, horas: '150h', avatar: '/images/Profile3.png' }
];

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Modais
  const [activeModal, setActiveModal] = useState<'none' | 'new' | 'edit' | 'delete' | 'indivDetails'>('none');
  const [formData, setFormData] = useState({ titulo: '', descricao: '', badget: 'Compasso' });

  // Icon Picker
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [iconColor, setIconColor] = useState('#3A7AFE');
  const [iconSearch, setIconSearch] = useState('');

  // Gráfico Geral
  const [chartTab, setChartTab] = useState<'Horas' | 'Produtividade' | 'Intervalos'>('Horas');

  // Perfil Individual
  const [indivIndex, setIndivIndex] = useState(0);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          router.push('/');
          return;
        }
        setUser(session.user);
      } catch (err) {
        console.error(err);
        router.push('/');
      }
    };
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const openModal = (type: 'new' | 'edit' | 'delete' | 'indivDetails', proj?: any) => {
    if (proj && type === 'edit') {
      setFormData({ titulo: proj.titulo, descricao: proj.desc, badget: proj.icon });
    } else if (type === 'new') {
      setFormData({ titulo: '', descricao: '', badget: 'Compasso' });
    }
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal('none');
    setIconPickerOpen(false);
  };

  const currentIndiv = MOCK_INDIVIDUALS[indivIndex];

  // Aumentar o máximo do gráfico em 20% e forçar a ser divisível por 5 para ter mais pontos no eixo Y
  const maxDataValue = Math.max(...MOCK_CHART_DATA[chartTab]);
  const maxChartValue = Math.ceil((maxDataValue * 1.2) / 5) * 5;

  // Renderiza ícones (Lucide ou Imagens antigas com mask para colorir)
  const renderProjectIcon = (iconStr: string, size = 24, isProject = false) => {
    if (iconStr.startsWith('lucide:')) {
      const parts = iconStr.split(':');
      const iconName = parts[1] as keyof typeof icons;
      const color = parts[2] || (isProject ? '#7e8591' : '#3A7AFE');
      const LucideIcon = icons[iconName];
      if (LucideIcon) return <LucideIcon size={size} color={color} />;
      return null;
    }
    return (
      <div
        className={local.svgMask}
        style={{
          mask: `url(/images/${iconStr}.svg) no-repeat center / contain`,
          WebkitMask: `url(/images/${iconStr}.svg) no-repeat center / contain`,
          width: size,
          height: size,
          backgroundColor: isProject ? '#7e8591' : '#3A7AFE'
        }}
      />
    );
  };

  const iconNames = Object.keys(icons).filter(name => name.toLowerCase().includes(iconSearch.toLowerCase())).slice(0, 50);

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

      <main className={`${local.main} ${sidebarExpanded ? '' : local.sidebarCollapsed}`}>

        {/* Top Cards */}
        <div className={local.topCards}>
          <div className={local.statCard}>
            <div className={local.cardHeader}>
              <div className={local.cardIcon}>
                {renderProjectIcon('ativos', 20)}
              </div>
            </div>
            <div className={local.cardTitle}>Colaboradores Ativos</div>
            <div className={local.cardValue}>1,284</div>
          </div>

          <div className={local.statCard}>
            <div className={local.cardHeader}>
              <div className={local.cardIcon}>
                {renderProjectIcon('horastotais', 20)}
              </div>
            </div>
            <div className={local.cardTitle}>Horas Mensais Totais</div>
            <div className={local.cardValue}>20.4k</div>
          </div>

          <div className={local.statCard}>
            <div className={local.cardHeader}>
              <div className={local.cardIcon}>
                {renderProjectIcon('cafebreak', 18)}
              </div>
            </div>
            <div className={local.cardTitle}>Tempo Médio de Intervalo</div>
            <div className={local.cardValue}>52m</div>
          </div>

          <div className={local.statCard}>
            <div className={local.cardHeader}>
              <div className={local.cardIcon}>
                {renderProjectIcon('pendenteslista', 20)}
              </div>
            </div>
            <div className={local.cardTitle}>Aprovações Pendentes</div>
            <div className={local.cardValue}>27</div>
          </div>
        </div>

        {/* Projetos */}
        <div className={local.sectionHeader}>
          <h2 className={local.sectionTitle}>Projetos</h2>
          <button className={local.btnNovo} onClick={() => openModal('new')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Novo projeto
          </button>
        </div>

        <div className={local.projectList}>
          {MOCK_PROJECTS.map(proj => (
            <div key={proj.id} className={local.projectItem}>
              <div className={local.projectLeft}>
                <div className={local.projectIcon}>
                  {renderProjectIcon(proj.icon, 20, true)}
                </div>
                <div className={local.projectInfo}>
                  <div className={local.title}>{proj.titulo}</div>
                  <div className={local.desc}>{proj.desc}</div>
                </div>
              </div>
              <div className={local.projectActions}>
                <button className={local.iconBtn} onClick={() => openModal('edit', proj)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button className={`${local.iconBtn} ${local.delete}`} onClick={() => openModal('delete')}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard Grid (Charts) */}
        <div className={local.dashboardGrid}>
          {/* Geral */}
          <div className={local.geralCard}>
            <div className={local.geralHeader}>
              <h3>Geral</h3>
              <div className={local.dateNav}>
                <button><img src="/images/tempograficos.svg" alt="Prev" /></button>
                <span>12 Out - 18 Out, 2023</span>
                <button><img src="/images/tempograficos.svg" alt="Next" style={{ transform: 'scaleX(-1)' }} /></button>
              </div>
            </div>

            <div className={local.geralControls}>
              <span className={local.subtitle}>Comportamento geral</span>
              <div className={local.chartTabs}>
                {(['Horas', 'Produtividade', 'Intervalos'] as const).map(tab => (
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

              {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'].map((day, idx) => {
                const val = MOCK_CHART_DATA[chartTab][idx];
                const heightPercent = (val / maxChartValue) * 100;
                return (
                  <div key={day} className={local.chartBarWrapper}>
                    <div className={local.chartBar} style={{ height: `${heightPercent}%` }}></div>
                    <span className={local.chartLabel}>{day}</span>
                  </div>
                );
              })}
            </div>

            <button className={local.btnExportar}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Exportar CSV
            </button>
          </div>

          {/* Individual */}
          <div className={local.indivCard}>
            <h3>Individual</h3>

            <div className={local.indivProfile}>
              <div className={local.indivAvatarWrapper}>
                <img src={currentIndiv.avatar} alt="Avatar" className={local.indivAvatar} />
              </div>
              <div className={local.indivName}>{currentIndiv.nome}</div>
              <div className={local.indivRole}>{currentIndiv.role}</div>
            </div>

            <div className={local.indivNav}>
              <button
                className={local.navArrow}
                onClick={() => setIndivIndex(prev => prev > 0 ? prev - 1 : MOCK_INDIVIDUALS.length - 1)}
              >
                <img src="/images/tempograficos.svg" alt="Prev" />
              </button>
              <button
                className={local.navArrow}
                onClick={() => setIndivIndex(prev => prev < MOCK_INDIVIDUALS.length - 1 ? prev + 1 : 0)}
              >
                <img src="/images/tempograficos.svg" alt="Next" style={{ transform: 'scaleX(-1)' }} />
              </button>
            </div>

            <div className={local.indivStats}>
              <div className={local.statRow}>
                <div className={local.statLabel}>
                  {renderProjectIcon('tarefasraio', 20)}
                  Tarefas
                </div>
                <div className={local.statVal}>{currentIndiv.tarefas}</div>
              </div>
              <div className={local.statRow}>
                <div className={local.statLabel}>
                  {renderProjectIcon('horasind', 20)}
                  Horas Logadas
                </div>
                <div className={local.statVal}>{currentIndiv.horas}</div>
              </div>
            </div>

            <button className={local.btnVisualizar} onClick={() => openModal('indivDetails')}>Visualizar mais</button>
          </div>
        </div>

        {/* Aprovações Pendentes */}
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
              <tr>
                <td>
                  <div className={local.colabCell}>
                    <img src="/images/Profile2.png" alt="Rita" className={local.colabAvatar} />
                    <div className={local.colabInfo}>
                      <span className={local.name}>Rita de Cássia</span>
                      <span className={local.email}>rita@pontuara.com</span>
                    </div>
                  </div>
                </td>
                <td>12 Out, 2023</td>
                <td>
                  <div className={local.actionBtns}>
                    <button className={local.actionBtn}><img src="/images/aceitar.svg" alt="Aceitar" /></button>
                    <button className={local.actionBtn}><img src="/images/recusar.svg" alt="Recusar" /></button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className={local.colabCell}>
                    <img src="/images/Profile3.png" alt="Daniel" className={local.colabAvatar} />
                    <div className={local.colabInfo}>
                      <span className={local.name}>Daniel</span>
                      <span className={local.email}>daniel@pontuara.com</span>
                    </div>
                  </div>
                </td>
                <td>13 Out, 2023</td>
                <td>
                  <div className={local.actionBtns}>
                    <button className={local.actionBtn}><img src="/images/aceitar.svg" alt="Aceitar" /></button>
                    <button className={local.actionBtn}><img src="/images/recusar.svg" alt="Recusar" /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </main>

      {/* Modais CRUD Projetos */}
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

            <div className={local.formGroup}>
              <label className={local.formLabel}>Badget</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div className={`${local.typeBtn} ${local.active}`}>
                  {renderProjectIcon(formData.badget, 20)}
                </div>

                <button
                  type="button"
                  className={local.typeBtn}
                  onClick={() => setIconPickerOpen(!iconPickerOpen)}
                  title="Abrir biblioteca de ícones"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
              </div>

              {iconPickerOpen && (
                <div className={local.iconPickerContainer}>
                  <div className={local.iconPickerHeader}>
                    <input
                      type="color"
                      className={local.colorPicker}
                      value={iconColor}
                      onChange={e => setIconColor(e.target.value)}
                    />
                    <input
                      type="text"
                      className={local.iconSearch}
                      placeholder="Pesquisar ícones..."
                      value={iconSearch}
                      onChange={e => setIconSearch(e.target.value)}
                    />
                  </div>
                  <div className={local.iconGrid}>
                    {iconNames.map(name => {
                      const LucideIcon = icons[name as keyof typeof icons];
                      return (
                        <div
                          key={name}
                          className={local.iconOption}
                          onClick={() => setFormData({ ...formData, badget: `lucide:${name}:${iconColor}` })}
                        >
                          <LucideIcon size={20} color={iconColor} />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              className={local.modalActionBtn}
              onClick={closeModal}
            >
              {activeModal === 'new' ? 'Criar trabalho' : 'Editar trabalho'}
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

            <h2 className={local.deleteTitle}>Deletar trabalho?</h2>
            <p className={local.deleteText}>Você tem certeza que quer excluir esse trabalho? Essa ação não pode ser desfeita.</p>

            <button className={local.modalActionBtn} onClick={closeModal}>
              Deletar
            </button>
            <button className={local.cancelBtn} onClick={closeModal}>Cancelar</button>
          </div>
        </div>
      )}

      {activeModal === 'indivDetails' && (
        <div className={local.modalOverlay} onClick={closeModal}>
          <div className={local.indivModalContent} onClick={e => e.stopPropagation()}>
            <button className={local.closeBtn} onClick={closeModal}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <div className={local.indivAvatarWrapper}>
              <img src={currentIndiv.avatar} alt="Avatar" className={local.indivAvatar} />
            </div>
            <div className={local.indivName}>{currentIndiv.nome}</div>
            <div className={local.indivRole} style={{ marginBottom: 24 }}>{currentIndiv.role}</div>

            <div className={local.indivStats}>
              <div className={local.statRow}>
                <div className={local.statLabel}>
                  {renderProjectIcon('tarefasraio', 20)}
                  Tarefas
                </div>
                <div className={local.statVal}>{currentIndiv.tarefas}</div>
              </div>
              <div className={local.statRow}>
                <div className={local.statLabel}>
                  {renderProjectIcon('horasind', 20)}
                  Horas Logadas
                </div>
                <div className={local.statVal}>{currentIndiv.horas}</div>
              </div>
            </div>

            <div className={local.workListTitle}>Trabalhos no dia</div>
            <div className={local.workListModal}>
              {MOCK_PROJECTS.map(proj => (
                <div key={proj.id} className={local.projectItem} style={{ padding: '12px 16px' }}>
                  <div className={local.projectLeft}>
                    <div className={local.projectIcon} style={{ width: 32, height: 32 }}>
                      {renderProjectIcon(proj.icon, 16, true)}
                    </div>
                    <div className={local.projectInfo}>
                      <div className={local.title}>{proj.titulo}</div>
                      <div className={local.desc} style={{ fontSize: 10 }}>2h 30m trabalhados</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className={local.btnExportar} style={{ marginTop: 'auto' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Exportar CSV
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
