/**
 * ============================================================================
 * PÁGINA: Central de Notificações (NotificationsPage)
 * ARQUIVO: src/pages/Notifications/NotificationsPage.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Central de avisos e notificações do sistema PLM.
 *            Suporta filtragem por status (todas, não lidas, lidas), busca,
 *            marcação individual e em lote com feedback visual.
 * ============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import type { NotificationItem } from '../../types/plm';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../services/plmService';
import {
  Bell,
  CheckCheck,
  Check,
  Search,
  AlertCircle,
  Clock,
  Info,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<'todas' | 'nao_lidas' | 'lidas'>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getNotifications()
      .then((data) => {
        if (isMounted) {
          setNotifications(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })));
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const matchStatus =
        filterStatus === 'todas' ? true : filterStatus === 'nao_lidas' ? !item.lida : item.lida;

      const matchQuery =
        searchQuery === '' ||
        item.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.mensagem.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.categoria && item.categoria.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchStatus && matchQuery;
    });
  }, [notifications, filterStatus, searchQuery]);

  const unreadCount = notifications.filter((n) => !n.lida).length;

  const renderIcon = (tipo: NotificationItem['tipo']) => {
    switch (tipo) {
      case 'alerta':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'urgente':
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case 'sucesso':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-accent-camel" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200 font-sans">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-muted pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-camel/10 text-accent-camel border border-accent-camel/20 text-xs font-bold mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>Central de Avisos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-primary tracking-wide">
            Notificações do Sistema
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Acompanhe movimentações de fichas técnicas, prazos de entrega e alertas de produção.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="self-start sm:self-auto px-4 py-2 rounded-lg bg-surface border border-border text-primary hover:bg-surface-muted transition-all duration-200 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <CheckCheck className="w-4 h-4 text-accent-camel" />
            <span>Marcar todas como lidas</span>
          </button>
        )}
      </div>

      {/* BARRA DE FILTROS & BUSCA */}
      <div className="bg-surface p-4 rounded-xl border border-border shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* FILTRO STATUS */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterStatus('todas')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              filterStatus === 'todas'
                ? 'bg-primary text-white shadow-2xs'
                : 'bg-surface-muted text-muted-foreground hover:bg-border-muted'
            }`}
          >
            Todas ({notifications.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('nao_lidas')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              filterStatus === 'nao_lidas'
                ? 'bg-primary text-white shadow-2xs'
                : 'bg-surface-muted text-muted-foreground hover:bg-border-muted'
            }`}
          >
            <span>Não lidas</span>
            {unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-accent-camel text-white text-[10px] flex items-center justify-center font-extrabold">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('lidas')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              filterStatus === 'lidas'
                ? 'bg-primary text-white shadow-2xs'
                : 'bg-surface-muted text-muted-foreground hover:bg-border-muted'
            }`}
          >
            Lidas ({notifications.length - unreadCount})
          </button>
        </div>

        {/* BUSCA */}
        <div className="relative sm:w-72">
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar notificações..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200"
          />
        </div>
      </div>

      {/* LISTAGEM DE NOTIFICAÇÕES */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-surface p-12 rounded-xl border border-border text-center text-xs text-muted">
            Carregando notificações...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-surface p-12 rounded-xl border border-border text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-accent-camel/10 text-accent-camel flex items-center justify-center mx-auto border border-accent-camel/20">
              <Bell className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-bold font-editorial text-primary">
              Nenhuma notificação encontrada
            </h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Você está em dia com todas as atualizações e alertas de produção.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border transition-all duration-200 flex items-start justify-between gap-4 ${
                notif.lida
                  ? 'bg-surface border-border-muted opacity-80'
                  : 'bg-surface border-accent-camel/40 shadow-2xs ring-1 ring-accent-camel/20'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-surface-muted border border-border shrink-0 mt-0.5">
                  {renderIcon(notif.tipo)}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-xs font-bold text-primary font-editorial">
                      {notif.titulo}
                    </h4>
                    {notif.categoria && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface-muted border border-border text-muted uppercase tracking-wider">
                        {notif.categoria}
                      </span>
                    )}
                    {!notif.lida && (
                      <span className="inline-block w-2 h-2 rounded-full bg-accent-camel" />
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{notif.mensagem}</p>

                  <div className="flex items-center gap-1.5 text-[11px] text-muted pt-1">
                    <Clock className="w-3 h-3" />
                    <span>{notif.data}</span>
                  </div>
                </div>
              </div>

              {/* AÇÕES DA NOTIFICAÇÃO */}
              <div className="flex items-center gap-2 shrink-0">
                {notif.link && (
                  <button
                    type="button"
                    onClick={() => navigate(notif.link!)}
                    className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition cursor-pointer"
                    title="Acessar página de destino"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}

                {!notif.lida && (
                  <button
                    type="button"
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="p-1.5 rounded-lg text-muted hover:text-accent-camel hover:bg-accent-camel/10 transition cursor-pointer"
                    title="Marcar como lida"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default NotificationsPage;
