import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
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

// CSS for the pulsing incident marker — injected once
const PULSE_CSS = `
.pulse-marker-wrapper { background: transparent !important; border: none !important; }
.pulse-marker {
  position: relative;
  width: 24px; height: 24px;
}
.pulse-core {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 12px; height: 12px;
  border-radius: 50%;
  background: var(--marker-color, #FFFFFF);
  box-shadow: 0 0 0 2px rgba(255,255,255,0.25), 0 0 10px var(--marker-color, #FFFFFF);
  z-index: 3;
}
.pulse-ring {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 24px; height: 24px;
  border-radius: 50%;
  border: 2px solid var(--marker-color, #FFFFFF);
  animation: pulse-expand 2.4s ease-out infinite;
  opacity: 0;
}
.pulse-ring.delay { animation-delay: 1.2s; }
@keyframes pulse-expand {
  0%   { transform: scale(0.6); opacity: 0.9; }
  100% { transform: scale(2.8); opacity: 0; }
}
.pulse-marker:hover .pulse-core {
  background: var(--accent-live);
  box-shadow: 0 0 0 2px rgba(63, 214, 198, 0.3), 0 0 10px var(--accent-live);
  transform: scale(1.2);
}
.pulse-marker:active .pulse-core {
  background: var(--accent-live);
  transform: scale(0.9);
}
.pulse-core { transition: transform .15s ease, background .15s ease, box-shadow .15s ease; }
`;

let pulseCSSInjected = false;
const injectPulseCSS = () => {
  if (pulseCSSInjected) return;
  const style = document.createElement('style');
  style.textContent = PULSE_CSS;
  document.head.appendChild(style);
  pulseCSSInjected = true;
};

const createPulseIcon = (color: string) => {
  injectPulseCSS();
  return L.divIcon({
    className: 'pulse-marker-wrapper',
    html: `
      <div class="pulse-marker" style="--marker-color: ${color}">
        <span class="pulse-ring"></span>
        <span class="pulse-ring delay"></span>
        <span class="pulse-core"></span>
      </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
};

const createBlockedIcon = () => {
  return L.divIcon({
    className: 'blocked-marker-wrapper',
    html: `<div style="width: 12px; height: 12px; background: var(--status-warning); border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -6],
  });
};

const createBarricadeIcon = () => {
  return L.divIcon({
    className: 'barricade-marker-wrapper',
    html: `<div style="width: 22px; height: 22px; background: var(--status-danger); border-radius: 4px; border: 2px solid #fff; box-shadow: 0 0 6px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; font-size: 12px; line-height: 1;">🚧</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
  });
};

// Keeps the map centered and bounded on all relevant coordinates
const MapBoundsFocus: React.FC<{ coords: [number, number][] }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      if (coords.length === 1) {
        map.setView(coords[0], 15, { animate: true, duration: 0.6 });
      } else {
        map.fitBounds(bounds, { padding: [40, 40], animate: true, duration: 0.6, maxZoom: 16 });
      }
    }
  }, [coords.map(c => `${c[0]},${c[1]}`).join('|')]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
};

interface EventMapProps {
  advisory: Advisory;
}

const getColors = () => {
  const root = getComputedStyle(document.documentElement);
  return {
    danger: root.getPropertyValue('--status-danger').trim(),
    warning: root.getPropertyValue('--status-warning').trim(),
    success: root.getPropertyValue('--status-success').trim(),
  };
};

export const EventMap: React.FC<EventMapProps> = ({ advisory }) => {
  const COLORS = React.useMemo(() => getColors(), []);
  const [showBlocked, setShowBlocked] = useState(true);

  if (!advisory.latitude || !advisory.longitude) return null;

  const position: [number, number] = [advisory.latitude, advisory.longitude];

  // Radius in meters — capped to keep rings local
  const baseRadiusM = advisory.footprint_radius_km
    ? Math.min(advisory.footprint_radius_km * 1000, 800)
    : 350;

  const riskColorRaw =
    advisory.closure_probability >= 0.7 ? COLORS.danger :
    advisory.closure_probability >= 0.4 ? COLORS.warning :
    COLORS.success;

  const riskColorVar =
    advisory.closure_probability >= 0.7 ? 'var(--status-danger)' :
    advisory.closure_probability >= 0.4 ? 'var(--status-warning)' :
    'var(--status-success)';

  const trackingLabel =
    advisory.closure_probability >= 0.7 ? 'CRITICAL' :
    advisory.closure_probability >= 0.4 ? 'ELEVATED' :
    'MONITORING';

  const trackingClass =
    advisory.closure_probability >= 0.7 ? 'status-tag-high' :
    advisory.closure_probability >= 0.4 ? 'status-tag-medium' :
    'status-tag-low';

  const blockedCoords = advisory.routing?.blocked_nodes_coordinates ?? [];
  const barricadeCoord = advisory.recommended_barricade_coordinates;
  const visibleBlockedCoords = blockedCoords.slice(0, 15);
  const allMapCoords: [number, number][] = [
    position,
    ...visibleBlockedCoords,
    ...(barricadeCoord ? [barricadeCoord] : [])
  ];

  return (
    <div
      className="glass-panel map-card"
      style={{
        height: '240px',
        width: '100%',
        marginBottom: '1rem',
        overflow: 'hidden',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        boxShadow: `0 0 0 1px ${riskColorRaw}33, 0 0 14px ${riskColorRaw}22`,
      }}
    >
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapBoundsFocus coords={allMapCoords} />

        {/* Pulsing incident marker — most prominent element */}
        <Marker position={position} icon={createPulseIcon(riskColorRaw)}>
          <Popup>
            <strong>{advisory.event_cause.replace(/_/g, ' ')}</strong><br />
            <span style={{ color: '#888' }}>{advisory.zone}</span>
          </Popup>
        </Marker>

        {/* Threat rings — tight, local impact only */}
        {[0, 1].map(i => (
          <Circle
            key={i}
            center={position}
            radius={baseRadiusM * (1 + i * 0.55)}
            pathOptions={{
              color: riskColorRaw,
              fillColor: riskColorRaw,
              fillOpacity: i === 0 ? 0.06 : 0,
              weight: i === 0 ? 1.5 : 1,
              dashArray: '5, 5',
              opacity: i === 0 ? 0.7 : 0.35,
            }}
          />
        ))}

        {/* Blocked nodes */}
        {showBlocked && visibleBlockedCoords.map((pos, idx) => (
          <Marker
            key={`blocked-${idx}`}
            position={pos}
            icon={createBlockedIcon()}
          >
            <Popup>
              <div>
                🚧 <strong>Affected Road</strong>
                <br />
                Predicted disruption from this incident.
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Recommended Barricade */}
        {showBlocked && barricadeCoord && (
          <Marker
            position={barricadeCoord}
            icon={createBarricadeIcon()}
          >
            <Popup>
              <div>
                👮 <strong>Recommended Control Point</strong>
                <br />
                Suggested officer deployment location.
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Dark edge vignette */}
      <div className="map-vignette" />

      {/* HUD corner overlays */}
      <div className="map-hud-overlay">
        {/* TL: Zone */}
        <div className="map-hud-corner tl">
          <span className="eyebrow">Zone</span>
          <span className="metric metric-sm">{advisory.zone}</span>
        </div>
        {/* TR: Tracking status */}
        <div className="map-hud-corner tr">
          <span className={`status-tag ${trackingClass}`}>{trackingLabel}</span>
        </div>
        {/* BL: Coordinates */}
        <div className="map-hud-corner bl">
          <span className="eyebrow">Coord</span>
          <span className="metric metric-sm" style={{ color: riskColorVar }}>
            {advisory.latitude.toFixed(4)}, {advisory.longitude.toFixed(4)}
          </span>
        </div>
        {/* BR: Footprint radius */}
        <div className="map-hud-corner br">
          <span className="eyebrow">Footprint</span>
          <span className="metric metric-sm">{advisory.footprint_radius_km?.toFixed(1) || '0.5'} km</span>
        </div>
      </div>

      {/* Legend */}
      <div 
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.75)',
          padding: '6px 16px',
          borderRadius: 'var(--radius-full, 24px)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'row',
          gap: '16px',
          fontSize: '11px',
          color: '#fff',
          pointerEvents: 'none',
          whiteSpace: 'nowrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: riskColorRaw, fontSize: '14px', lineHeight: 1 }}>●</span> Incident
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--status-warning)', fontSize: '14px', lineHeight: 1 }}>●</span> Blocked Road
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', lineHeight: 1 }}>🚧</span> Rec. Barricade
        </div>
      </div>

      {/* Toggle UI below the HUD overlay, still within map area */}
      <div 
        style={{
          position: 'absolute',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.65)',
          padding: '4px 12px',
          borderRadius: 'var(--radius-md)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#fff', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          <input 
            type="checkbox" 
            checked={showBlocked} 
            onChange={(e) => setShowBlocked(e.target.checked)} 
            style={{ accentColor: riskColorRaw }}
          />
          Show Blocked & Barricades
        </label>
      </div>
    </div>
  );
};
