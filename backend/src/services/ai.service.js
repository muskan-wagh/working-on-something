const crypto = require("crypto");
const supabase = require("../config/supabase");

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `You are an expert debugging assistant for API Guardian, an API monitoring platform. Analyze the provided incident data and return a structured JSON analysis.

Your analysis must include:
- summary: A concise 1-sentence summary of the incident
- severity: One of "Low", "Medium", "High", or "Critical"
- probable_cause: The most likely root cause (1-2 sentences)
- affected_component: One of "Database", "Authentication", "External API", "Network", "Cache", "Backend Logic", or "Other"
- recommended_actions: Array of 3-5 debugging action items in priority order (each a string)
- suggested_fix: A concise 1-2 sentence suggested fix

Return ONLY valid JSON. No markdown, no explanation, no code blocks.`;

function buildPrompt(incident, recentLogs) {
  return `Analyze this API incident:

Endpoint: ${incident.endpoint}
Method: ${incident.method}
Status Code: ${incident.status_code}
Error Fingerprint: ${incident.error_fingerprint || "N/A"}
Title: ${incident.title}
Total Occurrences: ${incident.total_occurence}
First Seen: ${incident.first_seen}
Last Seen: ${incident.last_seen}

${recentLogs && recentLogs.length > 0 ? `Recent matching error logs (${recentLogs.length} most recent):\n${JSON.stringify(recentLogs, null, 2)}` : "No detailed error logs available."}

Provide your analysis in the specified JSON format.`;
}

function makeFingerprint(incident) {
  const raw = [
    incident.endpoint || "",
    incident.method || "",
    incident.status_code || "",
    incident.error_fingerprint || "",
    incident.total_occurence || "0",
  ].join("|");
  return crypto.createHash("md5").update(raw).digest("hex");
}

async function fetchIncidentLogs(incident) {
  const { data, error } = await supabase
    .from("Logs_apiD")
    .select("endpoint, method, status_code, error_message, latency_ms, created_at")
    .eq("project_id", incident.project_id)
    .eq("endpoint", incident.endpoint)
    .eq("method", incident.method)
    .eq("status_code", incident.status_code)
    .order("created_at", { ascending: false })
    .limit(15);

  if (error) {
    console.error("Failed to fetch incident logs:", error.message);
    return [];
  }
  return data || [];
}

async function analyzeIncident(incident) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }

  const recentLogs = await fetchIncidentLogs(incident);

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildPrompt(incident, recentLogs) },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("DeepSeek returned empty response");
  }

  const parsed = JSON.parse(content);

  return {
    summary: parsed.summary || "No summary provided.",
    severity: parsed.severity || "Medium",
    probable_cause: parsed.probable_cause || "Could not determine root cause.",
    affected_component: parsed.affected_component || "Other",
    recommended_actions: Array.isArray(parsed.recommended_actions) ? parsed.recommended_actions : [],
    suggested_fix: parsed.suggested_fix || "",
  };
}

async function findAnalysisByIncident(incidentId) {
  const { data, error } = await supabase
    .from("ai_analysis_apiD")
    .select("*")
    .eq("incident_id", incidentId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function saveAnalysis(incidentId, analysis, fingerprint) {
  const { data, error } = await supabase
    .from("ai_analysis_apiD")
    .insert([
      {
        incident_id: incidentId,
        summary: analysis.summary,
        severity: analysis.severity,
        probable_cause: analysis.probable_cause,
        affected_component: analysis.affected_component,
        recommended_actions: analysis.recommended_actions,
        suggested_fix: analysis.suggested_fix,
        incident_fingerprint: fingerprint,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateAnalysis(id, analysis, fingerprint) {
  const { data, error } = await supabase
    .from("ai_analysis_apiD")
    .update({
      summary: analysis.summary,
      severity: analysis.severity,
      probable_cause: analysis.probable_cause,
      affected_component: analysis.affected_component,
      recommended_actions: analysis.recommended_actions,
      suggested_fix: analysis.suggested_fix,
      incident_fingerprint: fingerprint,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function getOrCreateAnalysis(incident) {
  const fingerprint = makeFingerprint(incident);
  const existing = await findAnalysisByIncident(incident.id);

  if (existing && existing.incident_fingerprint === fingerprint) {
    return existing;
  }

  if (existing) {
    const analysis = await analyzeIncident(incident);
    return await updateAnalysis(existing.id, analysis, fingerprint);
  }

  const analysis = await analyzeIncident(incident);
  return await saveAnalysis(incident.id, analysis, fingerprint);
}

async function getLatestAnalyses(limit = 5) {
  const { data, error } = await supabase
    .from("ai_analysis_apiD")
    .select("*, incident:incident_id(id, title, endpoint, method, status_code, total_occurence)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

module.exports = { getOrCreateAnalysis, getLatestAnalyses, analyzeIncident };
