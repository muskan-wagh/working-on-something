"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/utils";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await api("/api/logs");
        setLogs(res.data || []);
      } catch {}
    }
    load();
  }, []);

  const filtered = logs.filter((log) => {
    if (statusFilter && log.status_code !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-text-heading text-lg font-semibold">Logs</h2>
        <p className="text-text-muted text-xs mt-1">API request logs from your projects</p>
      </div>

      <div className="flex gap-2 mb-4">
        {["", "200", "400", "401", "404", "500"].map((code) => (
          <button
            key={code}
            onClick={() => setStatusFilter(code)}
            className={`text-[11px] px-3 py-1.5 rounded-md border transition-colors ${
              statusFilter === code
                ? "bg-accent-muted border-accent text-accent"
                : "bg-bg-surface border-border-muted text-text-muted hover:text-text-default"
            }`}
          >
            {code || "All"}
          </button>
        ))}
      </div>

      <div className="bg-bg-surface rounded-lg border border-border-muted overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-text-muted text-xs">No logs found.</p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border-muted">
                <th className="text-left px-4 py-3 text-text-muted font-medium tracking-wider uppercase">Time</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium tracking-wider uppercase">Method</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium tracking-wider uppercase">Endpoint</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium tracking-wider uppercase">Status</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium tracking-wider uppercase">Latency</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium tracking-wider uppercase">Error</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => {
                const code = parseInt(log.status_code);
                const isError = code >= 400;
                return (
                  <tr key={log.id} className="border-b border-border-muted/50 last:border-0 hover:bg-bg-hover transition-colors">
                    <td className="px-4 py-3 text-text-muted tabular-nums">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-text-default">{log.method}</span>
                    </td>
                    <td className="px-4 py-3 text-text-default">{log.endpoint}</td>
                    <td className="px-4 py-3">
                      <span className={`tabular-nums ${isError ? "text-danger" : "text-success"}`}>
                        {log.status_code}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-muted tabular-nums">{log.latency_ms}ms</td>
                    <td className="px-4 py-3 text-text-muted max-w-[200px] truncate">
                      {log.error_message || "—"}
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
