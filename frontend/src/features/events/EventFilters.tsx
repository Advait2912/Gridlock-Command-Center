import React from 'react';
import { useMeta } from '../../hooks/useMeta';

interface EventFiltersProps {
  filters: {
    cause?: string;
    zone?: string;
  };
  onChange: (key: string, value: string) => void;
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 8px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--glass-border)',
};

export const EventFilters: React.FC<EventFiltersProps> = ({ filters, onChange }) => {
  const { data: meta, loading } = useMeta();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <div style={{ flex: 1 }}>
          <div className="eyebrow" style={{ marginBottom: 'var(--space-1)' }}>Cause</div>
          <select
            value={filters.cause || ''}
            onChange={(e) => onChange('cause', e.target.value)}
            style={selectStyle}
            disabled={loading}
          >
            <option value="">All Causes</option>
            {meta?.causes.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <div className="eyebrow" style={{ marginBottom: 'var(--space-1)' }}>Zone</div>
          <select
            value={filters.zone || ''}
            onChange={(e) => onChange('zone', e.target.value)}
            style={selectStyle}
            disabled={loading}
          >
            <option value="">All Zones</option>
            {meta?.zones.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};
