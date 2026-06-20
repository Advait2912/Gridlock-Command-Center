import React from 'react';
import { Advisory } from '../../services/types';
import { StatGrid } from './StatGrid';
import { RoutingSection } from './RoutingSection';
import { BarricadeSection } from './BarricadeSection';
import { NetworkResilience } from './NetworkResilience';
import { ConflictsSection } from './ConflictsSection';
import { SimilarEvents } from './SimilarEvents';
import { HikeContext } from './HikeContext';
import { OutcomeForm } from './OutcomeForm';
import { RiskMeter } from './RiskMeter';

interface AdvisoryPanelProps {
  advisory: Advisory;
  sourceEventId?: string | number;
}

export const AdvisoryPanel: React.FC<AdvisoryPanelProps> = ({ advisory, sourceEventId }) => {
  return (
    <div className="advisory-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>

      {/* ── HEADLINE: Risk Meter + event title ── */}
      <RiskMeter probability={advisory.closure_probability} />

      <div style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-3)' }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {advisory.event_cause.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
        </div>
        <div className="eyebrow" style={{ marginTop: '2px' }}>
          {advisory.zone}
          {advisory.priority && (
            <span className={`status-tag ${advisory.priority.label === 'HIGH' ? 'status-tag-high' : 'status-tag-low'}`}
              style={{ marginLeft: 'var(--space-2)' }}>
              {advisory.priority.label} priority
            </span>
          )}
        </div>
      </div>

      {/* Spatial Warning */}
      {advisory.spatial_warning && (
        <div style={{
          padding: 'var(--space-3) var(--space-4)',
          background: 'var(--status-warning-bg)',
          borderLeft: '3px solid var(--status-warning)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--status-warning)',
          fontSize: '13px',
          marginBottom: 'var(--space-4)'
        }}>
          {advisory.spatial_warning}
        </div>
      )}

      <hr className="divider" />

      {/* ── PRIMARY METRICS ── */}
      <div className="eyebrow" style={{ marginBottom: 'var(--space-3)' }}>Incident Metrics</div>
      <StatGrid advisory={advisory} />

      <hr className="divider" />

      {/* ── RECOMMENDED RESPONSE ── */}
      <div className="eyebrow" style={{ marginBottom: 'var(--space-3)' }}>Recommended Response</div>
      <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-3)' }}>
        {/* Officers */}
        <div style={{ flex: 1, padding: 'var(--space-4)', background: 'rgba(84,104,255,0.07)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--accent-blue)' }}>
              <circle cx="8" cy="5" r="3"/>
              <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
            </svg>
            <span className="eyebrow">Officers</span>
          </div>
          <div className="metric metric-lg">{advisory.recommended_officers}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>formula-based heuristic</div>
        </div>
        {/* Tow trucks */}
        {advisory.recommended_tow_trucks != null && (
          <div style={{ flex: 1, padding: 'var(--space-4)', background: 'rgba(52,195,214,0.07)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--accent-purple)' }}>
                <rect x="1" y="6" width="10" height="6" rx="1"/>
                <path d="M11 9h2l2 2v1h-4V9z"/>
                <circle cx="4" cy="13" r="1.5"/>
                <circle cx="12" cy="13" r="1.5"/>
              </svg>
              <span className="eyebrow">Tow Trucks</span>
            </div>
            <div className="metric metric-lg">{advisory.recommended_tow_trucks}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>formula-based heuristic</div>
          </div>
        )}
      </div>

      {/* Signal timing */}
      {advisory.signal_timing_suggestion && (
        <div style={{
          padding: 'var(--space-3) var(--space-4)',
          background: 'rgba(84,104,255,0.06)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--glass-border)',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          marginBottom: 'var(--space-3)'
        }}>
          <div className="eyebrow" style={{ marginBottom: 'var(--space-1)' }}>Signal timing</div>
          {/* Bug fix 2.5: render suggestion alone; API string already contains the qualifier */}
          {advisory.signal_timing_suggestion}
        </div>
      )}

      <hr className="divider" />

      {/* ── ROUTE INTELLIGENCE ── */}
      <div className="eyebrow" style={{ marginBottom: 'var(--space-3)' }}>Route Intelligence</div>
      <RoutingSection routing={advisory.routing ?? null} />
      <BarricadeSection
        recommended_barricade_node={advisory.recommended_barricade_node ?? null}
        barricade_candidates_considered={advisory.barricade_candidates_considered}
        diversion_routes={advisory.diversion_routes}
      />

      <hr className="divider" />

      {/* ── NETWORK HEALTH ── */}
      <div className="eyebrow" style={{ marginBottom: 'var(--space-3)' }}>Network Health</div>
      <NetworkResilience network_resilience={advisory.network_resilience ?? null} />

      <hr className="divider" />

      {/* ── SUPPORTING EVIDENCE (visually de-emphasized) ── */}
      <div className="eyebrow" style={{ marginBottom: 'var(--space-3)', color: 'var(--text-muted)' }}>Supporting Evidence</div>
      <div style={{ opacity: 0.85 }}>
        <HikeContext hike={advisory.predicted_hike_context ?? null} historical_peak={advisory.historical_peak_window ?? null} />
        <ConflictsSection conflicts={advisory.conflicts ?? null} />
        <SimilarEvents events={advisory.similar_past_events} summary={advisory.similar_past_events_summary ?? null} />
      </div>

      <hr className="divider" />

      {/* ── OUTCOME FORM ── */}
      <div className="eyebrow" style={{ marginBottom: 'var(--space-3)', color: 'var(--text-muted)' }}>Log Actual Outcome</div>
      <OutcomeForm advisory={advisory} sourceEventId={sourceEventId} />
    </div>
  );
};
