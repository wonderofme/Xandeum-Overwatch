"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PNode } from "@/services/nodeService";

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface StaticMapPreviewProps {
  nodes: PNode[];
  onClick: () => void;
}

export function StaticMapPreview({ nodes, onClick }: StaticMapPreviewProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Filter out nodes with invalid coordinates
  const allValidNodes = nodes.filter(
    (node) =>
      typeof node.lat === "number" &&
      typeof node.lng === "number" &&
      !isNaN(node.lat) &&
      !isNaN(node.lng) &&
      isFinite(node.lat) &&
      isFinite(node.lng) &&
      node.lat >= -90 &&
      node.lat <= 90 &&
      node.lng >= -180 &&
      node.lng <= 180
  );
  
  // Limit to 200 markers for preview (sample if more)
  const validNodes = allValidNodes.length > 200 
    ? allValidNodes.slice(0, 200) 
    : allValidNodes;

  // Calculate center from sample for performance
  const sampleForCenter = allValidNodes.slice(0, 100);
  const centerLat =
    sampleForCenter.length > 0
      ? sampleForCenter.reduce((sum, node) => sum + node.lat, 0) / sampleForCenter.length
      : 20;
  const centerLng =
    sampleForCenter.length > 0
      ? sampleForCenter.reduce((sum, node) => sum + node.lng, 0) / sampleForCenter.length
      : 0;

  // Create custom glowing green pulse marker
  const createCustomIcon = (isActive: boolean) => {
    const shadowColor = isActive ? "rgba(16,185,129,0.8)" : "rgba(255,255,255,0.3)";
    
    return L.divIcon({
      className: "custom-node-marker",
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          ${isActive ? `<div style="position: absolute; width: 16px; height: 16px; border-radius: 50%; background: rgb(16, 185, 129); opacity: 0.75; animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
          <div style="position: relative; width: 12px; height: 12px; border-radius: 50%; background: ${isActive ? 'rgb(16, 185, 129)' : 'rgba(255, 255, 255, 0.4)'}; box-shadow: 0 0 8px ${shadowColor};"></div>
        </div>
      `,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });
  };

  useEffect(() => {
    // Disable all interactions on the map
    if (mapRef.current) {
      mapRef.current.dragging.disable();
      mapRef.current.touchZoom.disable();
      mapRef.current.doubleClickZoom.disable();
      mapRef.current.scrollWheelZoom.disable();
      mapRef.current.boxZoom.disable();
      mapRef.current.keyboard.disable();
      // tap might not exist in all Leaflet versions, check safely
      if ('tap' in mapRef.current && (mapRef.current as any).tap) {
        (mapRef.current as any).tap.disable();
      }
    }
  }, []);

  return (
    <>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={2}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        touchZoom={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        boxZoom={false}
        keyboard={false}
        ref={(map) => {
          if (map) {
            mapRef.current = map;
            // Disable interactions
            map.dragging.disable();
            map.touchZoom.disable();
            map.doubleClickZoom.disable();
            map.scrollWheelZoom.disable();
            map.boxZoom.disable();
            map.keyboard.disable();
            // tap might not exist in all Leaflet versions, check safely
            if ('tap' in map && (map as any).tap) {
              (map as any).tap.disable();
            }
          }
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {validNodes.map((node) => (
          <Marker
            key={node.pubkey}
            position={[node.lat, node.lng]}
            icon={createCustomIcon(node.status === "active")}
            interactive={false}
          />
        ))}
      </MapContainer>
      {/* Click overlay */}
      <div
        className="absolute inset-0 cursor-pointer z-10"
        onClick={onClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.cursor = "pointer";
        }}
      />
      {/* Hint text */}
      <div className="absolute top-4 right-4 z-20 bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 pointer-events-none">
        Click to explore map
      </div>
    </>
  );
}

