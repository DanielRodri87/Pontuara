'use client';

import React, { useState } from 'react';

interface PeriodFilterProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
}

function getWeekRange() {
  const today = new Date();
  const day = today.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + offset);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { start: fmt(monday), end: fmt(sunday) };
}

const inputStyle: React.CSSProperties = {
  border: 'none',
  background: 'transparent',
  fontSize: '13px',
  fontFamily: 'inherit',
  fontWeight: 700,
  color: '#191c1d',
  outline: 'none',
  cursor: 'pointer',
  minWidth: '105px',
};

export default function PeriodFilter({ startDate, endDate, onChange }: PeriodFilterProps) {
  const [hoverReset, setHoverReset] = useState(false);
  const week = getWeekRange();
  const isCurrentWeek = startDate === week.start && endDate === week.end;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: '#F8F9FA',
        border: '1px solid #E7E8E9',
        borderRadius: '10px',
        padding: '7px 12px',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3A7AFE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>

        <input
          type="date"
          value={startDate}
          max={endDate}
          onChange={(e) => onChange(e.target.value, endDate)}
          style={inputStyle}
        />

        <span style={{ color: '#A0A0A0', fontSize: '11px', fontWeight: 800, userSelect: 'none', lineHeight: 1 }}>
          →
        </span>

        <input
          type="date"
          value={endDate}
          min={startDate}
          onChange={(e) => onChange(startDate, e.target.value)}
          style={inputStyle}
        />
      </label>

      <button
        onClick={() => onChange(week.start, week.end)}
        onMouseEnter={() => setHoverReset(true)}
        onMouseLeave={() => setHoverReset(false)}
        title="Semana atual"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          background: isCurrentWeek || hoverReset ? '#EBF5FF' : '#F8F9FA',
          border: `1px solid ${isCurrentWeek || hoverReset ? '#3A7AFE' : '#E7E8E9'}`,
          borderRadius: '8px',
          cursor: 'pointer',
          color: isCurrentWeek || hoverReset ? '#3A7AFE' : '#6B7280',
          transition: 'all 0.2s ease',
          flexShrink: 0,
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      </button>
    </div>
  );
}
