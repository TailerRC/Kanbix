import { useState, useRef, useEffect } from 'react';
import Icon from '../../../shared/components/Icon';
import type { TaskCard, BoardDetail } from '../../../shared/types';
import './CardContextMenu.css';

interface CardContextMenuProps {
  card: TaskCard;
  board: BoardDetail;
  currentColumnId: string;
  onMove: (taskId: string, targetColumnId: string) => void;
}

export default function CardContextMenu({ card, board, currentColumnId, onMove }: CardContextMenuProps) {
  const [open, setOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const otherColumns = board.columns.filter((col) => col.id !== currentColumnId);

  const handleAction = (actionName: string) => {
    console.log(`Acción ejecutada: ${actionName}`);
    setOpen(false);
  };

  return (
    <div className="card-context-menu" ref={menuRef}>
      <button
        className="card-context-menu__trigger"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        title="Opciones de tarjeta"
      >
        <Icon name="more-vertical" size={16} />
      </button>

      {open && (
        <div className="card-context-menu__dropdown">
          <ul className="card-context-menu__list">
            
            <li 
              className="has-submenu"
              onMouseEnter={() => setActiveSubmenu('estado')}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <button className="submenu-trigger" onClick={(e) => e.stopPropagation()}>
                Cambiar estado <Icon name="chevron-right" size={14} />
              </button>
              {activeSubmenu === 'estado' && (
                <div className="card-context-menu__submenu">
                  <div className="card-context-menu__header">Mover a...</div>
                  <ul className="card-context-menu__list">
                    {otherColumns.map((col) => (
                      <li key={col.id}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMove(card.id, col.id);
                            setOpen(false);
                          }}
                        >
                          {col.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>

            <li><button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(window.location.origin + '/tarea/' + card.id); handleAction('Copiar enlace'); }}>Copiar enlace</button></li>
            <li><button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(card.id.substring(card.id.length - 6).toUpperCase()); handleAction('Copiar clave'); }}>Copiar clave</button></li>
            <li><button onClick={(e) => { e.stopPropagation(); handleAction('Añadir marca'); }}>Añadir marca</button></li>
            <li><button onClick={(e) => { e.stopPropagation(); handleAction('Añadir etiqueta'); }}>Añadir etiqueta</button></li>
            <li><button onClick={(e) => { e.stopPropagation(); handleAction('Vincular actividad'); }}>Vincular actividad</button></li>
            
            <li 
              className="has-submenu"
              onMouseEnter={() => setActiveSubmenu('portada')}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <button className="submenu-trigger" onClick={(e) => e.stopPropagation()}>
                Seleccionar portada <Icon name="chevron-right" size={14} />
              </button>
              {activeSubmenu === 'portada' && (
                <div className="card-context-menu__submenu">
                  <div className="card-context-menu__header">Color</div>
                  <ul className="card-context-menu__list">
                    <li><button onClick={(e) => { e.stopPropagation(); handleAction('Portada Roja'); }}>Rojo</button></li>
                    <li><button onClick={(e) => { e.stopPropagation(); handleAction('Portada Azul'); }}>Azul</button></li>
                  </ul>
                </div>
              )}
            </li>

          </ul>
        </div>
      )}
    </div>
  );
}
