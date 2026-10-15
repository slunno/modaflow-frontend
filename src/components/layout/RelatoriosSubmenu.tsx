import { NavLink, useLocation } from 'react-router-dom';

const items = [
  { to: '/products', label: 'Peças' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/bi', label: 'Gráficos' },
];

export function RelatoriosSubmenu() {
  const { search } = useLocation();
  return (
    <nav
      aria-label="Submenu de Relatórios"
      className="bg-surface border-b border-border shadow-2xs sticky top-16 z-40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="overflow-x-auto scrollbar-none">
          <div className="flex w-max min-w-full items-center justify-center gap-6 py-3 text-xs font-semibold">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to + search}
                className={({ isActive }) =>
                  `whitespace-nowrap transition cursor-pointer pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-camel ${
                    isActive
                      ? 'text-primary font-bold border-b-2 border-primary'
                      : 'text-muted hover:text-primary'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
