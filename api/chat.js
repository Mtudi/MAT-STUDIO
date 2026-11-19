module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }
  const origin = req.headers.origin;
  const allowedOrigin = process.env.MAT_STUDIO_ORIGIN || "https://mat-studio.vercel.app";
  if (origin && origin !== allowedOrigin) return res.status(403).json({ error: "Origin not allowed." });

  const apiKey = process.env.OPENROUTER_API_KEY;
  const accessPassword = process.env.MAT_STUDIO_CHAT_PASSWORD;
  if (!apiKey || !accessPassword) {
    return res.status(503).json({ error: "Chat is not configured yet. Add the required Vercel environment variables." });
  }
  const body = req.body && typeof req.body === "object" ? req.body : {};
  if (typeof body.accessCode !== "string" || body.accessCode !== accessPassword) {
    return res.status(401).json({ error: "Incorrect access code." });
  }
  if (!Array.isArray(body.messages) || body.messages.length < 1 || body.messages.length > 16) {
    return res.status(400).json({ error: "Send between 1 and 16 messages." });
  }

  const messages = [];
  let totalChars = 0;
  for (const item of body.messages) {
    if (!item || !["user", "assistant"].includes(item.role) || typeof item.content !== "string") {
      return res.status(400).json({ error: "Invalid message format." });
    }
    const content = item.content.trim();
    if (!content || content.length > 5000) {
      return res.status(400).json({ error: "Each message must be between 1 and 5000 characters." });
    }
    totalChars += content.length;
    messages.push({ role: item.role, content });
  }
  if (totalChars > 16000 || messages[messages.length - 1].role !== "user") {
    return res.status(400).json({ error: "Conversation is too long or does not end with a user message." });
  }

  try {
    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json",
        "HTTP-Referer": allowedOrigin,
        "X-Title": "MAT-STUDIO AI Workspace"
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [
          {
            role: "system",
            content: "You are the assistant inside MAT-STUDIO AI Workspace. Be accurate, concise, practical, and transparent about uncertainty. Never claim to have performed external actions. Do not ask for passwords, API keys, or secrets."
          },
          ...messages
        ],
        max_tokens: 900,
        temperature: 0.5,
        provider: { zdr: true, data_collection: "deny" }
      })
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return res.status(upstream.status === 429 ? 429 : 502).json({
        error: upstream.status === 429
          ? "The free model limit was reached. Try again later."
          : "The AI provider could not complete this request. Try again shortly."
      });
    }
    const answer = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (typeof answer !== "string" || !answer.trim()) {
      return res.status(502).json({ error: "The model returned an empty response." });
    }
    return res.status(200).json({ answer: answer.trim(), model: data.model || "openrouter/free" });
  } catch (_) {
    return res.status(502).json({ error: "Could not reach the AI provider. Try again shortly." });
  }
};