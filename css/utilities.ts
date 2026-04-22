export const CSS_UTILITIES = /* css */ `
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.legal-doc * { border-radius: 0; }
.legal-doc h1 { font-size: 1.75rem; margin-bottom: 0.25rem; }
.legal-doc h2 { font-size: 1.25rem; margin-top: 2.5rem; margin-bottom: 0.75rem; padding-bottom: 0.35rem; }
.legal-doc h3 { font-size: 1.05rem; margin-top: 1.5rem; margin-bottom: 0.5rem; }
.legal-doc p { margin-bottom: 1rem; }
.legal-doc ul, .legal-doc ol { margin: 0 0 1rem 1.5rem; }
.legal-doc li { margin-bottom: 0.4rem; }
.legal-doc .updated { color: var(--text2); font-size: 0.9rem; }
.legal-doc .disclaimer { background: var(--bg2); padding: 1rem 1.25rem; margin: 2rem 0; font-size: 0.92rem; color: var(--text2); }
.dimmed { opacity: 0.5; }
.subtle { opacity: 0.6; }
.muted { opacity: 0.7; }
.faded { opacity: 0.8; }
.inert { pointer-events: none; }
.interactive { pointer-events: auto; }
.no-select { -webkit-user-select: none; }
.no-transition { transition: none; }
.frosted { background: rgba(255, 255, 255, 0.92); -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px); }
.glass-blur { -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); }
.glass-blur-md { -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); }
.glass-blur-sm { -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); }
.glass-blur-lg { -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px); }
.glass-blur-xl { -webkit-backdrop-filter: blur(24px); backdrop-filter: blur(24px); }
.spinning { animation: spin 1s linear infinite; }
.pinging { animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite; }
.pulsing { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
.bouncing { animation: bounce 1s infinite; }
.drum-scroll { -webkit-overflow-scrolling: touch; }
@supports (scrollbar-width: none) { .drum-scroll { scrollbar-width: none; } }
.drum-scroll::-webkit-scrollbar { display: none; }
.fade-x { -webkit-mask-image: linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent); }
.online-ring { outline: 2px solid var(--online); outline-offset: 1px; }
.mutual-ring { box-shadow: 0 0 0 3px var(--yellow); }
.event-tile-fomo { border-left: 3px solid rgba(255, 85, 107, 0.7); }
.event-tile-fomo-tonight { border-left: 3px solid rgba(255, 85, 107, 0.8); }
.event-tile-fomo-pulse { animation: fomo-border-pulse 1s ease-in-out infinite; }
.fomo-glow { animation: fomo-glow 2s ease-in-out infinite; }
.live-ring { border-color: var(--danger); }
.live-beacon { animation: event-live-beacon 2s ease-in-out infinite; }
.live-beacon-card { border-color: var(--accent); animation: event-live-beacon-card 2s ease-in-out infinite; }
.party-ring { border: 4px solid var(--accent); }
.marker-enter-anim { animation: marker-enter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
.marker-exit-anim { animation: marker-exit 0.25s ease-in forwards; }
.flash-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none; z-index: 1000; }
.event-tile-tonight { background: rgb(18, 28, 56); color: rgb(224, 224, 255); }
.marker-z-top { z-index: 100; }
.marker-border-online { border-color: var(--online); }
.marker-border-white { border-color: white; }`
