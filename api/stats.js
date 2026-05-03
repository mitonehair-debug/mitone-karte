export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/diagnostics?select=count`,
      {
        headers: {
          "apikey": process.env.SUPABASE_SERVICE_KEY,
          "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          "Prefer": "count=exact",
        },
      }
    );

    const count = response.headers.get("content-range")?.split("/")[1] || "0";
    res.status(200).json({ count: parseInt(count, 10) });
  } catch (e) {
    res.status(200).json({ count: 0 });
  }
}
