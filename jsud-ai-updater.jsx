import { useState } from "react";

const SYSTEM_PROMPT = `You are a web strategy expert specializing in car rental competitive analysis. 
You analyze Sixt.com's latest features, messaging, design trends, and offerings, then generate specific, actionable improvements for JSUD (justshowupdrive.com) — a premium car rental broker that:
- Has exclusive member rates (cheaper than Sixt direct)
- Cannot mention Sixt by name (trademark risk)
- Uses WhatsApp as primary booking channel
- Operates worldwide via Sixt's global network
- Includes: $0 deductible, GPS, extra driver, unlimited miles, free cancellation in every booking

You must respond in JSON only. No markdown, no backticks, no preamble. Format:
{
  "sixt_updates": ["list of what Sixt currently offers or has recently updated"],
  "jsud_advantages": ["list of JSUD's competitive advantages vs Sixt"],
  "improvements": [
    {
      "priority": "HIGH|MEDIUM|LOW",
      "section": "section name",
      "title": "improvement title",
      "description": "what to add/change and why",
      "copy": "exact copy/text to use on the site"
    }
  ],
  "new_sections": ["suggestions for entirely new sections"],
  "summary": "2-sentence executive summary"
}`;

export default function JSUDUpdater() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [lastRun, setLastRun] = useState(null);

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{
            role: "user",
            content: `Search for the latest Sixt.com website features, promotions, fleet updates, messaging, and UX improvements as of today. 
Then compare with JSUD (justshowupdrive.com) and generate specific improvements JSUD should make to stay ahead.
Focus on: messaging, new vehicle categories, destinations, trust signals, promotions, and UX.
Remember JSUD cannot mention Sixt by name but offers the same fleet at lower prices via WhatsApp.`
          }]
        })
      });

      const data = await response.json();
      const fullText = data.content
        .map(item => (item.type === "text" ? item.text : ""))
        .filter(Boolean)
        .join("\n");

      const clean = fullText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
      setLastRun(new Date().toLocaleString());
    } catch (err) {
      setError("Analysis failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const priorityColor = {
    HIGH: "#F43F5E",
    MEDIUM: "#C9A84C",
    LOW: "#22C55E"
  };

  const priorityBg = {
    HIGH: "rgba(244,63,94,.1)",
    MEDIUM: "rgba(201,168,76,.1)",
    LOW: "rgba(34,197,94,.1)"
  };

  return (
    <div style={{
      background: "#08080A",
      minHeight: "100vh",
      fontFamily: "'Cabinet Grotesk', 'DM Sans', sans-serif",
      color: "#EAEAF2",
      padding: "24px"
    }}>
      {/* Header */}
      <div style={{
        maxWidth: 900,
        margin: "0 auto 32px",
        borderBottom: "1px solid rgba(201,168,76,.12)",
        paddingBottom: 24
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontFamily: "serif", fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 4 }}>
              JSUD <span style={{ color: "#C9A84C" }}>AI Updater</span>
            </div>
            <p style={{ fontSize: 13, color: "#68687C" }}>
              Analyzes the competition in real time → generates improvements for justshowupdrive.com
            </p>
          </div>
          {lastRun && (
            <div style={{ fontSize: 11, color: "#68687C", textAlign: "right" }}>
              Last run: {lastRun}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Run Button */}
        <div style={{
          background: "linear-gradient(140deg, rgba(201,168,76,.08), rgba(201,168,76,.02))",
          border: "1px solid rgba(201,168,76,.2)",
          borderRadius: 14,
          padding: "28px 24px",
          marginBottom: 24,
          textAlign: "center"
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
          <h2 style={{ fontFamily: "serif", fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 8 }}>
            Competitive Intelligence
          </h2>
          <p style={{ fontSize: 14, color: "#68687C", marginBottom: 20, maxWidth: 480, margin: "0 auto 20px" }}>
            Searches the competition's latest updates, compares with JSUD, and generates specific improvements with exact copy to use.
          </p>
          <button
            onClick={runAnalysis}
            disabled={loading}
            style={{
              background: loading ? "rgba(201,168,76,.3)" : "#C9A84C",
              color: "#000",
              border: "none",
              fontFamily: "inherit",
              fontSize: 15,
              fontWeight: 800,
              padding: "14px 32px",
              borderRadius: 10,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all .2s",
              display: "inline-flex",
              alignItems: "center",
              gap: 8
            }}
          >
            {loading ? (
              <>
                <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
                Analyzing competition...
              </>
            ) : (
              "🚀 Run Analysis Now"
            )}
          </button>
          {loading && (
            <p style={{ fontSize: 12, color: "#C9A84C", marginTop: 12 }}>
              Searching latest updates → comparing with JSUD → generating improvements...
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(244,63,94,.08)",
            border: "1px solid rgba(244,63,94,.2)",
            borderRadius: 10,
            padding: 16,
            marginBottom: 20,
            fontSize: 13,
            color: "#F43F5E"
          }}>
            ❌ {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Summary */}
            <div style={{
              background: "rgba(34,197,94,.06)",
              border: "1px solid rgba(34,197,94,.15)",
              borderRadius: 12,
              padding: "18px 20px"
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#22C55E", marginBottom: 8 }}>
                Executive Summary
              </div>
              <p style={{ fontSize: 14, color: "#EAEAF2", lineHeight: 1.65 }}>{result.summary}</p>
            </div>

            {/* JSUD Advantages */}
            {result.jsud_advantages?.length > 0 && (
              <div style={{ background: "#101014", border: "1px solid rgba(255,255,255,.05)", borderRadius: 12, padding: "18px 20px" }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#C9A84C", marginBottom: 12 }}>
                  ✦ JSUD's Competitive Advantages
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {result.jsud_advantages.map((adv, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "#EAEAF2" }}>
                      <span style={{ color: "#22C55E", flexShrink: 0 }}>✓</span>{adv}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Competition Updates */}
            {result.sixt_updates?.length > 0 && (
              <div style={{ background: "#101014", border: "1px solid rgba(255,255,255,.05)", borderRadius: 12, padding: "18px 20px" }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#68687C", marginBottom: 12 }}>
                  Competition: Latest Updates Detected
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {result.sixt_updates.map((u, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "#68687C" }}>
                      <span style={{ flexShrink: 0 }}>→</span>{u}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvements */}
            {result.improvements?.length > 0 && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#EAEAF2", marginBottom: 12 }}>
                  🎯 Improvements for justshowupdrive.com
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {result.improvements.sort((a,b) => {
                    const o = { HIGH: 0, MEDIUM: 1, LOW: 2 };
                    return o[a.priority] - o[b.priority];
                  }).map((imp, i) => (
                    <div key={i} style={{
                      background: "#101014",
                      border: `1px solid ${priorityColor[imp.priority]}30`,
                      borderLeft: `3px solid ${priorityColor[imp.priority]}`,
                      borderRadius: 10,
                      padding: "16px 18px"
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                        <span style={{
                          background: priorityBg[imp.priority],
                          color: priorityColor[imp.priority],
                          fontSize: 9,
                          fontWeight: 800,
                          letterSpacing: 1.5,
                          padding: "3px 8px",
                          borderRadius: 4,
                          flexShrink: 0,
                          marginTop: 1
                        }}>
                          {imp.priority}
                        </span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 3 }}>
                            [{imp.section}] {imp.title}
                          </div>
                          <div style={{ fontSize: 12, color: "#68687C", lineHeight: 1.55 }}>{imp.description}</div>
                        </div>
                      </div>
                      {imp.copy && (
                        <div style={{
                          background: "rgba(201,168,76,.05)",
                          border: "1px solid rgba(201,168,76,.12)",
                          borderRadius: 7,
                          padding: "10px 12px",
                          marginTop: 10
                        }}>
                          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "#C9A84C", marginBottom: 5 }}>
                            Copy to use:
                          </div>
                          <div style={{ fontSize: 12, color: "#EAEAF2", lineHeight: 1.6, fontStyle: "italic" }}>
                            "{imp.copy}"
                          </div>
                          <button
                            onClick={() => navigator.clipboard.writeText(imp.copy)}
                            style={{
                              background: "rgba(201,168,76,.1)",
                              border: "1px solid rgba(201,168,76,.2)",
                              color: "#C9A84C",
                              fontFamily: "inherit",
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "4px 10px",
                              borderRadius: 4,
                              cursor: "pointer",
                              marginTop: 8
                            }}
                          >
                            Copy text
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Sections */}
            {result.new_sections?.length > 0 && (
              <div style={{ background: "#101014", border: "1px solid rgba(255,255,255,.05)", borderRadius: 12, padding: "18px 20px" }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#C9A84C", marginBottom: 12 }}>
                  💡 New Sections to Add
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {result.new_sections.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "#EAEAF2" }}>
                      <span style={{ color: "#C9A84C", flexShrink: 0 }}>+</span>{s}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action */}
            <div style={{
              background: "#101014",
              border: "1px solid rgba(201,168,76,.1)",
              borderRadius: 12,
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12
            }}>
              <span style={{ fontSize: 13, color: "#68687C" }}>
                Apply improvements to your site → upload to GitHub → Cloudflare auto-deploys ✓
              </span>
              <button
                onClick={runAnalysis}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(201,168,76,.3)",
                  color: "#C9A84C",
                  fontFamily: "inherit",
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "8px 16px",
                  borderRadius: 7,
                  cursor: "pointer"
                }}
              >
                🔄 Run Again
              </button>
            </div>
          </div>
        )}

        {!result && !loading && (
          <div style={{
            textAlign: "center",
            padding: "48px 24px",
            color: "#68687C",
            fontSize: 13,
            border: "1px dashed rgba(201,168,76,.1)",
            borderRadius: 12
          }}>
            Click "Run Analysis Now" to search for the competition's latest updates and generate improvements for JSUD.
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
