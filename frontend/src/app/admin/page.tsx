import React from 'react';

/**
 * Página principal do painel de administração.
 * Exibe as opções e controles restritos aos administradores.
 * 
 * @returns {JSX.Element} Dashboard administrativo.
 */
export default function AdminDashboard() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard Administrativo</h1>
      <p>Área restrita para administradores.</p>
    </div>
  );
}
