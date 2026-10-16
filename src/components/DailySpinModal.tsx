import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { DAILY_SPIN_REWARDS, getTodayDateKey, isDailySpinAvailable } from '../data/dailySpin';
import { SpinReward, UserInventory } from '../types/game';
import { retroAudio } from '../utils/audio';

interface DailySpinModalProps {
  inventory: UserInventory;
  onClose: () => void;
  onClaimReward: (reward: SpinReward) => void;
}

export const DailySpinModal: React.FC<DailySpinModalProps> = ({
  inventory,
  onClose,
  onClaimReward,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [wonReward, setWonReward] = useState<SpinReward | null>(null);
  const [countdown, setCountdown] = useState<string>('');
  const lastTickSectorRef = useRef<number>(-1);

  const canSpinToday = isDailySpinAvailable(inventory.lastSpinDate);
  const segmentCount = DAILY_SPIN_REWARDS.length;
  const segmentAngle = 360 / segmentCount;

  // Countdown to midnight
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diff = tomorrow.getTime() - now.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(
        `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
      );
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWonReward(null);
    retroAudio.playPop();

    // Random prize selection
    const prizeIndex = Math.floor(Math.random() * segmentCount);
    const selectedPrize = DAILY_SPIN_REWARDS[prizeIndex];

    // Total rotations: 5 to 7 full spins + offset to land on selected prize
    const fullSpins = 5 + Math.floor(Math.random() * 2);
    // Note: The pointer is at the TOP (270 degrees or -90 deg from standard 0=right)
    // To land index i under top pointer:
    // angle = fullSpins * 360 + (360 - (prizeIndex * segmentAngle + segmentAngle / 2))
    const targetAngle =
      currentRotation +
      fullSpins * 360 +
      (360 - ((prizeIndex * segmentAngle + segmentAngle / 2) % 360)) -
      (currentRotation % 360);

    const spinDuration = 4500; // ms
    const startTime = performance.now();
    const startRotation = currentRotation;

    const animateSpin = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);

      // Ease out cubic / quartic
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const currentAng = startRotation + (targetAngle - startRotation) * easeOut;
      setCurrentRotation(currentAng);

      // Ticking sound as it crosses segments
      const currentSector = Math.floor(currentAng / segmentAngle);
      if (currentSector !== lastTickSectorRef.current) {
        lastTickSectorRef.current = currentSector;
        retroAudio.playWheelTick();
      }

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        // Complete!
        setIsSpinning(false);
        setWonReward(selectedPrize);
        retroAudio.playFanfare();
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#ff007f', '#00f0ff', '#ffe600', '#9d00ff', '#39ff14'],
        });
      }
    };

    requestAnimationFrame(animateSpin);
  };

  const handleClaim = () => {
    if (!wonReward) return;
    retroAudio.playSparkle();
    onClaimReward(wonReward);
    setWonReward(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-xl y2k-glass-panel rounded-3xl border-4 border-pink-400 p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col items-center">
        {/* Title Bar */}
        <div className="w-full flex items-center justify-between border-b-2 border-pink-400/40 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-spin">🎰</span>
            <div>
              <h2 className="font-display tracking-wider text-xl sm:text-2xl text-pink-300 drop-shadow flex items-center gap-2">
                ROLETA DA SORTE Y2K
                <span className="text-[11px] font-mono text-cyan-300 border border-cyan-400/40 px-2 py-0.5 rounded-full">
                  DAILY SPIN
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Gire todo dia para ganhar moedas, estrelas e adesivos retrô exclusivos!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-pink-600/80 hover:bg-pink-500 border border-white/60 text-white font-bold flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Daily Status Banner */}
        <div className="w-full bg-slate-900/80 border border-white/10 rounded-2xl p-2.5 mb-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-lg">{canSpinToday ? '🎁' : '⏳'}</span>
            <div>
              <span className="font-bold text-white">
                {canSpinToday ? 'Giro Diário Disponível!' : 'Giro de Hoje Já Utilizado!'}
              </span>
              <div className="text-[11px] text-slate-400">
                {canSpinToday
                  ? 'Você tem 1 giro grátis para aproveitar hoje!'
                  : `Próximo giro grátis em: ${countdown}`}
              </div>
            </div>
          </div>

          {!canSpinToday && (
            <span className="bg-yellow-950/60 border border-yellow-400/40 px-2.5 py-1 rounded-full text-yellow-300 font-mono text-[11px] font-bold">
              {countdown}
            </span>
          )}
        </div>

        {/* The Wheel Container */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center my-2">
          {/* Top Ticker Pin / Flipper (Points DOWN towards wheel rim) */}
          <div className="absolute -top-3 z-30 flex flex-col items-center">
            <div className="w-6 h-7 bg-gradient-to-b from-yellow-300 to-amber-500 clip-triangle shadow-2xl border-2 border-white rounded-t-sm" />
            <div className="w-2.5 h-2.5 rounded-full bg-red-600 border border-white shadow -mt-1 animate-pulse" />
          </div>

          {/* Outer Chrome / Golden Bezel with Blinking Bulbs */}
          <div className="absolute inset-0 rounded-full border-8 border-yellow-400 shadow-[0_0_25px_rgba(255,230,0,0.6)] bg-gradient-to-tr from-purple-900 via-pink-900 to-slate-900 overflow-hidden flex items-center justify-center pointer-events-none">
            {/* Blinking Dots around circumference */}
            {Array.from({ length: 16 }).map((_, i) => {
              const a = (i * 360) / 16;
              return (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-white shadow-sm"
                  style={{
                    transform: `rotate(${a}deg) translate(142px) rotate(-${a}deg)`,
                    backgroundColor: i % 2 === 0 ? '#ff007f' : '#00f0ff',
                  }}
                />
              );
            })}
          </div>

          {/* Rotating Wheel Disc */}
          <div
            className="w-[90%] h-[90%] rounded-full shadow-inner relative overflow-hidden"
            style={{
              transform: `rotate(${currentRotation}deg)`,
              transition: isSpinning ? 'none' : 'transform 0.1s ease-out',
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {DAILY_SPIN_REWARDS.map((reward, i) => {
                const startA = (i * 360) / segmentCount;
                const endA = ((i + 1) * 360) / segmentCount;

                // SVG Arc Path
                const startRad = ((startA - 90) * Math.PI) / 180;
                const endRad = ((endA - 90) * Math.PI) / 180;

                const x1 = 50 + 50 * Math.cos(startRad);
                const y1 = 50 + 50 * Math.sin(startRad);
                const x2 = 50 + 50 * Math.cos(endRad);
                const y2 = 50 + 50 * Math.sin(endRad);

                const midA = (startA + endA) / 2;
                const textRad = ((midA - 90) * Math.PI) / 180;
                const tx = 50 + 32 * Math.cos(textRad);
                const ty = 50 + 32 * Math.sin(textRad);

                return (
                  <g key={reward.id}>
                    <path
                      d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                      fill={reward.color}
                      stroke="#ffffff"
                      strokeWidth="0.8"
                    />
                    <text
                      x={tx}
                      y={ty}
                      fill={reward.textColor || '#ffffff'}
                      fontSize="5"
                      fontWeight="bold"
                      fontFamily="Fredoka, sans-serif"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${midA}, ${tx}, ${ty})`}
                    >
                      {reward.icon} {reward.amount ? reward.amount : ''}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Central Spin / Logo Button Cap */}
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className={`absolute z-20 w-20 h-20 sm:w-22 sm:h-22 rounded-full border-4 border-white shadow-2xl flex flex-col items-center justify-center transition-transform cursor-pointer ${
              isSpinning
                ? 'bg-slate-800 scale-95 opacity-80 cursor-wait'
                : 'y2k-btn-primary hover:scale-105 active:scale-95 animate-pulse-glow'
            }`}
          >
            <span className="text-xl sm:text-2xl drop-shadow">{isSpinning ? '🌀' : '✨'}</span>
            <span className="font-display text-xs font-bold tracking-wider text-white drop-shadow">
              {isSpinning ? 'GIRANDO...' : 'GIRAR!'}
            </span>
          </button>
        </div>

        {/* Spin Actions Bar */}
        <div className="w-full flex items-center justify-center gap-3 mt-4">
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className={`y2k-btn-primary px-8 py-3 rounded-2xl font-display text-base tracking-wider cursor-pointer shadow-xl flex items-center gap-2 ${
              isSpinning ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
            }`}
          >
            <span>🎰</span>
            <span>{isSpinning ? 'Girando a Roleta...' : canSpinToday ? 'GIRAR ROLETA GRÁTIS! ✨' : 'GIRAR NOVAMENTE (BÔNUS) ↺'}</span>
          </button>
        </div>

        {/* Reward Modal Overlay when landed */}
        {wonReward && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-40 animate-fade-in">
            <div className="text-6xl mb-2 animate-bounce">{wonReward.icon}</div>
            <h3 className="font-display text-3xl text-pink-400 drop-shadow mb-1">
              PARABÉNS! VOCÊ GANHOU:
            </h3>
            <div className="bg-gradient-to-r from-pink-900/60 to-purple-900/60 border-2 border-yellow-400 px-6 py-4 rounded-2xl my-3 max-w-sm">
              <div className="text-2xl font-display text-yellow-300">
                {wonReward.label}
              </div>
              {wonReward.type === 'sticker' && (
                <div className="text-xs text-pink-200 mt-1">
                  Adesivo Exclusivo Y2K: <strong className="text-white">{wonReward.stickerName}</strong>
                </div>
              )}
              {wonReward.type === 'coins' && (
                <div className="text-xs text-slate-300 mt-1">
                  Moedas adicionadas para desbloquear novas cores e itens!
                </div>
              )}
              {wonReward.type === 'stars' && (
                <div className="text-xs text-slate-300 mt-1">
                  Estrelas adicionadas para reformar cômodos!
                </div>
              )}
            </div>

            <button
              onClick={handleClaim}
              className="y2k-btn-primary px-8 py-3 rounded-xl font-display text-base tracking-wider cursor-pointer shadow-xl"
            >
              COLETAR PRÊMIO! ✨
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
