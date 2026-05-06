// frontend/src/app/funcionario/page.tsx
'use client';

import React, { useState } from 'react';
import local from './funcionario.module.css';

export default function FuncionarioDashboard() {
  // Controle de estado dos modais: 'none' | 'new' | 'edit' | 'delete'
  const [activeModal, setActiveModal] = useState<'none' | 'new' | 'edit' | 'delete'>('none');

  const openModal = (type: 'new' | 'edit' | 'delete') => setActiveModal(type);
  const closeModal = () => setActiveModal('none');

  return (
    <div className={local.layout}>
      {/* Sidebar Lateral */}
      <aside className={local.sidebar}>
        <div>
          <div className={local.brand}>
            <img src="/images/Logo.svg" alt="Pontuara Logo" />
          </div>
          
          <nav>
            <button className={local.navItem}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="9" rx="1"></rect>
                <rect x="14" y="3" width="7" height="5" rx="1"></rect>
                <rect x="14" y="12" width="7" height="9" rx="1"></rect>
                <rect x="3" y="16" width="7" height="5" rx="1"></rect>
              </svg>
              Dashboard
            </button>
          </nav>
        </div>

        <div className={local.sidebarBottom}>
          <div className={local.profileCard}>
            <img src="/images/profile.svg" alt="avatar" className={local.avatar} />
            <div className={local.profileInfo}>
              <span className={local.name}>Iago Roberto</span>
              <span className={local.role}>FrontEnd Dev</span>
            </div>
          </div>
          <button className={local.logoutBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className={local.main}>
        <button className={local.exportBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Exportar CSV
        </button>

        {/* Widgets Superiores */}
        <div className={local.topWidgets}>
          <div className={local.controlPanel}>
            <div className={local.controlInfo}>
              <div className={local.label}>Painel de Controle</div>
              <div className={local.time}>04:32:15</div>
              <div className={local.subtitle}>Entrou hoje às: 06h 15m</div>
            </div>
            <div className={local.controlActions}>
              <button className={local.btnEncerrar}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <rect x="9" y="9" width="6" height="6"></rect>
                </svg>
                Encerrar Expediente
              </button>
              <button className={local.btnIntervalo}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
                Intervalo
              </button>
            </div>
          </div>

          <div className={local.tracker}>
            <h3>Tracker</h3>
            <p>Você está a 82% de concluir sua meta semanal de trabalho</p>
            <div className={local.progressTrack}>
              <div className={local.progressFill} style={{ width: '82%' }}></div>
            </div>
            <div className={local.progressLabels}>
              <span>Progress</span>
              <span>32/40 Hours</span>
            </div>
          </div>
        </div>

        {/* Registros de Trabalho */}
        <div className={local.sectionHeader}>
          <h2 className={local.sectionTitle}>Registros de Trabalho</h2>
          <button className={local.btnNovoTrabalho} onClick={() => openModal('new')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Novo trabalho
          </button>
        </div>

        <div className={local.workList}>
          {/* Card 1 */}
          <div className={local.workItem}>
            <div className={local.itemLeft}>
              <div className={local.itemIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3A7AFE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </div>
              <div className={local.itemInfo}>
                <div className={local.title}>Atualização de UI Design</div>
                <div className={local.subtitle}>Pontuará V2.0</div>
              </div>
            </div>
            <div className={local.itemRight}>
              <div className={local.durationBlock}>
                <div className={local.label}>Duration</div>
                <div className={local.time}>02h 45m</div>
              </div>
              <div className={local.timeRange}>14:00 - 16:45</div>
              <div className={local.itemActions}>
                <button className={local.iconBtn} onClick={() => openModal('edit')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button className={`${local.iconBtn} ${local.delete}`} onClick={() => openModal('delete')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className={local.workItem}>
            <div className={local.itemLeft}>
              <div className={local.itemIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A6651E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                </svg>
              </div>
              <div className={local.itemInfo}>
                <div className={local.title}>Resolvendo Bugs de Frontend</div>
                <div className={local.subtitle}>Mitigando os problemas com o framework</div>
              </div>
            </div>
            <div className={local.itemRight}>
              <div className={local.durationBlock}>
                <div className={local.label}>Duration</div>
                <div className={local.time}>01h 20m</div>
              </div>
              <div className={local.timeRange}>10:30 - 11:50</div>
              <div className={local.itemActions}>
                <button className={local.iconBtn} onClick={() => openModal('edit')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button className={`${local.iconBtn} ${local.delete}`} onClick={() => openModal('delete')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className={local.workItem}>
            <div className={local.itemLeft}>
              <div className={local.itemIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className={local.itemInfo}>
                <div className={local.title}>Weekly Sprint do Projeto</div>
                <div className={local.subtitle}>Atualização semanal do andamento do projeto</div>
              </div>
            </div>
            <div className={local.itemRight}>
              <div className={local.durationBlock}>
                <div className={local.label}>Duration</div>
                <div className={local.time}>00h 45m</div>
              </div>
              <div className={local.timeRange}>09:00 - 09:45</div>
              <div className={local.itemActions}>
                <button className={local.iconBtn} onClick={() => openModal('edit')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button className={`${local.iconBtn} ${local.delete}`} onClick={() => openModal('delete')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className={local.workItem}>
            <div className={local.itemLeft}>
              <div className={local.itemIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div className={local.itemInfo}>
                <div className={local.title}>Revisão de Pull Requests</div>
                <div className={local.subtitle}>Análise de código do time de backend</div>
              </div>
            </div>
            <div className={local.itemRight}>
              <div className={local.durationBlock}>
                <div className={local.label}>Duration</div>
                <div className={local.time}>01h 15m</div>
              </div>
              <div className={local.timeRange}>15:00 - 16:15</div>
              <div className={local.itemActions}>
                <button className={local.iconBtn} onClick={() => openModal('edit')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button className={`${local.iconBtn} ${local.delete}`} onClick={() => openModal('delete')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Card 5 */}
          <div className={local.workItem}>
            <div className={local.itemLeft}>
              <div className={local.itemIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </div>
              <div className={local.itemInfo}>
                <div className={local.title}>Planejamento da Sprint</div>
                <div className={local.subtitle}>Definição de metas para a próxima quinzena</div>
              </div>
            </div>
            <div className={local.itemRight}>
              <div className={local.durationBlock}>
                <div className={local.label}>Duration</div>
                <div className={local.time}>01h 00m</div>
              </div>
              <div className={local.timeRange}>08:00 - 09:00</div>
              <div className={local.itemActions}>
                <button className={local.iconBtn} onClick={() => openModal('edit')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button className={`${local.iconBtn} ${local.delete}`} onClick={() => openModal('delete')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sumário Semanal Envolvido no novo Card */}
        <div className={local.summaryCard}>
          <div className={local.summaryHeader}>
            <h3>Sumário semanal</h3>
            <p>Veja a quantidade de horas trabalhadas por você durante essa semana</p>
          </div>

          <div className={local.weekGrid}>
            <div className={local.dayCard}><span className={local.dayLabel}>Dom</span><span className={local.dayValue}>--</span></div>
            <div className={local.dayCard}><span className={local.dayLabel}>Seg</span><span className={local.dayValue}>8h</span></div>
            <div className={local.dayCard}><span className={local.dayLabel}>Ter</span><span className={local.dayValue}>7h 32m</span></div>
            <div className={`${local.dayCard} ${local.active}`}><span className={local.dayLabel}>Qua</span><span className={local.dayValue}>06h 15m</span></div>
            <div className={local.dayCard}><span className={local.dayLabel}>Qui</span><span className={local.dayValue}>--</span></div>
            <div className={local.dayCard}><span className={local.dayLabel}>Sexta</span><span className={local.dayValue}>--</span></div>
            <div className={local.totalCard}><span className={local.dayLabel}>Total da Semana</span><span className={local.dayValue}>7h 32m</span></div>
          </div>
        </div>

      </main>

      {/* MODAIS */}
      
      {/* 1. Modal: Novo Trabalho */}
      {activeModal === 'new' && (
        <div className={local.modalOverlay} onClick={closeModal}>
          <div className={local.modalContent} onClick={e => e.stopPropagation()}>
            <div className={local.modalHeader}>
              <h2 className={local.modalTitle}>Novo trabalho</h2>
              <button className={local.closeBtn} onClick={closeModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className={local.formGroup}>
              <label className={local.formLabel}>Título</label>
              <input type="text" className={local.formInput} placeholder="Ex: Correção de Bugs no Backend" />
            </div>

            <div className={local.formGroup}>
              <label className={local.formLabel}>Nome do projeto</label>
              <input type="text" className={local.formInput} placeholder="Ex: Projeto Pontuará" />
            </div>

            <div className={local.formRow}>
              <div className={local.formGroup}>
                <label className={local.formLabel}>Duração</label>
                <div className={local.inputWithIcon}>
                  <div className={local.inputIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </div>
                  <input type="text" className={`${local.formInput} ${local.pl}`} placeholder="Selecione" />
                </div>
              </div>

              <div className={local.formGroup}>
                <label className={local.formLabel}>Projeto</label>
                <div className={local.projectTypes}>
                  <button className={`${local.typeBtn} ${local.active}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path></svg>
                  </button>
                  <button className={local.typeBtn}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                  </button>
                  <button className={local.typeBtn}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </button>
                </div>
              </div>
            </div>

            <button className={local.modalActionBtn} onClick={closeModal}>Criar trabalho</button>
          </div>
        </div>
      )}

      {/* 2. Modal: Editar Trabalho */}
      {activeModal === 'edit' && (
        <div className={local.modalOverlay} onClick={closeModal}>
          <div className={local.modalContent} onClick={e => e.stopPropagation()}>
            <div className={local.modalHeader}>
              <h2 className={local.modalTitle}>Editar Trabalho</h2>
              <button className={local.closeBtn} onClick={closeModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className={local.formGroup}>
              <label className={local.formLabel}>Título</label>
              <input type="text" className={local.formInput} defaultValue="Atualização de UI Design" />
            </div>

            <div className={local.formGroup}>
              <label className={local.formLabel}>Nome do projeto</label>
              <input type="text" className={local.formInput} defaultValue="Pontuará V2.0" />
            </div>

            <div className={local.formRow}>
              <div className={local.formGroup}>
                <label className={local.formLabel}>Duração</label>
                <div className={local.inputWithIcon}>
                  <div className={local.inputIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </div>
                  <input type="text" className={`${local.formInput} ${local.pl}`} defaultValue="02h 45 m" />
                </div>
              </div>

              <div className={local.formGroup}>
                <label className={local.formLabel}>Projeto</label>
                <div className={local.projectTypes}>
                  <button className={local.typeBtn}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path></svg>
                  </button>
                  <button className={`${local.typeBtn} ${local.active}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                  </button>
                  <button className={local.typeBtn}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </button>
                </div>
              </div>
            </div>

            <button className={local.modalActionBtn} onClick={closeModal}>Editar trabalho</button>
          </div>
        </div>
      )}

      {/* 3. Modal: Deletar Trabalho */}
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

            <button className={local.modalActionBtn} onClick={closeModal}>Deletar</button>
            <button className={local.cancelBtn} onClick={closeModal}>Cancelar</button>
          </div>
        </div>
      )}

    </div>
  );
}