import React, { useState, useEffect } from "react";
import "./App.css";

// Ocean-inspired color palette
const COLORS = {
  primary: "#3AA7D3",    // blue
  accent: "#20B2AA",     // teal
  secondary: "#DCCAA9",  // sandy beige
  white: "#fff",
  light: "#f7f9fb"
};

// Mood icons (unicode/emojis for simplicity)
const MOODS = [
  { value: "stoked", label: "😃", color: "#45d9c6" },
  { value: "happy", label: "🙂", color: "#3AA7D3" },
  { value: "neutral", label: "😐", color: "#b6c6c2" },
  { value: "tired", label: "😫", color: "#d9a545" },
  { value: "disappointing", label: "☁️", color: "#acb0b3" }
];

// Sample spots and boards
const SPOTS = ["Ocean Beach", "Mavericks", "Malibu", "Pipeline"];
const BOARDS = ["Shortboard", "Longboard", "Fish", "Funboard", "Soft Top"];

// Helper functions
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

// Surf Condition Icons (svg components)
function Icon({ type, ...props }) {
  // Type: wave, wind, tide, mood
  switch (type) {
    case "wave":
      return (
        <svg width={24} height={24} {...props}><path fill={COLORS.primary} d="M2,20 Q8,10 14,20 Q18,10 22,20" stroke={COLORS.accent} strokeWidth="1.5" fill="none"/></svg>
      );
    case "wind":
      return (
        <svg width={24} height={24} {...props}><path fill="none" stroke={COLORS.accent} strokeWidth="2" d="M4 9Q8 5 20 9M5 13h14M8 17Q14 21 20 17"/></svg>
      );
    case "tide":
      return (
        <svg width={24} height={24} {...props}><ellipse cx={12} cy={18} rx={8} ry={3} fill={COLORS.secondary}/><rect x="4" y="7" width="16" height="8" rx="8" fill={COLORS.primary}/></svg>
      );
    default:
      return null;
  }
}

// Sample Data
const sampleSessions = [
  {
    id: 1,
    date: new Date(Date.now() - 86400000 * 2).toISOString().substring(0, 10), // 2 days ago
    spot: "Ocean Beach",
    board: "Shortboard",
    waves: 7,
    mood: "stoked",
    notes: "Perfect offshore winds. Glassy and punchy sections!",
    swell: "4ft",
    wind: "Light offshore",
    tide: "Mid",
  },
  {
    id: 2,
    date: new Date(Date.now() - 86400000 * 6).toISOString().substring(0, 10), // 6 days ago
    spot: "Malibu",
    board: "Longboard",
    waves: 15,
    mood: "happy",
    notes: "Lots of people but mellow, clean lines.",
    swell: "2-3ft",
    wind: "Calm",
    tide: "High"
  },
  {
    id: 3,
    date: new Date().toISOString().substring(0, 10),
    spot: "Ocean Beach",
    board: "Fish",
    waves: 10,
    mood: "tired",
    notes: "Tough paddle, but fun corners on the inside.",
    swell: "5-6ft",
    wind: "Onshore",
    tide: "Low"
  }
];

// Modal background overlay
function Modal({ onClose, children }) {
  return (
    <div style={{
      position: "fixed", zIndex: 10, top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(50,130,200,0.12)",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ minWidth: 320, maxWidth: 400, background: COLORS.white, borderRadius: 18, boxShadow: "0 4px 32px #0001", padding: 24, position: 'relative' }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 8, right: 12, background: "none", border: "none", fontSize: 26, color: COLORS.primary, cursor: "pointer", fontWeight: "bold"
        }} aria-label="Close modal">&times;</button>
        {children}
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState("light");
  const [view, setView] = useState("home"); // home | log | stats | detail
  const [sessions, setSessions] = useState(() =>
    JSON.parse(localStorage.getItem("surf_sessions")) || sampleSessions
  );
  const [selectedSession, setSelectedSession] = useState(null); // session object
  const [showReminder, setShowReminder] = useState(false);
  const [filters, setFilters] = useState({ spot: "", board: "", mood: "" });

  // Apply theme CSS custom props
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Save sessions to localStorage on update
  useEffect(() => {
    localStorage.setItem("surf_sessions", JSON.stringify(sessions));
  }, [sessions]);

  // Simulate daily reminder: if user hasn't added a session today, show notification
  useEffect(() => {
    const today = new Date().toISOString().substring(0, 10);
    if (!sessions.some(s => s.date === today)) {
      const hour = new Date().getHours();
      if (hour > 6 && hour < 22) { // between 6am and 10pm
        setTimeout(() => setShowReminder(true), 1500);
      }
    }
  }, [sessions]);

  // PUBLIC_INTERFACE
  const toggleTheme = () =>
    setTheme(t => (t === "light" ? "dark" : "light"));

  // View Switcher
  function showHome() {
    setView("home");
    setSelectedSession(null);
  }
  function openLog() {
    setView("log");
    setSelectedSession(null);
  }
  function openStats() {
    setView("stats");
    setSelectedSession(null);
  }
  function openDetail(session) {
    setSelectedSession(session);
    setView("detail");
  }

  // SESSION CRUD HANDLERS
  // PUBLIC_INTERFACE
  function addSession(data) {
    const session = { ...data, id: Date.now() };
    setSessions(prev => [session, ...prev]);
    showHome();
  }
  // PUBLIC_INTERFACE
  function updateSession(id, newData) {
    setSessions(prev => prev.map(s => (s.id === id ? { ...s, ...newData } : s)));
    openDetail({ ...sessions.find(s => s.id === id), ...newData });
  }
  // PUBLIC_INTERFACE
  function deleteSession(id) {
    setSessions(prev => prev.filter(s => s.id !== id));
    showHome();
  }

  // Filtering sessions based on filters state
  const filteredSessions = sessions.filter(s =>
    (!filters.spot || s.spot === filters.spot) &&
    (!filters.board || s.board === filters.board) &&
    (!filters.mood || s.mood === filters.mood)
  );

  // ---- UI COMPONENTS ----

  // Header with oceanic gradient and background elements
  function OceanHeader({ title, showBack, onBack, onStats, children }) {
    return (
      <div style={{
        background: `linear-gradient(120deg, ${COLORS.primary} 75%, ${COLORS.secondary} 95%)`,
        padding: "28px 18px 16px 18px",
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
        boxShadow: "0 2px 18px #20B2AA22",
        color: "#fff",
        position: "relative",
        textAlign: "left"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {showBack && (
            <button
              onClick={onBack}
              aria-label="Go Back"
              style={{
                background: "rgba(255,255,255,0.18)",
                border: "none",
                borderRadius: "50%",
                color: "#fff",
                fontSize: 25,
                fontWeight: 600,
                width: 40,
                height: 40,
                cursor: "pointer",
              }}
            >⟵</button>
          )}
          <h1 style={{
            fontFamily: "Arial Rounded MT Bold, Arial, sans-serif",
            margin: "0 0 0 4px",
            fontSize: 26,
            letterSpacing: "1px"
          }}>{title}</h1>
          {!!onStats && (
            <button
              onClick={onStats}
              aria-label="View Statistics"
              title="Dashboard"
              style={{
                background: COLORS.accent,
                marginLeft: "auto",
                border: "none",
                borderRadius: 12,
                padding: "8px 18px",
                color: "#fff",
                fontWeight: 600,
                fontSize: 15,
                boxShadow: "0 1px 5px #20B2AA50",
                cursor: "pointer",
                transition: "background .2s"
              }}
            >📊 Stats</button>
          )}
        </div>
        {children}
      </div>
    );
  }

  // Floating Add button
  function AddButton({ onClick }) {
    return (
      <button
        style={{
          position: "fixed",
          right: 18,
          bottom: 24,
          zIndex: 1,
          background: `linear-gradient(120deg, ${COLORS.primary}, ${COLORS.accent})`,
          color: "#fff",
          fontSize: 27,
          border: "none",
          borderRadius: "50%",
          width: 56,
          height: 56,
          boxShadow: "0 4px 16px #3AA7D320",
          cursor: "pointer"
        }}
        onClick={onClick}
        aria-label="Log new surf session"
      >
        ＋
      </button>
    );
  }

  // Filter Bar
  function FilterBar({ filters, setFilters }) {
    return (
      <div style={{
        display: "flex",
        gap: 8,
        justifyContent: "center",
        alignItems: "center",
        background: COLORS.light,
        padding: "8px 8px 2px 8px",
        borderRadius: 16,
        margin: "14px auto 0 auto",
        flexWrap: "wrap",
        boxShadow: "0 0 8px #3AA7D318"
      }}>
        <select value={filters.spot} onChange={e => setFilters(f => ({ ...f, spot: e.target.value }))} style={filterSelectStyle}>
          <option value="">All Spots</option>
          {SPOTS.map(spot => <option key={spot}>{spot}</option>)}
        </select>
        <select value={filters.board} onChange={e => setFilters(f => ({ ...f, board: e.target.value }))} style={filterSelectStyle}>
          <option value="">All Boards</option>
          {BOARDS.map(board => <option key={board}>{board}</option>)}
        </select>
        <select value={filters.mood} onChange={e => setFilters(f => ({ ...f, mood: e.target.value }))} style={filterSelectStyle}>
          <option value="">Any Mood</option>
          {MOODS.map(mood => <option value={mood.value} key={mood.value}>{mood.label}</option>)}
        </select>
        {(filters.spot || filters.board || filters.mood) && (
          <button style={{ ...filterSelectStyle, background: COLORS.secondary, fontWeight: 600, color: COLORS.primary, border: 'none' }} onClick={() => setFilters({ spot: "", board: "", mood: "" })}>
            Clear
          </button>
        )}
      </div>
    );
  }
  const filterSelectStyle = {
    fontSize: 15,
    border: "1px solid #3AA7D337",
    borderRadius: 12,
    padding: "5px 12px",
    background: "#fff",
    color: COLORS.primary
  };
  // ---- SCREENS ----

  // 1. Home Screen: session cards, add button, filters
  function HomeScreen() {
    return (
      <div>
        <OceanHeader title="SurfSync" onStats={openStats}>
          <div style={{ marginTop: 12, fontSize: 15, letterSpacing: 0.6, color: "rgba(255,255,255,0.93)" }}>
            <span>Your Ocean Sessions</span>
          </div>
        </OceanHeader>
        <div style={{ margin: "0 auto", maxWidth: 480, padding: "0 6px" }}>
          <FilterBar filters={filters} setFilters={setFilters} />
          <div style={{ margin: "20px 0 80px 0" }}>
            {filteredSessions.length === 0 && (
              <div style={{
                textAlign: "center", padding: 34,
                color: "#b6d6e9", fontWeight: 600, fontSize: 20
              }}>
                No surf sessions yet. Hit ＋ to log your first!
              </div>
            )}
            {filteredSessions.map(session => (
              <SurfCard key={session.id} session={session} onClick={() => openDetail(session)} />
            ))}
          </div>
        </div>
        <AddButton onClick={openLog} />
      </div>
    );
  }

  // Card display for sessions
  function SurfCard({ session, onClick }) {
    const moodObj = MOODS.find(m => m.value === session.mood);
    return (
      <div
        tabIndex={0}
        role="button"
        aria-label={`View session at ${session.spot}`}
        onClick={onClick}
        style={{
          background: `linear-gradient(120deg, #fff 80%, ${COLORS.secondary} 100%)`,
          borderRadius: 18,
          boxShadow: "0 2px 18px #20B2AA14",
          padding: "22px 8px 14px 18px",
          margin: "12px 0",
          cursor: "pointer",
          borderLeft: `6px solid ${COLORS.primary}`,
          transition: "box-shadow .18s",
          display: 'flex', alignItems: 'center',
        }}
      >
        <div style={{
          background: moodObj ? moodObj.color : COLORS.primary, width: 38, height: 38,
          borderRadius: "50%", textAlign: "center", lineHeight: "38px", fontSize: 26, marginRight: 14,
          boxShadow: "0 2px 6px #3AA7D33c",
          userSelect: "none"
        }}>{moodObj ? moodObj.label : ""}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.primary }}>{session.spot}</div>
          <div style={{ fontSize: 14, color: "#455", margin: "2px 0 1px 0" }}>{session.board} • {session.waves}&nbsp;waves</div>
          <div style={{ fontSize: 13, color: "#819" }}>{formatDate(session.date)}</div>
        </div>
        <div aria-label="View details" style={{ fontSize: 17, color: COLORS.accent, fontWeight: 900, marginRight: 10 }}>›</div>
      </div>
    );
  }

  // 2. Log New Session
  function LogSessionScreen({ editSession }) {
    const isEdit = !!editSession;
    const [form, setForm] = useState(() => editSession
      ? { ...editSession }
      : {
        date: new Date().toISOString().substring(0, 10),
        spot: "",
        board: "",
        waves: 0,
        mood: "happy",
        notes: "",
        swell: "",
        wind: "",
        tide: ""
      });

    function handleChange(e) {
      const { name, value } = e.target;
      setForm(f => ({ ...f, [name]: value }));
    }
    function handleMood(mood) {
      setForm(f => ({ ...f, mood }));
    }
    function handleSubmit(e) {
      e.preventDefault();
      const final = {
        ...form,
        date: form.date || new Date().toISOString().substring(0, 10),
        waves: Number(form.waves)
      };
      if (!form.spot || !form.board || !form.mood || !form.date) return;
      if (isEdit) {
        updateSession(editSession.id, final);
      } else {
        addSession(final);
      }
    }
    return (
      <div>
        <OceanHeader title={isEdit ? "Edit Session" : "Log New Session"} showBack onBack={showHome} />
        <div style={{ margin: "0 auto", maxWidth: 380, padding: 16 }}>
          <form onSubmit={handleSubmit}>
            <div style={formFieldStyle}>
              <label style={formLabelStyle}>Date</label>
              <input type="date" name="date" value={form.date}
                max={new Date().toISOString().substring(0, 10)}
                style={formInputStyle} onChange={handleChange} required />
            </div>
            <div style={formFieldStyle}>
              <label style={formLabelStyle}>Spot</label>
              <select name="spot" value={form.spot} onChange={handleChange} style={formInputStyle} required>
                <option value="">Select spot</option>
                {SPOTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={formFieldStyle}>
              <label style={formLabelStyle}>Board</label>
              <select name="board" value={form.board} onChange={handleChange} style={formInputStyle} required>
                <option value="">Board used</option>
                {BOARDS.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div style={formFieldStyle}>
              <label style={formLabelStyle}>Wave Count</label>
              <input type="number" min={0} max={100} name="waves" required value={form.waves}
                style={formInputStyle} onChange={handleChange} />
            </div>
            <div style={formFieldStyle}>
              <label style={{ ...formLabelStyle, marginBottom: 6 }}>Mood</label>
              <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
                {MOODS.map(m => (
                  <button type="button" key={m.value}
                    style={{
                      background: form.mood === m.value ? m.color : COLORS.secondary,
                      border: form.mood === m.value ? `2.5px solid ${COLORS.accent}` : "1px solid #d3e6e5",
                      borderRadius: "50%",
                      width: 40, height: 40, fontSize: 24,
                      color: "#333", cursor: "pointer", transition: "all .15s"
                    }}
                    aria-label={m.value}
                    onClick={() => handleMood(m.value)}
                  >{m.label}</button>
                ))}
              </div>
            </div>
            <div style={formFieldStyle}>
              <label style={formLabelStyle}>Session Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} style={{ ...formInputStyle, fontSize: 14 }} placeholder="Waves, crowd, feel, etc." />
            </div>
            <div style={{
              display: "flex",
              gap: 14,
              justifyContent: "space-between",
              flexWrap: "wrap"
            }}>
              <div style={formCondFieldStyle}>
                <label style={formCondLabelStyle}><Icon type="wave" /> Swell</label>
                <input type="text" name="swell" value={form.swell} onChange={handleChange} style={formCondInputStyle} placeholder="eg. 3-4ft" />
              </div>
              <div style={formCondFieldStyle}>
                <label style={formCondLabelStyle}><Icon type="wind" /> Wind</label>
                <input type="text" name="wind" value={form.wind} onChange={handleChange} style={formCondInputStyle} placeholder="eg. offshore" />
              </div>
              <div style={formCondFieldStyle}>
                <label style={formCondLabelStyle}><Icon type="tide" /> Tide</label>
                <input type="text" name="tide" value={form.tide} onChange={handleChange} style={formCondInputStyle} placeholder="eg. low" />
              </div>
            </div>
            <button type="submit"
              style={{
                marginTop: 22, width: "100%", fontSize: 18, fontWeight: 600,
                background: `linear-gradient(120deg, ${COLORS.primary}, ${COLORS.accent})`,
                border: "none", borderRadius: 12, padding: "12px 0",
                color: "#fff", boxShadow: "0 1px 7px #3AA7D320", cursor: "pointer"
              }}>{isEdit ? "Update Session" : "Add Session"}</button>
          </form>
        </div>
      </div>
    );
  }
  const formFieldStyle = { margin: "18px 0" };
  const formLabelStyle = { fontWeight: 600, fontSize: 15, color: "#1f4667", display: "block", marginBottom: 4, letterSpacing: "0.3px" };
  const formInputStyle = { border: `1.5px solid #CDE3ED`, borderRadius: 10, padding: "8px 12px", fontSize: 16, width: "100%", background: "#f5fafb", color: COLORS.primary };
  const formCondFieldStyle = { flex: 1, minWidth: 96, marginTop: 8 };
  const formCondLabelStyle = { fontWeight: 600, fontSize: 13, color: COLORS.accent, display: "flex", alignItems: "center", gap: 2, marginBottom: 3 };
  const formCondInputStyle = { border: "1px solid #99c7d9", borderRadius: 9, padding: "5px 7px", fontSize: 13, width: "100%", background: "#e3f4f8", color: COLORS.primary };

  // 3. Session Detail View (edit, delete, rich mood/notes highlight)
  function SessionDetailScreen({ session }) {
    const [editing, setEditing] = useState(false);
    if (!session) return null;
    const m = MOODS.find(mood => mood.value === session.mood);

    return (
      <div>
        <OceanHeader
          title={session.spot}
          showBack
          onBack={showHome}
        />
        <div style={{
          margin: "0 auto", maxWidth: 420, padding: "0 12px"
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 18px #20B2AA14",
            margin: "30px 0 30px 0",
            padding: "24px 20px",
            position: "relative"
          }}>
            <div style={{
              position: "absolute", top: 18, right: 20,
              display: "flex", gap: 12
            }}>
              <button
                aria-label="Edit session"
                style={{
                  background: COLORS.secondary,
                  border: "1px solid #e7dfcf", borderRadius: 8,
                  padding: "6px 11px", fontSize: 14, fontWeight: 600,
                  color: COLORS.primary, cursor: "pointer"
                }}
                onClick={() => setEditing(true)}
              >Edit</button>
              <button
                aria-label="Delete session"
                style={{
                  background: "#fdeaea",
                  border: "1px solid #fbc2b9", borderRadius: 8,
                  padding: "6px 10px", fontSize: 14,
                  color: "#d26671", fontWeight: 700, cursor: "pointer"
                }}
                onClick={() => {
                  if (window.confirm("Delete this surf session?")) {
                    deleteSession(session.id);
                  }
                }}
              >Delete</button>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              marginBottom: 10
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: m ? m.color : COLORS.secondary,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 36, marginRight: 4, userSelect: "none", boxShadow: "0 2px 7px #3AA7D338"
              }}>{m ? m.label : "🌊"}</div>
              <div>
                <div style={{
                  fontSize: 19, fontWeight: 700, color: COLORS.primary
                }}>{session.spot}</div>
                <div style={{
                  color: COLORS.accent, fontWeight: 500, fontSize: 14
                }}>{formatDate(session.date)}</div>
              </div>
            </div>
            <div style={{ fontSize: 15 }}>
              <strong>Board:</strong> {session.board}<br />
              <strong>Wave Count:</strong> {session.waves}<br />
              <strong>Swell:</strong> <span style={{ color: COLORS.primary }}>{session.swell || "-"}</span><br />
              <strong>Wind:</strong> <span style={{ color: COLORS.accent }}>{session.wind || "-"}</span><br />
              <strong>Tide:</strong> <span style={{ color: COLORS.secondary }}>{session.tide || "-"}</span><br />
            </div>
            <div style={{
              margin: "18px 0",
              background: "#f8fbfc",
              borderRadius: 12,
              boxShadow: "0 1px 4px #b6eaf322",
              padding: "14px 12px"
            }}>
              <span role="img" aria-label="Notes" style={{ fontSize: 19, color: COLORS.primary, verticalAlign: "middle" }}>📝</span>
              <span style={{ fontSize: 16, verticalAlign: "middle", marginLeft: 8 }}>{session.notes || <span style={{ color: "#b6c6cc" }}>No session notes</span>}</span>
            </div>
          </div>
        </div>
        {editing &&
          <Modal onClose={() => setEditing(false)}>
            <LogSessionScreen editSession={session} />
          </Modal>
        }
      </div>
    );
  }

  // 4. Stats Dashboard (charts: most visited spot, board usage %, mood trends)
  function StatsScreen() {
    // Generate statistics from sessions
    const bySpot = {};
    const byBoard = {};
    const byMood = {};
    const moodTrend = [];
    sessions.forEach(ses => {
      bySpot[ses.spot] = (bySpot[ses.spot] || 0) + 1;
      byBoard[ses.board] = (byBoard[ses.board] || 0) + 1;
      byMood[ses.mood] = (byMood[ses.mood] || 0) + 1;
      // Mood trend: array of [date,mood value (1=bad,5=stoked)]
      const moodScore = MOODS.findIndex(m => m.value === ses.mood) + 1;
      moodTrend.push({ date: ses.date, mood: moodScore });
    });

    // For simple charting, mock a bar with divs
    function BarChart({ data, labels, colors }) {
      const max = Math.max(...data, 1);
      return (
        <div style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 15,
          height: 116,
          margin: "13px 0"
        }}>
          {data.map((val, i) =>
            <div key={labels[i]} style={{
              flex: 1,
              height: (val / max) * 98 + 8,
              background: colors[i % colors.length],
              borderRadius: 11,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              position: "relative"
            }}>
              <span style={{
                position: "absolute", top: -27, left: 0, right: 0,
                fontSize: 15, fontWeight: 700, color: "#217e96"
              }}>{val}</span>
              <span style={{
                fontSize: 14, color: "#454", fontWeight: 600, padding: "2px 0"
              }}>{labels[i]}</span>
            </div>
          )}
        </div>
      );
    }

    // Board Usage: compute percentage
    const boardLabels = Object.keys(byBoard);
    const boardData = boardLabels.map(b => byBoard[b]);
    const boardPercent = boardData.map((val, i) => Math.round(val / (sessions.length || 1) * 100));

    // Mood trend: simple line using unicode glyph or span blocks
    const sortedMoodTrend = moodTrend.length > 0
      ? moodTrend.sort((a, b) => new Date(a.date) - new Date(b.date))
      : [];

    return (
      <div>
        <OceanHeader title="Surf Stats" showBack onBack={showHome} />
        <div style={{ margin: "0 auto", maxWidth: 480, padding: 12 }}>
          <section style={chartCardStyle}>
            <h3 style={cardTitleStyle}>Most Visited Spot</h3>
            {Object.keys(bySpot).length === 0 ? (
              <div style={{ color: COLORS.primary }}>— No data —</div>
            ) : (
              <BarChart
                data={Object.values(bySpot)}
                labels={Object.keys(bySpot)}
                colors={[COLORS.primary, COLORS.accent, COLORS.secondary]}
              />
            )}
          </section>
          <section style={chartCardStyle}>
            <h3 style={cardTitleStyle}>Board Usage %</h3>
            {boardLabels.length === 0 ? (
              <div style={{ color: COLORS.primary }}>— No data —</div>
            ) : (
              <div style={{
                display: "flex", gap: 10, justifyContent: "space-around", marginTop: 10, flexWrap: "wrap"
              }}>
                {boardLabels.map((b, i) =>
                  <div key={b} style={{
                    padding: "13px 8px",
                    minWidth: 80,
                    background: COLORS.secondary,
                    borderRadius: 12,
                    fontSize: 16,
                    color: COLORS.primary,
                    marginBottom: 5,
                    boxShadow: "0 0 5px #3AA7D31c"
                  }}>
                    <div style={{ fontWeight: 600 }}>{b}</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{boardPercent[i]}%</div>
                  </div>
                )}
              </div>
            )}
          </section>
          <section style={chartCardStyle}>
            <h3 style={cardTitleStyle}>Mood Trend</h3>
            {sortedMoodTrend.length === 0 ? (
              <div style={{ color: COLORS.primary }}>— No data —</div>
            ) : (
              <div style={{
                display: "flex", alignItems: "end", minHeight: 70,
                marginLeft: 12, marginBottom: 6, gap: 0
              }}>
                {sortedMoodTrend.map((moodPt, i) => {
                  const mood = MOODS[moodPt.mood - 1];
                  return (
                    <span key={i} style={{
                      fontSize: 25 + moodPt.mood,
                      color: mood.color,
                      marginRight: 7,
                      marginLeft: 2,
                      opacity: 0.76 + 0.09 * (moodPt.mood) // stoked = most prominent
                    }}>{mood.label}</span>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }
  const chartCardStyle = {
    background: "#fff", borderRadius: 18, boxShadow: "0 2px 18px #20B2AA14",
    margin: "18px 0", padding: "18px 15px"
  };
  const cardTitleStyle = { fontSize: 18, color: COLORS.primary, fontWeight: 700, marginBottom: 7 };

  // ---- MAIN RENDER ----
  return (
    <div className="App" style={{ minHeight: "100vh", background: COLORS.light, color: COLORS.primary, position: "relative" }}>
      <button className="theme-toggle" onClick={toggleTheme}
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
        {theme === "light" ? "🌙 Dark" : "☀️ Light"}
      </button>
      {view === "home" && <HomeScreen />}
      {view === "log" && <LogSessionScreen />}
      {view === "stats" && <StatsScreen />}
      {view === "detail" && selectedSession && <SessionDetailScreen session={selectedSession} />}
      {showReminder && (
        <Modal onClose={() => setShowReminder(false)}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: 48,
              color: COLORS.primary,
              marginBottom: 12
            }}>🌊</div>
            <h2 style={{ margin: "6px 0 18px 0", color: COLORS.primary }}>
              Surf log reminder
            </h2>
            <p style={{ fontSize: 16, color: "#20B2AA", marginBottom: 0 }}>
              Don't forget to log your surf session today!
            </p>
            <button style={{
              marginTop: 16,
              background: COLORS.primary,
              borderRadius: 12, color: "#fff", border: "none",
              padding: "12px 32px", fontWeight: 700, fontSize: 17, cursor: "pointer"
            }} onClick={() => { setShowReminder(false); openLog(); }}>
              Log Session
            </button>
          </div>
        </Modal>
      )}
      {/* Responsive spacing for floating button */}
      <div style={{ height: 70 }} />
    </div>
  );
}

export default App;
