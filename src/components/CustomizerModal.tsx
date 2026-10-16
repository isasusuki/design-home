import React, { useState } from 'react';
import { FurnitureSlot, RoomData, UserInventory } from '../types/game';
import { RETRO_PALETTE, RETRO_STICKERS } from '../data/textures';
import { WALLPAPER_TEXTURES, FLOORING_TEXTURES, WallpaperTexture, FlooringTexture } from '../data/environmentTextures';
import { retroAudio } from '../utils/audio';

interface CustomizerModalProps {
  slot: FurnitureSlot;
  room?: RoomData;
  inventory: UserInventory;
  onClose: () => void;
  onRestore: (slotId: string) => void;
  onUpdateConfig: (slotId: string, updates: Partial<FurnitureSlot>) => void;
  onUnlockColor?: (colorHex: string, cost: number) => void;
  initialMode?: 'furniture' | 'environment';
}

export const CustomizerModal: React.FC<CustomizerModalProps> = ({
  slot,
  room,
  inventory,
  onClose,
  onRestore,
  onUpdateConfig,
  initialMode,
}) => {
  // Determine if this is an environment surface or regular furniture
  const isSurfaceSlot = slot.category === 'surface';
  const [activeMode, setActiveMode] = useState<'furniture' | 'environment'>(
    initialMode === 'environment' || isSurfaceSlot ? 'environment' : 'furniture'
  );

  // Furniture tab state
  const [activeFurnitureTab, setActiveFurnitureTab] = useState<'model' | 'color' | 'sticker'>('model');
  const [selectedOptionId, setSelectedOptionId] = useState(slot.selectedOptionId);
  const [selectedColor, setSelectedColor] = useState(slot.selectedColor);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(slot.selectedSticker);

  // Environment (Wall & Floor) state
  const wallSlot = room?.slots.find((s) => s.id === 'wall_surface') || (slot.id === 'wall_surface' ? slot : undefined);
  const floorSlot = room?.slots.find((s) => s.id === 'floor_surface') || (slot.id === 'floor_surface' ? slot : undefined);

  const [activeEnvTab, setActiveEnvTab] = useState<'wallpaper' | 'flooring' | 'overview'>('wallpaper');
  const [selectedWallpaperId, setSelectedWallpaperId] = useState(
    wallSlot?.selectedOptionId || 'stars_wallpaper'
  );
  const [selectedWallpaperColor, setSelectedWallpaperColor] = useState(
    wallSlot?.selectedColor || '#ff66b2'
  );
  const [selectedFlooringId, setSelectedFlooringId] = useState(
    floorSlot?.selectedOptionId || 'parquet_floor'
  );
  const [selectedFlooringColor, setSelectedFlooringColor] = useState(
    floorSlot?.selectedColor || '#e8b88a'
  );

  const canRestore = inventory.stars >= slot.restoreCostStars && inventory.coins >= slot.restoreCostCoins;
  const currentOption = slot.options.find((o) => o.id === selectedOptionId) || slot.options[0];

  const currentWallpaper =
    WALLPAPER_TEXTURES.find((w) => w.id === selectedWallpaperId) || WALLPAPER_TEXTURES[0];
  const currentFlooring =
    FLOORING_TEXTURES.find((f) => f.id === selectedFlooringId) || FLOORING_TEXTURES[0];

  // Save furniture changes
  const handleApplyFurniture = () => {
    retroAudio.playSparkle();
    onUpdateConfig(slot.id, {
      selectedOptionId,
      selectedColor,
      selectedSticker,
    });
    onClose();
  };

  // Save environment (Wall & Floor) changes
  const handleApplyEnvironment = () => {
    retroAudio.playSparkle();
    if (wallSlot) {
      onUpdateConfig(wallSlot.id, {
        selectedOptionId: selectedWallpaperId,
        selectedColor: selectedWallpaperColor,
      });
    }
    if (floorSlot) {
      onUpdateConfig(floorSlot.id, {
        selectedOptionId: selectedFlooringId,
        selectedColor: selectedFlooringColor,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-3xl y2k-glass-panel rounded-2xl border-4 border-pink-400 p-4 sm:p-6 shadow-2xl relative max-h-[94vh] flex flex-col overflow-hidden">
        {/* Top Mode Switcher Bar */}
        <div className="flex items-center justify-between border-b-2 border-pink-400/40 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-pink-400/40 shadow-inner">
              <button
                onClick={() => {
                  retroAudio.playClick();
                  setActiveMode('furniture');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeMode === 'furniture'
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🪑</span>
                <span>Móvel: {slot.name}</span>
              </button>
              <button
                onClick={() => {
                  retroAudio.playClick();
                  setActiveMode('environment');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeMode === 'environment'
                    ? 'bg-gradient-to-r from-pink-500 to-cyan-500 text-white shadow-md ring-2 ring-yellow-400/50'
                    : 'text-pink-300 hover:text-white'
                }`}
              >
                <span>🏡</span>
                <span>Decorar Ambiente (Paredes & Pisos)</span>
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-pink-600/80 hover:bg-pink-500 border border-white/60 text-white font-bold flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        {/* ======================================================== */}
        {/* MODE 1: DECORATE ENVIRONMENT (WALLPAPERS & FLOORING)     */}
        {/* ======================================================== */}
        {activeMode === 'environment' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Environment Sub-tabs */}
            <div className="flex items-center justify-between gap-2 mb-3 shrink-0">
              <div className="flex items-center gap-1 p-1 bg-slate-900/80 rounded-xl border border-white/10 flex-1">
                <button
                  onClick={() => {
                    retroAudio.playClick();
                    setActiveEnvTab('wallpaper');
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeEnvTab === 'wallpaper'
                      ? 'bg-pink-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🖼️</span>
                  <span>Papel de Parede</span>
                </button>
                <button
                  onClick={() => {
                    retroAudio.playClick();
                    setActiveEnvTab('flooring');
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeEnvTab === 'flooring'
                      ? 'bg-cyan-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🪵</span>
                  <span>Revestimento do Piso</span>
                </button>
                <button
                  onClick={() => {
                    retroAudio.playClick();
                    setActiveEnvTab('overview');
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeEnvTab === 'overview'
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>👁️</span>
                  <span>Visualização Combinada</span>
                </button>
              </div>
            </div>

            {/* Live Environment Combined Header Badge */}
            <div className="shrink-0 mb-3 bg-slate-950/80 p-3 rounded-xl border border-pink-400/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Wallpaper mini preview swatch */}
                <div
                  className="w-12 h-12 rounded-lg border-2 border-white/60 shadow flex items-center justify-center text-xl relative overflow-hidden"
                  style={{ backgroundColor: selectedWallpaperColor }}
                  title="Papel de Parede selecionado"
                >
                  <span className="drop-shadow">{currentWallpaper.icon}</span>
                </div>
                {/* Plus connector */}
                <span className="text-yellow-400 font-bold text-sm">+</span>
                {/* Floor mini preview swatch */}
                <div
                  className="w-12 h-12 rounded-lg border-2 border-white/60 shadow flex items-center justify-center text-xl relative overflow-hidden"
                  style={{ backgroundColor: selectedFlooringColor }}
                  title="Piso selecionado"
                >
                  <span className="drop-shadow">{currentFlooring.icon}</span>
                </div>

                <div className="text-xs">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span className="text-pink-300">Parede:</span> {currentWallpaper.name}
                  </div>
                  <div className="font-bold text-white flex items-center gap-2 mt-0.5">
                    <span className="text-cyan-300">Piso:</span> {currentFlooring.name}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Selecione as estampas e cores para personalizar todo o quarto!
                  </div>
                </div>
              </div>

              <button
                onClick={handleApplyEnvironment}
                className="y2k-btn-primary px-4 py-2 rounded-xl font-display text-xs tracking-wider cursor-pointer shrink-0 shadow-lg"
              >
                APLICAR NO AMBIENTE ✨
              </button>
            </div>

            {/* Scrollable Tab Content for Environment */}
            <div className="flex-1 overflow-y-auto pr-1">
              {/* SUB-TAB 1: WALLPAPER TEXTURES */}
              {activeEnvTab === 'wallpaper' && (
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-bold text-pink-300 mb-2 flex items-center gap-1.5">
                      <span>🖼️</span>
                      <span>ESCOLHA A ESTAMPA DO PAPEL DE PAREDE:</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {WALLPAPER_TEXTURES.map((wp) => {
                        const isSelected = selectedWallpaperId === wp.id;
                        return (
                          <button
                            key={wp.id}
                            onClick={() => {
                              retroAudio.playClick();
                              setSelectedWallpaperId(wp.id);
                              if (wp.defaultColor) setSelectedWallpaperColor(wp.defaultColor);
                            }}
                            className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                              isSelected
                                ? 'bg-pink-950/70 border-pink-400 ring-2 ring-pink-400/50 shadow-lg scale-[1.02]'
                                : 'bg-slate-900/60 border-white/10 hover:border-pink-400/40'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-3xl">{wp.icon}</span>
                              <span className="text-[10px] text-pink-300 font-mono bg-pink-950/60 px-1.5 py-0.5 rounded border border-pink-500/30">
                                {wp.eraTag}
                              </span>
                            </div>
                            <div>
                              <div className="font-display text-xs text-white font-bold">
                                {wp.name}
                              </div>
                              <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                                {wp.description}
                              </p>
                            </div>
                            {isSelected && (
                              <span className="absolute top-2 right-2 text-xs bg-pink-500 text-white font-bold px-1.5 py-0.5 rounded shadow">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Wallpaper Color Tint */}
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-white/10">
                    <div className="text-xs font-bold text-slate-300 mb-2">
                      🎨 Ajustar Cor ou Tonalidade da Parede:
                    </div>
                    <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                      {RETRO_PALETTE.map((pal) => (
                        <button
                          key={pal.hex}
                          onClick={() => {
                            retroAudio.playClick();
                            setSelectedWallpaperColor(pal.hex);
                          }}
                          className={`w-9 h-9 rounded-lg border-2 transition-transform cursor-pointer relative ${
                            selectedWallpaperColor === pal.hex
                              ? 'border-white scale-110 ring-2 ring-pink-400'
                              : 'border-white/20 hover:scale-105'
                          }`}
                          style={{ backgroundColor: pal.hex }}
                          title={pal.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB 2: FLOORING TEXTURES */}
              {activeEnvTab === 'flooring' && (
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-bold text-cyan-300 mb-2 flex items-center gap-1.5">
                      <span>🪵</span>
                      <span>ESCOLHA A TEXTURA DO REVESTIMENTO DO PISO:</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {FLOORING_TEXTURES.map((fl) => {
                        const isSelected = selectedFlooringId === fl.id;
                        return (
                          <button
                            key={fl.id}
                            onClick={() => {
                              retroAudio.playClick();
                              setSelectedFlooringId(fl.id);
                              if (fl.defaultColor) setSelectedFlooringColor(fl.defaultColor);
                            }}
                            className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                              isSelected
                                ? 'bg-cyan-950/70 border-cyan-400 ring-2 ring-cyan-400/50 shadow-lg scale-[1.02]'
                                : 'bg-slate-900/60 border-white/10 hover:border-cyan-400/40'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-3xl">{fl.icon}</span>
                              <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                                {fl.eraTag}
                              </span>
                            </div>
                            <div>
                              <div className="font-display text-xs text-white font-bold">
                                {fl.name}
                              </div>
                              <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                                {fl.description}
                              </p>
                            </div>
                            {isSelected && (
                              <span className="absolute top-2 right-2 text-xs bg-cyan-500 text-white font-bold px-1.5 py-0.5 rounded shadow">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Flooring Color Tint */}
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-white/10">
                    <div className="text-xs font-bold text-slate-300 mb-2">
                      🎨 Ajustar Cor ou Tonalidade do Piso:
                    </div>
                    <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                      {RETRO_PALETTE.map((pal) => (
                        <button
                          key={pal.hex}
                          onClick={() => {
                            retroAudio.playClick();
                            setSelectedFlooringColor(pal.hex);
                          }}
                          className={`w-9 h-9 rounded-lg border-2 transition-transform cursor-pointer relative ${
                            selectedFlooringColor === pal.hex
                              ? 'border-white scale-110 ring-2 ring-cyan-400'
                              : 'border-white/20 hover:scale-105'
                          }`}
                          style={{ backgroundColor: pal.hex }}
                          title={pal.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB 3: COMBINED PREVIEW */}
              {activeEnvTab === 'overview' && (
                <div className="bg-slate-900/70 p-4 rounded-xl border border-white/10 flex flex-col items-center">
                  <div className="w-full max-w-md h-52 rounded-2xl border-4 border-white/30 overflow-hidden relative shadow-2xl flex flex-col">
                    {/* Simulated Wall Upper Half */}
                    <div
                      className="w-full h-1/2 flex items-center justify-center relative p-3 border-b-4 border-white/40"
                      style={{ backgroundColor: selectedWallpaperColor }}
                    >
                      <div className="text-center bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/20">
                        <span className="text-xl mr-2">{currentWallpaper.icon}</span>
                        <span className="text-xs font-bold text-white font-display">
                          {currentWallpaper.name}
                        </span>
                      </div>
                    </div>

                    {/* Simulated Floor Lower Half */}
                    <div
                      className="w-full h-1/2 flex items-center justify-center relative p-3"
                      style={{ backgroundColor: selectedFlooringColor }}
                    >
                      <div className="text-center bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/20">
                        <span className="text-xl mr-2">{currentFlooring.icon}</span>
                        <span className="text-xs font-bold text-white font-display">
                          {currentFlooring.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-3 text-center max-w-sm">
                    Esta combinação de papel de parede e piso será renderizada imediatamente em todo o cômodo 3D ao clicar no botão abaixo!
                  </p>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="border-t-2 border-pink-400/30 pt-3 mt-3 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-400">
                Altere texturas de parede e piso quantas vezes quiser gratuitamente!
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleApplyEnvironment}
                  className="y2k-btn-primary px-6 py-2 rounded-xl font-display text-sm tracking-wider cursor-pointer"
                >
                  APLICAR NO AMBIENTE ✨
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 2: CUSTOMIZE FURNITURE ITEM                         */}
        {/* ======================================================== */}
        {activeMode === 'furniture' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Live Preview Card */}
            <div className="shrink-0 mb-3 bg-slate-950/70 p-3.5 rounded-xl border border-pink-400/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl border-2 shadow-lg relative overflow-hidden bg-slate-900 shrink-0"
                  style={{ borderColor: selectedColor, boxShadow: `0 0 16px ${selectedColor}60` }}
                >
                  <span>{currentOption.modelIcon}</span>
                  {selectedSticker && (
                    <span className="absolute bottom-0 right-0 text-base drop-shadow">
                      {selectedSticker}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{currentOption.name}</span>
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    {currentOption.description}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white/60"
                      style={{ backgroundColor: selectedColor }}
                      title="Cor selecionada"
                    />
                    <span className="text-[11px] text-pink-300 font-semibold">
                      {selectedSticker ? `Adesivo: ${selectedSticker}` : 'Cor selecionada'}
                    </span>
                  </div>
                </div>
              </div>

              {!slot.isRestored && (
                <div className="text-right shrink-0">
                  <div className="text-xs text-amber-300 font-semibold mb-1">Custo de Reforma:</div>
                  <div className="flex items-center gap-2 justify-end text-xs font-bold text-white mb-2">
                    <span className="flex items-center gap-1 bg-yellow-950/60 border border-yellow-500/40 px-2 py-0.5 rounded">
                      ⭐ {slot.restoreCostStars}
                    </span>
                    <span className="flex items-center gap-1 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded">
                      🪙 {slot.restoreCostCoins}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      retroAudio.playSparkle();
                      onRestore(slot.id);
                    }}
                    disabled={!canRestore}
                    className={`px-4 py-1.5 rounded-lg font-display text-xs tracking-wider transition-all cursor-pointer ${
                      canRestore
                        ? 'y2k-btn-primary hover:scale-105'
                        : 'bg-slate-700/60 border border-white/20 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    RESTAURAR AGORA ✨
                  </button>
                </div>
              )}
            </div>

            {/* Furniture Tab Navigation */}
            <div className="flex items-center gap-1 p-1 bg-slate-900/80 rounded-xl border border-white/10 mb-3 shrink-0">
              <button
                onClick={() => {
                  retroAudio.playClick();
                  setActiveFurnitureTab('model');
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeFurnitureTab === 'model'
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1. Modelo & Estilo
              </button>
              <button
                onClick={() => {
                  retroAudio.playClick();
                  setActiveFurnitureTab('color');
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeFurnitureTab === 'color'
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                2. Cor do Móvel
              </button>
              <button
                onClick={() => {
                  retroAudio.playClick();
                  setActiveFurnitureTab('sticker');
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeFurnitureTab === 'sticker'
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                3. Adesivos Y2K
              </button>
            </div>

            {/* Tab Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto pr-1">
              {/* TAB 1: MODEL */}
              {activeFurnitureTab === 'model' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {slot.options.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          retroAudio.playClick();
                          setSelectedOptionId(opt.id);
                        }}
                        className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-pink-950/60 border-pink-400 shadow-lg ring-2 ring-pink-400/50 scale-[1.02]'
                            : 'bg-slate-900/50 border-white/10 hover:border-pink-400/50'
                        }`}
                      >
                        <div className="text-3xl mb-2">{opt.modelIcon}</div>
                        <div className="font-display text-sm text-pink-300">{opt.name}</div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {opt.description}
                        </p>
                        {isSelected && (
                          <span className="absolute top-2 right-2 text-xs bg-pink-500 text-white font-bold px-1.5 py-0.5 rounded">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: COLOR */}
              {activeFurnitureTab === 'color' && (
                <div>
                  <div className="text-xs text-slate-400 mb-3">
                    Escolha a cor principal que você quer aplicar neste móvel:
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {RETRO_PALETTE.map((pal) => {
                      const isSelected = selectedColor === pal.hex;
                      return (
                        <button
                          key={pal.hex}
                          onClick={() => {
                            retroAudio.playClick();
                            setSelectedColor(pal.hex);
                          }}
                          className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-white ring-2 ring-pink-400 bg-white/10 scale-105'
                              : 'border-white/15 hover:border-white/40 bg-slate-900/40'
                          }`}
                        >
                          <div
                            className="w-10 h-10 rounded-full border-2 border-white/60 shadow-md transition-transform hover:scale-110"
                            style={{ backgroundColor: pal.hex }}
                          />
                          <span className="text-xs font-medium text-slate-200 text-center truncate w-full">
                            {pal.name}
                          </span>
                          <span className="text-[10px] text-cyan-300">{pal.eraTag}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: STICKERS */}
              {activeFurnitureTab === 'sticker' && (
                <div>
                  <div className="text-xs text-slate-400 mb-3 flex items-center justify-between">
                    <span>Cole um detalhe nostálgico dos anos 2000:</span>
                    {selectedSticker && (
                      <button
                        onClick={() => {
                          retroAudio.playClick();
                          setSelectedSticker(null);
                        }}
                        className="text-pink-400 hover:underline text-xs cursor-pointer"
                      >
                        Remover adesivo
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {RETRO_STICKERS.map((stk) => {
                      const isSelected = selectedSticker === stk.symbol;
                      return (
                        <button
                          key={stk.id}
                          onClick={() => {
                            retroAudio.playPop();
                            setSelectedSticker(isSelected ? null : stk.symbol);
                          }}
                          className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-yellow-400 ring-2 ring-yellow-400/50 bg-pink-950/50 scale-105'
                              : 'border-white/15 hover:border-pink-400/40 bg-slate-900/40'
                          }`}
                        >
                          <span className="text-3xl drop-shadow">{stk.symbol}</span>
                          <span className="text-[10px] text-slate-300 text-center truncate w-full">
                            {stk.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="border-t-2 border-pink-400/30 pt-3 mt-3 flex items-center justify-between shrink-0">
              <button
                onClick={() => {
                  retroAudio.playClick();
                  setActiveMode('environment');
                }}
                className="text-xs text-cyan-300 hover:text-cyan-200 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>🏡</span>
                <span>Personalizar também as paredes e piso deste cômodo →</span>
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleApplyFurniture}
                  className="y2k-btn-primary px-6 py-2 rounded-xl font-display text-sm tracking-wider cursor-pointer"
                >
                  APLICAR MUDANÇA ✨
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
