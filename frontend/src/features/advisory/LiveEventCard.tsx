import React from 'react';
import { Advisory } from '../../services/types';

interface LiveEvent {
  id: string;
  advisory: Advisory;
  addedAt: Date;
}

interface LiveEventCardProps {
  event: LiveEvent;
  nearbyEvents: { event: LiveEvent; distanceKm: number }[];
  onRemove: (id: string) => void;
  onMapFocus: (lat: number, lon: number) => void;
}

const fmtPct = (p?: number | null) => p != null ? `${(p * 100).toFixed(0)}%` : '—';
const fmtNum = (n?: number | null, digits = 1) => n != null && !Number.isNaN(n) ? Number(n).toFixed(digits) : '—';

const riskClass = (p?: number | null) => {
  if (p == null) return '';
  if (p >= 0.7) return 'status-tag-high';
  if (p >= 0.4) return 'status-tag-medium';
  return 'status-tag-low';
};

const DataCell: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <span className="eyebrow" style={{ color: 'var(--text-muted)', marginBottom: '2px', fontSize: '10px' }}>{label}</span>
    <span className="metric metric-sm" style={{ color: 'var(--text-primary)' }}>{value}</span>
  </div>
);

export const LiveEventCard: React.FC<LiveEventCardProps> = ({ event, nearbyEvents, onRemove, onMapFocus }) => {
  const a = event.advisory;

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'button') return;
    if (a.latitude != null && a.longitude != null) {
      onMapFocus(a.latitude, a.longitude);
    }
  };

  const getDurationValue = () => {
    if (!a.duration) return '—';
    if (a.duration.type === 'quantile') return `${fmtNum(a.duration.p50_hrs)}h`;
    if (a.duration.type === 'band') return `${a.duration.band}`;
    return 'Escalation';
  };

  return (
    <div
      id={`livecard-${event.id}`}
      className="glass-panel"
      style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-3)', cursor: 'pointer' }}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
            {a.event_cause.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </div>
          <div className="eyebrow" style={{ marginTop: '2px' }}>{a.zone}</div>
        </div>
        <span className={`status-tag ${riskClass(a.closure_probability)}`} style={{ fontSize: '10px', flexShrink: 0, padding: '2px 6px' }}>
          {a.closure_probability != null ? (a.closure_probability >= 0.7 ? 'Critical' : a.closure_probability >= 0.4 ? 'Elevated' : 'Low') : 'Unknown'}
        </span>
      </div>

      {/* Grid of metrics (2x2) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
        <DataCell label="Closure Prob" value={fmtPct(a.closure_probability)} />
        <DataCell label="Duration (P50)" value={getDurationValue()} />
        <DataCell label="Officers" value={a.recommended_officers} />
        {a.recommended_tow_trucks != null && (
          <DataCell label="Tow Trucks" value={a.recommended_tow_trucks} />
        )}
      </div>

      {/* Compact warnings & suggestions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
        {a.signal_timing_suggestion && (
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)' }}>
            <div className="eyebrow" style={{ color: 'var(--text-muted)', fontSize: '10px', marginBottom: '2px' }}>Signal timing</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{a.signal_timing_suggestion}</div>
          </div>
        )}

        {a.spatial_warning && (
          <div style={{ background: 'var(--status-warning-bg)', padding: 'var(--space-2)', borderLeft: '2px solid var(--status-warning)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '11px', color: 'var(--status-warning)' }}>{a.spatial_warning}</div>
          </div>
        )}

        {nearbyEvents.length > 0 && (
          <div style={{ background: 'var(--status-danger-bg)', padding: 'var(--space-2)', borderLeft: '2px solid var(--status-danger)', borderRadius: 'var(--radius-sm)' }}>
            <div className="eyebrow" style={{ color: 'var(--status-danger)', fontSize: '10px', marginBottom: '2px' }}>Compounding Risk</div>
            <div style={{ fontSize: '11px', color: 'var(--status-danger)' }}>
              {nearbyEvents.length} nearby: {nearbyEvents.map(n => `${n.event.advisory.event_cause.replace(/_/g, ' ')} (${n.distanceKm.toFixed(1)}km)`).join(', ')}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: 'var(--space-2)' }}>
        <span className="metric" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
          {event.addedAt.toLocaleTimeString()}
        </span>
        <button
          style={{
            padding: '3px 8px',
            fontSize: '11px',
            fontWeight: 600,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontFamily: 'var(--font-display)',
          }}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(event.id);
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--status-danger)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          Remove
        </button>
      </div>
    </div>
  );
};
