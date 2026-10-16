import * as THREE from 'three';

/**
 * Procedural texture generator for authentic 2000s nostalgic patterns
 */
export function createRetroTexture(
  textureId: string,
  accentColor: string,
  sticker?: string | null
): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new THREE.Texture();
  }

  // Base fill
  ctx.fillStyle = '#1e1b2e';
  ctx.fillRect(0, 0, 512, 512);

  switch (textureId) {
    case 'cheetah_pink': {
      // Pink cheetah / leopard print (McBling 2000s)
      ctx.fillStyle = '#ff66b2';
      ctx.fillRect(0, 0, 512, 512);

      // Spots
      const spotCount = 70;
      for (let i = 0; i < spotCount; i++) {
        const x = (i * 73) % 512;
        const y = (i * 97) % 512;
        const size = 16 + (i % 5) * 4;

        // Inner spot
        ctx.fillStyle = '#ff007f';
        ctx.beginPath();
        ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Dark irregular outline
        ctx.strokeStyle = '#2b001a';
        ctx.lineWidth = 4 + (i % 3);
        ctx.beginPath();
        ctx.arc(x, y, size, 0.2, Math.PI * 1.4);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x + 2, y, size, Math.PI * 1.6, Math.PI * 2.1);
        ctx.stroke();
      }
      break;
    }

    case 'zebra_neon': {
      // Electric cyan & black zebra stripes with pink stripes
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(0, 0, 512, 512);

      ctx.fillStyle = '#111827';
      for (let y = -50; y < 600; y += 42) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(150, y + 25, 350, y - 25, 512, y + 10);
        ctx.lineTo(512, y + 26);
        ctx.bezierCurveTo(350, y + 2, 150, y + 45, 0, y + 26);
        ctx.closePath();
        ctx.fill();

        // Hot pink pinstripe
        ctx.strokeStyle = '#ff007f';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, y + 32);
        ctx.bezierCurveTo(150, y + 50, 350, y + 10, 512, y + 36);
        ctx.stroke();
      }
      break;
    }

    case 'translucent_imac': {
      // Bondi Blue Aqua Translucent Plastic with inner pinstripes
      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, '#00b4d8');
      grad.addColorStop(0.5, '#0077b6');
      grad.addColorStop(1, '#0096c7');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Fine tech pinstripes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 2;
      for (let x = 0; x < 512; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }

      // Glossy highlight curve
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.ellipse(256, 120, 200, 70, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'tangerine_imac': {
      // Tangerine Juicy Orange Gel
      const grad = ctx.createRadialGradient(256, 256, 50, 256, 256, 300);
      grad.addColorStop(0, '#ffa200');
      grad.addColorStop(0.7, '#ff5500');
      grad.addColorStop(1, '#cc3300');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 3;
      for (let y = 0; y < 512; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }
      break;
    }

    case 'cyber_chrome': {
      // Metallic mirror Chrome Y2K
      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.2, '#9bb0c1');
      grad.addColorStop(0.4, '#f8fafc');
      grad.addColorStop(0.6, '#475569');
      grad.addColorStop(0.8, '#e2e8f0');
      grad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Cyber diagonal light streaks
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(-100, 200);
      ctx.lineTo(300, 600);
      ctx.stroke();

      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(100, -50);
      ctx.lineTo(600, 450);
      ctx.stroke();
      break;
    }

    case 'groovy_daisies': {
      // Teen Pop Daisies
      ctx.fillStyle = '#ff99c8';
      ctx.fillRect(0, 0, 512, 512);

      const drawDaisy = (cx: number, cy: number, r: number) => {
        // Petals
        ctx.fillStyle = '#ffffff';
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
          const px = cx + Math.cos(a) * r;
          const py = cy + Math.sin(a) * r;
          ctx.beginPath();
          ctx.arc(px, py, r * 0.55, 0, Math.PI * 2);
          ctx.fill();
        }
        // Center
        ctx.fillStyle = '#ffe600';
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
        ctx.fill();
      };

      for (let x = 40; x < 512; x += 110) {
        for (let y = 40; y < 512; y += 110) {
          drawDaisy(x, y, 22);
          drawDaisy(x + 55, y + 55, 14);
        }
      }
      break;
    }

    case 'emo_plaid': {
      // Red and black skater tartan
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(0, 0, 512, 512);

      // Black vertical/horizontal stripes
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      for (let i = 0; i < 512; i += 64) {
        ctx.fillRect(i, 0, 24, 512);
        ctx.fillRect(0, i, 512, 24);
      }

      // White fine grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 512; i += 64) {
        ctx.beginPath();
        ctx.moveTo(i + 12, 0);
        ctx.lineTo(i + 12, 512);
        ctx.moveTo(0, i + 12);
        ctx.lineTo(512, i + 12);
        ctx.stroke();
      }
      break;
    }

    case 'hotrod_flames': {
      // Hot Rod racing flames
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, 512, 512);

      const drawFlames = (color: string, yStart: number, height: number) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, 512);
        for (let x = 0; x <= 512; x += 40) {
          const tipY = yStart + Math.sin(x * 0.08) * height;
          ctx.lineTo(x, tipY);
          ctx.lineTo(x + 20, yStart + height * 0.4);
        }
        ctx.lineTo(512, 512);
        ctx.closePath();
        ctx.fill();
      };

      drawFlames('#ff0000', 200, 180);
      drawFlames('#ff7700', 260, 140);
      drawFlames('#ffee00', 320, 100);
      break;
    }

    case 'glitter_stars': {
      // Galaxy glitter purple with stars
      ctx.fillStyle = '#581c87';
      ctx.fillRect(0, 0, 512, 512);

      // Stardust
      for (let i = 0; i < 200; i++) {
        const x = (i * 123) % 512;
        const y = (i * 241) % 512;
        ctx.fillStyle = i % 2 === 0 ? '#ff007f' : '#00f0ff';
        ctx.fillRect(x, y, 2 + (i % 3), 2 + (i % 3));
      }

      // Bright 4-point stars
      const drawStar = (cx: number, cy: number, r: number) => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(cx, cy - r);
        ctx.quadraticCurveTo(cx, cy, cx + r, cy);
        ctx.quadraticCurveTo(cx, cy, cx, cy + r);
        ctx.quadraticCurveTo(cx, cy, cx - r, cy);
        ctx.quadraticCurveTo(cx, cy, cx, cy - r);
        ctx.fill();
      };

      drawStar(100, 100, 24);
      drawStar(400, 150, 30);
      drawStar(220, 360, 26);
      drawStar(350, 420, 18);
      drawStar(80, 420, 20);
      break;
    }

    case 'cotton_candy':
    default: {
      // Dreamy pastel rainbow clouds
      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, '#a0c4ff');
      grad.addColorStop(0.35, '#bdb2ff');
      grad.addColorStop(0.7, '#ffc6ff');
      grad.addColorStop(1, '#ffd6a5');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Sparkles
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 30; i++) {
        const x = (i * 89) % 512;
        const y = (i * 137) % 512;
        ctx.beginPath();
        ctx.arc(x, y, 6 + (i % 8), 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
  }

  // Accent Border
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 14;
  ctx.strokeRect(0, 0, 512, 512);

  // Sticker Emblem
  if (sticker) {
    ctx.font = '84px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 16;
    ctx.fillText(sticker, 256, 256);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Procedural Floor textures (checkered skate tiles, glossy parquet, pastel grid, plush carpet, etc.)
 */
export function createFloorTexture(patternId: string, color: string): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  if (patternId.includes('checkered')) {
    // 2000s Pop Checkerboard with user color
    const tileSize = 64;
    for (let x = 0; x < 512; x += tileSize) {
      for (let y = 0; y < 512; y += tileSize) {
        ctx.fillStyle = ((x + y) / tileSize) % 2 === 0 ? color : '#111827';
        ctx.fillRect(x, y, tileSize, tileSize);
      }
    }
  } else if (patternId.includes('cyber')) {
    // Cyber neon grid
    ctx.fillStyle = '#0a0718';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    for (let x = 0; x <= 512; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.moveTo(0, x);
      ctx.lineTo(512, x);
      ctx.stroke();
    }
    // Cross point neon dots
    ctx.fillStyle = '#ffffff';
    for (let x = 0; x <= 512; x += 64) {
      for (let y = 0; y <= 512; y += 64) {
        ctx.fillRect(x - 2, y - 2, 4, 4);
      }
    }
  } else if (patternId.includes('carpet') || patternId.includes('plush')) {
    // Fluffy shag carpet
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    for (let i = 0; i < 3500; i++) {
      const rx = Math.random() * 512;
      const ry = Math.random() * 512;
      ctx.fillRect(rx, ry, 2, 3);
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    for (let i = 0; i < 2000; i++) {
      const rx = Math.random() * 512;
      const ry = Math.random() * 512;
      ctx.fillRect(rx, ry, 2, 2);
    }
  } else if (patternId.includes('daisy_tile')) {
    // Daisy flower tile mosaic
    ctx.fillStyle = color || '#ffe600';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    for (let x = 0; x < 512; x += 128) {
      for (let y = 0; y < 512; y += 128) {
        ctx.strokeRect(x, y, 128, 128);
        // Draw flower in center
        const cx = x + 64;
        const cy = y + 64;
        ctx.fillStyle = '#ffffff';
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
          ctx.beginPath();
          ctx.arc(cx + Math.cos(a) * 22, cy + Math.sin(a) * 22, 12, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (patternId.includes('hologram')) {
    // Glossy iridescent tiles
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, color || '#93c5fd');
    grad.addColorStop(0.3, '#c084fc');
    grad.addColorStop(0.6, '#67e8f9');
    grad.addColorStop(1, '#f472b6');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 3;
    for (let x = 0; x <= 512; x += 128) {
      for (let y = 0; y <= 512; y += 128) {
        ctx.strokeRect(x, y, 128, 128);
      }
    }
  } else if (patternId.includes('steel')) {
    // Industrial metal diamond plate
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#cbd5e1';
    for (let x = 32; x < 512; x += 64) {
      for (let y = 32; y < 512; y += 64) {
        ctx.beginPath();
        ctx.ellipse(x, y, 14, 5, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (patternId.includes('zebra')) {
    // Electric Zebra stripes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = color || '#00f0ff';
    for (let y = 0; y < 512; y += 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(150, y + 24, 300, y - 24, 512, y + 10);
      ctx.lineTo(512, y + 26);
      ctx.bezierCurveTo(300, y - 6, 150, y + 40, 0, y + 22);
      ctx.closePath();
      ctx.fill();
    }
  } else {
    // Glossy warm parquet wood
    ctx.fillStyle = color || '#e8b88a';
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    for (let y = 0; y < 512; y += 32) {
      ctx.fillRect(0, y, 512, 2);
    }
    for (let x = 0; x < 512; x += 128) {
      for (let y = 0; y < 512; y += 32) {
        const offset = (y / 32) % 2 === 0 ? 0 : 64;
        ctx.fillRect(x + offset, y, 2, 32);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Procedural Wall texture (Y2K stars, cheetah, butterflies, clouds, matrix, flames, stripes, bubbles)
 */
export function createWallTexture(patternId: string, color: string): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = color || '#ff99c8';
  ctx.fillRect(0, 0, 512, 512);

  if (patternId.includes('cheetah')) {
    // Cheetah spots
    for (let i = 0; i < 50; i++) {
      const x = (i * 71) % 512;
      const y = (i * 93) % 512;
      ctx.fillStyle = '#ff007f';
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2b001a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0.3, Math.PI * 1.5);
      ctx.stroke();
    }
  } else if (patternId.includes('butterfly')) {
    // Cute butterflies
    ctx.fillStyle = '#ffffff';
    ctx.font = '28px sans-serif';
    for (let x = 40; x < 512; x += 120) {
      for (let y = 40; y < 512; y += 120) {
        ctx.fillText('🦋', x, y);
      }
    }
  } else if (patternId.includes('aero')) {
    // Sky gradient with clouds
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#60a5fa');
    grad.addColorStop(1, '#ffffff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(80 + i * 80, 200 + (i % 2) * 50, 40, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (patternId.includes('matrix')) {
    // Matrix code stream
    ctx.fillStyle = '#050c05';
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = color || '#22c55e';
    ctx.font = '16px monospace';
    const glyphs = '01Y2K9876543210#@&*<>[]%';
    for (let x = 16; x < 512; x += 32) {
      for (let y = 20; y < 512; y += 24) {
        const char = glyphs[Math.floor(Math.random() * glyphs.length)];
        ctx.fillText(char, x, y);
      }
    }
  } else if (patternId.includes('flames')) {
    // Hot rod flames
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = color || '#ef4444';
    for (let x = 0; x < 512; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 512);
      ctx.quadraticCurveTo(x + 16, 250, x + 32, 120);
      ctx.quadraticCurveTo(x + 48, 250, x + 64, 512);
      ctx.fill();
    }
    ctx.fillStyle = '#f59e0b';
    for (let x = 10; x < 512; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x + 8, 512);
      ctx.quadraticCurveTo(x + 16, 320, x + 24, 200);
      ctx.quadraticCurveTo(x + 32, 320, x + 40, 512);
      ctx.fill();
    }
  } else if (patternId.includes('stripes')) {
    // Candy Pop vertical stripes
    const stripeW = 32;
    for (let x = 0; x < 512; x += stripeW * 2) {
      ctx.fillStyle = color || '#f472b6';
      ctx.fillRect(x, 0, stripeW, 512);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + stripeW, 0, stripeW, 512);
    }
  } else if (patternId.includes('bubbles')) {
    // Groovy iMac bubbles
    ctx.fillStyle = color || '#00f0ff';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 6;
    for (let x = 48; x < 512; x += 96) {
      for (let y = 48; y < 512; y += 96) {
        ctx.beginPath();
        ctx.arc(x, y, 32, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  } else {
    // Y2K Star wallpaper
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let x = 32; x < 512; x += 64) {
      for (let y = 32; y < 512; y += 64) {
        ctx.beginPath();
        ctx.moveTo(x, y - 8);
        ctx.quadraticCurveTo(x, y, x + 8, y);
        ctx.quadraticCurveTo(x, y, x, y + 8);
        ctx.quadraticCurveTo(x, y, x - 8, y);
        ctx.quadraticCurveTo(x, y, x, y - 8);
        ctx.fill();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.needsUpdate = true;
  return texture;
}
