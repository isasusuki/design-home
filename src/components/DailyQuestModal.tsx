import React, { useState, useEffect } from 'react';
import { DailyQuest } from '../types/game';
import { getTimeUntilMidnight } from '../data/dailyQuests';
import { retroAudio } from '../utils/audio';

interface DailyQuestModalProps {
  quest: DailyQuest;
  onClaimReward: () => void;
  onClose: () => void;
  onNavigateToTask?: () => void;
}

export const DailyQuestModal: React.FC<DailyQuestModalProps> = ({
  quest,
  onClaimReward,
  onClose,
  onNavigateToTask,
}) => {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilMidnight());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const progressPercent = Math.min(100, Math.round((quest.currentCount / quest.targetCount) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-lg y2k-glass-panel rounded-2xl border-4 border-yellow-400 p-5 shadow-2xl relative overflow-hidden flex flex-col animate-fade-in">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b-2 border-yellow-400/40 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-bounce">📋</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl text-yellow-300 drop-shadow">
                  MISSÃO DIÁRIA Y2K
                </h3>
                <span className="text-[10px] font-bold text-black bg-yellow-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  HOJE
                </span>
              </div>
              <div className="text-[11px] text-slate-300 font-mono">
                Próxima missão em: <span className="text-yellow-300 font-semibold">{timeLeft}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-pink-600/80 hover:bg-pink-500 border border-white/60 text-white font-bold flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
          >
            ✕
          </button>
        </div>

        {/* Quest Card Container */}
        <div className="bg-slate-950/80 rounded-xl border-2 border-pink-400/40 p-4 mb-4 shadow-inner relative overflow-hidden">
          {/* Badge & Title */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-yellow-500 flex items-center justify-center text-3xl shadow-lg border-2 border-white/80 shrink-0">
              <span>{quest.badgeIcon}</span>
            </div>
            <div className="flex-1">
              <h4 className="font-display text-lg text-white leading-tight">
                {quest.title}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {quest.description}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 bg-black/60 p-3 rounded-lg border border-white/10">
            <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
              <span className="text-slate-300">Progresso da Tarefa:</span>
              <span className={quest.isCompleted ? 'text-emerald-400 font-display' : 'text-yellow-300 font-display'}>
                {quest.currentCount} / {quest.targetCount} {quest.isCompleted ? '✓ CONCLUÍDO' : ''}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-white/20">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  quest.isCompleted
                    ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                    : 'bg-gradient-to-r from-pink-500 to-yellow-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Reward Display Box */}
          <div className="mt-3 flex items-center justify-between bg-yellow-950/40 border border-yellow-400/40 p-3 rounded-xl">
            <div className="text-xs font-bold text-yellow-300">
              Bônus Exclusivo da Missão:
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-lg border border-yellow-400/50">
                <span className="text-base">⭐</span>
                <span className="font-display text-sm text-yellow-300 font-bold">
                  +{quest.rewardStars}
                </span>
                <span className="text-[10px] text-slate-400">Estrelas</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-lg border border-pink-400/50">
                <span className="text-base">🪙</span>
                <span className="font-display text-sm text-pink-300 font-bold">
                  +{quest.rewardCoins}
                </span>
                <span className="text-[10px] text-slate-400">Coins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="text-[11px] text-slate-400 italic">
            Dica: Uma nova missão é liberada todos os dias à meia-noite!
          </div>

          {quest.isClaimed ? (
            <div className="px-5 py-2.5 rounded-xl bg-emerald-950/80 border border-emerald-400 text-emerald-300 font-display text-xs tracking-wider flex items-center gap-1.5">
              <span>✓</span>
              <span>COLETADO HOJE!</span>
            </div>
          ) : quest.isCompleted ? (
            <button
              onClick={() => {
                retroAudio.playSparkle();
                onClaimReward();
              }}
              className="y2k-btn-primary px-6 py-2.5 rounded-xl font-display text-sm tracking-wider cursor-pointer animate-pulse"
            >
              COLETAR RECOMPENSA! ✨
            </button>
          ) : (
            <button
              onClick={() => {
                retroAudio.playClick();
                if (onNavigateToTask) onNavigateToTask();
                onClose();
              }}
              className="y2k-btn-cyan px-5 py-2.5 rounded-xl font-display text-xs tracking-wider cursor-pointer"
            >
              IR CUMPRIR TAREFA 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
