"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/utils";

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [errorThreshold, setErrorThreshold] = useState("10");
  const [latencyThreshold, setLatencyThreshold] = useState("2000");
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api("/api/alert-settings");
        if (res.data) {
          setSettings(res.data);
          setErrorThreshold(res.data.error_threshold || "10");
          setLatencyThreshold(res.data.latency_threshold || "2000");
          setEmailEnabled(res.data.email_enabled === "true");
        }
      } catch {}
    }
    load();
  }, []);

  async function saveSettings(e) {
    e.preventDefault();
    try {
      await api("/api/alert-settings", {
        method: "POST",
        body: JSON.stringify({
          error_threshold: errorThreshold,
          latency_threshold: latencyThreshold,
          email_enabled: String(emailEnabled),
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-text-heading text-lg font-semibold">Alert Settings</h2>
        <p className="text-text-muted text-xs mt-1">Configure thresholds and notification channels</p>
      </div>

      <form onSubmit={saveSettings} className="bg-bg-surface rounded-lg border border-border-muted p-6 max-w-lg space-y-5">
        <div>
          <label className="block text-text-muted text-[11px] uppercase tracking-wider mb-1.5">
            Error Threshold (per minute)
          </label>
          <input
            type="number"
            value={errorThreshold}
            onChange={(e) => setErrorThreshold(e.target.value)}
            className="w-full bg-bg-base border border-border-muted rounded-md px-3 py-2 text-xs text-text-default outline-none focus:border-accent transition-colors"
          />
        </div>

        <div>
          <label className="block text-text-muted text-[11px] uppercase tracking-wider mb-1.5">
            Latency Threshold (ms)
          </label>
          <input
            type="number"
            value={latencyThreshold}
            onChange={(e) => setLatencyThreshold(e.target.value)}
            className="w-full bg-bg-base border border-border-muted rounded-md px-3 py-2 text-xs text-text-default outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="email"
            checked={emailEnabled}
            onChange={(e) => setEmailEnabled(e.target.checked)}
            className="accent-accent"
          />
          <label htmlFor="email" className="text-text-default text-xs">
            Enable email notifications
          </label>
        </div>

        <button
          type="submit"
          className="bg-accent text-bg-base text-xs font-medium px-4 py-2 rounded-md hover:bg-accent-hover transition-colors"
        >
          {saved ? "Saved ✓" : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
