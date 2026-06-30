import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import type { TaskCard, BoardDetail, Prioridad } from '../../../shared/types';
import BoardHeader from '../components/BoardHeader';
import CardContextMenu from '../components/CardContextMenu';
import type { GroupByOption } from '../components/GroupByDropdown';
import InlineTaskForm from '../components/InlineTaskForm';
import DroppableColumn from '../components/DroppableColumn';
import TaskDetailModal from '../components/TaskDetailModal';
import Tooltip from '../../../shared/components/Tooltip';
import { BoardProvider, useBoard } from '../context/BoardContext';
import { DndContext, type DragEndEvent, closestCorners, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './BoardPage.css';

// ─── Priority config ─────────────────────────────────────────────────────────
const PRIORITY_COLOR: Record<Prioridad, string> = {
  Crítica: '#EF4444',
  Alta:    '#F97316',
  Media:   '#F59E0B',
  Baja:    '#3B82F6',
};

// ─── Column visual config ─────────────────────────────────────────────────────
const COLUMN_DOT_COLOR: Record<string, string> = {
  'To Do':       '#94A3B8',
  'In Progress': '#3B82F6',
  'In Review':   '#F97316',
  'Done':        '#22C55E',
};

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface UITaskCard extends TaskCard {
  tags?: string[];
  points?: number;
}

// ─── TaskCardItem ─────────────────────────────────────────────────────────────
function TaskCardItem({
  card,
  board,
  currentColumnId,
  onOpenDetail,
}: {
  card: UITaskCard;
  board: BoardDetail;
  currentColumnId: string;
  onOpenDetail: () => void;
}) {
  const { moveTaskOptimistic } = useBoard();
  const priority = (card.priority || 'Media') as Prioridad;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { card, columnId: currentColumnId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  // Due date logic
  let isOverdue = false;
  let dueDateDisplay = '';
  let fullDateDisplay = '';
  if (card.due_date) {
    const due = new Date(card.due_date);
    due.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    isOverdue = due.getTime() < today.getTime();
    dueDateDisplay = due.toLocaleDateString('es-PE', {
      month: 'short',
      day: 'numeric',
      year: due.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
    fullDateDisplay = due.toLocaleDateString('es-PE', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  return (
    <article
      className="kcard"
      ref={setNodeRef}
      style={{ ...style, borderLeftColor: PRIORITY_COLOR[priority] }}
      onDoubleClick={(e) => { e.preventDefault(); onOpenDetail(); }}
      {...attributes}
      {...listeners}
    >
      {/* Top row: ID + priority badge + context menu */}
      <div className="kcard__top">
        <span className="kcard__id">KBX-{card.id.substring(card.id.length - 4).toUpperCase()}</span>
        <div className="kcard__top-right">
          <span
            className="kcard__priority"
            style={{ color: PRIORITY_COLOR[priority], backgroundColor: `${PRIORITY_COLOR[priority]}18` }}
          >
            {priority}
          </span>
          <div onPointerDown={(e) => e.stopPropagation()}>
            <CardContextMenu card={card} board={board} currentColumnId={currentColumnId} onMove={moveTaskOptimistic} />
          </div>
        </div>
      </div>

      {/* Title */}
      <h4 className="kcard__title">{card.title}</h4>

      {/* Tags */}
      {card.tags && card.tags.length > 0 && (
        <div className="kcard__tags">
          {card.tags.map((t) => (
            <span key={t} className="kcard__tag">#{t}</span>
          ))}
        </div>
      )}

      {/* Footer: avatar + meta (date, points) */}
      <div className="kcard__footer">
        {/* Avatar con iniciales */}
        <Tooltip text={card.assignee || 'Sin asignar'}>
          <span className="kcard__avatar" aria-label={card.assignee || 'Sin asignar'}>
            {card.assignee ? getInitials(card.assignee) : <Icon name="user" size={11} />}
          </span>
        </Tooltip>

        <div className="kcard__meta">
          {card.due_date && (
            isOverdue ? (
              <Tooltip text={`Venció el ${fullDateDisplay}`}>
                <span className="kcard__due kcard__due--overdue">
                  <Icon name="alert-triangle" size={11} />
                  {dueDateDisplay}
                </span>
              </Tooltip>
            ) : (
              <Tooltip text={`Vence el ${fullDateDisplay}`}>
                <span className="kcard__due">
                  <Icon name="calendar" size={11} />
                  {dueDateDisplay}
                </span>
              </Tooltip>
            )
          )}
          {card.story_points != null && (
            <span className="kcard__points">{card.story_points}p</span>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── BoardContent ─────────────────────────────────────────────────────────────
function BoardContent() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { project, board, activeSprint, loading, error, loadBoard, moveTaskOptimistic } = useBoard();
  const [groupBy, setGroupBy] = useState<GroupByOption>('none');
  const [addingTaskColId, setAddingTaskColId] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<UITaskCard | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    if (!projectId) {
      const lastProjectId = localStorage.getItem('lastProjectId');
      if (lastProjectId) navigate(`/proyectos/${lastProjectId}/tablero`, { replace: true });
      else navigate('/projects', { replace: true });
      return;
    }
    localStorage.setItem('lastProjectId', projectId);
    loadBoard(projectId);
  }, [projectId, navigate, loadBoard]);

  const handleDragStart = (event: any) => {
    setActiveCard(event.active.data.current?.card || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const activeColumnId = active.data.current?.columnId;
    const overColumnId = over.data.current?.columnId || over.id;

    if (activeColumnId !== overColumnId) {
      moveTaskOptimistic(activeId, overColumnId as string);
    }
  };

  if (loading) return <div className="app-loader">Cargando tablero...</div>;
  if (error)   return <div style={{ padding: '24px', color: 'var(--color-danger)' }}>{error}</div>;
  if (!project || !board) return null;

  // ── Filtrar columna "Backlog" del Kanban: va a la vista /backlog ──────────
  const kanbanColumnsRaw = board.columns.filter(
    (col) => col.name.toLowerCase() !== 'backlog'
  );

  // ── Solo mostrar tareas del sprint activo ──────────
  const kanbanColumns = kanbanColumnsRaw.map(col => ({
    ...col,
    tasks: col.tasks.filter(t => activeSprint && t.sprint_id === activeSprint.id)
  }));

  const totalTasks = kanbanColumns.reduce((acc, col) => acc + col.tasks.length, 0);

  // Grupos para la vista "Agrupar por"
  let renderGroups: { title: string; columns: typeof kanbanColumns }[] = [];

  if (groupBy === 'none') {
    renderGroups = [{ title: '', columns: kanbanColumns }];
  } else if (groupBy === 'assignee') {
    const assignees = new Set<string>();
    kanbanColumns.forEach((col) => col.tasks.forEach((t) => assignees.add(t.assignee || 'Sin asignar')));
    Array.from(assignees).sort().forEach((assignee) => {
      renderGroups.push({
        title: assignee,
        columns: kanbanColumns.map((col) => ({
          ...col,
          tasks: col.tasks.filter((t) => (t.assignee || 'Sin asignar') === assignee),
        })),
      });
    });
  } else if (groupBy === 'subtask') {
    renderGroups = [{ title: 'Sin padre (TBD)', columns: kanbanColumns }];
  }



  let boardContent = null;
  if (!activeSprint) {
    boardContent = (
      <div className="board-page__no-sprint">
        <Icon name="inbox" size={48} />
        <h2>No hay ningún sprint activo</h2>
        <p>Para ver tareas en el tablero, inicia un sprint desde el Backlog.</p>
        <button className="k-btn-primary" onClick={() => navigate(`/proyectos/${projectId}/backlog`)}>
          Ir al Backlog
        </button>
        {addingTaskColId && (
          <div style={{ marginTop: 24, width: '100%', maxWidth: 400, textAlign: 'left' }}>
            <InlineTaskForm columnId={addingTaskColId} onClose={() => setAddingTaskColId(null)} />
          </div>
        )}
      </div>
    );
  } else {
    boardContent = (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="board-page__canvas">
          {renderGroups.map((group, i) => (
            <div key={i} className="board-page__group">
              {group.title && (
                <h3 className="board-page__group-title">
                  <Icon name="users" size={15} /> {group.title}
                </h3>
              )}
              <div className="board-page__columns">
                {group.columns.map((col) => {
                  const dotColor = COLUMN_DOT_COLOR[col.name] ?? '#94A3B8';
                  return (
                    <SortableContext
                      key={col.id}
                      id={col.id}
                      items={col.tasks.map((t) => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <DroppableColumn id={col.id}>
                        <div className="kcolumn__header">
                          <span className="kcolumn__title">
                            <span className="kcolumn__dot" style={{ backgroundColor: dotColor }} />
                            {col.name}
                            <span className="kcolumn__count">{col.tasks.length}</span>
                          </span>
                          <button
                            className="kcolumn__add"
                            aria-label="Agregar tarea"
                            onClick={() => setAddingTaskColId(col.id)}
                          >
                            <Icon name="plus" size={15} />
                          </button>
                        </div>
                        <div className="kcolumn__cards">
                          {col.tasks.map((card) => (
                            <TaskCardItem
                              key={card.id}
                              card={card}
                              board={board}
                              currentColumnId={col.id}
                              onOpenDetail={() => setEditingTaskId(card.id)}
                            />
                          ))}
                          {addingTaskColId === col.id && (
                            <InlineTaskForm
                              columnId={col.id}
                              onClose={() => setAddingTaskColId(null)}
                            />
                          )}
                        </div>
                      </DroppableColumn>
                    </SortableContext>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeCard && board ? (
            <TaskCardItem card={activeCard} board={board} currentColumnId="" onOpenDetail={() => {}} />
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  }

  return (
    <div className="board-page">
      <BoardHeader
        projectName={project.name}
        boardName={board.name}
        taskCount={totalTasks}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        onNewTask={() => {
          if (activeSprint && kanbanColumns.length > 0) {
            setAddingTaskColId(kanbanColumns[0].id);
          } else {
            const backlogCol = board.columns.find(c => c.name.toLowerCase() === 'backlog');
            if (backlogCol) setAddingTaskColId(backlogCol.id);
          }
        }}
        projectId={projectId}
      />

      {boardContent}

      {editingTaskId && (
        <TaskDetailModal taskId={editingTaskId} onClose={() => setEditingTaskId(null)} />
      )}
    </div>
  );
}

export default function BoardPage() {
  return (
    <BoardProvider>
      <BoardContent />
    </BoardProvider>
  );
}
