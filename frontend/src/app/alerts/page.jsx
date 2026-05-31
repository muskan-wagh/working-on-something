"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/utils";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await api("/api/alerts");
        setAlerts(res.data || []);
      } catch {}
    }
    load();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-text-heading text-lg font-semibold">Alerts</h2>
        <p className="text-text-muted text-xs mt-1">Sent notifications for incidents and thresholds</p>
      </div>

      <div className="bg-bg-surface rounded-lg border border-border-muted overflow-hidden">
        {alerts.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-text-muted text-xs">No alerts sent yet.</p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border-muted">
                <th className="text-left px-4 py-3 text-text-muted font-medium tracking-wider uppercase">Channel</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium tracking-wider uppercase">Recipient</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium tracking-wider uppercase">Status</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium tracking-wider uppercase">Sent</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a.id} className="border-b border-border-muted/50 last:border-0 hover:bg-bg-hover transition-colors">
                  <td className="px-4 py-3 text-text-default">{a.channel}</td>
                  <td className="px-4 py-3 text-text-muted">{a.recipient}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-medium ${a.status === "sent" ? "text-success" : "text-text-muted"}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-muted tabular-nums">
                    {new Date(a.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
