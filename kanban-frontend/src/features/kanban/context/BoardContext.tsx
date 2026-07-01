import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { getErrorMessage } from '../../../shared/api/api';
import type { BoardDetail, Project, TaskCard } from '../../../shared/types';
import { getProject } from '../../projects/api/projectsApi';
import { listBoards, getBoardDetail, createBoard, moveTask, createTask, updateTask } from '../api/kanbanApi';
import { planningApi } from '../../planning/api/planningApi';
import type { Sprint } from '../../../shared/types';

interface BoardContextValue {
  project: Project | null;
  board: BoardDetail | null;
  sprints: Sprint[];
  activeSprint: Sprint | null;
  loading: boolean;
  error: string;
  loadBoard: (projectId: string) => Promise<void>;
  loadSprints: (projectId: string) => Promise<void>;
  moveTaskOptimistic: (taskId: string, targetColId: string) => Promise<void>;
  createTaskOptimistic: (
    columnId: string,
    title: string,
    priority: string,
    assignee_id?: string,
    due_date?: string,
    sprint_id?: string | null
  ) => Promise<void>;
  updateTaskOptimistic: (taskId: string, updates: Partial<TaskCard> & { column_id?: string }) => Promise<void>;
}

const BoardContext = createContext<BoardContextValue | null>(null);

export function BoardProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<Project | null>(null);
  const [board, setBoard] = useState<BoardDetail | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBoard = useCallback(async (projectId: string) => {
    setLoading(true);
    setError('');
    try {
      const projData = await getProject(projectId);
      setProject(projData);

      const sprintsData = await planningApi.getSprints(projectId);
      setSprints(sprintsData);
      setActiveSprint(sprintsData.find(s => s.state === 'active') || null);

      const boards = await listBoards(projectId);
      let activeBoardId = '';

      if (boards.length === 0) {
        const newBoard = await createBoard(projectId, 'Tablero Principal');
        activeBoardId = newBoard.id;
      } else {
        activeBoardId = boards[0].id;
      }

      const boardDetail = await getBoardDetail(projectId, activeBoardId);
      setBoard(boardDetail);
    } catch (err) {
      setError(getErrorMessage(err, 'Error al cargar el tablero'));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSprints = useCallback(async (projectId: string) => {
    try {
      const sprintsData = await planningApi.getSprints(projectId);
      setSprints(sprintsData);
      setActiveSprint(sprintsData.find(s => s.state === 'active') || null);
    } catch (err) {
      console.error('Failed to load sprints', err);
    }
  }, []);

  const moveTaskOptimistic = async (taskId: string, targetColId: string) => {
    if (!board) return;

    const previousBoard = { ...board, columns: board.columns.map((c) => ({ ...c, tasks: [...c.tasks] })) };

    setBoard((prev) => {
      if (!prev) return prev;
      let movedTask: TaskCard | null = null;
      let sourceColId = '';

      const newColumns = prev.columns.map((col) => {
        const taskIndex = col.tasks.findIndex((t) => t.id === taskId);
        if (taskIndex > -1) {
          movedTask = col.tasks[taskIndex];
          sourceColId = col.id;
          return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) };
        }
        return col;
      });

      if (movedTask && sourceColId !== targetColId) {
        return {
          ...prev,
          columns: newColumns.map((col) => {
            if (col.id === targetColId) {
              return { ...col, tasks: [...col.tasks, movedTask!] };
            }
            return col;
          }),
        };
      } else {
         return prev;
      }
    });

    try {
      await moveTask(taskId, targetColId);
    } catch (err) {
      setBoard(previousBoard);
      alert(getErrorMessage(err, 'No se pudo mover la tarea'));
    }
  };

  const createTaskOptimistic = async (
    columnId: string,
    title: string,
    priority: string,
    assignee_id?: string,
    due_date?: string,
    sprint_id?: string | null
  ) => {
    if (!board) return;

    const tempId = `temp-${Date.now()}`;
    const newTask: TaskCard = {
      id: tempId,
      title,
      priority: priority as any,
      status: board.columns.find((c) => c.id === columnId)?.name || '',
      due_date: due_date || null,
      assignee: assignee_id || null, // UI mostrará ID temporalmente o lo resolverá
      sprint_id: sprint_id ?? null,
    };

    setBoard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        columns: prev.columns.map((col) => {
          if (col.id === columnId) {
            // Insert at the top as requested
            return { ...col, tasks: [newTask, ...col.tasks] };
          }
          return col;
        }),
      };
    });

    try {
      const createdTask = await createTask(board.id, {
        title,
        column_id: columnId,
        priority,
        assignee_id,
        due_date,
        sprint_id: sprint_id ?? undefined,
      } as any);
      
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          columns: prev.columns.map((col) => {
            if (col.id === columnId) {
              return {
                ...col,
                tasks: col.tasks.map((t) => (t.id === tempId ? createdTask : t)),
              };
            }
            return col;
          }),
        };
      });
    } catch (err) {
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          columns: prev.columns.map((col) => {
            if (col.id === columnId) {
              return { ...col, tasks: col.tasks.filter((t) => t.id !== tempId) };
            }
            return col;
          }),
        };
      });
      throw err;
    }
  };

  const updateTaskOptimistic = async (taskId: string, updates: Partial<TaskCard> & { column_id?: string }) => {
    if (!board) return;

    const previousBoard = { ...board, columns: board.columns.map((c) => ({ ...c, tasks: [...c.tasks] })) };
    const targetColId = updates.column_id;

    // Aplicar todos los updates (incluyendo move) en UN solo setBoard para evitar race conditions
    setBoard((prev) => {
      if (!prev) return prev;

      let movedTask: TaskCard | null = null;
      let sourceColId = '';

      // Paso 1: quitar la tarea de su columna origen y aplicar todos los field updates
      const afterRemove = prev.columns.map((col) => {
        const taskIndex = col.tasks.findIndex((t) => t.id === taskId);
        if (taskIndex > -1) {
          movedTask = { ...col.tasks[taskIndex], ...updates };
          delete (movedTask as any).column_id; // column_id no es un campo de TaskCard
          sourceColId = col.id;
          return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) };
        }
        return col;
      });

      if (!movedTask) return prev;

      if (targetColId && sourceColId !== targetColId) {
        // Paso 2a: insertar en columna destino (move + updates)
        return {
          ...prev,
          columns: afterRemove.map((col) => {
            if (col.id === targetColId) {
              return { ...col, tasks: [...col.tasks, movedTask!] };
            }
            return col;
          }),
        };
      } else {
        // Paso 2b: solo actualizar campos in-place (sin cambio de columna)
        return {
          ...prev,
          columns: prev.columns.map((col) => ({
            ...col,
            tasks: col.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
          })),
        };
      }
    });

    try {
      if (targetColId) {
        await moveTask(taskId, targetColId);
      }

      // Payload de campos (sin column_id — ya fue manejado por moveTask)
      const fieldPayload = { ...updates } as Record<string, unknown>;
      delete fieldPayload.column_id;

      if (Object.keys(fieldPayload).length > 0) {
        const updated = await updateTask(taskId, fieldPayload as Partial<TaskCard>);
        // Sincronizar la respuesta del servidor (por si el backend normaliza datos)
        setBoard((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            columns: prev.columns.map((col) => ({
              ...col,
              tasks: col.tasks.map((t) =>
                t.id === taskId ? { ...t, ...updated } : t
              ),
            })),
          };
        });
      }
    } catch (err) {
      setBoard(previousBoard);
      throw err;
    }
  };

  return (
    <BoardContext.Provider value={{ 
      project, board, sprints, activeSprint, loading, error, 
      loadBoard, loadSprints, moveTaskOptimistic, createTaskOptimistic, updateTaskOptimistic 
    }}>
      {children}
    </BoardContext.Provider>
  );
}

export function useBoard() {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard debe ser usado dentro de un BoardProvider');
  }
  return context;
}
