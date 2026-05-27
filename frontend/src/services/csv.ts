/**
 * Serviço de exportação CSV para registros de trabalho.
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
 * Formata um valor de duração (interval) para uma string legível (ex: 2h 30m).
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
 * Formata uma data ISO para o formato brasileiro (dd/mm/aaaa).
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
 * Gera o conteúdo CSV a partir da lista de trabalhos.
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
 * Dispara o download de um arquivo CSV no navegador.
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
 * Verifica se uma data pertence ao mês e ano especificados.
 */
function isInMonth(date: Date, year: number, month: number): boolean {
  return date.getFullYear() === year && date.getMonth() === month;
}

/**
 * Retorna o nome do mês em português para o filename.
 */
function monthLabel(month: number): string {
  return String(month + 1).padStart(2, '0');
}

/**
 * Exporta os trabalhos de um período específico (mês/ano) como CSV.
 *
 * @param trabalhos Lista completa de trabalhos.
 * @param getProjetoNome Função opcional para obter o nome do projeto a partir do idprojeto.
 * @param prefix Prefixo opcional para o nome do arquivo (ex: "funcionario").
 * @param year Ano para filtrar (opcional, padrão = ano atual).
 * @param month Mês para filtrar (opcional, padrão = mês atual, 0-indexed: 0 = Janeiro).
 * @returns `true` se o CSV foi gerado e baixado, `false` se não havia tarefas no período.
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
