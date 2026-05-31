
function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  useEffect(() => {
    let tx = 0, ty = 0, rx = 0, ry = 0;
    let raf;
    const onMove = (e) => {
      tx = e.clientX; ty = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${tx - 3}px, ${ty - 3}px)`;
      }
      const target = e.target;
      const interactive = target && target.closest && target.closest("a, button, [role='button'], .project-row, .disc-wrap, .theme-switch, .steam-link");
      if (ringRef.current) ringRef.current.classList.toggle("hover", !!interactive);
    };
    const onLeave = () => {
      dotRef.current?.classList.add("hidden");
      ringRef.current?.classList.add("hidden");
    };
    const onEnter = () => {
      dotRef.current?.classList.remove("hidden");
      ringRef.current?.classList.remove("hidden");
    };
    const animate = () => {
      rx += (tx - rx) * 0.16;
      ry += (ty - ry) * 0.16;
      if (ringRef.current) {
        const w = ringRef.current.offsetWidth / 2;
        ringRef.current.style.transform = `translate(${rx - w}px, ${ry - w}px)`;
      }
      raf = requestAnimationFrame(animate);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("mouseenter", onEnter);
    raf = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <React.Fragment>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </React.Fragment>
  );
}

// ─── Loading screen ───
function Loader() {
  const [done, setDone] = useState(false);
  const [pct, setPct] = useState(0);
  useEffect(() => {
    let p = 0;
    const tick = setInterval(() => {
      p = Math.min(100, p + (8 + Math.random() * 12));
      setPct(p);
      if (p >= 100) {
        clearInterval(tick);
        setTimeout(() => setDone(true), 350);
      }
    }, 140);
    return () => clearInterval(tick);
  }, []);
  return (
    <div className={`loader ${done ? "done" : ""}`}>
      <div className="ring-stack">
        <svg viewBox="0 0 140 140"><circle className="r" cx="70" cy="70" r="14"/></svg>
        <svg viewBox="0 0 140 140"><circle className="r" cx="70" cy="70" r="26"/></svg>
        <svg viewBox="0 0 140 140"><circle className="r" cx="70" cy="70" r="40"/></svg>
        <svg viewBox="0 0 140 140"><circle className="r" cx="70" cy="70" r="54"/></svg>
        <svg viewBox="0 0 140 140"><circle className="r" cx="70" cy="70" r="68"/></svg>
        <span className="core-dot" />
      </div>
      <div className="name">Anastasiia <span className="it">Krasnoshapka</span></div>
      <div className="label">
        <span>Loading</span>
        <span className="bar" style={{ "--p": pct + "%" }} />
        <span>{String(Math.floor(pct)).padStart(3, "0")}</span>
      </div>
    </div>
  );
}

function App() {
  const [route, setRoute] = useState(() => {
    const h = window.location.hash;
    if (h.startsWith("#project/")) return { name: "project", id: h.replace("#project/", "") };
    return { name: "main" };
  });

  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash;
      const isProject = h.startsWith("#project/");
      const isMainRoute = h === "" || h === "#" || isProject;
      if (!isMainRoute) return;
      if (isProject) setRoute({ name: "project", id: h.replace("#project/", "") });
      else setRoute({ name: "main" });
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const openProject = (id) => {
    window.location.hash = `project/${id}`;
  };
  const back = () => {
    window.location.hash = "";
  };

  return (
    <React.Fragment>
      <Loader />
      <CustomCursor />
      {route.name === "project"
        ? <ProjectPage id={route.id} onBack={back} />
        : <MainPage onOpenProject={openProject} />}
    </React.Fragment>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
