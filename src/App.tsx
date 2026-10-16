/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RoomId, RoomData, FurnitureSlot, UserInventory, DailyQuest } from './types/game';
import { INITIAL_ROOMS_DATA } from './data/rooms';
import { getOrGenerateDailyQuest } from './data/dailyQuests';
import { Header } from './components/Header';
import { Room3DView } from './components/Room3DView';
import { RoomCanvas } from './components/RoomCanvas';
import { CustomizerModal } from './components/CustomizerModal';
import { PuzzleGame, PuzzleReward } from './components/PuzzleGame';
import { PhotoStudio } from './components/PhotoStudio';
import { DailyQuestModal } from './components/DailyQuestModal';
import { DailySpinModal } from './components/DailySpinModal';
import { RetroPlayerBar } from './components/RetroPlayerBar';
import { isDailySpinAvailable, getTodayDateKey } from './data/dailySpin';
import { SpinReward } from './types/game';
import { retroAudio } from './utils/audio';

const STORAGE_KEY_ROOMS = 'y2k_dream_house_rooms_v3';
const STORAGE_KEY_INVENTORY = 'y2k_dream_house_inv_v3';
const STORAGE_KEY_QUEST = 'y2k_daily_quest_v1';

export default function App() {
  // Load saved state or default
  const [rooms, setRooms] = useState<RoomData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROOMS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ROOMS_DATA;
  });

  const [inventory, setInventory] = useState<UserInventory>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INVENTORY);
      if (saved) return JSON.parse(saved);
    } catch {}
    // Initial balance: 4 stars and 150 coins so the player can immediately test decorating!
    return {
      stars: 4,
      coins: 150,
      unlockedColors: ['#ff1493', '#00f0ff', '#9d00ff', '#39ff14', '#ffe600', '#ff6b35', '#d8e2dc', '#1e1b2e'],
    };
  });

  const [dailyQuest, setDailyQuest] = useState<DailyQuest>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QUEST);
      if (saved) {
        return getOrGenerateDailyQuest(JSON.parse(saved));
      }
    } catch {}
    return getOrGenerateDailyQuest();
  });

  const [currentRoomId, setCurrentRoomId] = useState<RoomId>('bedroom');
  const [activeSlotToCustomize, setActiveSlotToCustomize] = useState<FurnitureSlot | null>(null);
  const [isPuzzleOpen, setIsPuzzleOpen] = useState(false);
  const [isPhotoStudioOpen, setIsPhotoStudioOpen] = useState(false);
  const [isDailyQuestOpen, setIsDailyQuestOpen] = useState(false);
  const [isDailySpinOpen, setIsDailySpinOpen] = useState(false);
  const [photoScreenshotUrl, setPhotoScreenshotUrl] = useState<string | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'after' | 'before'>('after');
  const [displayMode, setDisplayMode] = useState<'3d' | '2d'>('3d');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(rooms));
    } catch {}
  }, [rooms]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(inventory));
    } catch {}
  }, [inventory]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_QUEST, JSON.stringify(dailyQuest));
    } catch {}
  }, [dailyQuest]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 4000);
  };

  const currentRoom = rooms.find((r) => r.id === currentRoomId) || rooms[0];

  // Helper to advance Daily Quest progress automatically
  const checkQuestProgress = (category: DailyQuest['category']) => {
    setDailyQuest((prevQuest) => {
      if (!prevQuest || prevQuest.isCompleted || prevQuest.category !== category) {
        return prevQuest;
      }

      const newCount = Math.min(prevQuest.targetCount, prevQuest.currentCount + 1);
      const isCompleted = newCount >= prevQuest.targetCount;

      if (isCompleted && !prevQuest.isCompleted) {
        retroAudio.playFanfare();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#ffe600', '#ff007f', '#00f0ff', '#39ff14'],
        });
        showToast(`🎉 Missão Diária Concluída: "${prevQuest.title}"! Abra para coletar bônus!`);
      }

      return {
        ...prevQuest,
        currentCount: newCount,
        isCompleted,
      };
    });
  };

  // Handle slot restore
  const handleRestoreSlot = (slotId: string) => {
    const slot = currentRoom.slots.find((s) => s.id === slotId);
    if (!slot) return;

    if (inventory.stars < slot.restoreCostStars || inventory.coins < slot.restoreCostCoins) {
      showToast('⚠️ Recursos insuficientes! Complete o puzzle para ganhar mais estrelas.');
      return;
    }

    // Deduct resources
    setInventory((prev) => ({
      ...prev,
      stars: prev.stars - slot.restoreCostStars,
      coins: prev.coins - slot.restoreCostCoins,
    }));

    // Update slot
    setRooms((prevRooms) =>
      prevRooms.map((rm) => {
        if (rm.id !== currentRoomId) return rm;
        return {
          ...rm,
          slots: rm.slots.map((s) => (s.id === slotId ? { ...s, isRestored: true } : s)),
        };
      })
    );

    // Update active modal reference if open
    setActiveSlotToCustomize((prev) => (prev ? { ...prev, isRestored: true } : null));

    // Celebrate
    retroAudio.playSparkle();
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#ff007f', '#00f0ff', '#ffe600', '#9d00ff'],
    });
    showToast(`✨ ${slot.name} restaurado em 3D com sucesso!`);

    // Check Daily Quest: Restore task
    checkQuestProgress('restore');
  };

  // Handle customization update
  const handleUpdateConfig = (slotId: string, updates: Partial<FurnitureSlot>) => {
    setRooms((prevRooms) =>
      prevRooms.map((rm) => {
        if (rm.id !== currentRoomId) return rm;
        return {
          ...rm,
          slots: rm.slots.map((s) => (s.id === slotId ? { ...s, ...updates } : s)),
        };
      })
    );
    showToast('🎨 Móvel 3D atualizado!');

    // Check Daily Quest progress
    if (slotId.includes('surface')) {
      checkQuestProgress('surface');
    }
    if (updates.selectedColor) {
      checkQuestProgress('color');
    }
    if (updates.selectedSticker) {
      checkQuestProgress('sticker');
    }
  };

  // Handle unlock color
  const handleUnlockColor = (colorHex: string, cost: number) => {
    if (inventory.coins < cost) return;
    setInventory((prev) => ({
      ...prev,
      coins: prev.coins - cost,
      unlockedColors: [...prev.unlockedColors, colorHex],
    }));
    retroAudio.playCoin();
    showToast('🪙 Nova cor retrô desbloqueada!');
  };

  // Handle puzzle victory reward
  const handlePuzzleWin = (reward: PuzzleReward) => {
    setInventory((prev) => ({
      ...prev,
      stars: prev.stars + reward.stars,
      coins: prev.coins + reward.coins,
    }));
    retroAudio.playSparkle();
    showToast(`🎉 Ganhou +${reward.stars} Estrelas e +${reward.coins} Glitter Coins!`);

    // Check Daily Quest: Puzzle task
    checkQuestProgress('puzzle');
  };

  // Open photo studio with screenshot
  const handleOpenPhotoStudio = (screenshotUrl?: string) => {
    setPhotoScreenshotUrl(screenshotUrl);
    setIsPhotoStudioOpen(true);

    // Check Daily Quest: Photo task
    checkQuestProgress('photo');
  };

  // Claim Daily Quest Reward
  const handleClaimDailyQuestReward = () => {
    if (!dailyQuest.isCompleted || dailyQuest.isClaimed) return;

    setInventory((prev) => ({
      ...prev,
      stars: prev.stars + dailyQuest.rewardStars,
      coins: prev.coins + dailyQuest.rewardCoins,
    }));

    setDailyQuest((prev) => ({
      ...prev,
      isClaimed: true,
    }));

    retroAudio.playFanfare();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#ffe600', '#ff007f', '#00f0ff', '#39ff14'],
    });

    showToast(`🎁 Recompensa Diária Coletada: +${dailyQuest.rewardStars} Estrelas e +${dailyQuest.rewardCoins} Coins!`);
  };

  // Handle claiming prize from Daily Spin
  const handleClaimSpinReward = (reward: SpinReward) => {
    const todayKey = getTodayDateKey();
    setInventory((prev) => {
      const newStars = reward.type === 'stars' ? prev.stars + (reward.amount || 0) : prev.stars;
      const newCoins = reward.type === 'coins' ? prev.coins + (reward.amount || 0) : prev.coins;
      const currentStickers = prev.unlockedStickers || [];
      const newStickers =
        reward.type === 'sticker' && reward.stickerSymbol && !currentStickers.includes(reward.stickerSymbol)
          ? [...currentStickers, reward.stickerSymbol]
          : currentStickers;

      return {
        ...prev,
        stars: newStars,
        coins: newCoins,
        unlockedStickers: newStickers,
        lastSpinDate: todayKey,
      };
    });

    retroAudio.playSparkle();
    if (reward.type === 'coins') {
      showToast(`🎰 Roleta da Sorte: +${reward.amount} Glitter Coins adicionadas!`);
    } else if (reward.type === 'stars') {
      showToast(`🎰 Roleta da Sorte: +${reward.amount} Estrelas de Reforma adicionadas!`);
    } else {
      showToast(`🎰 Roleta da Sorte: Adesivo Exclusivo ${reward.stickerSymbol} ${reward.stickerName} desbloqueado!`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0d091e] text-slate-100 overflow-x-hidden selection:bg-pink-500 selection:text-white">
      {/* Top Header Bar with Daily Quest & Daily Spin */}
      <Header
        currentRoomId={currentRoomId}
        onSelectRoom={(id) => {
          setCurrentRoomId(id);
          setActiveSlotToCustomize(null);
        }}
        inventory={inventory}
        dailyQuest={dailyQuest}
        isSpinAvailable={isDailySpinAvailable(inventory.lastSpinDate)}
        onOpenPuzzle={() => setIsPuzzleOpen(true)}
        onOpenDailyQuest={() => setIsDailyQuestOpen(true)}
        onOpenDailySpin={() => setIsDailySpinOpen(true)}
      />

      {/* Mode Switcher Banner: 3D Realtime vs 2D Concept */}
      <div className="w-full bg-slate-950/70 border-b border-white/10 px-4 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-pink-400 font-display font-semibold">MODO DE VISUALIZAÇÃO:</span>
          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-white/10">
            <button
              onClick={() => {
                retroAudio.playClick();
                setDisplayMode('3d');
              }}
              className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                displayMode === '3d'
                  ? 'bg-pink-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🎮 3D Espacial Interativo
            </button>
            <button
              onClick={() => {
                retroAudio.playClick();
                setDisplayMode('2d');
              }}
              className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                displayMode === '2d'
                  ? 'bg-pink-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🖼️ Conceito Ilustrado 2D
            </button>
          </div>
        </div>

        {/* Daily Features & Decorate Environment Quick Shortcuts */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Decorate Environment Button */}
          <button
            onClick={() => {
              retroAudio.playSparkle();
              const wallSlot = currentRoom.slots.find((s) => s.id === 'wall_surface') || currentRoom.slots[0];
              setActiveSlotToCustomize(wallSlot);
            }}
            className="flex items-center gap-1.5 text-xs text-yellow-300 hover:text-yellow-200 transition-all cursor-pointer bg-gradient-to-r from-pink-950/60 to-purple-950/60 border border-yellow-400/50 px-2.5 py-0.5 rounded-lg shadow-sm font-semibold hover:scale-105"
            title="Decorar Paredes e Pisos do Cômodo com Estampas e Texturas"
          >
            <span>🏡</span>
            <span>Decorar Ambiente</span>
          </button>

          {/* Daily Spin Shortcut */}
          <button
            onClick={() => {
              retroAudio.playClick();
              setIsDailySpinOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs text-pink-300 hover:text-pink-200 transition-colors cursor-pointer bg-pink-950/40 border border-pink-400/40 px-2.5 py-0.5 rounded-lg"
          >
            <span>🎰</span>
            <span className="font-semibold">Roleta da Sorte</span>
            {isDailySpinAvailable(inventory.lastSpinDate) ? (
              <span className="text-[10px] bg-pink-500 text-white px-1.5 rounded-full font-bold animate-pulse">
                GRÁTIS!
              </span>
            ) : (
              <span className="text-[10px] text-slate-400">Pronto</span>
            )}
          </button>

          {/* Daily Quest Teaser Banner in Header */}
          <button
            onClick={() => {
              retroAudio.playClick();
              setIsDailyQuestOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs text-yellow-300 hover:text-yellow-200 transition-colors cursor-pointer bg-yellow-950/40 border border-yellow-400/40 px-2.5 py-0.5 rounded-lg"
          >
            <span>{dailyQuest.badgeIcon}</span>
            <span className="font-semibold truncate max-w-[180px]">{dailyQuest.title}</span>
            <span className="font-bold font-mono">({dailyQuest.currentCount}/{dailyQuest.targetCount})</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        {displayMode === '3d' ? (
          <Room3DView
            room={currentRoom}
            inventory={inventory}
            selectedSlot={activeSlotToCustomize}
            onSelectSlot={(slot) => setActiveSlotToCustomize(slot)}
            onOpenPuzzle={() => setIsPuzzleOpen(true)}
            onOpenPhotoStudio={handleOpenPhotoStudio}
            viewMode={viewMode}
            onToggleViewMode={() => setViewMode((v) => (v === 'after' ? 'before' : 'after'))}
          />
        ) : (
          <RoomCanvas
            room={currentRoom}
            inventory={inventory}
            onSelectSlot={(slot) => setActiveSlotToCustomize(slot)}
            onOpenPuzzle={() => setIsPuzzleOpen(true)}
            onOpenPhotoStudio={() => handleOpenPhotoStudio()}
          />
        )}
      </main>

      {/* Retro Bottom Navigation & Music Bar */}
      <RetroPlayerBar
        rooms={rooms}
        currentRoomId={currentRoomId}
        onSelectRoom={(id) => {
          setCurrentRoomId(id);
          setActiveSlotToCustomize(null);
        }}
        onOpenPuzzle={() => setIsPuzzleOpen(true)}
      />

      {/* Slot Customizer Modal */}
      {activeSlotToCustomize && (
        <CustomizerModal
          slot={
            currentRoom.slots.find((s) => s.id === activeSlotToCustomize.id) ||
            activeSlotToCustomize
          }
          room={currentRoom}
          inventory={inventory}
          onClose={() => setActiveSlotToCustomize(null)}
          onRestore={handleRestoreSlot}
          onUpdateConfig={handleUpdateConfig}
          onUnlockColor={handleUnlockColor}
        />
      )}

      {/* Match-3 Puzzle Modal */}
      {isPuzzleOpen && (
        <PuzzleGame
          onClose={() => setIsPuzzleOpen(false)}
          onWin={handlePuzzleWin}
        />
      )}

      {/* Photo Studio / Magazine Cover Modal */}
      {isPhotoStudioOpen && (
        <PhotoStudio
          room={currentRoom}
          screenshotDataUrl={photoScreenshotUrl}
          onClose={() => {
            setIsPhotoStudioOpen(false);
            setPhotoScreenshotUrl(undefined);
          }}
        />
      )}

      {/* Daily Quest Modal Dialog */}
      {isDailyQuestOpen && (
        <DailyQuestModal
          quest={dailyQuest}
          onClaimReward={handleClaimDailyQuestReward}
          onClose={() => setIsDailyQuestOpen(false)}
          onNavigateToTask={() => {
            setIsDailyQuestOpen(false);
            if (dailyQuest.category === 'puzzle') {
              setIsPuzzleOpen(true);
            } else if (dailyQuest.category === 'photo') {
              handleOpenPhotoStudio();
            }
          }}
        />
      )}

      {/* Daily Spin Wheel Mini-Game Modal */}
      {isDailySpinOpen && (
        <DailySpinModal
          inventory={inventory}
          onClose={() => setIsDailySpinOpen(false)}
          onClaimReward={handleClaimSpinReward}
        />
      )}

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-50 bg-pink-900/95 border-2 border-pink-400 text-white px-4 py-2.5 rounded-xl shadow-2xl font-display text-sm tracking-wide animate-bounce flex items-center gap-2">
          <span>💖</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
