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

/**
 * Format a duration value (interval) into a readable string (e.g., 2h 30m).
 */
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

/**
 * Format an ISO date to the Brazilian format (dd/mm/yyyy).
 */
function formatDateForCSV(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Generate CSV content from the job list.
 */
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

/**
 * Trigger a CSV file download in the browser.
 */
function downloadCSV(content: string, filename: string): void {
  const BOM = '\uFEFF';
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

/**
 * Check whether a date belongs to the given month and year.
 */
function isInMonth(date: Date, year: number, month: number): boolean {
  return date.getFullYear() === year && date.getMonth() === month;
}

/**
 * Return a month label for the filename.
 */
function monthLabel(month: number): string {
  return String(month + 1).padStart(2, '0');
}

/**
 * Export jobs for a specific period (month/year) as CSV.
 *
 * @param trabalhos Full list of jobs.
 * @param getProjetoNome Optional function to map project id to project name.
 * @param prefix Optional filename prefix (e.g., "funcionario").
 * @param year Year filter (optional, defaults to current year).
 * @param month Month filter (optional, defaults to current month, 0-indexed: 0 = January).
 * @returns `true` when the CSV was generated and downloaded, `false` if there were no tasks.
 */
export function exportTrabalhosCSV(
  trabalhos: TrabalhoCSV[],
  getProjetoNome?: (idprojeto?: string | null) => string,
  prefix = 'tarefas',
  year?: number,
  month?: number,
): boolean {
  const now = new Date();
  const filterYear = year ?? now.getFullYear();
  const filterMonth = month ?? now.getMonth();

  const trabalhosDoMes = trabalhos.filter((t) =>
    isInMonth(new Date(t.criado_em), filterYear, filterMonth),
  );

  if (trabalhosDoMes.length === 0) {
    return false;
  }

  const enriched = trabalhosDoMes.map((t) => ({
    ...t,
    projetoNome: getProjetoNome ? getProjetoNome(t.idprojeto) : t.projetoNome,
  }));

  const mesStr = monthLabel(filterMonth);
  const filename = `${prefix}-${mesStr}-${filterYear}.csv`;
  const content = generateCSVContent(enriched);
  downloadCSV(content, filename);
  return true;
}
