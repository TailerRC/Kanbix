import { useState, useRef, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './Tooltip.css';

interface TooltipProps {
  text: string;
  children: ReactNode;
  delay?: number;
}

export default function Tooltip({ text, children, delay = 200 }: TooltipProps) {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        // Centered horizontally, positioned above
        setCoords({
          top: rect.top + window.scrollY - 8,
          left: rect.left + window.scrollX + rect.width / 2,
        });
      }
      setShow(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <>
      <div
        ref={wrapperRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>
      {show &&
        createPortal(
          <div
            className="k-tooltip"
            style={{
              top: coords.top,
              left: coords.left,
            }}
          >
            {text}
            <div className="k-tooltip-arrow" />
          </div>,
          document.body
        )}
    </>
  );
}
