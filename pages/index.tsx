import { useState, useCallback, useEffect, useRef } from "react";
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
  { key: "all", label: "All Roles", icon: "◉" },
  { key: "pm", label: "Product", icon: "▦" },
  { key: "growth", label: "Growth", icon: "△" },
  { key: "sales", label: "Sales", icon: "◈" },
  { key: "strategy", label: "Strategy", icon: "◇" },
] as const;

const STAGE_FILTERS = [
  { key: "All stages", label: "All Stages" },
  { key: "Seed / Pre-Series A", label: "Seed / Pre-A" },
  { key: "Series A / Series B", label: "Series A–B" },
  { key: "Series C+ / Unicorn", label: "Series C+ / Unicorn" },
];

const ROLE_COLORS: Record<string, { primary: string; bg: string; glow: string }> = {
  pm: { primary: "#A78BFA", bg: "rgba(167,139,250,0.08)", glow: "rgba(167,139,250,0.25)" },
  growth: { primary: "#34D399", bg: "rgba(52,211,153,0.08)", glow: "rgba(52,211,153,0.25)" },
  sales: { primary: "#FBBF24", bg: "rgba(251,191,36,0.08)", glow: "rgba(251,191,36,0.25)" },
  strategy: { primary: "#F87171", bg: "rgba(248,113,113,0.08)", glow: "rgba(248,113,113,0.25)" },
};

const ROLE_LABELS: Record<string, string> = {
  pm: "Product",
  growth: "Growth",
  sales: "Sales",
  strategy: "Strategy",
};

const STAGE_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  Seed: { bg: "rgba(251,191,36,0.1)", color: "#FBBF24", border: "rgba(251,191,36,0.2)" },
  "Pre-Series A": { bg: "rgba(251,191,36,0.1)", color: "#FBBF24", border: "rgba(251,191,36,0.2)" },
  "Series A": { bg: "rgba(52,211,153,0.1)", color: "#34D399", border: "rgba(52,211,153,0.2)" },
  "Series B": { bg: "rgba(167,139,250,0.1)", color: "#A78BFA", border: "rgba(167,139,250,0.2)" },
  "Series C": { bg: "rgba(96,165,250,0.1)", color: "#60A5FA", border: "rgba(96,165,250,0.2)" },
  "Series D": { bg: "rgba(96,165,250,0.1)", color: "#60A5FA", border: "rgba(96,165,250,0.2)" },
  Unicorn: { bg: "rgba(244,114,182,0.1)", color: "#F472B6", border: "rgba(244,114,182,0.2)" },
};

function stageStyle(stage: string) {
  for (const [k, v] of Object.entries(STAGE_STYLE)) {
    if (stage?.includes(k)) return v;
  }
  return { bg: "rgba(255,255,255,0.05)", color: "#888", border: "rgba(255,255,255,0.1)" };
}

function JobCard({ job, index }: { job: Job; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const ss = stageStyle(job.stage);
  const rc = ROLE_COLORS[job.role_category] || ROLE_COLORS.pm;

  return (
    <div
      className="job-card"
      onClick={() => setExpanded((e) => !e)}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Accent glow line */}
      <div className="card-accent" style={{ background: `linear-gradient(90deg, ${rc.primary}, transparent)` }} />

      <div className="job-card-header">
        <div className="job-left">
          <div className="role-indicator" style={{ background: rc.bg, borderColor: rc.primary }}>
            <span style={{ color: rc.primary, fontSize: 11, fontWeight: 700 }}>
              {ROLE_LABELS[job.role_category]?.charAt(0)}
            </span>
          </div>
          <div>
            <div className="job-title">
              {job.title}
              {job.is_hot && <span className="fire-icon">🔥</span>}
              {job.is_new && <span className="new-pulse" />}
            </div>
            <div className="job-company">
              <span className="company-name">{job.company}</span>
              <span className="meta-divider" />
              <span>{job.sector}</span>
              <span className="meta-divider" />
              <span>{job.location}</span>
            </div>
          </div>
        </div>
        <div className="job-right-badges">
          <span className="badge badge-role" style={{ background: rc.bg, color: rc.primary, borderColor: `${rc.primary}33` }}>
            {ROLE_LABELS[job.role_category]}
          </span>
          <span className="badge badge-stage" style={{ background: ss.bg, color: ss.color, borderColor: ss.border }}>
            {job.stage}
          </span>
        </div>
      </div>

      <p className="job-summary">{job.summary}</p>

      <div className="job-tags">
        {job.tags?.map((t) => (
          <span key={t} className="tag">{t}</span>
        ))}
        {job.has_esop && <span className="tag tag-esop">⬡ ESOPs</span>}
        {job.salary && <span className="tag tag-salary">💰 {job.salary}</span>}
      </div>

      {expanded && (
        <div className="job-expanded">
          <div className="expand-item">
            <span className="expand-label">⚡ Why now</span>
            <span className="expand-text">{job.why_now}</span>
          </div>
          {job.cold_reach && (
            <div className="expand-item">
              <span className="expand-label">🎯 Cold DM</span>
              <span className="expand-text">
                Search &quot;{job.cold_reach}&quot; on LinkedIn — send a proof-of-work message
              </span>
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
            <a className="action-btn action-primary" href={job.url} target="_blank" rel="noreferrer">
              Apply ↗
            </a>
          ) : (
            <a
              className="action-btn action-primary"
              href={`https://wellfound.com/jobs?q=${encodeURIComponent(job.title + " " + job.company)}`}
              target="_blank"
              rel="noreferrer"
            >
              Wellfound ↗
            </a>
          )}
          {job.cold_reach && (
            <a
              className="action-btn action-ghost"
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

function ParticleField() {
  return (
    <div className="particle-field">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${6 + Math.random() * 8}s`,
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
            opacity: 0.15 + Math.random() * 0.25,
          }}
        />
      ))}
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
  const [searchQuery, setSearchQuery] = useState("");

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
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.sector.toLowerCase().includes(q) ||
        j.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
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
        <meta name="description" content="AI-powered startup job research for PM, Growth, Sales and Strategy roles in India's top-funded startups" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="app">
        <ParticleField />

        {/* ─── HEADER ─── */}
        <header className="header">
          <div className="header-inner">
            <div className="brand">
              <div className="logo-mark">
                <div className="logo-ring" />
                <div className="logo-core" />
              </div>
              <div>
                <h1 className="brand-name">Startup Job Radar</h1>
                <p className="brand-tagline">AI research analyst · PM · Growth · Sales · Strategy</p>
              </div>
            </div>
            <div className="header-right">
              {lastRefresh && (
                <div className="scan-info">
                  <span className="scan-dot" />
                  <span>Scanned {lastRefresh} · Run #{refreshCount}</span>
                </div>
              )}
              <button
                id="research-btn"
                className="cta-btn"
                onClick={research}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner" />
                    <span>Researching…</span>
                  </>
                ) : (
                  <>
                    <span className="btn-icon">⟳</span>
                    <span>Research Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* ─── MAIN ─── */}
        <main className="main">
          {/* Filters */}
          <div className="controls">
            <div className="filter-section">
              <span className="filter-title">Role</span>
              <div className="filter-pills">
                {ROLE_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    id={`filter-role-${f.key}`}
                    className={`pill ${roleFilter === f.key ? "pill-active" : ""}`}
                    onClick={() => setRoleFilter(f.key)}
                  >
                    <span className="pill-icon">{f.icon}</span>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-section">
              <span className="filter-title">Stage</span>
              <div className="filter-pills">
                {STAGE_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    id={`filter-stage-${f.key.replace(/\s/g, "-")}`}
                    className={`pill ${stageFilter === f.key ? "pill-active" : ""}`}
                    onClick={() => setStageFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            {jobs.length > 0 && (
              <div className="search-box">
                <span className="search-icon">⌕</span>
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search jobs, companies, skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Stats */}
          {jobs.length > 0 && (
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-number">{stats.total}</span>
                <span className="stat-label">Jobs Found</span>
              </div>
              <div className="stat-card">
                <span className="stat-number" style={{ color: "#A78BFA" }}>{stats.newCount}</span>
                <span className="stat-label">This Week</span>
              </div>
              <div className="stat-card">
                <span className="stat-number" style={{ color: "#34D399" }}>{stats.hot}</span>
                <span className="stat-label">High Growth</span>
              </div>
              <div className="stat-card">
                <span className="stat-number" style={{ color: "#FBBF24" }}>{stats.esop}</span>
                <span className="stat-label">With ESOPs</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="error-box" id="error-message">
              <div className="error-icon">⚠</div>
              <div>
                <strong>Research failed</strong>
                <p>{error}</p>
                <span className="error-hint">
                  Make sure GEMINI_API_KEY is properly set in your environment variables.
                </span>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && jobs.length === 0 && !error && (
            <div className="hero-empty">
              <div className="hero-orb" />
              <div className="hero-content">
                <div className="hero-badge">AI-Powered Job Research</div>
                <h2 className="hero-title">
                  Find Your Next<br />
                  <span className="gradient-text">₹1Cr+ Startup Role</span>
                </h2>
                <p className="hero-desc">
                  Your AI analyst will scan Wellfound, YC Jobs, Inc42, LinkedIn and 50+
                  startup career pages for fresh openings across PM, Growth, Sales and
                  Strategy roles.
                </p>
                <button id="start-research-btn" className="hero-cta" onClick={research}>
                  <span className="hero-cta-glow" />
                  Start Researching
                  <span className="hero-cta-arrow">→</span>
                </button>
                <div className="browse-links">
                  <span className="browse-label">Or browse manually:</span>
                  {[
                    ["YC Jobs India", "https://www.ycombinator.com/jobs/location/india"],
                    ["Wellfound", "https://wellfound.com/jobs"],
                    ["Unstop", "https://unstop.com/jobs"],
                    ["LinkedIn Remote India", "https://www.linkedin.com/jobs/search/?f_WT=2&location=India"],
                    ["Inc42 Jobs", "https://inc42.com/tag/jobs/"],
                    ["Tracxn", "https://tracxn.com"],
                  ].map(([name, url]) => (
                    <a key={name} href={url} target="_blank" rel="noreferrer" className="browse-link">
                      {name} ↗
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="loading-orb">
                <div className="loading-ring ring-1" />
                <div className="loading-ring ring-2" />
                <div className="loading-ring ring-3" />
                <div className="loading-core" />
              </div>
              <div className="loading-text">
                Scanning Wellfound · YC Jobs · LinkedIn · Inc42 · Tracxn · 50+ career pages
              </div>
              <div className="loading-bar">
                <div className="loading-bar-fill" />
              </div>
            </div>
          )}

          {/* Job List */}
          {filtered.length > 0 && (
            <div className="jobs-list">
              {filtered.map((job, i) => (
                <JobCard key={`${job.company}-${job.title}-${i}`} job={job} index={i} />
              ))}
            </div>
          )}

          {/* No Filter Match */}
          {!loading && jobs.length > 0 && filtered.length === 0 && (
            <div className="no-match">
              <p>No jobs match your current filters. Try &ldquo;All Roles&rdquo; or clear your search.</p>
            </div>
          )}

          {/* Source Footer */}
          {jobs.length > 0 && (
            <div className="source-footer">
              <span className="browse-label">Quick apply:</span>
              {[
                ["YC Jobs India", "https://www.ycombinator.com/jobs/location/india"],
                ["Wellfound", "https://wellfound.com/jobs"],
                ["Unstop", "https://unstop.com/jobs"],
                ["LinkedIn Remote", "https://www.linkedin.com/jobs/search/?f_WT=2&location=India"],
                ["Tracxn", "https://tracxn.com"],
                ["Inc42", "https://inc42.com/tag/jobs/"],
              ].map(([name, url]) => (
                <a key={name} href={url} target="_blank" rel="noreferrer" className="browse-link">
                  {name} ↗
                </a>
              ))}
            </div>
          )}
        </main>
      </div>

      <style jsx global>{`
        /* ─── RESET & BASE ─── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { font-size: 15px; scroll-behavior: smooth; }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #050505;
          color: #E2E8F0;
          min-height: 100vh;
          line-height: 1.6;
          overflow-x: hidden;
        }
        a { color: inherit; text-decoration: none; }
        button { font-family: inherit; cursor: pointer; border: none; background: none; }

        /* ─── PARTICLE FIELD ─── */
        .particle-field {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          pointer-events: none; z-index: 0; overflow: hidden;
        }
        .particle {
          position: absolute; border-radius: 50%;
          background: #34D399;
          animation: particle-float linear infinite;
        }
        @keyframes particle-float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.4; }
          90% { opacity: 0.4; }
          50% { transform: translateY(-80px) translateX(30px); }
        }

        /* ─── APP SHELL ─── */
        .app { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; }

        /* ─── HEADER ─── */
        .header {
          position: sticky; top: 0; z-index: 50;
          background: rgba(5,5,5,0.85);
          backdrop-filter: blur(20px) saturate(1.8);
          -webkit-backdrop-filter: blur(20px) saturate(1.8);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .header-inner {
          max-width: 960px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 24px; gap: 16px; flex-wrap: wrap;
        }
        .brand { display: flex; align-items: center; gap: 14px; }

        /* Logo */
        .logo-mark {
          position: relative; width: 36px; height: 36px; flex-shrink: 0;
        }
        .logo-ring {
          position: absolute; inset: 0; border-radius: 50%;
          border: 2px solid transparent;
          background: conic-gradient(from 0deg, #34D399, #A78BFA, #F472B6, #FBBF24, #34D399) border-box;
          -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: logo-spin 6s linear infinite;
        }
        .logo-core {
          position: absolute; inset: 6px; border-radius: 50%;
          background: radial-gradient(circle, #34D399, #059669);
          box-shadow: 0 0 20px rgba(52,211,153,0.4);
        }
        @keyframes logo-spin { to { transform: rotate(360deg); } }

        .brand-name {
          font-size: 17px; font-weight: 800; letter-spacing: -0.03em;
          background: linear-gradient(135deg, #F0FDF4, #D1FAE5, #A78BFA);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .brand-tagline {
          font-size: 11px; color: rgba(255,255,255,0.25);
          font-family: 'JetBrains Mono', monospace; margin-top: 1px;
        }

        .header-right { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .scan-info {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; color: rgba(255,255,255,0.3);
          font-family: 'JetBrains Mono', monospace;
        }
        .scan-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #34D399; animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 0 0 rgba(52,211,153,0.4); }
          50% { box-shadow: 0 0 0 6px rgba(52,211,153,0); }
        }

        /* CTA Button */
        .cta-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 22px; border-radius: 12px;
          background: linear-gradient(135deg, rgba(52,211,153,0.15), rgba(167,139,250,0.15));
          border: 1px solid rgba(52,211,153,0.2);
          color: #D1FAE5; font-size: 13px; font-weight: 600;
          transition: all 0.25s ease;
          position: relative; overflow: hidden;
        }
        .cta-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(52,211,153,0.1), rgba(167,139,250,0.1));
          opacity: 0; transition: opacity 0.25s;
        }
        .cta-btn:hover:not(:disabled)::before { opacity: 1; }
        .cta-btn:hover:not(:disabled) { border-color: rgba(52,211,153,0.4); transform: translateY(-1px); box-shadow: 0 4px 20px rgba(52,211,153,0.15); }
        .cta-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-icon { font-size: 16px; }
        .btn-spinner {
          width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.15); border-top-color: #34D399;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ─── MAIN ─── */
        .main { max-width: 960px; margin: 0 auto; padding: 28px 24px; flex: 1; width: 100%; }

        /* ─── CONTROLS ─── */
        .controls { display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px; }
        .filter-section { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .filter-title {
          font-size: 11px; color: rgba(255,255,255,0.25); text-transform: uppercase;
          letter-spacing: 0.08em; font-family: 'JetBrains Mono', monospace;
          min-width: 44px; font-weight: 600;
        }
        .filter-pills { display: flex; gap: 6px; flex-wrap: wrap; }
        .pill {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 14px; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.06);
          font-size: 12px; color: rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.02);
          transition: all 0.2s ease; white-space: nowrap; font-weight: 500;
        }
        .pill:hover { border-color: rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.04); }
        .pill-active {
          border-color: rgba(52,211,153,0.3) !important;
          background: rgba(52,211,153,0.08) !important;
          color: #34D399 !important;
          box-shadow: 0 0 12px rgba(52,211,153,0.08);
        }
        .pill-icon { font-size: 10px; }

        /* Search */
        .search-box {
          position: relative; max-width: 400px;
        }
        .search-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: rgba(255,255,255,0.2); font-size: 15px;
        }
        .search-box input {
          width: 100%; padding: 10px 14px 10px 38px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px; color: #E2E8F0; font-size: 13px;
          font-family: 'Inter', sans-serif; outline: none;
          transition: all 0.2s ease;
        }
        .search-box input:focus {
          border-color: rgba(52,211,153,0.3);
          background: rgba(52,211,153,0.03);
          box-shadow: 0 0 0 3px rgba(52,211,153,0.08);
        }
        .search-box input::placeholder { color: rgba(255,255,255,0.2); }

        /* ─── STATS ─── */
        .stats-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 10px; margin-bottom: 24px;
        }
        .stat-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 14px; padding: 16px;
          text-align: center;
          transition: all 0.2s ease;
        }
        .stat-card:hover { border-color: rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); }
        .stat-number {
          display: block; font-size: 28px; font-weight: 800;
          background: linear-gradient(135deg, #F0FDF4, #E2E8F0);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; line-height: 1.2;
        }
        .stat-label {
          font-size: 11px; color: rgba(255,255,255,0.3);
          font-family: 'JetBrains Mono', monospace; margin-top: 4px; display: block;
        }

        /* ─── ERROR ─── */
        .error-box {
          display: flex; gap: 14px; align-items: flex-start;
          background: rgba(248,113,113,0.06); border: 1px solid rgba(248,113,113,0.15);
          border-radius: 14px; padding: 18px 20px;
          margin-bottom: 24px; animation: fadeIn 0.3s ease;
        }
        .error-icon { font-size: 20px; flex-shrink: 0; margin-top: 2px; }
        .error-box strong { color: #FCA5A5; font-size: 14px; }
        .error-box p { color: rgba(252,165,165,0.7); font-size: 13px; margin-top: 4px; word-break: break-word; }
        .error-hint { font-size: 11px; color: rgba(255,255,255,0.25); margin-top: 6px; display: block; }

        /* ─── HERO EMPTY ─── */
        .hero-empty {
          text-align: center; padding: 80px 20px 60px;
          display: flex; flex-direction: column; align-items: center;
          position: relative;
        }
        .hero-orb {
          position: absolute; top: -40px; left: 50%; transform: translateX(-50%);
          width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%);
          pointer-events: none; animation: orb-breathe 5s ease-in-out infinite;
        }
        @keyframes orb-breathe {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.6; }
          50% { transform: translateX(-50%) scale(1.1); opacity: 1; }
        }
        .hero-content { position: relative; z-index: 1; }
        .hero-badge {
          display: inline-block; padding: 6px 16px; border-radius: 20px;
          background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.15);
          font-size: 11px; font-weight: 600; color: #34D399;
          font-family: 'JetBrains Mono', monospace;
          text-transform: uppercase; letter-spacing: 0.08em;
          margin-bottom: 24px;
        }
        .hero-title {
          font-size: 42px; font-weight: 900; letter-spacing: -0.04em;
          color: #F8FAFC; line-height: 1.15; margin-bottom: 16px;
        }
        .gradient-text {
          background: linear-gradient(135deg, #34D399, #A78BFA, #F472B6);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-desc {
          font-size: 15px; color: rgba(255,255,255,0.4); max-width: 520px;
          margin: 0 auto 32px; line-height: 1.7;
        }

        /* Hero CTA */
        .hero-cta {
          position: relative; display: inline-flex; align-items: center; gap: 10px;
          padding: 14px 32px; border-radius: 14px; font-size: 15px; font-weight: 700;
          color: #050505; overflow: hidden;
          background: linear-gradient(135deg, #34D399, #5EEAD4);
          transition: all 0.3s ease;
          box-shadow: 0 4px 25px rgba(52,211,153,0.3);
        }
        .hero-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 35px rgba(52,211,153,0.4); }
        .hero-cta-glow {
          position: absolute; top: 50%; left: 50%; width: 120%; height: 120%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(255,255,255,0.2), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .hero-cta:hover .hero-cta-glow { opacity: 1; }
        .hero-cta-arrow { transition: transform 0.2s; }
        .hero-cta:hover .hero-cta-arrow { transform: translateX(4px); }

        /* Browse links */
        .browse-links {
          display: flex; flex-wrap: wrap; gap: 6px; justify-content: center;
          margin-top: 32px;
        }
        .browse-label {
          font-size: 11px; color: rgba(255,255,255,0.2); align-self: center;
          font-family: 'JetBrains Mono', monospace; width: 100%; margin-bottom: 4px;
        }
        .browse-link {
          font-size: 11px; color: rgba(255,255,255,0.3); padding: 4px 12px;
          border: 1px solid rgba(255,255,255,0.06); border-radius: 8px;
          transition: all 0.2s;
        }
        .browse-link:hover { color: rgba(255,255,255,0.6); border-color: rgba(255,255,255,0.12); }

        /* ─── LOADING ─── */
        .loading-state {
          padding: 60px 0; text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 24px;
        }
        .loading-orb {
          position: relative; width: 80px; height: 80px;
        }
        .loading-ring {
          position: absolute; inset: 0; border-radius: 50%;
          border: 2px solid transparent;
        }
        .ring-1 {
          border-top-color: #34D399; animation: spin 1.2s linear infinite;
        }
        .ring-2 {
          inset: 8px; border-right-color: #A78BFA; animation: spin 1.8s linear infinite reverse;
        }
        .ring-3 {
          inset: 16px; border-bottom-color: #FBBF24; animation: spin 2.4s linear infinite;
        }
        .loading-core {
          position: absolute; inset: 24px; border-radius: 50%;
          background: radial-gradient(circle, rgba(52,211,153,0.3), transparent);
          animation: pulse-core 1.5s ease-in-out infinite;
        }
        @keyframes pulse-core {
          0%, 100% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        .loading-text {
          font-size: 12px; color: rgba(255,255,255,0.3);
          font-family: 'JetBrains Mono', monospace;
        }
        .loading-bar {
          width: 300px; max-width: 80%; height: 2px; border-radius: 2px;
          background: rgba(255,255,255,0.05); overflow: hidden;
        }
        .loading-bar-fill {
          width: 40%; height: 100%;
          background: linear-gradient(90deg, #34D399, #A78BFA);
          border-radius: 2px;
          animation: loading-slide 1.5s ease-in-out infinite;
        }
        @keyframes loading-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }

        /* ─── JOB LIST ─── */
        .jobs-list { display: flex; flex-direction: column; gap: 12px; }

        /* ─── JOB CARD ─── */
        .job-card {
          position: relative; overflow: hidden;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px; padding: 18px 20px;
          cursor: pointer; transition: all 0.25s ease;
          animation: card-in 0.4s ease backwards;
        }
        @keyframes card-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .job-card:hover {
          border-color: rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.035);
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        }
        .card-accent {
          position: absolute; top: 0; left: 0; right: 0;
          height: 2px; opacity: 0.6;
          transition: opacity 0.25s;
        }
        .job-card:hover .card-accent { opacity: 1; }

        .job-card-header {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 12px; margin-bottom: 10px;
        }
        .job-left { display: flex; align-items: flex-start; gap: 12px; }
        .role-indicator {
          width: 28px; height: 28px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; border: 1px solid;
        }
        .job-title {
          font-size: 15px; font-weight: 700; color: #F1F5F9; line-height: 1.3;
          display: flex; align-items: center; gap: 6px;
        }
        .fire-icon { font-size: 13px; }
        .new-pulse {
          width: 7px; height: 7px; border-radius: 50%; background: #A78BFA;
          animation: pulse-dot 1.5s ease-in-out infinite;
        }
        .job-company { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 3px; }
        .company-name { color: rgba(255,255,255,0.5); font-weight: 500; }
        .meta-divider {
          display: inline-block; width: 3px; height: 3px; border-radius: 50%;
          background: rgba(255,255,255,0.15); margin: 0 8px; vertical-align: middle;
        }

        .job-right-badges { display: flex; flex-wrap: wrap; gap: 5px; flex-shrink: 0; justify-content: flex-end; }
        .badge {
          font-size: 10px; padding: 3px 10px; border-radius: 8px;
          font-weight: 600; font-family: 'JetBrains Mono', monospace;
          white-space: nowrap; border: 1px solid;
        }

        .job-summary {
          font-size: 13px; color: rgba(255,255,255,0.4);
          line-height: 1.7; margin-bottom: 12px;
        }

        .job-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 12px; }
        .tag {
          font-size: 11px; padding: 3px 10px; border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.35);
          font-family: 'JetBrains Mono', monospace;
          background: rgba(255,255,255,0.02);
        }
        .tag-esop { border-color: rgba(52,211,153,0.2); color: #34D399; background: rgba(52,211,153,0.06); }
        .tag-salary { border-color: rgba(167,139,250,0.2); color: #A78BFA; background: rgba(167,139,250,0.06); }

        /* Expanded */
        .job-expanded {
          background: rgba(255,255,255,0.02); border-radius: 10px;
          padding: 14px 16px; margin-bottom: 12px;
          border: 1px solid rgba(255,255,255,0.04);
          display: flex; flex-direction: column; gap: 10px;
          animation: fadeIn 0.25s ease;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

        .expand-item { display: flex; gap: 10px; font-size: 13px; line-height: 1.6; }
        .expand-label {
          color: rgba(255,255,255,0.6); font-weight: 600; white-space: nowrap;
          font-size: 12px;
        }
        .expand-text { color: rgba(255,255,255,0.4); }

        /* Footer */
        .job-footer {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 8px; padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.04);
        }
        .job-meta {
          font-size: 11px; color: rgba(255,255,255,0.15);
          font-family: 'JetBrains Mono', monospace;
        }
        .job-actions { display: flex; gap: 6px; }
        .action-btn {
          font-size: 12px; padding: 6px 16px;
          border: 1px solid rgba(255,255,255,0.08); border-radius: 9px;
          color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.02);
          font-weight: 500; transition: all 0.2s; display: inline-block; cursor: pointer;
        }
        .action-btn:hover { border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.04); }
        .action-primary { border-color: rgba(52,211,153,0.2); color: #34D399; }
        .action-primary:hover { background: rgba(52,211,153,0.08); border-color: rgba(52,211,153,0.3); }
        .action-ghost { border-color: rgba(167,139,250,0.2); color: #A78BFA; }
        .action-ghost:hover { background: rgba(167,139,250,0.08); border-color: rgba(167,139,250,0.3); }

        /* Source footer */
        .source-footer {
          display: flex; flex-wrap: wrap; gap: 6px;
          padding: 24px 0 12px; border-top: 1px solid rgba(255,255,255,0.04);
          margin-top: 20px; align-items: center;
        }

        /* No match */
        .no-match {
          text-align: center; padding: 60px 20px;
          color: rgba(255,255,255,0.3); font-size: 14px;
        }

        /* ─── RESPONSIVE ─── */
        @media (max-width: 640px) {
          .header-inner { flex-direction: column; align-items: flex-start; }
          .hero-title { font-size: 28px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .job-card-header { flex-direction: column; }
          .job-right-badges { flex-direction: row; }
          .hero-empty { padding: 40px 16px 30px; }
        }
      `}</style>
    </>
  );
}
