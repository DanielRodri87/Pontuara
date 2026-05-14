'use client';

import React, { useState } from 'react';
import local from './sidebar.module.css';

interface SidebarProps {
  user: any;
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
  handleLogout: () => void;
  themeColor?: string; // e.g. '#3A7AFE' or '#E67E22'
  showCode?: boolean;
}

export default function Sidebar({ 
  user, 
  sidebarExpanded, 
  setSidebarExpanded, 
  handleLogout,
  themeColor = '#3A7AFE',
  showCode = false
}: SidebarProps) {
  const [showCodeModal, setShowCodeModal] = useState(false);
  
  // Código da empresa - Mockado ou vindo do metadata
  const companyCode = user?.user_metadata?.company_code || 'PT-8829-X';

  const handleToggle = (e: React.MouseEvent) => {
    // Evita que cliques nos botões internos disparem o toggle da sidebar
    if ((e.target as HTMLElement).closest('button')) return;
    setSidebarExpanded(!sidebarExpanded);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(companyCode);
    // Poderia usar um toast aqui, mas vamos de alert simples para manter o foco
    alert('Código copiado para a área de transferência!');
  };

  return (
    <>
      <aside 
        className={`${local.sidebar} ${sidebarExpanded ? '' : local.collapsed}`}
        onClick={handleToggle}
      >
        <div>
          <div className={local.brand}>
            <img src="/images/Logo.svg" alt="Pontuara Logo" />
          </div>
          <nav>
            <button 
              className={local.navItem} 
              style={{ '--theme-color': themeColor } as React.CSSProperties}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="9" rx="1"></rect>
                <rect x="14" y="3" width="7" height="5" rx="1"></rect>
                <rect x="14" y="12" width="7" height="9" rx="1"></rect>
                <rect x="3" y="16" width="7" height="5" rx="1"></rect>
              </svg>
              <span>Dashboard</span>
            </button>

            {showCode && (
              <button 
                className={local.navSecondary}
                onClick={(e) => { e.stopPropagation(); setShowCodeModal(true); }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 17 10 11 4 5"></polyline>
                  <line x1="12" y1="19" x2="20" y2="19"></line>
                </svg>
                <span>Código</span>
              </button>
            )}
          </nav>
        </div>

        <div className={local.sidebarBottom}>
          <div className={local.profileCard}>
            <img src={user?.user_metadata?.avatar_url || "/images/profile.svg"} alt="avatar" className={local.avatar} />
            <div className={local.profileInfo}>
              <span className={local.name}>{user?.user_metadata?.nome || user?.email?.split('@')[0] || 'Usuário'}</span>
              <span className={local.role}>{user?.user_metadata?.tipo_usuario === 'empregador' ? 'Gestor' : 'Funcionário'}</span>
            </div>
          </div>
          <button className={local.logoutBtn} onClick={(e) => { e.stopPropagation(); handleLogout(); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {showCodeModal && (
        <div className={local.modalOverlay} onClick={() => setShowCodeModal(false)}>
          <div className={local.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={local.modalTitle}>Código da empresa</h3>
            <p className={local.modalText}>
              Compartilhe-o para que outros funcionários possam se vincular à empresa.
            </p>
            
            <div className={local.codeContainer}>
              <span className={local.codeValue}>{companyCode}</span>
              <button onClick={copyToClipboard} className={local.copyBtn} title="Copiar código" type="button">
                <img src="/images/copy.svg" alt="Copiar" className={local.copyIcon} />
              </button>
            </div>

            <button className={local.closeModalBtn} onClick={() => setShowCodeModal(false)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
