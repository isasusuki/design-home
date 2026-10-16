import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomData, FurnitureSlot, UserInventory } from '../types/game';
import { buildFurniture3D } from '../utils/furniture3dModels';
import { createFloorTexture, createWallTexture } from '../utils/textureGenerator';
import { retroAudio } from '../utils/audio';

interface Room3DViewProps {
  room: RoomData;
  inventory: UserInventory;
  selectedSlot: FurnitureSlot | null;
  onSelectSlot: (slot: FurnitureSlot) => void;
  onOpenPuzzle: () => void;
  onOpenPhotoStudio: (screenshotDataUrl?: string) => void;
  viewMode: 'after' | 'before';
  onToggleViewMode: () => void;
}

export const Room3DView: React.FC<Room3DViewProps> = ({
  room,
  inventory,
  selectedSlot,
  onSelectSlot,
  onOpenPuzzle,
  onOpenPhotoStudio,
  viewMode,
  onToggleViewMode,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const furnitureMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const floorMeshRef = useRef<THREE.Mesh | null>(null);
  const wallMeshesRef = useRef<THREE.Mesh[]>([]);
  const floatingStarsRef = useRef<THREE.Object3D[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const [showScanlines, setShowScanlines] = useState(false);
  const [hoveredSlotId, setHoveredSlotId] = useState<string | null>(null);

  const restoredCount = room.slots.filter((s) => s.isRestored).length;
  const totalSlots = room.slots.length;
  const progressPercent = Math.round((restoredCount / totalSlots) * 100);

  const wallSlot = room.slots.find((s) => s.id === 'wall_surface');
  const floorSlot = room.slots.find((s) => s.id === 'floor_surface');

  // Setup Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0818);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(7.5, 6.5, 7.5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 3.5;
    controls.maxDistance = 16;
    controls.target.set(0, 1.0, 0);
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5e6, 1.4);
    dirLight.position.set(6, 10, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    const rimLight = new THREE.PointLight(
      room.id === 'bedroom' ? 0xff007f : room.id === 'living' ? 0x00f0ff : 0x9d00ff,
      2.5,
      14
    );
    rimLight.position.set(-4, 5, -3);
    scene.add(rimLight);

    // Base Room Architecture (Floor, Walls, Window)
    buildRoomArchitecture(scene);

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Bob floating stars
      floatingStarsRef.current.forEach((star, idx) => {
        star.rotation.y = elapsed * 1.5;
        star.position.y = 1.8 + Math.sin(elapsed * 3 + idx) * 0.15;
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      controls.dispose();
    };
  }, [room.id]);

  // Build Room Architecture (Walls, Windows, Floor)
  const buildRoomArchitecture = (scene: THREE.Scene) => {
    wallMeshesRef.current = [];

    // Floor
    const floorGeo = new THREE.PlaneGeometry(8, 8);
    const floorMat = new THREE.MeshStandardMaterial({
      roughness: 0.35,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    floor.name = 'room_floor';
    scene.add(floor);
    floorMeshRef.current = floor;

    // Back Wall (Z = -4)
    const wallGeo = new THREE.PlaneGeometry(8, 5);
    const wallMat = new THREE.MeshStandardMaterial({
      roughness: 0.7,
    });
    const backWall = new THREE.Mesh(wallGeo, wallMat);
    backWall.position.set(0, 2.5, -4);
    backWall.receiveShadow = true;
    backWall.name = 'room_wall_back';
    scene.add(backWall);
    wallMeshesRef.current.push(backWall);

    // Left Wall (X = -4)
    const leftWall = new THREE.Mesh(wallGeo, wallMat.clone());
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-4, 2.5, 0);
    leftWall.receiveShadow = true;
    leftWall.name = 'room_wall_left';
    scene.add(leftWall);
    wallMeshesRef.current.push(leftWall);

    // Trims
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const trimBack = new THREE.Mesh(new THREE.BoxGeometry(8, 0.15, 0.05), trimMat);
    trimBack.position.set(0, 0.075, -3.98);
    scene.add(trimBack);

    const trimLeft = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.15, 8), trimMat);
    trimLeft.position.set(-3.98, 0.075, 0);
    scene.add(trimLeft);

    // Window with 2000s Sky
    const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.4, 2.0), trimMat);
    windowFrame.position.set(-3.95, 2.6, 0.5);
    scene.add(windowFrame);

    const windowGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 2.3), new THREE.MeshBasicMaterial({ color: 0x93c5fd }));
    windowGlass.rotation.y = Math.PI / 2;
    windowGlass.position.set(-3.92, 2.6, 0.5);
    scene.add(windowGlass);
  };

  // Dynamically update Floor and Wall materials whenever user customizes them!
  useEffect(() => {
    if (floorMeshRef.current && floorSlot) {
      const floorTex = createFloorTexture(floorSlot.selectedOptionId, floorSlot.selectedColor);
      floorMeshRef.current.material = new THREE.MeshStandardMaterial({
        map: floorTex,
        roughness: 0.35,
        metalness: 0.1,
      });
    }

    if (wallMeshesRef.current.length > 0 && wallSlot) {
      const wallTex = createWallTexture(wallSlot.selectedOptionId, wallSlot.selectedColor);
      wallMeshesRef.current.forEach((w) => {
        w.material = new THREE.MeshStandardMaterial({
          map: wallTex,
          roughness: 0.7,
        });
      });
    }
  }, [floorSlot?.selectedOptionId, floorSlot?.selectedColor, wallSlot?.selectedOptionId, wallSlot?.selectedColor]);

  // Rebuild 3D Furniture Whenever Slots or ViewMode Change
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear old furniture
    furnitureMeshesRef.current.forEach((meshGroup) => {
      scene.remove(meshGroup);
    });
    furnitureMeshesRef.current.clear();
    floatingStarsRef.current = [];

    // Rebuild every furniture slot (excluding wall/floor surfaces which are handled directly)
    room.slots.forEach((slot) => {
      if (slot.category === 'surface') return;

      const isDilapidated = viewMode === 'before' || !slot.isRestored;
      const furnitureGroup = buildFurniture3D(slot, isDilapidated);

      // Set 3D Position & Rotation
      furnitureGroup.position.set(
        slot.position3D.x,
        slot.position3D.y,
        slot.position3D.z
      );
      if (slot.position3D.rotationY) {
        furnitureGroup.rotation.y = slot.position3D.rotationY;
      }
      if (slot.position3D.scale) {
        furnitureGroup.scale.setScalar(slot.position3D.scale);
      }

      // Tag for raycasting
      furnitureGroup.userData = { slotId: slot.id, slot };
      furnitureGroup.traverse((child) => {
        child.userData = { slotId: slot.id, slot };
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
        if (child.name === 'floating_star') {
          floatingStarsRef.current.push(child);
        }
      });

      scene.add(furnitureGroup);
      furnitureMeshesRef.current.set(slot.id, furnitureGroup);
    });
  }, [room.slots, viewMode]);

  // Click & Hover Interaction via Raycasting
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    const camera = cameraRef.current;
    const scene = sceneRef.current;
    if (!container || !camera || !scene) return;

    const rect = container.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

    // Objects to test: Furniture meshes + Floor + Walls
    const objectsToTest: THREE.Object3D[] = [];
    furnitureMeshesRef.current.forEach((group) => {
      objectsToTest.push(...group.children);
    });
    if (floorMeshRef.current) objectsToTest.push(floorMeshRef.current);
    wallMeshesRef.current.forEach((w) => objectsToTest.push(w));

    const intersects = raycaster.intersectObjects(objectsToTest, true);

    if (intersects.length > 0) {
      const topObj = intersects[0].object;

      // Clicked on Floor?
      if (topObj.name === 'room_floor' && floorSlot) {
        retroAudio.playClick();
        onSelectSlot(floorSlot);
        return;
      }

      // Clicked on Wall?
      if ((topObj.name === 'room_wall_back' || topObj.name === 'room_wall_left') && wallSlot) {
        retroAudio.playClick();
        onSelectSlot(wallSlot);
        return;
      }

      // Find parent with slot
      let hitObj: THREE.Object3D | null = topObj;
      while (hitObj && !hitObj.userData?.slot) {
        hitObj = hitObj.parent;
      }
      if (hitObj && hitObj.userData?.slot) {
        const clickedSlot: FurnitureSlot = hitObj.userData.slot;
        retroAudio.playClick();
        onSelectSlot(clickedSlot);

        if (controlsRef.current) {
          controlsRef.current.target.set(
            clickedSlot.position3D.x,
            clickedSlot.position3D.y + 0.8,
            clickedSlot.position3D.z
          );
        }
      }
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    const camera = cameraRef.current;
    if (!container || !camera) return;

    const rect = container.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

    const objectsToTest: THREE.Object3D[] = [];
    furnitureMeshesRef.current.forEach((group) => {
      objectsToTest.push(...group.children);
    });
    if (floorMeshRef.current) objectsToTest.push(floorMeshRef.current);
    wallMeshesRef.current.forEach((w) => objectsToTest.push(w));

    const intersects = raycaster.intersectObjects(objectsToTest, true);

    if (intersects.length > 0) {
      const topObj = intersects[0].object;
      if (topObj.name === 'room_floor' || topObj.name?.includes('room_wall')) {
        setHoveredSlotId(topObj.name);
        container.style.cursor = 'pointer';
        return;
      }

      let hitObj: THREE.Object3D | null = topObj;
      while (hitObj && !hitObj.userData?.slot) {
        hitObj = hitObj.parent;
      }
      if (hitObj && hitObj.userData?.slot) {
        setHoveredSlotId(hitObj.userData.slot.name);
        container.style.cursor = 'pointer';
        return;
      }
    }
    setHoveredSlotId(null);
    container.style.cursor = 'grab';
  };

  // Camera Presets
  const setCameraPreset = (preset: 'overview' | 'bed' | 'electronics' | 'close') => {
    retroAudio.playClick();
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    if (preset === 'overview') {
      camera.position.set(7.5, 6.5, 7.5);
      controls.target.set(0, 1.0, 0);
    } else if (preset === 'bed') {
      camera.position.set(-0.5, 3.5, 3.2);
      controls.target.set(-1.6, 0.8, -1.0);
    } else if (preset === 'electronics') {
      camera.position.set(1.5, 2.8, 2.5);
      controls.target.set(2.2, 1.1, -1.0);
    } else if (preset === 'close') {
      camera.position.set(3.8, 3.2, 3.8);
      controls.target.set(0, 0.8, 0);
    }
  };

  // Take 3D Screenshot for Photo Studio
  const handlePhotoStudioClick = useCallback(() => {
    retroAudio.playCamera();
    const renderer = rendererRef.current;
    let dataUrl: string | undefined = undefined;
    if (renderer) {
      dataUrl = renderer.domElement.toDataURL('image/png');
    }
    onOpenPhotoStudio(dataUrl);
  }, [onOpenPhotoStudio]);

  return (
    <div className="relative w-full flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
      {/* 3D Room Controls Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-3 px-2 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900/80 border border-pink-400/40 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg">
            <span className="text-sm font-bold text-pink-300 font-display">
              {room.name}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-semibold text-emerald-400 tabular-nums">
              {progressPercent}% 3D Mobiliado ({restoredCount}/{totalSlots})
            </span>
          </div>

          {/* Quick shortcuts for Wall & Floor */}
          {wallSlot && (
            <button
              onClick={() => onSelectSlot(wallSlot)}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-pink-950/60 border border-pink-400/50 hover:bg-pink-900 text-pink-300 transition-colors cursor-pointer flex items-center gap-1 shadow"
              title="Personalizar Papel de Parede"
            >
              <span>🎨</span>
              <span className="hidden sm:inline">Parede</span>
            </button>
          )}

          {floorSlot && (
            <button
              onClick={() => onSelectSlot(floorSlot)}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-cyan-950/60 border border-cyan-400/50 hover:bg-cyan-900 text-cyan-300 transition-colors cursor-pointer flex items-center gap-1 shadow"
              title="Personalizar Revestimento do Piso"
            >
              <span>🪵</span>
              <span className="hidden sm:inline">Piso</span>
            </button>
          )}
        </div>

        {/* Toggles & Camera Controls */}
        <div className="flex items-center gap-2">
          {/* Before/After Toggle */}
          <button
            onClick={() => {
              retroAudio.playClick();
              onToggleViewMode();
            }}
            className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
              viewMode === 'before'
                ? 'bg-amber-600 border-amber-300 text-white shadow'
                : 'bg-slate-900/80 border-white/20 text-slate-300 hover:text-white'
            }`}
          >
            {viewMode === 'before' ? '👀 3D: Antes' : '✨ 3D: Decorado'}
          </button>

          {/* CRT Filter */}
          <button
            onClick={() => {
              retroAudio.playClick();
              setShowScanlines((s) => !s);
            }}
            className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
              showScanlines
                ? 'bg-cyan-600 border-cyan-300 text-white shadow'
                : 'bg-slate-900/80 border-white/20 text-slate-300 hover:text-white'
            }`}
            title="Efeito Monitor CRT Anos 2000"
          >
            📺 CRT {showScanlines ? 'ON' : 'OFF'}
          </button>

          {/* Photo Studio Button */}
          <button
            onClick={handlePhotoStudioClick}
            className="y2k-btn-cyan px-3 py-1 rounded-lg text-xs font-bold tracking-wide flex items-center gap-1 cursor-pointer"
            title="Tirar foto 3D para capa de revista Y2K"
          >
            <span>📸</span>
            <span className="hidden sm:inline">Foto 3D Revista</span>
          </button>
        </div>
      </div>

      {/* Main 3D Viewport Box */}
      <div className="relative w-full max-w-5xl aspect-16/9 rounded-2xl overflow-hidden border-4 border-pink-400 shadow-2xl bg-black select-none">
        {/* Three.js Canvas Mount */}
        <div
          ref={mountRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          className="w-full h-full"
        />

        {/* CRT Scanline Filter Overlay */}
        {showScanlines && (
          <div className="absolute inset-0 crt-overlay z-10 pointer-events-none" />
        )}

        {/* 3D Camera Angles Floating Bar */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-black/70 backdrop-blur-md p-1.5 rounded-xl border border-white/20 shadow-xl">
          <span className="text-[10px] text-pink-300 font-bold px-1.5 hidden sm:inline">
            Câmera 3D:
          </span>
          <button
            onClick={() => setCameraPreset('overview')}
            className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer"
            title="Visão Geral Isométrica"
          >
            Geral
          </button>
          <button
            onClick={() => setCameraPreset('bed')}
            className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer"
            title="Foco Cama/Sofá"
          >
            Cama/Sofá
          </button>
          <button
            onClick={() => setCameraPreset('electronics')}
            className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer"
            title="Foco TV/Som"
          >
            TV/Som
          </button>
        </div>

        {/* Floating Hover Indicator */}
        {hoveredSlotId && (
          <div className="absolute top-3 left-3 z-20 bg-pink-950/90 border border-pink-400 px-3 py-1.5 rounded-xl text-white font-display text-xs flex items-center gap-2 shadow-2xl animate-fade-in pointer-events-none">
            <span>✨</span>
            <span>Clique para personalizar: {hoveredSlotId === 'room_floor' ? 'Piso' : hoveredSlotId?.includes('wall') ? 'Parede' : hoveredSlotId}</span>
          </div>
        )}

        {/* 3D Orbit Helper Hint */}
        <div className="absolute bottom-3 right-3 z-20 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] text-slate-300 border border-white/10 pointer-events-none">
          🖱️ Arraste para girar em 360° · Scroll para zoom
        </div>

        {/* Before Mode Banner */}
        {viewMode === 'before' && (
          <div className="absolute top-3 left-3 z-20 bg-amber-900/90 border-2 border-amber-400 px-3 py-1.5 rounded-xl text-amber-200 font-display text-xs flex items-center gap-2 shadow-lg">
            <span>🏚️</span>
            <span>ESTADO ORIGINAL 3D: Móveis e paredes precisando de reforma!</span>
          </div>
        )}

        {/* Quick Puzzle CTA when stars needed */}
        {restoredCount < totalSlots && inventory.stars < 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-slate-950/90 backdrop-blur-md border-2 border-pink-400 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-2xl animate-fade-in">
            <span className="text-2xl animate-spin">💿</span>
            <div className="text-left">
              <div className="text-xs font-bold text-pink-300">
                Ganhe Estrelas para mobiliar o cômodo!
              </div>
              <div className="text-[11px] text-slate-300">
                Colete os símbolos do objetivo no puzzle para ganhar estrelas!
              </div>
            </div>
            <button
              onClick={() => {
                retroAudio.playClick();
                onOpenPuzzle();
              }}
              className="y2k-btn-primary px-3 py-1 rounded-lg text-xs font-display tracking-wider cursor-pointer"
            >
              JOGAR AGORA 🎮
            </button>
          </div>
        )}
      </div>

      {/* Room Theme Subtitle */}
      <p className="text-xs text-slate-400 mt-2 max-w-2xl text-center italic">
        "{room.themeDescription}"
      </p>
    </div>
  );
};
