/* Main portfolio page */

function MainPage({ onOpenProject }) {
  return (
    <main className="fade-enter">
      <Chrome />
      <ProgressBar />
      <Hero />
      <About />
      <Skills />
      <ProjectsList onOpenProject={onOpenProject} />
      <Education />
      <Contact />
    </main>);

}

function Chrome() {
  return (
    <div className="chrome">
      <div className="brand">
        <span className="dot" />
        <span>Anastasiia&nbsp;<em style={{ fontStyle: "italic" }}>K.</em></span>
      </div>
      <div className="nav-pill">
        <a href="#about">About</a>
        <span className="sep" />
        <a href="#skills">Skills</a>
        <span className="sep" />
        <a href="#projects">Work</a>
        <span className="sep" />
        <a href="#contact">Contact</a>
        <span className="sep" />
        <ThemeSwitch />
      </div>
    </div>);

}

function ProgressBar() {
  const [w, setW] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setW(max ? h.scrollTop / max * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div className="progress"><div className="fill" style={{ width: `${w}%` }} /></div>;
}

// ─────────── HERO ───────────
const HERO_CUBE_PARAMS = [
  { size: 64, tx:  0.025, ty: -0.035, rot:  0.012, baseRX: -18, baseRY: -32, scrollRX:  0.025, scrollRY:  0.045 },
  { size: 52, tx: -0.035, ty: -0.055, rot: -0.018, baseRX: -28, baseRY:  20, scrollRX: -0.020, scrollRY:  0.075 },
  { size: 72, tx:  0.050, ty: -0.025, rot:  0.022, baseRX:  12, baseRY: -44, scrollRX:  0.040, scrollRY:  0.025 },
  { size: 48, tx: -0.018, ty: -0.045, rot: -0.028, baseRX: -40, baseRY: -12, scrollRX:  0.055, scrollRY: -0.035 },
  { size: 58, tx:  0.030, ty: -0.065, rot:  0.032, baseRX:   6, baseRY:  48, scrollRX:  0.018, scrollRY:  0.060 },
];

function Hero() {
  const ref = useRef(null);
  const wrapperRefs = useRef([]);
  const cubeRefs = useRef([]);

  useEffect(() => {
    let raf;
    let smooth = window.scrollY;

    const tick = () => {
      const target = Math.min(window.scrollY, 600);
      smooth += (target - smooth) * 0.12;
      if (Math.abs(target - smooth) < 0.05) smooth = target;

      for (let i = 0; i < HERO_CUBE_PARAMS.length; i++) {
        const p = HERO_CUBE_PARAMS[i];
        const w = wrapperRefs.current[i];
        if (w) {
          w.style.transform =
            `translate3d(${(smooth * p.tx).toFixed(2)}px, ${(smooth * p.ty).toFixed(2)}px, 0) rotate(${(smooth * p.rot).toFixed(3)}deg)`;
        }
        const api = cubeRefs.current[i];
        if (api && api.setTarget) {
          api.setTarget(p.baseRX + smooth * p.scrollRX, p.baseRY + smooth * p.scrollRY);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="hero" ref={ref}>
      <div className="hero-meta">
        <span>Portfolio · 2026</span>
        <span>Index — 01</span>
      </div>

      <div className="hero-title">
        <h1 className="hero-name">
          Anastasiia<br />
          <span className="stroke">Krasnoshapka</span>
        </h1>

        <div className="hero-tagline">
          <span className="prefix">I'm a</span>
          <span className="emph">Unity Developer</span>
        </div>
      </div>

      <div className="hero-role">
        <div className="loc" style={{ height: "18px" }}>N 49.90 · W 97.14 </div>
        <div className="loc" style={{ height: "18px" }}>Winnipeg, MB</div>
      </div>

      <div className="hero-cubes" aria-hidden="true">
        {HERO_CUBE_PARAMS.map((p, i) => (
          <div
            key={i}
            className={`hero-cube hc-${i + 1}`}
            ref={(el) => { wrapperRefs.current[i] = el; }}>
            <RubiksCube
              size={p.size}
              rotX={p.baseRX}
              rotY={p.baseRY}
              ref={(api) => { cubeRefs.current[i] = api; }} />
          </div>
        ))}
      </div>

      <div className="scroll-hint">
        <span>Scroll</span>
        <span className="bar" />
      </div>
    </section>);

}

// ─────────── ABOUT ───────────
function About() {
  return (
    <section id="about">
      <Reveal>
        <div className="section-label">About — 02</div>
      </Reveal>
      <div className="about" style={{ marginTop: 40 }}>
        <div className="about-side">
          <Reveal delay={120}>
            <div className="about-stat">
              <div className="n">2</div>
              <div className="l">Years of experience</div>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="about-stat">
              <div className="n">3</div>
              <div className="l">Shipped Projects</div>
            </div>
          </Reveal>
          <Reveal delay={280}>
            <div className="about-stat">
              <div className="n">∞</div>
              <div className="l">Cups of tea</div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={80}>
          <p>
            I'm a <span className="em"> Unity developer </span>. Most of my work is on a
            pirate PC RPG and a couple of VR projects, which means I spend my days
            somewhere between quest logic, trade systems, and talking to
            colleagues to avoid the heartbreak of a merge conflict in scenes.
            I like problems that look simple until you pull on them, and the
            slow satisfaction of watching a system come together. Outside of
            work I like to read, run longer distances than feels reasonable,
            keep finding new things I want to learn, and socialize with
            people at local developer meetups.
          </p>
        </Reveal>
      </div>
    </section>);

}

// ─────────── SKILLS ───────────
const SKILLS = [
{ name: "Unity", cat: "Engine", num: "01" },
{ name: "C#", cat: "Language", num: "02" },
{ name: "Meta SDK", cat: "VR", num: "03" },
{ name: "XRI Toolkit", cat: "XR", num: "04" },
{ name: "Zenject", cat: "Framework", num: "05" },
{ name: "WebRTC", cat: "Networking", num: "06" },
{ name: "gRPC", cat: "Networking", num: "07" },
{ name: "Websockets", cat: "Networking", num: "08" },
{ name: "Blender", cat: "Modeling", num: "09" }];


function Skills() {
  return (
    <section id="skills" className="skills">
      <Reveal>
        <div className="section-label">Toolbox — 03</div>
      </Reveal>
      <Reveal delay={100}>
        <div className="skills-head" style={{ marginTop: 30 }}>
          <h2>What I <span className="it">work with</span></h2>
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "var(--ink-3)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            09 disciplines · cross-section
          </div>
        </div>
      </Reveal>
      <Reveal delay={200}>
        <div className="skills-grid">
          {SKILLS.map((s, i) =>
          <div key={s.name} className="disc-wrap">
              <div className="disc wood-disc">
                <div className="core">{s.name}</div>
              </div>
              <div className="disc-meta">
                <div className="num">/{s.num}</div>
                <div className="cat">{s.cat}</div>
              </div>
            </div>
          )}
        </div>
      </Reveal>
    </section>);

}

// ─────────── PROJECTS ───────────
const PROJECTS = [
{
  id: "corsairs_legacy",
  title: "Corsairs",
  titleIt: "Legacy",
  year: "2024-2026",
  tags: ["PC/Console", "Zenject", "Published to Steam"],
  role: "Unity Developer"
},
{
  id: "vr_projects",
  title: "VR&XR projects",
  titleIt: "",
  year: "2024",
  tags: ["VR/XR", "Meta SDK", "WebRTC", "gRPC", "WebSockets"],
  role: "Unity Developer"
}];


function ProjectsList({ onOpenProject }) {
  const [hover, setHover] = useState(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });

  return (
    <section id="projects" className="projects">
      <Reveal>
        <div className="section-label">Projects — 04</div>
      </Reveal>
      <Reveal delay={80}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "30px 0 50px" }}>
          <h2 style={{ fontFamily: "Instrument Serif, serif", fontSize: "clamp(56px, 7vw, 110px)", lineHeight: 0.95, letterSpacing: "-0.02em" }}>
            What I <span style={{ fontStyle: "italic", color: "var(--moss)" }}>worked on</span>
          </h2>
          {/* <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "var(--ink-3)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            {String(PROJECTS.length).padStart(2, "0")} of many
          </div> */}
        </div>
      </Reveal>

      <div className="projects-list"
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}>
        {PROJECTS.map((p, i) =>
        <div
          key={p.id}
          className="project-row"
          onMouseEnter={() => setHover(p.id)}
          onMouseLeave={() => setHover(null)}
          onClick={() => onOpenProject(p.id)}>
          
            <div className="idx">/0{i + 1}</div>
            <div className="title">{p.title} <em>{p.titleIt}</em></div>
            <div className="meta">
              <span>{p.year}</span>
              {p.tags.map((t) => <span key={t}>{t}</span>)}
            </div>
            <div className="arrow">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </div>
          </div>
        )}
      </div>

      <div
        className={`project-preview ${hover ? "show" : ""}`}
        style={{ left: cursor.x, top: cursor.y }}>
        
        <div className="wood-grain dark" style={{ position: "absolute", inset: 0 }}>
          <div style={{
            position: "absolute", inset: 12, background: "#0d0d0c", borderRadius: 2,
            display: "grid", placeItems: "center",
            color: "#faf6ed66", fontFamily: "JetBrains Mono, monospace",
            fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase"
          }}>
            {hover ? `${hover} · preview` : ""}
          </div>
        </div>
      </div>
    </section>);

}

// ─────────── EDUCATION ───────────
function Education() {
  return (
    <section id="education">
      <Reveal>
        <div className="section-label">Education — 05</div>
      </Reveal>
      <div className="education" style={{ marginTop: 40 }}>
        <Reveal delay={80}>
          <div className="education-side">
            <div className="diploma">
              <div className="label">B.S. — Computer Science</div>
              <div className="school">Kyiv Polytechnic Institute</div>
              <div className="deg">Software Engineering.</div>
              <div className="yr">2020 — 2024</div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={140}>
          <p>
            I studied computer science at KPI. There I took a graphics
            course and built a 3D game as a course project, and that became
            <span style={{ fontStyle: "italic", color: "var(--moss)" }}>&nbsp;the direction I wanted to keep moving in</span>. 
            University gave me a lot of useful skills, such as
            design principles, multithreading, and comfort with C#.
            But most of what I actually use day to day I learned after
            graduating, from the projects I got to work on, from feedback
            from my senior colleagues, and from trying things and fixing
            them when they break.
          </p>
        </Reveal>
      </div>
    </section>);

}

// ─────────── CONTACT ───────────
function Contact() {
  return (
    <section id="contact" className="contact">
      <Reveal>
        <div className="section-label">Contact — 06</div>
      </Reveal>

      <Reveal delay={100}>
        <h2 style={{ marginTop: 30 }}>
          Let's build<br />
          <span className="it">something cool</span><br />
        </h2>
      </Reveal>

      <Reveal delay={200}>
        <a className="contact-email" href="mailto:anastasiia.krasnoshapka@gmail.com" style={{ marginTop: 50 }}>
          anastasiia.krasnoshapka@gmail.com
          <span className="arrow">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7 17L17 7M9 7h8v8" />
            </svg>
          </span>
        </a>
      </Reveal>

      <div className="contact-grid">
        <Reveal delay={120}>
          <div>
            <div className="k">GitHub</div>
            <div className="v"><a href="https://github.com/Matiollo" target="_blank" rel="noopener noreferrer">github.com/Matiollo</a></div>
          </div>
        </Reveal>
        <Reveal delay={180}>
          <div>
            <div className="k">LinkedIn</div>
            <div className="v"><a href="https://www.linkedin.com/in/anastasiia-krasnoshapka/" target="_blank" rel="noopener noreferrer">in/anastasiia-krasnoshapka</a></div>
          </div>
        </Reveal>
      </div>

      <div className="foot">
        <span>© 2026 — BUILT AT 2 AM</span>
        <span>MADE WITH WOOD & TEA</span>
      </div>
    </section>);

}

Object.assign(window, { MainPage });