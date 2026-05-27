'use client';

import React from 'react';

interface PeriodFilterProps {
  period: string; // "YYYY-MM"
  onChange: (value: string) => void;
}

export default function PeriodFilter({ period, onChange }: PeriodFilterProps) {
  return (
    <label style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '13px',
      fontWeight: 700,
      color: '#475569',
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
      <input
        type="month"
        value={period}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '6px 10px',
          borderRadius: '8px',
          border: '1px solid #E7E8E9',
          fontSize: '13px',
          fontFamily: 'inherit',
          fontWeight: 600,
          color: '#191c1d',
          backgroundColor: '#FFFFFF',
          outline: 'none',
          cursor: 'pointer',
          minWidth: '150px',
        }}
      />
    </label>
  );
}
