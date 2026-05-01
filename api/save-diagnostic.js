export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code, selfType, selfScores, peerType, peerScores, peerCount, experienceYears, role } = req.body;

  if (!code || !selfType || !selfScores) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/diagnostics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": process.env.SUPABASE_SERVICE_KEY,
        "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        code,
        self_type: selfType,
        self_r: selfScores.R,
        self_i: selfScores.I,
        self_a: selfScores.A,
        self_s: selfScores.S,
        self_e: selfScores.E,
        self_c: selfScores.C,
        peer_type: peerType || null,
        peer_r: peerScores?.R ? Math.round(peerScores.R) : null,
        peer_i: peerScores?.I ? Math.round(peerScores.I) : null,
        peer_a: peerScores?.A ? Math.round(peerScores.A) : null,
        peer_s: peerScores?.S ? Math.round(peerScores.S) : null,
        peer_e: peerScores?.E ? Math.round(peerScores.E) : null,
        peer_c: peerScores?.C ? Math.round(peerScores.C) : null,
        peer_count: peerCount || 0,
        experience_years: experienceYears || null,
        role: role || null,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
