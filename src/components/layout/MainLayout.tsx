import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowUpRight,
  Bell,
  Building2,
  ChevronDown,
  CircleDollarSign,
  Gauge,
  GitBranch,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Ruler,
  Search,
  Shirt,
  SlidersHorizontal,
  SwatchBook,
  Tags,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useWorkspace } from '../../hooks/useWorkspace';
import type { MarcaSummary } from '../../types/auth';
import type { OperationalCollection, OperationalProduct } from '../../types/workspace';
import { attention } from '../../services/workspaceDomain';
import { ThemeToggle } from '../ui/ThemeToggle';
import './workspace.css';

const groups = [
  {
    name: 'Cadastros',
    items: [
      ['/gestao/marcas', 'Marcas', Building2],
      ['/gestao/tecidos', 'Tecidos', SwatchBook],
      ['/gestao/aviamentos', 'Aviamentos', Layers],
      ['/gestao/caracteristicas', 'Características e medidas', Ruler],
      ['/gestao/tipos_peca', 'Tipos de peça', Shirt],
      ['/gestao/tags', 'Tags', Tags],
      ['/gestao/campos_custom', 'Campos customizados', SlidersHorizontal],
    ],
  },
  {
    name: 'Operação',
    items: [
      ['/gestao/custos_fixos', 'Custos fixos', CircleDollarSign],
      ['/gestao/precificacao', 'Regras de precificação', Gauge],
      ['/gestao/fluxos', 'Fluxos e etapas', GitBranch],
    ],
  },
  {
    name: 'Administração',
    items: [
      ['/gestao/usuarios', 'Usuários', Users],
      ['/gestao/times', 'Times', Users],
    ],
  },
] as const;

export function MainLayout() {
  const { user, activeMarca, setActiveMarca, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const collections = useWorkspace<OperationalCollection>('collections');
  const products = useWorkspace<OperationalProduct>('products');
  const [mobile, setMobile] = useState(false);
  const [dropdown, setDropdown] = useState<'reports' | 'manage' | null>(null);
  const [profile, setProfile] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [search, setSearch] = useState(params.get('q') ?? '');
  const profileRef = useRef<HTMLDivElement>(null);
  const navigationRef = useRef<HTMLElement>(null);
  const mobileRef = useRef<HTMLButtonElement>(null);
  const reportsRef = useRef<HTMLButtonElement>(null);
  const manageRef = useRef<HTMLButtonElement>(null);
  const contextRef = useRef<HTMLDivElement>(null);
  const contextTriggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (mobile) navigationRef.current?.querySelector<HTMLAnchorElement>('a[href]')?.focus();
  }, [mobile]);
  useEffect(() => {
    if (contextOpen) contextRef.current?.querySelector<HTMLSelectElement>('select')?.focus();
  }, [contextOpen]);
  const brands = useMemo(() => user?.marcas ?? [], [user?.marcas]);
  useEffect(() => {
    const fromUrl = brands.find((b) => b.id === params.get('marca'));
    if (fromUrl && fromUrl.id !== activeMarca?.id) setActiveMarca(fromUrl);
    else if (!activeMarca && brands[0]) setActiveMarca(brands[0]);
  }, [params, activeMarca, brands, setActiveMarca]);
  useEffect(() => {
    setMobile(false);
    setDropdown(null);
    setContextOpen(false);
  }, [location.pathname, location.search]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (dropdown) {
          (dropdown === 'reports' ? reportsRef : manageRef).current?.focus();
          setDropdown(null);
        } else if (mobile) {
          setMobile(false);
          mobileRef.current?.focus();
        }
        setProfile(false);
        if (contextOpen) {
          setContextOpen(false);
          contextTriggerRef.current?.focus();
        }
      }
    };
    const outside = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) setProfile(false);
      if (
        !contextRef.current?.contains(event.target as Node) &&
        !contextTriggerRef.current?.contains(event.target as Node)
      )
        setContextOpen(false);
      if (
        !navigationRef.current?.contains(event.target as Node) &&
        !mobileRef.current?.contains(event.target as Node)
      ) {
        setDropdown(null);
        setMobile(false);
      }
    };
    document.addEventListener('keydown', close);
    document.addEventListener('mousedown', outside);
    return () => {
      document.removeEventListener('keydown', close);
      document.removeEventListener('mousedown', outside);
    };
  }, [dropdown, mobile, contextOpen]);
  const contextUrl = (path: string) => {
    const next = new URLSearchParams();
    if (activeMarca) next.set('marca', activeMarca.id);
    if (
      params.get('colecao') &&
      ['/dashboard', '/pecas', '/bi', '/kanban', '/notifications'].includes(path)
    )
      next.set('colecao', params.get('colecao')!);
    return path + (next.size ? '?' + next.toString() : '');
  };
  const needsAttention = products.rows.filter((p) => attention(p.data).length).length;
  const selectedCollection = params.get('colecao') ?? '';
  const handleOpenColecoesFromGestao = (marca: MarcaSummary) => {
    setActiveMarca(marca);
    navigate('/colecoes?marca=' + encodeURIComponent(marca.id));
  };
  return (
    <div className="akr-app">
      <a href="#workspace-main" className="akr-skip">
        Pular para o conteúdo
      </a>
      <div className="akr-shell">
        <header className="akr-header">
          <div className="akr-topbar">
            <NavLink
              className="akr-wordmark"
              to={contextUrl('/dashboard')}
              aria-label="AKR Brands — Dashboard"
            >
              <strong>AKR</strong>
              <span className="akr-brand-dot" />
              <span>BRANDS</span>
            </NavLink>
            <nav
              ref={navigationRef}
              id="workspace-navigation"
              aria-label="Navegação principal"
              className={'akr-navigation ' + (mobile ? 'is-open' : '')}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setDropdown(null);
                  setMobile(false);
                }
              }}
            >
              <NavLink to={contextUrl('/colecoes')}>Coleções</NavLink>
              <NavLink to={contextUrl('/pecas')} aria-label="Peças / Fichas técnicas">
                Peças
              </NavLink>
              <div className="akr-nav-dropdown">
                <button
                  ref={reportsRef}
                  className={
                    ['/dashboard', '/bi', '/relatorios', '/products'].some((p) =>
                      location.pathname.startsWith(p)
                    )
                      ? 'active'
                      : ''
                  }
                  aria-expanded={dropdown === 'reports'}
                  aria-controls="workspace-reports"
                  onClick={() => setDropdown(dropdown === 'reports' ? null : 'reports')}
                >
                  Relatórios
                  <ChevronDown size={14} />
                </button>
                {dropdown === 'reports' && (
                  <div className="akr-nav-popover" id="workspace-reports">
                    <NavLink to={contextUrl('/dashboard')}>
                      <LayoutDashboard size={17} />
                      Dashboard
                    </NavLink>
                    <NavLink to={contextUrl('/bi')}>
                      <Gauge size={17} />
                      Relatórios e BI
                    </NavLink>
                    <NavLink to={contextUrl('/products')}>
                      <ArrowUpRight size={17} />
                      Catálogo Linx<small>Consulta</small>
                    </NavLink>
                  </div>
                )}
              </div>
              <div className="akr-nav-dropdown">
                <button
                  ref={manageRef}
                  className={location.pathname.startsWith('/gestao') ? 'active' : ''}
                  aria-expanded={dropdown === 'manage'}
                  aria-controls="workspace-management"
                  onClick={() => setDropdown(dropdown === 'manage' ? null : 'manage')}
                >
                  Gestão
                  <ChevronDown size={14} />
                </button>
                {dropdown === 'manage' && (
                  <div className="akr-nav-popover akr-management-menu" id="workspace-management">
                    {groups.map((group) => (
                      <div className="akr-nav-group" key={group.name}>
                        <p>{group.name}</p>
                        {group.items.map(([path, label, Icon]) => (
                          <NavLink key={path} to={contextUrl(path)}>
                            <Icon size={17} strokeWidth={1.6} />
                            <span>{label}</span>
                          </NavLink>
                        ))}
                      </div>
                    ))}
                    <NavLink className="akr-legacy-nav" to={contextUrl('/catalogo-legado')}>
                      <Layers size={17} />
                      Acervo anterior<small>Rascunhos</small>
                    </NavLink>
                  </div>
                )}
              </div>
              <NavLink to={contextUrl('/kanban')}>Kanban</NavLink>
            </nav>
            <button
              ref={contextTriggerRef}
              className="akr-icon-button akr-context-toggle"
              aria-label="Marca, coleção e busca"
              aria-expanded={contextOpen}
              aria-controls="workspace-context"
              onClick={() => {
                setContextOpen(!contextOpen);
                setMobile(false);
              }}
            >
              <Search size={18} />
            </button>
            <button
              ref={mobileRef}
              className="akr-icon-button akr-mobile-menu"
              aria-label={mobile ? 'Fechar navegação' : 'Abrir navegação'}
              aria-expanded={mobile}
              aria-controls="workspace-navigation"
              onClick={() => {
                setMobile(!mobile);
                setContextOpen(false);
              }}
            >
              {mobile ? <X size={20} /> : <Menu size={20} />}
            </button>
            <ThemeToggle />
            <NavLink
              className="akr-icon-button akr-notification"
              to={contextUrl('/notifications')}
              aria-label={
                'Itens que precisam de atenção' +
                (needsAttention ? ' (' + needsAttention + ')' : '')
              }
            >
              <Bell size={19} />
              {needsAttention > 0 && <i />}
            </NavLink>
            <div ref={profileRef} className="akr-profile">
              <button
                className="akr-profile-button"
                onClick={() => setProfile(!profile)}
                aria-expanded={profile}
                aria-label={'Conta de ' + (user?.nome ?? 'Usuário')}
              >
                <span>{user?.nome.charAt(0) ?? 'U'}</span>
                <ChevronDown size={13} />
              </button>
              {profile && (
                <div className="akr-profile-menu">
                  <strong>{user?.nome}</strong>
                  <small>{user?.email}</small>
                  <small>{user?.cargo}</small>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                  >
                    <LogOut size={16} />
                    Sair da conta
                  </button>
                </div>
              )}
            </div>
            <div
              ref={contextRef}
              id="workspace-context"
              className={'akr-contextbar ' + (contextOpen ? 'is-open' : '')}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setContextOpen(false);
              }}
            >
              <div className="akr-context">
                <Building2 size={16} aria-hidden />
                <label>
                  <span className="sr-only">Marca da área de trabalho</span>
                  <select
                    value={activeMarca?.id ?? ''}
                    onChange={(event) => {
                      const brand = brands.find((b) => b.id === event.target.value);
                      if (brand) {
                        setActiveMarca(brand);
                        setParams({ marca: brand.id });
                      }
                    }}
                  >
                    <option value="" disabled>
                      Selecione uma marca
                    </option>
                    {brands.map((b) => (
                      <option value={b.id} key={b.id}>
                        {b.nome}
                      </option>
                    ))}
                  </select>
                </label>
                <span className="akr-context-divider">/</span>
                <label>
                  <span className="sr-only">Coleção da área de trabalho</span>
                  <select
                    value={selectedCollection}
                    onChange={(event) => {
                      const next = new URLSearchParams(params);
                      if (event.target.value) next.set('colecao', event.target.value);
                      else next.delete('colecao');
                      setParams(next);
                    }}
                  >
                    <option value="">Todas as coleções</option>
                    {collections.rows.map((c) => (
                      <option key={c.id} value={c.data.id}>
                        {c.data.nome}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <form
                className="akr-search"
                role="search"
                onSubmit={(e) => {
                  e.preventDefault();
                  navigate(
                    contextUrl('/pecas') +
                      (activeMarca ? '&' : '?') +
                      'q=' +
                      encodeURIComponent(search)
                  );
                }}
              >
                <Search size={16} />
                <input
                  aria-label="Buscar modelos ou códigos"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar modelos ou códigos"
                />
                <kbd>↵</kbd>
              </form>
            </div>
          </div>
        </header>
        <main id="workspace-main" className="akr-main">
          {import.meta.env.VITE_TEST_ENVIRONMENT === 'true' && (
            <div className="akr-notice" role="status">
              Validação isolada · dados de teste · sem conexão com o ERP
            </div>
          )}
          <Outlet context={{ handleOpenColecoesFromGestao }} />
        </main>
      </div>
    </div>
  );
}
export default MainLayout;
