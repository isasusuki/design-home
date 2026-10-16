import { SpinReward } from '../types/game';

export const DAILY_SPIN_REWARDS: SpinReward[] = [
  {
    id: 'coins_150',
    type: 'coins',
    amount: 150,
    label: '150 Coins',
    icon: '🪙',
    color: '#ff007f', // Shock Pink
    textColor: '#ffffff',
  },
  {
    id: 'stars_2',
    type: 'stars',
    amount: 2,
    label: '2 Estrelas',
    icon: '⭐',
    color: '#00f0ff', // Cyan
    textColor: '#000000',
  },
  {
    id: 'sticker_crown',
    type: 'sticker',
    stickerSymbol: '👑',
    stickerName: 'Coroa Diva Y2K',
    label: 'Adesivo Coroa',
    icon: '👑',
    color: '#ffe600', // Bright Yellow
    textColor: '#000000',
  },
  {
    id: 'coins_300',
    type: 'coins',
    amount: 300,
    label: '300 Jackpot',
    icon: '💰',
    color: '#9d00ff', // Electric Purple
    textColor: '#ffffff',
  },
  {
    id: 'stars_3',
    type: 'stars',
    amount: 3,
    label: '3 Estrelas',
    icon: '✨',
    color: '#39ff14', // Lime Neon
    textColor: '#000000',
  },
  {
    id: 'sticker_discoball',
    type: 'sticker',
    stickerSymbol: '🪩',
    stickerName: 'Globo Espelhado Y2K',
    label: 'Adesivo Disco',
    icon: '🪩',
    color: '#d8e2dc', // Chrome Silver
    textColor: '#000000',
  },
  {
    id: 'coins_200',
    type: 'coins',
    amount: 200,
    label: '200 Coins',
    icon: '🪙',
    color: '#ff6b35', // Tangerine
    textColor: '#ffffff',
  },
  {
    id: 'sticker_unicorn',
    type: 'sticker',
    stickerSymbol: '🦄',
    stickerName: 'Unicórnio Mágico',
    label: 'Adesivo Uni',
    icon: '🦄',
    color: '#f43f5e', // Rose
    textColor: '#ffffff',
  },
];

export function getTodayDateKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isDailySpinAvailable(lastSpinDate?: string | null): boolean {
  if (!lastSpinDate) return true;
  return lastSpinDate !== getTodayDateKey();
}
