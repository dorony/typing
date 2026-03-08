import { Enemy } from '../entities/Enemy';
import { Boss } from '../entities/Boss';
import { Missile } from '../entities/Missile';
import { ParticleSystem } from '../entities/ParticleSystem';

interface Star {
  x: number;
  y: number;
  speed: number;
  size: number;
  brightness: number;
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private stars: Star[] = [];
  private fontReady: boolean = false;

  width: number = 0;
  height: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');
    this.ctx = ctx;
    this.resize();
    this.initStars();
  }

  resize(): void {
    const dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  setFontReady(): void {
    this.fontReady = true;
  }

  private initStars(): void {
    this.stars = [];
    for (let i = 0; i < 80; i++) {
      this.stars.push({
        x: Math.random() * 2000,
        y: Math.random() * 2000,
        speed: 10 + Math.random() * 40,
        size: 0.5 + Math.random() * 2,
        brightness: 0.3 + Math.random() * 0.7,
      });
    }
  }

  clear(): void {
    // Background gradient
    const grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, '#0a0a2e');
    grad.addColorStop(0.5, '#12124a');
    grad.addColorStop(1, '#1a0a3e');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawStarfield(dt: number): void {
    for (const star of this.stars) {
      star.y += star.speed * dt;
      if (star.y > this.height) {
        star.y = -5;
        star.x = Math.random() * this.width;
      }

      this.ctx.beginPath();
      this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  drawEnemy(enemy: Enemy): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = enemy.opacity;

    // Glow effect
    if (enemy.glowIntensity > 0) {
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 20 * enemy.glowIntensity;
    }

    // Draw spaceship body
    ctx.beginPath();
    if (enemy.type === 'armored') {
      this.drawArmoredShip(enemy.x, enemy.y, enemy.radius);
    } else if (enemy.type === 'fast') {
      this.drawFastShip(enemy.x, enemy.y, enemy.radius);
    } else if (enemy.type === 'word') {
      this.drawWordShip(enemy.x, enemy.y, enemy.radius);
    } else {
      this.drawBasicShip(enemy.x, enemy.y, enemy.radius);
    }
    ctx.fillStyle = enemy.color + '44';
    ctx.fill();
    ctx.strokeStyle = enemy.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Engine glow
    this.drawEngineGlow(enemy.x, enemy.y, enemy.radius, enemy.aliveTime, enemy.color);

    // Inner glow
    const innerGrad = ctx.createRadialGradient(
      enemy.x,
      enemy.y - enemy.radius * 0.3,
      0,
      enemy.x,
      enemy.y,
      enemy.radius,
    );
    innerGrad.addColorStop(0, enemy.color + '33');
    innerGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Text
    const font = this.fontReady ? 'Varela Round' : 'sans-serif';
    if (enemy.type === 'word') {
      this.drawWordText(enemy.x, enemy.y, enemy.text, enemy.typedIndex, font);
    } else {
      ctx.font = `bold ${enemy.radius}px "${font}"`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.fillText(enemy.text, enemy.x, enemy.y);
    }

    // Lock-on indicator
    if (enemy.lockedOn) {
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Armor hits indicator
    if (enemy.type === 'armored' && enemy.hitsRemaining > 0) {
      for (let i = 0; i < enemy.hitsRemaining; i++) {
        ctx.beginPath();
        ctx.arc(
          enemy.x - 8 + i * 16,
          enemy.y + enemy.radius + 10,
          4,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = '#8866cc';
        ctx.fill();
      }
    }

    ctx.restore();
  }

  drawBoss(boss: Boss): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = boss.opacity;

    // Glow
    ctx.shadowColor = '#ff3333';
    ctx.shadowBlur = 30 * (0.5 + boss.glowIntensity);

    // Body - mothership
    ctx.beginPath();
    this.drawBossShip(boss.x, boss.y, boss.radius);
    ctx.fillStyle = 'rgba(255, 50, 50, 0.2)';
    ctx.fill();
    ctx.strokeStyle = '#ff3333';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Engine glow for boss
    this.drawEngineGlow(boss.x, boss.y, boss.radius, boss.aliveTime, '#ff3333');

    // Inner glow
    const innerGrad = ctx.createRadialGradient(
      boss.x,
      boss.y - boss.radius * 0.3,
      0,
      boss.x,
      boss.y,
      boss.radius,
    );
    innerGrad.addColorStop(0, 'rgba(255, 100, 100, 0.2)');
    innerGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.arc(boss.x, boss.y, boss.radius, 0, Math.PI * 2);
    ctx.fill();

    // Boss word text (display during missile phase)
    const font = this.fontReady ? 'Varela Round' : 'sans-serif';

    if (boss.phase === 'missile') {
      // Show boss word and "!טילים" label
      ctx.font = `bold 28px "${font}"`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(boss.text, boss.x, boss.y);

      ctx.font = `bold 14px "${font}"`;
      ctx.fillStyle = '#ff6666';
      ctx.fillText('!טילים', boss.x, boss.y - boss.radius - 10);
    } else if (boss.phase === 'entrance') {
      ctx.font = `bold 28px "${font}"`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(boss.text, boss.x, boss.y);
    }

    // Boss label
    if (boss.phase !== 'missile') {
      ctx.font = `bold 14px "${font}"`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ff6666';
      ctx.fillText('BOSS', boss.x, boss.y - boss.radius - 10);
    }

    // Health bar — during final phase show 3 segments
    if (boss.phase === 'final' || boss.phase === 'missile') {
      const barWidth = boss.radius * 2;
      const barHeight = 8;
      const barX = boss.x - barWidth / 2;
      const barY = boss.y + boss.radius + 15;

      if (boss.phase === 'final') {
        // 3 segment health bar
        const segW = barWidth / 3;
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
          ctx.fillRect(barX + i * segW + 1, barY, segW - 2, barHeight);

          if (i >= boss.finalPairIndex) {
            ctx.fillStyle = i === boss.finalPairIndex ? '#ff4444' : '#ff6666';
            ctx.fillRect(barX + i * segW + 1, barY, segW - 2, barHeight);
          }
        }
        ctx.strokeStyle = '#ff6666';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
      } else {
        // Full health bar during missile phase
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.strokeStyle = '#ff6666';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
      }
    }

    ctx.restore();
  }

  drawMissile(missile: Missile): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = missile.opacity;

    const { x, y, radius } = missile;

    // Exhaust flame (flickering)
    const flicker = 0.7 + Math.sin(missile.aliveTime * 20) * 0.3;
    const flameLength = radius * 1.2 * flicker;

    const flameGrad = ctx.createRadialGradient(x, y - radius, 2, x, y - radius - flameLength, radius * 0.6);
    flameGrad.addColorStop(0, 'rgba(255, 200, 50, 0.8)');
    flameGrad.addColorStop(0.5, 'rgba(255, 100, 20, 0.4)');
    flameGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.ellipse(x, y - radius - flameLength * 0.4, radius * 0.4, flameLength * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rocket body (small ship shape pointing down)
    ctx.beginPath();
    ctx.moveTo(x, y + radius);          // nose (bottom, pointing down)
    ctx.lineTo(x - radius * 0.4, y);    // left mid
    ctx.lineTo(x - radius * 0.6, y - radius * 0.7); // left fin
    ctx.lineTo(x - radius * 0.3, y - radius * 0.5); // left fin inner
    ctx.lineTo(x - radius * 0.3, y - radius);        // left tail
    ctx.lineTo(x + radius * 0.3, y - radius);        // right tail
    ctx.lineTo(x + radius * 0.3, y - radius * 0.5);  // right fin inner
    ctx.lineTo(x + radius * 0.6, y - radius * 0.7);  // right fin
    ctx.lineTo(x + radius * 0.4, y);    // right mid
    ctx.closePath();

    ctx.fillStyle = 'rgba(255, 100, 60, 0.5)';
    ctx.fill();
    ctx.strokeStyle = '#ff6644';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Letter in center
    const font = this.fontReady ? 'Varela Round' : 'sans-serif';
    ctx.font = `bold ${radius}px "${font}"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(missile.letter, x, y);

    ctx.restore();
  }

  drawBossFinalPair(boss: Boss, pair: [string, string], firstPressed: string | null): void {
    const ctx = this.ctx;
    ctx.save();

    const font = this.fontReady ? 'Varela Round' : 'sans-serif';
    const circleRadius = 32;
    const gap = 80;
    const centerY = boss.y + boss.radius + 60;

    // Draw two circles with letters
    for (let i = 0; i < 2; i++) {
      const cx = boss.x + (i === 0 ? -gap / 2 : gap / 2);
      const letter = pair[i];
      const isPressed = firstPressed === letter;

      // Circle
      ctx.beginPath();
      ctx.arc(cx, centerY, circleRadius, 0, Math.PI * 2);

      if (isPressed) {
        ctx.fillStyle = 'rgba(100, 255, 100, 0.3)';
        ctx.strokeStyle = '#44ff44';
      } else {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
        ctx.strokeStyle = '#ffd700';
      }

      ctx.lineWidth = 3;
      ctx.fill();
      ctx.stroke();

      // Letter
      ctx.font = `bold 28px "${font}"`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isPressed ? '#44ff44' : '#ffd700';
      ctx.fillText(letter, cx, centerY);
    }

    // "+" between circles
    ctx.font = `bold 24px "${font}"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff88';
    ctx.fillText('+', boss.x, centerY);

    // Instruction text
    ctx.font = `bold 16px "${font}"`;
    ctx.fillStyle = '#aaaaff';
    ctx.fillText('!לחצו על שתי האותיות', boss.x, centerY + circleRadius + 25);

    ctx.restore();
  }

  private drawWordText(
    x: number,
    y: number,
    text: string,
    typedIndex: number,
    font: string,
    fontSize: number = 20,
  ): void {
    const ctx = this.ctx;
    ctx.font = `bold ${fontSize}px "${font}"`;
    ctx.textBaseline = 'middle';

    // Measure total width
    const totalWidth = ctx.measureText(text).width;
    // Hebrew is RTL: start from the right side and draw each char moving left
    let cursorX = x + totalWidth / 2;

    for (let i = 0; i < text.length; i++) {
      const charWidth = ctx.measureText(text[i]).width;
      cursorX -= charWidth;
      if (i < typedIndex) {
        ctx.fillStyle = 'rgba(100, 255, 100, 0.5)'; // typed - green/faded
      } else if (i === typedIndex) {
        ctx.fillStyle = '#ffd700'; // next char - gold
      } else {
        ctx.fillStyle = '#ffffff'; // remaining - white
      }
      ctx.textAlign = 'left';
      ctx.fillText(text[i], cursorX, y);
    }
  }

  drawParticles(particles: ParticleSystem): void {
    const ctx = this.ctx;
    for (const p of particles.getActive()) {
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // --- Alien spaceship shapes (all face downward) ---

  /** Scout: flying saucer with a dome and curved prongs */
  private drawBasicShip(x: number, y: number, r: number): void {
    const ctx = this.ctx;
    // Saucer body (ellipse)
    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.9, r * 0.45, 0, 0, Math.PI * 2);
    ctx.closePath();

    // Dome on top (towards screen bottom = front)
    ctx.moveTo(x + r * 0.35, y);
    ctx.quadraticCurveTo(x + r * 0.35, y + r * 0.55, x, y + r * 0.65);
    ctx.quadraticCurveTo(x - r * 0.35, y + r * 0.55, x - r * 0.35, y);

    // Left prong
    ctx.moveTo(x - r * 0.7, y + r * 0.1);
    ctx.quadraticCurveTo(x - r * 1.05, y + r * 0.5, x - r * 0.85, y + r * 0.85);
    ctx.lineTo(x - r * 0.65, y + r * 0.55);

    // Right prong (mirror)
    ctx.moveTo(x + r * 0.7, y + r * 0.1);
    ctx.quadraticCurveTo(x + r * 1.05, y + r * 0.5, x + r * 0.85, y + r * 0.85);
    ctx.lineTo(x + r * 0.65, y + r * 0.55);
  }

  /** Dart: sleek alien wedge with organic curves and antenna */
  private drawFastShip(x: number, y: number, r: number): void {
    const ctx = this.ctx;
    ctx.beginPath();
    // Sharp organic nose
    ctx.moveTo(x, y + r * 1.1);
    ctx.quadraticCurveTo(x - r * 0.15, y + r * 0.6, x - r * 0.25, y + r * 0.15);
    // Left blade curves outward then back
    ctx.quadraticCurveTo(x - r * 0.6, y + r * 0.05, x - r * 0.55, y - r * 0.35);
    ctx.quadraticCurveTo(x - r * 0.5, y - r * 0.7, x - r * 0.2, y - r * 0.55);
    // Left antenna
    ctx.lineTo(x - r * 0.3, y - r);
    ctx.lineTo(x - r * 0.1, y - r * 0.5);
    // Center notch
    ctx.lineTo(x, y - r * 0.35);
    // Right antenna
    ctx.lineTo(x + r * 0.1, y - r * 0.5);
    ctx.lineTo(x + r * 0.3, y - r);
    ctx.lineTo(x + r * 0.2, y - r * 0.55);
    // Right blade
    ctx.quadraticCurveTo(x + r * 0.5, y - r * 0.7, x + r * 0.55, y - r * 0.35);
    ctx.quadraticCurveTo(x + r * 0.6, y + r * 0.05, x + r * 0.25, y + r * 0.15);
    ctx.quadraticCurveTo(x + r * 0.15, y + r * 0.6, x, y + r * 1.1);
    ctx.closePath();
  }

  /** Brute: heavy alien beetle with armored carapace and mandibles */
  private drawArmoredShip(x: number, y: number, r: number): void {
    const ctx = this.ctx;
    ctx.beginPath();
    // Left mandible
    ctx.moveTo(x, y + r * 0.5);
    ctx.quadraticCurveTo(x - r * 0.25, y + r * 0.9, x - r * 0.5, y + r * 0.95);
    ctx.quadraticCurveTo(x - r * 0.55, y + r * 0.7, x - r * 0.3, y + r * 0.45);
    // Left carapace
    ctx.quadraticCurveTo(x - r * 0.8, y + r * 0.3, x - r, y);
    ctx.quadraticCurveTo(x - r * 1.05, y - r * 0.4, x - r * 0.8, y - r * 0.6);
    // Left rear plate
    ctx.lineTo(x - r * 0.5, y - r * 0.5);
    ctx.lineTo(x - r * 0.45, y - r * 0.85);
    ctx.lineTo(x - r * 0.15, y - r * 0.6);
    // Center spine
    ctx.lineTo(x, y - r * 0.45);
    // Right side (mirror)
    ctx.lineTo(x + r * 0.15, y - r * 0.6);
    ctx.lineTo(x + r * 0.45, y - r * 0.85);
    ctx.lineTo(x + r * 0.5, y - r * 0.5);
    ctx.lineTo(x + r * 0.8, y - r * 0.6);
    ctx.quadraticCurveTo(x + r * 1.05, y - r * 0.4, x + r, y);
    ctx.quadraticCurveTo(x + r * 0.8, y + r * 0.3, x + r * 0.3, y + r * 0.45);
    // Right mandible
    ctx.quadraticCurveTo(x + r * 0.55, y + r * 0.7, x + r * 0.5, y + r * 0.95);
    ctx.quadraticCurveTo(x + r * 0.25, y + r * 0.9, x, y + r * 0.5);
    ctx.closePath();
  }

  /** Carrier: organic alien barge — wide oval hull with tentacle-like side fins */
  private drawWordShip(x: number, y: number, r: number): void {
    const ctx = this.ctx;
    ctx.beginPath();
    // Front dome
    ctx.moveTo(x, y + r * 0.65);
    ctx.quadraticCurveTo(x - r * 0.6, y + r * 0.6, x - r * 0.75, y + r * 0.15);
    // Left tentacle fin
    ctx.quadraticCurveTo(x - r * 0.95, y + r * 0.3, x - r * 0.9, y + r * 0.65);
    ctx.quadraticCurveTo(x - r * 0.85, y + r * 0.35, x - r * 0.8, y);
    // Left body rear
    ctx.quadraticCurveTo(x - r * 0.85, y - r * 0.35, x - r * 0.6, y - r * 0.5);
    ctx.lineTo(x - r * 0.35, y - r * 0.7);
    ctx.lineTo(x - r * 0.15, y - r * 0.5);
    // Center
    ctx.lineTo(x, y - r * 0.4);
    ctx.lineTo(x + r * 0.15, y - r * 0.5);
    ctx.lineTo(x + r * 0.35, y - r * 0.7);
    // Right body rear
    ctx.lineTo(x + r * 0.6, y - r * 0.5);
    ctx.quadraticCurveTo(x + r * 0.85, y - r * 0.35, x + r * 0.8, y);
    // Right tentacle fin
    ctx.quadraticCurveTo(x + r * 0.85, y + r * 0.35, x + r * 0.9, y + r * 0.65);
    ctx.quadraticCurveTo(x + r * 0.95, y + r * 0.3, x + r * 0.75, y + r * 0.15);
    // Close front
    ctx.quadraticCurveTo(x + r * 0.6, y + r * 0.6, x, y + r * 0.65);
    ctx.closePath();
  }

  /** Mothership: massive alien dreadnought with organic curves, eye-like center, claw wings */
  private drawBossShip(x: number, y: number, r: number): void {
    const ctx = this.ctx;
    ctx.beginPath();
    // Central prow
    ctx.moveTo(x, y + r * 0.75);
    ctx.quadraticCurveTo(x - r * 0.2, y + r * 0.5, x - r * 0.35, y + r * 0.2);
    // Left claw wing
    ctx.quadraticCurveTo(x - r * 0.55, y + r * 0.35, x - r * 0.85, y + r * 0.45);
    ctx.quadraticCurveTo(x - r * 1.05, y + r * 0.3, x - r, y);
    ctx.quadraticCurveTo(x - r * 1.05, y - r * 0.25, x - r * 0.9, y - r * 0.45);
    // Left claw tip
    ctx.lineTo(x - r * 0.95, y - r * 0.75);
    ctx.quadraticCurveTo(x - r * 0.75, y - r * 0.6, x - r * 0.6, y - r * 0.4);
    // Left rear spines
    ctx.lineTo(x - r * 0.5, y - r * 0.65);
    ctx.lineTo(x - r * 0.35, y - r * 0.9);
    ctx.lineTo(x - r * 0.2, y - r * 0.6);
    // Center tail
    ctx.lineTo(x, y - r * 0.5);
    // Right rear spines (mirror)
    ctx.lineTo(x + r * 0.2, y - r * 0.6);
    ctx.lineTo(x + r * 0.35, y - r * 0.9);
    ctx.lineTo(x + r * 0.5, y - r * 0.65);
    ctx.lineTo(x + r * 0.6, y - r * 0.4);
    // Right claw tip
    ctx.quadraticCurveTo(x + r * 0.75, y - r * 0.6, x + r * 0.95, y - r * 0.75);
    ctx.lineTo(x + r * 0.9, y - r * 0.45);
    // Right claw wing
    ctx.quadraticCurveTo(x + r * 1.05, y - r * 0.25, x + r, y);
    ctx.quadraticCurveTo(x + r * 1.05, y + r * 0.3, x + r * 0.85, y + r * 0.45);
    ctx.quadraticCurveTo(x + r * 0.55, y + r * 0.35, x + r * 0.35, y + r * 0.2);
    ctx.quadraticCurveTo(x + r * 0.2, y + r * 0.5, x, y + r * 0.75);
    ctx.closePath();
  }

  /** Engine glow: eerie alien energy behind the ship */
  private drawEngineGlow(x: number, y: number, r: number, aliveTime: number, _baseColor: string): void {
    const ctx = this.ctx;
    const flicker1 = 0.6 + Math.sin(aliveTime * 15) * 0.4;
    const flicker2 = 0.5 + Math.sin(aliveTime * 18 + 1) * 0.5;
    const flicker3 = 0.7 + Math.sin(aliveTime * 12 + 2) * 0.3;

    const engines = [
      { ox: -r * 0.25, size: r * 0.16, f: flicker1 },
      { ox: 0,          size: r * 0.2,  f: flicker2 },
      { ox: r * 0.25,  size: r * 0.16, f: flicker3 },
    ];

    for (const eng of engines) {
      const ex = x + eng.ox;
      const ey = y - r * 0.6;
      const sz = eng.size * eng.f;
      const grad = ctx.createRadialGradient(ex, ey, 0, ex, ey, sz * 1.8);
      grad.addColorStop(0, 'rgba(120, 255, 180, 0.7)');
      grad.addColorStop(0.4, 'rgba(60, 220, 160, 0.35)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(ex, ey, sz * 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /** Draw a floating text popup (for combos, etc.) */
  drawFloatingText(
    text: string,
    x: number,
    y: number,
    progress: number,
    color: string = '#ffd700',
    size: number = 32,
  ): void {
    const ctx = this.ctx;
    ctx.save();
    const alpha = 1 - progress;
    const scale = 0.8 + progress * 0.5;
    ctx.globalAlpha = alpha;
    const font = this.fontReady ? 'Varela Round' : 'sans-serif';
    ctx.font = `bold ${size * scale}px "${font}"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.fillText(text, x, y - progress * 60);
    ctx.restore();
  }

  /** Draw power-up indicator on an enemy */
  drawPowerUpGlow(x: number, y: number, radius: number): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius + 12, 0, Math.PI * 2);
    ctx.strokeStyle = '#00ff80';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
}
