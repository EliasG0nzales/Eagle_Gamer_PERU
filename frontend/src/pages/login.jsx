import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const EAGLE_LOGO = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiBocmg0ZVPn-wZHzRpimfCLHYFPfrbdsmQQ&s";

const getStyles = (oscuro) => `
  @import url("https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700&display=swap");
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${oscuro ? "#0a0a0f" : "#f0f2f8"}; transition: background 0.4s ease; }

  .login-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${oscuro ? "#0a0a0f" : "#f0f2f8"};
    font-family: "DM Mono", monospace;
    position: relative;
    overflow: hidden;
    transition: background 0.4s ease;
  }

  /* ── Fondo animado ── */
  .login-bg { position: absolute; inset: 0; pointer-events: none; }
  .login-bg__circle {
    position: absolute; border-radius: 50%;
    filter: blur(80px);
    opacity: ${oscuro ? "0.28" : "0.18"};
  }
  .login-bg__circle--1 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, #6c63ff 0%, transparent 70%);
    top: -160px; left: -140px;
    animation: drift1 14s ease-in-out infinite alternate;
  }
  .login-bg__circle--2 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, #a78bfa 0%, transparent 70%);
    bottom: -120px; right: -100px;
    animation: drift2 18s ease-in-out infinite alternate-reverse;
  }
  .login-bg__circle--3 {
    width: 300px; height: 300px;
    background: radial-gradient(circle, #22d3ee 0%, transparent 70%);
    top: 50%; left: 60%;
    animation: drift1 20s ease-in-out infinite alternate;
    opacity: ${oscuro ? "0.12" : "0.08"};
  }
  @keyframes drift1 {
    from { transform: translate(0,0) scale(1); }
    to   { transform: translate(40px,30px) scale(1.08); }
  }
  @keyframes drift2 {
    from { transform: translate(0,0) scale(1.05); }
    to   { transform: translate(-30px,-20px) scale(1); }
  }

  .login-bg__grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(${oscuro ? "rgba(255,255,255,0.05)" : "rgba(108,99,255,0.06)"} 1px, transparent 1px),
      linear-gradient(90deg, ${oscuro ? "rgba(255,255,255,0.05)" : "rgba(108,99,255,0.06)"} 1px, transparent 1px);
    background-size: 48px 48px;
    opacity: 0.5;
  }

  /* Canvas de partículas */
  .login-particles { position: absolute; inset: 0; pointer-events: none; }

  /* ── Card ── */
  .login-card {
    position: relative; z-index: 10;
    width: 100%; max-width: 440px;
    background: ${oscuro ? "#13131a" : "#ffffff"};
    border: 1px solid ${oscuro ? "rgba(255,255,255,0.08)" : "rgba(108,99,255,0.12)"};
    border-radius: 20px;
    padding: 48px 40px 40px;
    box-shadow: ${oscuro
      ? "0 0 0 1px rgba(108,99,255,0.15), 0 32px 80px rgba(0,0,0,0.6), 0 0 40px rgba(108,99,255,0.08)"
      : "0 0 0 1px rgba(108,99,255,0.08), 0 32px 80px rgba(108,99,255,0.12), 0 8px 32px rgba(0,0,0,0.08)"
    };
    animation: cardIn 0.5s cubic-bezier(0.16,1,0.3,1) both;
    transition: background 0.4s ease, box-shadow 0.4s ease;
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(28px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* ── Marca ── */
  .login-brand {
    display: flex; align-items: center; gap: 12px; margin-bottom: 36px;
  }
  .login-brand__logo {
    width: 44px; height: 44px; border-radius: 10px;
    object-fit: contain;
    background: ${oscuro ? "#1c1c26" : "#f0f0f8"};
    padding: 4px;
    border: 1px solid ${oscuro ? "rgba(255,255,255,0.08)" : "rgba(108,99,255,0.12)"};
  }
  .login-brand__text { display: flex; flex-direction: column; gap: 1px; }
  .login-brand__name {
    font-family: "Syne", sans-serif; font-size: 14px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: ${oscuro ? "#e8e8f0" : "#1a1a2e"};
  }
  .login-brand__sub {
    font-size: 10px; color: ${oscuro ? "#6b6b80" : "#5a5a70"};
    letter-spacing: 0.06em; text-transform: uppercase;
  }

  /* ── Título ── */
  .login-title {
    font-family: "Syne", sans-serif; font-size: 30px; font-weight: 700;
    color: ${oscuro ? "#e8e8f0" : "#1a1a2e"}; margin-bottom: 8px;
    line-height: 1.2;
  }
  .login-title span {
    background: linear-gradient(135deg, #6c63ff, #a78bfa);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .login-subtitle {
    font-size: 13px; color: ${oscuro ? "#6b6b80" : "#5a5a70"};
    margin-bottom: 36px; line-height: 1.5;
  }

  /* ── Formulario ── */
  .login-form { display: flex; flex-direction: column; gap: 20px; }
  .login-field { display: flex; flex-direction: column; gap: 8px; }
  .login-label {
    font-size: 11px; font-weight: 500; letter-spacing: 0.1em;
    text-transform: uppercase; color: ${oscuro ? "#6b6b80" : "#5a5a70"};
  }
  .login-input-wrap { position: relative; }
  .login-input {
    width: 100%;
    background: ${oscuro ? "#1c1c26" : "#f5f5fa"};
    border: 1px solid ${oscuro ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"};
    border-radius: 10px;
    color: ${oscuro ? "#e8e8f0" : "#1a1a2e"};
    font-family: "DM Mono", monospace; font-size: 14px;
    padding: 13px 16px; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.3s;
  }
  .login-input.has-toggle { padding-right: 48px; }
  .login-input::placeholder { color: ${oscuro ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.25)"}; }
  .login-input:focus {
    border-color: #6c63ff;
    box-shadow: 0 0 0 3px rgba(108,99,255,0.15);
    background: ${oscuro ? "#1e1e2e" : "#ffffff"};
  }

  /* Botón ojo */
  .login-eye {
    position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    color: ${oscuro ? "#6b6b80" : "#5a5a70"};
    font-size: 16px; padding: 4px;
    transition: color 0.2s;
    display: flex; align-items: center;
  }
  .login-eye:hover { color: #6c63ff; }

  /* Error */
  .login-error {
    font-size: 12px; color: #ff5e6c;
    background: rgba(255,94,108,0.08);
    border: 1px solid rgba(255,94,108,0.2);
    border-radius: 8px; padding: 10px 14px;
    animation: shake 0.4s ease;
  }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%,60%  { transform: translateX(-6px); }
    40%,80%  { transform: translateX(6px); }
  }

  /* Botón ingresar */
  .login-btn {
    margin-top: 4px;
    background: linear-gradient(135deg, #6c63ff, #a78bfa);
    border: none; border-radius: 10px; color: #fff; cursor: pointer;
    font-family: "Syne", sans-serif; font-size: 15px; font-weight: 600;
    letter-spacing: 0.04em; padding: 15px;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(108,99,255,0.3);
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .login-btn:hover:not(:disabled) {
    opacity: 0.92;
    box-shadow: 0 6px 28px rgba(108,99,255,0.45);
    transform: translateY(-2px);
  }
  .login-btn:active:not(:disabled) { transform: translateY(0); }
  .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  /* Spinner */
  .login-spinner {
    display: inline-block; width: 18px; height: 18px;
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: #fff; border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Footer */
  .login-footer {
    margin-top: 28px; font-size: 12px;
    color: ${oscuro ? "#6b6b80" : "#5a5a70"};
    text-align: center; line-height: 1.6;
  }

  /* Toggle tema */
  .login-theme-btn {
    position: fixed; top: 20px; right: 20px; z-index: 100;
    background: ${oscuro ? "#13131a" : "#ffffff"};
    border: 1px solid ${oscuro ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"};
    border-radius: 50%; width: 40px; height: 40px;
    cursor: pointer; font-size: 18px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    transition: all 0.2s;
  }
  .login-theme-btn:hover { transform: scale(1.1); box-shadow: 0 6px 20px rgba(108,99,255,0.25); }

  /* Divider */
  .login-divider {
    display: flex; align-items: center; gap: 12px; margin: 4px 0;
  }
  .login-divider::before, .login-divider::after {
    content: ''; flex: 1; height: 1px;
    background: ${oscuro ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"};
  }
  .login-divider span {
    font-size: 11px; color: ${oscuro ? "#6b6b80" : "#5a5a70"};
  }

  @media (max-width: 480px) {
    .login-card { margin: 16px; padding: 36px 24px 32px; }
  }
`;

// Componente de partículas con canvas
function Particles({ oscuro }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height,
      r:    Math.random() * 2 + 0.5,
      dx:   (Math.random() - 0.5) * 0.4,
      dy:   (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = oscuro
          ? `rgba(108,99,255,${p.alpha})`
          : `rgba(108,99,255,${p.alpha * 0.6})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, [oscuro]);

  return <canvas ref={canvasRef} className="login-particles" />;
}

export default function Login() {
  const [form,       setForm]       = useState({ email: "", password: "" });
  const [error,      setError]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [showPass,   setShowPass]   = useState(false);
  const [oscuro,     setOscuro]     = useState(() => {
    const saved = localStorage.getItem("eagle-tema");
    return saved !== null ? saved === "oscuro" : true;
  });

  const { login }  = useContext(AuthContext);
  const navigate   = useNavigate();

  const toggleTema = () => {
    const nuevo = !oscuro;
    setOscuro(nuevo);
    localStorage.setItem("eagle-tema", nuevo ? "oscuro" : "claro");
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{getStyles(oscuro)}</style>

      {/* Botón tema */}
      <button className="login-theme-btn" onClick={toggleTema} title="Cambiar tema">
        {oscuro ? "☀️" : "🌙"}
      </button>

      <div className="login-root">
        <div className="login-bg">
          <div className="login-bg__circle login-bg__circle--1" />
          <div className="login-bg__circle login-bg__circle--2" />
          <div className="login-bg__circle login-bg__circle--3" />
          <div className="login-bg__grid" />
        </div>

        <Particles oscuro={oscuro} />

        <div className="login-card">

          {/* Marca con logo */}
          <div className="login-brand">
            <img
              src={EAGLE_LOGO}
              alt="Eagle Gaming"
              className="login-brand__logo"
              onError={e => { e.target.style.display="none"; }}
            />
            <div className="login-brand__text">
              <span className="login-brand__name">Eagle Gaming</span>
              <span className="login-brand__sub">Peru · Sistema de Inventario</span>
            </div>
          </div>

          <h1 className="login-title">
            Bienvenido <span>de vuelta</span>
          </h1>
          <p className="login-subtitle">
            Ingresa tus credenciales para acceder al sistema
          </p>

          <form className="login-form" onSubmit={handleSubmit}>

            {/* Email */}
            <div className="login-field">
              <label className="login-label" htmlFor="email">
                Correo electronico
              </label>
              <div className="login-input-wrap">
                <input
                  id="email"
                  className="login-input"
                  type="email"
                  name="email"
                  placeholder="correo@ejemplo.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password con toggle */}
            <div className="login-field">
              <label className="login-label" htmlFor="password">
                Contrasena
              </label>
              <div className="login-input-wrap">
                <input
                  id="password"
                  className="login-input has-toggle"
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="login-eye"
                  onClick={() => setShowPass(!showPass)}
                  title={showPass ? "Ocultar" : "Mostrar"}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && <p className="login-error">⚠ {error}</p>}

            <button
              className="login-btn"
              type="submit"
              disabled={loading}
            >
              {loading
                ? <><span className="login-spinner" /> Verificando...</>
                : "🚀 Ingresar al Sistema"
              }
            </button>

          </form>

          <div className="login-divider" style={{marginTop:"24px"}}>
            <span>Eagle Gaming System v2.0</span>
          </div>

          <p className="login-footer">
            ¿Problemas para acceder? Contacta al administrador
          </p>
        </div>
      </div>
    </>
  );
}