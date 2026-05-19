import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  totalTank1Points,
  totalTank2Points,
  totalTank3Points,
  totalTank4Points,
} from "./totalVilankuloCalibration";
import {
  petromocTank1Points,
  petromocTank2Points,
  petromocTank3Points,
  petromocTank4Points,
} from "./petromocVilankuloCalibration";

const GOOGLE_SHEETS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbylMjygoZuQvGRl3Ji0SgAwKMvikXp2Rcp0t6hS2BaoDXMukPAQUspmHOiETUMgpgzS/exec";
const USERS_SHEET_ACTION_GET = "getUsers";
const USERS_SHEET_ACTION_SAVE = "saveUsers";

const styles = `
  * { box-sizing: border-box; }
  body { margin: 0; }
  .app-shell { min-height: 100vh; background: #f1f5f9; padding: 24px; font-family: Arial, sans-serif; color: #0f172a; }
  .app-container { max-width: 1180px; margin: 0 auto; display: grid; gap: 22px; }
  .app-header { display: flex; justify-content: space-between; gap: 12px; align-items: center; flex-wrap: nowrap; }
  .app-title { margin: 0; font-size: 34px; line-height: 1.1; }
  .app-subtitle { margin: 8px 0 0; color: #475569; }
  .status-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; position: relative; }
  .status-pill { background: #fff; border-radius: 999px; padding: 10px 14px; font-size: 13px; box-shadow: 0 4px 16px rgba(15,23,42,.07); }
  .app-brand { flex: 0 0 auto; min-width: 0; }
  .header-controls { flex: 1 1 auto; min-width: 0; flex-wrap: nowrap; gap: 12px; justify-content: flex-end; }
  .station-top-select { flex: 1 1 auto; width: auto; min-width: 0; max-width: 260px; min-height: 36px; height: 36px; font-size: 11px; font-weight: 600; padding: 4px 30px 4px 12px; border-radius: 999px; }
  .station-top-pill { flex: 1 1 auto; max-width: 260px; min-width: 0; background: #fff; border: 1px solid #cbd5e1; border-radius: 999px; padding: 9px 12px; font-size: 11px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-shadow: 0 4px 16px rgba(15,23,42,.07); }
  .user-menu-wrap { position: relative; }
  .user-circle { width: 42px; height: 42px; border-radius: 999px; border: 0; background: #0f172a; color: #fff; font-weight: 900; cursor: pointer; display: grid; place-items: center; box-shadow: 0 6px 18px rgba(15,23,42,.18); }
  .user-dropdown { position: absolute; right: 0; top: 50px; min-width: 190px; background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 16px 40px rgba(15,23,42,.16); padding: 10px; z-index: 90; display: grid; gap: 8px; }
  .user-dropdown-title { margin: 0; font-size: 13px; font-weight: 900; }
  .user-dropdown-subtitle { margin: 2px 0 0; font-size: 11px; color: #64748b; }
  .card { background: #fff; border-radius: 18px; box-shadow: 0 8px 24px rgba(15,23,42,.08); border: 1px solid #e2e8f0; }
  .card-content { padding: 22px; }
  .page-nav { display: flex; gap: 10px; flex-wrap: wrap; }
  .page-tab { border: 1px solid #cbd5e1; background: #fff; color: #0f172a; border-radius: 999px; padding: 12px 16px; font-weight: 900; cursor: pointer; }
  .page-tab.active { background: #0f172a; color: #fff; border-color: #0f172a; }
  .report-tabs { display: grid; grid-template-columns: repeat(3,minmax(160px,1fr)); gap: 10px; margin-bottom: 18px; }
  .report-tab { border: 1px solid #cbd5e1; background: #fff; color: #0f172a; border-radius: 16px; padding: 14px; font-weight: 900; cursor: pointer; text-align: left; }
  .report-tab.active { background: #0f172a; color: #fff; border-color: #0f172a; }
  .report-tab span { display: block; font-size: 12px; font-weight: 500; opacity: .75; margin-top: 4px; }
  .primary-button,.secondary-button,.logout-button { border: 0; border-radius: 14px; padding: 12px 16px; font-weight: 800; cursor: pointer; min-height: 46px; }
  .primary-button { background: #0f172a; color: #fff; }
  .primary-button:disabled,.secondary-button:disabled { opacity: .55; cursor: not-allowed; }
  .secondary-button,.logout-button { border: 1px solid #cbd5e1; background: #fff; color: #0f172a; }
  .form-grid { display: grid; gap: 16px; }
  .section-title { display: flex; align-items: center; gap: 10px; }
  .section-title h2 { margin: 0; font-size: 22px; }
  .field-label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 700; color: #334155; }
  .field-input { width: 100%; border: 1px solid #cbd5e1; border-radius: 12px; padding: 11px 12px; font-size: 16px; outline: none; background: #fff; min-height: 46px; }
  .small-text { font-size: 12px; color: #64748b; margin-top: 6px; }
  .error-text { color: #dc2626; font-weight: 700; }
  .metric-grid,.report-metrics,.import-summary { display: grid; grid-template-columns: repeat(2,minmax(160px,1fr)); gap: 12px; }
  .report-metrics,.import-summary { grid-template-columns: repeat(4,minmax(120px,1fr)); }
  .metric-box { background: #f8fafc; border-radius: 16px; padding: 16px; border: 1px solid #e2e8f0; }
  .metric-label { margin: 0; font-size: 12px; color: #64748b; }
  .metric-value { margin: 8px 0 0; font-size: 25px; font-weight: 900; }
  .metric-box.diesel,.product-badge.diesel { background: #fef3c7; color: #92400e; border-color: #fcd34d; }
  .metric-box.petrol,.product-badge.petrol { background: #dcfce7; color: #166534; border-color: #4ade80; }
  .tank-visual { position: relative; height: 70px; width: 100%; overflow: hidden; border-radius: 16px; border: 3px solid #334155; background: #fff; box-shadow: inset 0 2px 18px rgba(15,23,42,.15); }
  .tank-fill { position: absolute; left: 0; top: 0; bottom: 0; transition: width 350ms ease; }
  .tank-fill.level-empty { background: linear-gradient(to right,#991b1b,#ef4444); }
  .tank-fill.level-low { background: linear-gradient(to right,#dc2626,#fb7185); }
  .tank-fill.level-warning { background: linear-gradient(to right,#ea580c,#fb923c); }
  .tank-fill.level-medium { background: linear-gradient(to right,#ca8a04,#facc15); }
  .tank-fill.level-good { background: linear-gradient(to right,#65a30d,#a3e635); }
  .tank-fill.level-full { background: linear-gradient(to right,#15803d,#4ade80); }
  .tank-center { position: absolute; inset: 0; display: grid; place-items: center; }
  .tank-badge { background: rgba(255,255,255,.86); border-radius: 14px; padding: 7px 10px; text-align: center; box-shadow: 0 8px 20px rgba(15,23,42,.12); }
  .tank-status-badge { border-radius: 999px; padding: 7px 11px; font-size: 12px; font-weight: 900; color: #fff; background: var(--level-color,#0f172a); }
  .history-header { margin-bottom: 16px; display: flex; justify-content: space-between; gap: 14px; align-items: center; flex-wrap: wrap; }
  .history-header h2 { margin: 0; font-size: 22px; }
  .history-header p { margin: 6px 0 0; font-size: 13px; color: #64748b; }
  .history-table-wrap { overflow-x: auto; }
  .history-table { width: 100%; min-width: 950px; border-collapse: collapse; font-size: 14px; }
  .history-table th,.history-table td { text-align: left; padding: 12px 8px; }
  .history-table thead tr,.history-table tbody tr { border-bottom: 1px solid #e2e8f0; }
  .history-table thead { color: #64748b; }
  .history-row-diesel { background: #fef9c3; }
  .history-row-petrol { background: #dcfce7; }
  .history-level-cell { min-width: 160px; }
  .history-level-bar { width: 140px; height: 14px; border-radius: 999px; overflow: hidden; background: #e2e8f0; border: 1px solid #cbd5e1; }
  .history-level-fill { height: 100%; width: var(--history-level-width,0%); background: var(--level-color,#0f172a); border-radius: 999px; }
  .history-level-text { display: flex; gap: 8px; align-items: center; margin-top: 5px; font-size: 12px; font-weight: 900; color: var(--level-color,#0f172a); }
  .unloading-grid { display: grid; grid-template-columns: repeat(3,minmax(160px,1fr)); gap: 12px; }
  .unloading-actions,.filter-actions { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
  .edit-banner,.warning-box { background: #fff7ed; border: 1px solid #fb923c; color: #9a3412; border-radius: 14px; padding: 12px 14px; font-size: 13px; font-weight: 800; }
  .edit-banner { background: #eff6ff; border-color: #93c5fd; color: #1e3a8a; }
  .filter-panel,.import-box,.diagnostic-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; display: grid; gap: 14px; }
  .import-box { border: 2px dashed #94a3b8; }
  .diagnostic-box { background: #f8fafc; border-color: #cbd5e1; font-size: 13px; color: #334155; }
  .report-list { display: grid; gap: 14px; }
  .report-card { border: 1px solid #e2e8f0; border-radius: 16px; background: #f8fafc; padding: 16px; display: grid; gap: 12px; }
  .report-top { display: flex; justify-content: space-between; gap: 14px; flex-wrap: wrap; align-items: flex-start; }
  .report-title { margin: 0; font-size: 18px; font-weight: 900; }
  .report-subtitle { margin: 5px 0 0; font-size: 13px; color: #64748b; }
  .report-pill { border-radius: 999px; background: #e2e8f0; padding: 7px 11px; font-size: 12px; font-weight: 900; }
  .report-lines { display: grid; gap: 8px; }
  .report-line { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px; font-size: 13px; line-height: 1.45; }
  .report-line.diesel { background: #fef9c3; border-color: #facc15; }
  .report-line.petrol { background: #dcfce7; border-color: #4ade80; }
  .daily-mobile-list, .reading-history-mobile-list { display: none; }
  .daily-mobile-card { border: 1px solid #e2e8f0; border-radius: 14px; padding: 10px; display: grid; gap: 8px; }
  .daily-mobile-card.diesel { background: #fef9c3; border-color: #facc15; }
  .daily-mobile-card.petrol { background: #dcfce7; border-color: #4ade80; }
  .daily-mobile-top { display: flex; justify-content: space-between; gap: 8px; align-items: center; }
  .daily-mobile-title { margin: 0; font-size: 15px; font-weight: 900; }
  .daily-mobile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; align-items: end; }
  .daily-mobile-result { background: rgba(255,255,255,.65); border: 1px solid rgba(15,23,42,.08); border-radius: 10px; padding: 7px; }
  .daily-mobile-result .metric-label { font-size: 10px; }
  .daily-mobile-result .metric-value { font-size: 15px; margin-top: 2px; }
  .reading-history-mobile-card { border: 1px solid #e2e8f0; border-radius: 14px; padding: 9px; display: grid; gap: 7px; }
  .reading-history-mobile-card.diesel { background: #fef9c3; border-color: #facc15; }
  .reading-history-mobile-card.petrol { background: #dcfce7; border-color: #4ade80; }
  .reading-history-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .reading-history-title { display: flex; align-items: center; gap: 7px; min-width: 0; }
  .reading-history-title strong { white-space: nowrap; }
  .reading-history-date { font-size: 11px; color: #64748b; white-space: nowrap; }
  .reading-history-line { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; background: rgba(255,255,255,.55); border: 1px solid rgba(15,23,42,.07); border-radius: 10px; padding: 7px; }
  .reading-history-line span { font-size: 11px; color: #64748b; font-weight: 900; text-transform: uppercase; }
  .reading-history-line strong { font-size: 14px; }
  .reading-history-meta { display: flex; justify-content: space-between; gap: 8px; font-size: 11px; color: #64748b; }
  .reading-history-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .product-badge { display: inline-flex; align-items: center; gap: 6px; border-radius: 999px; padding: 6px 10px; font-size: 12px; font-weight: 900; border: 1px solid transparent; }
  .metric-box.diesel-diff { background: #fff7ed; border-color: #fb923c; }
  .metric-box.petrol-diff { background: #ecfdf5; border-color: #22c55e; }
  .variance-positive { color: #15803d; }
  .variance-negative { color: #dc2626; }

  .user-management-grid { display: grid; grid-template-columns: minmax(240px, 340px) 1fr; gap: 16px; align-items: start; }
  .user-list { display: grid; gap: 10px; }
  .user-list-button { width: 100%; text-align: left; border: 1px solid #e2e8f0; background: #fff; border-radius: 14px; padding: 12px; cursor: pointer; }
  .user-list-button.active { border-color: #0f172a; box-shadow: inset 0 0 0 1px #0f172a; }
  .permission-grid { display: grid; grid-template-columns: repeat(2,minmax(180px,1fr)); gap: 10px; }
  .permission-item { border: 1px solid #e2e8f0; border-radius: 14px; background: #f8fafc; padding: 12px; display: flex; gap: 10px; align-items: flex-start; }
  .permission-item input { margin-top: 3px; }
  .permission-title { font-weight: 900; font-size: 13px; }
  .permission-help { margin-top: 3px; color: #64748b; font-size: 12px; line-height: 1.35; }
  .login-shell { min-height: 100vh; background: linear-gradient(135deg,#0f172a,#334155); padding: 20px; display: grid; place-items: center; font-family: Arial,sans-serif; color: #0f172a; }
  .login-card { width: 100%; max-width: 420px; background: #fff; border-radius: 24px; box-shadow: 0 24px 70px rgba(0,0,0,.35); padding: 24px; display: grid; gap: 18px; }
  .login-logo { height: 58px; width: 58px; border-radius: 18px; background: #0f172a; color: #fff; display: grid; place-items: center; font-size: 28px; }
  .login-title { margin: 0; font-size: 28px; line-height: 1.1; }
  .login-subtitle { margin: 8px 0 0; color: #64748b; line-height: 1.5; }
  .login-form { display: grid; gap: 14px; }
  .login-error { margin: 0; background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; border-radius: 14px; padding: 10px 12px; font-size: 13px; font-weight: 700; }
  @media (max-width:760px) {
    html, body { width: 100%; overflow-x: hidden; background: #f1f5f9; }
    .app-shell { padding: 4px 8px 16px; }
    .app-container { width: 100%; max-width: 100%; gap: 8px; }
    .app-header { position: sticky; top: 0; z-index: 80; background: rgba(241,245,249,.96); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 4px 0; margin: 0; flex-wrap: nowrap; }
    .app-brand { flex: 0 0 30px; width: 30px; min-width: 30px; }
    .app-title { font-size: 14px; line-height: 1; margin: 0; }
    .app-subtitle { display: none; }
    .status-row { display: flex; flex: 1 1 auto; min-width: 0; width: auto; gap: 10px; align-items:center; flex-wrap: nowrap; justify-content: flex-end; }
    .status-pill { display: none; }
    .station-top-select { flex: 1 1 auto; width: auto; min-width: 0; max-width: none; min-height: 34px; height: 34px; font-size: 10px; font-weight:500; padding: 4px 28px 4px 10px; border-radius: 999px; }
    .station-top-pill { flex: 1 1 auto; min-width: 0; font-size: 10px; font-weight:500; padding: 8px 10px; max-width: none; overflow: hidden; text-overflow: ellipsis; }
    .header-controls { gap: 10px; }
    .logout-button { width: 100%; min-height: 38px; padding: 8px 10px; font-size: 13px; border-radius: 12px; }
    .user-circle { width: 34px; height: 34px; font-size: 12px; }
    .user-dropdown { top: 40px; right: 0; min-width: 180px; }
    .page-nav { position: sticky; top: 42px; z-index: 70; display: grid; grid-template-columns: repeat(auto-fit,minmax(58px,1fr)); gap: 3px; background: rgba(255,255,255,.96); border: 1px solid #e2e8f0; box-shadow: 0 6px 18px rgba(15,23,42,.09); padding: 4px; border-radius: 12px; backdrop-filter: blur(10px); }
    .page-tab { border: 0; border-radius: 9px; padding: 5px 2px; min-height: 40px; font-size: 9px; line-height: 1.1; display: grid; place-items: center; text-align: center; white-space: normal; }
    .page-tab.active { background: #0f172a; color: #fff; }
    .unloading-grid { grid-template-columns: 1fr; gap: 12px; }
    .card { border-radius: 16px; box-shadow: 0 5px 18px rgba(15,23,42,.07); }
    .card-content { padding: 12px; }
    .form-grid { gap: 12px; }
    .section-title h2 { font-size: 18px; }
    .field-label { font-size: 13px; }
    .field-input { min-height: 44px; font-size: 16px; border-radius: 12px; padding: 9px 10px; }
    .daily-mobile-list, .reading-history-mobile-list { display: grid; gap: 8px; }
    .daily-desktop-table { display: none; }
    .daily-mobile-card .field-input { min-height: 40px; padding: 8px 10px; }
    .daily-mobile-card .field-label { margin-bottom: 3px; font-size: 11px; }
    .daily-mobile-card .small-text { margin-top: 2px; font-size: 10px; }
    .daily-mobile-card .product-badge, .reading-history-mobile-card .product-badge { padding: 4px 8px; font-size: 10px; }
    .reading-history-desktop-table { display: none; }
    .reading-history-mobile-card .secondary-button { min-height: 34px; padding: 7px 10px; border-radius: 10px; font-size: 12px; }
    .daily-actions .primary-button, .daily-actions .secondary-button { min-height: 42px; font-size: 14px; border-radius: 13px; }
    .primary-button, .secondary-button { width: 100%; min-height: 50px; font-size: 15px; border-radius: 16px; }
    .metric-grid, .report-metrics, .import-summary { grid-template-columns: 1fr; gap: 10px; }
    .station-card .card-content { padding: 7px 9px; gap: 5px; }
    .station-card .section-title { display: none; }
    .station-card .field-input { min-height: 34px; padding: 5px 8px; font-size: 12px; border-radius: 10px; }
    .station-card .small-text { font-size: 10px; margin-top: 2px; line-height: 1.2; }
    .dashboard-card .card-content { padding: 8px; gap: 8px; }
    .dashboard-card .section-title h2 { font-size: 16px; }
    .dashboard-card .section-title span { font-size: 18px !important; }
    .dashboard-card > .card-content > .small-text { display: none; }
    .dashboard-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .dashboard-summary .metric-box { padding: 8px; border-radius: 12px; }
    .dashboard-summary .metric-label { font-size: 10px; }
    .dashboard-summary .metric-value { font-size: 15px; margin-top: 3px; }
    .dashboard-summary .small-text { font-size: 9px; margin-top: 3px; }
    .dashboard-tanks { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .dashboard-tank-card { padding: 8px !important; border-radius: 12px; gap: 5px !important; }
    .dashboard-tank-card .metric-label { font-size: 10px; }
    .dashboard-tank-card .metric-value { font-size: 14px !important; margin-top: 2px; }
    .dashboard-tank-card .small-text { font-size: 9px; margin-top: 2px; }
    .dashboard-tank-card .tank-visual { height: 36px; border-radius: 10px; border-width: 2px; }
    .dashboard-tank-card .tank-badge { padding: 3px 6px; font-size: 10px; border-radius: 8px; }
    .dashboard-tank-card .metric-grid { grid-template-columns: 1fr 1fr !important; gap: 4px; }
    .dashboard-tank-card .tank-status-badge { padding: 4px 7px; font-size: 9px; }
    .metric-box { padding: 12px; border-radius: 15px; }
    .metric-value { font-size: 20px; }
    .tank-visual { height: 70px; border-radius: 16px; border-width: 3px; }
    .history-header { display: grid; gap: 12px; }
    .history-table-wrap { overflow: visible; width: 100%; }
    .history-table { width: 100%; min-width: 0; border-collapse: separate; border-spacing: 0 10px; font-size: 14px; }
    .history-table thead { display: none; }
    .history-table tbody, .history-table tr, .history-table td { display: block; width: 100%; }
    .history-table tbody tr { border: 1px solid #e2e8f0; border-radius: 16px; padding: 10px; background: #fff; box-shadow: 0 4px 14px rgba(15,23,42,.06); margin-bottom: 10px; overflow: hidden; }
    .history-table tbody tr.history-row-diesel { background: #fef9c3; border-color: #facc15; }
    .history-table tbody tr.history-row-petrol { background: #dcfce7; border-color: #4ade80; }
    .history-table th, .history-table td { padding: 8px 6px; border-bottom: 1px solid rgba(15,23,42,.08); text-align: left; }
    .history-table td[data-label]::before { content: attr(data-label); display: block; font-size: 11px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: .02em; margin-bottom: 3px; }
    .history-table td:last-child { border-bottom: 0; }
    .history-table .field-input { width: 100%; min-width: 0 !important; }
    .history-level-cell { min-width: 0; }
    .history-level-bar { width: 100%; }
    .report-line { font-size: 12px; }
    .report-top { display: grid; }
    .unloading-actions, .filter-actions { display: grid; grid-template-columns: 1fr; }
    .product-badge { width: max-content; max-width: 100%; }
    .user-management-grid { grid-template-columns: 1fr; }
    .report-tabs { grid-template-columns: 1fr; }
    .permission-grid { grid-template-columns: 1fr; }
    .login-shell { padding: 14px; }
    .login-card { border-radius: 22px; padding: 20px; }
  }
`;

const USER_TEMPLATES = [
  ["admin", "1234", "Administrator", { dashboard: true, daily: true, delivery: true, reports: true, sales: true, clearData: true, editDelivery: true, changeStation: true, refreshCloud: true, users: true, viewCalculated: true }],
  ["manager", "2222", "Manager", { dashboard: true, daily: false, delivery: false, reports: true, sales: true, clearData: false, editDelivery: false, changeStation: true, refreshCloud: true, users: false }],
  ["operator", "1111", "Reading Operator", { dashboard: false, daily: true, delivery: true, reports: false, sales: false, clearData: false, editDelivery: false, changeStation: false, refreshCloud: true, users: false, viewCalculated: false }],
  ["viewer", "9999", "Viewer", { dashboard: true, daily: false, delivery: false, reports: true, sales: false, clearData: false, editDelivery: false, changeStation: false, refreshCloud: true, users: false }],
];

const DEFAULT_USERS = USER_TEMPLATES.map(([username, password, role, permissions]) => ({
  id: username,
  username,
  password,
  role,
  active: true,
  permissions,
}));
const USERS_KEY = "fuelTankUsers";
const SESSION_KEY = "fuelTankLoggedInUser";

const PERMISSION_DEFINITIONS = [
  ["dashboard", "Dashboard", "View tank overview and stock totals"],
  ["daily", "Daily readings", "Enter and view tank readings"],
  ["delivery", "Truck delivery", "Record truck unloading"],
  ["reports", "Reports", "View delivery reports"],
  ["sales", "Sales import", "Import and view NetPOS sales CSV"],
  ["users", "User management", "Create users and edit permissions"],
  ["clearData", "Clear data", "Clear station readings, unloading, and sales imports"],
  ["editDelivery", "Edit delivery", "Edit saved unloading records"],
  ["changeStation", "Change station", "Switch between station profiles"],
  ["refreshCloud", "Google Sheets sync", "Load readings from Google Sheets"],
  ["viewCalculated", "View calculated liters/results", "See liters, ullage, percentages, delivery received liters, differences, reports and history results"],
];

function getDefaultPermissions() {
  return PERMISSION_DEFINITIONS.reduce((permissions, [key]) => ({ ...permissions, [key]: false }), {});
}

function normalizeUserAccount(user) {
  if (!user?.username) return null;
  return {
    id: user.id || String(user.username).toLowerCase(),
    username: String(user.username).trim(),
    password: String(user.password ?? ""),
    role: String(user.role || "Staff"),
    active: user.active !== false,
    stationId: user.stationId || "all",
    permissions: { ...getDefaultPermissions(), ...(user.permissions || {}) },
  };
}

function getStoredUsers() {
  const savedUsers = safeLocalStorageGet(USERS_KEY, null);
  const normalized = Array.isArray(savedUsers) ? savedUsers.map(normalizeUserAccount).filter(Boolean) : [];
  if (normalized.length > 0) return normalized;
  return DEFAULT_USERS.map(normalizeUserAccount).filter(Boolean);
}

function persistUsersList(users) {
  const normalized = users.map(normalizeUserAccount).filter(Boolean);
  safeLocalStorageSet(USERS_KEY, normalized);
  return normalized;
}

function repairUserWithUsers(user, users = getStoredUsers()) {
  if (!user?.username) return null;
  const match = users.find((item) => item.username.toLowerCase() === String(user.username).toLowerCase() && item.active !== false);
  if (!match) return null;
  return { username: match.username, role: match.role, stationId: match.stationId || "all", permissions: { ...getDefaultPermissions(), ...match.permissions } };
}

async function loadUsersFromGoogleSheetsUrl() {
  const callbackName = `fuelTankUsersCallback_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("Document is not available"));
      return;
    }
    const script = document.createElement("script");
    const cleanup = () => {
      if (window[callbackName]) delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
    };
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Users sync did not respond."));
    }, 15000);
    window[callbackName] = (data) => {
      window.clearTimeout(timeout);
      cleanup();
      resolve(data);
    };
    script.onerror = () => {
      window.clearTimeout(timeout);
      cleanup();
      reject(new Error("Users sync script could not load."));
    };
    script.src = `${GOOGLE_SHEETS_WEB_APP_URL}?action=${encodeURIComponent(USERS_SHEET_ACTION_GET)}&callback=${encodeURIComponent(callbackName)}&ts=${Date.now()}`;
    document.body.appendChild(script);
  });
}

async function saveUsersToGoogleSheetsUrl(users) {
  const callbackName = `fuelTankSaveUsersCallback_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const payload = encodeURIComponent(JSON.stringify(users));
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("Document is not available"));
      return;
    }
    const script = document.createElement("script");
    const cleanup = () => {
      if (window[callbackName]) delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
    };
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Users save did not respond."));
    }, 15000);
    window[callbackName] = (data) => {
      window.clearTimeout(timeout);
      cleanup();
      if (data?.success) resolve(data);
      else reject(new Error(data?.error || "Users save failed."));
    };
    script.onerror = () => {
      window.clearTimeout(timeout);
      cleanup();
      reject(new Error("Users save script could not load."));
    };
    script.src = `${GOOGLE_SHEETS_WEB_APP_URL}?action=${encodeURIComponent(USERS_SHEET_ACTION_SAVE)}&users=${payload}&callback=${encodeURIComponent(callbackName)}&ts=${Date.now()}`;
    document.body.appendChild(script);
  });
}

async function saveOneReadingToGoogleSheetsUrl(row) {
  const callbackName = `fuelTankSaveReadingCallback_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const params = new URLSearchParams({
    action: "saveReading",
    callback: callbackName,
    ts: String(Date.now()),
    id: String(row.id || ""),
    date: String(row.date || ""),
    station: String(row.station || ""),
    tank: String(row.tank || ""),
    product: String(row.product || ""),
    mm: String(row.mm || 0),
    liters: String(row.liters || 0),
    percentage: String(row.percentage || 0),
    ullage: String(row.ullage || 0),
    operator: String(row.operator || ""),
  });

  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("Document is not available"));
      return;
    }
    const script = document.createElement("script");
    const cleanup = () => {
      if (window[callbackName]) delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
    };
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Reading save did not respond. Check Apps Script deployment/access."));
    }, 15000);
    window[callbackName] = (data) => {
      window.clearTimeout(timeout);
      cleanup();
      if (data?.success) resolve(data);
      else reject(new Error(data?.error || "Reading save failed."));
    };
    script.onerror = () => {
      window.clearTimeout(timeout);
      cleanup();
      reject(new Error("Reading save script could not load. Open the Web App URL and check access is Anyone."));
    };
    script.src = `${GOOGLE_SHEETS_WEB_APP_URL}?${params.toString()}`;
    document.body.appendChild(script);
  });
}

async function saveReadingsToGoogleSheetsUrl(readings) {
  const rows = Array.isArray(readings) ? readings : [readings];
  let saved = 0;
  for (const row of rows) {
    await saveOneReadingToGoogleSheetsUrl(row);
    saved += 1;
  }
  return { success: true, type: "readings", saved };
}

async function saveOneDeliveryToGoogleSheetsUrl(row) {
  const callbackName = `fuelTankSaveDeliveryCallback_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const params = new URLSearchParams({
    action: "saveDelivery",
    callback: callbackName,
    ts: String(Date.now()),
    id: String(row.id || ""),
    deliveryId: String(row.deliveryId || ""),
    date: String(row.date || ""),
    updatedAt: String(row.updatedAt || ""),
    station: String(row.station || ""),
    tank: String(row.tank || ""),
    product: String(row.product || ""),
    initialMm: String(row.initialMm || 0),
    finalMm: String(row.finalMm || 0),
    initialLiters: String(row.initialLiters || 0),
    finalLiters: String(row.finalLiters || 0),
    deliveredLiters: String(row.deliveredLiters || 0),
    invoiceLiters: String(row.invoiceLiters || 0),
    variance: String(row.variance || 0),
    reference: String(row.reference || ""),
    truckPlate: String(row.truckPlate || ""),
    driverName: String(row.driverName || ""),
    operator: String(row.operator || ""),
  });

  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("Document is not available"));
      return;
    }
    const script = document.createElement("script");
    const cleanup = () => {
      if (window[callbackName]) delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
    };
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Delivery save did not respond. Check Apps Script deployment/access."));
    }, 15000);
    window[callbackName] = (data) => {
      window.clearTimeout(timeout);
      cleanup();
      if (data?.success) resolve(data);
      else reject(new Error(data?.error || "Delivery save failed."));
    };
    script.onerror = () => {
      window.clearTimeout(timeout);
      cleanup();
      reject(new Error("Delivery save script could not load. Open the Web App URL and check access is Anyone."));
    };
    script.src = `${GOOGLE_SHEETS_WEB_APP_URL}?${params.toString()}`;
    document.body.appendChild(script);
  });
}

async function saveDeliveriesToGoogleSheetsUrl(deliveries) {
  const rows = Array.isArray(deliveries) ? deliveries : [deliveries];
  let saved = 0;
  for (const row of rows) {
    await saveOneDeliveryToGoogleSheetsUrl(row);
    saved += 1;
  }
  return { success: true, type: "deliveries", saved };
}
const HISTORY_KEY = "fuelTankReadingHistory";
const UNLOADING_HISTORY_KEY = "fuelTankUnloadingHistory";
const SALES_IMPORT_HISTORY_KEY = "fuelTankSalesImportHistory";

function getCurrentTimestamp() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function interpolateLiters(mm, points = []) {
  const value = Number(mm);
  if (!Array.isArray(points) || points.length === 0 || !Number.isFinite(value) || value < 0) return 0;

  const sorted = points
    .map((point) => [Number(point?.[0]), Number(point?.[1])])
    .filter(([height, liters]) => Number.isFinite(height) && Number.isFinite(liters))
    .sort((a, b) => a[0] - b[0]);

  if (sorted.length === 0) return 0;
  if (value <= sorted[0][0]) return Math.round(sorted[0][1]);
  if (value >= sorted[sorted.length - 1][0]) return Math.round(sorted[sorted.length - 1][1]);

  for (let index = 0; index < sorted.length - 1; index += 1) {
    const [mm1, liters1] = sorted[index];
    const [mm2, liters2] = sorted[index + 1];

    if (value >= mm1 && value <= mm2) {
      const result = mm2 === mm1 ? liters2 : liters1 + ((value - mm1) / (mm2 - mm1)) * (liters2 - liters1);
      return Math.round(result);
    }
  }

  return 0;
}

const stations = {
  petromocVilankulo: {
    name: "PETROMOC VILANKULO",
    location: "Vilankulo",
    tanks: {
      tank1: { name: "Tank 1", product: "Diesel", capacity: 29500, maxMm: 2182, points: petromocTank1Points },
      tank2: { name: "Tank 2", product: "Petrol", capacity: 15250, maxMm: 1715, points: petromocTank2Points },
      tank3: { name: "Tank 3", product: "Diesel", capacity: 10000, maxMm: 1572, points: petromocTank3Points },
      tank4: { name: "Tank 4", product: "Petrol", capacity: 15000, maxMm: 1753, points: petromocTank4Points },
    },
  },
  totalVilankulo: {
    name: "TOTAL VILANKULO",
    location: "Vilankulo",
    tanks: {
      tank1: { name: "Tank 1", product: "Diesel", capacity: 25026, maxMm: 2342, points: totalTank1Points },
      tank2: { name: "Tank 2", product: "Diesel", capacity: 24805, maxMm: 2328, points: totalTank2Points },
      tank3: { name: "Tank 3", product: "Petrol", capacity: 13987, maxMm: 1802, points: totalTank3Points },
      tank4: { name: "Tank 4", product: "Petrol", capacity: 13956, maxMm: 1800, points: totalTank4Points },
    },
  },
};

function makeId() {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function safeLocalStorageGet(key, fallback) {
  if (typeof window === "undefined" || !window.localStorage) return fallback;
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function safeLocalStorageSet(key, value) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function parseSavedDate(value) {
  if (!value) return null;
  const text = String(value).trim();
  if (text.includes("-") && (text.includes("T") || text.includes(" "))) {
    const cleanText = text.replace("T", " ").replace("Z", "");
    const [datePart, timePart = "00:00:00"] = cleanText.split(" ");
    const datePieces = datePart.split("-");
    const timePieces = timePart.split(":");
    if (datePieces.length === 3 && timePieces.length >= 2) {
      const parsedLocal = new Date(Number(datePieces[0]), Number(datePieces[1]) - 1, Number(datePieces[2]), Number(timePieces[0]), Number(timePieces[1]), Number(timePieces[2] || 0));
      if (!Number.isNaN(parsedLocal.getTime())) return parsedLocal;
    }
  }
  if (text.includes("/")) {
    const parts = text.replace(",", " ").replace("  ", " ").split(" ").filter(Boolean);
    const datePieces = (parts[0] || "").split("/");
    const timePieces = (parts[1] || "00:00:00").split(":");
    if (datePieces.length === 3 && timePieces.length >= 2) {
      const suffix = String(parts[2] || "").toUpperCase();
      let hour = Number(timePieces[0]);
      if (suffix === "PM" && hour < 12) hour += 12;
      if (suffix === "AM" && hour === 12) hour = 0;
      const parsedSlash = new Date(Number(datePieces[2]), Number(datePieces[1]) - 1, Number(datePieces[0]), hour, Number(timePieces[1]), Number(timePieces[2] || 0));
      if (!Number.isNaN(parsedSlash.getTime())) return parsedSlash;
    }
  }
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getRowTime(row) {
  const parsed = parseSavedDate(row?.date);
  return parsed ? parsed.getTime() : 0;
}

function sortReadingsNewestFirst(rows = []) {
  return [...rows].sort((a, b) => getRowTime(b) - getRowTime(a));
}

function normalizeReadingRow(row) {
  return {
    id: row?.id || makeId(),
    date: row?.date || row?.created_at || getCurrentTimestamp(),
    station: row?.station || "",
    tank: row?.tank || "",
    product: row?.product || "",
    mm: Number(row?.mm) || 0,
    liters: Number(row?.liters) || 0,
    percentage: Number(row?.percentage) || 0,
    ullage: Number(row?.ullage) || 0,
    operator: row?.operator || "Not entered",
  };
}

function rowsFromGoogleSheetPayload(payload) {
  if (!Array.isArray(payload) || payload.length === 0) return [];
  if (typeof payload[0] === "object" && !Array.isArray(payload[0])) return sortReadingsNewestFirst(payload.map(normalizeReadingRow).filter((row) => row.station && row.tank));
  const rows = payload.slice(1).map((row) => normalizeReadingRow({ id: row?.[0], date: row?.[1], station: row?.[2], tank: row?.[3], product: row?.[4], mm: row?.[5], liters: row?.[6], percentage: row?.[7], ullage: row?.[8], operator: row?.[9] })).filter((row) => row.station && row.tank);
  return sortReadingsNewestFirst(rows);
}

function createTruckDeliveryId(reference, truckPlate, driverName) {
  const raw = `${reference || ""}-${truckPlate || ""}-${driverName || ""}`;
  let cleaned = "";
  let lastDash = false;
  raw.toUpperCase().split("").forEach((character) => {
    const isLetter = character >= "A" && character <= "Z";
    const isNumber = character >= "0" && character <= "9";
    if (isLetter || isNumber) {
      cleaned += character;
      lastDash = false;
    } else if (!lastDash && cleaned) {
      cleaned += "-";
      lastDash = true;
    }
  });
  cleaned = cleaned.endsWith("-") ? cleaned.slice(0, -1) : cleaned;
  return cleaned || "TRUCK-DELIVERY-NOT-ENTERED";
}

function calculateUnloading(initialMm, finalMm, points = [], invoiceLiters = "") {
  const initialValue = Number(initialMm);
  const finalValue = Number(finalMm);
  const invoiceValue = Number(invoiceLiters);
  if (!Number.isFinite(initialValue) || !Number.isFinite(finalValue)) return { initialLiters: 0, finalLiters: 0, deliveredLiters: 0, invoiceLiters: Number.isFinite(invoiceValue) ? invoiceValue : 0, variance: 0 };
  const initialLiters = interpolateLiters(initialValue, points);
  const finalLiters = interpolateLiters(finalValue, points);
  const deliveredLiters = finalLiters - initialLiters;
  const cleanInvoice = Number.isFinite(invoiceValue) ? invoiceValue : 0;
  return { initialLiters, finalLiters, deliveredLiters, invoiceLiters: cleanInvoice, variance: cleanInvoice > 0 ? deliveredLiters - cleanInvoice : 0 };
}

function parseSimpleCsvLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < String(line || "").length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];
    if (character === '"') {
      if (quoted && nextCharacter === '"') {
        current += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (character === "," && !quoted) {
      cells.push(current.trim());
      current = "";
    } else current += character;
  }
  cells.push(current.trim());
  return cells;
}

function cleanReportNumber(value) {
  const text = String(value || "").replaceAll("MT", "").replaceAll("mt", "").replaceAll("L", "").replaceAll("l", "").replaceAll(",", "").trim();
  const number = Number(text.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function isSlashDate(value) {
  const parts = String(value || "").trim().split("/");
  return parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4;
}

function slashDateToIso(value) {
  const parts = String(value || "").trim().split("/");
  if (parts.length !== 3) return "";
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

function getProductClass(product) {
  const value = String(product || "").toLowerCase();
  if (value.includes("diesel")) return "diesel";
  if (value.includes("petrol")) return "petrol";
  return "";
}

function parseNetposWetSalesCsv(text, fallbackStationId = "petromocVilankulo") {
  const lines = String(text || "").replaceAll(String.fromCharCode(13), "").split(String.fromCharCode(10));
  const salesRows = [];
  const skippedRows = [];
  let currentDate = "";
  let stationId = fallbackStationId;
  lines.forEach((line, index) => {
    const cells = parseSimpleCsvLine(line).map((cell) => cell.trim()).filter(Boolean);
    if (cells.length === 0) return;
    const lower = cells.join(" ").toLowerCase();
    if (lower.includes("petromoc")) stationId = "petromocVilankulo";
    const dateCell = cells.find((cell) => isSlashDate(cell));
    if (dateCell && !lower.includes("dates:")) {
      currentDate = dateCell;
      if (cells.length === 1) return;
    }
    if (lower.includes("day total") || lower.includes("grand total")) return;
    const tankCell = cells.find((cell) => Number.isInteger(Number(cell)) && Number(cell) >= 1 && Number(cell) <= 20);
    const litersCell = cells.find((cell) => cell.toLowerCase().includes("l") && cleanReportNumber(cell) > 0);
    if (!currentDate || !tankCell || !litersCell) {
      if (tankCell && !litersCell) skippedRows.push({ line: index + 1, reason: "Tank row found but litres missing" });
      return;
    }
    const station = stations[stationId] || stations.petromocVilankulo;
    const tankId = `tank${tankCell}`;
    const tank = station.tanks?.[tankId];
    const moneyCells = cells.filter((cell) => cell.toLowerCase().includes("mt"));
    salesRows.push({ id: makeId(), date: slashDateToIso(currentDate), displayDate: currentDate, stationId, station: station.name, tankId, tank: tank?.name || `Tank ${tankCell}`, tankNumber: tankCell, product: tank?.product || "Unknown", liters: cleanReportNumber(litersCell), cos: cleanReportNumber(moneyCells[0]), gross: cleanReportNumber(moneyCells[1]), vat: cleanReportNumber(moneyCells[2]), amount: cleanReportNumber(moneyCells[3] || moneyCells[moneyCells.length - 1]) });
  });
  return { rows: salesRows, skippedRows };
}

function getDateInputValue(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getMonthInputValue(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthDateRange(monthValue) {
  if (!monthValue) return { from: "", to: "" };
  const [yearText, monthText] = monthValue.split("-");
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;
  if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) return { from: "", to: "" };
  return { from: getDateInputValue(new Date(year, monthIndex, 1)), to: getDateInputValue(new Date(year, monthIndex + 1, 0)) };
}

function filterRowsByDateRange(rows = [], fromDate = "", toDate = "") {
  const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
  const to = toDate ? new Date(`${toDate}T23:59:59`) : null;
  return rows.filter((row) => {
    const rowDate = parseSavedDate(row.date);
    if (!rowDate) return true;
    if (from && rowDate < from) return false;
    if (to && rowDate > to) return false;
    return true;
  });
}

function buildDeliveryReports(unloadingRows = []) {
  const groups = new Map();
  unloadingRows.forEach((row) => {
    const key = row.deliveryId || createTruckDeliveryId(row.reference, row.truckPlate, row.driverName);
    if (!groups.has(key)) groups.set(key, { deliveryId: key, reference: row.reference || "Not entered", truckPlate: row.truckPlate || "Not entered", driverName: row.driverName || "Not entered", date: row.date, rows: [], totalReceived: 0, totalInvoice: 0, totalVariance: 0, dieselReceived: 0, petrolReceived: 0, dieselVariance: 0, petrolVariance: 0 });
    const group = groups.get(key);
    const delivered = Number(row.deliveredLiters) || 0;
    const invoice = Number(row.invoiceLiters) || 0;
    const variance = Number(row.variance) || 0;
    group.rows.push(row);
    group.totalReceived += delivered;
    group.totalInvoice += invoice;
    group.totalVariance += variance;
    if (getProductClass(row.product) === "diesel") {
      group.dieselReceived += delivered;
      group.dieselVariance += variance;
    }
    if (getProductClass(row.product) === "petrol") {
      group.petrolReceived += delivered;
      group.petrolVariance += variance;
    }
  });
  return Array.from(groups.values()).sort((a, b) => getRowTime(b) - getRowTime(a));
}

function getLatestReadingOnOrBefore(rows = [], targetDate = "", mode = "end") {
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const sorted = [...rows].sort((a, b) => getRowTime(a) - getRowTime(b));
  if (!targetDate) return mode === "start" ? sorted[0] : sorted[sorted.length - 1];
  const target = new Date(`${targetDate}T${mode === "start" ? "00:00:00" : "23:59:59"}`).getTime();
  const candidates = sorted.filter((row) => getRowTime(row) <= target);
  if (candidates.length === 0) return null;
  return candidates[candidates.length - 1];
}

function buildSelectedReadingDifferenceReport(readingRows = [], fromReadingId = "", toReadingId = "") {
  const from = readingRows.find((row) => row.id === fromReadingId);
  const to = readingRows.find((row) => row.id === toReadingId);
  if (!from || !to || from.id === to.id || getRowTime(to) <= getRowTime(from)) return null;

  const startLiters = Number(from.liters) || 0;
  const endLiters = Number(to.liters) || 0;
  const difference = endLiters - startLiters;

  return {
    id: `${from.id}-${to.id}`,
    station: to.station,
    tank: to.tank,
    product: to.product,
    fromDate: from.date,
    toDate: to.date,
    fromMm: Number(from.mm) || 0,
    toMm: Number(to.mm) || 0,
    startLiters,
    endLiters,
    difference,
    fuelOut: difference < 0 ? Math.abs(difference) : 0,
    fuelIn: difference > 0 ? difference : 0,
    fromOperator: from.operator || "Not entered",
    toOperator: to.operator || "Not entered",
  };
}

function buildMultiTankReadingDifferenceReports(stationReadingHistory = [], tankSelections = {}) {
  return Object.entries(tankSelections)
    .map(([tankName, selection]) => {
      const tankRows = stationReadingHistory.filter((row) => row.tank === tankName);
      return buildSelectedReadingDifferenceReport(tankRows, selection?.fromId || "", selection?.toId || "");
    })
    .filter(Boolean)
    .sort((a, b) => String(a.tank).localeCompare(String(b.tank), undefined, { numeric: true }));
}

function buildLastTwoReadingReports(readingRows = []) {
  const groups = new Map();
  readingRows.forEach((row) => {
    const key = `${row.station}|${row.tank}|${row.product}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  });

  const reports = [];
  groups.forEach((rows) => {
    const sorted = [...rows].sort((a, b) => getRowTime(a) - getRowTime(b));
    if (sorted.length < 2) return;
    const from = sorted[sorted.length - 2];
    const to = sorted[sorted.length - 1];
    const startLiters = Number(from.liters) || 0;
    const endLiters = Number(to.liters) || 0;
    const difference = endLiters - startLiters;
    reports.push({
      id: `${from.id}-${to.id}`,
      station: to.station,
      tank: to.tank,
      product: to.product,
      fromDate: from.date,
      toDate: to.date,
      fromMm: Number(from.mm) || 0,
      toMm: Number(to.mm) || 0,
      startLiters,
      endLiters,
      difference,
      fuelOut: difference < 0 ? Math.abs(difference) : 0,
      fuelIn: difference > 0 ? difference : 0,
      fromOperator: from.operator || "Not entered",
      toOperator: to.operator || "Not entered",
    });
  });

  return reports.sort((a, b) => String(a.tank).localeCompare(String(b.tank), undefined, { numeric: true }));
}

function getTankLevelInfo(percentage) {
  const value = Number(percentage) || 0;
  if (value <= 10) return { className: "level-empty", label: "Empty / Critical", color: "#dc2626" };
  if (value <= 25) return { className: "level-low", label: "Low", color: "#ef4444" };
  if (value <= 45) return { className: "level-warning", label: "Warning", color: "#f97316" };
  if (value <= 65) return { className: "level-medium", label: "Medium", color: "#eab308" };
  if (value <= 85) return { className: "level-good", label: "Good", color: "#84cc16" };
  return { className: "level-full", label: "Full / Near Full", color: "#22c55e" };
}

function formatNumber(value, digits = 0) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(Number(value) || 0);
}

function isStandaloneApp() {
  if (typeof window === "undefined") return false;
  return Boolean(window.matchMedia?.("(display-mode: standalone)").matches || window.navigator?.standalone === true);
}

function repairUser(user) {
  return repairUserWithUsers(user);
}

function getDefaultPageForUser(user) {
  const cleanUser = repairUser(user) || user;
  if (cleanUser?.permissions?.dashboard && cleanUser?.permissions?.viewCalculated) return "dashboard";
  if (cleanUser?.permissions?.daily) return "daily";
  if (cleanUser?.permissions?.delivery) return "delivery";
  if (cleanUser?.permissions?.reports && cleanUser?.permissions?.viewCalculated) return "reports";
  if (cleanUser?.permissions?.sales && cleanUser?.permissions?.viewCalculated) return "sales";
  if (cleanUser?.permissions?.users) return "users";
  return "dashboard";
}

function Card({ children, style, className = "" }) {
  return <div className={`card ${className}`} style={style}>{children}</div>;
}

function FieldLabel({ children }) {
  return <label className="field-label">{children}</label>;
}

function ProductBadge({ product }) {
  return <span className={`product-badge ${getProductClass(product)}`}>{product}</span>;
}

function HistoryLevelVisual({ percentage }) {
  const level = getTankLevelInfo(percentage);
  const safePercentage = Math.max(0, Math.min(Number(percentage) || 0, 100));
  return <div className="history-level-cell" style={{ "--level-color": level.color }}><div className="history-level-bar"><div className="history-level-fill" style={{ "--history-level-width": `${safePercentage}%` }} /></div><div className="history-level-text"><span>{formatNumber(safePercentage)}%</span><span>{level.label}</span></div></div>;
}

export default function FuelTankPWAPrototype() {
  const [users, setUsers] = useState(() => getStoredUsers());
  const [userSyncStatus, setUserSyncStatus] = useState("Users loading locally");
  const [loggedInUser, setLoggedInUser] = useState(() => repairUserWithUsers(safeLocalStorageGet(SESSION_KEY, null), getStoredUsers()));
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [activePage, setActivePage] = useState(() => getDefaultPageForUser(repairUser(safeLocalStorageGet(SESSION_KEY, null))));
  const [selectedStationId, setSelectedStationId] = useState("petromocVilankulo");
  const [dailyReadings, setDailyReadings] = useState({});
  const [editingReadingId, setEditingReadingId] = useState(null);
  const [operator, setOperator] = useState("");
  const [history, setHistory] = useState(() => sortReadingsNewestFirst(safeLocalStorageGet(HISTORY_KEY, []).map(normalizeReadingRow)));
  const [unloadingHistory, setUnloadingHistory] = useState(() => safeLocalStorageGet(UNLOADING_HISTORY_KEY, []));
  const [salesImportHistory, setSalesImportHistory] = useState(() => safeLocalStorageGet(SALES_IMPORT_HISTORY_KEY, []));
  const [salesImportStatus, setSalesImportStatus] = useState("No sales file imported yet.");
  const [deliveryTankReadings, setDeliveryTankReadings] = useState({});
  const [unloadReference, setUnloadReference] = useState("");
  const [truckPlate, setTruckPlate] = useState("");
  const [driverName, setDriverName] = useState("");
  const [editingUnloadingId, setEditingUnloadingId] = useState(null);
  const [deliveryReportMonth, setDeliveryReportMonth] = useState(() => getMonthInputValue());
  const firstRange = useMemo(() => getMonthDateRange(getMonthInputValue()), []);
  const [deliveryReportFromDate, setDeliveryReportFromDate] = useState(firstRange.from);
  const [deliveryReportToDate, setDeliveryReportToDate] = useState(firstRange.to);
  const [readingReportSelections, setReadingReportSelections] = useState({});
  const [activeReportType, setActiveReportType] = useState("selectedReadings");
  const [isInstalled] = useState(() => isStandaloneApp());
  const [syncStatus, setSyncStatus] = useState("Local + Google Sheets");
  const [savingReadings, setSavingReadings] = useState(false);
  const [loadingReadings, setLoadingReadings] = useState(false);
  const [lastSyncError, setLastSyncError] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(() => getStoredUsers()[0]?.id || "");
  const [userForm, setUserForm] = useState({ username: "", password: "", role: "Staff", active: true, stationId: "all", permissions: getDefaultPermissions() });
  const [userFormMessage, setUserFormMessage] = useState("");
  const unloadingSectionRef = useRef(null);

  const permissions = loggedInUser?.permissions || {};
  const canViewCalculated = Boolean(permissions.viewCalculated);
  const userStationId = loggedInUser?.stationId || "all";
  const availableStations = useMemo(() => Object.entries(stations).filter(([id]) => userStationId === "all" || userStationId === id), [userStationId]);
  const activeStationId = userStationId !== "all" ? userStationId : selectedStationId;
  const selectedManagedUser = useMemo(() => users.find((user) => user.id === selectedUserId) || users[0] || null, [users, selectedUserId]);
  const station = stations[activeStationId] || stations.petromocVilankulo;
  const stationTanks = station.tanks || {};
  const selectedStationName = station.name;
  const currentDeliveryId = useMemo(() => createTruckDeliveryId(unloadReference, truckPlate, driverName), [unloadReference, truckPlate, driverName]);
  const stationReadingHistory = useMemo(() => history.filter((row) => row.station === selectedStationName), [history, selectedStationName]);
  const stationUnloadingHistory = useMemo(() => unloadingHistory.filter((row) => row.station === selectedStationName).sort((a, b) => getRowTime(b) - getRowTime(a)), [unloadingHistory, selectedStationName]);
  const filteredUnloadingHistory = useMemo(() => filterRowsByDateRange(stationUnloadingHistory, deliveryReportFromDate, deliveryReportToDate), [stationUnloadingHistory, deliveryReportFromDate, deliveryReportToDate]);
  const deliveryReports = useMemo(() => buildDeliveryReports(filteredUnloadingHistory), [filteredUnloadingHistory]);
  const readingReportTankOptions = useMemo(() => Object.values(stationTanks).map((tank) => tank.name), [stationTanks]);
  const readingReportOptionsByTank = useMemo(() => readingReportTankOptions.reduce((options, tankName) => ({ ...options, [tankName]: sortReadingsNewestFirst(stationReadingHistory.filter((row) => row.tank === tankName)) }), {}), [readingReportTankOptions, stationReadingHistory]);
  const readingMovementReports = useMemo(() => buildMultiTankReadingDifferenceReports(stationReadingHistory, readingReportSelections), [stationReadingHistory, readingReportSelections]);
  const latestReadingMovementReports = useMemo(() => buildLastTwoReadingReports(stationReadingHistory), [stationReadingHistory]);
  const buildMovementTotals = (rows = []) => rows.reduce((totals, row) => {
    totals.fuelOut += Number(row.fuelOut) || 0;
    totals.fuelIn += Number(row.fuelIn) || 0;
    if (getProductClass(row.product) === "diesel") totals.dieselOut += Number(row.fuelOut) || 0;
    if (getProductClass(row.product) === "petrol") totals.petrolOut += Number(row.fuelOut) || 0;
    return totals;
  }, { fuelOut: 0, fuelIn: 0, dieselOut: 0, petrolOut: 0 });
  const readingMovementTotals = useMemo(() => buildMovementTotals(readingMovementReports), [readingMovementReports]);
  const latestReadingMovementTotals = useMemo(() => buildMovementTotals(latestReadingMovementReports), [latestReadingMovementReports]);
  const stationSalesImportHistory = useMemo(() => salesImportHistory.filter((row) => row.station === selectedStationName), [salesImportHistory, selectedStationName]);
  const salesTotals = useMemo(() => stationSalesImportHistory.reduce((total, row) => {
    const litres = Number(row.liters) || 0;
    total.liters += litres;
    total.amount += Number(row.amount) || 0;
    if (getProductClass(row.product) === "diesel") total.diesel += litres;
    if (getProductClass(row.product) === "petrol") total.petrol += litres;
    return total;
  }, { liters: 0, amount: 0, diesel: 0, petrol: 0 }), [stationSalesImportHistory]);
  const latestReadingsByTank = useMemo(() => {
    const latest = {};
    stationReadingHistory.forEach((row) => {
      const current = latest[row.tank];
      if (!current || getRowTime(row) > getRowTime(current)) latest[row.tank] = row;
    });
    return latest;
  }, [stationReadingHistory]);
  const productStockTotals = useMemo(() => Object.values(stationTanks).reduce((totals, tankItem) => {
    const latest = latestReadingsByTank[tankItem.name];
    const productClass = getProductClass(tankItem.product);
    const liters = Number(latest?.liters) || 0;
    const capacity = Number(tankItem.capacity) || 0;
    const ullage = latest ? Math.max(capacity - liters, 0) : capacity;
    if (!totals[productClass]) totals[productClass] = { liters: 0, capacity: 0, ullage: 0, tanks: 0 };
    totals[productClass].liters += liters;
    totals[productClass].capacity += capacity;
    totals[productClass].ullage += ullage;
    totals[productClass].tanks += 1;
    return totals;
  }, {}), [stationTanks, latestReadingsByTank]);
  const filteredReportTotals = useMemo(() => filteredUnloadingHistory.reduce((total, row) => {
    const delivered = Number(row.deliveredLiters) || 0;
    const invoice = Number(row.invoiceLiters) || 0;
    const variance = Number(row.variance) || 0;
    total.received += delivered;
    total.invoice += invoice;
    total.variance += variance;
    if (getProductClass(row.product) === "diesel") {
      total.dieselReceived += delivered;
      total.dieselVariance += variance;
    }
    if (getProductClass(row.product) === "petrol") {
      total.petrolReceived += delivered;
      total.petrolVariance += variance;
    }
    return total;
  }, { received: 0, invoice: 0, variance: 0, dieselReceived: 0, petrolReceived: 0, dieselVariance: 0, petrolVariance: 0 }), [filteredUnloadingHistory]);

  const canUsePage = (page) => {
    if ((page === "dashboard" || page === "reports" || page === "sales") && !canViewCalculated) return false;
    return Boolean(permissions[page]);
  };
  const goToPage = (page) => { if (canUsePage(page)) setActivePage(page); };
  const persistHistory = (rows) => { const cleanRows = sortReadingsNewestFirst(rows.map(normalizeReadingRow)); setHistory(cleanRows); safeLocalStorageSet(HISTORY_KEY, cleanRows); };
  const persistUnloadingHistory = (rows) => { const sortedRows = [...rows].sort((a, b) => getRowTime(b) - getRowTime(a)); setUnloadingHistory(sortedRows); safeLocalStorageSet(UNLOADING_HISTORY_KEY, sortedRows); };
  const persistSalesHistory = (rows) => { setSalesImportHistory(rows); safeLocalStorageSet(SALES_IMPORT_HISTORY_KEY, rows); };

  const loadUsersFromCloud = async () => {
    try {
      setUserSyncStatus("Loading users from Google Sheets");
      const payload = await loadUsersFromGoogleSheetsUrl();
      const cloudUsers = Array.isArray(payload?.users) ? payload.users.map(normalizeUserAccount).filter(Boolean) : [];
      if (cloudUsers.length > 0) {
        const normalizedUsers = persistUsersList(cloudUsers);
        setUsers(normalizedUsers);
        setUserSyncStatus("Users loaded from Google Sheets");
        const repairedSession = repairUserWithUsers(loggedInUser, normalizedUsers);
        if (loggedInUser && repairedSession) {
          safeLocalStorageSet(SESSION_KEY, repairedSession);
          setLoggedInUser(repairedSession);
        }
        return normalizedUsers;
      }
      setUserSyncStatus("No cloud users found. Using local defaults.");
      return users;
    } catch (error) {
      setUserSyncStatus(error?.message || "Users sync failed. Using local users.");
      return users;
    }
  };

  const persistUsersEverywhere = async (nextUsers) => {
    const normalizedUsers = persistUsersList(nextUsers);
    setUsers(normalizedUsers);
    try {
      setUserSyncStatus("Saving users to Google Sheets");
      const result = await saveUsersToGoogleSheetsUrl(normalizedUsers);
      setUserSyncStatus(`Users saved to Google Sheets. Saved: ${result?.saved ?? normalizedUsers.length}`);
    } catch (error) {
      setUserSyncStatus(`Users saved locally only. Error: ${error?.message || "Unknown error"}`);
    }
    return normalizedUsers;
  };

  useEffect(() => {
    loadUsersFromCloud();
  }, []);

  useEffect(() => {
    if (!loggedInUser) return;
    if (userStationId !== "all" && selectedStationId !== userStationId) {
      setSelectedStationId(userStationId);
      setDailyReadings({});
      setDeliveryTankReadings({});
    }
    if (!canUsePage(activePage)) setActivePage(getDefaultPageForUser(loggedInUser));
  }, [loggedInUser, activePage, userStationId, selectedStationId]);

  useEffect(() => {
    setReadingReportSelections((current) => {
      const next = {};
      readingReportTankOptions.forEach((tankName) => {
        const options = readingReportOptionsByTank[tankName] || [];
        const newest = options[0];
        const previous = options[1];
        const currentSelection = current[tankName] || {};
        next[tankName] = {
          fromId: currentSelection.fromId && options.some((row) => row.id === currentSelection.fromId) ? currentSelection.fromId : previous?.id || "",
          toId: currentSelection.toId && options.some((row) => row.id === currentSelection.toId) ? currentSelection.toId : newest?.id || "",
        };
      });
      return next;
    });
  }, [readingReportTankOptions, readingReportOptionsByTank]);

  useEffect(() => {
    if (!selectedManagedUser) {
      setUserForm({ username: "", password: "", role: "Staff", active: true, stationId: "all", permissions: getDefaultPermissions() });
      return;
    }
    setUserForm({
      username: selectedManagedUser.username,
      password: selectedManagedUser.password,
      role: selectedManagedUser.role,
      active: selectedManagedUser.active !== false,
      stationId: selectedManagedUser.stationId || "all",
      permissions: { ...getDefaultPermissions(), ...selectedManagedUser.permissions },
    });
    setUserFormMessage("");
  }, [selectedManagedUser?.id]);

  const loadReadingsFromGoogleSheets = async () => {
    if (loadingReadings || !permissions.refreshCloud) return;
    setLoadingReadings(true);
    setLastSyncError("");
    setSyncStatus("Loading Google Sheets");
    const callbackName = `fuelTankReadingsCallback_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    try {
      const payload = await new Promise((resolve, reject) => {
        if (typeof document === "undefined") {
          reject(new Error("Document is not available"));
          return;
        }
        const script = document.createElement("script");
        const cleanup = () => {
          if (window[callbackName]) delete window[callbackName];
          if (script.parentNode) script.parentNode.removeChild(script);
        };
        const timeout = window.setTimeout(() => {
          cleanup();
          reject(new Error("Google Sheets did not respond. Check Apps Script doGet deployment and access set to Anyone."));
        }, 15000);
        window[callbackName] = (data) => {
          window.clearTimeout(timeout);
          cleanup();
          resolve(data);
        };
        script.onerror = () => {
          window.clearTimeout(timeout);
          cleanup();
          reject(new Error("Google Sheets script could not load. Check the Web App URL and deployment access."));
        };
        script.src = `${GOOGLE_SHEETS_WEB_APP_URL}?callback=${encodeURIComponent(callbackName)}&ts=${Date.now()}`;
        document.body.appendChild(script);
      });
      const rows = rowsFromGoogleSheetPayload(payload);
      persistHistory(rows);
      setSyncStatus(rows.length > 0 ? "Loaded from Google Sheets" : "Google Sheets loaded, no readings");
    } catch (error) {
      setLastSyncError(error?.message || "Could not load Google Sheets readings");
      setSyncStatus("Local mode");
    } finally {
      setLoadingReadings(false);
    }
  };

  useEffect(() => { if (loggedInUser?.permissions?.refreshCloud) loadReadingsFromGoogleSheets(); }, [loggedInUser?.username]);

  const selectStation = (stationId, clearReading = true) => {
    if (!permissions.changeStation || userStationId !== "all") return;
    setSelectedStationId(stationId);
    if (clearReading) { setDailyReadings({}); setDeliveryTankReadings({}); }
  };

  const updateDailyReading = (tankId, value) => setDailyReadings((current) => ({ ...current, [tankId]: value }));

  const saveReading = async () => {
    if (savingReadings || !permissions.daily) return;
    const now = getCurrentTimestamp();
    const existingReading = editingReadingId ? history.find((row) => row.id === editingReadingId) : null;
    const readingDate = existingReading?.date || now;
    const rowsToSave = Object.entries(stationTanks).map(([tankId, tankItem]) => {
      const mmText = dailyReadings[tankId];
      const mmValue = Number(mmText);
      if (mmText === undefined || mmText === "" || !Number.isFinite(mmValue)) return null;
      if (mmValue < 0 || (Number(tankItem.maxMm) > 0 && mmValue > Number(tankItem.maxMm))) return null;
      const tankLiters = interpolateLiters(mmValue, tankItem.points || []);
      const tankCapacity = Number(tankItem.capacity) || 0;
      const tankPercentage = tankCapacity > 0 ? Math.min((tankLiters / tankCapacity) * 100, 100) : 0;
      return normalizeReadingRow({ id: editingReadingId || makeId(), date: readingDate, station: station.name, tank: tankItem.name, product: tankItem.product, mm: mmValue, liters: tankLiters, percentage: tankPercentage, ullage: Math.max(tankCapacity - tankLiters, 0), operator: operator || loggedInUser?.username || existingReading?.operator || "Not entered" });
    }).filter(Boolean);
    if (rowsToSave.length === 0) return;

    const nextHistory = editingReadingId ? [...rowsToSave, ...history.filter((row) => row.id !== editingReadingId)] : [...rowsToSave, ...history];
    persistHistory(nextHistory);
    setDailyReadings({});
    setEditingReadingId(null);
    setSyncStatus("Saved locally. Sending to Google Sheets...");
    setSavingReadings(true);
    setLastSyncError("");

    try {
      const result = await saveReadingsToGoogleSheetsUrl(rowsToSave);
      setSyncStatus(`Saved to Google Sheets. Saved: ${result?.saved ?? rowsToSave.length}`);
    } catch (error) {
      setLastSyncError(error?.message || "Could not send to Google Sheets");
      setSyncStatus("Saved locally only. Google Sheets failed.");
    } finally {
      setSavingReadings(false);
    }
  };

  const clearCurrentStationReadings = () => { if (permissions.clearData) persistHistory(history.filter((row) => row.station !== station.name)); };
  const deleteReading = (readingId) => {
    if (!permissions.clearData) return;
    persistHistory(history.filter((row) => row.id !== readingId));
    if (editingReadingId === readingId) {
      setEditingReadingId(null);
      setDailyReadings({});
    }
  };
  const startEditReading = (row) => {
    if (!permissions.clearData) return;
    const tankEntry = Object.entries(stationTanks).find(([, tankItem]) => tankItem.name === row.tank && tankItem.product === row.product);
    if (!tankEntry) return;
    setActivePage("daily");
    setEditingReadingId(row.id);
    setDailyReadings({ [tankEntry[0]]: String(row.mm ?? "") });
    setOperator(row.operator === "Not entered" ? "" : row.operator || "");
  };
  const resetUnloadingForm = () => { setDeliveryTankReadings({}); setUnloadReference(""); setTruckPlate(""); setDriverName(""); setEditingUnloadingId(null); };
  const scrollToUnloadingSection = () => setTimeout(() => unloadingSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);

  const startEditUnloading = (row) => {
    if (!permissions.editDelivery) return;
    setActivePage("delivery");
    const stationEntry = Object.entries(stations).find(([, item]) => item.name === row.station);
    const nextStationId = stationEntry?.[0] || selectedStationId;
    const tankEntry = stationEntry ? Object.entries(stationEntry[1].tanks).find(([, item]) => item.name === row.tank && item.product === row.product) : null;
    setSelectedStationId(nextStationId);
    setDeliveryTankReadings(tankEntry ? { [tankEntry[0]]: { initialMm: String(row.initialMm ?? ""), finalMm: String(row.finalMm ?? ""), invoiceLiters: row.invoiceLiters ? String(row.invoiceLiters) : "" } } : {});
    setUnloadReference(row.reference === "Not entered" ? "" : row.reference || "");
    setTruckPlate(row.truckPlate === "Not entered" ? "" : row.truckPlate || "");
    setDriverName(row.driverName === "Not entered" ? "" : row.driverName || "");
    setOperator(row.operator === "Not entered" ? "" : row.operator || "");
    setEditingUnloadingId(row.id);
    scrollToUnloadingSection();
  };

  const updateDeliveryTankReading = (tankId, field, value) => setDeliveryTankReadings((current) => ({ ...current, [tankId]: { ...(current[tankId] || {}), [field]: value } }));
  const getDeliveryLineCalculation = (tankItem, line = {}) => calculateUnloading(line.initialMm, line.finalMm, tankItem?.points || [], line.invoiceLiters || "");

  const saveUnloading = async () => {
    if (!permissions.delivery) return;
    const now = getCurrentTimestamp();
    const rowsToSave = Object.entries(stationTanks).map(([tankId, tankItem]) => {
      const line = deliveryTankReadings[tankId] || {};
      const initialValue = Number(line.initialMm);
      const finalValue = Number(line.finalMm);
      const hasLine = line.initialMm !== undefined && line.initialMm !== "" && line.finalMm !== undefined && line.finalMm !== "";
      if (!hasLine || !Number.isFinite(initialValue) || !Number.isFinite(finalValue)) return null;
      if (initialValue < 0 || finalValue < 0 || finalValue < initialValue || (Number(tankItem.maxMm) > 0 && finalValue > Number(tankItem.maxMm))) return null;
      const lineCalculation = getDeliveryLineCalculation(tankItem, line);
      return { id: editingUnloadingId && Object.keys(deliveryTankReadings).length === 1 ? editingUnloadingId : makeId(), deliveryId: currentDeliveryId, date: now, updatedAt: editingUnloadingId ? now : undefined, station: station.name, tank: tankItem.name, product: tankItem.product, initialMm: initialValue, finalMm: finalValue, initialLiters: lineCalculation.initialLiters, finalLiters: lineCalculation.finalLiters, deliveredLiters: lineCalculation.deliveredLiters, invoiceLiters: lineCalculation.invoiceLiters, variance: lineCalculation.variance, reference: unloadReference || "Not entered", truckPlate: truckPlate || "Not entered", driverName: driverName || "Not entered", operator: operator || loggedInUser?.username || "Not entered" };
    }).filter(Boolean);
    if (rowsToSave.length === 0) return;
    const nextUnloadingHistory = editingUnloadingId ? [...rowsToSave, ...unloadingHistory.filter((row) => row.id !== editingUnloadingId)] : [...rowsToSave, ...unloadingHistory];
    persistUnloadingHistory(nextUnloadingHistory);
    setSyncStatus("Delivery saved locally. Sending to Google Sheets...");
    setLastSyncError("");
    try {
      const result = await saveDeliveriesToGoogleSheetsUrl(rowsToSave);
      setSyncStatus(`Delivery saved to Google Sheets. Saved: ${result?.saved ?? rowsToSave.length}`);
    } catch (error) {
      setLastSyncError(error?.message || "Could not send delivery to Google Sheets");
      setSyncStatus("Delivery saved locally only. Google Sheets failed.");
    }
    resetUnloadingForm();
  };

  const handleSalesCsvFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !permissions.sales) return;
    try {
      const parsed = parseNetposWetSalesCsv(await file.text(), selectedStationId);
      const importId = makeId();
      const importedAt = getCurrentTimestamp();
      const rows = parsed.rows.map((row) => ({ ...row, stationId: selectedStationId, station: station.name, importId, importedAt, fileName: file.name }));
      persistSalesHistory([...rows, ...salesImportHistory]);
      setSalesImportStatus(`Imported ${rows.length} sales rows from ${file.name}. Skipped ${parsed.skippedRows.length} rows.`);
    } catch {
      setSalesImportStatus("Could not import this CSV file. Try exporting again from NetPOS as CSV.");
    } finally {
      event.target.value = "";
    }
  };

  const selectManagedUser = (userId) => {
    setSelectedUserId(userId);
  };

  const startNewUser = () => {
    setSelectedUserId("");
    setUserForm({ username: "", password: "", role: "Reading Operator", active: true, stationId: "all", permissions: { ...getDefaultPermissions(), daily: true, delivery: true, refreshCloud: true, viewCalculated: false, changeStation: false } });
    setUserFormMessage("Creating a new user. Fill the details, assign one station, and save.");
  };

  const updateUserPermission = (permissionKey, checked) => {
    setUserForm((current) => ({ ...current, permissions: { ...current.permissions, [permissionKey]: checked } }));
  };

  const saveManagedUser = async () => {
    if (!permissions.users) return;
    const username = userForm.username.trim();
    const password = String(userForm.password || "");
    if (!username || !password) {
      setUserFormMessage("Username and password are required.");
      return;
    }
    const duplicate = users.find((user) => user.username.toLowerCase() === username.toLowerCase() && user.id !== selectedUserId);
    if (duplicate) {
      setUserFormMessage("Another user already has this username.");
      return;
    }
    const savedUser = normalizeUserAccount({
      id: selectedUserId || makeId(),
      username,
      password,
      role: userForm.role || "Staff",
      active: userForm.active !== false,
      stationId: userForm.stationId || "all",
      permissions: { ...getDefaultPermissions(), ...userForm.permissions },
    });
    const nextUsers = selectedUserId ? users.map((user) => user.id === selectedUserId ? savedUser : user) : [savedUser, ...users];
    setUserFormMessage("Saving user to Google Sheets...");
    await persistUsersEverywhere(nextUsers);
    setSelectedUserId(savedUser.id);
    setUserFormMessage("Save finished. Check the User sync status box below for the real result.");
    if (loggedInUser?.username.toLowerCase() === savedUser.username.toLowerCase()) {
      const updatedSession = { username: savedUser.username, role: savedUser.role, stationId: savedUser.stationId || "all", permissions: savedUser.permissions };
      safeLocalStorageSet(SESSION_KEY, updatedSession);
      setLoggedInUser(updatedSession);
    }
  };

  const deleteManagedUser = () => {
    if (!permissions.users || !selectedManagedUser) return;
    if (selectedManagedUser.username.toLowerCase() === loggedInUser.username.toLowerCase()) {
      setUserFormMessage("You cannot delete the user you are currently logged in with.");
      return;
    }
    const nextUsers = users.filter((user) => user.id !== selectedManagedUser.id);
    persistUsersEverywhere(nextUsers).then((normalizedUsers) => setSelectedUserId(normalizedUsers[0]?.id || ""));
    setUserFormMessage("User deleted and sent to Google Sheets.");
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (loginLoading) return;
    setLoginLoading(true);
    setLoginError("");

    const username = loginUsername.trim().toLowerCase();
    const password = loginPassword;

    let availableUsers = await loadUsersFromCloud();
    let user = availableUsers.find((item) => item.active !== false && item.username.toLowerCase() === username && item.password === password);

    setLoginLoading(false);

    if (!user) {
      setLoginError("Login failed. The app loaded Google Sheets users, but this username/password was not found or the user is inactive.");
      return;
    }

    const safeUser = { username: user.username, role: user.role, stationId: user.stationId || "all", permissions: { ...getDefaultPermissions(), ...user.permissions } };
    safeLocalStorageSet(SESSION_KEY, safeUser);
    setLoggedInUser(safeUser);
    setActivePage(getDefaultPageForUser(safeUser));
    setLoginUsername("");
    setLoginPassword("");
    setLoginError("");
  };

  const handleLogout = () => {
    if (typeof window !== "undefined" && window.localStorage) window.localStorage.removeItem(SESSION_KEY);
    setLoggedInUser(null);
    setUserMenuOpen(false);
    setActivePage("dashboard");
  };

  if (!loggedInUser) {
    return <div className="login-shell"><style>{styles}</style><div className="login-card"><div className="login-logo">⛽</div><div><h1 className="login-title">Fuel Tank Reading</h1><p className="login-subtitle">Login to access tank readings and saved history.</p></div><form className="login-form" onSubmit={handleLogin}><div><FieldLabel>Username</FieldLabel><input className="field-input" value={loginUsername} onChange={(event) => setLoginUsername(event.target.value)} placeholder="admin" autoComplete="username" /></div><div><FieldLabel>Password</FieldLabel><input className="field-input" type="password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} placeholder="Enter password" autoComplete="current-password" /></div>{loginError ? <p className="login-error">{loginError}</p> : null}<button type="submit" className="primary-button" disabled={loginLoading}>{loginLoading ? "Loading users..." : "🔐 Login"}</button></form><div className="diagnostic-box">User sync status: {userSyncStatus}</div><p className="small-text" style={{ margin: 0 }}>Default users: admin / 1234, manager / 2222, operator / 1111, viewer / 9999. Admin can edit users and permissions inside the app.</p></div></div>;
  }

  return <div className="app-shell"><style>{styles}</style><div className="app-container">
    <header className="app-header"><div className="app-brand"><h1 className="app-title" style={{fontWeight:900,letterSpacing:"1px"}}>FTL</h1><p className="app-subtitle">Fast mobile readings for liters, ullage, truck unloading, and delivery reports.</p></div><div className="status-row header-controls">{(permissions.changeStation && userStationId === "all") ? <select value={selectedStationId} onChange={(event) => selectStation(event.target.value, true)} className="field-input station-top-select">{availableStations.map(([id,item]) => <option key={id} value={id}>{item.name}</option>)}</select> : <div className="station-top-pill">{station.name}</div>}<div className="user-menu-wrap"><button type="button" className="user-circle" onClick={() => setUserMenuOpen((open) => !open)}>{String(loggedInUser.username || "U").slice(0, 1).toUpperCase()}</button>{userMenuOpen ? <div className="user-dropdown"><div><p className="user-dropdown-title">{loggedInUser.username}</p><p className="user-dropdown-subtitle">{loggedInUser.role}</p></div><button type="button" onClick={handleLogout} className="logout-button">Logout</button></div> : null}</div></div></header>
    <nav className="page-nav" aria-label="App pages">{permissions.dashboard && canViewCalculated ? <button type="button" className={`page-tab ${activePage === "dashboard" ? "active" : ""}`} onClick={() => goToPage("dashboard")}>📍 Dashboard</button> : null}{permissions.daily ? <button type="button" className={`page-tab ${activePage === "daily" ? "active" : ""}`} onClick={() => goToPage("daily")}>⛽ Daily Readings</button> : null}{permissions.delivery ? <button type="button" className={`page-tab ${activePage === "delivery" ? "active" : ""}`} onClick={() => goToPage("delivery")}>🚚 Truck Delivery</button> : null}{permissions.reports && canViewCalculated ? <button type="button" className={`page-tab ${activePage === "reports" ? "active" : ""}`} onClick={() => goToPage("reports")}>📊 Reports</button> : null}{permissions.sales && canViewCalculated ? <button type="button" className={`page-tab ${activePage === "sales" ? "active" : ""}`} onClick={() => goToPage("sales")}>📥 Sales Import</button> : null}{permissions.users ? <button type="button" className={`page-tab ${activePage === "users" ? "active" : ""}`} onClick={() => goToPage("users")}>👥 Users</button> : null}</nav>

    {activePage === "dashboard" ? <Card className="dashboard-card"><div className="card-content form-grid"><div className="section-title"><span style={{ fontSize: 24 }}>📍</span><h2>Tank Overview</h2></div><p className="small-text" style={{ margin: 0 }}>Latest saved readings for <strong>{station.name}</strong>.</p><div className="report-metrics dashboard-summary"><div className="metric-box diesel"><p className="metric-label">Total Diesel in Tanks</p><p className="metric-value">{formatNumber(productStockTotals.diesel?.liters || 0)} L</p><p className="small-text" style={{ marginBottom: 0 }}>Space: {formatNumber(productStockTotals.diesel?.ullage || 0)} L • Tanks: {productStockTotals.diesel?.tanks || 0}</p></div><div className="metric-box petrol"><p className="metric-label">Total Petrol in Tanks</p><p className="metric-value">{formatNumber(productStockTotals.petrol?.liters || 0)} L</p><p className="small-text" style={{ marginBottom: 0 }}>Space: {formatNumber(productStockTotals.petrol?.ullage || 0)} L • Tanks: {productStockTotals.petrol?.tanks || 0}</p></div></div><div className="report-metrics dashboard-tanks">{Object.entries(stationTanks).map(([tankId, tankItem]) => { const latest = latestReadingsByTank[tankItem.name]; const tankLiters = Number(latest?.liters) || 0; const tankCapacity = Number(tankItem.capacity) || 0; const tankPercentage = latest ? (Number(latest.percentage) || 0) : 0; const tankUllage = latest ? Math.max(tankCapacity - tankLiters, 0) : tankCapacity; const levelInfo = getTankLevelInfo(tankPercentage); return <div key={tankId} className={`metric-box dashboard-tank-card ${getProductClass(tankItem.product)}`} style={{ display: "grid", gap: 12 }}><div><p className="metric-label">{tankItem.name}</p><p className="metric-value" style={{ fontSize: 22 }}>{tankItem.product}</p><p className="small-text" style={{ marginBottom: 0 }}>Last: {latest?.date || "No reading yet"}</p></div><div className="tank-visual"><div className={`tank-fill ${levelInfo.className}`} style={{ width: `${tankPercentage}%` }} /><div className="tank-center"><div className="tank-badge"><strong>{formatNumber(tankPercentage)}%</strong></div></div></div><div className="metric-grid" style={{ gridTemplateColumns: "1fr 1fr" }}><div><p className="metric-label">Liters</p><p className="metric-value" style={{ fontSize: 18 }}>{formatNumber(tankLiters)} L</p></div><div><p className="metric-label">Space</p><p className="metric-value" style={{ fontSize: 18 }}>{formatNumber(tankUllage)} L</p></div></div><span className="tank-status-badge" style={{ "--level-color": levelInfo.color, justifySelf: "start" }}>{latest ? levelInfo.label : "No reading"}</span></div>; })}</div><div className="unloading-actions">{permissions.daily ? <button type="button" className="primary-button" onClick={() => goToPage("daily")}>Enter Daily Readings</button> : null}<button type="button" className="secondary-button" onClick={loadReadingsFromGoogleSheets} disabled={loadingReadings || !permissions.refreshCloud}>{loadingReadings ? "Refreshing..." : "Refresh From Google Sheets"}</button></div>{lastSyncError ? <div className="diagnostic-box"><strong>Google Sheets load problem:</strong><br />{lastSyncError}<br /><span className="small-text">Make sure Apps Script has doGet with JSONP support and deployment access is Anyone.</span></div> : null}</div></Card> : null}

    {activePage === "daily" ? <><Card><div className="card-content form-grid"><div className="section-title"><span style={{ fontSize: 24 }}>⛽</span><h2>{editingReadingId ? "Edit Reading" : "Daily Readings"}</h2></div>{editingReadingId ? <div className="edit-banner">Editing one saved reading. Change the MM below, then save. This replaces the old reading.</div> : null}<p className="small-text" style={{ margin: 0 }}>Enter all tank readings for <strong>{station.name}</strong> at once. Leave a tank empty if you do not want to save it now.</p><div><FieldLabel>Operator / staff name</FieldLabel><input className="field-input" placeholder="Optional" value={operator} onChange={(event) => setOperator(event.target.value)} /></div><div className="daily-mobile-list">{Object.entries(stationTanks).map(([tankId, tankItem]) => { const mmText = dailyReadings[tankId] || ""; const mmValue = Number(mmText); const hasValue = mmText !== "" && Number.isFinite(mmValue); const isInvalid = hasValue && (mmValue < 0 || (Number(tankItem.maxMm) > 0 && mmValue > Number(tankItem.maxMm))); const tankLiters = hasValue && !isInvalid ? interpolateLiters(mmValue, tankItem.points || []) : 0; const tankCapacity = Number(tankItem.capacity) || 0; const tankPercentage = tankCapacity > 0 ? Math.min((tankLiters / tankCapacity) * 100, 100) : 0; const tankUllage = Math.max(tankCapacity - tankLiters, 0); const latestDate = latestReadingsByTank[tankItem.name]?.date?.split(" ")?.[0] || ""; return <div key={tankId} className={`daily-mobile-card ${getProductClass(tankItem.product)}`}><div className="daily-mobile-top"><div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}><p className="daily-mobile-title">{tankItem.name}</p><ProductBadge product={tankItem.product} /></div>{latestDate ? <span className="small-text" style={{ margin: 0, whiteSpace: "nowrap" }}>{latestDate}</span> : null}</div><div className="daily-mobile-grid"><div><FieldLabel>Reading MM</FieldLabel><input className="field-input" type="number" inputMode="decimal" min="0" max={tankItem.maxMm} value={mmText} onChange={(event) => updateDailyReading(tankId, event.target.value)} placeholder="MM" />{isInvalid ? <div className="small-text error-text">Max {tankItem.maxMm} mm</div> : <div className="small-text">Max {tankItem.maxMm} mm</div>}</div>{canViewCalculated ? <div className="daily-mobile-result"><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}><div><p className="metric-label">Reading</p><p className="metric-value">{mmText || 0} mm</p></div><div style={{ textAlign: "right" }}><p className="metric-label">Volume</p><p className="metric-value">{formatNumber(tankLiters)} L</p></div></div><p className="small-text" style={{ margin: "6px 0 0" }}>Space: {formatNumber(tankUllage)} L • {formatNumber(tankPercentage)}%</p></div> : <div className="daily-mobile-result"><p className="metric-label">Saved hidden</p><p className="small-text" style={{ margin: 0 }}>Calculated result hidden for this user.</p></div>}</div></div>; })}</div><div className="history-table-wrap daily-desktop-table"><table className="history-table"><thead><tr><th>Tank</th><th>Product</th><th>Reading MM</th>{canViewCalculated ? <><th>Liters</th><th>Available Space</th><th>Full</th><th>Level</th></> : null}</tr></thead><tbody>{Object.entries(stationTanks).map(([tankId, tankItem]) => { const mmText = dailyReadings[tankId] || ""; const mmValue = Number(mmText); const hasValue = mmText !== "" && Number.isFinite(mmValue); const isInvalid = hasValue && (mmValue < 0 || (Number(tankItem.maxMm) > 0 && mmValue > Number(tankItem.maxMm))); const tankLiters = hasValue && !isInvalid ? interpolateLiters(mmValue, tankItem.points || []) : 0; const tankCapacity = Number(tankItem.capacity) || 0; const tankPercentage = tankCapacity > 0 ? Math.min((tankLiters / tankCapacity) * 100, 100) : 0; const tankUllage = Math.max(tankCapacity - tankLiters, 0); return <tr key={tankId} className={`history-row-${getProductClass(tankItem.product)}`}><td><strong>{tankItem.name}</strong><div className="small-text" style={{ marginTop: 4 }}>Max {tankItem.maxMm} mm</div></td><td><ProductBadge product={tankItem.product} /></td><td><input className="field-input" type="number" inputMode="decimal" min="0" max={tankItem.maxMm} value={mmText} onChange={(event) => updateDailyReading(tankId, event.target.value)} placeholder="MM" style={{ minWidth: 120 }} />{isInvalid ? <div className="small-text error-text">Invalid reading</div> : null}</td>{canViewCalculated ? <><td><strong>{formatNumber(tankLiters)} L</strong></td><td>{formatNumber(tankUllage)} L</td><td>{formatNumber(tankPercentage)}%</td><td><HistoryLevelVisual percentage={tankPercentage} /></td></> : null}</tr>; })}</tbody></table></div><div className="unloading-actions daily-actions"><button type="button" onClick={saveReading} disabled={savingReadings} className="primary-button">{savingReadings ? "Saving..." : editingReadingId ? "💾 Save Edited Reading" : "💾 Save All Entered Readings"}</button><button type="button" onClick={() => { setDailyReadings({}); setEditingReadingId(null); }} className="secondary-button">{editingReadingId ? "Cancel Edit" : "Clear Inputs"}</button></div></div></Card>{canViewCalculated ? <Card><div className="card-content"><div className="history-header"><div><h2>Reading History</h2><p>Saved tank readings for {station.name}.</p></div><div className="unloading-actions"><button type="button" onClick={loadReadingsFromGoogleSheets} disabled={loadingReadings || !permissions.refreshCloud} className="secondary-button">{loadingReadings ? "Refreshing..." : "🔄 Refresh From Google Sheets"}</button>{permissions.clearData ? <button type="button" onClick={clearCurrentStationReadings} className="secondary-button">🗑️ Clear This Station</button> : null}</div></div>{lastSyncError ? <div className="diagnostic-box" style={{ marginBottom: 12 }}>{lastSyncError}</div> : null}<div className="reading-history-mobile-list">{stationReadingHistory.length === 0 ? <div className="reading-history-mobile-card"><p className="small-text" style={{ margin: 0 }}>No readings saved yet for this station.</p></div> : stationReadingHistory.map((row) => <div key={row.id} className={`reading-history-mobile-card ${getProductClass(row.product)}`}><div className="reading-history-top"><div className="reading-history-title"><strong>{row.tank}</strong><ProductBadge product={row.product} /></div><span className="reading-history-date">{row.date}</span></div><div className="reading-history-line"><div><span>Reading</span><br /><strong>{row.mm} mm</strong></div><div style={{ textAlign: "right" }}><span>Volume</span><br /><strong>{formatNumber(row.liters)} L</strong></div></div><div className="reading-history-line"><div><span>Space</span><br /><strong>{formatNumber(row.ullage)} L</strong></div><div style={{ textAlign: "right" }}><span>Level</span><br /><strong>{formatNumber(row.percentage)}%</strong></div></div><div className="reading-history-meta"><span>{row.operator}</span><span>{row.station}</span></div>{permissions.clearData ? <div className="reading-history-actions"><button type="button" onClick={() => startEditReading(row)} className="secondary-button">Edit</button><button type="button" onClick={() => deleteReading(row.id)} className="secondary-button">Delete</button></div> : null}</div>)}</div><div className="history-table-wrap reading-history-desktop-table"><table className="history-table"><thead><tr><th>Action</th><th>Date</th><th>Station</th><th>Tank</th><th>Product</th><th>MM</th><th>Liters</th><th>Level</th><th>Ullage</th><th>Operator</th></tr></thead><tbody>{stationReadingHistory.length === 0 ? <tr><td style={{ padding: "22px 8px", color: "#64748b" }} colSpan={10}>No readings saved yet for this station.</td></tr> : stationReadingHistory.map((row) => <tr key={row.id} className={`history-row-${getProductClass(row.product)}`}><td data-label="Action">{permissions.clearData ? <div style={{ display: "grid", gap: 6 }}><button type="button" onClick={() => startEditReading(row)} className="secondary-button" style={{minHeight:34,padding:"7px 10px"}}>Edit</button><button type="button" onClick={() => deleteReading(row.id)} className="secondary-button" style={{minHeight:34,padding:"7px 10px"}}>Delete</button></div> : "View"}</td><td>{row.date}</td><td>{row.station}</td><td>{row.tank}</td><td><ProductBadge product={row.product} /></td><td>{row.mm}</td><td>{formatNumber(row.liters)} L</td><td><HistoryLevelVisual percentage={row.percentage} /></td><td>{formatNumber(row.ullage)} L</td><td>{row.operator}</td></tr>)}</tbody></table></div></div></Card> : <Card><div className="card-content"><div className="warning-box">Readings saved. This user is not allowed to view calculated liters, percentages, ullage, or history results.</div></div></Card>}</> : null}

    {activePage === "delivery" ? <><Card><div ref={unloadingSectionRef} className="card-content form-grid" style={{ scrollMarginTop: 24 }}><div className="section-title"><span style={{ fontSize: 24 }}>🚚</span><h2>Truck Delivery / Descarregamento</h2></div><p className="small-text" style={{ margin: 0 }}>Enter one truck delivery for <strong>{station.name}</strong>. Fill only the tanks that received fuel; empty tanks will be ignored when saving.</p>{editingUnloadingId ? <div className="edit-banner">Editing one saved unloading line. Update the tank line below, then press Save Delivery Lines.</div> : null}<div className="unloading-grid"><div><FieldLabel>Invoice / delivery note number</FieldLabel><input className="field-input" value={unloadReference} onChange={(event) => setUnloadReference(event.target.value)} placeholder="Example: INV123" /></div><div><FieldLabel>Truck plate</FieldLabel><input className="field-input" value={truckPlate} onChange={(event) => setTruckPlate(event.target.value)} placeholder="Example: ABC-123" /></div><div><FieldLabel>Driver name</FieldLabel><input className="field-input" value={driverName} onChange={(event) => setDriverName(event.target.value)} placeholder="Optional" /></div></div><div><FieldLabel>Operator / staff name</FieldLabel><input className="field-input" placeholder="Optional" value={operator} onChange={(event) => setOperator(event.target.value)} /></div><p className="small-text">Truck Delivery ID: <strong>{currentDeliveryId}</strong></p><div className="history-table-wrap"><table className="history-table"><thead><tr><th>Tank</th><th>Product</th><th>Initial MM</th><th>Final MM</th>{canViewCalculated ? <><th>Invoice L</th><th>Initial L</th><th>Final L</th><th>Received L</th><th>Difference</th></> : null}</tr></thead><tbody>{Object.entries(stationTanks).map(([tankId, tankItem]) => { const line = deliveryTankReadings[tankId] || {}; const initialValue = Number(line.initialMm); const finalValue = Number(line.finalMm); const hasLine = line.initialMm !== undefined && line.initialMm !== "" && line.finalMm !== undefined && line.finalMm !== ""; const isInvalid = hasLine && (!Number.isFinite(initialValue) || !Number.isFinite(finalValue) || initialValue < 0 || finalValue < 0 || finalValue < initialValue || (Number(tankItem.maxMm) > 0 && finalValue > Number(tankItem.maxMm))); const lineCalculation = getDeliveryLineCalculation(tankItem, line); return <tr key={tankId} className={`history-row-${getProductClass(tankItem.product)}`}><td data-label="Tank"><strong>{tankItem.name}</strong><div className="small-text" style={{ marginTop: 4 }}>Max {tankItem.maxMm} mm</div></td><td data-label="Product"><ProductBadge product={tankItem.product} /></td><td data-label="Initial MM"><input className="field-input" type="number" inputMode="decimal" min="0" max={tankItem.maxMm} value={line.initialMm || ""} onChange={(event) => updateDeliveryTankReading(tankId, "initialMm", event.target.value)} placeholder="Before" style={{ minWidth: 115 }} /></td><td data-label="Final MM"><input className="field-input" type="number" inputMode="decimal" min="0" max={tankItem.maxMm} value={line.finalMm || ""} onChange={(event) => updateDeliveryTankReading(tankId, "finalMm", event.target.value)} placeholder="After" style={{ minWidth: 115 }} />{isInvalid ? <div className="small-text error-text">Check readings</div> : null}</td>{canViewCalculated ? <><td data-label="Invoice L"><input className="field-input" type="number" inputMode="decimal" min="0" value={line.invoiceLiters || ""} onChange={(event) => updateDeliveryTankReading(tankId, "invoiceLiters", event.target.value)} placeholder="Optional" style={{ minWidth: 120 }} /></td><td data-label="Initial L">{formatNumber(hasLine && !isInvalid ? lineCalculation.initialLiters : 0)} L</td><td data-label="Final L">{formatNumber(hasLine && !isInvalid ? lineCalculation.finalLiters : 0)} L</td><td data-label="Received L"><strong>{formatNumber(hasLine && !isInvalid ? lineCalculation.deliveredLiters : 0)} L</strong></td><td data-label="Difference" className={(lineCalculation.variance || 0) >= 0 ? "variance-positive" : "variance-negative"}>{formatNumber(hasLine && !isInvalid ? lineCalculation.variance : 0)} L</td></> : null}</tr>; })}</tbody></table></div><div className="unloading-actions"><button type="button" onClick={saveUnloading} className="primary-button">💾 Save Delivery Lines</button><button type="button" onClick={resetUnloadingForm} className="secondary-button">Reset</button></div></div></Card>{canViewCalculated ? <Card><div className="card-content"><div className="history-header"><div><h2>Unloading History</h2><p>Saved truck unloading records for {station.name} on this device/browser.</p></div>{permissions.clearData ? <button type="button" onClick={() => persistUnloadingHistory(unloadingHistory.filter((row) => row.station !== station.name))} className="secondary-button">🗑️ Clear This Station</button> : null}</div><div className="history-table-wrap"><table className="history-table"><thead><tr><th>Action</th><th>Date</th><th>Delivery ID</th><th>Station</th><th>Tank</th><th>Product</th><th>Initial MM</th><th>Final MM</th><th>Initial L</th><th>Final L</th><th>Received L</th><th>Invoice L</th><th>Diff L</th><th>Reference</th><th>Truck Plate</th><th>Driver</th><th>Operator</th></tr></thead><tbody>{stationUnloadingHistory.length === 0 ? <tr><td style={{ padding: "22px 8px", color: "#64748b" }} colSpan={17}>No unloading records saved yet for this station.</td></tr> : stationUnloadingHistory.map((row) => <tr key={row.id} className={`history-row-${getProductClass(row.product)}`}><td data-label="Action">{permissions.editDelivery ? <button type="button" onClick={() => startEditUnloading(row)} className="secondary-button" style={{ minHeight: 34, padding: "7px 10px" }}>Edit</button> : <span className="small-text">View only</span>}</td><td data-label="Date">{row.date}</td><td data-label="Delivery ID">{row.deliveryId || createTruckDeliveryId(row.reference, row.truckPlate, row.driverName)}</td><td data-label="Station">{row.station}</td><td data-label="Tank">{row.tank}</td><td data-label="Product"><ProductBadge product={row.product} /></td><td data-label="Initial MM">{row.initialMm}</td><td data-label="Final MM">{row.finalMm}</td><td data-label="Initial L">{formatNumber(row.initialLiters)} L</td><td data-label="Final L">{formatNumber(row.finalLiters)} L</td><td data-label="Received L">{formatNumber(row.deliveredLiters)} L</td><td data-label="Invoice L">{formatNumber(row.invoiceLiters)} L</td><td data-label="Diff L" className={row.variance >= 0 ? "variance-positive" : "variance-negative"}>{formatNumber(row.variance)} L</td><td data-label="Reference">{row.reference}</td><td data-label="Truck Plate">{row.truckPlate || "Not entered"}</td><td data-label="Driver">{row.driverName || "Not entered"}</td><td data-label="Operator">{row.operator}</td></tr>)}</tbody></table></div></div></Card> : <Card><div className="card-content"><div className="warning-box">Delivery readings saved. This user is not allowed to view calculated liters, received liters, differences, or unloading history results.</div></div></Card>}</> : null}

    {activePage === "reports" ? <Card><div className="card-content"><div className="history-header"><div><h2>Reports</h2><p>Select one report type to view. Each report keeps its own filters and selections.</p></div></div><div className="report-tabs"><button type="button" className={`report-tab ${activeReportType === "selectedReadings" ? "active" : ""}`} onClick={() => setActiveReportType("selectedReadings")}>Selected Reading Difference<span>Choose from/to readings for all tanks</span></button><button type="button" className={`report-tab ${activeReportType === "latestReadings" ? "active" : ""}`} onClick={() => setActiveReportType("latestReadings")}>Latest Two Readings<span>Automatic last two readings per tank</span></button><button type="button" className={`report-tab ${activeReportType === "truckDelivery" ? "active" : ""}`} onClick={() => setActiveReportType("truckDelivery")}>Truck Delivery Reports<span>Truck unloading by month/date</span></button></div>{activeReportType === "selectedReadings" ? <><div className="history-header" style={{ marginTop: 18 }}><div><h2>Selected Reading Difference</h2><p>Choose the previous and later reading for each tank. Totals below combine all selected tanks by product.</p></div></div><div className="filter-panel" style={{ marginBottom: 16 }}>{readingReportTankOptions.map((tankName) => { const tankItem = Object.values(stationTanks).find((tank) => tank.name === tankName); const options = readingReportOptionsByTank[tankName] || []; const selection = readingReportSelections[tankName] || {}; return <div key={tankName} className={`report-line ${getProductClass(tankItem?.product)}`}><div className="history-header" style={{ marginBottom: 10 }}><div><h3 style={{ margin: 0 }}>{tankName} <ProductBadge product={tankItem?.product || ""} /></h3><p>{options.length} saved reading{options.length === 1 ? "" : "s"} available</p></div></div><div className="unloading-grid"><div><FieldLabel>From reading</FieldLabel><select className="field-input" value={selection.fromId || ""} onChange={(event) => setReadingReportSelections((current) => ({ ...current, [tankName]: { ...(current[tankName] || {}), fromId: event.target.value } }))}><option value="">Select previous reading</option>{options.map((row) => <option key={row.id} value={row.id}>{row.date} • {row.mm}mm • {formatNumber(row.liters)}L • {row.operator}</option>)}</select></div><div><FieldLabel>To reading</FieldLabel><select className="field-input" value={selection.toId || ""} onChange={(event) => setReadingReportSelections((current) => ({ ...current, [tankName]: { ...(current[tankName] || {}), toId: event.target.value } }))}><option value="">Select later reading</option>{options.map((row) => <option key={row.id} value={row.id}>{row.date} • {row.mm}mm • {formatNumber(row.liters)}L • {row.operator}</option>)}</select></div><div><FieldLabel>Quick action</FieldLabel><button type="button" className="secondary-button" onClick={() => setReadingReportSelections((current) => ({ ...current, [tankName]: { fromId: options[1]?.id || "", toId: options[0]?.id || "" } }))} disabled={options.length < 2}>Use latest 2 readings</button></div></div></div>; })}<p className="small-text" style={{ margin: 0 }}>Each tank can use different dates/readings. If a tank has no valid pair selected, it will not enter the totals.</p></div><div className="report-metrics" style={{ marginBottom: 16 }}><div className="metric-box"><p className="metric-label">Movement records</p><p className="metric-value">{readingMovementReports.length}</p></div><div className="metric-box"><p className="metric-label">Total fuel out</p><p className="metric-value">{formatNumber(readingMovementTotals.fuelOut)} L</p></div><div className="metric-box diesel"><p className="metric-label">Diesel out</p><p className="metric-value">{formatNumber(readingMovementTotals.dieselOut)} L</p></div><div className="metric-box petrol"><p className="metric-label">Petrol out</p><p className="metric-value">{formatNumber(readingMovementTotals.petrolOut)} L</p></div><div className="metric-box"><p className="metric-label">Fuel increase detected</p><p className="metric-value">{formatNumber(readingMovementTotals.fuelIn)} L</p><p className="small-text" style={{ marginBottom: 0 }}>Usually delivery or correction.</p></div></div><div className="history-table-wrap"><table className="history-table"><thead><tr><th>Tank</th><th>Product</th><th>From Reading</th><th>To Reading</th><th>Start L</th><th>End L</th><th>Fuel Out</th><th>Fuel In</th><th>Operators</th></tr></thead><tbody>{readingMovementReports.length === 0 ? <tr><td style={{ padding: "22px 8px", color: "#64748b" }} colSpan={9}>Select valid from/to readings for at least one tank.</td></tr> : readingMovementReports.map((row) => <tr key={row.id} className={`history-row-${getProductClass(row.product)}`}><td><strong>{row.tank}</strong></td><td><ProductBadge product={row.product} /></td><td>{row.fromDate}<br /><span className="small-text">{row.fromMm} mm</span></td><td>{row.toDate}<br /><span className="small-text">{row.toMm} mm</span></td><td>{formatNumber(row.startLiters)} L</td><td>{formatNumber(row.endLiters)} L</td><td className="variance-negative"><strong>{formatNumber(row.fuelOut)} L</strong></td><td className="variance-positive">{formatNumber(row.fuelIn)} L</td><td>{row.fromOperator} → {row.toOperator}</td></tr>)}</tbody></table></div></> : null}{activeReportType === "latestReadings" ? <><div className="history-header" style={{ marginTop: 18 }}><div><h2>Latest Two Readings Per Tank</h2><p>Uses the last two saved readings of each tank, regardless of date filter.</p></div></div><div className="report-metrics" style={{ marginBottom: 16 }}><div className="metric-box"><p className="metric-label">Movement records</p><p className="metric-value">{latestReadingMovementReports.length}</p></div><div className="metric-box"><p className="metric-label">Total fuel out</p><p className="metric-value">{formatNumber(latestReadingMovementTotals.fuelOut)} L</p></div><div className="metric-box diesel"><p className="metric-label">Diesel out</p><p className="metric-value">{formatNumber(latestReadingMovementTotals.dieselOut)} L</p></div><div className="metric-box petrol"><p className="metric-label">Petrol out</p><p className="metric-value">{formatNumber(latestReadingMovementTotals.petrolOut)} L</p></div><div className="metric-box"><p className="metric-label">Fuel increase detected</p><p className="metric-value">{formatNumber(latestReadingMovementTotals.fuelIn)} L</p><p className="small-text" style={{ marginBottom: 0 }}>Usually delivery or correction.</p></div></div><div className="history-table-wrap"><table className="history-table"><thead><tr><th>Tank</th><th>Product</th><th>Previous Reading</th><th>Latest Reading</th><th>Previous L</th><th>Latest L</th><th>Fuel Out</th><th>Fuel In</th><th>Operators</th></tr></thead><tbody>{latestReadingMovementReports.length === 0 ? <tr><td style={{ padding: "22px 8px", color: "#64748b" }} colSpan={9}>Need at least two readings per tank.</td></tr> : latestReadingMovementReports.map((row) => <tr key={row.id} className={`history-row-${getProductClass(row.product)}`}><td><strong>{row.tank}</strong></td><td><ProductBadge product={row.product} /></td><td>{row.fromDate}<br /><span className="small-text">{row.fromMm} mm</span></td><td>{row.toDate}<br /><span className="small-text">{row.toMm} mm</span></td><td>{formatNumber(row.startLiters)} L</td><td>{formatNumber(row.endLiters)} L</td><td className="variance-negative"><strong>{formatNumber(row.fuelOut)} L</strong></td><td className="variance-positive">{formatNumber(row.fuelIn)} L</td><td>{row.fromOperator} → {row.toOperator}</td></tr>)}</tbody></table></div></> : null}{activeReportType === "truckDelivery" ? <><div className="history-header"><div><h2>Truck Delivery Reports</h2><p>Grouped by Truck Delivery ID for {station.name}, filtered by its own month or custom date range.</p></div></div><div className="filter-panel" style={{ marginBottom: 16 }}><div className="unloading-grid"><div><FieldLabel>Select month</FieldLabel><input className="field-input" type="month" value={deliveryReportMonth} onChange={(event) => { const value = event.target.value; const range = getMonthDateRange(value); setDeliveryReportMonth(value); setDeliveryReportFromDate(range.from); setDeliveryReportToDate(range.to); }} /></div><div><FieldLabel>From date</FieldLabel><input className="field-input" type="date" value={deliveryReportFromDate} onChange={(event) => { setDeliveryReportFromDate(event.target.value); setDeliveryReportMonth(""); }} /></div><div><FieldLabel>To date</FieldLabel><input className="field-input" type="date" value={deliveryReportToDate} onChange={(event) => { setDeliveryReportToDate(event.target.value); setDeliveryReportMonth(""); }} /></div></div><div className="filter-actions"><button type="button" className="secondary-button" onClick={() => { const month = getMonthInputValue(); const range = getMonthDateRange(month); setDeliveryReportMonth(month); setDeliveryReportFromDate(range.from); setDeliveryReportToDate(range.to); }}>This Month</button><button type="button" className="secondary-button" onClick={() => { setDeliveryReportMonth(""); setDeliveryReportFromDate(""); setDeliveryReportToDate(""); }}>All Delivery Dates</button></div><div className="report-metrics"><div className="metric-box"><p className="metric-label">Filtered records</p><p className="metric-value">{filteredUnloadingHistory.length}</p></div><div className="metric-box"><p className="metric-label">Total received</p><p className="metric-value">{formatNumber(filteredReportTotals.received)} L</p></div><div className="metric-box diesel"><p className="metric-label">Diesel received</p><p className="metric-value">{formatNumber(filteredReportTotals.dieselReceived)} L</p></div><div className="metric-box petrol"><p className="metric-label">Petrol received</p><p className="metric-value">{formatNumber(filteredReportTotals.petrolReceived)} L</p></div><div className="metric-box"><p className="metric-label">Invoice total</p><p className="metric-value">{formatNumber(filteredReportTotals.invoice)} L</p></div><div className="metric-box"><p className="metric-label">Total difference</p><p className={`metric-value ${filteredReportTotals.variance >= 0 ? "variance-positive" : "variance-negative"}`}>{formatNumber(filteredReportTotals.variance)} L</p></div><div className="metric-box diesel-diff"><p className="metric-label">Diesel difference</p><p className={`metric-value ${filteredReportTotals.dieselVariance >= 0 ? "variance-positive" : "variance-negative"}`}>{formatNumber(filteredReportTotals.dieselVariance)} L</p></div><div className="metric-box petrol-diff"><p className="metric-label">Petrol difference</p><p className={`metric-value ${filteredReportTotals.petrolVariance >= 0 ? "variance-positive" : "variance-negative"}`}>{formatNumber(filteredReportTotals.petrolVariance)} L</p></div></div></div><div className="report-list">{deliveryReports.length === 0 ? <p style={{ margin: 0, color: "#64748b" }}>No truck delivery reports for the selected period.</p> : deliveryReports.map((report) => <div key={report.deliveryId} className="report-card"><div className="report-top"><div><p className="report-title">{report.deliveryId}</p><p className="report-subtitle">Invoice: {report.reference} • Truck: {report.truckPlate} • Driver: {report.driverName}</p></div><span className="report-pill">{report.rows.length} tank record{report.rows.length === 1 ? "" : "s"}</span></div><div className="report-metrics"><div className="metric-box"><p className="metric-label">Total received</p><p className="metric-value">{formatNumber(report.totalReceived)} L</p></div><div className="metric-box diesel"><p className="metric-label">Diesel received</p><p className="metric-value">{formatNumber(report.dieselReceived)} L</p></div><div className="metric-box petrol"><p className="metric-label">Petrol received</p><p className="metric-value">{formatNumber(report.petrolReceived)} L</p></div><div className="metric-box"><p className="metric-label">Total invoice</p><p className="metric-value">{formatNumber(report.totalInvoice)} L</p></div><div className="metric-box"><p className="metric-label">Total difference</p><p className={`metric-value ${report.totalVariance >= 0 ? "variance-positive" : "variance-negative"}`}>{formatNumber(report.totalVariance)} L</p></div><div className="metric-box diesel-diff"><p className="metric-label">Diesel difference</p><p className={`metric-value ${report.dieselVariance >= 0 ? "variance-positive" : "variance-negative"}`}>{formatNumber(report.dieselVariance)} L</p></div><div className="metric-box petrol-diff"><p className="metric-label">Petrol difference</p><p className={`metric-value ${report.petrolVariance >= 0 ? "variance-positive" : "variance-negative"}`}>{formatNumber(report.petrolVariance)} L</p></div><div className="metric-box"><p className="metric-label">Date</p><p className="metric-value" style={{ fontSize: 16 }}>{report.date || "Not entered"}</p></div></div><div className="report-lines">{report.rows.map((row) => <div key={row.id} className={`report-line ${getProductClass(row.product)}`}><strong>{row.station} • {row.tank}</strong> <ProductBadge product={row.product} /><br />Initial: {row.initialMm}mm / {formatNumber(row.initialLiters)}L → Final: {row.finalMm}mm / {formatNumber(row.finalLiters)}L<br />Received: {formatNumber(row.deliveredLiters)}L • Invoice: {formatNumber(row.invoiceLiters)}L • Difference: <span className={row.variance >= 0 ? "variance-positive" : "variance-negative"}>{formatNumber(row.variance)}L</span><br />{permissions.editDelivery ? <button type="button" onClick={() => startEditUnloading(row)} className="secondary-button" style={{ marginTop: 8, minHeight: 36, padding: "8px 12px" }}>✏️ Edit</button> : null}</div>)}</div></div>)}</div></> : null}</div></Card> : null}

    {activePage === "sales" ? <><Card><div className="card-content form-grid"><div className="section-title"><span style={{ fontSize: 24 }}>📥</span><h2>Sales CSV Import</h2></div><div className="import-box"><p style={{ margin: 0 }}>Upload the NetPOS Wet Sales CSV export. The app will read sales by date, tank and litres.</p><input className="field-input" type="file" accept=".csv,.txt" onChange={handleSalesCsvFile} /><div className="warning-box">{salesImportStatus}</div></div><div className="import-summary"><div className="metric-box"><p className="metric-label">Imported rows</p><p className="metric-value">{stationSalesImportHistory.length}</p></div><div className="metric-box"><p className="metric-label">Total sales</p><p className="metric-value">{formatNumber(salesTotals.liters)} L</p></div><div className="metric-box diesel"><p className="metric-label">Diesel sales</p><p className="metric-value">{formatNumber(salesTotals.diesel)} L</p></div><div className="metric-box petrol"><p className="metric-label">Petrol sales</p><p className="metric-value">{formatNumber(salesTotals.petrol)} L</p></div></div>{permissions.clearData ? <button type="button" className="secondary-button" onClick={() => { persistSalesHistory([]); setSalesImportStatus("Sales imports cleared."); }}>Clear Imported Sales</button> : null}</div></Card><Card><div className="card-content"><div className="history-header"><div><h2>Imported Sales History</h2><p>Rows imported from NetPOS CSV files.</p></div></div><div className="history-table-wrap"><table className="history-table"><thead><tr><th>Date</th><th>Station</th><th>Tank</th><th>Product</th><th>Litres</th><th>Gross</th><th>Amount</th><th>File</th><th>Imported At</th></tr></thead><tbody>{stationSalesImportHistory.length === 0 ? <tr><td style={{ padding: "22px 8px", color: "#64748b" }} colSpan={9}>No sales imported yet for this station.</td></tr> : stationSalesImportHistory.map((row) => <tr key={row.id} className={`history-row-${getProductClass(row.product)}`}><td>{row.displayDate || row.date}</td><td>{row.station}</td><td>{row.tank}</td><td><ProductBadge product={row.product} /></td><td>{formatNumber(row.liters)} L</td><td>MT{formatNumber(row.gross)}</td><td>MT{formatNumber(row.amount)}</td><td>{row.fileName || "CSV"}</td><td>{row.importedAt}</td></tr>)}</tbody></table></div></div></Card></> : null}

    {activePage === "users" && permissions.users ? <Card><div className="card-content form-grid"><div className="history-header"><div><h2>👥 User Management</h2><p>Create users and control exactly what each one can see or do inside this app.</p></div><button type="button" className="primary-button" onClick={startNewUser}>➕ New User</button></div><div className="user-management-grid"><div className="user-list">{users.map((user) => <button key={user.id} type="button" className={`user-list-button ${selectedManagedUser?.id === user.id ? "active" : ""}`} onClick={() => selectManagedUser(user.id)}><strong>{user.username}</strong><div className="small-text" style={{ marginTop: 4 }}>{user.role} • {user.active === false ? "Inactive" : "Active"} • {user.stationId && user.stationId !== "all" ? (stations[user.stationId]?.name || user.stationId) : "All stations"}</div></button>)}</div><div className="form-grid"><div className="unloading-grid"><div><FieldLabel>Username</FieldLabel><input className="field-input" value={userForm.username} onChange={(event) => setUserForm((current) => ({ ...current, username: event.target.value }))} placeholder="example: cashier1" /></div><div><FieldLabel>Password</FieldLabel><input className="field-input" value={userForm.password} onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))} placeholder="Set password" /></div><div><FieldLabel>Role / title</FieldLabel><input className="field-input" value={userForm.role} onChange={(event) => setUserForm((current) => ({ ...current, role: event.target.value }))} placeholder="Operator, Manager, Viewer..." /></div></div><div><FieldLabel>Assigned station</FieldLabel><select className="field-input" value={userForm.stationId || "all"} onChange={(event) => setUserForm((current) => ({ ...current, stationId: event.target.value }))}><option value="all">All stations / Administrator</option>{Object.entries(stations).map(([id, item]) => <option key={id} value={id}>{item.name}</option>)}</select><p className="small-text" style={{ marginBottom: 0 }}>Reading operators should be assigned to only one station.</p></div><label className="permission-item" style={{ maxWidth: 260 }}><input type="checkbox" checked={userForm.active !== false} onChange={(event) => setUserForm((current) => ({ ...current, active: event.target.checked }))} /><span><span className="permission-title">Active user</span><div className="permission-help">Inactive users cannot login.</div></span></label><div className="permission-grid">{PERMISSION_DEFINITIONS.map(([key, label, help]) => <label key={key} className="permission-item"><input type="checkbox" checked={Boolean(userForm.permissions?.[key])} onChange={(event) => updateUserPermission(key, event.target.checked)} /><span><span className="permission-title">{label}</span><div className="permission-help">{help}</div></span></label>)}</div>{userFormMessage ? <div className="diagnostic-box">{userFormMessage}</div> : null}<div className="unloading-actions"><button type="button" className="primary-button" onClick={saveManagedUser}>💾 Save User</button>{selectedManagedUser ? <button type="button" className="secondary-button" onClick={deleteManagedUser}>🗑️ Delete User</button> : null}<button type="button" className="secondary-button" onClick={() => { persistUsersEverywhere(DEFAULT_USERS).then((defaults) => setSelectedUserId(defaults[0]?.id || "")); setUserFormMessage("Default users restored and sent to Google Sheets."); }}>Restore Default Users</button></div><div className="warning-box">User sync status: {userSyncStatus}<br />Users are now saved locally and sent to the Users sheet. All devices will see changes after refresh/login once the Apps Script below is updated.</div></div></div></div></Card> : null}
  </div></div>;
}
