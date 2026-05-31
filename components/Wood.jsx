
const { useEffect, useRef, useState, useLayoutEffect } = React;

function useScrollProgress(ref) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      const passed = -rect.top;
      const raw = passed / total;
      setP(Math.max(0, Math.min(1, raw)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref]);
  return p;
}

function Reveal({ children, delay = 0, as = "div", className = "", ...rest }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setSeen(true)),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Tag = as;
  return (
    <Tag ref={ref} className={`reveal ${seen ? "in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

// ───── 3D Wooden Block ─────
function WoodBlock({ size = 240, rotate = 0, tilt = 12, className = "" }) {
  const s = size;
  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: s, height: s,
        transformStyle: "preserve-3d",
        transform: `rotateX(${tilt}deg) rotateY(${rotate}deg)`,
      }}
    >
      {/* front */}
      <div
        className="wood-grain"
        style={{
          position: "absolute", inset: 0,
          borderRadius: 14,
          boxShadow: "inset 0 2px 0 rgba(255,230,190,.25), inset 0 -3px 0 rgba(0,0,0,.3)",
        }}
      />
      {/* top face */}
      <div
        className="wood-grain endgrain"
        style={{
          position: "absolute", top: -s * 0.18, left: 0,
          width: s, height: s * 0.36,
          borderRadius: 14,
          transform: "rotateX(70deg) translateZ(8px)",
          transformOrigin: "bottom",
          boxShadow: "inset 0 -2px 6px rgba(0,0,0,.4)",
        }}
      />
      {/* right face */}
      <div
        className="wood-grain dark"
        style={{
          position: "absolute", top: 0, right: -s * 0.18,
          width: s * 0.36, height: s,
          borderRadius: 14,
          transform: "rotateY(70deg) translateX(0)",
          transformOrigin: "left",
          boxShadow: "inset -2px 0 6px rgba(0,0,0,.5)",
        }}
      />
    </div>
  );
}

// ───── Long wooden beam ─────
function WoodBeam({ height = 40, style = {}, ringCount = 0 }) {
  return (
    <div
      className="wood-grain"
      style={{
        height,
        borderRadius: height / 2,
        boxShadow:
          "inset 0 2px 0 rgba(255,230,190,.28), inset 0 -4px 0 rgba(0,0,0,.35), 0 18px 40px -25px rgba(0,0,0,.6)",
        position: "relative",
        ...style,
      }}
    >
      <div
        className="wood-grain endgrain"
        style={{
          position: "absolute",
          left: -height / 2 + 1,
          top: 0,
          width: height,
          height,
          borderRadius: "50%",
          boxShadow: "inset 0 0 12px rgba(0,0,0,.5)",
        }}
      />
      <div
        className="wood-grain endgrain"
        style={{
          position: "absolute",
          right: -height / 2 + 1,
          top: 0,
          width: height,
          height,
          borderRadius: "50%",
          boxShadow: "inset 0 0 12px rgba(0,0,0,.5)",
        }}
      />
    </div>
  );
}

// ───── Theme toggle ─────
function ThemeSwitch() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  return (
    <button
      className="theme-switch"
      aria-label="Toggle theme"
      onClick={() => setTheme(t => t === "light" ? "dark" : "light")}
    >
      <svg className="icon sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
      </svg>
      <svg className="icon moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
      <span className="knob" />
    </button>
  );
}

// ───── Rubik's Cube ─────
const RubiksCube = React.forwardRef(({ size = 360, rotX = -22, rotY = -28 }, ref) => {
  const innerRef = useRef(null);
  const cur = useRef({ x: rotX, y: rotY });
  const target = useRef({ x: rotX, y: rotY });

  React.useImperativeHandle(ref, () => ({
    setTarget: (x, y) => { target.current.x = x; target.current.y = y; }
  }), []);

  useEffect(() => {
    let raf;
    const animate = () => {
      cur.current.x += (target.current.x - cur.current.x) * 0.06;
      cur.current.y += (target.current.y - cur.current.y) * 0.06;
      if (innerRef.current) {
        innerRef.current.style.transform =
          `rotateX(${cur.current.x}deg) rotateY(${cur.current.y}deg)`;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  const half = size / 2;
  const gap = 2;
  const cell = (size - gap * 4) / 3;

  const Face = ({ transform }) => (
    <div
      style={{
        position: "absolute",
        width: size, height: size,
        left: 0, top: 0,
        transform,
        background: "#5a3f1f",
        borderRadius: 8,
        boxShadow: "inset 0 0 12px rgba(60,30,8,.45)",
        padding: gap,
        display: "grid",
        gridTemplateColumns: `repeat(3, 1fr)`,
        gridTemplateRows: `repeat(3, 1fr)`,
        gap: gap,
      }}
    >
      {Array.from({ length: 9 }).map((_, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const variant = (row + col + row + col) % 3;
        return (
        <div
          key={i}
          className={`wood-grain ${variant === 0 ? "" : variant === 1 ? "light" : "dark"}`}
          style={{
            borderRadius: 4,
            boxShadow:
              "inset 0 1px 0 rgba(255,230,190,.35), inset 0 -1px 0 rgba(90,55,20,.35), 0 1px 1px rgba(90,55,20,.25)",
            position: "relative",
          }}
        />
        );
      })}
    </div>
  );

  return (
    <div style={{ perspective: 1400, width: size, height: size }}>
      <div
        ref={innerRef}
        style={{
          position: "relative",
          width: size, height: size,
          transformStyle: "preserve-3d",
          transform: `rotateX(${cur.current.x}deg) rotateY(${cur.current.y}deg)`,
        }}
      >
        <Face transform={`translateZ(${half}px)`} />
        <Face transform={`rotateY(180deg) translateZ(${half}px)`} />
        <Face transform={`rotateY(90deg) translateZ(${half}px)`} />
        <Face transform={`rotateY(-90deg) translateZ(${half}px)`} />
        <Face transform={`rotateX(90deg) translateZ(${half}px)`} />
        <Face transform={`rotateX(-90deg) translateZ(${half}px)`} />
      </div>
    </div>
  );
});

Object.assign(window, { useScrollProgress, Reveal, WoodBlock, WoodBeam, ThemeSwitch, RubiksCube });
