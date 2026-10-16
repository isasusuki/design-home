export type RoomId = 'bedroom' | 'living' | 'arcade';

export interface FurnitureOption {
  id: string;
  name: string;
  modelIcon: string;
  description: string;
}

export interface FurnitureSlot {
  id: string;
  name: string;
  category: 'furniture' | 'electronics' | 'lighting' | 'rug' | 'wall' | 'decor' | 'surface';
  isRestored: boolean;
  restoreCostStars: number;
  restoreCostCoins: number;
  selectedOptionId: string;
  selectedColor: string;
  selectedSticker: string | null;
  options: FurnitureOption[];
  pinPosition: { top: number; left: number };
  renderArea: { top: number; left: number; width: number; height: number };
  position3D: { x: number; y: number; z: number; rotationY?: number; scale?: number };
  defaultBeforeDesc: string;
  restoredDesc: string;
}

export interface RoomData {
  id: RoomId;
  name: string;
  eraSubtitle: string;
  themeDescription: string;
  bgImage: string;
  ambienceColor: string;
  slots: FurnitureSlot[];
}

export interface UserInventory {
  stars: number;
  coins: number;
  unlockedColors: string[];
  unlockedStickers?: string[];
  lastSpinDate?: string | null;
}

export interface SpinReward {
  id: string;
  type: 'coins' | 'stars' | 'sticker';
  amount?: number;
  stickerSymbol?: string;
  stickerName?: string;
  label: string;
  icon: string;
  color: string;
  textColor?: string;
}

export interface DailyQuest {
  id: string;
  dateKey: string;
  title: string;
  description: string;
  category: 'restore' | 'color' | 'sticker' | 'surface' | 'photo' | 'puzzle';
  targetCount: number;
  currentCount: number;
  rewardStars: number;
  rewardCoins: number;
  isCompleted: boolean;
  isClaimed: boolean;
  badgeIcon: string;
}

