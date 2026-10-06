// Receives one complete center response and forwards it to Discord.
const WEBHOOK = process.env.DISCORD_WEBHOOK_URL ||
  "https://discord.com/api/webhooks/1557036836256485396/PCndhsRHcZvBafOCmksSt02R0hwXSfXt-jcDJUn3b_GMyQSJfeFTDjMM7KcoxZ73jrtL";

const L = { title: 256, field: 1024, total: 5900 };
const cut = (s, n) => { s = String(s == null || s === "" ? "—" : s); return s.length > n ? s.slice(0, n - 1) + "…" : s; };
const list = a => (Array.isArray(a) && a.length) ? a.join(", ") : "—";
const val = v => (v == null || v === "") ? "—" : String(v);

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString("en-GB", { timeZone: "Asia/Jakarta", hour12: false }) + " WIB";
  } catch (e) { return iso || "—"; }
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });

  let d = req.body;
  if (typeof d === "string") { try { d = JSON.parse(d); } catch (e) { return res.status(400).json({ ok: false, error: "bad_json" }); } }
  if (!d || typeof d !== "object") return res.status(400).json({ ok: false, error: "empty_body" });

  const c = d.center || {}, h = d.help || {}, t = d.contact || {}, s = d.survey || {};

  const embeds = [
    {
      title: "🕌 New Islamic Center Registration",
      color: 0x0b5c46,
      fields: [
        { name: "Center name", value: cut(c.name, L.field), inline: true },
        { name: "Location / City", value: cut(c.location, L.field), inline: true },
        { name: "Students", value: cut(c.students, L.field), inline: true },
        { name: "Teachers", value: cut(c.teachers, L.field), inline: true },
        { name: "Students live at center", value: cut(c.living, L.field), inline: true }
      ],
      footer: { text: "Center information" }
    },
    {
      title: "🧩 System they want",
      color: 0x0e7a5f,
      fields: [
        { name: "Features", value: cut(list(d.features), L.field) },
        { name: "Parents", value: cut(list(d.parents), L.field) },
        { name: "Teachers", value: cut(list(d.teachers), L.field) },
        { name: "Anything else", value: cut(d.otherSystem, L.field) }
      ]
    },
    {
      title: "🤝 How we can help",
      color: 0xb98b3a,
      fields: [
        { name: "How a website could help", value: cut(h.website, L.field) },
        { name: "Biggest online management difficulty", value: cut(h.difficulty, L.field) }
      ]
    },
    {
      title: "📞 Contact",
      color: 0x0e7a5f,
      fields: [
        { name: "Name", value: cut(t.name, L.field), inline: true },
        { name: "Position", value: cut(t.role === "Other" && t.roleOther ? t.roleOther : t.role, L.field), inline: true },
        { name: "WhatsApp", value: cut(t.whatsapp, L.field), inline: true },
        { name: "Email", value: cut(t.email, L.field), inline: true }
      ]
    },
    {
      title: "📋 Survey 1 – 5",
      color: 0x135e91,
      fields: [
        { name: "1. How do you record attendance?", value: cut(val(s.q1), L.field) },
        { name: "2. How do teachers record progress?", value: cut(val(s.q2), L.field) },
        { name: "3. How do parents receive information?", value: cut(val(s.q3), L.field) },
        { name: "4. What should parents see?", value: cut(list(s.q4), L.field) },
        { name: "5. What takes the most time?", value: cut(list(s.q5), L.field) }
      ]
    },
    {
      title: "📋 Survey 6 – 10",
      color: 0x135e91,
      fields: [
        { name: "6. Lessons per student per day", value: cut(val(s.q6), L.field) },
        { name: "7. Record attendance per lesson?", value: cut(val(s.q7), L.field) },
        { name: "8. Regular parent reports?", value: cut(val(s.q8), L.field) },
        { name: "9. Biggest problem to solve", value: cut(val(s.q9), L.field) },
        { name: "10. Monthly budget", value: cut(val(s.q10), L.field) }
      ]
    }
  ];

  // keep every embed inside Discord's limits
  for (const e of embeds) {
    e.title = e.title.slice(0, L.title);
    e.fields = e.fields.filter(f => f.value && f.value !== "");
    let total = 0;
    for (const f of e.fields) { total += f.name.length + f.value.length; }
    if (total > L.total) e.fields = e.fields.slice(0, 3);
  }

  const body = {
    username: "Islamic Center Registration",
    content: `**New center response** · ${fmtDate(d.submittedAt)}`,
    embeds
  };

  try {
    const r = await fetch(WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      console.error("discord_rejected", r.status, txt.slice(0, 300));
      return res.status(502).json({ ok: false, error: "discord_failed", status: r.status });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("discord_unreachable", String(err));
    return res.status(502).json({ ok: false, error: "discord_unreachable" });
  }
};
