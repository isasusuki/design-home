import * as THREE from 'three';
import { FurnitureSlot } from '../types/game';

/**
 * Builds high-fidelity procedural 3D furniture models with intrinsic retro textures & materials
 */
export function buildFurniture3D(
  slot: FurnitureSlot,
  isDilapidated: boolean
): THREE.Group {
  const group = new THREE.Group();
  group.name = `furniture_${slot.id}`;

  // If item is dilapidated (un-restored), render a dusty neglected crate with a floating star marker
  if (isDilapidated && slot.category !== 'surface') {
    const ruinedGroup = new THREE.Group();

    // Dilapidated cardboard box / covered dust sheet
    const crateGeo = new THREE.BoxGeometry(1.4, 0.9, 1.1);
    const crateMat = new THREE.MeshStandardMaterial({
      color: 0x5a4a38,
      roughness: 0.9,
      metalness: 0.1,
    });
    const crate = new THREE.Mesh(crateGeo, crateMat);
    crate.position.y = 0.45;
    crate.castShadow = true;
    crate.receiveShadow = true;
    ruinedGroup.add(crate);

    // Dusty sheet folds
    const sheetGeo = new THREE.ConeGeometry(0.9, 0.35, 6);
    const sheetMat = new THREE.MeshStandardMaterial({
      color: 0x8c8275,
      roughness: 0.95,
    });
    const sheet = new THREE.Mesh(sheetGeo, sheetMat);
    sheet.position.y = 1.0;
    sheet.rotation.y = 0.4;
    ruinedGroup.add(sheet);

    // Floating Bouncing Star Badge
    const starGeo = new THREE.OctahedronGeometry(0.3, 0);
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xffe600,
      emissive: 0xffaa00,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
    });
    const star = new THREE.Mesh(starGeo, starMat);
    star.position.y = 1.8;
    star.name = 'floating_star';
    ruinedGroup.add(star);

    const starLight = new THREE.PointLight(0xffe600, 1.2, 3);
    starLight.position.y = 1.8;
    ruinedGroup.add(starLight);

    group.add(ruinedGroup);
    return group;
  }

  // Base materials customized by user's chosen color
  const userColor = new THREE.Color(slot.selectedColor);

  const mainColorMat = new THREE.MeshStandardMaterial({
    color: userColor,
    roughness: 0.35,
    metalness: 0.15,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.95,
    roughness: 0.1,
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.85,
    roughness: 0.2,
  });

  const inflatableMat = new THREE.MeshPhysicalMaterial({
    color: userColor,
    roughness: 0.1,
    transmission: 0.65,
    opacity: 0.9,
    transparent: true,
    ior: 1.45,
    thickness: 0.5,
  });

  const optionId = slot.selectedOptionId;

  // ROUTE BY SLOT ID OR CATEGORY
  if (slot.id === 'bed') {
    buildBed(group, optionId, mainColorMat, chromeMat, goldMat, userColor);
  } else if (slot.id.includes('sofa') || slot.id === 'seating') {
    buildSeating(group, optionId, mainColorMat, inflatableMat, chromeMat, userColor);
  } else if (slot.id === 'tv_station' || slot.id === 'electronics' || slot.id === 'desk') {
    buildTVAndElectronics(group, optionId, mainColorMat, chromeMat, userColor);
  } else if (slot.id === 'vanity_desk') {
    buildVanity(group, mainColorMat, chromeMat, userColor);
  } else if (slot.id === 'table') {
    buildCoffeeTable(group, optionId, mainColorMat, inflatableMat, chromeMat);
  } else if (slot.id === 'rug' || slot.id === 'ddr_mat') {
    buildRug(group, optionId, mainColorMat, userColor);
  } else if (slot.id === 'lighting') {
    buildLighting(group, optionId, chromeMat, userColor);
  } else if (slot.id === 'mirror') {
    buildMirror(group, optionId, mainColorMat, userColor);
  } else if (slot.id === 'shelf' || slot.id === 'cd_rack') {
    buildShelfAndCDs(group, optionId, mainColorMat, chromeMat, userColor);
  } else if (slot.id === 'curtain') {
    buildBeadCurtain(group, mainColorMat, chromeMat, userColor);
  } else if (slot.id === 'posters') {
    buildPosters(group, mainColorMat, userColor, slot.selectedSticker);
  } else if (slot.id === 'boombox') {
    buildBoombox(group, mainColorMat, chromeMat, userColor);
  } else if (slot.id === 'phone') {
    buildPhone(group, inflatableMat, chromeMat, userColor);
  } else if (slot.id === 'arcade') {
    buildArcade(group, mainColorMat, chromeMat, userColor);
  }

  // Attach sticker emblem if present
  if (slot.selectedSticker && slot.category !== 'surface') {
    const stickerMesh = createStickerSprite(slot.selectedSticker);
    stickerMesh.position.set(0, 1.2, 0.4);
    group.add(stickerMesh);
  }

  return group;
}

// 1. BED BUILDER
function buildBed(
  group: THREE.Group,
  optionId: string,
  mainColorMat: THREE.Material,
  chromeMat: THREE.Material,
  goldMat: THREE.Material,
  color: THREE.Color
) {
  // Base frame
  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.3, 3.1), mainColorMat);
  frame.position.y = 0.2;
  frame.castShadow = true;
  frame.receiveShadow = true;
  group.add(frame);

  // Mattress with quilt
  const quiltMat = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.6,
  });
  const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.45, 2.9), quiltMat);
  mattress.position.y = 0.55;
  mattress.castShadow = true;
  mattress.receiveShadow = true;
  group.add(mattress);

  // Two Fluffy Pillows
  const pillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
  const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.22, 0.45), pillowMat);
  p1.position.set(-0.55, 0.85, -1.0);
  p1.rotation.x = 0.2;
  group.add(p1);

  const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.22, 0.45), pillowMat);
  p2.position.set(0.55, 0.85, -1.0);
  p2.rotation.x = 0.2;
  group.add(p2);

  if (optionId === 'canopy') {
    // Canopy 4 Gold/Chrome posts
    const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.5, 16);
    const postPositions = [
      [-1.1, -1.5],
      [1.1, -1.5],
      [-1.1, 1.5],
      [1.1, 1.5],
    ];
    postPositions.forEach(([px, pz]) => {
      const post = new THREE.Mesh(postGeo, goldMat);
      post.position.set(px, 1.25, pz);
      post.castShadow = true;
      group.add(post);
    });

    // Top rails
    const railX = new THREE.Mesh(new THREE.BoxGeometry(2.28, 0.05, 0.05), goldMat);
    railX.position.set(0, 2.5, 1.5);
    group.add(railX);

    const railBack = new THREE.Mesh(new THREE.BoxGeometry(2.28, 0.05, 0.05), goldMat);
    railBack.position.set(0, 2.5, -1.5);
    group.add(railBack);

    // Sheer Tulle Fabric Drape
    const drapeMat = new THREE.MeshStandardMaterial({
      color: 0xffb3de,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
    const canopyRoof = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 3.0), drapeMat);
    canopyRoof.position.set(0, 2.48, 0);
    canopyRoof.rotation.x = Math.PI / 2;
    group.add(canopyRoof);
  } else if (optionId === 'heart') {
    // Curved Heart Headboard
    const headboard = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.15, 32, 1, false, 0, Math.PI), mainColorMat);
    headboard.rotation.z = -Math.PI / 2;
    headboard.position.set(0, 1.5, -1.5);
    group.add(headboard);

    // Heart cushion throw
    const heartCushion = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), mainColorMat);
    heartCushion.scale.set(1.2, 0.6, 1);
    heartCushion.position.set(0, 0.85, -0.6);
    group.add(heartCushion);
  } else {
    // Futuristic cyber futon with glowing neon under-bed
    const neonMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const neonTube = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 16), neonMat);
    neonTube.rotation.x = Math.PI / 2;
    neonTube.position.set(0, 0.06, 0);
    group.add(neonTube);

    const neonLight = new THREE.PointLight(0x00f0ff, 1.5, 3.5);
    neonLight.position.set(0, 0.15, 0);
    group.add(neonLight);
  }
}

// 2. SEATING BUILDER
function buildSeating(
  group: THREE.Group,
  optionId: string,
  mainColorMat: THREE.Material,
  inflatableMat: THREE.Material,
  chromeMat: THREE.Material,
  color: THREE.Color
) {
  if (optionId.includes('inflatable')) {
    // Translucent PVC Inflatable Couch/Armchair
    const baseTorus = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.32, 16, 32), inflatableMat);
    baseTorus.rotation.x = Math.PI / 2;
    baseTorus.position.y = 0.32;
    baseTorus.castShadow = true;
    group.add(baseTorus);

    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.22, 24), inflatableMat);
    seat.position.y = 0.32;
    group.add(seat);

    const backTorus = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.28, 16, 24, Math.PI), inflatableMat);
    backTorus.position.set(0, 0.78, -0.28);
    backTorus.rotation.z = Math.PI;
    group.add(backTorus);
  } else if (optionId.includes('lip')) {
    // Pop Art Lips Couch
    const lipBase = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 1.5, 16, 16), mainColorMat);
    lipBase.rotation.z = Math.PI / 2;
    lipBase.position.set(0, 0.38, 0);
    lipBase.scale.set(1.2, 0.8, 1.0);
    lipBase.castShadow = true;
    group.add(lipBase);

    const topLipL = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), mainColorMat);
    topLipL.position.set(-0.42, 0.8, -0.15);
    topLipL.scale.set(1.2, 0.8, 0.8);
    group.add(topLipL);

    const topLipR = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), mainColorMat);
    topLipR.position.set(0.42, 0.8, -0.15);
    topLipR.scale.set(1.2, 0.8, 0.8);
    group.add(topLipR);
  } else {
    // Plush Round Beanbag / Metallic Puff
    const beanbag = new THREE.Mesh(new THREE.SphereGeometry(0.75, 24, 24), mainColorMat);
    beanbag.scale.set(1.2, 0.85, 1.1);
    beanbag.position.y = 0.55;
    beanbag.castShadow = true;
    group.add(beanbag);
  }
}

// 3. TV & ELECTRONICS BUILDER
function buildTVAndElectronics(
  group: THREE.Group,
  optionId: string,
  mainColorMat: THREE.Material,
  chromeMat: THREE.Material,
  color: THREE.Color
) {
  // Console Stand Table
  const standTop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.95), chromeMat);
  standTop.position.y = 0.7;
  standTop.castShadow = true;
  group.add(standTop);

  const legs = [
    [-0.7, -0.38],
    [0.7, -0.38],
    [-0.7, 0.38],
    [0.7, 0.38],
  ];
  legs.forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 12), chromeMat);
    leg.position.set(lx, 0.35, lz);
    group.add(leg);
  });

  if (optionId.includes('imac')) {
    // iMac G3 all-in-one teardrop casing
    const macBody = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 24), mainColorMat);
    macBody.scale.set(1.0, 0.95, 1.25);
    macBody.position.set(0, 1.2, 0);
    macBody.castShadow = true;
    group.add(macBody);

    // Screen with nostalgic MSN window
    const screenGeo = new THREE.PlaneGeometry(0.52, 0.4);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 192;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#008080';
      ctx.fillRect(0, 0, 256, 192);
      ctx.fillStyle = '#ff007f';
      ctx.fillRect(20, 20, 120, 40);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('MSN // Y2K', 30, 45);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.fillText('Online (3)', 30, 80);
      ctx.fillText('♪ Britney Spears', 30, 105);
    }
    const screenTex = new THREE.CanvasTexture(canvas);
    const screen = new THREE.Mesh(screenGeo, new THREE.MeshBasicMaterial({ map: screenTex }));
    screen.position.set(0, 1.2, 0.44);
    group.add(screen);

    // Keyboard & Puck Mouse
    const kb = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.03, 0.2), mainColorMat);
    kb.position.set(0, 0.75, 0.32);
    group.add(kb);

    const mouse = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 16), mainColorMat);
    mouse.position.set(0.4, 0.75, 0.32);
    group.add(mouse);
  } else {
    // Classic 14" or 29" CRT TV Box
    const tvBox = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.65, 0.65), mainColorMat);
    tvBox.position.set(0, 1.05, 0);
    tvBox.castShadow = true;
    group.add(tvBox);

    // CRT Screen with scanline glow
    const crtScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.48), new THREE.MeshBasicMaterial({ color: 0x22d3ee }));
    crtScreen.position.set(0, 1.05, 0.33);
    group.add(crtScreen);

    // Rabbit ear antennas
    const ant1 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.55, 8), chromeMat);
    ant1.rotation.z = -0.35;
    ant1.position.set(-0.15, 1.55, -0.1);
    group.add(ant1);

    const ant2 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.55, 8), chromeMat);
    ant2.rotation.z = 0.35;
    ant2.position.set(0.15, 1.55, -0.1);
    group.add(ant2);

    // Videogame console on shelf with game cartridge
    const consoleBox = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.08, 0.32), chromeMat);
    consoleBox.position.set(0, 0.75, 0.2);
    group.add(consoleBox);

    const cart = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.12), mainColorMat);
    cart.position.set(0, 0.81, 0.2);
    group.add(cart);
  }
}

// 4. VANITY & DRESSING TABLE
function buildVanity(group: THREE.Group, mainColorMat: THREE.Material, chromeMat: THREE.Material, color: THREE.Color) {
  // Table top
  const desk = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.7), mainColorMat);
  desk.position.y = 0.75;
  desk.castShadow = true;
  group.add(desk);

  // 4 Legs
  const legs = [[-0.6, -0.28], [0.6, -0.28], [-0.6, 0.28], [0.6, 0.28]];
  legs.forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.75, 12), chromeMat);
    leg.position.set(lx, 0.375, lz);
    group.add(leg);
  });

  // Mirror frame with lightbulbs
  const mirrorFrame = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.04, 16, 32), mainColorMat);
  mirrorFrame.position.set(0, 1.35, -0.25);
  group.add(mirrorFrame);

  const mirrorGlass = new THREE.Mesh(new THREE.CircleGeometry(0.45, 32), new THREE.MeshStandardMaterial({ color: 0xe0e7ff, roughness: 0.1, metalness: 0.9 }));
  mirrorGlass.position.set(0, 1.35, -0.24);
  group.add(mirrorGlass);

  // Bulbs around mirror
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfff5cc });
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), bulbMat);
    bulb.position.set(Math.cos(a) * 0.45, 1.35 + Math.sin(a) * 0.45, -0.22);
    group.add(bulb);
  }

  // Cosmetics & lipsticks on desk
  const lipstickMat = new THREE.MeshStandardMaterial({ color: 0xff007f });
  const lip = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.08, 12), lipstickMat);
  lip.position.set(-0.35, 0.83, 0.1);
  group.add(lip);

  const perfume = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.09, 0.06), new THREE.MeshPhysicalMaterial({ color: 0xffb3de, transmission: 0.8, transparent: true }));
  perfume.position.set(-0.45, 0.84, 0.12);
  group.add(perfume);
}

// 5. COFFEE TABLE
function buildCoffeeTable(group: THREE.Group, optionId: string, mainColorMat: THREE.Material, inflatableMat: THREE.Material, chromeMat: THREE.Material) {
  const table = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.06, 0.8), inflatableMat);
  table.position.y = 0.38;
  table.castShadow = true;
  group.add(table);

  const legs = [[-0.55, -0.3], [0.55, -0.3], [-0.55, 0.3], [0.55, 0.3]];
  legs.forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.38, 12), chromeMat);
    leg.position.set(lx, 0.19, lz);
    group.add(leg);
  });

  // Magazines on table
  const magMat = new THREE.MeshStandardMaterial({ color: 0xff007f });
  const mag = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.015, 0.38), magMat);
  mag.position.set(0.15, 0.42, 0);
  mag.rotation.y = 0.2;
  group.add(mag);
}

// 6. RUG & DDR MAT
function buildRug(group: THREE.Group, optionId: string, mainColorMat: THREE.Material, color: THREE.Color) {
  if (optionId.includes('ddr')) {
    // Dance Dance Revolution Pad with 4 glowing arrows
    const pad = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.02, 1.6), new THREE.MeshStandardMaterial({ color: 0x111827 }));
    pad.position.y = 0.01;
    group.add(pad);

    const arrowMatPink = new THREE.MeshBasicMaterial({ color: 0xff007f });
    const arrowMatCyan = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

    // Up Arrow
    const upArrow = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.025, 0.35), arrowMatPink);
    upArrow.position.set(0, 0.015, -0.5);
    group.add(upArrow);

    // Down Arrow
    const downArrow = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.025, 0.35), arrowMatCyan);
    downArrow.position.set(0, 0.015, 0.5);
    group.add(downArrow);

    // Left Arrow
    const leftArrow = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.025, 0.35), arrowMatPink);
    leftArrow.position.set(-0.5, 0.015, 0);
    group.add(leftArrow);

    // Right Arrow
    const rightArrow = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.025, 0.35), arrowMatCyan);
    rightArrow.position.set(0.5, 0.015, 0);
    group.add(rightArrow);
  } else if (optionId.includes('daisy')) {
    // Daisy Flower Rug
    const rugGroup = new THREE.Group();
    const petalGeo = new THREE.CircleGeometry(0.45, 24);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const petal = new THREE.Mesh(petalGeo, new THREE.MeshStandardMaterial({ color: 0xffffff }));
      petal.rotation.x = -Math.PI / 2;
      petal.position.set(Math.cos(a) * 0.65, 0.01, Math.sin(a) * 0.65);
      rugGroup.add(petal);
    }
    const core = new THREE.Mesh(new THREE.CircleGeometry(0.5, 32), new THREE.MeshStandardMaterial({ color: 0xffe600 }));
    core.rotation.x = -Math.PI / 2;
    core.position.y = 0.015;
    rugGroup.add(core);

    rugGroup.scale.set(1.4, 1, 1.4);
    group.add(rugGroup);
  } else {
    // Star Rug
    const starShape = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 1.5 : 0.7;
      const a = (i * Math.PI) / 5;
      const x = Math.sin(a) * r;
      const y = Math.cos(a) * r;
      if (i === 0) starShape.moveTo(x, y);
      else starShape.lineTo(x, y);
    }
    const starRug = new THREE.Mesh(new THREE.ShapeGeometry(starShape), mainColorMat);
    starRug.rotation.x = -Math.PI / 2;
    starRug.position.y = 0.01;
    group.add(starRug);
  }
}

// 7. LIGHTING & LAVA LAMP
function buildLighting(group: THREE.Group, optionId: string, chromeMat: THREE.Material, color: THREE.Color) {
  // Base cone
  const base = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.35, 24), chromeMat);
  base.position.y = 0.175;
  group.add(base);

  // Glass cylinder
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.9,
    transparent: true,
    roughness: 0.1,
  });
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.65, 24), glassMat);
  glass.position.y = 0.65;
  group.add(glass);

  // Floating wax blobs in chosen color
  const blobMat = new THREE.MeshBasicMaterial({ color: color });
  const blob1 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), blobMat);
  blob1.position.set(0, 0.5, 0);
  blob1.scale.set(1, 1.3, 1);
  group.add(blob1);

  const blob2 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), blobMat);
  blob2.position.set(0.03, 0.8, 0);
  group.add(blob2);

  // Top Cap
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.22, 24), chromeMat);
  cap.position.y = 1.05;
  group.add(cap);

  // Warm light emission
  const light = new THREE.PointLight(color, 2.5, 4.5);
  light.position.set(0, 0.65, 0);
  group.add(light);
}

// 8. MIRROR (Wavy Full-length)
function buildMirror(group: THREE.Group, optionId: string, mainColorMat: THREE.Material, color: THREE.Color) {
  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.85, 2.2, 0.1), mainColorMat);
  frame.position.y = 1.1;
  frame.castShadow = true;
  group.add(frame);

  const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 2.0), new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.1, metalness: 0.95 }));
  glass.position.set(0, 1.1, 0.055);
  group.add(glass);
}

// 9. SHELF & ROTATING CD TOWER
function buildShelfAndCDs(group: THREE.Group, optionId: string, mainColorMat: THREE.Material, chromeMat: THREE.Material, color: THREE.Color) {
  if (optionId.includes('cd_tower')) {
    // Rotating CD Tower
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 16), chromeMat);
    pole.position.y = 1.1;
    group.add(pole);

    // 6 shelves with CD jewel cases
    for (let i = 0; i < 6; i++) {
      const discShelf = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.03, 24), mainColorMat);
      discShelf.position.y = 0.3 + i * 0.32;
      group.add(discShelf);

      // Jewel cases
      const caseMat = new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0x00f0ff : 0xff007f });
      const jewelCase = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.02), caseMat);
      jewelCase.position.set(0.12, 0.4 + i * 0.32, 0.12);
      group.add(jewelCase);
    }
  } else {
    // Wall shelf with stuffed animal
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.35), mainColorMat);
    board.position.y = 0.03;
    group.add(board);

    // Stuffed Teddy Bear
    const teddyMat = new THREE.MeshStandardMaterial({ color: 0xffb3de, roughness: 0.8 });
    const teddy = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), teddyMat);
    teddy.position.set(-0.35, 0.2, 0);
    group.add(teddy);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), teddyMat);
    head.position.set(-0.35, 0.42, 0);
    group.add(head);

    // Diary book with padlock
    const diary = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.28), new THREE.MeshStandardMaterial({ color: 0x9333ea }));
    diary.position.set(0.3, 0.08, 0);
    group.add(diary);
  }
}

// 10. BEAD CURTAIN
function buildBeadCurtain(group: THREE.Group, mainColorMat: THREE.Material, chromeMat: THREE.Material, color: THREE.Color) {
  const topRod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8, 12), chromeMat);
  topRod.rotation.z = Math.PI / 2;
  topRod.position.y = 2.4;
  group.add(topRod);

  for (let x = -0.8; x <= 0.8; x += 0.18) {
    for (let y = 0.5; y <= 2.3; y += 0.22) {
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), mainColorMat);
      bead.position.set(x, y, 0);
      group.add(bead);
    }
  }
}

// 11. POSTERS
function buildPosters(group: THREE.Group, mainColorMat: THREE.Material, color: THREE.Color, sticker?: string | null) {
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.1, 0.04), mainColorMat);
  frame.position.y = 0.55;
  frame.castShadow = true;
  group.add(frame);

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ff1493';
    ctx.fillRect(0, 0, 512, 360);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText('POP STAR 2000', 40, 80);
    ctx.fillStyle = '#ffe600';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText('★ CAPRICHO ★', 40, 180);
    if (sticker) {
      ctx.font = '100px sans-serif';
      ctx.fillText(sticker, 340, 300);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(1.42, 1.02), new THREE.MeshBasicMaterial({ map: tex }));
  poster.position.set(0, 0.55, 0.025);
  group.add(poster);
}

// 12. BOOMBOX
function buildBoombox(group: THREE.Group, mainColorMat: THREE.Material, chromeMat: THREE.Material, color: THREE.Color) {
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.44, 0.35), mainColorMat);
  body.position.y = 0.22;
  body.castShadow = true;
  group.add(body);

  // Chrome speakers
  const spk1 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 24), chromeMat);
  spk1.rotation.x = Math.PI / 2;
  spk1.position.set(-0.32, 0.22, 0.18);
  group.add(spk1);

  const spk2 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 24), chromeMat);
  spk2.rotation.x = Math.PI / 2;
  spk2.position.set(0.32, 0.22, 0.18);
  group.add(spk2);

  // Top handle
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.025, 12, 24, Math.PI), chromeMat);
  handle.position.set(0, 0.46, 0);
  group.add(handle);
}

// 13. NEON PHONE
function buildPhone(group: THREE.Group, inflatableMat: THREE.Material, chromeMat: THREE.Material, color: THREE.Color) {
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.45), inflatableMat);
  base.position.y = 0.04;
  group.add(base);

  const handset = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.5), inflatableMat);
  handset.position.set(0, 0.12, 0);
  group.add(handset);

  // Neon internal glowing tube
  const neon = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3, 8), new THREE.MeshBasicMaterial({ color: color }));
  neon.position.set(0, 0.04, 0);
  group.add(neon);
}

// 14. ARCADE BARTOP
function buildArcade(group: THREE.Group, mainColorMat: THREE.Material, chromeMat: THREE.Material, color: THREE.Color) {
  const cabinet = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.4, 0.8), mainColorMat);
  cabinet.position.y = 0.7;
  cabinet.castShadow = true;
  group.add(cabinet);

  // Slanted Screen
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.45), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
  screen.rotation.x = -0.3;
  screen.position.set(0, 0.95, 0.32);
  group.add(screen);

  // Joysticks & buttons
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.12, 8), chromeMat);
  stick.position.set(-0.15, 0.66, 0.35);
  group.add(stick);

  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
  ball.position.set(-0.15, 0.73, 0.35);
  group.add(ball);

  // Buttons
  const btn1 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 12), new THREE.MeshBasicMaterial({ color: 0x39ff14 }));
  btn1.position.set(0.15, 0.65, 0.35);
  group.add(btn1);

  const btn2 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 12), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
  btn2.position.set(0.24, 0.65, 0.35);
  group.add(btn2);
}

// Helper: 3D Text / Emoji Sticker Sprite
function createStickerSprite(symbol: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.font = '80px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, 64, 64);
  }
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(0.4, 0.4, 0.4);
  return sprite;
}
