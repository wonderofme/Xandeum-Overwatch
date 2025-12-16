"use client";

import dynamic from "next/dynamic";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { DataGrid } from "@/components/dashboard/DataGrid";
import { AnalyticsView } from "@/components/analytics/AnalyticsView";
import { SearchBar, SearchBarRef } from "@/components/dashboard/SearchBar";
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { fetchNetworkStatus, NetworkResponse } from "@/services/xandeum";
import { PNode } from "@/services/nodeService";
import { searchNodes } from "@/lib/searchUtils";
import { findTopNode, getTopNodes } from "@/lib/nodeUtils";
import { useMemo, useState, useEffect, useRef } from "react";

// Dynamic imports to avoid SSR issues with Leaflet
const StaticMapPreview = dynamic(
  () => import("@/components/map/StaticMapPreview").then((mod) => ({ default: mod.StaticMapPreview })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#030712] flex items-center justify-center">
        <div className="text-white/40">Loading map...</div>
      </div>
    ),
  }
);

const ExpandedMapModal = dynamic(
  () => import("@/components/map/ExpandedMapModal").then((mod) => ({ default: mod.ExpandedMapModal })),
  {
    ssr: false,
  }
);


const ExpandedAnalyticsModal = dynamic(
  () => import("@/components/analytics/ExpandedAnalyticsModal").then((mod) => ({ default: mod.ExpandedAnalyticsModal })),
  {
    ssr: false,
  }
);

const ExpandedDecentralizationModal = dynamic(
  () => import("@/components/analytics/ExpandedDecentralizationModal").then((mod) => ({ default: mod.ExpandedDecentralizationModal })),
  {
    ssr: false,
  }
);

const ExpandedVersionHealthModal = dynamic(
  () => import("@/components/analytics/ExpandedVersionHealthModal").then((mod) => ({ default: mod.ExpandedVersionHealthModal })),
  {
    ssr: false,
  }
);

const TopNodesModal = dynamic(
  () => import("@/components/dashboard/TopNodesModal").then((mod) => ({ default: mod.TopNodesModal })),
  {
    ssr: false,
  }
);

export default function Home() {
  const [networkData, setNetworkData] = useState<NetworkResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<PNode | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [isAnalyticsExpanded, setIsAnalyticsExpanded] = useState(false);
  const [isDecentralizationExpanded, setIsDecentralizationExpanded] = useState(false);
  const [isVersionHealthExpanded, setIsVersionHealthExpanded] = useState(false);
  const [isTopNodesExpanded, setIsTopNodesExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchBarRef = useRef<SearchBarRef>(null);

  // Fetch network data on mount
  useEffect(() => {
    async function loadNetworkData() {
      setIsLoading(true);
      try {
        // Call our API route instead of direct RPC (avoids CORS issues)
        const response = await fetch('/api/network-status');
        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }
        const data = await response.json();
        
        // Convert lastUpdated string back to Date object
        const networkData: NetworkResponse = {
          ...data,
          lastUpdated: new Date(data.lastUpdated)
        };
        
        setNetworkData(networkData);
      } catch (error) {
        console.error("Failed to load network data:", error);
        // Fallback to simulation mode
        const { getNodes } = await import("@/services/nodeService");
        setNetworkData({
          nodes: getNodes(),
          status: "simulation",
          nodeCount: 50,
          lastUpdated: new Date(),
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadNetworkData();

    // Refresh every 60 seconds (reduced frequency for better performance)
    const interval = setInterval(loadNetworkData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Memoize allNodes to prevent unnecessary re-renders
  const allNodes = useMemo(() => {
    return networkData?.nodes || [];
  }, [networkData?.nodes]);

  // Filter nodes based on search query
  const filteredNodes = useMemo(() => {
    return searchNodes(allNodes, searchQuery);
  }, [allNodes, searchQuery]);

  // Use filtered nodes for display, but all nodes for stats
  const nodes = filteredNodes;

  // Calculate stats from all nodes (not filtered)
  const totalCapacity = useMemo(() => {
    const totalTB = allNodes.reduce((sum, node) => sum + node.storage, 0);
    return totalTB / 1000; // Convert to PB
  }, [allNodes]);

  const activeNodes = useMemo(() => {
    return allNodes.filter((node) => node.status === "active").length;
  }, [allNodes]);

  const networkHealth = useMemo(() => {
    if (allNodes.length === 0) return 0;
    const avgUptime =
      allNodes.reduce((sum, node) => sum + node.uptime, 0) / allNodes.length;
    return avgUptime;
  }, [allNodes]);

  // Find top performing node
  const topNode = useMemo(() => {
    return findTopNode(allNodes);
  }, [allNodes]);

  // Get top 25 nodes
  const top25Nodes = useMemo(() => {
    return getTopNodes(allNodes, 25);
  }, [allNodes]);

  return (
    <div className="flex min-h-screen flex-col relative overflow-hidden">
      <Navbar
        liveStatus={
          networkData
            ? {
                isLive: networkData.status === "live",
                nodeCount: networkData.nodeCount,
                lastUpdated: networkData.lastUpdated,
              }
            : undefined
        }
        onSearchClick={() => {
          // Scroll to search section first
          const searchElement = document.getElementById('search');
          if (searchElement) {
            searchElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // After scroll, focus the input
            setTimeout(() => {
              const input = searchElement.querySelector('input');
              if (input) {
                input.focus();
              } else if (searchBarRef.current) {
                searchBarRef.current.focus();
              }
            }, 300);
          } else if (searchBarRef.current) {
            searchBarRef.current.focus();
          }
        }}
      />
      
      {/* Map Section - Top 40% */}
      <div className="relative h-[40vh] min-h-[400px] w-full">
        <div className="absolute inset-0">
          <StaticMapPreview nodes={nodes} onClick={() => setIsMapExpanded(true)} />
        </div>
        {/* Fade gradient at bottom of map */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#030712] pointer-events-none z-10" />
      </div>

      {/* Expanded Map Modal */}
      <ExpandedMapModal
        isOpen={isMapExpanded}
        onClose={() => setIsMapExpanded(false)}
        nodes={nodes}
        hoveredNode={hoveredNode}
      />

      {/* Expanded Analytics Modal */}
      <ExpandedAnalyticsModal
        isOpen={isAnalyticsExpanded}
        onClose={() => setIsAnalyticsExpanded(false)}
        nodes={allNodes}
        currentCapacity={totalCapacity}
      />

      {/* Expanded Decentralization Modal */}
      <ExpandedDecentralizationModal
        isOpen={isDecentralizationExpanded}
        onClose={() => setIsDecentralizationExpanded(false)}
        nodes={allNodes}
      />

      {/* Expanded Version Health Modal */}
      <ExpandedVersionHealthModal
        isOpen={isVersionHealthExpanded}
        onClose={() => setIsVersionHealthExpanded(false)}
        nodes={allNodes}
      />

      {/* Top 25 Nodes Modal */}
      <TopNodesModal
        isOpen={isTopNodesExpanded}
        onClose={() => setIsTopNodesExpanded(false)}
        nodes={top25Nodes}
      />

      {/* HUD Section - Bottom 60% with overlay */}
      <div className="relative flex-1 -mt-16 z-20">
        <div className="container mx-auto max-w-7xl px-4">
          {/* Search Bar */}
          {!isLoading && (
            <SearchBar
              ref={searchBarRef}
              value={searchQuery}
              onChange={setSearchQuery}
              resultCount={filteredNodes.length}
              totalCount={allNodes.length}
            />
          )}

          {/* Stats Row */}
          <div className="mb-6">
            <StatsRow
              totalCapacity={totalCapacity}
              activeNodes={activeNodes}
              networkHealth={networkHealth}
              topNode={topNode}
              onTopNodesClick={() => setIsTopNodesExpanded(true)}
            />
          </div>

          {/* Data Grid in Glass HUD */}
          {isLoading ? (
            <GlassCard className="relative">
              <div className="flex items-center justify-center py-12">
                <div className="text-white/40">Loading network data...</div>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="relative">
              <DataGrid nodes={nodes} onNodeHover={setHoveredNode} />
            </GlassCard>
          )}

          {/* Analytics Charts Section */}
          {!isLoading && (
            <div className="mt-12 pb-12">
              <AnalyticsView
                nodes={allNodes}
                currentCapacity={totalCapacity}
                onExpandAnalytics={() => {
                  console.log("Setting Analytics expanded to true");
                  setIsAnalyticsExpanded(true);
                }}
                onExpandDecentralization={() => {
                  console.log("Setting Decentralization expanded to true");
                  setIsDecentralizationExpanded(true);
                }}
                onExpandVersionHealth={() => {
                  console.log("Setting Version Health expanded to true");
                  setIsVersionHealthExpanded(true);
                }}
              />
            </div>
          )}
        </div>
      </div>

    </div>
  );
}


