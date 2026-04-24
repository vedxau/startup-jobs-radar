import type { NextApiRequest, NextApiResponse } from "next";

export const config = { api: { bodyParser: true } };

/* ─── VERIFIED CAREER PAGE URLs FOR 50+ INDIAN STARTUPS ─── */
const STARTUP_CAREERS: Record<string, string> = {
  // Fintech
  "Razorpay": "https://razorpay.com/careers/",
  "Groww": "https://groww.in/careers",
  "CRED": "https://careers.cred.club/",
  "Slice": "https://www.sliceit.com/careers",
  "Jupiter": "https://jupiter.money/careers/",
  "Fi Money": "https://fi.money/careers",
  "Smallcase": "https://smallcase.freshteam.com/jobs",
  "Zerodha": "https://zerodha.com/careers/",
  "Juspay": "https://juspay.in/careers",
  "Cashfree": "https://www.cashfree.com/careers/",
  "Open": "https://open.money/careers",
  "Paytm": "https://paytm.com/careers/",
  "PhonePe": "https://www.phonepe.com/careers/",
  "Pine Labs": "https://www.pinelabs.com/careers",
  "Niyo": "https://www.goniyo.com/careers/",

  // SaaS/B2B
  "Freshworks": "https://www.freshworks.com/company/careers/",
  "BrowserStack": "https://www.browserstack.com/careers",
  "Postman": "https://www.postman.com/company/careers/",
  "Chargebee": "https://www.chargebee.com/careers/",
  "LeadSquared": "https://www.leadsquared.com/careers/",
  "Whatfix": "https://whatfix.com/careers/",
  "Zoho": "https://www.zoho.com/careers.html",
  "Darwinbox": "https://darwinbox.com/careers",
  "WebEngage": "https://webengage.com/careers/",
  "MoEngage": "https://www.moengage.com/careers/",
  "CleverTap": "https://www.clevertap.com/careers/",
  "Toplyne": "https://www.toplyne.io/careers",
  "Haptik": "https://www.haptik.ai/careers",
  "Hasura": "https://hasura.io/careers/",

  // Edtech
  "PhysicsWallah": "https://www.physicswallah.com/careers",
  "upGrad": "https://www.upgrad.com/careers/",
  "Unacademy": "https://unacademy.com/careers",
  "Unstop": "https://unstop.com/careers",
  "Classplus": "https://classplus.co/careers",
  "Teachmint": "https://www.teachmint.com/careers",
  "Scaler": "https://www.scaler.com/careers/",
  "Masai School": "https://www.masaischool.com/careers",

  // Healthtech
  "Pristyn Care": "https://www.pristyncare.com/careers.php",
  "Innovaccer": "https://innovaccer.com/careers",
  "Eka Care": "https://www.eka.care/careers",
  "Healthplix": "https://www.healthplix.com/careers",
  "Practo": "https://www.practo.com/company/careers",

  // Commerce/D2C
  "Meesho": "https://meesho.io/careers",
  "Licious": "https://www.licious.in/careers",
  "Country Delight": "https://countrydelight.in/careers",
  "Ninjacart": "https://www.ninjacart.com/careers",
  "Zetwerk": "https://www.zetwerk.com/careers/",
  "Moglix": "https://www.moglix.com/careers",
  "Udaan": "https://udaan.com/careers",
  "Dukaan": "https://mydukaan.io/careers",

  // Deeptech/AI
  "Sarvam AI": "https://www.sarvam.ai/careers",
  "Krutrim": "https://olacabs.com/careers",
  "Yellow.ai": "https://yellow.ai/careers/",
  "Observe.AI": "https://www.observe.ai/careers",
  "Uniphore": "https://www.uniphore.com/careers/",

  // Quick Commerce
  "Zepto": "https://www.zeptonow.com/careers",
  "Blinkit": "https://blinkit.com/careers",
  "Swiggy": "https://careers.swiggy.com/",
  "Zomato": "https://www.zomato.com/careers",

  // Mobility/Logistics
  "Porter": "https://porter.in/careers",
  "Shiprocket": "https://www.shiprocket.in/careers/",
  "Delhivery": "https://www.delhivery.com/careers/",
  "Rapido": "https://rapido.bike/careers",

  // Others
  "Curefit": "https://www.cult.fit/careers",
  "Urban Company": "https://www.urbancompany.com/careers",
  "ShareChat": "https://sharechat.com/careers",
  "Vedantu": "https://www.vedantu.com/careers",
  "Dream11": "https://www.dreamsports.group/careers/",
  "MPL": "https://www.mpl.live/careers",
  "BYJU'S": "https://byjus.com/careers/",
  "Ola": "https://olacabs.com/careers",
  "Myntra": "https://www.myntra.com/careers",
  "Flipkart": "https://www.flipkartcareers.com/",
  "Nykaa": "https://www.nykaa.com/careers",
};

/* ─── SYSTEM PROMPT ─── */
const SYSTEM = `You are an elite startup job research analyst specialising in the Indian and remote startup ecosystem.
You have deep knowledge of funded Indian startups, their hiring patterns, and the roles that lead to ₹1Cr+ salaries.

CRITICAL RULES:
1. Always return ONLY valid JSON. Your response must be a JSON object like: {"jobs": [...]}
2. The "jobs" array should contain job objects. Do NOT include any text outside the JSON.
3. For the "url" field, you MUST ONLY use the career page URL from the provided STARTUP_CAREERS mapping. NEVER invent or guess a job posting URL.
4. If you don't know the exact career page URL for a company, set "url" to null.
5. Base your listings on what these companies ACTUALLY hire for based on their known products, team structure, and recent funding rounds.
6. Be realistic — don't create fantasy roles. Stick to titles these companies genuinely post.
7. Ensure all string values are properly escaped. Do not use special characters that break JSON.`;

/* ─── BUILD PROMPT WITH CAREER URLs ─── */
const buildPrompt = (roles: string[], stage: string, careersJson: string, scrapedJobs: string) => `
Today is ${new Date().toDateString()}.

VERIFIED CAREER PAGE URLs (use ONLY these for the "url" field):
${careersJson}

${scrapedJobs ? `SCRAPED REAL JOB DATA (reference only):
${scrapedJobs}
` : ""}
Research active startup job openings for:
Roles: ${roles.join(", ")}
Stage: ${stage}
Location: India or Remote

Sectors: Fintech, SaaS, Edtech, Healthtech, Commerce, AI, Quick Commerce, Logistics

Return {"jobs": [...]} with 12 job objects. Each job object has these flat fields:
- "title": string (realistic job title)
- "company": string (from known Indian startups)
- "sector": string
- "stage": string (Seed/Series A/Series B/Series C/Unicorn)
- "location": string
- "summary": string (2 sentences max)
- "why_now": string (1 sentence)
- "tags": ["skill1","skill2","skill3"]
- "salary": string or null (e.g. "18L-35L")
- "has_esop": boolean
- "is_new": boolean
- "is_hot": boolean
- "posted": string ("This week"/"This month"/"Recently")
- "source": string
- "url": string or null (ONLY from the verified URLs above)
- "role_category": "pm" or "growth" or "sales" or "strategy"
- "cold_reach": string or null (real founder name)

Rules: spread roles evenly across pm/growth/sales/strategy. Use only simple ASCII in strings. No nested objects.
`;


/* ─── SCRAPE FREE JOB APIS ─── */
async function scrapeRemotive(): Promise<string> {
  try {
    const res = await fetch("https://remotive.com/api/remote-jobs?category=marketing&limit=10", {
      headers: { "User-Agent": "StartupJobRadar/1.0" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return "";
    const data = await res.json();
    const jobs = (data.jobs || [])
      .filter((j: any) =>
        j.title?.toLowerCase().match(/product|growth|marketing|sales|strateg|business/)
      )
      .slice(0, 8)
      .map((j: any) => ({
        title: j.title,
        company: j.company_name,
        url: j.url,
        location: j.candidate_required_location || "Remote",
        tags: j.tags || [],
        salary: j.salary || null,
        posted: j.publication_date,
      }));
    return jobs.length > 0 ? JSON.stringify(jobs) : "";
  } catch {
    return "";
  }
}

async function scrapeHimalayas(): Promise<string> {
  try {
    const res = await fetch("https://himalayas.app/jobs/api?limit=15", {
      headers: { "User-Agent": "StartupJobRadar/1.0" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return "";
    const data = await res.json();
    const jobs = (data.jobs || [])
      .filter((j: any) => {
        const title = (j.title || "").toLowerCase();
        return title.match(/product|growth|marketing|sales|strateg|business|revenue|partner/);
      })
      .slice(0, 8)
      .map((j: any) => ({
        title: j.title,
        company: j.companyName,
        url: j.applicationUrl || j.url,
        location: j.locationRestrictions?.join(", ") || "Remote",
        salary: j.minSalary && j.maxSalary ? `$${j.minSalary / 1000}k-$${j.maxSalary / 1000}k` : null,
        posted: j.pubDate,
      }));
    return jobs.length > 0 ? JSON.stringify(jobs) : "";
  } catch {
    return "";
  }
}

async function scrapeJobicy(): Promise<string> {
  try {
    const res = await fetch("https://jobicy.com/api/v2/remote-jobs?count=15&tag=marketing,sales,product", {
      headers: { "User-Agent": "StartupJobRadar/1.0" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return "";
    const data = await res.json();
    const jobs = (data.jobs || [])
      .filter((j: any) => {
        const title = (j.jobTitle || "").toLowerCase();
        return title.match(/product|growth|marketing|sales|strateg|business/);
      })
      .slice(0, 6)
      .map((j: any) => ({
        title: j.jobTitle,
        company: j.companyName,
        url: j.url,
        location: j.jobGeo || "Remote",
        salary: j.annualSalaryMin && j.annualSalaryMax ? `${j.annualSalaryMin}-${j.annualSalaryMax}` : null,
        posted: j.pubDate,
      }));
    return jobs.length > 0 ? JSON.stringify(jobs) : "";
  } catch {
    return "";
  }
}

/* ─── POST-PROCESS: FIX URLs ─── */
function fixJobUrls(jobs: any[]): any[] {
  return jobs.map((job) => {
    const company = job.company || "";
    const title = job.title || "";

    // If url is null/empty, use career page from our verified map
    if (!job.url || job.url === "null") {
      // Try exact match first
      job.url = STARTUP_CAREERS[company] || null;

      // Try partial match
      if (!job.url) {
        for (const [name, url] of Object.entries(STARTUP_CAREERS)) {
          if (company.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(company.toLowerCase())) {
            job.url = url;
            break;
          }
        }
      }
    }

    // Build search URLs (always valid)
    const encodedQuery = encodeURIComponent(`${title} ${company}`);
    const encodedTitle = encodeURIComponent(title);
    job.search_urls = {
      linkedin: `https://www.linkedin.com/jobs/search/?keywords=${encodedQuery}&location=India`,
      wellfound: `https://wellfound.com/jobs?q=${encodedQuery}`,
      naukri: `https://www.naukri.com/${encodedTitle.replace(/%20/g, "-").toLowerCase()}-jobs`,
      instahyre: `https://www.instahyre.com/search-jobs/?designation=${encodedTitle}`,
    };

    return job;
  });
}

/* ─── ROBUST JSON PARSER ─── */
function sanitizeAndParseJSON(raw: string): any[] {
  // Extract the JSON array portion
  let text = raw;
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1) throw new Error("No JSON array found in response");
  text = text.slice(start, end + 1);

  // Fix common LLM JSON errors
  text = text
    // Remove trailing commas before } or ]
    .replace(/,\s*([\]}])/g, "$1")
    // Fix Python-style True/False/None
    .replace(/:\s*True\b/g, ": true")
    .replace(/:\s*False\b/g, ": false")
    .replace(/:\s*None\b/g, ": null")
    // Fix single quotes to double quotes (but not inside strings)
    .replace(/'/g, '"')
    // Remove control characters
    .replace(/[\x00-\x1F\x7F]/g, (ch) => (ch === "\n" || ch === "\r" || ch === "\t" ? " " : ""))
    // Fix unescaped quotes inside strings: \"text "inner" text\" → \"text 'inner' text\"
    ;

  // Attempt 1: Direct parse
  try {
    return JSON.parse(text);
  } catch {
    // Attempt 2: Try to salvage by extracting individual objects
    const objects: any[] = [];
    const regex = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      try {
        const obj = JSON.parse(match[0]
          .replace(/,\s*([\]}])/g, "$1")
          .replace(/:\s*True\b/g, ": true")
          .replace(/:\s*False\b/g, ": false")
          .replace(/:\s*None\b/g, ": null")
        );
        if (obj.title && obj.company) {
          objects.push(obj);
        }
      } catch {
        // Skip malformed objects
      }
    }
    if (objects.length > 0) return objects;
    throw new Error("Failed to parse AI response as JSON. Please try again.");
  }
}

/* ─── MAIN HANDLER ─── */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GROQ_API_KEY not configured in environment variables" });

  const { roles = ["Product Manager", "Growth", "Sales", "Strategy"], stage = "All stages" } = req.body;

  try {
    // 1. Scrape real job data from free APIs in parallel
    const [remotiveData, himalayasData, jobicyData] = await Promise.allSettled([
      scrapeRemotive(),
      scrapeHimalayas(),
      scrapeJobicy(),
    ]);

    const scrapedJobs = [
      remotiveData.status === "fulfilled" ? remotiveData.value : "",
      himalayasData.status === "fulfilled" ? himalayasData.value : "",
      jobicyData.status === "fulfilled" ? jobicyData.value : "",
    ].filter(Boolean).join("\n");

    // 2. Prepare career URLs for LLM
    const careersJson = JSON.stringify(STARTUP_CAREERS, null, 2);

    // 3. Call Groq LLM with real data + career URLs
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: buildPrompt(roles, stage, careersJson, scrapedJobs) },
        ],
        temperature: 0.3,
        max_tokens: 6000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: `Groq API error: ${err}` });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "[]";

    // 4. Robust JSON parsing with error recovery
    let jobs: any[];
    try {
      const parsed = sanitizeAndParseJSON(text);
      // Handle if LLM wrapped array in an object like { "jobs": [...] }
      if (!Array.isArray(parsed) && typeof parsed === "object" && parsed !== null) {
        const possibleArray = Object.values(parsed).find(v => Array.isArray(v));
        jobs = possibleArray ? (possibleArray as any[]) : [parsed];
      } else if (Array.isArray(parsed)) {
        jobs = parsed;
      } else {
        jobs = [];
      }
    } catch (parseErr) {
      console.error("JSON parse failed, retrying with simpler prompt...", parseErr);
      // Retry with a much simpler prompt
      const retryRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "Return valid JSON only. No explanation." },
            { role: "user", content: `Return a JSON object {"jobs":[...]} with 8 Indian startup job listings. Each job: {"title":"...","company":"...","sector":"...","stage":"...","location":"...","summary":"...","why_now":"...","tags":["a","b","c"],"salary":null,"has_esop":false,"is_new":true,"is_hot":false,"posted":"This week","source":"LinkedIn","url":null,"role_category":"pm","cold_reach":null}. Mix roles: pm, growth, sales, strategy. Companies: Razorpay, CRED, Zepto, Meesho, Freshworks, Groww, Swiggy, Porter.` },
          ],
          temperature: 0.2,
          max_tokens: 4000,
        }),
      });
      if (!retryRes.ok) throw new Error("Retry also failed");
      const retryData = await retryRes.json();
      const retryText = retryData.choices?.[0]?.message?.content || "[]";
      const retryParsed = sanitizeAndParseJSON(retryText);
      if (!Array.isArray(retryParsed) && typeof retryParsed === "object" && retryParsed !== null) {
        const arr = Object.values(retryParsed).find(v => Array.isArray(v));
        jobs = arr ? (arr as any[]) : [];
      } else {
        jobs = Array.isArray(retryParsed) ? retryParsed : [];
      }
    }

    // 5. Post-process: fix/validate all URLs
    jobs = fixJobUrls(jobs);

    return res.status(200).json({ jobs, refreshed: new Date().toISOString(), sourceCount: scrapedJobs ? 3 : 0 });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
}
