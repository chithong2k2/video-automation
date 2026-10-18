/**
 * video-automation-cron
 *
 * GitHub Actions `schedule` là best-effort: run có thể bị delay hoặc DROP hoàn toàn
 * khi hệ thống tải cao (docs GitHub: "some queued jobs may be dropped").
 * Repo này đã bị drop 100% run theo lịch -> video không tự đăng.
 *
 * Worker này thay GitHub cron: Cloudflare cron bắn mỗi 5 phút, worker tự so giờ
 * Việt Nam rồi gọi API workflow_dispatch. Có KV chống bắn trùng + cửa sổ ân hạn
 * để nếu cron trễ vài phút vẫn bắt kịp.
 */

// Giờ Việt Nam (UTC+7) -> loại video
const SLOTS = {
  "07:15": "news",
  "10:05": "lesson",
  "13:05": "news",
  "16:05": "news",
  "18:35": "lesson",
  "20:35": "news",
};

// Cron có thể trễ vài phút -> chấp nhận bắn trong vòng WINDOW_MIN phút sau slot
const WINDOW_MIN = 10;

function vnParts(ms) {
  const d = new Date(ms + 7 * 3600_000);
  return {
    ymd: d.toISOString().slice(0, 10),
    minutes: d.getUTCHours() * 60 + d.getUTCMinutes(),
    label: `${String(d.getUTCHours()).padStart(2, "0")}:${String(
      d.getUTCMinutes()
    ).padStart(2, "0")}`,
  };
}

async function dispatch(env, type) {
  const res = await fetch(
    `https://api.github.com/repos/${env.REPO}/actions/workflows/${env.WORKFLOW_FILE}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "nexo-video-cron",
      },
      body: JSON.stringify({ ref: "main", inputs: { type } }),
    }
  );
  const body = res.ok ? "" : await res.text();
  return { ok: res.ok, status: res.status, body };
}

export default {
  async scheduled(event, env, ctx) {
    const now = vnParts(event.scheduledTime ?? Date.now());

    for (const [slot, type] of Object.entries(SLOTS)) {
      const [h, m] = slot.split(":").map(Number);
      const slotMin = h * 60 + m;

      if (now.minutes < slotMin || now.minutes >= slotMin + WINDOW_MIN) continue;

      const key = `${now.ymd}-${slot}`;
      if (await env.SLOT_STATE.get(key)) continue; // slot này hôm nay đã bắn

      await env.SLOT_STATE.put(key, String(Date.now()), {
        expirationTtl: 60 * 60 * 26,
      });

      const result = await dispatch(env, type);
      console.log(
        `[${now.label} VN] slot ${slot} -> ${type} : ${result.status} ${result.body}`
      );

      // Bắn lỗi thì xoá state để tick sau (trong cửa sổ) thử lại
      if (!result.ok) await env.SLOT_STATE.delete(key);
    }
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    const now = vnParts(Date.now());

    // /?force=news&key=ADMIN_KEY  -> bắn tay 1 video, không cần vào GitHub
    const force = url.searchParams.get("force");
    if (force) {
      if (url.searchParams.get("key") !== env.ADMIN_KEY) {
        return new Response("forbidden", { status: 403 });
      }
      if (!["news", "lesson"].includes(force)) {
        return Response.json({ error: "force phải là news hoặc lesson" }, { status: 400 });
      }
      const result = await dispatch(env, force);
      return Response.json({ forced: force, ...result });
    }

    return Response.json({
      ok: true,
      service: "video-automation-cron",
      gioVietNam: now.label,
      ngay: now.ymd,
      slots: SLOTS,
      windowMinutes: WINDOW_MIN,
    });
  },
};
