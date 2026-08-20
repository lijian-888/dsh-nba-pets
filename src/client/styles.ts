export const PET_STYLES = `
.dshNbaPetsRoot{position:fixed;z-index:1200;pointer-events:none;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#f8fafc}
.dshNbaPetsStage{position:relative;width:166px;height:184px;pointer-events:auto;touch-action:none;user-select:none;filter:drop-shadow(0 12px 14px rgba(2,6,23,.34))}
.dshNbaPetsPetButton{position:absolute;inset:17px 8px 0;width:150px;height:164px;border:0;padding:0;background:transparent;cursor:grab;touch-action:none}
.dshNbaPetsPetButton:active{cursor:grabbing}
.dshNbaPetsPetButton:focus-visible{outline:3px solid #fbbf24;outline-offset:2px;border-radius:22px}
.dshNbaPetsSprite{position:absolute;left:7px;top:0;width:136px;height:147.33px;background-repeat:no-repeat;background-size:800% 1100%;image-rendering:auto}
.dshNbaPetsBadge{position:absolute;right:0;top:1px;display:flex;align-items:center;gap:5px;min-height:25px;max-width:132px;padding:4px 8px;border:1px solid rgba(255,255,255,.24);border-radius:999px;background:rgba(15,23,42,.9);box-shadow:0 5px 16px rgba(2,6,23,.3);font-size:11px;font-weight:750;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;backdrop-filter:blur(8px)}
.dshNbaPetsBadgeDot{width:7px;height:7px;flex:0 0 auto;border-radius:50%;background:var(--pet-status,#94a3b8);box-shadow:0 0 0 3px color-mix(in srgb,var(--pet-status) 22%,transparent)}
.dshNbaPetsPanel{position:absolute;right:158px;bottom:12px;width:min(310px,calc(100vw - 190px));max-height:min(480px,calc(100vh - 32px));overflow:auto;padding:14px;border:1px solid rgba(148,163,184,.26);border-radius:18px;background:linear-gradient(160deg,rgba(15,23,42,.97),rgba(30,41,59,.96));box-shadow:0 22px 60px rgba(2,6,23,.48);backdrop-filter:blur(16px);pointer-events:auto;touch-action:auto;user-select:text}
.dshNbaPetsPanelHeader{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:12px}
.dshNbaPetsPanelTitle{margin:0;font-size:15px;font-weight:850;letter-spacing:.01em}
.dshNbaPetsPanelSub{margin:3px 0 0;color:#94a3b8;font-size:11px;line-height:1.35}
.dshNbaPetsClose,.dshNbaPetsTuck{border:1px solid rgba(148,163,184,.24);border-radius:10px;background:rgba(51,65,85,.72);color:#e2e8f0;cursor:pointer}
.dshNbaPetsClose{width:29px;height:29px;font-size:16px}
.dshNbaPetsCharacters{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:13px}
.dshNbaPetsCharacter{display:flex;align-items:center;gap:8px;padding:8px;border:1px solid rgba(148,163,184,.22);border-radius:12px;background:rgba(30,41,59,.74);color:#e2e8f0;text-align:left;cursor:pointer}
.dshNbaPetsCharacter[aria-pressed=true]{border-color:#fbbf24;background:rgba(120,82,12,.35);box-shadow:inset 0 0 0 1px rgba(251,191,36,.26)}
.dshNbaPetsThumb{width:36px;height:39px;flex:0 0 auto;background-repeat:no-repeat;background-size:800% 1100%;background-position:0 0}
.dshNbaPetsCharacterName{display:block;font-size:12px;font-weight:780}.dshNbaPetsCharacterMeta{display:block;margin-top:1px;color:#94a3b8;font-size:9px}
.dshNbaPetsSectionTitle{margin:2px 0 7px;color:#cbd5e1;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}
.dshNbaPetsSessions{display:grid;gap:6px;margin:0;padding:0;list-style:none}
.dshNbaPetsSession{display:grid;grid-template-columns:9px 1fr auto;align-items:center;gap:8px;width:100%;padding:8px 9px;border:1px solid rgba(148,163,184,.16);border-radius:11px;background:rgba(15,23,42,.58);color:#e2e8f0;text-align:left;cursor:pointer}
.dshNbaPetsSession:hover{border-color:rgba(251,191,36,.45);background:rgba(51,65,85,.72)}
.dshNbaPetsSessionDot{width:8px;height:8px;border-radius:50%;background:var(--row-status,#64748b)}
.dshNbaPetsSessionName{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-weight:650}.dshNbaPetsSessionState{color:#94a3b8;font-size:9px;white-space:nowrap}
.dshNbaPetsEmpty{padding:12px;border:1px dashed rgba(148,163,184,.24);border-radius:11px;color:#94a3b8;text-align:center;font-size:11px}
.dshNbaPetsFooter{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:12px;padding-top:11px;border-top:1px solid rgba(148,163,184,.16);color:#64748b;font-size:9px}
.dshNbaPetsTuck{padding:6px 9px;font-size:10px}
.dshNbaPetsWake{position:fixed;right:18px;bottom:18px;z-index:1200;pointer-events:auto;padding:9px 12px;border:1px solid rgba(251,191,36,.5);border-radius:999px;background:rgba(15,23,42,.94);box-shadow:0 12px 34px rgba(2,6,23,.38);color:#fde68a;font-weight:800;cursor:pointer}
.dshNbaPetsSrOnly{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media(max-width:620px){.dshNbaPetsPanel{right:-4px;bottom:174px;width:min(300px,calc(100vw - 24px))}}
@media(prefers-reduced-motion:reduce){.dshNbaPetsStage{filter:drop-shadow(0 8px 10px rgba(2,6,23,.26))}}
`
