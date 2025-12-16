"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
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

interface FlyToMarkerProps {
  node: PNode | null;
}

function FlyToMarker({ node }: FlyToMarkerProps) {
  const map = useMap();

  useEffect(() => {
    if (
      node &&
      typeof node.lat === "number" &&
      typeof node.lng === "number" &&
      !isNaN(node.lat) &&
      !isNaN(node.lng) &&
      isFinite(node.lat) &&
      isFinite(node.lng)
    ) {
      map.flyTo([node.lat, node.lng], 8, {
        duration: 1.5,
      });
    }
  }, [node, map]);

  return null;
}

interface NodeMapProps {
  nodes: PNode[];
  hoveredNode: PNode | null;
}

export function NodeMap({ nodes, hoveredNode }: NodeMapProps) {
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
  
  // Limit to 500 markers for performance (sample if more)
  const validNodes = allValidNodes.length > 500 
    ? allValidNodes.slice(0, 500) 
    : allValidNodes;

  // Calculate center from all valid nodes (sample for performance)
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
    const bgColor = isActive ? "bg-emerald-500" : "bg-white/40";
    
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

  return (
    <>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={2}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        zoomControl={true}
        attributionControl={false}
        dragging={true}
        touchZoom={true}
        doubleClickZoom={true}
        scrollWheelZoom={true}
        boxZoom={true}
        keyboard={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <FlyToMarker node={hoveredNode && validNodes.includes(hoveredNode) ? hoveredNode : null} />
        {validNodes.map((node) => (
          <Marker
            key={node.pubkey}
            position={[node.lat, node.lng]}
            icon={createCustomIcon(node.status === "active")}
          />
        ))}
      </MapContainer>
    </>
  );
}

