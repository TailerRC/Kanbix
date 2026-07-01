import { useEffect, useRef, useState, useCallback } from 'react';
import Icon, { type IconName } from './Icon';
import api from '../api/api';
import './NotificationBell.css';

interface NotificationItem {
  id: string;
  tipo: string;
  mensaje: string;
  leida: boolean;
  fecha: string;
  datos?: Record<string, unknown>;
}

const TYPE_ICON: Record<string, { icon: IconName; color: string }> = {
  tarea_completada: { icon: 'check-circle', color: '#22C55E' },
  tarea_asignada: { icon: 'user', color: '#3B82F6' },
  tarea_movida: { icon: 'shuffle', color: '#0D9488' },
  deadline_proximo: { icon: 'clock', color: '#F97316' },
  mencion: { icon: 'bell', color: '#A855F7' },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  return `hace ${Math.floor(hrs / 24)} d`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = items.filter((n) => !n.leida).length;

  const fetchNotifs = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications', { params: { limite: 20 } });
      setItems(data.notificaciones ?? []);
    } catch {
      /* silencioso: no romper el topbar si falla */
    }
  }, []);

  // Carga inicial + sondeo cada 30s.
  useEffect(() => {
    fetchNotifs();
    const id = window.setInterval(fetchNotifs, 30000);
    return () => window.clearInterval(id);
  }, [fetchNotifs]);

  // Cerrar al hacer click fuera.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setLoading(true);
      await fetchNotifs();
      setLoading(false);
    }
  };

  const markRead = async (n: NotificationItem) => {
    if (n.leida) return;
    setItems((cur) => cur.map((i) => (i.id === n.id ? { ...i, leida: true } : i)));
    try {
      await api.put(`/notifications/${n.id}/read`);
    } catch {
      /* revertir no es crítico */
    }
  };

  const markAllRead = async () => {
    setItems((cur) => cur.map((i) => ({ ...i, leida: true })));
    try {
      await api.put('/notifications/read-all');
    } catch {
      /* noop */
    }
  };

  return (
    <div className="notif" ref={ref}>
      <button
        className="topbar__action-btn"
        aria-label="Notificaciones"
        title="Notificaciones"
        onClick={toggle}
      >
        <Icon name="bell" size={19} />
        {unread > 0 && <span className="notif__badge">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="notif__panel" role="menu">
          <div className="notif__header">
            <span className="notif__title">Notificaciones</span>
            {unread > 0 && (
              <button className="notif__markall" onClick={markAllRead}>
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="notif__list">
            {loading && items.length === 0 ? (
              <div className="notif__empty">Cargando…</div>
            ) : items.length === 0 ? (
              <div className="notif__empty">
                <Icon name="bell" size={22} />
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              items.map((n) => {
                const cfg = TYPE_ICON[n.tipo] ?? { icon: 'bell' as IconName, color: '#6B7280' };
                return (
                  <button
                    key={n.id}
                    className={`notif__item ${n.leida ? '' : 'notif__item--unread'}`}
                    onClick={() => markRead(n)}
                  >
                    <span className="notif__item-icon" style={{ color: cfg.color, background: `${cfg.color}1a` }}>
                      <Icon name={cfg.icon} size={16} />
                    </span>
                    <span className="notif__item-body">
                      <span className="notif__item-msg">{n.mensaje}</span>
                      <span className="notif__item-time">{timeAgo(n.fecha)}</span>
                    </span>
                    {!n.leida && <span className="notif__item-dot" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
