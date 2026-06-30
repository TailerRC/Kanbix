import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';

interface DroppableColumnProps {
  id: string;
  children: ReactNode;
}

export default function DroppableColumn({ id, children }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { columnId: id },
  });

  return (
    <section
      ref={setNodeRef}
      className={`kcolumn ${isOver ? 'kcolumn--drag-over' : ''}`}
      style={{
        backgroundColor: isOver ? 'var(--color-bg-hover)' : undefined,
        transition: 'background-color 0.2s ease',
      }}
    >
      {children}
    </section>
  );
}
