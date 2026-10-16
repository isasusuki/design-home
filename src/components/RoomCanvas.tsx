import React, { useState } from 'react';
import { RoomData, FurnitureSlot, UserInventory } from '../types/game';
import { retroAudio } from '../utils/audio';

interface RoomCanvasProps {
  room: RoomData;
  inventory: UserInventory;
  onSelectSlot: (slot: FurnitureSlot) => void;
  onOpenPuzzle: () => void;
  onOpenPhotoStudio: () => void;
}

export const RoomCanvas: React.FC<RoomCanvasProps> = ({
  room,
  inventory,
  onSelectSlot,
  onOpenPuzzle,
  onOpenPhotoStudio,
}) => {
  const [showScanlines, setShowScanlines] = useState(false);
  const [viewMode, setViewMode] = useState<'after' | 'before'>('after');

  const restoredCount = room.slots.filter((s) => s.isRestored).length;
  const totalSlots = room.slots.length;
  const progressPercent = Math.round((restoredCount / totalSlots) * 100);

  return (
    <div className="relative w-full flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
      {/* Room Controls Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900/80 border border-pink-400/40 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span className="text-sm font-bold text-pink-300 font-display">
              {room.name}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-semibold text-emerald-400 tabular-nums">
              {progressPercent}% Restaurado ({restoredCount}/{totalSlots})
            </span>
          </div>

          {/* Progress bar */}
          <div className="hidden md:block w-36 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-white/20">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-cyan-400 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-2">
          {/* Before/After Toggle */}
          <button
            onClick={() => {
              retroAudio.playClick();
              setViewMode((v) => (v === 'after' ? 'before' : 'after'));
            }}
            className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
              viewMode === 'before'
                ? 'bg-amber-600 border-amber-300 text-white shadow'
                : 'bg-slate-900/80 border-white/20 text-slate-300 hover:text-white'
            }`}
          >
            {viewMode === 'before' ? '👀 Vendo: Antes' : '✨ Vendo: Decorado'}
          </button>

          {/* Scanlines Filter */}
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
            onClick={() => {
              retroAudio.playCamera();
              onOpenPhotoStudio();
            }}
            className="y2k-btn-cyan px-3 py-1 rounded-lg text-xs font-bold tracking-wide flex items-center gap-1 cursor-pointer"
            title="Tirar foto para capa de revista Y2K"
          >
            <span>📸</span>
            <span className="hidden sm:inline">Foto Revista</span>
          </button>
        </div>
      </div>

      {/* Main Room Viewport Container */}
      <div 
        id="room-export-area"
        className="relative w-full max-w-5xl aspect-16/9 rounded-2xl overflow-hidden border-4 border-pink-400 shadow-2xl bg-black select-none"
      >
        {/* Room Background Image */}
        <img
          src={room.bgImage}
          alt={room.name}
          className={`w-full h-full object-cover transition-all duration-500 ${
            viewMode === 'before'
              ? 'grayscale contrast-75 brightness-75 sepia-50'
              : 'contrast-105'
          }`}
          referrerPolicy="no-referrer"
        />

        {/* CRT Scanline Overlay */}
        {showScanlines && (
          <div className="absolute inset-0 crt-overlay z-10 pointer-events-none" />
        )}

        {/* Before Mode Banner */}
        {viewMode === 'before' && (
          <div className="absolute top-4 left-4 z-20 bg-amber-900/90 border-2 border-amber-400 px-3 py-1.5 rounded-xl text-amber-200 font-display text-sm flex items-center gap-2 shadow-lg">
            <span>🏚️</span>
            <span>ESTADO ORIGINAL: Quarto precisando de reforma total!</span>
          </div>
        )}

        {/* Interactive Furniture Slots & Hotspots */}
        {viewMode === 'after' &&
          room.slots.map((slot) => {
            const currentOption = slot.options.find((o) => o.id === slot.selectedOptionId) || slot.options[0];

            return (
              <React.Fragment key={slot.id}>
                {/* Active Overlay Box on the Furniture Area */}
                {slot.isRestored && slot.category !== 'surface' && (
                  <div
                    onClick={() => {
                      retroAudio.playClick();
                      onSelectSlot(slot);
                    }}
                    className="absolute rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 hover:z-30 group overflow-hidden border-2 shadow-xl bg-slate-900/70 backdrop-blur-xs"
                    style={{
                      top: `${slot.renderArea.top}%`,
                      left: `${slot.renderArea.left}%`,
                      width: `${slot.renderArea.width}%`,
                      height: `${slot.renderArea.height}%`,
                      borderColor: slot.selectedColor,
                      boxShadow: `0 8px 24px ${slot.selectedColor}40`,
                    }}
                    title={`Clique para personalizar: ${slot.name}`}
                  >
                    {/* Semi-transparent tint and details */}
                    <div className="w-full h-full p-2 flex flex-col justify-between bg-black/20 backdrop-blur-[1px] hover:bg-black/10 transition-colors">
                      <div className="flex items-start justify-between">
                        <span className="text-xl sm:text-2xl drop-shadow filter drop-shadow">
                          {currentOption.modelIcon}
                        </span>
                        {slot.selectedSticker && (
                          <span className="text-xl sm:text-2xl filter drop-shadow-md animate-pulse">
                            {slot.selectedSticker}
                          </span>
                        )}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-xs px-2 py-1 rounded text-[11px] text-pink-300 font-display font-semibold self-start shadow">
                        Editar {slot.name} ✨
                      </div>
                    </div>
                  </div>
                )}

                {/* Floating Interactive Badge / Pin */}
                <button
                  onClick={() => {
                    retroAudio.playClick();
                    onSelectSlot(slot);
                  }}
                  className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 cursor-pointer ${
                    slot.isRestored
                      ? 'hover:scale-115 active:scale-95'
                      : 'animate-bounce hover:scale-120'
                  }`}
                  style={{
                    top: `${slot.pinPosition.top}%`,
                    left: `${slot.pinPosition.left}%`,
                  }}
                >
                  {slot.isRestored ? (
                    <div 
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white font-bold text-xs shadow-lg border-2 border-white/80 transition-transform"
                      style={{
                        background: `linear-gradient(135deg, ${slot.selectedColor}, #111827)`,
                        boxShadow: `0 0 12px ${slot.selectedColor}`,
                      }}
                    >
                      <span className="text-sm">{currentOption.modelIcon}</span>
                      <span className="hidden sm:inline font-display text-[11px]">
                        {slot.name}
                      </span>
                      <span className="text-yellow-300 text-xs">✎</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-pink-600 to-amber-500 px-3 py-1 rounded-full text-white font-bold text-xs shadow-xl border-2 border-yellow-300 animate-pulse">
                      <span className="text-sm">⭐</span>
                      <span className="font-display text-[11px] tracking-wide">
                        Restaurar ({slot.restoreCostStars}★)
                      </span>
                    </div>
                  )}
                </button>
              </React.Fragment>
            );
          })}

        {/* Prompt to play puzzle if out of stars */}
        {restoredCount < totalSlots && inventory.stars < 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-slate-950/85 backdrop-blur-md border-2 border-pink-400 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-2xl animate-fade-in">
            <span className="text-2xl animate-spin">💿</span>
            <div className="text-left">
              <div className="text-xs font-bold text-pink-300">
                Precisa de Estrelas para reformar?
              </div>
              <div className="text-[11px] text-slate-300">
                Jogue o mini-game match-3 para ganhar estrelas e moedas!
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
