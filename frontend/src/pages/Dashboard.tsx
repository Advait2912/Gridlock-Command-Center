import React, { useEffect, useState } from 'react';
import { useEvents } from '../hooks/useEvents';
import { useAdvisory } from '../hooks/useAdvisory';
import { EventFilters } from '../features/events/EventFilters';
import { EventList } from '../features/events/EventList';
import { AdvisoryPanel } from '../features/advisory/AdvisoryPanel';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBox } from '../components/ErrorBox';
import { Pagination } from '../components/Pagination';
import { MapContainer, TileLayer, Circle, Marker, useMap } from 'react-leaflet';
import { Advisory } from '../services/types';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const BENGALURU_CENTER: [number, number] = [12.9716, 77.5946];

// Inner component to recenter the map on advisory change
const MapController: React.FC<{ advisory: Advisory | null }> = ({ advisory }) => {
  const map = useMap();
  useEffect(() => {
    if (advisory?.latitude && advisory?.longitude) {
      map.flyTo([advisory.latitude, advisory.longitude], 14, { duration: 0.8 });
    }
  }, [advisory, map]);
  return null;
};

export const Dashboard: React.FC = () => {
  const [filters, setFilters] = useState<{ cause?: string; zone?: string; limit: number; offset: number }>({
    limit: 10,
    offset: 0,
  });

  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const { data: eventsData, loading: eventsLoading, error: eventsError } = useEvents(filters);
  const { data: advisoryData, loading: advLoading, error: advError } = useAdvisory(selectedEventId);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
      offset: 0
    }));
    setSelectedEventId(null);
  };

  const handlePageChange = (newOffset: number) => {
    setFilters(prev => ({ ...prev, offset: newOffset }));
    setSelectedEventId(null);
  };

  return (
    <div style={{ display: 'flex', gap: 'var(--space-5)', height: '100%', overflow: 'hidden' }}>
      {/* Feed Pane — fixed ~340px */}
      <div style={{ width: '340px', flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
            Historical Events
          </div>
          <div className="eyebrow" style={{ marginBottom: 'var(--space-3)' }}>
            Nov 2023 – Apr 2024 · Astram log
          </div>
          <EventFilters filters={filters} onChange={handleFilterChange} />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {eventsLoading ? (
            <LoadingSpinner message="Loading events..." />
          ) : eventsError ? (
            <ErrorBox error={eventsError} />
          ) : eventsData ? (
            <>
              <EventList
                events={eventsData.events}
                selectedId={selectedEventId}
                onSelect={setSelectedEventId}
              />
              <Pagination
                total={eventsData.total}
                limit={filters.limit}
                offset={filters.offset}
                onPageChange={handlePageChange}
              />
            </>
          ) : null}
        </div>
      </div>

      {/* Map Pane — always mounted, flexible */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="eyebrow" style={{ marginBottom: 'var(--space-2)' }}>
          {advisoryData ? `${advisoryData.event_cause.replace(/_/g, ' ')} — ${advisoryData.zone}` : 'Bengaluru Overview'}
        </div>
        <div style={{ flex: 1, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
          <MapContainer
            center={BENGALURU_CENTER}
            zoom={11}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController advisory={advisoryData ?? null} />
            {advisoryData && (
              <>
                <Marker position={[advisoryData.latitude, advisoryData.longitude]} />
                {advisoryData.footprint_radius_km > 0 && (
                  <Circle
                    center={[advisoryData.latitude, advisoryData.longitude]}
                    radius={advisoryData.footprint_radius_km * 1000}
                    pathOptions={{ color: '#E5484D', fillColor: '#E5484D', fillOpacity: 0.08, weight: 1.5 }}
                  />
                )}
              </>
            )}
          </MapContainer>
        </div>
        {!selectedEventId && (
          <div className="eyebrow" style={{ marginTop: 'var(--space-2)', textAlign: 'center' }}>
            Select an event to zoom into incident location
          </div>
        )}
      </div>

      {/* Report Pane — appears once an event is selected */}
      {selectedEventId && (
        <div style={{ width: '420px', flexShrink: 0, height: '100%', overflowY: 'auto', background: 'var(--bg-panel)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)', padding: 'var(--space-5)' }}>
          {advLoading ? (
            <LoadingSpinner message="Generating advisory..." fullPage />
          ) : advError ? (
            <ErrorBox error={advError} />
          ) : advisoryData ? (
            <AdvisoryPanel advisory={advisoryData} sourceEventId={selectedEventId} />
          ) : null}
        </div>
      )}
    </div>
  );
};
