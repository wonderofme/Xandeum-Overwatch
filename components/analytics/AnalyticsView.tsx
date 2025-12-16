"use client";

import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { GlassCard } from "@/components/ui/GlassCard";
import { PNode } from "@/services/nodeService";
import { useMemo } from "react";

interface AnalyticsViewProps {
  nodes: PNode[];
  currentCapacity: number; // in PB
  onExpandAnalytics?: () => void;
  onExpandDecentralization?: () => void;
  onExpandVersionHealth?: () => void;
  hideHeader?: boolean;
}

// Custom Glass Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0a0a0f]/90 backdrop-blur-xl border border-white/10 rounded-lg px-4 py-2 shadow-lg">
        <p className="text-white/60 text-xs mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-white/90 text-sm font-medium">
            {entry.name}: {typeof entry.value === "number" ? entry.value.toFixed(2) : entry.value}
            {entry.dataKey === "capacity" && " PB"}
            {entry.dataKey === "nodes" && " nodes"}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Generate 30-day growth curve
function generateCapacityHistory(currentCapacity: number): Array<{ date: string; capacity: number }> {
  const days = 30;
  const history = [];
  const today = new Date();

  // Exponential growth curve: starts at ~30% of current, grows to current
  const startCapacity = currentCapacity * 0.3;
  const growthFactor = Math.pow(currentCapacity / startCapacity, 1 / days);

  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayCapacity = startCapacity * Math.pow(growthFactor, days - i);
    
    history.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      capacity: Math.max(0, dayCapacity),
    });
  }

  return history;
}

// Group nodes by region
function groupNodesByRegion(nodes: PNode[]): Array<{ name: string; value: number }> {
  const regionMap = new Map<string, number>();

  nodes.forEach((node) => {
    // Extract region from location or estimate from IP
    let region = "Unknown";
    
    if (node.location) {
      const parts = node.location.split(",");
      if (parts.length > 1) {
        const country = parts[parts.length - 1].trim();
        if (country === "US" || country === "MX" || country === "BR" || country === "CA") {
          region = "North America";
        } else if (country === "GB" || country === "DE" || country === "FR" || country === "RU") {
          region = "Europe";
        } else if (country === "JP" || country === "CN" || country === "SG" || country === "AU") {
          region = "Asia Pacific";
        } else {
          region = "Other";
        }
      }
    } else {
      // Estimate from IP first octet
      const firstOctet = parseInt(node.ip.split(".")[0]);
      if (firstOctet >= 0 && firstOctet < 64) {
        region = "North America";
      } else if (firstOctet >= 64 && firstOctet < 128) {
        region = "Europe";
      } else if (firstOctet >= 128 && firstOctet < 192) {
        region = "Asia Pacific";
      } else {
        region = "Other";
      }
    }

    regionMap.set(region, (regionMap.get(region) || 0) + 1);
  });

  return Array.from(regionMap.entries()).map(([name, value]) => ({ name, value }));
}

// Group nodes by version (mock based on status/uptime)
function groupNodesByVersion(nodes: PNode[]): Array<{ version: string; nodes: number }> {
  const versionMap = new Map<string, number>();

  nodes.forEach((node) => {
    // Simulate version distribution based on uptime
    let version = "v1.0.0";
    if (node.uptime > 98) {
      version = "v2.0.0"; // Latest
    } else if (node.uptime > 95) {
      version = "v1.5.0";
    } else if (node.uptime > 90) {
      version = "v1.2.0";
    } else {
      version = "v1.0.0";
    }

    versionMap.set(version, (versionMap.get(version) || 0) + 1);
  });

  return Array.from(versionMap.entries())
    .map(([version, nodes]) => ({ version, nodes }))
    .sort((a, b) => b.nodes - a.nodes);
}

const COLORS = {
  donut: ["#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"],
  bar: "#06b6d4",
};

export function AnalyticsView({
  nodes,
  currentCapacity,
  onExpandAnalytics,
  onExpandDecentralization,
  onExpandVersionHealth,
  hideHeader = false,
}: AnalyticsViewProps) {
  const capacityHistory = useMemo(
    () => generateCapacityHistory(currentCapacity),
    [currentCapacity]
  );

  const regionData = useMemo(() => groupNodesByRegion(nodes), [nodes]);

  const versionData = useMemo(() => groupNodesByVersion(nodes), [nodes]);

  return (
    <div
      id="charts"
      className="space-y-6 scroll-mt-20"
      onClick={onExpandAnalytics ? (e) => {
        // Only trigger if clicking on the container itself, not on interactive elements
        const target = e.target as HTMLElement;
        if (!target.closest('button') && !target.closest('input') && !target.closest('select') && !target.closest('[data-no-expand]')) {
          e.preventDefault();
          e.stopPropagation();
          console.log("Analytics container clicked");
          onExpandAnalytics();
        }
      } : undefined}
      style={onExpandAnalytics ? { cursor: 'pointer' } : undefined}
    >
      {!hideHeader && (
        <div className="px-4">
          <h2 className="text-3xl font-sans font-bold text-white/90 mb-2">Network Analytics</h2>
          <p className="text-white/60 font-sans">Real-time insights into the Xandeum Storage Network</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
        {/* Network Capacity Growth - Area Chart */}
        <GlassCard
          className="col-span-1 lg:col-span-2"
          onClick={onExpandAnalytics ? (e) => {
            const target = e.target as HTMLElement;
            if (!target.closest('button') && !target.closest('input') && !target.closest('select')) {
              e.preventDefault();
              e.stopPropagation();
              console.log("Capacity Growth card clicked");
              onExpandAnalytics();
            }
          } : undefined}
        >
          <div className="mb-4">
            <h3 className="text-xl font-sans font-semibold text-white/90 mb-1">Network Capacity Growth</h3>
            <p className="text-sm text-white/60 font-sans">30-day historical trend</p>
          </div>
          <div style={{ pointerEvents: onExpandAnalytics ? 'none' : 'auto' }}>
            <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={capacityHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="capacityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="capacity"
                stroke="#06b6d4"
                strokeWidth={2}
                fill="url(#capacityGradient)"
              />
              <Tooltip content={<CustomTooltip />} />
              <XAxis
                dataKey="date"
                tick={{ fill: "rgba(255, 255, 255, 0.4)", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
              />
              <YAxis
                tick={{ fill: "rgba(255, 255, 255, 0.4)", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                label={{ value: "PB", angle: -90, position: "insideLeft", fill: "rgba(255, 255, 255, 0.6)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Node Decentralization - Donut Chart */}
        <GlassCard
          className={onExpandDecentralization ? "cursor-pointer hover:border-white/20 transition-colors" : ""}
          onClick={onExpandDecentralization ? (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("Decentralization expand clicked");
            onExpandDecentralization();
          } : undefined}
        >
          <div className="mb-4">
            <h3 className="text-xl font-sans font-semibold text-white/90 mb-1">Node Decentralization</h3>
            <p className="text-sm text-white/60 font-sans">Geographic distribution</p>
          </div>
          <div style={{ pointerEvents: onExpandDecentralization ? 'none' : 'auto' }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={regionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {regionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.donut[index % COLORS.donut.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Version Health - Bar Chart */}
        <GlassCard
          className={onExpandVersionHealth ? "cursor-pointer hover:border-white/20 transition-colors" : ""}
          onClick={onExpandVersionHealth ? (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("Version Health expand clicked");
            onExpandVersionHealth();
          } : undefined}
        >
          <div className="mb-4">
            <h3 className="text-xl font-sans font-semibold text-white/90 mb-1">Version Health</h3>
            <p className="text-sm text-white/60 font-sans">Node version distribution</p>
          </div>
          <div style={{ pointerEvents: onExpandVersionHealth ? 'none' : 'auto' }}>
            <ResponsiveContainer width="100%" height={300}>
            <BarChart data={versionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <Bar dataKey="nodes" fill={COLORS.bar} radius={[4, 4, 0, 0]} />
              <Tooltip content={<CustomTooltip />} />
              <XAxis
                dataKey="version"
                tick={{ fill: "rgba(255, 255, 255, 0.4)", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
              />
              <YAxis
                tick={{ fill: "rgba(255, 255, 255, 0.4)", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
              />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

