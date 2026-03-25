"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from "react-leaflet";
const defaultCenter = [24.6395, 93.9983];

function MapClickHandler({ position, onPick }) {
  const map = useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });

  useEffect(() => {
    map.setView(position, map.getZoom(), { animate: true });
  }, [map, position]);

  return null;
}

export default function SubscriberLocationPicker({ lat, lon, onPick }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const position = useMemo(() => {
    const parsedLat = Number(lat);
    const parsedLon = Number(lon);

    if (Number.isFinite(parsedLat) && Number.isFinite(parsedLon)) {
      return [parsedLat, parsedLon];
    }

    return defaultCenter;
  }, [lat, lon]);

  if (!ready) {
    return <div className="h-[280px] rounded-[24px] border border-[color:var(--line)] bg-[color:var(--surface-muted)]" />;
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-[color:var(--line)]">
      <MapContainer center={position} zoom={16} scrollWheelZoom className="h-[280px] w-full">
        <TileLayer
          attribution='Imagery &copy; Esri, Maxar, Earthstar Geographics'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        <MapClickHandler position={position} onPick={onPick} />
        <CircleMarker center={position} radius={8} pathOptions={{ color: "#0e9f6e", fillColor: "#0e9f6e", fillOpacity: 0.9 }} />
      </MapContainer>
    </div>
  );
}

