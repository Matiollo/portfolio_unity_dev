
const PROJECT_DATA = {
  corsairs_legacy: {
    title: "Corsairs ",
    titleIt: "Legacy",
    tagline: "A large-scale RPG set in the Caribbean with islands to sail to, economies that respond to player choice, and hundreds of quests woven together. Every system had to hold across dozens of hours without unraveling.",
    meta: [
    { k: "Role", v: "Unity Developer" },
    { k: "Year", v: "2024-2026" },
    { k: "Platform", v: "PC/Console" },
    { k: "Team", v: "5 people" }],

    screens: [
    { caption: "01 — Name", label: "Something something label" },
    { caption: "02 — Name", label: "Something something label" },
    { caption: "03 — Name", label: "Something something label" },
    { caption: "04 — Name", label: "Something something label" },
    { caption: "05 — Name", label: "Something something label" }],

    narrative: [
    {
      h: "The brief",
      hi: "",
      p: [
      "Corsairs Legacy started as a 48-hour jam piece and grew into an 18-month effort to make wood feel real in VR — not photoreal, but truthful. The player wakes in a quiet carpenter's workshop and rebuilds it tool by tool, plank by plank.",
      "I owned the Unity side end-to-end: hand-interaction systems, the carving and joining mechanics, the wood-grain shader, and the audio-reactive lighting that lets the workshop breathe."]

    },
    {
      h: "What was",
      hi: "hard",
      p: [
      "Hand-tracking on Quest 3 is generous when you palm a thing and brutal when you pinch one. The carving mechanic — drag a chisel along a plank, feel it bite — required a custom contact model on top of Meta SDK that could survive lossy tracking without producing nausea.",
      "I built a hybrid system that snapped intent to a tool's affordance frame for the first 60ms of contact, then handed off to physics once the player committed. Net result: 35% fewer mis-fires in playtests and zero motion-sickness reports."]

    },
    {
      h: "How I",
      hi: "shipped it",
      p: [
      "Zenject kept the scene composition sane as the workshop grew — every tool, plank, and ambient sound source was injected, which made our weekly playtests something I could rearrange in a morning.",
      "The grain shader samples a tri-planar noise stack and bakes per-plank tangent fields offline in Blender, so a carved cut respects the wood's history rather than the chisel's angle."]

    }],

    steam: "https://store.steampowered.com/"
  },
  vr_projects: {
    title: "Loom",
    titleIt: "space",
    tagline: "A multiplayer XR canvas where remote teams sketch, model, and review 3D work together. Real-time, low-latency, and quiet enough to actually think in.",
    meta: [
    { k: "Role", v: "Unity Engineer" },
    { k: "Year", v: "2024" },
    { k: "Platform", v: "Quest + PC mirror" },
    { k: "Team", v: "8 people" }],

    screens: [
    { caption: "01 — Shared canvas session", label: "Co-presence canvas" },
    { caption: "02 — Voice + spatial pointer", label: "Voice + pointer prototype" },
    { caption: "03 — gRPC sync layer", label: "Net-sync diagnostics" },
    { caption: "04 — Avatar handoff", label: "Avatar / asset handoff" },
    { caption: "05 — Review mode", label: "Review mode UI" }],

    narrative: [
    {
      h: "The brief",
      hi: "",
      p: [
      "Loomspace is a multiplayer 3D review tool — imagine a quiet workshop where four people from four cities can lay a model on a table, walk around it, mark it up, and actually hear each other.",
      "I joined to rebuild the networking stack. The existing one used naive RPCs over Photon and fell apart past three avatars. I replaced it with a gRPC + WebRTC hybrid that keeps spatial state on one channel and voice on another."]

    },
    {
      h: "The networking",
      hi: "puzzle",
      p: [
      "The hardest part wasn't latency — it was reconciling conflicting truths. When two people grab the same model at the same instant, who wins? We landed on a lightweight CRDT for transform state and an authoritative referee for ownership handoffs.",
      "Voice rides WebRTC for sub-100ms; transforms ride a custom websocket frame; bulky assets get torn down into chunks and streamed via gRPC. Each lane plays to its strengths and they only meet at the avatar level."]

    },
    {
      h: "What I learned",
      hi: "",
      p: [
      "Networking is mostly about boundaries — what crosses them, when, and at what cost. Most of the engineering was deleting code and pushing concerns to the right side of the wire.",
      "Loomspace went from a stuttery demo with 3-person ceiling to a 12-person review room that runs glassy on Quest. It's still my favorite kind of problem: invisible when it works."]

    }],

    steam: "https://store.steampowered.com/"
  }
};

function ProjectPage({ id, onBack }) {
  const data = PROJECT_DATA[id];
  if (!data) return null;

  return (
    <main className="project-page fade-enter">
      <ProjectChrome onBack={onBack} />

      <section className="project-hero">
        <div>
          <div className="section-label" style={{ marginBottom: 20 }}>Project — {id === "aetherwood" ? "01" : "02"} / 02</div>
          <h1>
            {data.title}<span className="it">{data.titleIt}</span>
          </h1>
        </div>
        <p className="project-tagline">{data.tagline}</p>
      </section>

      <section className="project-meta">
        {data.meta.map((m) =>
        <div key={m.k}>
            <div className="k">{m.k}</div>
            <div className="v">{m.v}</div>
          </div>
        )}
      </section>

      <ScreenshotScroller screens={data.screens} title={data.title + data.titleIt} />

      <section className="narrative">
        <div className="section-label" style={{ alignSelf: "start" }}>Case study</div>
        <div className="body">
          {data.narrative.map((n, i) =>
          <Reveal key={i} delay={i * 80}>
              <div className="narrative-item">
                <h3>{n.h} {n.hi && <span className="it">{n.hi}</span>}</h3>
                {n.p.map((para, j) => <p key={j}>{para}</p>)}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <section className="steam-cta">
        <div className="eyebrow">Play it</div>
        <a className="steam-link" href={data.steam} target="_blank" rel="noopener">
          <span>View on <span className="it">Steam</span></span>
          <span className="arrow">
            <svg width="34%" height="34%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7 17L17 7M9 7h8v8" />
            </svg>
          </span>
        </a>
        <div className="steam-sub">
          <span className="dot" />
          <span>store.steampowered.com / {data.title.toLowerCase()}{data.titleIt.toLowerCase()}</span>
        </div>
      </section>
    </main>);

}

function ProjectChrome({ onBack }) {
  return (
    <div className="project-chrome">
      <a className="back-btn" href="#" onClick={(e) => {e.preventDefault();onBack();}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to index
      </a>
      <div className="nav-pill">
        <span style={{ color: "var(--ink-3)" }}>Anastasiia · Portfolio</span>
        <span className="sep" />
        <ThemeSwitch />
      </div>
    </div>);

}

// ──────────── Horizontal scroll for screenshots ────────────
function ScreenshotScroller({ screens, title }) {
  const ref = useRef(null);
  const trackRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (!ref.current || !trackRef.current) return;
      const rect = ref.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      const passed = -rect.top;
      const p = Math.max(0, Math.min(1, passed / total));
      setProgress(p);
      const trackW = trackRef.current.scrollWidth;
      const moveX = (trackW - window.innerWidth) * p;
      trackRef.current.style.transform = `translateX(${-moveX}px)`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [screens.length]);

  const sectionHeight = `${100 + screens.length * 70}vh`;

  const currentIdx = Math.min(screens.length - 1, Math.floor(progress * screens.length));

  return (
    <section className="screens-section" style={{ height: sectionHeight }}>
      <div className="screens-stage">
        <div className="screen-counter">
          {String(currentIdx + 1).padStart(2, "0")} <span style={{ color: "var(--rule-strong)" }}>/</span> {String(screens.length).padStart(2, "0")} — {title}
        </div>
        <div className="screens-track" ref={trackRef}>
          <div style={{ flex: "0 0 4vw" }} />
          {screens.map((s, i) => {
            const idxProgress = progress * screens.length;
            const dist = i - idxProgress + 0.5;
            const tilt = Math.max(-6, Math.min(6, dist * -3));
            const scale = Math.max(0.92, 1 - Math.abs(dist) * 0.04);
            return (
              <div
                key={i}
                className="screen-frame"
                style={{ transform: `rotate(${tilt}deg) scale(${scale})`, padding: "16px 16px 18px" }}>
                
                <div className="image">
                  <div className="ph">{s.label}</div>
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(180deg, rgba(255,255,255,.04), transparent 30%, transparent 70%, rgba(0,0,0,.4))",
                    pointerEvents: "none"
                  }} />
                </div>
                <div className="screen-caption">{s.caption}</div>
              </div>);

          })}
          <div style={{ flex: "0 0 4vw" }} />
        </div>
      </div>
      <div ref={ref} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
    </section>);

}

Object.assign(window, { ProjectPage });