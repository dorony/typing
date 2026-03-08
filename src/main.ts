import './style.css';
import { Game } from './game/Game';

async function init() {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  const overlay = document.getElementById('ui-overlay') as HTMLDivElement;

  if (!canvas || !overlay) {
    throw new Error('Missing game container elements');
  }

  const game = new Game(canvas, overlay);

  // Load font then start
  try {
    await document.fonts.load('1rem "Varela Round"');
    game.setFontReady();
  } catch {
    // Font loading failed - continue with fallback
  }

  game.start();
}

// Add mobile warning
const mobileWarning = document.createElement('div');
mobileWarning.className = 'mobile-warning';
mobileWarning.innerHTML = `
  <div class="mobile-warning-icon">⌨️</div>
  <div class="mobile-warning-text">
    המשחק הזה דורש מקלדת פיזית.<br>
    אנא שחק במחשב!
  </div>
`;
document.body.appendChild(mobileWarning);

init();
