function getWorkers(env) {
  return [
    { name: "Convert Worker", url: env.CONVERT_WORKER_URL, queue: "download" },
    { name: "Chunk Worker", url: env.CHUNK_WORKER_URL, queue: "chunk" },
    {
      name: "Transcription Worker",
      url: env.TRANSCRIPTION_WORKER_URL,
      queue: "transcription",
    },
    {
      name: "Aggregation Worker",
      url: env.AGGREGATION_WORKER_URL,
      queue: "aggregation",
    },
  ];
}

const WAKE_TIMEOUT_MS = 58000;
const PING_TIMEOUT_MS = 10000;

// ─── Fetch handler (gateway mode) ────────────────────────────────────────────

export default {
  async fetch(request, env, ctx) {
    const workers = getWorkers(env);
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/transcribe") {
      return handleTranscribe(request, env, ctx, workers);
    }

    return proxyToBackend(request, url, env.BACKEND_URL);
  },

  // ─── Scheduled handler (pinger mode) ─────────────────────────────────────
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runPinger(env, getWorkers(env)));
  },
};

// ─── Gateway logic ────────────────────────────────────────────────────────────

async function handleTranscribe(request, env, ctx, workers) {
  const wakeResults = await Promise.allSettled(
    workers.map((w) => wakeWorker(w.name, w.url, WAKE_TIMEOUT_MS)),
  );

  const failed = wakeResults
    .map((r, i) => ({ result: r, worker: workers[i] }))
    .filter(({ result }) => result.status === "rejected" || !result.value?.ok)
    .map(({ worker }) => worker.name);

  if (failed.length > 0) {
    return new Response(
      JSON.stringify({
        error: "Some workers are not ready. Please try again shortly.",
        unavailable: failed,
      }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  ctx.waitUntil(env.JOB_STATE.put("jobs_active", "true"));

  return proxyToBackend(request, new URL(request.url), env.BACKEND_URL);
}

// ─── Pinger logic ─────────────────────────────────────────────────────────────

async function runPinger(env, workers) {
  const flag = await env.JOB_STATE.get("jobs_active");
  if (flag !== "true") {
    console.log("[pinger] no active jobs, skipping");
    return;
  }

  console.log("[pinger] jobs active, checking queue status...");

  const statusResults = await Promise.allSettled(
    workers.map((w) => fetchQueueStatus(w)),
  );

  const allIdle = statusResults.every((r) => {
    if (r.status === "rejected") return false;
    return r.value.busy === false;
  });

  if (allIdle) {
    console.log(
      "[pinger] all queues empty, clearing flag → workers will sleep",
    );
    await env.JOB_STATE.put("jobs_active", "false");
    return;
  }

  console.log("[pinger] jobs still running, sending keep-alive pings...");
  await Promise.allSettled(
    workers.map((w) => wakeWorker(w.name, w.url, PING_TIMEOUT_MS)),
  );
}

async function fetchQueueStatus(worker) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

  try {
    const res = await fetch(`${worker.url}/queue-status`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    throw new Error(`${worker.name} queue-status failed: ${err.message}`);
  }
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

async function wakeWorker(name, baseUrl, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl}/`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`${name} returned ${res.status}`);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw new Error(`${name} wake failed: ${err.message}`);
  }
}

async function proxyToBackend(request, url, backendUrl) {
  const targetUrl = `${backendUrl}${url.pathname}${url.search}`;
  const proxied = new Request(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    duplex: "half",
  });

  try {
    return await fetch(proxied);
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Backend unreachable", detail: err.message }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }
}
