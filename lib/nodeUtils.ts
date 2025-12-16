import { PNode } from "@/services/nodeService";

/**
 * Calculates a performance score for a node
 * Combines storage (weighted) and uptime
 */
function calculatePerformanceScore(node: PNode): number {
  // Normalize storage (0-1 scale, assuming max 500TB)
  const storageScore = Math.min(node.storage / 500, 1);
  
  // Normalize uptime (0-1 scale, 0-100%)
  const uptimeScore = node.uptime / 100;
  
  // Weighted combination: 60% storage, 40% uptime
  // Only count active nodes
  if (node.status !== "active") {
    return 0;
  }
  
  return storageScore * 0.6 + uptimeScore * 0.4;
}

/**
 * Finds the top performing node based on storage + uptime
 * 
 * @param {PNode[]} nodes - Array of network nodes
 * @returns {PNode | null} Top performing node or null if no active nodes
 */
export function findTopNode(nodes: PNode[]): PNode | null {
  if (nodes.length === 0) {
    return null;
  }

  // Filter to only active nodes
  const activeNodes = nodes.filter((node) => node.status === "active");
  
  if (activeNodes.length === 0) {
    return null;
  }

  // Find node with highest performance score
  let topNode = activeNodes[0];
  let topScore = calculatePerformanceScore(topNode);

  for (const node of activeNodes) {
    const score = calculatePerformanceScore(node);
    if (score > topScore) {
      topScore = score;
      topNode = node;
    }
  }

  return topNode;
}

/**
 * Gets the top N performing nodes sorted by performance score
 * 
 * @param {PNode[]} nodes - Array of network nodes
 * @param {number} count - Number of top nodes to return (default: 25)
 * @returns {PNode[]} Array of top performing nodes
 */
export function getTopNodes(nodes: PNode[], count: number = 25): PNode[] {
  if (nodes.length === 0) {
    return [];
  }

  // Filter to only active nodes
  const activeNodes = nodes.filter((node) => node.status === "active");
  
  if (activeNodes.length === 0) {
    return [];
  }

  // Calculate scores and sort
  const nodesWithScores = activeNodes.map((node) => ({
    node,
    score: calculatePerformanceScore(node),
  }));

  // Sort by score descending
  nodesWithScores.sort((a, b) => b.score - a.score);

  // Return top N nodes
  return nodesWithScores.slice(0, count).map((item) => item.node);
}

