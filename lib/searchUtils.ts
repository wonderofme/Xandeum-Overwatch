import { PNode } from "@/services/nodeService";

/**
 * Searches nodes by pubkey, IP, location, or status
 * Case-insensitive partial matching
 * 
 * @param {PNode[]} nodes - Array of network nodes to search
 * @param {string} query - Search query string
 * @returns {PNode[]} Filtered array of matching nodes
 */
export function searchNodes(nodes: PNode[], query: string): PNode[] {
  if (!query.trim()) {
    return nodes;
  }

  const searchTerm = query.toLowerCase().trim();

  return nodes.filter((node) => {
    // Search in pubkey
    if (node.pubkey.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Search in IP address
    if (node.ip.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Search in location
    if (node.location.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Search in status
    if (node.status.toLowerCase().includes(searchTerm)) {
      return true;
    }

    return false;
  });
}

