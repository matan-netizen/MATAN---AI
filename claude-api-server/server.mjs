// A small HTTP API in front of Claude, so other systems (CRM, Make, Zapier,
// a website) can send text and get Claude's answer back.
//
//   ANTHROPIC_API_KEY=sk-ant-...  SERVER_TOKEN=some-long-secret  npm start
//
// POST /ask   (header: Authorization: Bearer <SERVER_TOKEN>)
//   body: { "message": "...", "system"?: "...", "history"?: [{role, content}] }
//   200:  { "answer": "...", "model": "...", "usage": {...} }
// GET /health → { "ok": true }

import http from "node:http";
import Anthropic from "@anthropic-ai/sdk";

const PORT = Number(process.env.PORT ?? 3000);
const SERVER_TOKEN = process.env.SERVER_TOKEN;
const MODEL = process.env.CLAUDE_MODEL ?? "claude-opus-5-5";
const EFFORT = process.env.CLAUDE_EFFORT ?? "medium";
const DEFAULT_SYSTEM =
  process.env.CLAUDE_SYSTEM ?? "ענה בעברית, בקצרה ובבהירות.";
const MAX_BODY = 1_000_000;

if (!SERVER_TOKEN) {
  console.error("SERVER_TOKEN is not set. Choose a long random secret so only your systems can call this API.");
  process.exit(1);
}

// Reads ANTHROPIC_API_KEY from the environment.
const client = new Anthropic();

const send = (res, status, body) => {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
};

const readJson = (req) =>
  new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > MAX_BODY) reject(new Error("Body too large"));
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(data || "{}"));
      } catch {
        reject(new Error("Body is not valid JSON"));
      }
    });
    req.on("error", reject);
  });

const ask = async ({ message, system, history = [] }) => {
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    output_config: { effort: EFFORT },
    // If a safety classifier declines, the API retries on a suitable model
    // inside the same call instead of returning an empty answer.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: system ?? DEFAULT_SYSTEM,
    messages: [...history, { role: "user", content: message }],
  });
  if (response.stop_reason === "refusal") {
    return { refused: true, model: response.model };
  }
  const answer = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
  return { answer, model: response.model, usage: response.usage };
};

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    return send(res, 200, { ok: true });
  }
  if (req.method !== "POST" || req.url !== "/ask") {
    return send(res, 404, { error: "Not found. Use POST /ask" });
  }
  if (req.headers.authorization !== `Bearer ${SERVER_TOKEN}`) {
    return send(res, 401, { error: "Missing or wrong Authorization token" });
  }

  let body;
  try {
    body = await readJson(req);
  } catch (err) {
    return send(res, 400, { error: err.message });
  }
  if (typeof body.message !== "string" || !body.message.trim()) {
    return send(res, 400, { error: '"message" (text) is required' });
  }
  if (!Array.isArray(body.history ?? [])) {
    return send(res, 400, { error: '"history" must be an array of {role, content}' });
  }

  try {
    const result = await ask(body);
    if (result.refused) {
      return send(res, 422, { error: "Claude declined this request", model: result.model });
    }
    return send(res, 200, result);
  } catch (err) {
    // Most specific first: retryable (429/5xx/network) vs. caller errors.
    if (err instanceof Anthropic.RateLimitError) {
      return send(res, 429, { error: "Rate limited by Claude API, try again shortly" });
    }
    if (err instanceof Anthropic.AuthenticationError) {
      return send(res, 500, { error: "ANTHROPIC_API_KEY is missing or invalid on the server" });
    }
    if (err instanceof Anthropic.BadRequestError) {
      return send(res, 400, { error: err.message });
    }
    if (err instanceof Anthropic.APIConnectionError) {
      return send(res, 502, { error: "Could not reach the Claude API" });
    }
    if (err instanceof Anthropic.APIError) {
      return send(res, 502, { error: `Claude API error ${err.status}` });
    }
    console.error(err);
    return send(res, 500, { error: "Internal error" });
  }
});

server.listen(PORT, () => {
  console.log(`Claude API server on http://localhost:${PORT} (model ${MODEL})`);
});
