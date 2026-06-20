import React from 'react';
import { useOutcomes } from '../hooks/useOutcomes';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBox } from '../components/ErrorBox';
import { OutcomeRecord } from '../services/types';

// Compute predicted-vs-actual officer delta client-side
const officerDelta = (rec: OutcomeRecord): string => {
  if (rec.predicted_officers == null || rec.actual_officers_used == null) return '—';
  const d = rec.actual_officers_used - rec.predicted_officers;
  if (d === 0) return '✓ exact';
  return d > 0 ? `+${d} (under-pred)` : `${d} (over-pred)`;
};

const deltaColor = (rec: OutcomeRecord): string => {
  if (rec.predicted_officers == null || rec.actual_officers_used == null) return 'var(--text-muted)';
  const d = rec.actual_officers_used - rec.predicted_officers;
  if (d === 0) return 'var(--status-success)';
  if (Math.abs(d) <= 1) return 'var(--status-warning)';
  return 'var(--status-danger)';
};

const closureMatch = (rec: OutcomeRecord): { text: string; color: string } => {
  const predicted = rec.predicted_closure_probability != null
    ? rec.predicted_closure_probability >= 0.5 ? 'true' : 'false'
    : null;
  const actual = rec.actual_required_closure;
  if (!predicted || !actual) return { text: '—', color: 'var(--text-muted)' };
  const match = predicted === actual;
  return {
    text: match ? '✓ match' : `✗ pred=${predicted}`,
    color: match ? 'var(--status-success)' : 'var(--status-danger)',
  };
};

const EmptyState: React.FC = () => (
  <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
    <div style={{ fontSize: '32px', marginBottom: 'var(--space-4)' }}>📋</div>
    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
      No outcomes logged yet
    </div>
    <div className="eyebrow">
      Use the "Log Actual Outcome" form on any advisory to add entries here
    </div>
  </div>
);

export const Outcomes: React.FC = () => {
  const { data, loading, error, refresh } = useOutcomes();

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header style={{ marginBottom: 'var(--space-5)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)' }}>Outcomes Log</div>
          <div className="eyebrow" style={{ marginTop: 'var(--space-1)' }}>
            Predicted vs. actual · field officer feedback
          </div>
        </div>
        <button
          onClick={refresh}
          style={{
            padding: 'var(--space-2) var(--space-4)',
            background: 'transparent',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontFamily: 'var(--font-display)',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          Refresh
        </button>
      </header>

      <div className="glass-panel" style={{ flex: 1, overflowY: 'auto' }}>
        {loading && <LoadingSpinner fullPage message="Loading outcomes" />}
        {error && <div style={{ padding: 'var(--space-5)' }}><ErrorBox error={error} /></div>}

        {!loading && !error && data?.outcomes.length === 0 && <EmptyState />}

        {!loading && !error && data && data.outcomes.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                {['Logged At', 'Event', 'Closure pred.', 'Closure match', 'Officers pred.', 'Officers actual', 'Officer Δ', 'Duration', 'Notes'].map(h => (
                  <th key={h} className="eyebrow" style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left', background: 'rgba(0,0,0,0.15)', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.outcomes.map((row, idx) => {
                const cl = closureMatch(row);
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', whiteSpace: 'nowrap' }}>
                      <span className="metric metric-sm" style={{ color: 'var(--text-muted)' }}>
                        {new Date(row.logged_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <div style={{ fontWeight: 500, fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                        {row.event_cause.replace(/_/g, ' ')}
                      </div>
                      <div className="eyebrow" style={{ marginTop: '1px' }}>{row.zone}</div>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <span className="metric metric-sm" style={{ color: 'var(--text-secondary)' }}>
                        {row.predicted_closure_probability != null ? `${(row.predicted_closure_probability * 100).toFixed(0)}%` : '—'}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <span className="metric metric-sm" style={{ color: cl.color }}>{cl.text}</span>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <span className="metric metric-sm">{row.predicted_officers ?? '—'}</span>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <span className="metric metric-sm">{row.actual_officers_used ?? '—'}</span>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <span className="metric metric-sm" style={{ color: deltaColor(row) }}>
                        {officerDelta(row)}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <span className="metric metric-sm" style={{ color: 'var(--text-secondary)' }}>
                        {row.actual_duration_hrs != null ? `${row.actual_duration_hrs}h` : '—'}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-muted)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.notes || ''}>
                      {row.notes || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
