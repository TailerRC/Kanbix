import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../../../shared/components/Icon';
import './DatePickerPopover.css';

interface DatePickerPopoverProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  trigger: React.ReactNode;
}

export default function DatePickerPopover({ value, onChange, trigger }: DatePickerPopoverProps) {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const [inputValue, setInputValue] = useState(value ? value.toLocaleDateString('es-PE') : '');
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!open || !triggerRef.current || !popoverRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();

    let top = triggerRect.bottom + window.scrollY + 8;
    let left = triggerRect.left + window.scrollX;

    // Si no hay espacio abajo, abrir hacia arriba
    if (top + popoverRect.height > window.innerHeight + window.scrollY) {
      top = triggerRect.top + window.scrollY - popoverRect.height - 8;
    }

    // Ajustar si se sale por la derecha
    if (left + popoverRect.width > window.innerWidth + window.scrollX) {
      left = window.innerWidth + window.scrollX - popoverRect.width - 16;
    }

    setCoords({ top, left });
  };

  useEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true); // true para capturar scroll en contenedores
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, currentMonth]); // Re-calcular si cambia el tamaño

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open && value) {
      setCurrentMonth(value);
      setInputValue(value.toLocaleDateString('es-PE'));
    } else if (!value) {
      setInputValue('');
    }
  }, [open, value]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  // El getDay() devuelve 0 para Domingo, 1 para Lunes. Convertimos para que Lunes sea 0 y Domingo 6.
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const firstDayOfMonth = firstDay === 0 ? 6 : firstDay - 1;
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const handlePrevYear = () => setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1));
  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const handleNextYear = () => setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1));

  const isSelected = (day: number) => {
    if (!value) return false;
    return value.getDate() === day && value.getMonth() === currentMonth.getMonth() && value.getFullYear() === currentMonth.getFullYear();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === currentMonth.getMonth() && today.getFullYear() === currentMonth.getFullYear();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    const parts = e.target.value.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      if (day > 0 && month >= 0 && month < 12 && year > 2000) {
        const newDate = new Date(year, month, day);
        if (!isNaN(newDate.getTime())) {
          onChange(newDate);
          setCurrentMonth(newDate);
        }
      }
    }
  };

  const popoverContent = open ? (
    <div 
      className="datepicker-popover" 
      ref={popoverRef}
      style={{ top: coords.top, left: coords.left }}
    >
      <div className="datepicker-header">
        <span className="datepicker-title">Fecha de vencimiento</span>
      </div>

      <div className="datepicker-input-wrapper">
        <input 
          type="text" 
          className="datepicker-input" 
          placeholder="DD/MM/YYYY"
          value={inputValue}
          onChange={handleInputChange}
        />
        <button 
          className="datepicker-clear" 
          onClick={() => { onChange(null); setInputValue(''); setOpen(false); }} 
          title="Limpiar fecha"
        >
          <Icon name="x" size={14} />
        </button>
      </div>
      
      <div className="datepicker-controls">
        <button type="button" onClick={handlePrevYear} title="Año anterior">«</button>
        <button type="button" onClick={handlePrevMonth} title="Mes anterior">‹</button>
        <span className="datepicker-month-year">
          {currentMonth.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}
        </span>
        <button type="button" onClick={handleNextMonth} title="Mes siguiente">›</button>
        <button type="button" onClick={handleNextYear} title="Año siguiente">»</button>
      </div>

      <div className="datepicker-grid">
        {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(d => <div key={d} className="datepicker-day-name">{d}</div>)}
        {blanks.map(b => <div key={`blank-${b}`} className="datepicker-day empty"></div>)}
        {days.map(d => (
          <button
            key={d}
            type="button"
            className={`datepicker-day ${isSelected(d) ? 'selected' : ''} ${isToday(d) ? 'today' : ''}`}
            onClick={() => {
              onChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d));
              setOpen(false);
            }}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <>
      <div 
        className="datepicker-trigger" 
        ref={triggerRef} 
        onClick={() => setOpen(!open)}
      >
        {trigger}
      </div>
      {open && createPortal(popoverContent, document.body)}
    </>
  );
}
