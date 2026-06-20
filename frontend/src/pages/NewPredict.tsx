import React, { useState } from 'react';
import { useMeta } from '../hooks/useMeta';
import { usePredict } from '../hooks/usePredict';
import { PredictRequest } from '../services/types';
import { AdvisoryPanel } from '../features/advisory/AdvisoryPanel';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBox } from '../components/ErrorBox';

export const NewPredict: React.FC = () => {
  const { data: meta, loading: metaLoading } = useMeta();
  const { execute, data: advData, loading: advLoading, error: advError, reset } = usePredict();

  const [form, setForm] = useState<PredictRequest>({
    event_cause: '',
    zone_filled: '',
    latitude: 12.9716,
    longitude: 77.5946,
    start_datetime: new Date().toISOString().slice(0, 16),
    description: '',
    veh_type: '',
    corridor: '',
  });

  const [isStretch, setIsStretch] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: name.includes('lat') || name.includes('lon') ? parseFloat(value) : value };
      if (name === 'zone_filled' && meta?.zone_centroids?.[value]) {
        updated.latitude = meta.zone_centroids[value].latitude;
        updated.longitude = meta.zone_centroids[value].longitude;
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.event_cause || !form.zone_filled) return;
    
    const payload = { ...form };
    if (!payload.veh_type) payload.veh_type = 'MISSING';
    if (!payload.corridor) payload.corridor = 'MISSING';
    if (!isStretch) {
      delete payload.endlatitude;
      delete payload.endlongitude;
    }
    
    await execute(payload);
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', height: '100%' }}>
      {/* Left Column: Form */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <h2 style={{ marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Describe a new event</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          No event-feed integration here — fill in what a controller would know the moment a report comes in.
        </p>
        <div className="glass-panel" style={{ padding: '1.5rem', overflowY: 'auto' }}>
          {metaLoading ? <LoadingSpinner message="Loading options..." /> : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Event cause *</label>
                <select name="event_cause" value={form.event_cause} onChange={handleChange} required style={inputStyle}>
                  <option value="">Select...</option>
                  {meta?.causes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Zone *</label>
                <select name="zone_filled" value={form.zone_filled} onChange={handleChange} required style={inputStyle}>
                  <option value="">Select...</option>
                  {meta?.zones.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Latitude *</label>
                  <input type="number" step="0.0001" name="latitude" value={form.latitude} onChange={handleChange} required style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Longitude *</label>
                  <input type="number" step="0.0001" name="longitude" value={form.longitude} onChange={handleChange} required style={inputStyle} />
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
                Auto-filled from zone centroid. Edit to pinpoint exact location.
              </p>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Start date &amp; time (IST) *</label>
                <input type="datetime-local" name="start_datetime" value={form.start_datetime} onChange={handleChange} required style={inputStyle} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Description (optional)</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Free text..."/>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Vehicle Type (optional)</label>
                  <select name="veh_type" value={form.veh_type} onChange={handleChange} style={inputStyle}>
                    <option value="">Unknown</option>
                    {meta?.veh_types.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Corridor (optional)</label>
                  <input type="text" name="corridor" value={form.corridor} onChange={handleChange} placeholder="e.g. Outer Ring Road" style={inputStyle} />
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={isStretch} onChange={(e) => setIsStretch(e.target.checked)} />
                  Stretch event? (construction / water-logging segment)
                </label>
                
                {isStretch && (
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>End latitude</label>
                      <input type="number" step="0.0001" name="endlatitude" value={form.endlatitude || ''} onChange={handleChange} style={inputStyle} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>End longitude</label>
                      <input type="number" step="0.0001" name="endlongitude" value={form.endlongitude || ''} onChange={handleChange} style={inputStyle} />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" disabled={advLoading || !form.event_cause || !form.zone_filled} style={btnStyle(true)}>
                  {advLoading ? 'Predicting...' : 'Run Advisory'}
                </button>
                <button type="button" onClick={() => {
                  setForm({ ...form, event_cause: '', zone_filled: '', description: '' });
                  reset();
                }} style={btnStyle(false)}>
                  Clear
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Right Column: Advisory Result */}
      <div style={{ flex: '1.5', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '2rem', overflowY: 'auto' }}>
        {!advData && !advLoading && !advError ? (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Submit the form to see an advisory here.
          </div>
        ) : advLoading ? (
          <LoadingSpinner message="Generating ML predictions..." fullPage />
        ) : advError ? (
          <ErrorBox error={advError} />
        ) : advData ? (
          <AdvisoryPanel advisory={advData} />
        ) : null}
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%', 
  padding: '0.6rem', 
  borderRadius: 'var(--radius-sm)', 
  border: '1px solid var(--glass-border)', 
  background: 'rgba(0,0,0,0.2)', 
  color: 'white',
  fontFamily: 'inherit'
};

const btnStyle = (primary: boolean) => ({
  flex: 1,
  padding: '0.75rem',
  background: primary ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)',
  color: 'white',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  fontWeight: 600,
  cursor: 'pointer'
});
