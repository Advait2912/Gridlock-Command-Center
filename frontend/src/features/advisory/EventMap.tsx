import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Advisory } from '../../services/types';

// Fix for default Leaflet marker icon issues in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom tactical marker: A pulsing dot
const tacticalIcon = L.divIcon({
  className: 'tactical-marker',
  html: `<div style="
    width: 12px; 
    height: 12px; 
    background: var(--status-danger); 
    border-radius: 50%; 
    border: 2px solid white; 
    box-shadow: 0 0 8px var(--status-danger);
    animation: marker-pulse 1.5s infinite;
  "></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

interface EventMapProps {
  advisory: Advisory;
}

export const EventMap: React.FC<EventMapProps> = ({ advisory }) => {
  if (!advisory.latitude || !advisory.longitude) return null;

  const position: [number, number] = [advisory.latitude, advisory.longitude];
  
  // Radius is in km, leaflet Circle radius is in meters
  const radiusMeters = advisory.footprint_radius_km ? advisory.footprint_radius_km * 1000 : 500;

  // Map the color based on risk
  const riskColor = advisory.closure_probability >= 0.7 ? 'var(--status-danger)' : 
                    advisory.closure_probability >= 0.4 ? 'var(--status-warning)' : 
                    'var(--status-success)';

  return (
    <div className="glass-panel" style={{ height: '300px', width: '100%', marginBottom: '1.5rem', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
      <style>{`
        @keyframes marker-pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        .tactical-radius {
          animation: radius-pulse 3s ease-in-out infinite;
        }
        @keyframes radius-pulse {
          0%, 100% { fill-opacity: 0.1; stroke-opacity: 0.5; }
          50% { fill-opacity: 0.25; stroke-opacity: 0.8; }
        }
      `}</style>
      <MapContainer 
        center={position} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <Marker position={position} icon={tacticalIcon}>
          <Popup>
            <strong style={{ color: 'var(--text-primary)' }}>{advisory.event_cause}</strong><br />
            <span style={{ color: 'var(--text-secondary)' }}>{advisory.zone}</span>
          </Popup>
        </Marker>

        <Circle 
          center={position} 
          radius={radiusMeters} 
          className="tactical-radius"
          pathOptions={{ 
            color: riskColor, 
            fillColor: riskColor, 
            fillOpacity: 0.15,
            weight: 1,
            dashArray: '5, 5'
          }} 
        />
      </MapContainer>
    </div>
  );
};
