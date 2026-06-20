import React from 'react';

const Section: React.FC<{ title: string; accent?: string; children: React.ReactNode }> = ({ title, accent, children }) => (
  <div style={{ marginBottom: 'var(--space-6)' }}>
    <div className="eyebrow" style={{ marginBottom: 'var(--space-2)', color: accent || 'var(--text-secondary)' }}>
      {title}
    </div>
    {children}
  </div>
);

const BulletList: React.FC<{ items: React.ReactNode[] }> = ({ items }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
    {items.map((item, i) => (
      <div key={i} style={{ display: 'flex', gap: 'var(--space-3)', fontSize: '13px', lineHeight: 1.6 }}>
        <span style={{ color: 'var(--text-muted)', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>—</span>
        <span style={{ color: 'var(--text-secondary)' }}>{item}</span>
      </div>
    ))}
  </div>
);

export const About: React.FC = () => {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
          About this system
        </div>
        <div className="eyebrow">
          GridLock Command Center · Round 2 demo console
        </div>
      </div>

      <hr className="divider" />

      <Section title="What this is">
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 'var(--space-4)' }}>
          A test and demo console for the event-driven congestion pipeline. Two operational modes:
        </p>
        <BulletList items={[
          <><strong style={{ color: 'var(--text-primary)' }}>Browse Historical Events</strong> — replays a real Astram-log event through the full advisory pipeline: closure triage, duration prediction, resource recommendation, case-based retrieval, and network resilience.</>,
          <><strong style={{ color: 'var(--text-primary)' }}>New Event Advisory</strong> — featurizes a hypothetical event from scratch using only cached, already-trained artifacts (no retraining, no live API calls) and runs the same advisory pipeline.</>,
        ]} />
      </Section>

      <hr className="divider" />

      <Section title="What this deliberately does not do" accent="var(--status-danger)">
        <BulletList items={[
          <><strong style={{ color: 'var(--text-primary)' }}>No live GPS / CCTV / vehicle-count / social-media monitoring</strong> — every advisory is a one-shot, pre-event snapshot, not a continuously-updating dashboard.</>,
          <><strong style={{ color: 'var(--text-primary)' }}>No automatic retraining loop</strong> — the "Log actual outcome" form on every advisory records predicted-vs-actual to <code style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-blue)' }}>outcomes_log.csv</code>, closing the data-collection gap, but retraining the model from that log is still a separate offline step.</>,
          <><strong style={{ color: 'var(--text-primary)' }}>No calibrated traffic-volume or average-speed-reduction number</strong> — the routing model uses a flat assumed vehicle volume because no per-road traffic-count data exists in this dataset. Footprint size/radius and routing delay are reported as directional indicators, not precise speed/volume drops.</>,
          <><strong style={{ color: 'var(--text-primary)' }}>Tow-truck count and signal-timing suggestion</strong> are transparent formula-based outputs (same standard as the officer-count formula), not trained models — there is no tow-dispatch or signal-cycle data in this dataset.</>,
        ]} />
      </Section>

      <hr className="divider" />

      <Section title="Honesty principle" accent="var(--accent-purple)">
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 'var(--space-4)' }}>
          Every model reports its own limitation rather than hiding it:
        </p>
        <BulletList items={[
          <><strong style={{ color: 'var(--text-primary)' }}>Closure probability</strong> is isotonic-calibrated — a real empirical frequency, not a raw model score.</>,
          <><strong style={{ color: 'var(--text-primary)' }}>Slow-track duration</strong> is shown as a risk band with an explicit low-confidence note (concordance ≈ 0.566) rather than a false precise number.</>,
          <><strong style={{ color: 'var(--text-primary)' }}>Fast-track duration</strong> intervals are shown as P10 / P50 / P90, not a single point estimate.</>,
        ]} />
      </Section>
    </div>
  );
};
