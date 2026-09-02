export interface MarcaSummary {
  id: string;
  nome: string;
  code: string;
  initials: string;
  colecoesCount: number;
  pecasCount: number;
  heroImageUrl: string;
  description: string;
  badgeTag: string;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  empresa: string;
  cargo: 'Estilista' | 'Modelista' | 'Gerente de Produção' | 'Administrador' | 'Engenharia';
  avatarUrl?: string;
  marcas: MarcaSummary[];
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  activeMarca: MarcaSummary | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  setActiveMarca: (marca: MarcaSummary) => void;
}
