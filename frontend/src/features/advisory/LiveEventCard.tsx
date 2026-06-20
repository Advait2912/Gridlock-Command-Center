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

const fmtPct = (p?: number | null) => p != null ? `${(p * 100).toFixed(1)}%` : '—';
const fmtNum = (n?: number | null, digits = 1) => n != null && !Number.isNaN(n) ? Number(n).toFixed(digits) : '—';

const badgeClassForProb = (p?: number | null) => {
  if (p == null) return 'badge-neutral';
  if (p >= 0.6) return 'badge-high';
  if (p >= 0.3) return 'badge-medium';
  return 'badge-low';
};

export const LiveEventCard: React.FC<LiveEventCardProps> = ({ event, nearbyEvents, onRemove, onMapFocus }) => {
  const a = event.advisory;

  const actionLines: string[] = [];
  const closureTxt = a.closure_probability >= 0.6 ? 'High closure risk' : a.closure_probability >= 0.3 ? 'Moderate closure risk' : 'Low closure risk';
  actionLines.push(`${closureTxt} (${fmtPct(a.closure_probability)}) — deploy ${a.recommended_officers} officer(s).`);

  if (a.duration) {
    if (a.duration.type === 'quantile') {
      actionLines.push(`Expected duration ~${fmtNum(a.duration.p50_hrs)}h (range ${fmtNum(a.duration.p10_hrs)}–${fmtNum(a.duration.p90_hrs)}h).`);
    } else if (a.duration.type === 'band') {
      actionLines.push(`Likely duration band: ${a.duration.band} (${a.duration.confidence}).`);
    }
  }
  if (a.recommended_tow_trucks) {
    actionLines.push(`Dispatch ${a.recommended_tow_trucks} tow truck(s).`);
  }
  if (a.signal_timing_suggestion) {
    actionLines.push(`🚦 ${a.signal_timing_suggestion}`);
  }
  if (a.spatial_warning) {
    actionLines.push(`⚠ ${a.spatial_warning}`);
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Avoid triggering map focus if clicking the remove button
    const target = e.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'button') return;
    if (a.latitude != null && a.longitude != null) {
      onMapFocus(a.latitude, a.longitude);
    }
  };

  return (
    <div
      id={`livecard-${event.id}`}
      className="glass-panel"
      style={{ padding: '1.25rem', marginBottom: '1rem', cursor: 'pointer', transition: 'background-color 0.2s' }}
      onClick={handleCardClick}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{a.event_cause.replace(/_/g, ' ')}</h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{a.zone}</div>
        </div>
        {a.priority && (
          <span className={`badge ${a.priority.label === 'HIGH' ? 'badge-high' : 'badge-low'}`}>
            {a.priority.label} priority
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <span className={`badge ${badgeClassForProb(a.closure_probability)}`}>
          closure {fmtPct(a.closure_probability)}
        </span>
        <span className="badge badge-neutral">{a.recommended_officers} officer(s)</span>
        {a.recommended_tow_trucks ? (
          <span className="badge badge-neutral">{a.recommended_tow_trucks} tow truck(s)</span>
        ) : null}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
        {actionLines.map((line, i) => (
          <div key={i} style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{line}</div>
        ))}
      </div>

      {nearbyEvents.length > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: '1rem' }}>
          ⚠ {nearbyEvents.length} other active event(s) within 2km — compounding congestion risk: {' '}
          {nearbyEvents.map(n => `${n.event.advisory.event_cause.replace(/_/g, ' ')} (${n.distanceKm.toFixed(1)}km)`).join(', ')}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          added {event.addedAt.toLocaleTimeString()}
        </span>
        <button
          className="btn-secondary"
          style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(event.id);
          }}
        >
          Remove
        </button>
      </div>
    </div>
  );
};
