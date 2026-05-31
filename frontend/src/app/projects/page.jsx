"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/utils";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState(null);
  const [error, setError] = useState("");

  const loadProjects = useCallback(async () => {
    try {
      const res = await api("/api/projects");
      setProjects(res.data || []);
    } catch {}
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  async function createProject(e) {
    e.preventDefault();
    setError("");
    setNewKey(null);
    if (!name.trim()) return;
    try {
      const res = await api("/api/projects", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setNewKey(res.data.api_key);
      setName("");
      loadProjects();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteProject(id) {
    try {
      await api(`/api/projects/${id}`, { method: "DELETE" });
      loadProjects();
    } catch {}
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-text-heading text-lg font-semibold">Projects</h2>
        <p className="text-text-muted text-xs mt-1">Manage your API projects and keys</p>
      </div>

      <form onSubmit={createProject} className="flex gap-3 mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
          className="flex-1 bg-bg-surface border border-border-muted rounded-md px-3 py-2 text-xs text-text-default placeholder:text-text-muted outline-none focus:border-accent transition-colors"
        />
        <button
          type="submit"
          className="bg-accent text-bg-base text-xs font-medium px-4 py-2 rounded-md hover:bg-accent-hover transition-colors"
        >
          Create
        </button>
      </form>

      {error && (
        <div className="bg-danger/10 border border-danger/20 rounded-md px-4 py-2 mb-4">
          <p className="text-danger text-xs">{error}</p>
        </div>
      )}

      {newKey && (
        <div className="bg-accent-muted border border-accent/20 rounded-md px-4 py-3 mb-4">
          <p className="text-accent text-[11px] font-semibold uppercase tracking-wider mb-1">
            API Key Created — Copy it now. You won&apos;t see it again.
          </p>
          <code className="text-text-default text-xs break-all select-all">{newKey}</code>
          <button
            onClick={() => { navigator.clipboard.writeText(newKey); setNewKey(null); }}
            className="block mt-2 text-accent text-[11px] hover:underline"
          >
            Copied — dismiss
          </button>
        </div>
      )}

      <div className="bg-bg-surface rounded-lg border border-border-muted overflow-hidden">
        {projects.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-text-muted text-xs">No projects yet. Create one above.</p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border-muted">
                <th className="text-left px-5 py-3 text-text-muted font-medium tracking-wider uppercase">
                  Name
                </th>
                <th className="text-left px-5 py-3 text-text-muted font-medium tracking-wider uppercase">
                  Created
                </th>
                <th className="text-right px-5 py-3 text-text-muted font-medium tracking-wider uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-b border-border-muted/50 last:border-0">
                  <td className="px-5 py-3 text-text-default">{p.name}</td>
                  <td className="px-5 py-3 text-text-muted">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => deleteProject(p.id)}
                      className="text-danger text-[11px] hover:underline"
                    >
                      Delete
                    </button>
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
