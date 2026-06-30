export type GroupByOption = 'none' | 'assignee' | 'subtask';

interface GroupByDropdownProps {
  value: GroupByOption;
  onChange: (value: GroupByOption) => void;
}

export default function GroupByDropdown({ value, onChange }: GroupByDropdownProps) {
  return (
    <div className="group-by-dropdown" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <label htmlFor="group-by-select" style={{ fontSize: '13px', color: 'var(--color-text-light)', fontWeight: 500 }}>
        Grupo:
      </label>
      <select
        id="group-by-select"
        value={value}
        onChange={(e) => onChange(e.target.value as GroupByOption)}
        style={{
          padding: '4px 8px',
          borderRadius: '6px',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          fontSize: '13px',
          cursor: 'pointer',
          outline: 'none'
        }}
      >
        <option value="none">Nada</option>
        <option value="assignee">Persona asignada</option>
        <option value="subtask">Subtask</option>
      </select>
    </div>
  );
}
