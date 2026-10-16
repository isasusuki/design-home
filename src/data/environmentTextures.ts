export interface WallpaperTexture {
  id: string;
  name: string;
  icon: string;
  description: string;
  patternType: 'stars' | 'cheetah' | 'butterfly' | 'aero' | 'matrix' | 'flames' | 'stripes' | 'bubbles';
  defaultColor: string;
  eraTag: string;
}

export interface FlooringTexture {
  id: string;
  name: string;
  icon: string;
  description: string;
  patternType: 'parquet' | 'checkered' | 'carpet' | 'cyber' | 'daisy_tile' | 'hologram' | 'steel' | 'zebra';
  defaultColor: string;
  eraTag: string;
}

export const WALLPAPER_TEXTURES: WallpaperTexture[] = [
  {
    id: 'stars_wallpaper',
    name: 'Glitter Stars Y2K',
    icon: '⭐',
    description: 'Rosa chiclete brilhante estampado com estrelas cintilantes e purpurina.',
    patternType: 'stars',
    defaultColor: '#ff66b2',
    eraTag: 'Pop Teen 2000',
  },
  {
    id: 'cheetah_wallpaper',
    name: 'Oncinha McBling Pop',
    icon: '🐆',
    description: 'A clássica estampa de oncinha cor-de-rosa estilo Paris Hilton.',
    patternType: 'cheetah',
    defaultColor: '#ff1493',
    eraTag: 'McBling 2002',
  },
  {
    id: 'butterfly_wallpaper',
    name: 'Lilás com Borboletas',
    icon: '🦋',
    description: 'Fundo lilás pastel delicado com borboletas sonhadoras.',
    patternType: 'butterfly',
    defaultColor: '#c084fc',
    eraTag: 'Delia*s 2000',
  },
  {
    id: 'aero_wallpaper',
    name: 'Céu Frutiger Aero',
    icon: '☁️',
    description: 'Degradê azul celeste reluzente com nuvens sonhadoras e brilho de água.',
    patternType: 'aero',
    defaultColor: '#60a5fa',
    eraTag: 'Frutiger Aero 2004',
  },
  {
    id: 'matrix_wallpaper',
    name: 'Matrix Code Hacker',
    icon: '📟',
    description: 'Cascata de código binário verde fosforescente em fundo escuro.',
    patternType: 'matrix',
    defaultColor: '#22c55e',
    eraTag: 'Cyber 1999',
  },
  {
    id: 'flames_wallpaper',
    name: 'Chamas Hot Rod Punk',
    icon: '🔥',
    description: 'Labaredas de fogo radicais estilo skate, guitarras e carros tunados.',
    patternType: 'flames',
    defaultColor: '#ef4444',
    eraTag: 'Skater Punk 2001',
  },
  {
    id: 'stripes_wallpaper',
    name: 'Listras Candy Pop',
    icon: '🎀',
    description: 'Listras verticais em tons de rosa e branco vibrantes.',
    patternType: 'stripes',
    defaultColor: '#f472b6',
    eraTag: 'Teen Room 2003',
  },
  {
    id: 'bubbles_wallpaper',
    name: 'Bolhas Groovy 2000',
    icon: '🫧',
    description: 'Anéis concêntricos e círculos translúcidos no melhor estilo iMac.',
    patternType: 'bubbles',
    defaultColor: '#00f0ff',
    eraTag: 'Futuristic 2000',
  },
];

export const FLOORING_TEXTURES: FlooringTexture[] = [
  {
    id: 'parquet_floor',
    name: 'Parquet de Madeira Envernizado',
    icon: '🪵',
    description: 'Tacos de madeira polidos com encaixes e reflexo acetinado aconchegante.',
    patternType: 'parquet',
    defaultColor: '#e8b88a',
    eraTag: 'Clássico 2000',
  },
  {
    id: 'checkered_floor',
    name: 'Xadrez Pop Pink & Black',
    icon: '🏁',
    description: 'O lendário quadriculado pop punk que dominava clipes e quartos.',
    patternType: 'checkered',
    defaultColor: '#ff1493',
    eraTag: 'Pop Punk 2002',
  },
  {
    id: 'plush_carpet',
    name: 'Carpete Peludo Shaggy Lilás',
    icon: '🧶',
    description: 'Revestimento felpudo com textura espessa e macia de ponta a ponta.',
    patternType: 'carpet',
    defaultColor: '#d8b4fe',
    eraTag: 'Teen Loft 2000',
  },
  {
    id: 'cyber_grid_floor',
    name: 'Piso Cyber Grid Neon',
    icon: '⚡',
    description: 'Malha de linhas neon ciano e roxo reluzente sobre fundo escuro.',
    patternType: 'cyber',
    defaultColor: '#00f0ff',
    eraTag: 'Cyberpunk 2003',
  },
  {
    id: 'daisy_tile_floor',
    name: 'Mosaico de Margaridas',
    icon: '🌼',
    description: 'Ladrilhos geométricos com margaridas florais retrô.',
    patternType: 'daisy_tile',
    defaultColor: '#ffe600',
    eraTag: 'Groovy Pop 2000',
  },
  {
    id: 'hologram_floor',
    name: 'Azulejos Holográficos Gloss',
    icon: '💎',
    description: 'Pedra reflexiva brilhante com prismas iridescentes de luz.',
    patternType: 'hologram',
    defaultColor: '#93c5fd',
    eraTag: 'Frutiger Aero 2004',
  },
  {
    id: 'steel_floor',
    name: 'Aço Diamantado Arcade',
    icon: '🔩',
    description: 'Placas industriais de metal com relevo antiderrapante de fliperama.',
    patternType: 'steel',
    defaultColor: '#94a3b8',
    eraTag: 'Arcade 2001',
  },
  {
    id: 'zebra_floor',
    name: 'Zebra Elétrica Neon',
    icon: '🦓',
    description: 'Estampa de zebra vibrante com acabamento neon de alta energia.',
    patternType: 'zebra',
    defaultColor: '#00f0ff',
    eraTag: 'McBling 2000',
  },
];
