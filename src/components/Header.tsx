import React, { useState } from 'react';
import { RoomId, UserInventory, DailyQuest } from '../types/game';
import { retroAudio } from '../utils/audio';

interface HeaderProps {
  currentRoomId: RoomId;
  onSelectRoom: (roomId: RoomId) => void;
  inventory: UserInventory;
  dailyQuest: DailyQuest;
  isSpinAvailable: boolean;
  onOpenPuzzle: () => void;
  onOpenDailyQuest: () => void;
  onOpenDailySpin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoomId,
  onSelectRoom,
  inventory,
  dailyQuest,
  isSpinAvailable,
  onOpenPuzzle,
  onOpenDailyQuest,
  onOpenDailySpin,
}) => {
  const [isBgmOn, setIsBgmOn] = useState(retroAudio.getIsBgmPlaying());
  const [isMuted, setIsMuted] = useState(retroAudio.getIsMuted());

  const handleToggleBgm = () => {
    const playing = retroAudio.toggleBgm();
    setIsBgmOn(playing);
  };

  const handleToggleMute = () => {
    const muted = retroAudio.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="w-full flex items-center justify-between px-4 sm:px-6 py-3 border-b-2 border-pink-400/40 bg-slate-950/90 backdrop-blur-md z-40 shrink-0">
      {/* Zone 1: Single Text Element Brand Wordmark */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onSelectRoom('bedroom');
        }}
        className="font-display text-xl sm:text-2xl tracking-wider text-pink-400 drop-shadow hover:text-pink-300 transition-colors whitespace-nowrap"
      >
        Y2K DREAM HOUSE
      </a>

      {/* Zone 2: Navigation Links (Rooms) */}
      <nav className="flex items-center gap-2 sm:gap-6 text-xs sm:text-sm font-medium">
        <button
          onClick={() => {
            retroAudio.playClick();
            onSelectRoom('bedroom');
          }}
          className={`transition-colors whitespace-nowrap pb-0.5 cursor-pointer ${
            currentRoomId === 'bedroom'
              ? 'text-pink-400 font-bold border-b-2 border-pink-400'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          Quarto Teen
        </button>

        <button
          onClick={() => {
            retroAudio.playClick();
            onSelectRoom('living');
          }}
          className={`transition-colors whitespace-nowrap pb-0.5 cursor-pointer ${
            currentRoomId === 'living'
              ? 'text-cyan-400 font-bold border-b-2 border-cyan-400'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          Sala Retrô
        </button>

        <button
          onClick={() => {
            retroAudio.playClick();
            onSelectRoom('arcade');
          }}
          className={`transition-colors whitespace-nowrap pb-0.5 cursor-pointer ${
            currentRoomId === 'arcade'
              ? 'text-purple-400 font-bold border-b-2 border-purple-400'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          Cyber Lounge
        </button>
      </nav>

      {/* Zone 3: Resources & Primary Action */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Star Counter */}
        <div 
          className="flex items-center gap-1 bg-yellow-950/50 border border-yellow-400/40 px-2.5 py-1 rounded-xl text-xs font-bold text-yellow-300 tabular-nums shadow-inner"
          title="Estrelas para restaurar móveis"
        >
          <span>⭐</span>
          <span>{inventory.stars}</span>
        </div>

        {/* Coins Counter */}
        <div 
          className="flex items-center gap-1 bg-pink-950/50 border border-pink-400/40 px-2.5 py-1 rounded-xl text-xs font-bold text-pink-300 tabular-nums shadow-inner"
          title="Glitter Coins para desbloquear móveis e cores"
        >
          <span>🪙</span>
          <span>{inventory.coins}</span>
        </div>

        {/* Daily Quest Button */}
        <button
          onClick={() => {
            retroAudio.playClick();
            onOpenDailyQuest();
          }}
          className={`px-2.5 sm:px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-display text-xs cursor-pointer transition-transform hover:scale-105 relative ${
            dailyQuest.isCompleted && !dailyQuest.isClaimed
              ? 'bg-amber-500 border-yellow-200 text-black shadow-[0_0_14px_rgba(255,230,0,0.85)] animate-pulse'
              : dailyQuest.isClaimed
              ? 'bg-slate-900 border-white/20 text-slate-300 hover:text-white'
              : 'bg-yellow-950/60 border-yellow-400/50 text-yellow-300 hover:border-yellow-300'
          }`}
          title="Ver Missão Diária Y2K"
        >
          <span className="text-sm">📋</span>
          <span className="hidden md:inline">Missão Diária</span>
          {dailyQuest.isCompleted && !dailyQuest.isClaimed ? (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -top-1 -right-1 ring-2 ring-white animate-ping" />
          ) : !dailyQuest.isCompleted ? (
            <span className="text-[10px] bg-yellow-400 text-black px-1 rounded font-bold tabular-nums">
              {dailyQuest.currentCount}/{dailyQuest.targetCount}
            </span>
          ) : null}
        </button>

        {/* Daily Spin Button */}
        <button
          onClick={() => {
            retroAudio.playClick();
            onOpenDailySpin();
          }}
          className={`px-2.5 sm:px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-display text-xs cursor-pointer transition-transform hover:scale-105 relative ${
            isSpinAvailable
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 border-pink-300 text-white shadow-[0_0_12px_rgba(255,0,128,0.7)] animate-pulse'
              : 'bg-slate-900 border-white/20 text-slate-300 hover:text-white'
          }`}
          title="Girar Roleta da Sorte Diária"
        >
          <span className="text-sm">🎰</span>
          <span className="hidden md:inline">Roleta Diária</span>
          {isSpinAvailable && (
            <span className="w-2.5 h-2.5 rounded-full bg-pink-400 absolute -top-1 -right-1 ring-2 ring-white animate-ping" />
          )}
        </button>

        {/* Music / Audio Toggles */}
        <button
          onClick={handleToggleBgm}
          className={`w-8 h-8 rounded-lg border text-sm flex items-center justify-center transition-all cursor-pointer ${
            isBgmOn
              ? 'bg-purple-600/80 border-purple-300 text-white shadow'
              : 'bg-slate-900 border-white/20 text-slate-400 hover:text-white'
          }`}
          title={isBgmOn ? 'Desligar Trilha 2000s' : 'Ligar Trilha Nostálgica 2000s'}
        >
          {isBgmOn ? '🎵' : '🔇'}
        </button>

        {/* Primary Action Button: Play Match-3 */}
        <button
          onClick={() => {
            retroAudio.playClick();
            onOpenPuzzle();
          }}
          className="y2k-btn-primary px-3 sm:px-4 py-1.5 rounded-xl font-display text-xs sm:text-sm tracking-wider flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
        >
          <span>💿</span>
          <span>Jogar Puzzle</span>
        </button>
      </div>
    </header>
  );
};
