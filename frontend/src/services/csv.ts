/**
 * CSV export service for work records.
 */

interface TrabalhoCSV {
  id: string;
  titulo: string;
  descricao?: string | null;
  categoria?: string | null;
  idprojeto?: string | null;
  projetoNome?: string;
  duracao?: string | null;
  criado_em: string;
}

function formatDurationForCSV(value?: string | null): string {
  if (!value) return '--';

  const dayMatch = value.match(/(\d+)\s+day/);
  const days = dayMatch ? Number(dayMatch[1]) : 0;
  const timeMatch = value.match(/(\d+):(\d{2})(?::(\d{2}))?/);
  if (!timeMatch) return value;

  const hours = Number(timeMatch[1]) + days * 24;
  const minutes = Number(timeMatch[2]);
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
}

function formatDateForCSV(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function generateCSVContent(trabalhos: TrabalhoCSV[]): string {
  const header = 'Título;Descrição;Categoria;Projeto;Duração;Data\n';
  const rows = trabalhos.map((t) => {
    const campos = [
      t.titulo,
      (t.descricao || '').replace(/"/g, '""'),
      t.categoria || '',
      t.projetoNome || '',
      formatDurationForCSV(t.duracao),
      formatDateForCSV(t.criado_em),
    ];
    return campos.map((campo) => `"${campo}"`).join(';');
  });
  return header + rows.join('\n');
}

function downloadCSV(content: string, filename: string): void {
  const BOM = '﻿';
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function parseLocalDate(dateStr: string, endOfDay = false): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  if (endOfDay) d.setHours(23, 59, 59, 999);
  return d;
}

function isInDateRange(date: Date, startDateStr: string, endDateStr: string): boolean {
  const start = parseLocalDate(startDateStr);
  const end = parseLocalDate(endDateStr, true);
  return date >= start && date <= end;
}

/**
 * Export jobs within a date range as CSV.
 *
 * @param trabalhos Full list of jobs.
 * @param getProjetoNome Optional function to map project id to project name.
 * @param prefix Optional filename prefix.
 * @param startDate Start date string "YYYY-MM-DD" (defaults to first day of current month).
 * @param endDate End date string "YYYY-MM-DD" (defaults to today).
 * @returns `true` when the CSV was generated and downloaded, `false` if there were no tasks.
 */
export function exportTrabalhosCSV(
  trabalhos: TrabalhoCSV[],
  getProjetoNome?: (idprojeto?: string | null) => string,
  prefix = 'tarefas',
  startDate?: string,
  endDate?: string,
): boolean {
  const now = new Date();
  const defaultStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const defaultEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const start = startDate || defaultStart;
  const end = endDate || defaultEnd;

  const trabalhosNoPeriodo = trabalhos.filter((t) =>
    isInDateRange(new Date(t.criado_em), start, end),
  );

  if (trabalhosNoPeriodo.length === 0) {
    return false;
  }

  const enriched = trabalhosNoPeriodo.map((t) => ({
    ...t,
    projetoNome: getProjetoNome ? getProjetoNome(t.idprojeto) : t.projetoNome,
  }));

  const filename = `${prefix}-${start}_a_${end}.csv`;
  const content = generateCSVContent(enriched);
  downloadCSV(content, filename);
  return true;
}
