export interface ColorSwatch {
  name: string;
  hex: string;
  eraTag: string;
  costCoins: number;
}

export const RETRO_PALETTE: ColorSwatch[] = [
  { name: 'Rosa Choque Y2K', hex: '#ff1493', eraTag: 'McBling 2000', costCoins: 0 },
  { name: 'Ciano iMac Bondi', hex: '#00f0ff', eraTag: 'Y2K Tech', costCoins: 0 },
  { name: 'Roxo Elétrico Grape', hex: '#9d00ff', eraTag: 'Cyber 2000', costCoins: 0 },
  { name: 'Verde Limão Neon', hex: '#39ff14', eraTag: 'Arcade Pop', costCoins: 0 },
  { name: 'Amarelo Sol Pop', hex: '#ffe600', eraTag: 'Teen Summer', costCoins: 0 },
  { name: 'Tangerina Gel', hex: '#ff6b35', eraTag: 'Frutiger Aero', costCoins: 0 },
  { name: 'Prata Cromado Milênio', hex: '#d8e2dc', eraTag: 'Cyber Y2K', costCoins: 0 },
  { name: 'Preto Gloss Emo', hex: '#1e1b2e', eraTag: 'Skater Punk', costCoins: 0 },
  { name: 'Lilás Sonhador', hex: '#c084fc', eraTag: 'Delia*s Teen', costCoins: 40 },
  { name: 'Azul Bebê Celestial', hex: '#93c5fd', eraTag: 'Frutiger Aero', costCoins: 40 },
  { name: 'Vermelho Hot Rod', hex: '#ef4444', eraTag: 'Racer 2000', costCoins: 50 },
  { name: 'Dourado Glitter', hex: '#fbbf24', eraTag: 'Pop Diva', costCoins: 60 },
];

export const RETRO_STICKERS = [
  { id: 'butterfly', symbol: '🦋', name: 'Presilha Borboleta' },
  { id: 'heart', symbol: '💖', name: 'Coração Pixel' },
  { id: 'disc', symbol: '💿', name: 'Mini CD-R' },
  { id: 'star', symbol: '⭐', name: 'Estrela Glitter' },
  { id: 'flower', symbol: '🌸', name: 'Flor Margarida' },
  { id: 'fire', symbol: '🔥', name: 'Chama Hot Rod' },
  { id: 'alien', symbol: '👽', name: 'Alien Cyber' },
  { id: 'sparkles', symbol: '✨', name: 'Brilho Mágico' },
  { id: 'cherry', symbol: '🍒', name: 'Cerejinhas' },
  { id: 'bow', symbol: '🎀', name: 'Laço Rosa' },
  { id: 'phone', symbol: '📱', name: 'Flip Phone' },
  { id: 'game', symbol: '👾', name: 'Tamagotchi' },
  { id: 'crown', symbol: '👑', name: 'Coroa Diva Y2K (Exclusivo)' },
  { id: 'discoball', symbol: '🪩', name: 'Globo Espelhado (Exclusivo)' },
  { id: 'unicorn', symbol: '🦄', name: 'Unicórnio Mágico (Exclusivo)' },
];
