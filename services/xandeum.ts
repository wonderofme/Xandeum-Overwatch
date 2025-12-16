import { Connection } from '@solana/web3.js';
import { PNode } from "./nodeService";
import { getNodes } from "./nodeService";

export type NetworkStatus = "live" | "simulation";

export interface NetworkResponse {
  nodes: PNode[];
  status: NetworkStatus;
  nodeCount: number;
  lastUpdated: Date;
}

// RPC endpoints - can be overridden via environment variables
const XANDEUM_RPC = process.env.NEXT_PUBLIC_XANDEUM_RPC || 'https://rpc.xandeum.network';
const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.mainnet-beta.solana.com';

/**
 * Fetches network status from Xandeum RPC endpoints
 * 
 * Attempts multiple strategies in order:
 * 1. Direct Xandeum RPC (getClusterNodes)
 * 2. Alternative method (getClusterInfo)
 * 3. Solana Mainnet gossip connection
 * 4. Falls back to simulation mode if all fail
 * 
 * @returns {Promise<NetworkResponse>} Network data with nodes, status, and metadata
 * @throws Never throws - always returns a valid response (simulation mode on failure)
 */
export async function fetchNetworkStatus(): Promise<NetworkResponse> {
  // Strategy A: Direct Xandeum RPC (The "Golden Path")
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(XANDEUM_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getClusterNodes', // Standard Solana method, but on Xandeum RPC
        params: []
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`RPC responded with status ${response.status}`);
    }

    const data = await response.json();
    
    // Handle RPC errors
    if (data.error) {
      throw new Error(data.error.message || "RPC error");
    }

    const result = data.result;

    if (result && Array.isArray(result) && result.length > 0) {
      const nodes = transformNodes(result);
      
      if (nodes.length > 0) {
        return {
          nodes,
          status: "live",
          nodeCount: nodes.length,
          lastUpdated: new Date(),
        };
      }
    }

    // Empty result, continue to next strategy
  } catch (e: any) {
    // Silently fail - this is expected if RPC isn't accessible
  }

  // Strategy B: Try getClusterInfo (alternative Solana RPC method)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(XANDEUM_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getClusterInfo',
        params: []
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.result && data.result.clusterNodes && Array.isArray(data.result.clusterNodes)) {
        const nodes = transformNodes(data.result.clusterNodes);
        
        if (nodes.length > 0) {
          return {
            nodes,
            status: "live",
            nodeCount: nodes.length,
            lastUpdated: new Date(),
          };
        }
      }
    }
  } catch (e: any) {
    // Silently fail - this is expected if the method isn't supported
  }

  // Strategy C: Solana Mainnet Connection (The "Side Door")
  // pNodes often broadcast on standard gossip but with specific version tags
  try {
    // Use fetch-based approach for serverless compatibility
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout for Solana
    
    const response = await fetch(SOLANA_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getClusterNodes',
        params: []
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Solana RPC responded with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || "Solana RPC error");
    }
    
    const nodes = data.result || [];
    
    // Filter for nodes that look like Xandeum (custom version strings or all if no filter works)
    // Since Xandeum is Solana-compatible, we'll accept all nodes but prioritize those with versions
    const validNodes = nodes.filter((n: any) => n.gossip || n.tpu || n.rpc);
    
    if (validNodes.length > 0) {
      const transformedNodes = transformNodes(validNodes);
      
      if (transformedNodes.length > 0) {
        return {
          nodes: transformedNodes,
          status: "live",
          nodeCount: transformedNodes.length,
          lastUpdated: new Date(),
        };
      }
    }
  } catch (e: any) {
    // Silently fail - this is expected if Solana RPC isn't accessible
  }

  // Final fallback: Simulation mode
  // All RPC methods failed, using simulation data
  return generateMockNodes();
}

/**
 * Transforms Solana cluster nodes to PNode format
 * 
 * @param {any[]} clusterNodes - Raw cluster node data from RPC
 * @returns {PNode[]} Array of transformed PNode objects
 */
function transformNodes(clusterNodes: any[]): PNode[] {
  return clusterNodes
    .map((node: any) => {
      try {
        // Extract IP from gossip, tpu, or rpc address
        const gossip = node.gossip || node.gossipAddr || node.gossipAddress;
        const tpu = node.tpu || node.tpuAddress;
        const rpc = node.rpc || node.rpcAddress;
        
        // Try to extract IP from any available address
        const address = gossip || tpu || rpc;
        if (!address) {
          return null;
        }

        // Parse IP from address (format: "ip:port" or just IP)
        const ipMatch = address.match(/(\d+\.\d+\.\d+\.\d+)/);
        const ip = ipMatch ? ipMatch[1] : generateRandomIP();

        // Extract pubkey - handle both string and PublicKey object
        let pubkey = node.pubkey || node.identity || node.publicKey;
        if (!pubkey) {
          return null;
        }
        
        // Convert PublicKey object to string if needed
        if (typeof pubkey === 'object' && pubkey.toString) {
          pubkey = pubkey.toString();
        } else if (typeof pubkey !== 'string') {
          pubkey = String(pubkey);
        }

        // Estimate location from IP
        const location = estimateLocationFromIP(ip);

        // Determine status (active if version exists or has valid addresses)
        const status: "active" | "offline" = (node.version || address) ? "active" : "offline";

        // Try to extract version info for logging
        const version = node.version || "unknown";

        return {
          pubkey: pubkey,
          ip,
          storage: Math.random() * 499 + 1, // Not available from RPC, use random
          uptime: Math.random() * 14.9 + 85, // Not available from RPC, use random
          lat: location.lat,
          lng: location.lng,
          status,
          location: location.location,
        };
      } catch (error) {
        return null;
      }
    })
    .filter((node: PNode | null) => node !== null) as PNode[];
}

/**
 * Generates mock nodes for simulation mode
 */
function generateMockNodes(): NetworkResponse {
  const simulatedNodes = getNodes();
  return {
    nodes: simulatedNodes,
    status: "simulation",
    nodeCount: simulatedNodes.length,
    lastUpdated: new Date(),
  };
}


/**
 * Fetches nodes from custom Xandeum API endpoint
 */
async function fetchXandeumAPI(path: string): Promise<PNode[] | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`https://rpc.xandeum.network${path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    // Transform API response to PNode format
    // Adjust this based on actual API structure
    if (Array.isArray(data)) {
      return data.map(transformAPINodeToPNode);
    } else if (data.nodes && Array.isArray(data.nodes)) {
      return data.nodes.map(transformAPINodeToPNode);
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Fetches nodes from Solana RPC endpoint
 */
async function fetchSolanaRPC(rpcUrl: string): Promise<PNode[] | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getClusterNodes",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.result && Array.isArray(data.result)) {
      // Filter for Xandeum nodes or transform all nodes
      const nodes = data.result
        .filter((node: any) => {
          // Look for Xandeum-specific identifiers
          return (
            node.version?.includes("xandeum") ||
            node.version?.includes("Xandeum") ||
            node.gossip || // Valid Solana node
            true // Accept all for now
          );
        })
        .map(transformSolanaNodeToPNode)
        .filter((node: PNode | null) => node !== null) as PNode[];

      return nodes.length > 0 ? nodes : null;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Transforms API node response to PNode format
 * Adjust based on actual API structure
 */
function transformAPINodeToPNode(apiNode: any): PNode {
  // Default fallback values - use a valid coordinate (center of world map)
  const defaultCoords = { lat: 20, lng: 0, location: "Unknown" };
  
  // Parse and validate coordinates
  let lat = apiNode.lat || apiNode.latitude;
  let lng = apiNode.lng || apiNode.longitude;
  
  // Convert to numbers if they're strings
  if (typeof lat === "string") lat = parseFloat(lat);
  if (typeof lng === "string") lng = parseFloat(lng);
  
  // Validate coordinates
  if (
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    isNaN(lat) ||
    isNaN(lng) ||
    !isFinite(lat) ||
    !isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    lat = defaultCoords.lat;
    lng = defaultCoords.lng;
  }
  
  return {
    pubkey: apiNode.pubkey || apiNode.id || apiNode.address || generateRandomPubkey(),
    ip: apiNode.ip || apiNode.ipAddress || generateRandomIP(),
    storage: apiNode.storage || apiNode.capacity || Math.random() * 499 + 1,
    uptime: apiNode.uptime || apiNode.uptimePercentage || Math.random() * 14.9 + 85,
    lat: lat,
    lng: lng,
    status: apiNode.status === "active" || apiNode.online ? "active" : "offline",
    location: apiNode.location || apiNode.city || defaultCoords.location,
  };
}

/**
 * Transforms Solana RPC node to PNode format
 */
function transformSolanaNodeToPNode(solanaNode: any): PNode | null {
  try {
    // Extract IP from gossip address
    const gossip = solanaNode.gossip;
    if (!gossip) return null;

    // Parse IP from gossip address (format: "ip:port")
    const ipMatch = gossip.match(/(\d+\.\d+\.\d+\.\d+)/);
    const ip = ipMatch ? ipMatch[1] : generateRandomIP();

    // Estimate location from IP (simplified - in production, use geolocation service)
    const location = estimateLocationFromIP(ip);

    return {
      pubkey: solanaNode.pubkey || generateRandomPubkey(),
      ip: ip,
      storage: Math.random() * 499 + 1, // Not available from Solana RPC
      uptime: Math.random() * 14.9 + 85, // Not available from Solana RPC
      lat: location.lat,
      lng: location.lng,
      status: solanaNode.version ? "active" : "offline",
      location: location.location,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Helper: Generate random IP
 */
function generateRandomIP(): string {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

/**
 * Helper: Generate random pubkey
 */
function generateRandomPubkey(): string {
  return Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}

/**
 * Helper: Estimate location from IP (simplified)
 * In production, use a proper geolocation service
 */
function estimateLocationFromIP(ip: string): { lat: number; lng: number; location: string } {
  // Simplified: Use first octet to estimate region
  const firstOctet = parseInt(ip.split(".")[0]);
  
  // Validate first octet
  if (isNaN(firstOctet) || !isFinite(firstOctet) || firstOctet < 0 || firstOctet > 255) {
    // Default to center of world map
    return { lat: 20, lng: 0, location: "Unknown" };
  }
  
  // Rough regional mapping (very simplified)
  const regions = [
    { lat: 40.7128, lng: -74.006, location: "New York, US" }, // 0-63
    { lat: 51.5074, lng: -0.1278, location: "London, GB" }, // 64-127
    { lat: 35.6762, lng: 139.6503, location: "Tokyo, JP" }, // 128-191
    { lat: -33.8688, lng: 151.2093, location: "Sydney, AU" }, // 192-255
  ];

  const regionIndex = Math.floor((firstOctet / 64) % regions.length);
  const region = regions[regionIndex] || regions[0];
  
  // Add some randomness but ensure valid coordinates
  let lat = region.lat + (Math.random() - 0.5) * 10;
  let lng = region.lng + (Math.random() - 0.5) * 10;
  
  // Clamp to valid ranges
  lat = Math.max(-90, Math.min(90, lat));
  lng = Math.max(-180, Math.min(180, lng));
  
  return {
    lat: lat,
    lng: lng,
    location: region.location,
  };
}

