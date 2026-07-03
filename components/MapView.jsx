"use client";
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useRouter } from 'next/navigation';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userIcon = new L.DivIcon({
  html: `<div style="width:16px;height:16px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(59,130,246,0.8)" class="animate-pulse"></div>`,
  iconSize: [16, 16], iconAnchor: [8, 8], className: ''
});

const shopIcon = new L.DivIcon({
  html: `<div style="width:14px;height:14px;background:#6366f1;border-radius:50%;border:2px solid white;box-shadow:0 2px 8px rgba(99,102,241,0.5)"></div>`,
  iconSize: [14, 14], iconAnchor: [7, 7], className: ''
});

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Leaflet measures its container's pixel size once, right when it mounts.
// If that container is being toggled into view, sits inside a flex/absolute
// layout, or is animating in (our mobile "Map" tab is all three), Leaflet
// can grab a stale or zero size and render blank. This keeps it in sync.
function MapResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const invalidate = () => map.invalidateSize();

    invalidate();
    const raf = requestAnimationFrame(invalidate);
    const settleTimer = setTimeout(invalidate, 350); // after our CSS entrance animation finishes

    const observer = new ResizeObserver(invalidate);
    observer.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settleTimer);
      observer.disconnect();
    };
  }, [map]);
  return null;
}

export default function MapView({ userLoc, shops = [], className = "h-full w-full", onShopClick }) {
  const router = useRouter();
  const center = userLoc || [28.6139, 77.2090];
  const handleShopClick = (id) => (onShopClick ? onShopClick(id) : router.push(`/shop/${id}`));

  return (
    <div className={`relative w-full h-full ${className}`}>
      <style jsx global>{`
        .leaflet-popup-content-wrapper { background: #141415; border: 1px solid #1e1e20; color: white; border-radius: 12px; padding: 0; overflow: hidden; }
        .leaflet-popup-tip { background: #141415; border: 1px solid #1e1e20; }
        .leaflet-popup-content { margin: 8px; }
        .leaflet-container { background: #070708; }
      `}</style>
      <MapContainer center={center} zoom={userLoc ? 14 : 5} scrollWheelZoom={true} className="w-full h-full rounded-2xl z-0">
        <ChangeView center={center} zoom={userLoc ? 14 : 5} />
        <MapResizeHandler />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {userLoc && (
          <Marker position={userLoc} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {shops.map((shop) => {
          if (!shop.location?.coordinates) return null;
          const [lng, lat] = shop.location.coordinates;
          return (
            <Marker key={shop._id} position={[lat, lng]} icon={shopIcon}>
              <Popup>
                <div className="w-48 bg-[#141415] text-white">
                  {shop.thumbnail && (
                    <img src={shop.thumbnail} alt={shop.name} className="w-full h-24 object-cover rounded-lg mb-2" />
                  )}
                  <h3 className="font-bold text-sm truncate">{shop.name}</h3>
                  <p className="text-xs text-zinc-400 mb-2">{shop.category}</p>
                  <button 
                    onClick={() => handleShopClick(shop._id)}
                    className="w-full bg-[#6366f1] text-white text-xs font-semibold py-1.5 rounded-lg hover:bg-[#4f46e5] transition-colors"
                  >
                    View Shop →
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}