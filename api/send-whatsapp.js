// Despite the file name, this now sends a push notification through ntfy.sh
// (no Meta / WhatsApp account needed). Keeping the name means index.js
// doesn't need any change.
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { NTFY_TOPIC } = process.env;

  if (!NTFY_TOPIC) {
    console.error("Missing NTFY_TOPIC environment variable");
    return res.status(500).json({ success: false, error: "Server not configured" });
  }

  try {
    const response = await fetch(`https://ntfy.sh/${encodeURIComponent(NTFY_TOPIC)}`, {
      method: "POST",
      headers: {
        Title: "Button clicked",
        Priority: "high",
        Tags: "blue_heart"
      },
      body: "Someone clicked 'can we try it??' on your apology page 💙"
    });

    if (!response.ok) {
      console.error("ntfy error:", response.status, await response.text());
      return res.status(502).json({ success: false, error: "Send failed" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("ntfy request error:", error);
    return res.status(500).json({ success: false, error: "Request failed" });
  }
};