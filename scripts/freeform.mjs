#!/usr/bin/env node
/**
 * CHẾ ĐỘ TỰ DO — AI tự biên kịch + tự dựng graphic từ tin tức, có giọng đọc.
 *
 *   node scripts/freeform.mjs render out/beam-library.json
 *       → render một kịch bản có sẵn (không cần API key, không tạo voice)
 *
 *   node scripts/freeform.mjs voice out/beam-library.json
 *       → tạo voice + karaoke cho kịch bản đã có, ghi lại JSON rồi render
 *
 *   node scripts/freeform.mjs live
 *       → Exa tìm tin → Gemini viết kịch bản → voice → render
 *
 *   node scripts/freeform.mjs live --query "..." --out out/khac.mp4 --no-render
 */
import fs from "node:fs";
import path from "node:path";
import { execSync, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import axios from "axios";
import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildFreeformPrompt, VISUAL_DIRECTIONS } from "./prompts/freeform.mjs";
import { buildBrainstormPrompt, buildScriptPrompt } from "./prompts/brainstorm.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXA_API_KEY = process.env.EXA_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PYTHON_BIN = process.env.PYTHON_BIN || "python";

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

// ─── Gemini: brainstorm -> chọn -> viết kịch bản ────────────────────────────
/**
 * Danh sách model KHÔNG hardcode cứng.
 * Bài học 2026-10-18: "gemini-2.5-flash" và "gemini-2.0-flash" trả 404
 * "no longer available to new users" -> chuỗi fallback 3 model thực chất chỉ có 1.
 * Giờ tự hỏi ListModels lúc chạy, nên model mới/chết không làm hỏng pipeline.
 */
const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const DEAD_MODEL_HINTS = /embedding|aqa|image|tts|veo|imagen|learnlm/i;

const envList = (name) =>
  String(process.env[name] || "")
    .split("||")
    .map((t) => t.trim())
    .filter(Boolean);

/** Hỏi Google xem tài khoản này thật sự gọi được model nào. */
async function listUsableModels() {
  try {
    const { data } = await axios.get(
      "https://generativelanguage.googleapis.com/v1beta/models",
      { params: { key: GEMINI_API_KEY, pageSize: 200 }, timeout: 15000 }
    );
    return (data.models || [])
      .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
      .map((m) => String(m.name).replace(/^models\//, ""))
      .filter((n) => !DEAD_MODEL_HINTS.test(n));
  } catch (e) {
    console.warn(`⚠️ Không lấy được danh sách model: ${e.message}`);
    return [];
  }
}

const isTransient = (e) => /\[(503|429|500)\]|high demand|overloaded|timeout/i.test(e.message);
const isGone = (e) => /\[404\]|no longer available|not found/i.test(e.message);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Gọi Gemini, tự tìm model còn sống, thử lại khi lỗi tạm thời. */
async function callGemini(prompt, label) {
  if (!GEMINI_API_KEY) throw new Error("Thiếu GEMINI_API_KEY");
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  const discovered = await listUsableModels();
  const preferred = discovered
    .filter((n) => /flash/i.test(n))
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  const rest = discovered.filter((n) => !preferred.includes(n));

  const candidates = [
    ...new Set([PRIMARY_MODEL, ...envList("GEMINI_MODELS"), ...preferred, ...rest]),
  ];
  if (!candidates.length) candidates.push(PRIMARY_MODEL);

  let last = null;
  for (const name of candidates) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`📡 Gemini [${name}] · ${label}${attempt > 1 ? ` (lần ${attempt})` : ""}...`);
        const model = genAI.getGenerativeModel({ model: name });
        const res = await model.generateContent(prompt);
        const raw = res.response.text().replace(/```json|```/g, "").trim();
        return JSON.parse(raw);
      } catch (e) {
        last = e;
        const msg = e.message.split("\n")[0].slice(0, 110);
        console.warn(`⚠️ [${name}] ${msg}`);

        if (isGone(e)) break; // model chết -> thử model khác ngay
        if (!isTransient(e)) break; // JSON hỏng / lỗi khác -> thử model khác

        if (attempt < 2) await sleep(attempt * 6000);
      }
    }
  }
  throw new Error(
    `Gemini thất bại ở bước "${label}" — đã thử ${candidates.length} model. Cuối: ${
      last ? last.message.split("\n")[0] : "?"
    }`
  );
}

/** BƯỚC 1 — nghĩ ra 5 phương án dựng hình, chưa viết kịch bản. */
async function brainstormConcepts(newsItems, banned, recentTypes) {
  const out = await callGemini(
    buildBrainstormPrompt(newsItems, banned, recentTypes),
    "brainstorm"
  );

  const concepts = Array.isArray(out.concepts) ? out.concepts : [];
  if (concepts.length < 4) {
    throw new Error(`Brainstorm chỉ ra ${concepts.length} phương án (cần ≥4)`);
  }

  const spines = concepts.map((c) => (c.spine || []).join(","));
  const distinct = new Set(spines).size;
  if (distinct < 4) {
    console.warn(
      `⚠️ 5 phương án nhưng chỉ có ${distinct} bộ xương khác nhau — brainstorm hơi trùng.`
    );
  }

  const usesCanvas = concepts.filter((c) => (c.spine || []).includes("canvas")).length;
  if (usesCanvas < 2) {
    console.warn(`⚠️ Chỉ ${usesCanvas} phương án dùng canvas (nên có ≥2).`);
  }

  console.log(`💡 Brainstorm: ${concepts.length} phương án · ${distinct} bộ xương khác nhau`);
  if (out.keyFact) console.log(`   Điều phải nhớ: ${out.keyFact}`);
  for (const c of concepts) {
    console.log(`   ${c.id}. ${c.label} — ${(c.spine || []).join(" > ")}`);
    console.log(`      ${c.angle}`);
  }
  return out;
}

/** BƯỚC 2 — chấm điểm, chọn phương án, rồi viết kịch bản đầy đủ. */
async function writeScript(newsItems, brainstorm, recentTypes) {
  const script = await callGemini(
    buildScriptPrompt(newsItems, brainstorm, recentTypes),
    "kịch bản"
  );

  if (!Array.isArray(script.scenes) || !script.scenes.length) {
    throw new Error("JSON không có scenes");
  }

  script.metadata = script.metadata || {};
  script.brainstorm = brainstorm;
  script.decision = script.decision || {};

  const d = script.decision;
  const chosen = brainstorm.concepts.find((c) => c.id === d.chosen);
  console.log(
    `🎯 Chọn phương án ${d.chosen}${chosen ? ` — ${chosen.label}` : ""}${
      Array.isArray(d.merged) && d.merged.length > 1 ? ` (lai ${d.merged.join("+")})` : ""
    }`
  );
  if (Array.isArray(d.scores)) {
    for (const s of d.scores) {
      const c = brainstorm.concepts.find((x) => x.id === s.id);
      const mark = s.id === d.chosen ? " ←" : "";
      console.log(
        `   ${s.id}. ${(c?.label || "?").padEnd(14)} ` +
          `hợp ${s.dungHop} · rõ ${s.roRang} · mới ${s.moi} · khả thi ${s.khaThi} = ${s.total}${mark}`
      );
    }
  }
  if (d.why) console.log(`   Vì sao: ${d.why}`);

  script.metadata.concept = script.metadata.concept || chosen?.label || "";
  console.log(`✅ ${script.scenes.length} cảnh · ${script.metadata?.topic || ""}`);
  console.log(`   ${script.scenes.map((s) => s.type).join(" > ")}`);

  const tally = script.scenes.reduce((m, s) => ((m[s.type] = (m[s.type] || 0) + 1), m), {});
  const overused = Object.entries(tally).filter(([t, n]) => n >= 3 && t !== "canvas");
  if (overused.length) {
    console.warn(
      `⚠️ Lặp cảnh trong cùng video: ${overused
        .map(([t, n]) => `${t}×${n}`)
        .join(", ")} — sẽ trông đơn điệu.`
    );
  }
  if (!tally.canvas) {
    console.warn("⚠️ Không có cảnh canvas nào — video sẽ không có hình tự bố cục.");
  }
  return script;
}

/** Đường thủ công: ép một hướng cố định bằng --direction (bỏ qua brainstorm). */
async function writeScriptForced(newsItems, banned, recentTypes, dirKey) {
  const direction = VISUAL_DIRECTIONS.find((d) => d.key === dirKey);
  if (!direction) {
    throw new Error(
      `Không có hướng "${dirKey}". Chọn: ${VISUAL_DIRECTIONS.map((d) => d.key).join(", ")}`
    );
  }
  console.log(`🎨 Ép hướng: ${direction.name} (${direction.key})`);

  const script = await callGemini(
    buildFreeformPrompt(newsItems, banned, { direction, recentTypes }),
    "kịch bản (ép hướng)"
  );
  if (!Array.isArray(script.scenes) || !script.scenes.length) {
    throw new Error("JSON không có scenes");
  }
  script.metadata = script.metadata || {};
  script.metadata.concept = direction.name;
  console.log(`✅ ${script.scenes.length} cảnh · ${script.metadata?.topic || ""}`);
  console.log(`   ${script.scenes.map((s) => s.type).join(" > ")}`);
  return script;
}

// ─── Voice: edge-tts cho từng cảnh + word boundary để karaoke ───────────────
const VOICE_DIR = path.join(ROOT, "public", "voice");

function ttsScene(text, index) {
  fs.mkdirSync(VOICE_DIR, { recursive: true });
  fs.mkdirSync(path.join(ROOT, "out"), { recursive: true });

  const name = `s${String(index + 1).padStart(2, "0")}`;
  const txt = path.join(ROOT, "out", `tts_${name}.txt`);
  const mp3 = path.join(VOICE_DIR, `${name}.mp3`);
  const sub = path.join(VOICE_DIR, `${name}.json`);

  fs.writeFileSync(txt, text, "utf8");
  execSync(`${PYTHON_BIN} scripts/tts.py "${txt}" "${mp3}" "${sub}"`, {
    cwd: ROOT,
    stdio: "inherit",
  });

  const words = JSON.parse(fs.readFileSync(sub, "utf8"));
  const dur = words.length ? words[words.length - 1].end : 0;
  if (!words.length || dur <= 0) {
    throw new Error("edge-tts trả về 0 từ — coi như thất bại");
  }
  return {
    audio: `voice/${name}.mp3`,
    words: words.map((w) => ({ w: w.word, s: w.start, e: w.end })),
    dur,
  };
}

/** edge-tts hay chập chờn (403 / no audio) -> thử lại, chờ tăng dần. */
async function ttsSceneRetry(text, index) {
  let last;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return ttsScene(text, index);
    } catch (e) {
      last = e;
      if (attempt < 3) {
        console.warn(`   ↻ lỗi (${e.message.split("\n")[0].slice(0, 60)}) — thử lại ${attempt + 1}/3`);
        await sleep(2000 * attempt);
      }
    }
  }
  throw last;
}

/**
 * Sinh giọng cho mọi cảnh có "voiceover".
 * Scene tự dài ra nếu giọng đọc dài hơn thời lượng khai báo — không bao giờ cắt cụt câu.
 */
async function addVoice(script) {
  const scenes = script.scenes || [];
  let made = 0;

  for (let i = 0; i < scenes.length; i++) {
    const text = String(scenes[i].voiceover || "").trim();
    if (!text) continue;

    if (i > 0) await sleep(1200);
    process.stdout.write(`🎙️ Cảnh ${i + 1}: "${text.slice(0, 52)}…" `);
    const { audio, words, dur } = await ttsSceneRetry(text, i);
    scenes[i].audio = audio;
    scenes[i].words = words;
    scenes[i].seconds = Math.max(
      Number(scenes[i].seconds) || 4,
      Number((dur + (i === scenes.length - 1 ? 0.6 : 0.3)).toFixed(2))
    );
    console.log(`→ ${dur.toFixed(2)}s, ${words.length} từ`);
    made++;
  }

  if (!made) {
    console.warn('⚠️ Không cảnh nào có "voiceover" — video sẽ không có tiếng.');
  }
  return script;
}

// ─── Đăng bài: GitHub Release CDN + webhook Activepieces ─────────────────────
const WEBHOOK = process.env.ACTIVEPIECES_WEBHOOK_URL;
const REPO = process.env.RELEASE_REPO || "chithong2k2/video-automation";

function uploadToRelease(videoPath, script) {
  const tag = `v${Date.now()}`;
  const topic = (script.metadata?.topic || "Video Nexo Studio").replace(/["\r\n]/g, " ");
  const storyKey = (script.metadata?.storyKey || "").replace(/["\r\n]/g, " ");
  const dirKey = (script.metadata?.concept || "").replace(/["\r\n]/g, " ");
  const types = (script.scenes || [])
    .map((s) => s.type)
    .filter(Boolean)
    .join(",");
  const notes = [
    `TOPIC: ${topic} :: ${storyKey}`,
    `CONCEPT: ${dirKey}`,
    `TYPES: ${types}`,
    `Automated daily video`,
  ].join("\n");

  console.log("☁️ Upload lên GitHub Release...");
  execSync(
    `gh release create "${tag}" "${videoPath}#video.mp4" --title "Daily Video ${new Date()
      .toISOString()
      .slice(0, 10)}" --notes "${notes}" --repo ${REPO}`,
    { cwd: ROOT, stdio: "inherit" }
  );
  const url = `https://github.com/${REPO}/releases/download/${tag}/video.mp4`;
  console.log("✅ CDN:", url);
  return url;
}

async function triggerWebhook(videoUrl, script) {
  if (!WEBHOOK) {
    console.warn("⚠️ Thiếu ACTIVEPIECES_WEBHOOK_URL — video đã render nhưng KHÔNG được đăng.");
    return false;
  }
  const scenes = script.scenes || [];
  const cta =
    [...scenes].reverse().find((s) => s.cta)?.cta || "Theo dõi Nexo Studio";
  const tags = script.metadata?.hashtags || ["#nexostudio", "#congnghe"];

  console.log("🔔 Gửi Activepieces...");
  await axios.post(WEBHOOK, {
    videoUrl,
    title: script.metadata?.topic || "Video Nexo Studio",
    hashtags: Array.isArray(tags) ? tags.join(" ") : tags,
    cta,
    timestamp: new Date().toISOString(),
  });
  console.log("✅ Đã đăng.");
  return true;
}

async function publish(videoPath, script) {
  const url = uploadToRelease(videoPath, script);
  await triggerWebhook(url, script);
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

const save = (script, file = "out/freeform-script.json") => {
  fs.writeFileSync(path.resolve(ROOT, file), JSON.stringify(script, null, 2), "utf8");
  console.log(`📝 Kịch bản: ${file}`);
  return file;
};

// ─── Main ────────────────────────────────────────────────────────────────────
(async () => {
  if (mode === "render") {
    const file = args[1] || "out/freeform-script.json";
    render(file, flag("out", "out/freeform.mp4"));
    return;
  }

  if (mode === "voice") {
    const file = args[1];
    if (!file) {
      throw new Error("Thiếu đường dẫn JSON: node scripts/freeform.mjs voice out/x.json");
    }
    const script = JSON.parse(fs.readFileSync(path.resolve(ROOT, file), "utf8"));
    await addVoice(script);
    save(script, file);
    if (!args.includes("--no-render")) render(file, flag("out", "out/freeform.mp4"));
    return;
  }

  if (mode === "live") {
    const query = flag("query", "tin công nghệ AI mới nhất tuần này");
    const news = await fetchNews(query);
    if (!news.length) throw new Error("Exa không trả về tin nào");

    const banned = envList("RECENT_TOPICS");
    const recentTypes = envList("RECENT_TYPES");
    const forced = flag("direction", "").trim().toUpperCase();

    let script;
    if (forced) {
      // Đường thủ công: ép một hướng cố định, bỏ qua brainstorm
      script = await writeScriptForced(news, banned, recentTypes, forced);
    } else {
      // Đường mặc định: AI tự nghĩ 5 phương án -> chấm điểm -> chọn -> viết
      const bs = await brainstormConcepts(news, banned, recentTypes);
      script = await writeScript(news, bs, recentTypes);
    }
    await addVoice(script);
    const jsonPath = save(script, flag("json", "out/freeform-script.json"));

    const total = (script.scenes || []).reduce((n, s) => n + (s.seconds || 4), 0);
    const words = (script.scenes || []).reduce(
      (n, s) => n + String(s.voiceover || "").trim().split(/\s+/).filter(Boolean).length,
      0
    );
    console.log(
      `📊 Tổng thời lượng: ${total.toFixed(1)}s · ${script.scenes.length} cảnh · ${words} từ`
    );
    if (total > 56) {
      console.warn(
        `⚠️ Video ${total.toFixed(1)}s — vượt trần 55s (${words} từ). Giảm lời thoại hoặc bớt cảnh.`
      );
    }

    if (args.includes("--dry-run")) {
      console.log("🧪 Dry run — không render, không đăng.");
      return;
    }
    if (args.includes("--no-render")) return;

    const out = flag("out", "out/freeform.mp4");
    render(jsonPath, out);
    if (!args.includes("--no-publish")) await publish(out, script);
    return;
  }

  console.error("Dùng: node scripts/freeform.mjs [render <file> | voice <file> | live]");
  process.exit(1);
})().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
