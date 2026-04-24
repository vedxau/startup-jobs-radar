import type { NextApiRequest, NextApiResponse } from "next";

export const config = { api: { bodyParser: true } };

const SYSTEM = `You are an elite startup job research analyst specialising in the Indian and remote startup ecosystem. 
You have deep knowledge of funded Indian startups, their hiring patterns, and the roles that lead to ₹1Cr+ salaries as described in the Think School podcast with Ankit Agarwal.
Always return ONLY valid raw JSON arrays — no markdown, no backticks, no explanation.`;

const buildPrompt = (roles: string[], stage: string) => `
Today is ${new Date().toDateString()}.

You are researching REAL, active or very recently posted (2025-2026) startup job openings for:
Roles: ${roles.join(", ")}
Startup stage: ${stage}
Location: Remote-friendly OR any Indian city
Exclusion: NO MNCs (no TCS, Infosys, Wipro, Accenture, IBM)

Draw from your knowledge of funded Indian startups across these sectors:
- Fintech: Razorpay, Groww, CRED, Slice, Jupiter, Fi Money, Smallcase, Zerodha, Coin, Juspay, Cashfree, Open
- SaaS/B2B: Freshworks, BrowserStack, Postman, Chargebee, Leadsquared, Whatfix, Zoho, Darwinbox, HROne, Keka, Slintel, Toplyne, WebEngage, MoEngage, CleverTap
- Edtech: PhysicsWallah, upGrad, Unacademy, Unstop, Classplus, Teachmint, Scaler, Masai School
- Healthtech: Pristyn Care, Innovaccer, Mfine, Healthplix, Eka Care, Docprime, Clinikk
- Commerce/D2C: Meesho, Licious, Country Delight, Ninjacart, Zetwerk, Moglix, Udaan, Infra.Market, Dukaan, Bikayi
- Deeptech/AI: Sarvam AI, Krutrim, Yellow.ai, Observe.AI, Uniphore, Mad Street Den, Niramai
- Quick Commerce: Zepto, Blinkit (Zomato), Swiggy Instamart
- Mobility/Logistics: Porter, Shiprocket, Delhivery, ElasticRun, Loadshare
- YC India batch companies

Return a JSON array of 14-18 jobs. Each object must have ALL these fields:
{
  "title": "Exact job title",
  "company": "Company name",
  "sector": "Fintech / SaaS / Edtech / etc",
  "stage": "Seed / Pre-Series A / Series A / Series B / Series C / Series D / Unicorn",
  "location": "Remote / Bengaluru / Mumbai / Delhi NCR / Hyderabad / Pan-India",
  "summary": "2 punchy sentences: what the role does + why it's a ₹1Cr career accelerator",
  "why_now": "1 sentence on why THIS startup is hiring now (funding, expansion, new product)",
  "tags": ["skill1", "skill2", "skill3", "skill4"],
  "salary": "₹XL–YL or null if unknown",
  "has_esop": true or false,
  "is_new": true or false,
  "is_hot": true or false,
  "posted": "This week / This month / Recently",
  "source": "Company careers / Wellfound / YC Jobs / LinkedIn",
  "url": "https://... direct URL to careers page or job post, or null",
  "role_category": "pm" or "growth" or "sales" or "strategy",
  "cold_reach": "Name of founder or hiring manager to cold DM on LinkedIn if known, else null"
}

Make sure roles are spread: at least 3 per category. Mix startup stages. Be specific and realistic.
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured in environment variables" });

  const { roles = ["Product Manager", "Growth", "Sales", "Strategy"], stage = "All stages" } = req.body;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: SYSTEM,
        messages: [{ role: "user", content: buildPrompt(roles, stage) }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: `Anthropic API error: ${err}` });
    }

    const data = await response.json();
    const text = (data.content || []).map((b: { type: string; text?: string }) => b.type === "text" ? b.text : "").join("");

    let jobs = [];
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start !== -1 && end !== -1) {
      jobs = JSON.parse(text.slice(start, end + 1));
    } else {
      throw new Error("No JSON array found in response");
    }

    return res.status(200).json({ jobs, refreshed: new Date().toISOString() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
}
