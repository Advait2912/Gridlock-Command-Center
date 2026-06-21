import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Advisory } from '../../services/types';

interface LiveEvent {
  id: string;
  advisory: Advisory;
  addedAt: Date;
}

interface LiveBoardMapProps {
  events: LiveEvent[];
  onMarkerClick: (id: string) => void;
}

const BoundsUpdater: React.FC<{ events: LiveEvent[] }> = ({ events }) => {
  const map = useMap();
  useEffect(() => {
    if (events.length === 0) return;
    const bounds: [number, number][] = events
      .filter(ev => ev.advisory.latitude != null && ev.advisory.longitude != null)
      .map(ev => [ev.advisory.latitude, ev.advisory.longitude]);
    
    if (bounds.length > 0) {
      map.fitBounds(bounds, { maxZoom: 15, padding: [40, 40] });
    }
  }, [events, map]);
  return null;
};

export const LiveBoardMap: React.FC<LiveBoardMapProps> = ({ events, onMarkerClick }) => {
  return (
    <div className="panel-live" style={{ height: '400px', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1rem', border: '1px solid var(--glass-border)' }}>
      <MapContainer center={[12.9716, 77.5946]} zoom={12} style={{ height: '100%', width: '100%', zIndex: 1 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <BoundsUpdater events={events} />
        {events.map((ev) => {
          const a = ev.advisory;
          if (a.latitude == null || a.longitude == null) return null;

          const color = a.closure_probability >= 0.6 ? '#d9374a' : a.closure_probability >= 0.3 ? '#c98a12' : '#1aa260';

          return (
            <React.Fragment key={ev.id}>
              <CircleMarker
                center={[a.latitude, a.longitude]}
                radius={9}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.85, weight: 2 }}
                eventHandlers={{ click: () => onMarkerClick(ev.id) }}
              >
                <Popup>
                  <strong>{a.event_cause.replace(/_/g, ' ')}</strong><br />
                  {a.zone}<br />
                  Closure: {(a.closure_probability * 100).toFixed(1)}% &middot; Officers: {a.recommended_officers}
                </Popup>
              </CircleMarker>
              
              {a.footprint_radius_km > 0 && (
                <Circle
                  center={[a.latitude, a.longitude]}
                  radius={a.footprint_radius_km * 1000}
                  pathOptions={{ color, fillColor: color, fillOpacity: 0.08, weight: 1 }}
                />
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};
