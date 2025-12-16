import { PNode } from "@/services/nodeService";

/**
 * Searches nodes by pubkey, IP, or location
 * Case-insensitive partial matching
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

