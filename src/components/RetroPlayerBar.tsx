import React from 'react';
import { RoomId, RoomData } from '../types/game';
import { retroAudio } from '../utils/audio';

interface RetroPlayerBarProps {
  rooms: RoomData[];
  currentRoomId: RoomId;
  onSelectRoom: (id: RoomId) => void;
  onOpenPuzzle: () => void;
}

export const RetroPlayerBar: React.FC<RetroPlayerBarProps> = ({
  rooms,
  currentRoomId,
  onSelectRoom,
  onOpenPuzzle,
}) => {
  return (
    <div className="w-full bg-slate-950/95 border-t-2 border-pink-400/30 px-3 sm:px-6 py-2 flex items-center justify-between gap-4 text-xs text-slate-300 shrink-0">
      {/* 2000s Media Player Status */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="hidden sm:flex items-center gap-1.5 bg-black/60 border border-green-500/40 px-2.5 py-1 rounded-md text-emerald-400 font-mono text-[11px] truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span>WINAMP // 128kbps STEREO: Y2K_POP_SYNTH_HITS.mp3</span>
        </div>
        <div className="text-[11px] text-pink-300 truncate">
          ✨ <span className="font-semibold">Nostalgia 2000:</span> Personalize texturas translúcidas, oncinha e infláveis!
        </div>
      </div>

      {/* Room Quick Switcher Pill */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[11px] text-slate-400 hidden md:inline">Trocar Cômodo:</span>
        {rooms.map((r) => {
          const isSelected = r.id === currentRoomId;
          const restoredSlots = r.slots.filter((s) => s.isRestored).length;

          return (
            <button
              key={r.id}
              onClick={() => {
                retroAudio.playClick();
                onSelectRoom(r.id);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                isSelected
                  ? 'bg-pink-600/90 border-pink-300 text-white font-bold shadow'
                  : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              <span>{r.id === 'bedroom' ? '🛏️' : r.id === 'living' ? '🛋️' : '🎮'}</span>
              <span className="hidden sm:inline">{r.name.split(' ')[0]}</span>
              <span className="text-[10px] opacity-75 tabular-nums">
                ({restoredSlots}/{r.slots.length})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
