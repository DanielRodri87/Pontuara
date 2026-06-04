import {
  Compass,
  Zap,
  Network,
  ShieldCheck,
  Badge,
  Clock,
  ClipboardList,
  ChevronLeft,
  Timer,
  Check,
  Camera,
  User,
  Copy,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Globe2,
  Briefcase,
  FolderOpen,
  Monitor,
  Smartphone,
  Layout,
  MessageSquare,
  Mail,
  Calendar,
  Star,
  Settings,
  PieChart,
  Activity
} from 'lucide-react';

export const ICONS_DATA = [
  { id: 1, name: 'Compass', component: Compass },
  { id: 2, name: 'Zap', component: Zap },
  { id: 3, name: 'Network', component: Network },
  { id: 4, name: 'ShieldCheck', component: ShieldCheck },
  { id: 5, name: 'Badge', component: Badge },
  { id: 6, name: 'Clock', component: Clock },
  { id: 7, name: 'ClipboardList', component: ClipboardList },
  { id: 8, name: 'ChevronLeft', component: ChevronLeft },
  { id: 9, name: 'Timer', component: Timer },
  { id: 10, name: 'Check', component: Check },
  { id: 11, name: 'Camera', component: Camera },
  { id: 12, name: 'User', component: User },
  { id: 13, name: 'Copy', component: Copy },
  { id: 14, name: 'ArrowRight', component: ArrowRight },
  { id: 15, name: 'ArrowLeft', component: ArrowLeft },
  { id: 16, name: 'CheckCircle2', component: CheckCircle2 },
  { id: 17, name: 'XCircle', component: XCircle },
  { id: 18, name: 'Globe2', component: Globe2 },
  { id: 19, name: 'Briefcase', component: Briefcase },
  { id: 20, name: 'FolderOpen', component: FolderOpen },
  { id: 21, name: 'Monitor', component: Monitor },
  { id: 22, name: 'Smartphone', component: Smartphone },
  { id: 23, name: 'Layout', component: Layout },
  { id: 24, name: 'MessageSquare', component: MessageSquare },
  { id: 25, name: 'Mail', component: Mail },
  { id: 26, name: 'Calendar', component: Calendar },
  { id: 27, name: 'Star', component: Star },
  { id: 28, name: 'Settings', component: Settings },
  { id: 29, name: 'PieChart', component: PieChart },
  { id: 30, name: 'Activity', component: Activity },
];

export const COLORS_DATA = [
  { id: 1, hex: '#2563EB', name: 'Azul' },
  { id: 2, hex: '#14B8A6', name: 'Verde água' },
  { id: 3, hex: '#F97316', name: 'Laranja' },
  { id: 4, hex: '#8B5CF6', name: 'Violeta' },
  { id: 5, hex: '#EC4899', name: 'Rosa' },
  { id: 6, hex: '#22C55E', name: 'Verde' },
  { id: 7, hex: '#0F172A', name: 'Grafite' },
  { id: 8, hex: '#F59E0B', name: 'Amarelo' },
  { id: 9, hex: '#EF4444', name: 'Vermelho' },
  { id: 10, hex: '#64748B', name: 'Cinza' },
];

export const encodeProjetoBadget = (iconId: number, colorId: number): number => {
  return iconId * 100 + colorId;
};

export const decodeProjetoBadget = (encoded: number | string | null | undefined) => {
  const numeric = Number(encoded);
  if (isNaN(numeric) || numeric <= 0) {
    return { icon: ICONS_DATA[0], color: COLORS_DATA[0] };
  }
  
  if (numeric < 100) {
    // Old format fallback, try to match by old values, but since it's just 1-20 or 1-8
    // we just default to index mapping
    const icon = ICONS_DATA.find((i) => i.id === numeric) || ICONS_DATA[0];
    const color = COLORS_DATA[0];
    return { icon, color };
  }

  const iconId = Math.floor(numeric / 100);
  const colorId = numeric % 100;
  
  const icon = ICONS_DATA.find((i) => i.id === iconId) || ICONS_DATA[0];
  const color = COLORS_DATA.find((c) => c.id === colorId) || COLORS_DATA[0];
  
  return { icon, color };
};

export const encodeTrabalhoCategoria = (iconName: string, colorHex: string): string => {
  return `${iconName}|${colorHex}`;
};

export const decodeTrabalhoCategoria = (categoria: string | null | undefined) => {
  const defaultIcon = ICONS_DATA.find((i) => i.name === 'ClipboardList') || ICONS_DATA[0];
  const defaultColor = COLORS_DATA.find((c) => c.hex === '#A6651E') || COLORS_DATA[0]; // fallback brown/gray

  if (!categoria) {
    return { icon: defaultIcon, color: defaultColor.hex };
  }

  // Handle old string format like 'pencil', 'people', 'clipboard'
  if (!categoria.includes('|')) {
    let icon = defaultIcon;
    let color = defaultColor.hex;
    
    if (categoria === 'pencil') {
      icon = ICONS_DATA.find(i => i.name === 'Briefcase') || defaultIcon;
      color = '#3A7AFE';
    } else if (categoria === 'people') {
      icon = ICONS_DATA.find(i => i.name === 'User') || defaultIcon;
      color = '#10B981';
    }
    
    return { icon, color };
  }

  const [iconName, colorHex] = categoria.split('|');
  const icon = ICONS_DATA.find((i) => i.name === iconName) || defaultIcon;
  
  return { icon, color: colorHex };
};
