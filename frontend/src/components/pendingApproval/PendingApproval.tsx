'use client';

import React from 'react';

interface PendingApprovalProps {
  userName?: string;
  onLogout: () => void;
}

export default function PendingApproval({ userName, onLogout }: PendingApprovalProps) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F8F9FA',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      padding: '40px 20px',
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '48px 40px',
        maxWidth: '420px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
        animation: 'fadeInUp 0.5s ease-out',
      }}>
        {/* Logo */}
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 24px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F3F4F5',
          borderRadius: '20px',
          padding: '16px',
        }}>
          <img
            src="/images/Logo.svg"
            alt="Ponturá"
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Ícone de relógio/espera */}
        <div style={{
          width: '56px',
          height: '56px',
          margin: '0 auto 20px auto',
          backgroundColor: '#FFF3E0',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>

        {/* Título */}
        <h1 style={{
          fontSize: '22px',
          fontWeight: 800,
          color: '#191c1d',
          margin: '0 0 8px 0',
        }}>
          Esperando ser Aceito
        </h1>

        {/* Subtítulo */}
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          lineHeight: 1.6,
          margin: '0 0 8px 0',
        }}>
          {userName ? `${userName}, sua` : 'Sua'} conta foi vinculada à empresa e está aguardando aprovação do administrador.
        </p>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          lineHeight: 1.6,
          margin: '0 0 32px 0',
        }}>
          Assim que for aprovado, você receberá acesso ao sistema de ponto eletrônico.
        </p>

        {/* Indicador de verificação automática */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '24px',
          fontSize: '13px',
          color: '#9CA3AF',
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#F97316',
            animation: 'pulse 2s ease-in-out infinite',
          }}></span>
          Verificando aprovação automaticamente...
        </div>

        {/* Botão Sair */}
        <button
          onClick={onLogout}
          style={{
            backgroundColor: '#2A2A2A',
            color: '#FFFFFF',
            border: 'none',
            padding: '14px 32px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1a1a1a';
            e.currentTarget.style.transform = 'scale(1.03) translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#2A2A2A';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Sair
        </button>
      </div>

      <style>{`
        @keyframes fadeInUp {\n          from {\n            opacity: 0;\n            transform: translateY(20px);\n          }\n          to {\n            opacity: 1;\n            transform: translateY(0);\n          }\n        }\n        @keyframes pulse {\n          0%, 100% { opacity: 1; }\n          50% { opacity: 0.4; }
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
