export type PNode = {
  pubkey: string;
  ip: string;
  storage: number; // in TB
  uptime: number; // percentage
  lat: number;
  lng: number;
  status: "active" | "offline";
  location: string; // e.g., "Tokyo, JP"
};

// Generate a random IP address
function randomIP(): string {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

// Generate a random public key (hex string)
function randomPubkey(): string {
  return Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}

// Generate random coordinates distributed globally
function randomCoordinates(): { lat: number; lng: number; location: string } {
  // Distribute nodes globally with some clustering
  const regions = [
    { lat: 40.7128, lng: -74.006, spread: 15, location: "New York, US" },
    { lat: 51.5074, lng: -0.1278, spread: 10, location: "London, GB" },
    { lat: 35.6762, lng: 139.6503, spread: 8, location: "Tokyo, JP" },
    { lat: 37.7749, lng: -122.4194, spread: 12, location: "San Francisco, US" },
    { lat: 52.52, lng: 13.405, spread: 10, location: "Berlin, DE" },
    { lat: -33.8688, lng: 151.2093, spread: 8, location: "Sydney, AU" },
    { lat: 1.3521, lng: 103.8198, spread: 6, location: "Singapore, SG" },
    { lat: 55.7558, lng: 37.6173, spread: 10, location: "Moscow, RU" },
    { lat: 48.8566, lng: 2.3522, spread: 8, location: "Paris, FR" },
    { lat: 39.9042, lng: 116.4074, spread: 10, location: "Beijing, CN" },
    { lat: 19.4326, lng: -99.1332, spread: 12, location: "Mexico City, MX" },
    { lat: -23.5505, lng: -46.6333, spread: 10, location: "São Paulo, BR" },
  ];

  const region = regions[Math.floor(Math.random() * regions.length)];
  const lat = region.lat + (Math.random() - 0.5) * region.spread;
  const lng = region.lng + (Math.random() - 0.5) * region.spread;

  return { lat, lng, location: region.location };
}

export function getNodes(): PNode[] {
  const nodes: PNode[] = [];

  for (let i = 0; i < 50; i++) {
    const storage = Math.random() * 499 + 1; // 1TB to 500TB
    const uptime = Math.random() * 14.9 + 85; // 85% to 99.9%
    const status: "active" | "offline" = Math.random() > 0.1 ? "active" : "offline";
    const coords = randomCoordinates();

    nodes.push({
      pubkey: randomPubkey(),
      ip: randomIP(),
      storage: Math.round(storage * 100) / 100,
      uptime: Math.round(uptime * 100) / 100,
      lat: coords.lat,
      lng: coords.lng,
      status,
      location: coords.location,
    });
  }

  return nodes;
}


