import { useState, useRef, useEffect } from 'react';
import Icon from '../../../shared/components/Icon';
import DatePickerPopover from './DatePickerPopover';
import { useBoard } from '../context/BoardContext';
import './InlineTaskForm.css';

interface InlineTaskFormProps {
  columnId: string;
  onClose: () => void;
}

export default function InlineTaskForm({ columnId, onClose }: InlineTaskFormProps) {
  const { createTaskOptimistic } = useBoard();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Media');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const formRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      // Si el clic es dentro de un popover del datepicker u otro dropdown, ignorarlo
      // Una forma sencilla es ver si hay elementos con clase .datepicker-popover padre de target
      const target = e.target as HTMLElement;
      if (target.closest('.datepicker-popover')) return;

      if (formRef.current && !formRef.current.contains(target)) {
        if (!title.trim()) {
          onClose();
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, title]);

  const handleSubmit = async () => {
    if (!title.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    setError('');
    try {
      await createTaskOptimistic(
        columnId,
        title.trim(),
        priority,
        undefined, // assignee_id (TBD: implementar selector de usuario si es necesario)
        dueDate ? dueDate.toISOString() : undefined
      );
      // Mantener abierto y limpiar para creación en cadena
      setTitle('');
      setDueDate(null);
      setPriority('Media');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus();
      }
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="inline-task-form" ref={formRef}>
      <textarea
        ref={textareaRef}
        className="inline-task-form__input"
        placeholder="¿Qué hay que hacer?"
        value={title}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        disabled={isSubmitting}
        rows={1}
      />
      
      {error && <div className="inline-task-form__error">{error}</div>}

      <div className="inline-task-form__actions">
        <div className="inline-task-form__tools">
          <select 
            value={priority} 
            onChange={(e) => setPriority(e.target.value)}
            className="inline-task-form__select"
            disabled={isSubmitting}
          >
            <option value="Baja">Baja</option>
            <option value="Media">Media</option>
            <option value="Alta">Alta</option>
            <option value="Crítica">Crítica</option>
          </select>

          <DatePickerPopover
            value={dueDate}
            onChange={setDueDate}
            trigger={
              <button 
                type="button" 
                className={`inline-task-form__tool-btn ${dueDate ? 'active' : ''}`}
                title="Fecha de vencimiento"
                disabled={isSubmitting}
              >
                <Icon name="report-doc" size={16} />
                {dueDate && <span style={{ marginLeft: 4, fontSize: 11 }}>{dueDate.getDate()}/{dueDate.getMonth() + 1}</span>}
              </button>
            }
          />

          <button type="button" className="inline-task-form__tool-btn" title="Asignar a..." disabled={isSubmitting}>
            <Icon name="users" size={16} />
          </button>
        </div>

        <button 
          className={`inline-task-form__submit ${title.trim() ? 'active' : ''}`}
          onClick={handleSubmit}
          disabled={!title.trim() || isSubmitting}
        >
          {isSubmitting ? <Icon name="loader" size={16} /> : <Icon name="arrow-right" size={16} />}
        </button>
      </div>
    </div>
  );
}
