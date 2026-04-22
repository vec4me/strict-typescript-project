export const CSS_KEYFRAMES = /* css */ `
@keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
@keyframes bounce { 0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); } 50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); } }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
@keyframes pulse-urgent { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
@keyframes pulse-live { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(0.8); } }
@keyframes like-pop { 0% { transform: scale(1); } 25% { transform: scale(1.3); } 50% { transform: scale(0.9); } 75% { transform: scale(1.1); } 100% { transform: scale(1); } }
@keyframes party-spark-burst { 0% { opacity: 1; transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1); } 100% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--angle)) translateY(calc(-1 * var(--dist))) scale(0); } }
@keyframes janken-reveal-bounce { 0% { transform: scale(0); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
@keyframes toast-in { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes return-arrow-fade-in { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes fade-in-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slide-in-left { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes slide-out-left { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-100%); opacity: 0; } }
@keyframes slide-in-right { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes slide-out-right { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
@keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }
@keyframes marker-enter { from { opacity: 0; transform: scale(0.4) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
@keyframes marker-exit { from { opacity: 1; transform: scale(1) translateY(0); } to { opacity: 0; transform: scale(0.4) translateY(8px); } }
@keyframes fomo-border-pulse { 0%, 100% { border-left-color: rgba(255, 85, 107, 0.6); } 50% { border-left-color: rgba(255, 85, 107, 1); } }
@keyframes fomo-glow { 0%, 100% { box-shadow: 0 0 0 0 rgba(255, 85, 107, 0); } 50% { box-shadow: 0 0 12px 2px rgba(255, 85, 107, 0.3); } }
@keyframes event-live-beacon { 0% { box-shadow: 0 0 0 3px var(--accent), 0 0 0 3px rgba(255, 85, 107, 0.6); } 50% { box-shadow: 0 0 0 3px var(--accent), 0 0 0 10px rgba(255, 85, 107, 0); } 100% { box-shadow: 0 0 0 3px var(--accent), 0 0 0 3px rgba(255, 85, 107, 0.6); } }
@keyframes event-live-beacon-card { 0% { box-shadow: 0 0 0 0 rgba(255, 85, 107, 0.6); } 50% { box-shadow: 0 0 0 8px rgba(255, 85, 107, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 85, 107, 0.6); } }`
