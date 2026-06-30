import { useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import GroupByDropdown, { type GroupByOption } from './GroupByDropdown';

interface BoardHeaderProps {
  projectName: string;
  boardName: string;
  taskCount: number;
  groupBy: GroupByOption;
  onGroupByChange: (val: GroupByOption) => void;
  onNewTask: () => void;
  projectId?: string;
}

export default function BoardHeader({
  projectName,
  boardName,
  taskCount,
  groupBy,
  onGroupByChange,
  onNewTask,
  projectId,
}: BoardHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="board-page__header">
      {/* Fila superior: título + acciones */}
      <div className="board-page__header-top">
        <div>
          <h1 className="board-page__title">{projectName} — {boardName}</h1>
          <p className="board-page__subtitle">{taskCount} tareas activas</p>
        </div>
        <div className="board-page__actions">
          <GroupByDropdown value={groupBy} onChange={onGroupByChange} />
          <button
            className="board-page__add btn btn--primary"
            onClick={onNewTask}
          >
            <Icon name="plus" size={16} /> Nueva tarea
          </button>
        </div>
      </div>

      {/* Fila de tabs: Backlog | Tablero */}
      {projectId && (
        <nav className="board-page__tabs" aria-label="Vistas del proyecto">
          <button
            id="tab-backlog-board"
            className="board-page__tab"
            onClick={() => navigate(`/proyectos/${projectId}/backlog`)}
          >
            <Icon name="list" size={14} /> Backlog
          </button>
          <button
            id="tab-tablero-board"
            className="board-page__tab board-page__tab--active"
            onClick={() => navigate(`/proyectos/${projectId}/tablero`)}
          >
            <Icon name="layout" size={14} /> Tablero
          </button>
        </nav>
      )}
    </header>
  );
}
