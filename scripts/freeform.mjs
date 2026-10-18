#!/usr/bin/env node
/**
 * CHẾ ĐỘ TỰ DO — AI tự biên kịch + tự dựng graphic từ tin tức.
 *
 *   node scripts/freeform.mjs render out/freeform-script.json
 *       → chỉ render một kịch bản JSON có sẵn (không cần API key)
 *
 *   node scripts/freeform.mjs live
 *       → Exa tìm tin thật → Gemini viết kịch bản theo prompt tự do → render
 *       (cần EXA_API_KEY + GEMINI_API_KEY)
 *
 *   node scripts/freeform.mjs live --query "OpenAI doanh thu" --out out/khac.mp4
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import axios from "axios";
import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildFreeformPrompt } from "./prompts/freeform.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXA_API_KEY = process.env.EXA_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const args = process.argv.slice(2);
const mode = args[0] || "render";
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};

// ─── Exa: lấy tin thật ───────────────────────────────────────────────────────
async function fetchNews(query) {
  if (!EXA_API_KEY) throw new Error("Thiếu EXA_API_KEY");
  console.log(`🔍 Exa: "${query}"`);
  const { data } = await axios.post(
    "https://api.exa.ai/search",
    {
      query,
      numResults: 8,
      useAutoprompt: true,
      contents: { text: { maxCharacters: 900 } },
    },
    { headers: { "x-api-key": EXA_API_KEY, "Content-Type": "application/json" } }
  );
  return (data.results || []).map((r) => ({
    title: r.title,
    text: r.text,
    url: r.url,
    source: new URL(r.url).hostname.replace(/^www\./, ""),
    publishedDate: (r.publishedDate || "").slice(0, 10),
  }));
}

// ─── Gemini: viết kịch bản theo prompt tự do ─────────────────────────────────
async function writeScript(newsItems) {
  if (!GEMINI_API_KEY) throw new Error("Thiếu GEMINI_API_KEY");
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const prompt = buildFreeformPrompt(newsItems);

  for (const name of ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-2.0-flash"]) {
    try {
      console.log(`📡 Gemini [${name}]...`);
      const model = genAI.getGenerativeModel({ model: name });
      const res = await model.generateContent(prompt);
      const raw = res.response.text().replace(/```json|```/g, "").trim();
      const script = JSON.parse(raw);
      if (!Array.isArray(script.scenes) || !script.scenes.length) {
        throw new Error("JSON không có scenes");
      }
      console.log(`✅ ${script.scenes.length} cảnh · ${script.metadata?.topic || ""}`);
      return script;
    } catch (e) {
      console.warn(`⚠️ [${name}] ${e.message}`);
    }
  }
  throw new Error("Cả 3 model đều thất bại");
}

// ─── Render ──────────────────────────────────────────────────────────────────
function render(scriptPath, outPath) {
  const abs = path.resolve(ROOT, scriptPath);
  if (!fs.existsSync(abs)) throw new Error(`Không thấy ${abs}`);
  const script = JSON.parse(fs.readFileSync(abs, "utf8"));
  const seconds = (script.scenes || []).reduce((n, s) => n + (s.seconds || 4), 0);
  console.log(`🎬 ${script.scenes.length} cảnh · ${seconds.toFixed(1)}s → ${outPath}`);

  execFileSync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    [
      "remotion",
      "render",
      "src/index.ts",
      "FreeVideo",
      outPath,
      `--props=${scriptPath}`,
      "--concurrency=4",
    ],
    { cwd: ROOT, stdio: "inherit" }
  );
  console.log(`✅ Xong: ${outPath}`);
}

// ─── Main ────────────────────────────────────────────────────────────────────
(async () => {
  if (mode === "render") {
    const file = args[1] || "out/freeform-script.json";
    render(file, flag("out", "out/freeform.mp4"));
    return;
  }

  if (mode === "live") {
    const query = flag("query", "tin công nghệ AI mới nhất tuần này");
    const news = await fetchNews(query);
    if (!news.length) throw new Error("Exa không trả về tin nào");

    const script = await writeScript(news);
    const jsonPath = "out/freeform-script.json";
    fs.writeFileSync(
      path.resolve(ROOT, jsonPath),
      JSON.stringify(script, null, 2),
      "utf8"
    );
    console.log(`📝 Kịch bản: ${jsonPath}`);

    if (!args.includes("--no-render")) {
      render(jsonPath, flag("out", "out/freeform.mp4"));
    }
    return;
  }

  console.error("Dùng: node scripts/freeform.mjs [render <file> | live]");
  process.exit(1);
})().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
