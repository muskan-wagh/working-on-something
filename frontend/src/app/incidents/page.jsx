"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/utils";

const severityColors = {
  critical: "text-danger",
  high: "text-warning",
  medium: "text-accent",
  low: "text-text-muted",
};

function AnalysisPanel({ analysis, loading }) {
  if (loading) {
    return (
      <div className="px-4 py-4 bg-bg-hover/50 border-b border-border-muted/50">
        <div className="flex items-center gap-2 text-text-muted text-xs">
          <span className="inline-block w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          Analyzing with DeepSeek AI...
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const severityColor = severityColors[analysis.severity?.toLowerCase()] || "text-text-muted";

  return (
    <td colSpan={6} className="px-4 py-4 bg-bg-hover/50 border-b border-border-muted/50">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-text-default font-medium leading-relaxed">{analysis.summary}</p>
          </div>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${severityColor} border-current/20`}>
            {analysis.severity}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] text-text-muted font-medium uppercase tracking-wider mb-1">Probable Cause</p>
            <p className="text-xs text-text-default leading-relaxed">{analysis.probable_cause}</p>
          </div>
          <div>
            <p className="text-[11px] text-text-muted font-medium uppercase tracking-wider mb-1">Affected Component</p>
            <span className="inline-block text-[11px] font-medium px-2 py-1 rounded border border-border-muted text-text-default bg-bg-surface">
              {analysis.affected_component}
            </span>
          </div>
        </div>

        {analysis.recommended_actions?.length > 0 && (
          <div>
            <p className="text-[11px] text-text-muted font-medium uppercase tracking-wider mb-1.5">Recommended Actions</p>
            <ol className="list-decimal list-inside space-y-0.5">
              {analysis.recommended_actions.map((action, i) => (
                <li key={i} className="text-xs text-text-default leading-relaxed">{action}</li>
              ))}
            </ol>
          </div>
        )}

        {analysis.suggested_fix && (
          <div>
            <p className="text-[11px] text-text-muted font-medium uppercase tracking-wider mb-1">Suggested Fix</p>
            <p className="text-xs text-text-default leading-relaxed">{analysis.suggested_fix}</p>
          </div>
        )}
      </div>
    </td>
  );
}

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [analyzing, setAnalyzing] = useState({});

  useEffect(() => {
    async function load() {
      try {
        const res = await api("/api/incidents");
        setIncidents(res.data || []);
      } catch {}
    }
    load();
  }, []);

  async function handleAnalyze(incidentId) {
    if (analyzing[incidentId]?.expanded) {
      setAnalyzing((prev) => ({ ...prev, [incidentId]: { ...prev[incidentId], expanded: false } }));
      return;
    }

    setAnalyzing((prev) => ({ ...prev, [incidentId]: { loading: true, data: null, expanded: true } }));

    try {
      const res = await api(`/api/incidents/${incidentId}/analysis`);
      setAnalyzing((prev) => ({ ...prev, [incidentId]: { loading: false, data: res.data, expanded: true } }));
    } catch {
      setAnalyzing((prev) => ({ ...prev, [incidentId]: { loading: false, data: null, expanded: false } }));
    }
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-text-heading text-lg font-semibold">Incidents</h2>
            <p className="text-text-muted text-xs mt-1">Grouped recurring failures requiring attention</p>
          </div>
        </div>
      </div>

      <div className="bg-bg-surface rounded-lg border border-border-muted overflow-hidden">
        {incidents.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-text-muted text-xs">No incidents detected.</p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border-muted">
                <th className="text-left px-4 py-3 text-text-muted font-medium tracking-wider uppercase">Title</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium tracking-wider uppercase">Severity</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium tracking-wider uppercase">Status</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium tracking-wider uppercase">Occurrences</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium tracking-wider uppercase">Last Seen</th>
                <th className="w-16"></th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc) => {
                const state = analyzing[inc.id];
                const expanded = state?.expanded;
                return (
                  <tr key={inc.id}>
                    <td colSpan={6} className="p-0">
                      <table className="w-full">
                        <tbody>
                          <tr className="border-b border-border-muted/50 last:border-0 hover:bg-bg-hover transition-colors">
                            <td className="px-4 py-3 text-text-default font-medium">{inc.title}</td>
                            <td className="px-4 py-3">
                              <span className={`text-[11px] font-medium ${
                                severityColors[inc.severity] || "text-text-muted"
                              }`}>
                                {inc.severity}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-text-muted">{inc.status}</td>
                            <td className="px-4 py-3 text-text-muted tabular-nums">{inc.total_occurence}</td>
                            <td className="px-4 py-3 text-text-muted tabular-nums">
                              {inc.last_seen ? new Date(inc.last_seen).toLocaleString() : "—"}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleAnalyze(inc.id)}
                                className={`text-[11px] font-medium px-2.5 py-1 rounded-md border transition-colors ${
                                  expanded
                                    ? "bg-accent-muted border-accent text-accent"
                                    : "border-border-muted text-text-muted hover:text-accent hover:border-accent"
                                }`}
                                title="Analyze with AI"
                              >
                                {state?.loading ? "..." : "AI"}
                              </button>
                            </td>
                          </tr>
                          {expanded && (
                            <tr>
                              <AnalysisPanel
                                analysis={state?.data}
                                loading={state?.loading}
                              />
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
