import { useState, useCallback } from "react";
import Head from "next/head";

type Job = {
  title: string;
  company: string;
  sector: string;
  stage: string;
  location: string;
  summary: string;
  why_now: string;
  tags: string[];
  salary: string | null;
  has_esop: boolean;
  is_new: boolean;
  is_hot: boolean;
  posted: string;
  source: string;
  url: string | null;
  role_category: "pm" | "growth" | "sales" | "strategy";
  cold_reach: string | null;
};

const ROLE_FILTERS = [
  { key: "all", label: "All roles" },
  { key: "pm", label: "Product Manager" },
  { key: "growth", label: "Growth / Marketing" },
  { key: "sales", label: "Sales / BizDev" },
  { key: "strategy", label: "Strategy / Bizops" },
] as const;

const STAGE_FILTERS = [
  { key: "All stages", label: "All stages" },
  { key: "Seed / Pre-Series A", label: "Early (Seed)" },
  { key: "Series A / Series B", label: "Growth (A/B)" },
  { key: "Series C+ / Unicorn", label: "Late (C+)" },
];

const ROLE_COLORS: Record<string, string> = {
  pm: "#7F77DD",
  growth: "#1D9E75",
  sales: "#BA7517",
  strategy: "#D85A30",
};

const ROLE_BG: Record<string, string> = {
  pm: "#EEEDFE",
  growth: "#E1F5EE",
  sales: "#FAEEDA",
  strategy: "#FAECE7",
};

const ROLE_LABELS: Record<string, string> = {
  pm: "PM",
  growth: "Growth",
  sales: "Sales",
  strategy: "Strategy",
};

const STAGE_STYLE: Record<string, { bg: string; color: string }> = {
  Seed: { bg: "#FAEEDA", color: "#633806" },
  "Pre-Series A": { bg: "#FAEEDA", color: "#633806" },
  "Series A": { bg: "#E1F5EE", color: "#085041" },
  "Series B": { bg: "#EEEDFE", color: "#3C3489" },
  "Series C": { bg: "#E6F1FB", color: "#0C447C" },
  "Series D": { bg: "#E6F1FB", color: "#0C447C" },
  Unicorn: { bg: "#FCEBEB", color: "#791F1F" },
};

function stageStyle(stage: string) {
  for (const [k, v] of Object.entries(STAGE_STYLE)) {
    if (stage?.includes(k)) return v;
  }
  return { bg: "#F1EFE8", color: "#444441" };
}

function JobCard({ job }: { job: Job }) {
  const [expanded, setExpanded] = useState(false);
  const ss = stageStyle(job.stage);

  return (
    <div className="job-card" onClick={() => setExpanded((e) => !e)}>
      <div className="job-card-header">
        <div className="job-left">
          <span
            className="role-dot"
            style={{ background: ROLE_COLORS[job.role_category] }}
          />
          <div>
            <div className="job-title">{job.title}</div>
            <div className="job-company">
              {job.company}
              <span className="sep">·</span>
              {job.sector}
              <span className="sep">·</span>
              {job.location}
            </div>
          </div>
        </div>
        <div className="job-right-badges">
          <span
            className="badge"
            style={{
              background: ROLE_BG[job.role_category],
              color: ROLE_COLORS[job.role_category],
            }}
          >
            {ROLE_LABELS[job.role_category]}
          </span>
          <span className="badge" style={{ background: ss.bg, color: ss.color }}>
            {job.stage}
          </span>
          {job.is_new && <span className="badge badge-new">New</span>}
          {job.is_hot && <span className="badge badge-hot">Hot</span>}
        </div>
      </div>

      <p className="job-summary">{job.summary}</p>

      <div className="job-tags">
        {job.tags?.map((t) => (
          <span key={t} className="tag">
            {t}
          </span>
        ))}
        {job.has_esop && <span className="tag tag-esop">ESOPs</span>}
        {job.salary && <span className="tag tag-salary">{job.salary}</span>}
      </div>

      {expanded && (
        <div className="job-expanded">
          <div className="why-now">
            <span className="why-label">Why now:</span> {job.why_now}
          </div>
          {job.cold_reach && (
            <div className="cold-reach">
              <span className="why-label">Cold DM:</span> Search &quot;{job.cold_reach}&quot; on LinkedIn and send a proof-of-work message
            </div>
          )}
        </div>
      )}

      <div className="job-footer" onClick={(e) => e.stopPropagation()}>
        <span className="job-meta">
          {job.posted} · {job.source}
        </span>
        <div className="job-actions">
          {job.url ? (
            <a className="apply-btn" href={job.url} target="_blank" rel="noreferrer">
              Apply / View ↗
            </a>
          ) : (
            <a
              className="apply-btn"
              href={`https://wellfound.com/jobs?q=${encodeURIComponent(job.title + " " + job.company)}`}
              target="_blank"
              rel="noreferrer"
            >
              Search on Wellfound ↗
            </a>
          )}
          {job.cold_reach && (
            <a
              className="apply-btn apply-btn-ghost"
              href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(job.cold_reach)}`}
              target="_blank"
              rel="noreferrer"
            >
              Cold DM ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("All stages");
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const research = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roles: ["Product Manager / APM", "Growth / Marketing", "Sales / BizDev SaaS", "Strategy / Bizops / Chief of Staff"],
          stage: stageFilter,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Research failed");
      setJobs(data.jobs || []);
      setLastRefresh(new Date().toLocaleTimeString());
      setRefreshCount((c) => c + 1);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [stageFilter]);

  const filtered = jobs.filter((j) => {
    if (roleFilter !== "all" && j.role_category !== roleFilter) return false;
    return true;
  });

  const stats = {
    total: jobs.length,
    newCount: jobs.filter((j) => j.is_new).length,
    hot: jobs.filter((j) => j.is_hot).length,
    esop: jobs.filter((j) => j.has_esop).length,
  };

  return (
    <>
      <Head>
        <title>Startup Job Radar — ₹1Cr Career Engine</title>
        <meta name="description" content="AI-powered startup job research for PM, Growth, Sales and Strategy roles" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="page">
        <header className="header">
          <div className="header-inner">
            <div className="brand">
              <span className="brand-dot" />
              <div>
                <div className="brand-name">Startup Job Radar</div>
                <div className="brand-sub">AI research analyst · PM · Growth · Sales · Strategy</div>
              </div>
            </div>
            <div className="header-right">
              {lastRefresh && (
                <span className="refresh-time">Last scanned {lastRefresh} · Run #{refreshCount}</span>
              )}
              <button className="refresh-btn" onClick={research} disabled={loading}>
                {loading ? (
                  <span className="spinner" />
                ) : (
                  <span className="refresh-icon">⟳</span>
                )}
                {loading ? "Researching..." : "Research now"}
              </button>
            </div>
          </div>
        </header>

        <div className="main">
          <div className="filters-row">
            <div className="filter-group">
              <span className="filter-label">Role</span>
              {ROLE_FILTERS.map((f) => (
                <button
                  key={f.key}
                  className={`pill ${roleFilter === f.key ? "pill-active" : ""}`}
                  onClick={() => setRoleFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="filter-group">
              <span className="filter-label">Stage</span>
              {STAGE_FILTERS.map((f) => (
                <button
                  key={f.key}
                  className={`pill ${stageFilter === f.key ? "pill-active" : ""}`}
                  onClick={() => setStageFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {jobs.length > 0 && (
            <div className="stats-row">
              <div className="stat">
                <span className="stat-val">{stats.total}</span>
                <span className="stat-lab">jobs found</span>
              </div>
              <div className="stat">
                <span className="stat-val" style={{ color: "#534AB7" }}>{stats.newCount}</span>
                <span className="stat-lab">posted this week</span>
              </div>
              <div className="stat">
                <span className="stat-val" style={{ color: "#1D9E75" }}>{stats.hot}</span>
                <span className="stat-lab">high-growth</span>
              </div>
              <div className="stat">
                <span className="stat-val" style={{ color: "#D85A30" }}>{stats.esop}</span>
                <span className="stat-lab">with ESOPs</span>
              </div>
            </div>
          )}

          {error && (
            <div className="error-box">
              <strong>Research failed:</strong> {error}
              <br />
              <span style={{ fontSize: 12, opacity: 0.8 }}>
                Make sure GEMINI_API_KEY is properly set in your environment variables.
              </span>
            </div>
          )}

          {!loading && jobs.length === 0 && !error && (
            <div className="empty">
              <div className="empty-icon">◎</div>
              <div className="empty-title">Ready to scan</div>
              <div className="empty-sub">
                Hit &ldquo;Research now&rdquo; — your AI analyst will scan Wellfound, YC Jobs, Inc42, LinkedIn and 50+ startup career pages for fresh openings across PM, Growth, Sales and Strategy roles.
              </div>
              <button className="empty-btn" onClick={research}>
                Start researching ↗
              </button>
              <div className="quick-links">
                <span className="ql-label">Or browse manually:</span>
                {[
                  ["YC Jobs India", "https://www.ycombinator.com/jobs/location/india"],
                  ["Wellfound", "https://wellfound.com/jobs"],
                  ["Unstop", "https://unstop.com/jobs"],
                  ["LinkedIn Remote India", "https://www.linkedin.com/jobs/search/?f_WT=2&location=India"],
                  ["Inc42 Jobs", "https://inc42.com/tag/jobs/"],
                  ["Tracxn", "https://tracxn.com"],
                ].map(([name, url]) => (
                  <a key={name} href={url} target="_blank" rel="noreferrer" className="ql-link">
                    {name} ↗
                  </a>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="loading-state">
              <div className="loading-bar" />
              <div className="loading-text">
                Scanning Wellfound · YC Jobs · LinkedIn · Inc42 · Tracxn · Startup career pages...
              </div>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="jobs-list">
              {filtered.map((job, i) => (
                <JobCard key={`${job.company}-${job.title}-${i}`} job={job} />
              ))}
            </div>
          )}

          {!loading && jobs.length > 0 && filtered.length === 0 && (
            <div className="empty">
              <div className="empty-sub">No jobs match this filter. Try &ldquo;All roles&rdquo;.</div>
            </div>
          )}

          {jobs.length > 0 && (
            <div className="source-footer">
              <span className="ql-label">Quick apply sources:</span>
              {[
                ["YC Jobs India", "https://www.ycombinator.com/jobs/location/india"],
                ["Wellfound", "https://wellfound.com/jobs"],
                ["Unstop", "https://unstop.com/jobs"],
                ["LinkedIn Remote", "https://www.linkedin.com/jobs/search/?f_WT=2&location=India"],
                ["Tracxn", "https://tracxn.com"],
                ["Inc42", "https://inc42.com/tag/jobs/"],
              ].map(([name, url]) => (
                <a key={name} href={url} target="_blank" rel="noreferrer" className="ql-link">
                  {name} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { font-size: 15px; }
        body {
          font-family: 'Syne', sans-serif;
          background: #0a0a0a;
          color: #e8e6e0;
          min-height: 100vh;
          line-height: 1.6;
        }
        a { color: inherit; text-decoration: none; }
        button { font-family: inherit; cursor: pointer; border: none; background: none; }

        .page { min-height: 100vh; display: flex; flex-direction: column; }

        .header {
          border-bottom: 1px solid #1e1e1e;
          background: #0a0a0a;
          position: sticky; top: 0; z-index: 50;
        }
        .header-inner {
          max-width: 900px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 20px; gap: 12px; flex-wrap: wrap;
        }
        .brand { display: flex; align-items: center; gap: 12px; }
        .brand-dot {
          width: 10px; height: 10px; border-radius: 50%;
          background: #1D9E75; flex-shrink: 0;
          box-shadow: 0 0 8px #1D9E7580;
        }
        .brand-name { font-size: 16px; font-weight: 700; letter-spacing: -0.02em; color: #f0ede6; }
        .brand-sub { font-size: 11px; color: #555; font-family: 'DM Mono', monospace; margin-top: 1px; }
        .header-right { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .refresh-time { font-size: 11px; color: #444; font-family: 'DM Mono', monospace; }

        .refresh-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 18px;
          border: 1px solid #2a2a2a;
          border-radius: 8px;
          background: #111;
          color: #e8e6e0;
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 500;
          transition: all .15s;
          white-space: nowrap;
        }
        .refresh-btn:hover:not(:disabled) { background: #1a1a1a; border-color: #333; }
        .refresh-btn:disabled { opacity: .5; cursor: not-allowed; }
        .refresh-icon { font-size: 16px; line-height: 1; }
        .spinner {
          width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid #333; border-top-color: #1D9E75;
          animation: spin .8s linear infinite; flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .main { max-width: 900px; margin: 0 auto; padding: 24px 20px; flex: 1; }

        .filters-row { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
        .filter-group { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .filter-label {
          font-size: 11px; color: #444; font-family: 'DM Mono', monospace;
          min-width: 42px; flex-shrink: 0;
        }
        .pill {
          padding: 4px 12px;
          border: 1px solid #1e1e1e;
          border-radius: 20px;
          font-size: 12px; font-family: 'Syne', sans-serif;
          color: #555; background: transparent;
          transition: all .15s; white-space: nowrap;
        }
        .pill:hover { border-color: #333; color: #888; }
        .pill-active { border-color: #333; background: #161616; color: #e8e6e0; }

        .stats-row {
          display: flex; gap: 0; margin-bottom: 20px;
          border: 1px solid #1a1a1a; border-radius: 10px; overflow: hidden;
        }
        .stat {
          flex: 1; padding: 12px 16px; text-align: center;
          border-right: 1px solid #1a1a1a;
        }
        .stat:last-child { border-right: none; }
        .stat-val { display: block; font-size: 22px; font-weight: 700; color: #f0ede6; line-height: 1.2; }
        .stat-lab { font-size: 11px; color: #444; font-family: 'DM Mono', monospace; }

        .error-box {
          background: #1a0808; border: 1px solid #3a1111;
          border-radius: 10px; padding: 14px 18px;
          color: #f09595; font-size: 13px; margin-bottom: 20px; line-height: 1.6;
        }

        .empty {
          text-align: center; padding: 60px 20px;
          display: flex; flex-direction: column; align-items: center; gap: 16px;
        }
        .empty-icon { font-size: 32px; color: #333; }
        .empty-title { font-size: 18px; font-weight: 700; color: #f0ede6; }
        .empty-sub { font-size: 13px; color: #555; max-width: 520px; line-height: 1.7; }
        .empty-btn {
          padding: 10px 24px;
          border: 1px solid #1D9E75;
          border-radius: 8px;
          background: transparent;
          color: #1D9E75;
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 500;
          transition: all .15s;
        }
        .empty-btn:hover { background: #1D9E7515; }

        .quick-links { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
        .ql-label { font-size: 11px; color: #444; align-self: center; font-family: 'DM Mono', monospace; }
        .ql-link {
          font-size: 11px; color: #555; padding: 3px 10px;
          border: 1px solid #1e1e1e; border-radius: 6px;
          transition: all .15s;
        }
        .ql-link:hover { color: #888; border-color: #2a2a2a; }

        .loading-state { padding: 40px 0; text-align: center; }
        .loading-bar {
          height: 2px; background: #1a1a1a; border-radius: 2px;
          margin: 0 auto 20px; max-width: 400px; overflow: hidden; position: relative;
        }
        .loading-bar::after {
          content: ''; position: absolute; left: -100%; top: 0;
          width: 60%; height: 100%; background: #1D9E75;
          animation: slide 1.4s ease-in-out infinite;
        }
        @keyframes slide { to { left: 200%; } }
        .loading-text { font-size: 12px; color: #444; font-family: 'DM Mono', monospace; }

        .jobs-list { display: flex; flex-direction: column; gap: 10px; }

        .job-card {
          background: #0f0f0f;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          padding: 16px 18px;
          cursor: pointer;
          transition: border-color .15s;
        }
        .job-card:hover { border-color: #2a2a2a; }

        .job-card-header {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 12px; margin-bottom: 8px;
        }
        .job-left { display: flex; align-items: flex-start; gap: 10px; }
        .role-dot {
          width: 8px; height: 8px; border-radius: 50%;
          flex-shrink: 0; margin-top: 5px;
        }
        .job-title { font-size: 14px; font-weight: 600; color: #f0ede6; line-height: 1.3; }
        .job-company { font-size: 12px; color: #555; margin-top: 2px; }
        .sep { margin: 0 5px; }

        .job-right-badges { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
        .badge {
          font-size: 10px; padding: 2px 8px; border-radius: 10px;
          font-weight: 600; font-family: 'DM Mono', monospace;
          white-space: nowrap;
        }
        .badge-new { background: #EEEDFE; color: #3C3489; }
        .badge-hot { background: #E1F5EE; color: #085041; }

        .job-summary { font-size: 12px; color: #666; line-height: 1.65; margin-bottom: 10px; }

        .job-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
        .tag {
          font-size: 11px; padding: 2px 8px; border-radius: 8px;
          border: 1px solid #1e1e1e; color: #555;
          font-family: 'DM Mono', monospace;
        }
        .tag-esop { border-color: #1D9E7540; color: #1D9E75; }
        .tag-salary { border-color: #534AB740; color: #7F77DD; }

        .job-expanded {
          background: #0a0a0a; border-radius: 8px; padding: 10px 12px;
          margin-bottom: 10px; display: flex; flex-direction: column; gap: 6px;
        }
        .why-now, .cold-reach { font-size: 12px; color: #666; line-height: 1.6; }
        .why-label { color: #888; font-weight: 500; margin-right: 4px; }

        .job-footer {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 8px; padding-top: 8px;
          border-top: 1px solid #141414;
        }
        .job-meta { font-size: 11px; color: #3a3a3a; font-family: 'DM Mono', monospace; }
        .job-actions { display: flex; gap: 6px; }
        .apply-btn {
          font-size: 12px; padding: 5px 14px;
          border: 1px solid #1e1e1e; border-radius: 7px;
          color: #888; background: transparent;
          font-family: 'Syne', sans-serif;
          transition: all .15s; display: inline-block;
          cursor: pointer;
        }
        .apply-btn:hover { border-color: #333; color: #bbb; }
        .apply-btn-ghost { color: #534AB7; border-color: #534AB740; }
        .apply-btn-ghost:hover { background: #534AB710; }

        .source-footer {
          display: flex; flex-wrap: wrap; gap: 6px;
          padding: 20px 0 10px;
          border-top: 1px solid #141414;
          margin-top: 16px;
          align-items: center;
        }

        @media (max-width: 600px) {
          .header-inner { flex-direction: column; align-items: flex-start; }
          .job-card-header { flex-direction: column; }
          .job-right-badges { flex-direction: row; }
          .stats-row { flex-wrap: wrap; }
          .stat { min-width: 45%; border-bottom: 1px solid #1a1a1a; }
        }
      `}</style>
    </>
  );
}
