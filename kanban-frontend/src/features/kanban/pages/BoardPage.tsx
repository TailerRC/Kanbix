import Icon from '../../../shared/components/Icon';
import type { Prioridad } from '../../../shared/types';
import './BoardPage.css';

interface Card {
  id: string;
  title: string;
  priority: Prioridad;
  tags: string[];
  assignee: string;
  points: number;
  due?: string;
}

interface Column {
  id: string;
  name: string;
  color: string;
  cards: Card[];
}

const PRIORITY_COLOR: Record<Prioridad, string> = {
  Crítica: '#EF4444',
  Alta: '#EF4444',
  Media: '#F59E0B',
  Baja: '#3B82F6',
};

// Datos de demostración (se conectará a GET /projects/{id}/boards/{bid}).
const columns: Column[] = [
  {
    id: 'backlog',
    name: 'Backlog',
    color: '#94A3B8',
    cards: [
      { id: 'KBX-0151', title: 'Definir esquema de colección notifications', priority: 'Baja', tags: ['backend'], assignee: 'PV', points: 3 },
      { id: 'KBX-0150', title: 'Investigar Change Streams de MongoDB', priority: 'Media', tags: ['research'], assignee: 'RC', points: 5 },
    ],
  },
  {
    id: 'todo',
    name: 'To Do',
    color: '#3B82F6',
    cards: [
      { id: 'KBX-0148', title: 'Endpoint de carga de trabajo del equipo', priority: 'Alta', tags: ['backend', 'planning'], assignee: 'GC', points: 8, due: '02 Jul' },
      { id: 'KBX-0147', title: 'Maquetar tarjetas del tablero', priority: 'Media', tags: ['frontend'], assignee: 'AM', points: 3 },
    ],
  },
  {
    id: 'inprogress',
    name: 'In Progress',
    color: '#F59E0B',
    cards: [
      { id: 'KBX-0142', title: 'Implementar login con JWT + refresh', priority: 'Crítica', tags: ['backend', 'auth'], assignee: 'GC', points: 8, due: '30 Jun' },
      { id: 'KBX-0144', title: 'WebSocket de notificaciones en tiempo real', priority: 'Alta', tags: ['backend'], assignee: 'JC', points: 5 },
    ],
  },
  {
    id: 'review',
    name: 'In Review',
    color: '#8B5CF6',
    cards: [
      { id: 'KBX-0139', title: 'Validación de dependencias circulares (RN-27)', priority: 'Alta', tags: ['backend'], assignee: 'RC', points: 5 },
    ],
  },
  {
    id: 'done',
    name: 'Done',
    color: '#10B981',
    cards: [
      { id: 'KBX-0137', title: 'CRUD de proyectos y miembros', priority: 'Media', tags: ['backend'], assignee: 'PV', points: 8 },
      { id: 'KBX-0135', title: 'Sistema de diseño y tokens', priority: 'Baja', tags: ['frontend'], assignee: 'AM', points: 3 },
    ],
  },
];

function TaskCardItem({ card }: { card: Card }) {
  return (
    <article className="kcard" style={{ borderLeftColor: PRIORITY_COLOR[card.priority] }}>
      <div className="kcard__top">
        <span className="kcard__id">{card.id}</span>
        <span
          className="kcard__priority"
          style={{ color: PRIORITY_COLOR[card.priority], backgroundColor: `${PRIORITY_COLOR[card.priority]}1a` }}
        >
          {card.priority}
        </span>
      </div>
      <h4 className="kcard__title">{card.title}</h4>
      <div className="kcard__tags">
        {card.tags.map((t) => (
          <span key={t} className="kcard__tag">#{t}</span>
        ))}
      </div>
      <div className="kcard__footer">
        <span className="kcard__avatar">{card.assignee}</span>
        <div className="kcard__meta">
          {card.due && (
            <span className="kcard__due">
              <Icon name="report-doc" size={13} /> {card.due}
            </span>
          )}
          <span className="kcard__points">{card.points} pts</span>
        </div>
      </div>
    </article>
  );
}

export default function BoardPage() {
  return (
    <div className="board-page">
      <header className="board-page__header">
        <div>
          <h1 className="board-page__title">Tablero — Sprint 5</h1>
          <p className="board-page__subtitle">Kanbix Backend · 11 tareas activas</p>
        </div>
        <div className="board-page__actions">
          <button className="btn btn--outline btn--small">
            <Icon name="sprint" size={16} /> Sprint actual
          </button>
          <button className="board-page__add">
            <Icon name="plus" size={18} /> Nueva tarea
          </button>
        </div>
      </header>

      <div className="board-page__columns">
        {columns.map((col) => (
          <section key={col.id} className="kcolumn">
            <div className="kcolumn__header">
              <span className="kcolumn__title">
                <span className="kcolumn__dot" style={{ backgroundColor: col.color }} />
                {col.name}
                <span className="kcolumn__count">{col.cards.length}</span>
              </span>
              <button className="kcolumn__add" aria-label="Agregar tarea">
                <Icon name="plus" size={16} />
              </button>
            </div>
            <div className="kcolumn__cards">
              {col.cards.map((card) => (
                <TaskCardItem key={card.id} card={card} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
