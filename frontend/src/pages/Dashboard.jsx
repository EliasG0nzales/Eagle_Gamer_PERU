import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const COLORS = ["#6c63ff","#34d399","#fbbf24","#f472b6","#22d3ee","#fb923c","#a78bfa","#4ade80","#38bdf8","#e879f9","#f87171","#60a5fa"];
const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
const EAGLE_LOGO = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiBocmg0ZVPn-wZHzRpimfCLHYFPfrbdsmQQ&sg";

const getDarkStyles = () => `
  @import url("https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=DM+Mono:wght@300;400;500&display=swap");
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0a0f; font-family: "DM Mono", monospace; transition: background 0.3s ease; }
  .dash-root { display: flex; min-height: 100vh; background: #0a0a0f; transition: background 0.3s ease; }
  .sidebar { width: 220px; min-height: 100vh; background: #13131a; border-right: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; padding: 24px 0; position: fixed; top: 0; left: 0; z-index: 100; transition: background 0.3s ease; }
  .sidebar-brand { display: flex; align-items: center; gap: 10px; padding: 0 20px 28px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 16px; }
  .sidebar-brand__icon { font-size: 20px; color: #a78bfa; }
  .sidebar-brand__name { font-family: "Syne", sans-serif; font-size: 13px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #e8e8f0; }
  .sidebar-nav { display: flex; flex-direction: column; gap: 4px; padding: 0 12px; flex: 1; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; cursor: pointer; font-size: 13px; color: #6b6b80; transition: all .2s; border: none; background: none; width: 100%; text-align: left; }
  .nav-item:hover { background: rgba(255,255,255,0.04); color: #e8e8f0; }
  .nav-item.active { background: rgba(108,99,255,0.15); color: #a78bfa; }
  .nav-item__icon { font-size: 16px; width: 20px; text-align: center; }
  .sidebar-footer { padding: 16px 12px 0; border-top: 1px solid rgba(255,255,255,0.06); margin-top: auto; }
  .logout-btn { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; cursor: pointer; font-size: 13px; color: #ff5e6c; background: none; border: none; width: 100%; transition: background .2s; }
  .logout-btn:hover { background: rgba(255,94,108,0.08); }
  .dash-main { margin-left: 220px; flex: 1; padding: 32px; transition: background 0.3s ease; }
  .dash-header { margin-bottom: 28px; }
  .dash-header h1 { font-family: "Syne", sans-serif; font-size: 22px; font-weight: 700; color: #e8e8f0; }
  .dash-header p { font-size: 12px; color: #6b6b80; margin-top: 4px; }
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px,1fr)); gap: 14px; margin-bottom: 28px; }
  .stat-card { background: #13131a; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 18px 20px; border-left: 3px solid; transition: background 0.3s ease; }
  .stat-card__label { font-size: 11px; color: #6b6b80; letter-spacing: .06em; text-transform: uppercase; margin-bottom: 8px; }
  .stat-card__value { font-family: "Syne", sans-serif; font-size: 28px; font-weight: 700; color: #e8e8f0; }
  .stat-card__sub { font-size: 11px; color: #6b6b80; margin-top: 4px; }
  .table-section { background: #13131a; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; overflow: hidden; margin-bottom: 24px; transition: background 0.3s ease; }
  .table-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .table-header h2 { font-family: "Syne", sans-serif; font-size: 15px; font-weight: 600; color: #e8e8f0; }
  .table-actions { display: flex; gap: 8px; }
  .btn { padding: 7px 14px; border-radius: 7px; font-size: 12px; cursor: pointer; border: none; font-family: "DM Mono", monospace; transition: all .2s; }
  .btn-primary { background: #6c63ff; color: #fff; }
  .btn-primary:hover { background: #7c74ff; }
  .btn-outline { background: transparent; color: #6b6b80; border: 1px solid rgba(255,255,255,0.1); }
  .btn-outline:hover { color: #e8e8f0; border-color: rgba(255,255,255,0.2); }
  .btn-outline:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-print { background: transparent; color: #34d399; border: 1px solid rgba(52,211,153,0.2); }
  .btn-print:hover { background: rgba(52,211,153,0.08); }
  .btn-danger { background: transparent; color: #ff5e6c; border: 1px solid rgba(255,94,108,0.2); padding: 3px 8px; font-size: 11px; }
  .btn-danger:hover { background: rgba(255,94,108,0.08); }
  .search-bar { display: flex; gap: 10px; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .search-input { flex: 1; background: #1c1c26; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: #e8e8f0; font-family: "DM Mono",monospace; font-size: 13px; padding: 9px 14px; outline: none; transition: all 0.3s ease; }
  .search-input:focus { border-color: #6c63ff; }
  .search-input::placeholder { color: rgba(255,255,255,0.2); }
  .filter-select { background: #1c1c26; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: #e8e8f0; font-family: "DM Mono",monospace; font-size: 13px; padding: 9px 14px; outline: none; min-width: 180px; transition: all 0.3s ease; }
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead th { padding: 10px 16px; text-align: left; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: #6b6b80; border-bottom: 1px solid rgba(255,255,255,0.06); }
  tbody tr { border-bottom: 1px solid rgba(255,255,255,0.04); transition: background .15s; }
  tbody tr:hover { background: rgba(255,255,255,0.02); }
  tbody td { padding: 11px 16px; color: #c8c8d8; }
  tbody td input { background: transparent; border: 1px solid transparent; border-radius: 4px; color: #e8e8f0; font-family: "DM Mono", monospace; font-size: 13px; padding: 3px 6px; width: 100%; transition: border-color .2s; }
  tbody td input:focus { outline: none; border-color: #6c63ff; background: rgba(108,99,255,0.08); }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 11px; }
  .badge-gpu { background: rgba(108,99,255,0.15); color: #a78bfa; }
  .badge-monitor { background: rgba(52,211,153,0.12); color: #34d399; }
  .badge-cpu { background: rgba(251,191,36,0.12); color: #fbbf24; }
  .badge-ram { background: rgba(236,72,153,0.12); color: #f472b6; }
  .badge-other { background: rgba(107,107,128,0.15); color: #9ca3af; }
  .prov-form { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .prov-input { background: #1c1c26; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: #e8e8f0; font-family: "DM Mono", monospace; font-size: 13px; padding: 10px 14px; outline: none; transition: all 0.3s ease; }
  .prov-input:focus { border-color: #6c63ff; }
  .prov-input::placeholder { color: rgba(255,255,255,0.2); }
  .mov-form { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .mov-select { background: #1c1c26; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: #e8e8f0; font-family: "DM Mono", monospace; font-size: 13px; padding: 10px 14px; outline: none; transition: all 0.3s ease; }
  .alerta-stock { background: rgba(255,94,108,0.08); border: 1px solid rgba(255,94,108,0.2); border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; font-size: 12px; color: #ff5e6c; line-height: 1.8; }
  .alerta-stock h4 { font-family: "Syne",sans-serif; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
  .filtro-fecha { display: flex; gap: 10px; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); align-items: center; }
  .filtro-fecha label { font-size: 11px; color: #6b6b80; text-transform: uppercase; letter-spacing: .06em; white-space: nowrap; }
  .filtro-fecha input { background: #1c1c26; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: #e8e8f0; font-family: "DM Mono",monospace; font-size: 13px; padding: 8px 12px; outline: none; transition: all 0.3s ease; }
  .filtro-fecha input:focus { border-color: #6c63ff; }
  .chart-card { background: #13131a; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px; transition: background 0.3s ease; }
  .chart-card h3 { font-family: "Syne",sans-serif; font-size: 14px; font-weight: 600; color: #e8e8f0; margin-bottom: 4px; }
  .chart-card p { font-size: 11px; color: #6b6b80; margin-bottom: 14px; }
  .toast { position: fixed; top: 24px; right: 24px; z-index: 999; background: #13131a; border: 1px solid rgba(52,211,153,0.3); border-radius: 10px; padding: 14px 18px; font-size: 13px; color: #34d399; box-shadow: 0 8px 32px rgba(0,0,0,0.4); animation: toastIn .3s ease; max-width: 320px; line-height: 1.6; }
  .toast.error { border-color: rgba(255,94,108,0.3); color: #ff5e6c; }
  @keyframes toastIn { from { opacity:0; transform: translateY(-12px); } to { opacity:1; transform: none; } }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 300; display: flex; align-items: center; justify-content: center; animation: fadeIn .2s ease; }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  .modal { background: #13131a; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 32px; width: 100%; max-width: 500px; box-shadow: 0 32px 80px rgba(0,0,0,0.6); animation: slideUp .25s cubic-bezier(.16,1,.3,1); }
  @keyframes slideUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: none; } }
  .modal h2 { font-family: "Syne",sans-serif; font-size: 18px; font-weight: 700; color: #e8e8f0; margin-bottom: 6px; }
  .modal-subtitle { font-size: 12px; color: #6b6b80; margin-bottom: 24px; }
  .modal-form { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .modal-field { display: flex; flex-direction: column; gap: 6px; }
  .modal-field label { font-size: 11px; color: #6b6b80; letter-spacing: .06em; text-transform: uppercase; }
  .modal-input { background: #1c1c26; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: #e8e8f0; font-family: "DM Mono",monospace; font-size: 13px; padding: 10px 14px; outline: none; }
  .modal-input:focus { border-color: #6c63ff; box-shadow: 0 0 0 3px rgba(108,99,255,0.15); }
  .modal-input::placeholder { color: rgba(255,255,255,0.2); }
  .modal-select { background: #1c1c26; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: #e8e8f0; font-family: "DM Mono",monospace; font-size: 13px; padding: 10px 14px; outline: none; width: 100%; }
  .modal-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px; }
  .typing-dots span { animation: blink 1.4s infinite; display: inline-block; }
  .typing-dots span:nth-child(2) { animation-delay: .2s; }
  .typing-dots span:nth-child(3) { animation-delay: .4s; }
  @keyframes blink { 0%,80%,100% { opacity:0; } 40% { opacity:1; } }
  .chatbot { position: fixed; bottom: 24px; right: 24px; z-index: 200; }
  .chat-toggle { width: 58px; height: 58px; border-radius: 50%; background: linear-gradient(135deg, #6c63ff, #a78bfa); border: none; cursor: pointer; overflow: hidden; box-shadow: 0 0 0 0 rgba(108,99,255,0.4), 0 4px 20px rgba(108,99,255,0.5); transition: transform .2s; display: flex; align-items: center; justify-content: center; animation: pulseLed 2s infinite; }
  .chat-toggle img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
  .chat-toggle:hover { transform: scale(1.1); }
  @keyframes pulseLed { 0% { box-shadow: 0 0 0 0 rgba(108,99,255,0.5), 0 4px 20px rgba(108,99,255,0.4); } 70% { box-shadow: 0 0 0 14px rgba(108,99,255,0), 0 4px 20px rgba(108,99,255,0.4); } 100% { box-shadow: 0 0 0 0 rgba(108,99,255,0), 0 4px 20px rgba(108,99,255,0.4); } }
  .chat-window { position: absolute; bottom: 64px; right: 0; width: 380px; height: 690px; border-radius: 44px; overflow: hidden; display: flex; flex-direction: column; animation: chatIn .25s cubic-bezier(.16,1,.3,1); background: linear-gradient(180deg, #0d1117 0%, #0a0a1a 100%); position: relative; box-shadow: 0 0 0 2px rgba(108,99,255,0.6), 0 0 30px rgba(108,99,255,0.4), 0 0 60px rgba(167,139,250,0.2), 0 30px 80px rgba(0,0,0,0.8); }
  .chat-window::before { content: ''; position: absolute; inset: -2px; border-radius: 46px; background: linear-gradient(135deg, #6c63ff 0%, #a78bfa 20%, #22d3ee 40%, #34d399 50%, #22d3ee 60%, #f472b6 80%, #6c63ff 100%); background-size: 400% 400%; animation: ledBorder 3s linear infinite; z-index: -1; pointer-events: none; }
  @keyframes ledBorder { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
  .chat-window::after { content: ''; position: absolute; top: 14px; left: 50%; transform: translateX(-50%); width: 60px; height: 8px; background: #0a0a1a; border-radius: 20px; border: 1px solid rgba(108,99,255,0.3); z-index: 10; box-shadow: 0 0 8px rgba(108,99,255,0.4); }
  @keyframes chatIn { from { opacity:0; transform: translateY(12px) scale(.97); } to { opacity:1; transform: none; } }
  .chat-head { padding: 28px 18px 14px; background: linear-gradient(135deg, #1a1a2e, #16213e); border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 10px; position: relative; z-index: 1; }
  .chat-head span { font-family: "Syne", sans-serif; font-size: 14px; font-weight: 600; color: #e8e8f0; }
  .chat-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(108,99,255,0.4); }
  .chat-dot { width: 8px; height: 8px; border-radius: 50%; background: #34d399; }
  .chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; background: #0d1117; position: relative; z-index: 1; }
  .chat-msg { max-width: 85%; padding: 10px 14px; border-radius: 16px; font-size: 12px; line-height: 1.6; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; }
  .chat-msg.bot { background: #1e2233; color: #c8c8d8; align-self: flex-start; border-bottom-left-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
  .chat-msg.user { background: linear-gradient(135deg, #6c63ff, #a78bfa); color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; box-shadow: 0 2px 12px rgba(108,99,255,0.4); }
  .chat-input-row { display: flex; gap: 8px; padding: 14px 12px 24px; border-top: 1px solid rgba(255,255,255,0.06); background: #1a1a2e; position: relative; z-index: 1; }
  .chat-input { flex: 1; background: #1c1c26; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: #e8e8f0; font-family: "DM Mono", monospace; font-size: 12px; padding: 8px 12px; outline: none; }
  .chat-input:focus { border-color: #6c63ff; }
  .chat-send { background: #6c63ff; border: none; border-radius: 8px; color: #fff; cursor: pointer; padding: 8px 12px; font-size: 14px; transition: background .2s; }
  .chat-send:hover { background: #7c74ff; }
  @media print {
    .sidebar, .chatbot, .table-actions, .toast, .search-bar, .stats-grid { display: none !important; }
    .dash-main { margin-left: 0 !important; padding: 16px !important; }
    body { background: #fff !important; color: #000 !important; }
    .dash-root { background: #fff !important; }
    .table-section { background: #fff !important; border: 1px solid #ccc !important; }
    table { color: #000 !important; }
    thead th { color: #000 !important; border-bottom: 1px solid #000 !important; }
    tbody td { color: #000 !important; }
    tbody td input { color: #000 !important; border: none !important; background: transparent !important; }
    .badge { border: 1px solid #999 !important; color: #000 !important; background: #eee !important; }
    .btn-danger { display: none !important; }
    @page { margin: 1cm; }
  }
`;

const getLightStyles = () => `
  @import url("https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=DM+Mono:wght@300;400;500&display=swap");
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f0f2f8; font-family: "DM Mono", monospace; transition: background 0.3s ease; }
  .dash-root { display: flex; min-height: 100vh; background: #f0f2f8; transition: background 0.3s ease; }
  .sidebar { width: 220px; min-height: 100vh; background: #ffffff; border-right: 1px solid rgba(0,0,0,0.08); display: flex; flex-direction: column; padding: 24px 0; position: fixed; top: 0; left: 0; z-index: 100; box-shadow: 2px 0 20px rgba(0,0,0,0.06); transition: background 0.3s ease; }
  .sidebar-brand { display: flex; align-items: center; gap: 10px; padding: 0 20px 28px; border-bottom: 1px solid rgba(0,0,0,0.08); margin-bottom: 16px; }
  .sidebar-brand__icon { font-size: 20px; color: #6c63ff; }
  .sidebar-brand__name { font-family: "Syne", sans-serif; font-size: 13px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #1a1a2e; }
  .sidebar-nav { display: flex; flex-direction: column; gap: 4px; padding: 0 12px; flex: 1; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; cursor: pointer; font-size: 13px; color: #5a5a70; transition: all .2s; border: none; background: none; width: 100%; text-align: left; }
  .nav-item:hover { background: rgba(108,99,255,0.06); color: #6c63ff; }
  .nav-item.active { background: rgba(108,99,255,0.1); color: #6c63ff; }
  .nav-item__icon { font-size: 16px; width: 20px; text-align: center; }
  .sidebar-footer { padding: 16px 12px 0; border-top: 1px solid rgba(0,0,0,0.08); margin-top: auto; }
  .logout-btn { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; cursor: pointer; font-size: 13px; color: #ff5e6c; background: none; border: none; width: 100%; transition: background .2s; }
  .logout-btn:hover { background: rgba(255,94,108,0.08); }
  .dash-main { margin-left: 220px; flex: 1; padding: 32px; transition: background 0.3s ease; }
  .dash-header { margin-bottom: 28px; }
  .dash-header h1 { font-family: "Syne", sans-serif; font-size: 22px; font-weight: 700; color: #1a1a2e; }
  .dash-header p { font-size: 12px; color: #5a5a70; margin-top: 4px; }
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px,1fr)); gap: 14px; margin-bottom: 28px; }
  .stat-card { background: #ffffff; border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; padding: 18px 20px; border-left: 3px solid; box-shadow: 0 2px 12px rgba(0,0,0,0.06); transition: all 0.3s ease; }
  .stat-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
  .stat-card__label { font-size: 11px; color: #5a5a70; letter-spacing: .06em; text-transform: uppercase; margin-bottom: 8px; }
  .stat-card__value { font-family: "Syne", sans-serif; font-size: 28px; font-weight: 700; color: #1a1a2e; }
  .stat-card__sub { font-size: 11px; color: #5a5a70; margin-top: 4px; }
  .table-section { background: #ffffff; border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; overflow: hidden; margin-bottom: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); transition: all 0.3s ease; }
  .table-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,0.08); background: #fafafa; }
  .table-header h2 { font-family: "Syne", sans-serif; font-size: 15px; font-weight: 600; color: #1a1a2e; }
  .table-actions { display: flex; gap: 8px; }
  .btn { padding: 7px 14px; border-radius: 7px; font-size: 12px; cursor: pointer; border: none; font-family: "DM Mono", monospace; transition: all .2s; }
  .btn-primary { background: #6c63ff; color: #fff; }
  .btn-primary:hover { background: #7c74ff; }
  .btn-outline { background: transparent; color: #5a5a70; border: 1px solid rgba(0,0,0,0.15); }
  .btn-outline:hover { color: #1a1a2e; border-color: rgba(0,0,0,0.3); background: rgba(0,0,0,0.04); }
  .btn-outline:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-print { background: transparent; color: #059669; border: 1px solid rgba(5,150,105,0.3); }
  .btn-print:hover { background: rgba(5,150,105,0.06); }
  .btn-danger { background: transparent; color: #dc2626; border: 1px solid rgba(220,38,38,0.2); padding: 3px 8px; font-size: 11px; }
  .btn-danger:hover { background: rgba(220,38,38,0.06); }
  .search-bar { display: flex; gap: 10px; padding: 12px 16px; border-bottom: 1px solid rgba(0,0,0,0.06); background: #fafafa; }
  .search-input { flex: 1; background: #f5f5fa; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; color: #1a1a2e; font-family: "DM Mono",monospace; font-size: 13px; padding: 9px 14px; outline: none; transition: all 0.3s ease; }
  .search-input:focus { border-color: #6c63ff; box-shadow: 0 0 0 3px rgba(108,99,255,0.1); background: #fff; }
  .search-input::placeholder { color: rgba(0,0,0,0.3); }
  .filter-select { background: #f5f5fa; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; color: #1a1a2e; font-family: "DM Mono",monospace; font-size: 13px; padding: 9px 14px; outline: none; min-width: 180px; transition: all 0.3s ease; }
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead th { padding: 10px 16px; text-align: left; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: #5a5a70; border-bottom: 1px solid rgba(0,0,0,0.08); background: #fafafa; }
  tbody tr { border-bottom: 1px solid rgba(0,0,0,0.05); transition: background .15s; }
  tbody tr:hover { background: rgba(108,99,255,0.03); }
  tbody td { padding: 11px 16px; color: #2d2d40; }
  tbody td input { background: transparent; border: 1px solid transparent; border-radius: 4px; color: #1a1a2e; font-family: "DM Mono", monospace; font-size: 13px; padding: 3px 6px; width: 100%; transition: border-color .2s; }
  tbody td input:focus { outline: none; border-color: #6c63ff; background: rgba(108,99,255,0.05); }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 11px; }
  .badge-gpu { background: rgba(108,99,255,0.1); color: #6c63ff; }
  .badge-monitor { background: rgba(5,150,105,0.1); color: #059669; }
  .badge-cpu { background: rgba(217,119,6,0.1); color: #d97706; }
  .badge-ram { background: rgba(219,39,119,0.1); color: #db2777; }
  .badge-other { background: rgba(107,114,128,0.1); color: #6b7280; }
  .prov-form { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 20px; border-bottom: 1px solid rgba(0,0,0,0.06); }
  .prov-input { background: #f5f5fa; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; color: #1a1a2e; font-family: "DM Mono", monospace; font-size: 13px; padding: 10px 14px; outline: none; transition: all 0.3s ease; }
  .prov-input:focus { border-color: #6c63ff; background: #fff; }
  .prov-input::placeholder { color: rgba(0,0,0,0.3); }
  .mov-form { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 20px; border-bottom: 1px solid rgba(0,0,0,0.06); }
  .mov-select { background: #f5f5fa; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; color: #1a1a2e; font-family: "DM Mono", monospace; font-size: 13px; padding: 10px 14px; outline: none; transition: all 0.3s ease; }
  .alerta-stock { background: rgba(220,38,38,0.06); border: 1px solid rgba(220,38,38,0.2); border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; font-size: 12px; color: #dc2626; line-height: 1.8; }
  .alerta-stock h4 { font-family: "Syne",sans-serif; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
  .filtro-fecha { display: flex; gap: 10px; padding: 12px 16px; border-bottom: 1px solid rgba(0,0,0,0.06); align-items: center; background: #fafafa; }
  .filtro-fecha label { font-size: 11px; color: #5a5a70; text-transform: uppercase; letter-spacing: .06em; white-space: nowrap; }
  .filtro-fecha input { background: #f5f5fa; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; color: #1a1a2e; font-family: "DM Mono",monospace; font-size: 13px; padding: 8px 12px; outline: none; transition: all 0.3s ease; }
  .filtro-fecha input:focus { border-color: #6c63ff; }
  .chart-card { background: #ffffff; border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; padding: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); transition: all 0.3s ease; }
  .chart-card h3 { font-family: "Syne",sans-serif; font-size: 14px; font-weight: 600; color: #1a1a2e; margin-bottom: 4px; }
  .chart-card p { font-size: 11px; color: #5a5a70; margin-bottom: 14px; }
  .toast { position: fixed; top: 24px; right: 24px; z-index: 999; background: #ffffff; border: 1px solid rgba(5,150,105,0.3); border-radius: 10px; padding: 14px 18px; font-size: 13px; color: #059669; box-shadow: 0 8px 32px rgba(0,0,0,0.12); animation: toastIn .3s ease; max-width: 320px; line-height: 1.6; }
  .toast.error { border-color: rgba(220,38,38,0.3); color: #dc2626; }
  @keyframes toastIn { from { opacity:0; transform: translateY(-12px); } to { opacity:1; transform: none; } }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 300; display: flex; align-items: center; justify-content: center; animation: fadeIn .2s ease; }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  .modal { background: #ffffff; border: 1px solid rgba(0,0,0,0.1); border-radius: 16px; padding: 32px; width: 100%; max-width: 500px; box-shadow: 0 32px 80px rgba(0,0,0,0.15); animation: slideUp .25s cubic-bezier(.16,1,.3,1); }
  @keyframes slideUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: none; } }
  .modal h2 { font-family: "Syne",sans-serif; font-size: 18px; font-weight: 700; color: #1a1a2e; margin-bottom: 6px; }
  .modal-subtitle { font-size: 12px; color: #5a5a70; margin-bottom: 24px; }
  .modal-form { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .modal-field { display: flex; flex-direction: column; gap: 6px; }
  .modal-field label { font-size: 11px; color: #5a5a70; letter-spacing: .06em; text-transform: uppercase; }
  .modal-input { background: #f5f5fa; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; color: #1a1a2e; font-family: "DM Mono",monospace; font-size: 13px; padding: 10px 14px; outline: none; }
  .modal-input:focus { border-color: #6c63ff; box-shadow: 0 0 0 3px rgba(108,99,255,0.1); }
  .modal-input::placeholder { color: rgba(0,0,0,0.3); }
  .modal-select { background: #f5f5fa; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; color: #1a1a2e; font-family: "DM Mono",monospace; font-size: 13px; padding: 10px 14px; outline: none; width: 100%; }
  .modal-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px; }
  .typing-dots span { animation: blink 1.4s infinite; display: inline-block; }
  .typing-dots span:nth-child(2) { animation-delay: .2s; }
  .typing-dots span:nth-child(3) { animation-delay: .4s; }
  @keyframes blink { 0%,80%,100% { opacity:0; } 40% { opacity:1; } }
  .chatbot { position: fixed; bottom: 24px; right: 24px; z-index: 200; }
  .chat-toggle { width: 58px; height: 58px; border-radius: 50%; background: #ffffff; border: 2px solid rgba(108,99,255,0.3); cursor: pointer; overflow: hidden; box-shadow: 0 4px 20px rgba(108,99,255,0.25); transition: transform .2s; display: flex; align-items: center; justify-content: center; animation: pulseLed 2s infinite; }
  .chat-toggle img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
  .chat-toggle:hover { transform: scale(1.1); }
  @keyframes pulseLed { 0% { box-shadow: 0 0 0 0 rgba(108,99,255,0.3), 0 4px 20px rgba(108,99,255,0.2); } 70% { box-shadow: 0 0 0 14px rgba(108,99,255,0), 0 4px 20px rgba(108,99,255,0.2); } 100% { box-shadow: 0 0 0 0 rgba(108,99,255,0), 0 4px 20px rgba(108,99,255,0.2); } }
  .chat-window { position: absolute; bottom: 64px; right: 0; width: 380px; height: 690px; border-radius: 44px; overflow: hidden; display: flex; flex-direction: column; animation: chatIn .25s cubic-bezier(.16,1,.3,1); background: #f8f9ff; position: relative; box-shadow: 0 0 0 1px rgba(108,99,255,0.2), 0 20px 60px rgba(108,99,255,0.15), 0 30px 80px rgba(0,0,0,0.12); }
  .chat-window::before { content: ''; position: absolute; inset: -2px; border-radius: 46px; background: linear-gradient(135deg, #6c63ff 0%, #a78bfa 30%, #22d3ee 60%, #6c63ff 100%); background-size: 400% 400%; animation: ledBorder 3s linear infinite; z-index: -1; pointer-events: none; opacity: 0.6; }
  @keyframes ledBorder { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
  .chat-window::after { content: ''; position: absolute; top: 14px; left: 50%; transform: translateX(-50%); width: 60px; height: 8px; background: #e8e8f5; border-radius: 20px; border: 1px solid rgba(108,99,255,0.2); z-index: 10; }
  @keyframes chatIn { from { opacity:0; transform: translateY(12px) scale(.97); } to { opacity:1; transform: none; } }
  .chat-head { padding: 28px 18px 14px; background: linear-gradient(135deg, #6c63ff, #a78bfa); border-bottom: 1px solid rgba(108,99,255,0.2); display: flex; align-items: center; gap: 10px; position: relative; z-index: 1; }
  .chat-head span { font-family: "Syne", sans-serif; font-size: 14px; font-weight: 600; color: #ffffff; }
  .chat-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.5); }
  .chat-dot { width: 8px; height: 8px; border-radius: 50%; background: #34d399; border: 2px solid white; }
  .chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; background: #f0f2f8; position: relative; z-index: 1; }
  .chat-msg { max-width: 85%; padding: 10px 14px; border-radius: 16px; font-size: 12px; line-height: 1.6; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; }
  .chat-msg.bot { background: #ffffff; color: #2d2d40; align-self: flex-start; border-bottom-left-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border: 1px solid rgba(0,0,0,0.06); }
  .chat-msg.user { background: linear-gradient(135deg, #6c63ff, #a78bfa); color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; box-shadow: 0 2px 12px rgba(108,99,255,0.3); }
  .chat-input-row { display: flex; gap: 8px; padding: 14px 12px 24px; border-top: 1px solid rgba(0,0,0,0.08); background: #ffffff; position: relative; z-index: 1; }
  .chat-input { flex: 1; background: #f5f5fa; border: 1px solid rgba(0,0,0,0.1); border-radius: 20px; color: #1a1a2e; font-family: "DM Mono", monospace; font-size: 12px; padding: 8px 16px; outline: none; transition: all 0.2s; }
  .chat-input:focus { border-color: #6c63ff; background: #fff; box-shadow: 0 0 0 3px rgba(108,99,255,0.1); }
  .chat-send { background: #6c63ff; border: none; border-radius: 50%; color: #fff; cursor: pointer; width: 36px; height: 36px; font-size: 14px; transition: background .2s; display: flex; align-items: center; justify-content: center; }
  .chat-send:hover { background: #7c74ff; }
  @media print {
    .sidebar, .chatbot, .table-actions, .toast, .search-bar, .stats-grid { display: none !important; }
    .dash-main { margin-left: 0 !important; padding: 16px !important; }
    body { background: #fff !important; }
    @page { margin: 1cm; }
  }
`;

const inventarioInicial = [
  { id:1, categoria:"Tarjeta de Video", marca:"ASUS",    modelo:"Radeon RX 9070 XT OC",  precio:3299, stock:5 },
  { id:2, categoria:"Tarjeta de Video", marca:"GIGABYTE",modelo:"RTX 5070 WINDFORCE OC", precio:2920, stock:3 },
  { id:3, categoria:"Procesadores",     marca:"AMD",     modelo:"Ryzen 5 5600GT",         precio:569,  stock:8 },
  { id:4, categoria:"Procesadores",     marca:"Intel",   modelo:"Core i5-12400F",         precio:890,  stock:6 },
  { id:5, categoria:"Monitores",        marca:"ASUS",    modelo:"XG27AQDMG",              precio:2899, stock:2 },
  { id:6, categoria:"Monitores",        marca:"MSI",     modelo:"MAG 276CXF",             precio:539,  stock:7 },
  { id:7, categoria:"RAM",              marca:"CORSAIR", modelo:"Vengeance DDR4 16GB",    precio:1000, stock:12},
  { id:8, categoria:"Disco SSD",        marca:"KINGSTON",modelo:"NV3 1TB",                precio:495,  stock:9 },
  { id:9, categoria:"Placa Madre",      marca:"GIGABYTE",modelo:"Z790 Gaming X AX",       precio:1080, stock:4 },
  { id:10,categoria:"Case",             marca:"ANTRYX",  modelo:"FX 650 ARGB",            precio:280,  stock:6 },
];

const badgeClass = (cat) => {
  if (!cat) return "badge badge-other";
  if (cat.includes("Video"))    return "badge badge-gpu";
  if (cat.includes("Monitor"))  return "badge badge-monitor";
  if (cat.includes("Procesad")) return "badge badge-cpu";
  if (cat.includes("RAM"))      return "badge badge-ram";
  return "badge badge-other";
};

function Graficos({ datos, oscuro }) {
  const chartsRef = useRef({});
  const textColor = oscuro ? "#6b6b80" : "#5a5a70";
  const gridColor = oscuro ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)";
  const gridOpts = {
    x:{ ticks:{color:textColor,font:{size:10}}, grid:{color:gridColor} },
    y:{ ticks:{color:textColor}, grid:{color:gridColor} }
  };
  const mk = (id, config) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (chartsRef.current[id]) chartsRef.current[id].destroy();
    chartsRef.current[id] = new Chart(el, config);
  };
  useEffect(() => {
    if (!datos.length) return;
    const cats    = [...new Set(datos.map(d => d.categoria))];
    const counts  = cats.map(c => datos.filter(d=>d.categoria===c).length);
    const stocks  = cats.map(c => datos.filter(d=>d.categoria===c).reduce((a,b)=>a+(b.stock||0),0));
    const valores = cats.map(c => datos.filter(d=>d.categoria===c).reduce((a,b)=>a+(b.precio||0)*(b.stock||0),0));
    const precios = cats.map(c => Math.max(...datos.filter(d=>d.categoria===c).map(d=>d.precio||0)));
    const precMin = cats.map(c => Math.min(...datos.filter(d=>d.categoria===c).map(d=>d.precio||0)));
    const maxS = Math.max(...stocks)||1, maxP = Math.max(...precios)||1;
    const avg  = cats.map(c=>{ const p=datos.filter(d=>d.categoria===c); return Math.round(p.reduce((a,b)=>a+(b.precio||0),0)/p.length); });
    let ac=0; const acum = valores.map(v=>{ac+=v;return ac;});
    const top5 = [...datos].sort((a,b)=>((b.precio||0)*(b.stock||0))-((a.precio||0)*(a.stock||0))).slice(0,5);
    const legColor = oscuro ? "#9ca3af" : "#5a5a70";
    mk("g1",{ type:"bar", data:{ labels:cats, datasets:[{ data:counts, backgroundColor:COLORS, borderRadius:8 }] }, options:{ plugins:{legend:{display:false}}, scales:gridOpts } });
    mk("g2",{ type:"doughnut", data:{ labels:cats, datasets:[{ data:stocks, backgroundColor:COLORS, borderWidth:0, hoverOffset:8 }] }, options:{ plugins:{ legend:{ position:"right", labels:{color:legColor,font:{size:10},padding:8} } }, cutout:"65%" } });
    mk("g6",{ type:"pie", data:{ labels:cats, datasets:[{ data:counts, backgroundColor:COLORS, borderWidth:0 }] }, options:{ plugins:{ legend:{ position:"bottom", labels:{color:legColor,font:{size:9},padding:8} } } } });
    mk("g3",{ type:"bar", data:{ labels:cats, datasets:[{ data:valores, backgroundColor:COLORS, borderRadius:6 }] }, options:{ indexAxis:"y", plugins:{legend:{display:false}}, scales:gridOpts } });
    mk("g4",{ type:"line", data:{ labels:cats, datasets:[{ label:"Precio max", data:precios, borderColor:"#6c63ff", backgroundColor:"rgba(108,99,255,0.1)", fill:true, tension:0.4, pointBackgroundColor:"#6c63ff", pointRadius:5 }] }, options:{ plugins:{legend:{display:false}}, scales:gridOpts } });
    mk("g9",{ type:"bar", data:{ labels:cats, datasets:[{ data:avg, backgroundColor:COLORS.map(c=>c+"99"), borderColor:COLORS, borderWidth:2, borderRadius:8 }] }, options:{ plugins:{legend:{display:false}}, scales:gridOpts } });
    mk("g16",{ type:"line", data:{ labels:cats, datasets:[ { label:"Min", data:precMin, borderColor:"#34d399", fill:false, tension:0.4, pointRadius:4 }, { label:"Max", data:precios, borderColor:"#f472b6", fill:false, tension:0.4, pointRadius:4 } ] }, options:{ plugins:{legend:{labels:{color:legColor,font:{size:10}}}}, scales:gridOpts } });
    mk("g5",{ type:"radar", data:{ labels:cats, datasets:[ { label:"Stock %", data:stocks.map(s=>Math.round(s/maxS*100)), borderColor:"#34d399", backgroundColor:"rgba(52,211,153,0.15)", pointBackgroundColor:"#34d399" }, { label:"Precio %", data:precios.map(p=>Math.round(p/maxP*100)), borderColor:"#f472b6", backgroundColor:"rgba(244,114,182,0.15)", pointBackgroundColor:"#f472b6" } ] }, options:{ plugins:{legend:{labels:{color:legColor,font:{size:10}}}}, scales:{ r:{ ticks:{color:textColor,backdropColor:"transparent"}, grid:{color:gridColor}, pointLabels:{color:legColor,font:{size:9}} } } } });
    mk("g7",{ type:"bar", data:{ labels:cats, datasets:[ { label:"Precio min", data:precMin, backgroundColor:"rgba(52,211,153,0.7)", borderRadius:4 }, { label:"Diferencia", data:precios.map((p,i)=>p-precMin[i]), backgroundColor:"rgba(108,99,255,0.7)", borderRadius:4 } ] }, options:{ plugins:{legend:{labels:{color:legColor,font:{size:10}}}}, scales:{x:{...gridOpts.x,stacked:true},y:{...gridOpts.y,stacked:true}} } });
    mk("g11",{ type:"bar", data:{ labels:cats, datasets:[ { label:"Stock actual", data:stocks, backgroundColor:"rgba(108,99,255,0.8)", borderRadius:6 }, { label:"Minimo (5)", data:stocks.map(()=>5), backgroundColor:"rgba(255,94,108,0.5)", borderRadius:6 } ] }, options:{ plugins:{legend:{labels:{color:legColor,font:{size:10}}}}, scales:gridOpts } });
    mk("g13",{ type:"polarArea", data:{ labels:cats, datasets:[{ data:stocks, backgroundColor:COLORS.map(c=>c+"bb"), borderWidth:0 }] }, options:{ plugins:{ legend:{ position:"right", labels:{color:legColor,font:{size:10},padding:8} } }, scales:{ r:{ ticks:{color:textColor,backdropColor:"transparent"}, grid:{color:gridColor} } } } });
    mk("g8",{ type:"line", data:{ labels:cats, datasets:[ { label:"Stock", data:stocks, borderColor:"#fbbf24", backgroundColor:"rgba(251,191,36,0.1)", fill:true, tension:0.4, yAxisID:"y" }, { label:"Valor/1000", data:valores.map(v=>Math.round(v/1000)), borderColor:"#22d3ee", backgroundColor:"rgba(34,211,238,0.1)", fill:true, tension:0.4, yAxisID:"y1" } ] }, options:{ plugins:{legend:{labels:{color:legColor,font:{size:10}}}}, scales:{ y:{ type:"linear", position:"left", ticks:{color:textColor}, grid:{color:gridColor} }, y1:{ type:"linear", position:"right", ticks:{color:textColor}, grid:{drawOnChartArea:false} }, x:{ ticks:{color:textColor,font:{size:10}}, grid:{color:gridColor} } } } });
    mk("g10",{ type:"doughnut", data:{ labels:cats, datasets:[{ data:valores, backgroundColor:COLORS, borderWidth:0, hoverOffset:10 }] }, options:{ plugins:{ legend:{ position:"right", labels:{color:legColor,font:{size:10},padding:8} } }, cutout:"60%" } });
    mk("g12",{ type:"line", data:{ labels:cats, datasets:[{ label:"Acumulado", data:acum, borderColor:"#a78bfa", backgroundColor:"rgba(167,139,250,0.15)", fill:true, tension:0.4, pointBackgroundColor:"#a78bfa", pointRadius:5 }] }, options:{ plugins:{legend:{display:false}}, scales:gridOpts } });
    mk("g14",{ type:"bubble", data:{ datasets:datos.slice(0,12).map((d,i)=>({ label:d.modelo, data:[{ x:d.precio||0, y:d.stock||0, r:Math.max(4,Math.round(((d.precio||0)*(d.stock||0))/5000)) }], backgroundColor:COLORS[i%COLORS.length]+"aa", borderColor:COLORS[i%COLORS.length] })) }, options:{ plugins:{legend:{display:false}}, scales:{ x:{ticks:{color:textColor},grid:{color:gridColor},title:{display:true,text:"Precio S/",color:textColor}}, y:{ticks:{color:textColor},grid:{color:gridColor},title:{display:true,text:"Stock",color:textColor}} } } });
    mk("g15",{ type:"bar", data:{ labels:top5.map(d=>(d.modelo||"").substring(0,12)+"..."), datasets:[{ data:top5.map(d=>(d.precio||0)*(d.stock||0)), backgroundColor:["#6c63ff","#34d399","#fbbf24","#f472b6","#22d3ee"], borderRadius:8 }] }, options:{ plugins:{legend:{display:false}}, scales:gridOpts } });
    return () => Object.values(chartsRef.current).forEach(c=>c.destroy());
  }, [datos, oscuro]);
  const card = (id, title, sub, col="auto") => (
    <div key={id} className="chart-card" style={{gridColumn:col}}>
      <h3>{title}</h3><p>{sub}</p><canvas id={id}></canvas>
    </div>
  );
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"16px"}}>
      {card("g1","Productos por categoria","Cantidad de SKUs")}
      {card("g2","Stock por categoria","Proporcion de unidades")}
      {card("g6","Distribucion categorias","Vista circular")}
      {card("g3","Valor total horizontal","Total en soles S/","1/-1")}
      {card("g4","Precio maximo","Tendencia precios altos")}
      {card("g9","Precio promedio","Media por categoria")}
      {card("g16","Rango de precios","Minimo vs Maximo")}
      {card("g5","Radar Stock vs Precio","Comparativa normalizada","1/-1")}
      {card("g7","Precios apilados","Base + diferencia")}
      {card("g11","Stock vs minimo","Alerta stock bajo")}
      {card("g13","Polar Stock","Vista polar")}
      {card("g8","Stock y Valor doble eje","Stock izq - Valor der","1/-1")}
      {card("g10","Valor doughnut","Capital en stock")}
      {card("g12","Valor acumulado","Crecimiento acumulado")}
      {card("g14","Burbuja Precio vs Stock","Tamano = valor total","1/-1")}
      {card("g15","Top 5 mas valiosos","Mayor valor en stock","1/-1")}
    </div>
  );
}

export default function Dashboard() {
  const { token, user, logout } = useContext(AuthContext);

  // Cargar preferencia de tema guardada
  const [temaOscuro, setTemaOscuro] = useState(() => {
    const saved = localStorage.getItem("eagle-tema");
    return saved !== null ? saved === "oscuro" : true;
  });

  const [seccion,       setSeccion]       = useState("inventario");
  const [datos,         setDatos]         = useState(inventarioInicial);
  const [chat,          setChat]          = useState(false);
  const [msgs,          setMsgs]          = useState([{ from:"bot", text:"Hola! Soy Eagle Bot. En que te ayudo?" }]);
  const [input,         setInput]         = useState("");
  const [importando,    setImportando]    = useState(false);
  const [toast,         setToast]         = useState(null);
  const [busqueda,      setBusqueda]      = useState("");
  const [filtrocat,     setFiltrocat]     = useState("Todas");
  const [modalAgregar,  setModalAgregar]  = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({ categoria:"", marca:"", modelo:"", precio:"", stock:"" });
  const [proveedores,   setProveedores]   = useState([]);
  const [nuevoProv,     setNuevoProv]     = useState({ nombre:"", producto:"", precio:"", entrega:"", contacto:"" });
  const [movimientos,   setMovimientos]   = useState([]);
  const [nuevoMov,      setNuevoMov]      = useState({ fecha:"", producto:"", tipo:"Entrada", cantidad:"", costo:"", responsable:"" });
  const [filtroFecha,   setFiltroFecha]   = useState({ desde:"", hasta:"" });
  const [waQR,          setWaQR]          = useState(null);
  const [waEstado,      setWaEstado]      = useState("desconectado");
  const STOCK_MINIMO = 5;
  const chatEndRef = useRef(null);

  // Guardar preferencia de tema en localStorage
  const toggleTema = () => {
    const nuevo = !temaOscuro;
    setTemaOscuro(nuevo);
    localStorage.setItem("eagle-tema", nuevo ? "oscuro" : "claro");
  };

  // Logout mejorado
  const handleLogout = () => {
    logout();
    window.location.replace("/");
  };

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const res  = await fetch(`${API}/api/excel/productos`, { headers:{ Authorization:`Bearer ${token}` } });
        const data = await res.json();
        if (res.ok && data.productos?.length) {
          setDatos(data.productos.map((p,i) => ({
            id:        i+1,
            categoria: p.sheet_name || p.categoria || "—",
            marca:     String(p.categoria||"").split(" ")[0] || "—",
            modelo:    p.modelo || "—",
            precio:    Number(p.precio_venta) || 0,
            stock:     Number(p.cantidad) || 0,
          })));
        }
      } catch { console.log("Sin productos en BD"); }
    };
    const cargarMovimientos = async () => {
      try {
        const res  = await fetch(`${API}/api/movimientos`, { headers:{ Authorization:`Bearer ${token}` } });
        const data = await res.json();
        if (res.ok && data.movimientos?.length) setMovimientos(data.movimientos);
      } catch { console.log("Sin movimientos en BD"); }
    };
    const cargarProveedores = async () => {
      try {
        const res  = await fetch(`${API}/api/proveedores`, { headers:{ Authorization:`Bearer ${token}` } });
        const data = await res.json();
        if (res.ok && data.proveedores?.length) setProveedores(data.proveedores);
      } catch { console.log("Sin proveedores en BD"); }
    };
    const verificarWhatsApp = async () => {
      try {
        const res  = await fetch(`${API}/api/whatsapp/qr`, { headers:{ Authorization:`Bearer ${token}` } });
        const data = await res.json();
        setWaQR(data.qr);
        setWaEstado(data.estado);
      } catch { console.log("WhatsApp no disponible"); }
    };
    cargarProductos();
    cargarMovimientos();
    cargarProveedores();
    verificarWhatsApp();
    const waInterval = setInterval(verificarWhatsApp, 10000);
    return () => clearInterval(waInterval);
  }, [token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [msgs]);

  const showToast = (msg, tipo="ok") => { setToast({msg,tipo}); setTimeout(()=>setToast(null),4000); };

  const handleImportarExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportando(true);
    try {
      const fd = new FormData();
      fd.append("excel", file);
      const res = await fetch(`${API}/api/excel/importar`, { method:"POST", headers:{Authorization:`Bearer ${token}`}, body:fd });
      const data = await res.json();
      if (res.ok) {
        showToast(`${data.total} productos importados`);
        const r2 = await fetch(`${API}/api/excel/productos`, { headers:{Authorization:`Bearer ${token}`} });
        const d2 = await r2.json();
        if (r2.ok && d2.productos?.length) {
          setDatos(d2.productos.map((p,i)=>({ id:i+1, categoria:p.sheet_name||p.categoria||"—", marca:String(p.categoria||"").split(" ")[0]||"—", modelo:p.modelo||"—", precio:Number(p.precio_venta)||0, stock:Number(p.cantidad)||0 })));
        }
      } else { showToast("Error: "+data.message,"error"); }
    } catch { showToast("Error al conectar","error"); }
    finally { setImportando(false); e.target.value=""; }
  };

  const handleEdit = (id,campo,valor) => setDatos(datos.map(d=>d.id===id?{...d,[campo]:valor}:d));
  const handlePrint = () => window.print();

  const eliminarProducto = async (id) => {
    try {
      const res = await fetch(`${API}/api/excel/eliminar/${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` } });
      if (res.ok) { setDatos(datos.filter(d=>d.id!==id)); showToast("Producto eliminado"); }
    } catch { showToast("Error al eliminar","error"); }
  };

  const agregarProducto = async () => {
    if (!nuevoProducto.categoria || !nuevoProducto.modelo) return;
    try {
      const res = await fetch(`${API}/api/excel/agregar`, { method:"POST", headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`}, body:JSON.stringify(nuevoProducto) });
      const data = await res.json();
      if (res.ok) {
        setDatos([...datos, { id:data.id, categoria:nuevoProducto.categoria, marca:nuevoProducto.marca||"—", modelo:nuevoProducto.modelo, precio:Number(nuevoProducto.precio)||0, stock:Number(nuevoProducto.stock)||0 }]);
        setModalAgregar(false);
        setNuevoProducto({ categoria:"", marca:"", modelo:"", precio:"", stock:"" });
        showToast("Producto guardado");
      } else { showToast("Error: "+data.message,"error"); }
    } catch { showToast("Error al conectar","error"); }
  };

  const agregarProveedor = async () => {
    if (!nuevoProv.nombre) return;
    try {
      const res = await fetch(`${API}/api/proveedores/agregar`, { method:"POST", headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`}, body:JSON.stringify(nuevoProv) });
      const data = await res.json();
      if (res.ok) {
        setProveedores([...proveedores, {...nuevoProv, id:data.id}]);
        setNuevoProv({ nombre:"", producto:"", precio:"", entrega:"", contacto:"" });
        showToast("Proveedor agregado");
      } else { showToast("Error: "+data.message,"error"); }
    } catch { showToast("Error al conectar","error"); }
  };

  const eliminarProveedor = async (id) => {
    try {
      const res = await fetch(`${API}/api/proveedores/${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` } });
      if (res.ok) { setProveedores(proveedores.filter(p=>p.id!==id)); showToast("Proveedor eliminado"); }
    } catch { showToast("Error al eliminar","error"); }
  };

  const agregarMovimiento = async () => {
    if (!nuevoMov.producto || !nuevoMov.cantidad) return;
    try {
      const res = await fetch(`${API}/api/movimientos/agregar`, { method:"POST", headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`}, body:JSON.stringify(nuevoMov) });
      const data = await res.json();
      if (res.ok) {
        setMovimientos([...movimientos, {...nuevoMov, id:data.id, cantidad:Number(nuevoMov.cantidad), costo:Number(nuevoMov.costo)}]);
        setNuevoMov({ fecha:"", producto:"", tipo:"Entrada", cantidad:"", costo:"", responsable:"" });
        showToast("Movimiento registrado");
      } else { showToast("Error: "+data.message,"error"); }
    } catch { showToast("Error al conectar","error"); }
  };

  const handleSend = async () => {
  if (!input.trim()) return;
  const userMsg = input.trim();
  setMsgs(m => [...m, { from:"user", text:userMsg }]);
  setInput("");

  // ── Procesar REGISTRAR directamente sin llamar a la IA ──
  if (userMsg.toUpperCase().startsWith("REGISTRAR|")) {
    const partes = userMsg.split("|");
    if (partes.length >= 6) {
      const [, categoria, marca, modelo, precio, stock] = partes;
      try {
        const res = await fetch(`${API}/api/excel/agregar`, {
          method: "POST",
          headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
          body: JSON.stringify({ categoria:categoria.trim(), marca:marca.trim(), modelo:modelo.trim(), precio:Number(precio)||0, stock:Number(stock)||0 })
        });
        const data = await res.json();
        if (res.ok) {
          setDatos(prev => [...prev, { id:data.id, categoria:categoria.trim(), marca:marca.trim(), modelo:modelo.trim(), precio:Number(precio)||0, stock:Number(stock)||0 }]);
          setMsgs(m => [...m, { from:"bot", text:`Producto registrado:\n• ${categoria.trim()} — ${marca.trim()} ${modelo.trim()}\n• Precio: S/${precio}\n• Stock: ${stock} unidades\n\nYa aparece en el inventario.` }]);
        } else {
          setMsgs(m => [...m, { from:"bot", text:"Error al registrar el producto." }]);
        }
      } catch {
        setMsgs(m => [...m, { from:"bot", text:"Error al conectar con el servidor." }]);
      }
      return; // ← No llama a la IA
    }
  }
  
  /// Llamar a la IA
    setMsgs(m => [...m, { from:"bot", text:"...", typing:true }]);
    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ mensaje:userMsg, inventario:datos, movimientos, proveedores })
      });
      const data = await res.json();
      setMsgs(m => [...m.filter(x => !x.typing), { from:"bot", text: data.respuesta || "Sin respuesta" }]);
    } catch {
      setMsgs(m => [...m.filter(x => !x.typing), { from:"bot", text:"Error al conectar con la IA" }]);
    }
  };

  const categoriasList = ["Todas", ...new Set(datos.map(d=>d.categoria))];
  const movimientosFiltrados = movimientos.filter(m => {
    if (!filtroFecha.desde && !filtroFecha.hasta) return true;
    const fecha = m.fecha || "";
    if (filtroFecha.desde && fecha < filtroFecha.desde) return false;
    if (filtroFecha.hasta && fecha > filtroFecha.hasta) return false;
    return true;
  });
  const productosStockBajo = datos.filter(d => (d.stock||0) <= STOCK_MINIMO);
  const datosFiltrados = datos.filter(d => {
    const matchCat = filtrocat==="Todas" || d.categoria===filtrocat;
    const matchQ   = busqueda==="" || (d.modelo||"").toLowerCase().includes(busqueda.toLowerCase()) || (d.marca||"").toLowerCase().includes(busqueda.toLowerCase()) || (d.categoria||"").toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchQ;
  });

  const totalProductos = datos.length;
  const totalStock     = datos.reduce((a,b)=>a+(b.stock||0),0);
  const valorTotal     = datos.reduce((a,b)=>a+(b.precio||0)*(b.stock||0),0);
  const totalCats      = [...new Set(datos.map(d=>d.categoria))].length;

  const navItems = [
    { id:"inventario",  icon:"📦", label:"Inventario"       },
    { id:"graficos",    icon:"📊", label:"Graficos"         },
    { id:"entradas",    icon:"📥", label:"Entradas/Salidas" },
    { id:"proveedores", icon:"🏢", label:"Proveedores"      },
  ];

  const muted = temaOscuro ? "#6b6b80" : "#5a5a70";
  const textMain = temaOscuro ? "#e8e8f0" : "#1a1a2e";

  return (
    <>
      <style>{temaOscuro ? getDarkStyles() : getLightStyles()}</style>
      {toast && <div className={`toast ${toast.tipo==="error"?"error":""}`}>{toast.msg}</div>}

      {modalAgregar && (
        <div className="modal-overlay" onClick={e=>e.target.className==="modal-overlay"&&setModalAgregar(false)}>
          <div className="modal">
            <h2>Agregar producto</h2>
            <p className="modal-subtitle">Completa los datos del nuevo producto</p>
            <div className="modal-form">
              <div className="modal-field" style={{gridColumn:"1/-1"}}>
                <label>Categoria</label>
                <select className="modal-select" value={nuevoProducto.categoria} onChange={e=>setNuevoProducto({...nuevoProducto,categoria:e.target.value})}>
                  <option value="">Selecciona una categoria</option>
                  {["Tarjeta de Video","Procesadores","Monitores","RAM","Disco SSD","Placa Madre","Case","Fuente de poder","Laptops","Estabilizador","Perifericos"].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="modal-field"><label>Marca</label><input className="modal-input" placeholder="Ej: ASUS" value={nuevoProducto.marca} onChange={e=>setNuevoProducto({...nuevoProducto,marca:e.target.value})}/></div>
              <div className="modal-field"><label>Modelo</label><input className="modal-input" placeholder="Ej: RTX 4060" value={nuevoProducto.modelo} onChange={e=>setNuevoProducto({...nuevoProducto,modelo:e.target.value})}/></div>
              <div className="modal-field"><label>Precio venta (S/)</label><input className="modal-input" type="number" placeholder="0" value={nuevoProducto.precio} onChange={e=>setNuevoProducto({...nuevoProducto,precio:e.target.value})}/></div>
              <div className="modal-field"><label>Stock</label><input className="modal-input" type="number" placeholder="0" value={nuevoProducto.stock} onChange={e=>setNuevoProducto({...nuevoProducto,stock:e.target.value})}/></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setModalAgregar(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={agregarProducto}>Guardar producto</button>
            </div>
          </div>
        </div>
      )}

      <div className="dash-root">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <img src={EAGLE_LOGO} alt="Eagle Gaming" style={{width:"28px",height:"28px",objectFit:"contain",borderRadius:"6px"}} onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="block"}}/>
            <span className="sidebar-brand__icon" style={{display:"none"}}>◈</span>
            <span className="sidebar-brand__name">Eagle Gaming</span>
          </div>
          <nav className="sidebar-nav">
            {navItems.map(n=>(
              <button key={n.id} className={`nav-item ${seccion===n.id?"active":""}`} onClick={()=>setSeccion(n.id)}>
                <span className="nav-item__icon">{n.icon}</span>{n.label}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">

            {/* Toggle tema claro/oscuro */}
            <button
              onClick={toggleTema}
              style={{
                display:"flex", alignItems:"center", gap:"10px",
                padding:"10px 12px", background:"none", border:"none",
                cursor:"pointer", width:"100%", marginBottom:"8px",
                borderRadius:"8px", transition:"background 0.2s",
              }}
              onMouseEnter={e=>e.currentTarget.style.background=temaOscuro?"rgba(255,255,255,0.04)":"rgba(108,99,255,0.06)"}
              onMouseLeave={e=>e.currentTarget.style.background="none"}
            >
              <span style={{fontSize:"15px"}}>{temaOscuro ? "☀️" : "🌙"}</span>
              <span style={{fontSize:"13px", color:muted, flex:1, textAlign:"left", fontFamily:'"DM Mono", monospace'}}>
                {temaOscuro ? "Modo claro" : "Modo oscuro"}
              </span>
              {/* Interruptor */}
              <div style={{
                width:"38px", height:"20px", borderRadius:"10px",
                background: temaOscuro ? "#2a2a3a" : "#6c63ff",
                position:"relative", transition:"background 0.3s ease",
                border: temaOscuro ? "1px solid rgba(255,255,255,0.1)" : "1px solid #5a52ee",
                flexShrink:0,
              }}>
                <div style={{
                  position:"absolute", top:"3px",
                  left: temaOscuro ? "3px" : "17px",
                  width:"12px", height:"12px", borderRadius:"50%",
                  background: temaOscuro ? "#6b6b80" : "#ffffff",
                  transition:"left 0.3s ease, background 0.3s ease",
                  boxShadow: temaOscuro ? "none" : "0 1px 4px rgba(0,0,0,0.3)",
                }}/>
              </div>
            </button>

            {/* Cerrar sesion */}
            <button className="logout-btn" onClick={handleLogout}>
              <span>🚪</span> Cerrar sesion
            </button>
          </div>
        </aside>

        <main className="dash-main">
          <div className="dash-header">
            <h1>
              {seccion==="inventario"  && "📦 Inventario"}
              {seccion==="graficos"    && "📊 Graficos"}
              {seccion==="entradas"    && "📥 Entradas y Salidas"}
              {seccion==="proveedores" && "🏢 Proveedores"}
            </h1>
            <p>Bienvenido, {user?.name||"Administrador"} · Eagle Gaming System</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card" style={{borderColor:"#6c63ff"}}><div className="stat-card__label">Productos</div><div className="stat-card__value">{totalProductos}</div><div className="stat-card__sub">en inventario</div></div>
            <div className="stat-card" style={{borderColor:"#34d399"}}><div className="stat-card__label">Stock total</div><div className="stat-card__value">{totalStock}</div><div className="stat-card__sub">unidades</div></div>
            <div className="stat-card" style={{borderColor:"#fbbf24"}}><div className="stat-card__label">Valor total</div><div className="stat-card__value">S/ {valorTotal.toLocaleString()}</div><div className="stat-card__sub">en stock</div></div>
            <div className="stat-card" style={{borderColor:"#f472b6"}}><div className="stat-card__label">Categorias</div><div className="stat-card__value">{totalCats}</div><div className="stat-card__sub">tipos</div></div>
          </div>

          {seccion==="inventario" && (
            <div className="table-section">
              <div className="table-header">
                <h2>Productos registrados ({datosFiltrados.length})</h2>
                <div className="table-actions">
                  <button className="btn btn-print" onClick={handlePrint}>🖨 Imprimir</button>
                  <input type="file" id="inputExcel" accept=".xlsx,.xls" style={{display:"none"}} onChange={handleImportarExcel}/>
                  <button className="btn btn-outline" disabled={importando} onClick={()=>document.getElementById("inputExcel").click()}>
                    {importando?"Importando...":"Importar Excel"}
                  </button>
                  <button className="btn btn-primary" onClick={()=>setModalAgregar(true)}>+ Agregar</button>
                </div>
              </div>
              <div className="search-bar">
                <input className="search-input" placeholder="Buscar por modelo, marca o categoria..." value={busqueda} onChange={e=>setBusqueda(e.target.value)}/>
                <select className="filter-select" value={filtrocat} onChange={e=>setFiltrocat(e.target.value)}>
                  {categoriasList.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>#</th><th>Categoria</th><th>Marca</th><th>Modelo</th><th>Precio (S/)</th><th>Stock</th><th>Valor total</th><th>Accion</th></tr></thead>
                  <tbody>
                    {datosFiltrados.map(d=>(
                      <tr key={d.id}>
                        <td>{d.id}</td>
                        <td><span className={badgeClass(d.categoria)}>{d.categoria}</span></td>
                        <td>{d.marca}</td>
                        <td><input value={d.modelo||""} onChange={e=>handleEdit(d.id,"modelo",e.target.value)}/></td>
                        <td><input type="number" value={d.precio||0} onChange={e=>handleEdit(d.id,"precio",Number(e.target.value))}/></td>
                        <td><input type="number" value={d.stock||0} onChange={e=>handleEdit(d.id,"stock",Number(e.target.value))}/></td>
                        <td>S/ {((d.precio||0)*(d.stock||0)).toLocaleString()}</td>
                        <td><button className="btn btn-danger" onClick={()=>eliminarProducto(d.id)}>🗑</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {seccion==="graficos" && <Graficos datos={datos} oscuro={temaOscuro}/>}

          {seccion==="entradas" && (
            <div>
              {productosStockBajo.length > 0 && (
                <div className="alerta-stock">
                  <h4>Alerta de stock minimo — {productosStockBajo.length} productos</h4>
                  {productosStockBajo.slice(0,10).map(p => (
                    <div key={p.id}>• {p.categoria} — {p.modelo} — Stock: {p.stock} unidades</div>
                  ))}
                  {productosStockBajo.length > 10 && <div>...y {productosStockBajo.length - 10} mas</div>}
                </div>
              )}
              <div className="table-section">
                <div className="table-header">
                  <h2>Registro de movimientos ({movimientosFiltrados.length})</h2>
                  <div className="table-actions"><button className="btn btn-print" onClick={handlePrint}>🖨 Imprimir</button></div>
                </div>
                <div className="mov-form">
                  <input className="prov-input" placeholder="Fecha (ej: 2026-03-21)" value={nuevoMov.fecha} onChange={e=>setNuevoMov({...nuevoMov,fecha:e.target.value})}/>
                  <input className="prov-input" placeholder="Producto" value={nuevoMov.producto} onChange={e=>setNuevoMov({...nuevoMov,producto:e.target.value})}/>
                  <select className="mov-select" value={nuevoMov.tipo} onChange={e=>setNuevoMov({...nuevoMov,tipo:e.target.value})}><option>Entrada</option><option>Salida</option></select>
                  <input className="prov-input" placeholder="Cantidad" type="number" value={nuevoMov.cantidad} onChange={e=>setNuevoMov({...nuevoMov,cantidad:e.target.value})}/>
                  <input className="prov-input" placeholder="Costo S/" type="number" value={nuevoMov.costo} onChange={e=>setNuevoMov({...nuevoMov,costo:e.target.value})}/>
                  <input className="prov-input" placeholder="Responsable" value={nuevoMov.responsable} onChange={e=>setNuevoMov({...nuevoMov,responsable:e.target.value})}/>
                  <button className="btn btn-primary" style={{gridColumn:"1/-1"}} onClick={agregarMovimiento}>+ Registrar movimiento</button>
                </div>
                <div className="filtro-fecha">
                  <label>Filtrar por fecha:</label>
                  <input type="date" value={filtroFecha.desde} onChange={e=>setFiltroFecha({...filtroFecha,desde:e.target.value})}/>
                  <label>hasta</label>
                  <input type="date" value={filtroFecha.hasta} onChange={e=>setFiltroFecha({...filtroFecha,hasta:e.target.value})}/>
                  <button className="btn btn-outline" onClick={()=>setFiltroFecha({desde:"",hasta:""})}>Limpiar</button>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Costo S/</th><th>Responsable</th></tr></thead>
                    <tbody>
                      {movimientosFiltrados.map((m,i)=>(
                        <tr key={m.id||i}>
                          <td>{m.fecha}</td><td>{m.producto}</td>
                          <td><span className={`badge ${m.tipo==="Entrada"?"badge-monitor":"badge-gpu"}`}>{m.tipo}</span></td>
                          <td>{m.cantidad}</td><td>S/ {(Number(m.costo)||0).toLocaleString()}</td><td>{m.responsable}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {seccion==="proveedores" && (
            <div className="table-section">
              <div className="table-header">
                <h2>Proveedores registrados</h2>
                <div className="table-actions"><button className="btn btn-print" onClick={handlePrint}>🖨 Imprimir</button></div>
              </div>
              <div className="prov-form">
                <input className="prov-input" placeholder="Nombre proveedor" value={nuevoProv.nombre}   onChange={e=>setNuevoProv({...nuevoProv,nombre:e.target.value})}/>
                <input className="prov-input" placeholder="Producto"         value={nuevoProv.producto} onChange={e=>setNuevoProv({...nuevoProv,producto:e.target.value})}/>
                <input className="prov-input" placeholder="Precio rango"     value={nuevoProv.precio}   onChange={e=>setNuevoProv({...nuevoProv,precio:e.target.value})}/>
                <input className="prov-input" placeholder="Tiempo entrega"   value={nuevoProv.entrega}  onChange={e=>setNuevoProv({...nuevoProv,entrega:e.target.value})}/>
                <input className="prov-input" placeholder="Contacto / email" value={nuevoProv.contacto} onChange={e=>setNuevoProv({...nuevoProv,contacto:e.target.value})} style={{gridColumn:"1/-1"}}/>
                <button className="btn btn-primary" style={{gridColumn:"1/-1"}} onClick={agregarProveedor}>+ Agregar proveedor</button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>#</th><th>Proveedor</th><th>Producto</th><th>Precio</th><th>Entrega</th><th>Contacto</th><th>Accion</th></tr></thead>
                  <tbody>
                    {proveedores.map((p,i)=>(
                      <tr key={p.id||i}>
                        <td>{i+1}</td><td>{p.nombre}</td><td>{p.producto}</td>
                        <td>{p.precio}</td><td>{p.entrega}</td><td>{p.contacto}</td>
                        <td><button className="btn btn-danger" onClick={()=>eliminarProveedor(p.id)}>🗑</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        {/* CHATBOT */}
        <div className="chatbot">
          {chat && (
            <div className="chat-window">
              <div className="chat-head">
                <img
                  src={EAGLE_LOGO}
                  alt="Eagle Bot"
                  className="chat-avatar"
                  onError={e=>{e.target.style.display="none"}}
                />
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                    <span>Eagle Bot</span>
                    <div className="chat-dot"/>
                  </div>
                  <div style={{fontSize:"10px",opacity:0.7,marginTop:"2px"}}>Eagle Gaming Peru</div>
                </div>
                {waEstado === "conectado" && (
                  <span style={{marginLeft:"auto",fontSize:"10px",color:"#34d399",background:"rgba(52,211,153,0.15)",padding:"2px 8px",borderRadius:"10px"}}>📱 WA ✅</span>
                )}
              </div>

              {waEstado !== "conectado" && waQR && (
                <div style={{padding:"12px 16px",borderBottom:temaOscuro?"1px solid rgba(255,255,255,0.06)":"1px solid rgba(0,0,0,0.08)",background:temaOscuro?"#1c1c26":"#f5f5fa",display:"flex",flexDirection:"column",alignItems:"center",gap:"6px"}}>
                  <span style={{fontSize:"11px",color:muted,textTransform:"uppercase",letterSpacing:".06em"}}>📱 Vincular WhatsApp</span>
                  <img src={waQR} style={{width:"150px",borderRadius:"8px",background:"white",padding:"8px"}} alt="QR WhatsApp"/>
                  <span style={{fontSize:"10px",color:muted,textAlign:"center",lineHeight:"1.4"}}>WhatsApp → 3 puntos → Dispositivos vinculados</span>
                </div>
              )}

              {waEstado === "conectado" && (
                <div style={{padding:"8px 16px",background:"rgba(52,211,153,0.08)",borderBottom:"1px solid rgba(52,211,153,0.15)",fontSize:"11px",color:"#059669",textAlign:"center"}}>
                  ✅ WhatsApp conectado y activo
                </div>
              )}

              <div className="chat-messages">
                {msgs.map((m,i)=>(
                  <div key={i} className={`chat-msg ${m.from}`}>
                    {m.typing ? <span className="typing-dots"><span>●</span><span>●</span><span>●</span></span> : m.text}
                  </div>
                ))}
                <div ref={chatEndRef}/>
              </div>

              <div className="chat-input-row">
                <input className="chat-input" placeholder="Pregunta sobre el inventario..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSend()}/>
                <button className="chat-send" onClick={handleSend}>➤</button>
              </div>
            </div>
          )}
          <button className="chat-toggle" onClick={()=>setChat(!chat)}>
            {chat
              ? <span style={{fontSize:"20px",color:"white"}}>✕</span>
              : <img src={EAGLE_LOGO} alt="Eagle Bot" onError={e=>{e.target.style.display="none";e.target.parentElement.innerHTML='<span style="font-size:22px">🤖</span>'}}/>
            }
          </button>
        </div>
      </div>
    </>
  );
}