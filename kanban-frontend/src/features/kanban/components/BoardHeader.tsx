import Icon from '../../../shared/components/Icon';
import ProjectTabs from '../../../shared/components/ProjectTabs';
import GroupByDropdown, { type GroupByOption } from './GroupByDropdown';

interface BoardHeaderProps {
  projectName: string;
  boardName: string;
  taskCount: number;
  groupBy: GroupByOption;
  onGroupByChange: (val: GroupByOption) => void;
  onNewTask: () => void;
  projectId?: string;
  activeSprintName?: string | null;
  onCompleteSprint?: () => void;
}

export default function BoardHeader({
  projectName,
  boardName,
  taskCount,
  groupBy,
  onGroupByChange,
  onNewTask,
  projectId,
  activeSprintName,
  onCompleteSprint,
}: BoardHeaderProps) {
  return (
    <header className="board-page__header">
      {/* Fila superior: título + acciones */}
      <div className="board-page__header-top">
        <div>
          <h1 className="board-page__title">{projectName} — {boardName}</h1>
          <p className="board-page__subtitle">
            {taskCount} tareas activas
            {activeSprintName ? ` · Sprint activo: ${activeSprintName}` : ''}
          </p>
        </div>
        <div className="board-page__actions">
          <GroupByDropdown value={groupBy} onChange={onGroupByChange} />
          {activeSprintName && onCompleteSprint && (
            <button className="board-page__complete btn btn--primary" onClick={onCompleteSprint}>
              <Icon name="check" size={16} /> Completar sprint
            </button>
          )}
          <button
            className="board-page__add btn btn--primary"
            onClick={onNewTask}
          >
            <Icon name="plus" size={16} /> Nueva tarea
          </button>
        </div>
      </div>

      {/* Barra de pestañas del proyecto (Resumen, Backlog, Tablero, …) */}
      {projectId && <ProjectTabs projectId={projectId} />}
    </header>
  );
}
