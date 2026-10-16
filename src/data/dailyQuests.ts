import { DailyQuest } from '../types/game';

export interface QuestTemplate {
  id: string;
  title: string;
  description: string;
  category: DailyQuest['category'];
  targetCount: number;
  rewardStars: number;
  rewardCoins: number;
  badgeIcon: string;
}

export const QUEST_TEMPLATES: QuestTemplate[] = [
  {
    id: 'quest_pink_decor',
    title: 'Vibes McBling: Toque Rosa Choque',
    description: 'Pinte qualquer móvel, parede ou piso com uma cor rosa ou roxa para trazer o glamour pop dos anos 2000!',
    category: 'color',
    targetCount: 1,
    rewardStars: 2,
    rewardCoins: 100,
    badgeIcon: '💖',
  },
  {
    id: 'quest_restore_piece',
    title: 'Reforma do Milênio: Renove 1 Móvel',
    description: 'Restaure qualquer móvel desgastado em qualquer cômodo para deixá-lo novo em folha no espaço 3D!',
    category: 'restore',
    targetCount: 1,
    rewardStars: 2,
    rewardCoins: 120,
    badgeIcon: '✨',
  },
  {
    id: 'quest_sticker_butterfly',
    title: 'Presilhas & Brilho: Cole um Adesivo Y2K',
    description: 'Personalize qualquer móvel adicionando um adesivo retrô nostálgico (borboleta, CD, coração, etc.)!',
    category: 'sticker',
    targetCount: 1,
    rewardStars: 2,
    rewardCoins: 90,
    badgeIcon: '🦋',
  },
  {
    id: 'quest_wallpaper_floor',
    title: 'Renovação Total: Mude a Parede ou o Piso',
    description: 'Altere a estampa ou cor do Papel de Parede ou do Revestimento do Piso para transformar o visual do cômodo!',
    category: 'surface',
    targetCount: 1,
    rewardStars: 2,
    rewardCoins: 110,
    badgeIcon: '🎨',
  },
  {
    id: 'quest_magazine_photo',
    title: 'Capa da Revista: Sessão Fotográfica',
    description: 'Abra o Estúdio Fotográfico para capturar uma foto 3D do seu cômodo e colocá-lo na capa de revista retrô!',
    category: 'photo',
    targetCount: 1,
    rewardStars: 2,
    rewardCoins: 100,
    badgeIcon: '📸',
  },
  {
    id: 'quest_puzzle_master',
    title: 'Glitter Pop: Vitória no Mini-Game',
    description: 'Complete uma rodada do Match-3 Glitter Pop coletando todos os símbolos obrigatórios do objetivo!',
    category: 'puzzle',
    targetCount: 1,
    rewardStars: 3,
    rewardCoins: 150,
    badgeIcon: '💿',
  },
  {
    id: 'quest_cyan_imac',
    title: 'Era iMac G3: Tecnologia Colorida',
    description: 'Pinte qualquer móvel, eletrônico ou detalhe com o tom Ciano iMac Bondi (#00f0ff) ou Verde Limão!',
    category: 'color',
    targetCount: 1,
    rewardStars: 2,
    rewardCoins: 100,
    badgeIcon: '🖥️',
  },
];

/**
 * Returns today's ISO date string (YYYY-MM-DD)
 */
export function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Generates or retrieves the Daily Quest for today
 */
export function getOrGenerateDailyQuest(savedQuest?: DailyQuest | null): DailyQuest {
  const todayKey = getTodayKey();

  // If saved quest is from today, keep it
  if (savedQuest && savedQuest.dateKey === todayKey) {
    return savedQuest;
  }

  // Generate deterministically from date key so it stays consistent for the current day
  let hash = 0;
  for (let i = 0; i < todayKey.length; i++) {
    hash = (hash * 31 + todayKey.charCodeAt(i)) & 0xffffffff;
  }
  const index = Math.abs(hash) % QUEST_TEMPLATES.length;
  const template = QUEST_TEMPLATES[index];

  return {
    id: `${template.id}_${todayKey}`,
    dateKey: todayKey,
    title: template.title,
    description: template.description,
    category: template.category,
    targetCount: template.targetCount,
    currentCount: 0,
    rewardStars: template.rewardStars,
    rewardCoins: template.rewardCoins,
    isCompleted: false,
    isClaimed: false,
    badgeIcon: template.badgeIcon,
  };
}

/**
 * Calculates remaining hours and minutes until midnight
 */
export function getTimeUntilMidnight(): string {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const diffMs = midnight.getTime() - now.getTime();

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}
