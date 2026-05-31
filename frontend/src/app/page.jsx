"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/utils";

const severityColors = {
  Critical: "text-danger",
  High: "text-warning",
  Medium: "text-accent",
  Low: "text-text-muted",
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalLogs: 0,
    totalIncidents: 0,
    totalAlerts: 0,
    totalProjects: 0,
  });
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [projects, incidents, aiRes] = await Promise.all([
          api("/api/projects"),
          api("/api/incidents"),
          api("/api/ai/summary").catch(() => ({ data: [] })),
        ]);
        setStats({
          totalProjects: projects.data?.length || 0,
          totalIncidents: incidents.data?.length || 0,
          totalLogs: 0,
          totalAlerts: 0,
        });
        setInsights(aiRes.data || []);
      } catch {}
    }
    load();
  }, []);

  const cards = [
    { label: "Projects", value: stats.totalProjects, icon: "◈", color: "text-accent" },
    { label: "Logs Collected", value: stats.totalLogs, icon: "▤", color: "text-success" },
    { label: "Incidents", value: stats.totalIncidents, icon: "▲", color: "text-warning" },
    { label: "Active Alerts", value: stats.totalAlerts, icon: "●", color: "text-danger" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-text-heading text-lg font-semibold">Dashboard</h2>
        <p className="text-text-muted text-xs mt-1">Overview of your API monitoring</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-bg-surface rounded-lg border border-border-muted p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className={`${card.color} text-lg`}>{card.icon}</span>
              <span className="text-text-muted text-[11px] uppercase tracking-wider">
                {card.label}
              </span>
            </div>
            <p className="text-text-heading text-2xl font-semibold tabular-nums">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {insights.length > 0 && (
        <div>
          <div className="mb-4">
            <h3 className="text-text-heading text-sm font-semibold">AI Insights</h3>
            <p className="text-text-muted text-xs mt-0.5">Latest DeepSeek-powered analysis of your incidents</p>
          </div>
          <div className="space-y-2">
            {insights.map((item) => (
              <div
                key={item.id}
                className="bg-bg-surface rounded-lg border border-border-muted p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-xs text-text-default font-medium leading-relaxed">
                    {item.summary}
                  </p>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                    severityColors[item.severity] || "text-text-muted"
                  } border-current/20`}>
                    {item.severity}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-text-muted">
                  <span>{item.affected_component}</span>
                  {item.incident && (
                    <>
                      <span className="text-border-muted">·</span>
                      <span className="tabular-nums">{item.incident.total_occurence} occurrences</span>
                      <span className="text-border-muted">·</span>
                      <span>{item.incident.method} {item.incident.endpoint}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
