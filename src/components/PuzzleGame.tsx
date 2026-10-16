import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { retroAudio } from '../utils/audio';

export interface PuzzleReward {
  stars: number;
  coins: number;
}

interface PuzzleGameProps {
  onClose: () => void;
  onWin: (reward: PuzzleReward) => void;
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

type TileType = 'cd' | 'phone' | 'tamagotchi' | 'star' | 'butterfly' | 'heart';

interface Tile {
  id: string;
  type: TileType;
}

const TILE_INFO: Record<TileType, { symbol: string; name: string; color: string; bg: string }> = {
  phone: { symbol: '📱', name: 'Flip Phone', color: '#ff007f', bg: 'bg-pink-500/20 border-pink-400' },
  cd: { symbol: '💿', name: 'CD Rom', color: '#00f0ff', bg: 'bg-cyan-500/20 border-cyan-400' },
  tamagotchi: { symbol: '👾', name: 'Tamagotchi', color: '#39ff14', bg: 'bg-emerald-500/20 border-emerald-400' },
  star: { symbol: '⭐', name: 'Glitter Star', color: '#ffe600', bg: 'bg-amber-500/20 border-amber-400' },
  butterfly: { symbol: '🦋', name: 'Presilha', color: '#a855f7', bg: 'bg-purple-500/20 border-purple-400' },
  heart: { symbol: '💖', name: 'Coração', color: '#f43f5e', bg: 'bg-rose-500/20 border-rose-400' },
};

const TILE_TYPES: TileType[] = ['phone', 'cd', 'tamagotchi', 'star', 'butterfly', 'heart'];

interface DifficultyConfig {
  id: DifficultyLevel;
  name: string;
  badge: string;
  gridSize: number;
  moves: number;
  rewardStars: number;
  rewardCoins: number;
  description: string;
  goals: { type: TileType; needed: number }[];
  colorTheme: string;
  activeBtnStyle: string;
}

const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    id: 'easy',
    name: 'Fácil',
    badge: '6x6 · 25 Jogadas',
    gridSize: 6,
    moves: 25,
    rewardStars: 1,
    rewardCoins: 100,
    description: 'Tabuleiro 6x6 com mais movimentos. Ideal para relaxar e decorar sem pressa!',
    goals: [
      { type: 'phone', needed: 6 },
      { type: 'cd', needed: 6 },
    ],
    colorTheme: 'border-emerald-400 text-emerald-300',
    activeBtnStyle: 'bg-emerald-600 text-white border-emerald-300 shadow-md',
  },
  medium: {
    id: 'medium',
    name: 'Médio',
    badge: '7x7 · 20 Jogadas',
    gridSize: 7,
    moves: 20,
    rewardStars: 2,
    rewardCoins: 160,
    description: 'Tabuleiro 7x7 clássico. Equilíbrio nostálgico perfeito com ótimas recompensas!',
    goals: [
      { type: 'phone', needed: 8 },
      { type: 'cd', needed: 8 },
    ],
    colorTheme: 'border-yellow-400 text-yellow-300',
    activeBtnStyle: 'bg-yellow-500 text-black border-yellow-200 shadow-md font-bold',
  },
  hard: {
    id: 'hard',
    name: 'Difícil',
    badge: '8x8 · 16 Jogadas',
    gridSize: 8,
    moves: 16,
    rewardStars: 3,
    rewardCoins: 250,
    description: 'Tabuleiro 8x8 desafiador com 3 objetivos! Ganhe o triplo de estrelas e muitas moedas!',
    goals: [
      { type: 'phone', needed: 9 },
      { type: 'cd', needed: 9 },
      { type: 'star', needed: 6 },
    ],
    colorTheme: 'border-rose-400 text-rose-300',
    activeBtnStyle: 'bg-rose-600 text-white border-rose-300 shadow-md',
  },
};

export const PuzzleGame: React.FC<PuzzleGameProps> = ({ onClose, onWin }) => {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const currentConfig = DIFFICULTY_CONFIGS[difficulty];
  const gridSize = currentConfig.gridSize;

  const [board, setBoard] = useState<Tile[][]>([]);
  const [selectedPos, setSelectedPos] = useState<{ r: number; c: number } | null>(null);
  const [invalidShakePair, setInvalidShakePair] = useState<{ r1: number; c1: number; r2: number; c2: number } | null>(null);
  const [movesLeft, setMovesLeft] = useState(currentConfig.moves);
  const [score, setScore] = useState(0);

  // Objectives based on difficulty
  const [targetGoals, setTargetGoals] = useState<{ type: TileType; needed: number; current: number }[]>(() =>
    currentConfig.goals.map((g) => ({ ...g, current: 0 }))
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [comboCount, setComboCount] = useState(0);
  const [popNotification, setPopNotification] = useState<string | null>(null);

  // Generate unique ID safely
  const createTile = (type: TileType): Tile => ({
    id: `t_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type,
  });

  // Initialize random board without initial 3-in-a-rows
  const createInitialBoard = useCallback((size: number): Tile[][] => {
    const newBoard: Tile[][] = [];
    for (let r = 0; r < size; r++) {
      const row: Tile[] = [];
      for (let c = 0; c < size; c++) {
        const availableTypes = TILE_TYPES.filter((t) => {
          const matchH = c >= 2 && row[c - 1]?.type === t && row[c - 2]?.type === t;
          const matchV = r >= 2 && newBoard[r - 1]?.[c]?.type === t && newBoard[r - 2]?.[c]?.type === t;
          return !matchH && !matchV;
        });
        const chosen = availableTypes[Math.floor(Math.random() * availableTypes.length)] || 'phone';
        row.push(createTile(chosen));
      }
      newBoard.push(row);
    }
    return newBoard;
  }, []);

  // Reset or switch difficulty
  const handleSelectDifficulty = (level: DifficultyLevel) => {
    if (isProcessing) return;
    retroAudio.playClick();
    const cfg = DIFFICULTY_CONFIGS[level];
    setDifficulty(level);
    setBoard(createInitialBoard(cfg.gridSize));
    setMovesLeft(cfg.moves);
    setScore(0);
    setTargetGoals(cfg.goals.map((g) => ({ ...g, current: 0 })));
    setSelectedPos(null);
    setInvalidShakePair(null);
    setGameStatus('playing');
  };

  useEffect(() => {
    setBoard(createInitialBoard(currentConfig.gridSize));
  }, [currentConfig.gridSize, createInitialBoard]);

  // Check 3+ matches horizontally & vertically
  const findMatches = (currentBoard: Tile[][], size: number): { r: number; c: number }[] => {
    const matchedCoords = new Set<string>();

    // Horizontal check
    for (let r = 0; r < size; r++) {
      let matchLen = 1;
      for (let c = 1; c < size; c++) {
        if (currentBoard[r][c]?.type && currentBoard[r][c].type === currentBoard[r][c - 1]?.type) {
          matchLen++;
        } else {
          if (matchLen >= 3) {
            for (let k = 0; k < matchLen; k++) {
              matchedCoords.add(`${r},${c - 1 - k}`);
            }
          }
          matchLen = 1;
        }
      }
      if (matchLen >= 3) {
        for (let k = 0; k < matchLen; k++) {
          matchedCoords.add(`${r},${size - 1 - k}`);
        }
      }
    }

    // Vertical check
    for (let c = 0; c < size; c++) {
      let matchLen = 1;
      for (let r = 1; r < size; r++) {
        if (currentBoard[r][c]?.type && currentBoard[r][c].type === currentBoard[r - 1][c]?.type) {
          matchLen++;
        } else {
          if (matchLen >= 3) {
            for (let k = 0; k < matchLen; k++) {
              matchedCoords.add(`${r - 1 - k},${c}`);
            }
          }
          matchLen = 1;
        }
      }
      if (matchLen >= 3) {
        for (let k = 0; k < matchLen; k++) {
          matchedCoords.add(`${size - 1 - k},${c}`);
        }
      }
    }

    return Array.from(matchedCoords).map((coord) => {
      const [r, c] = coord.split(',').map(Number);
      return { r, c };
    });
  };

  // Process cascading & matches
  const processMatches = async (boardToProcess: Tile[][], currentCombo = 0) => {
    setIsProcessing(true);
    const matches = findMatches(boardToProcess, gridSize);

    if (matches.length === 0) {
      setIsProcessing(false);
      setComboCount(0);
      return;
    }

    retroAudio.playPop();
    const combo = currentCombo + 1;
    setComboCount(combo);

    // Track which target objective types were collected in this match!
    const gatheredTypes: Record<string, number> = {};
    matches.forEach(({ r, c }) => {
      const t = boardToProcess[r][c].type;
      gatheredTypes[t] = (gatheredTypes[t] || 0) + 1;
    });

    // Check if any objective symbol was collected
    let objectiveCollectedNotice = '';
    targetGoals.forEach((goal) => {
      if (gatheredTypes[goal.type]) {
        objectiveCollectedNotice = `+${gatheredTypes[goal.type]} ${TILE_INFO[goal.type].symbol} Objetivo!`;
      }
    });

    if (objectiveCollectedNotice) {
      setPopNotification(objectiveCollectedNotice);
      setTimeout(() => setPopNotification(null), 1400);
    }

    // Update Objectives strictly
    setTargetGoals((prev) =>
      prev.map((goal) => ({
        ...goal,
        current: Math.min(goal.needed, goal.current + (gatheredTypes[goal.type] || 0)),
      }))
    );

    setScore((s) => s + matches.length * 20 * combo);

    // Remove matched tiles
    const newBoard = boardToProcess.map((row) => [...row]);
    matches.forEach(({ r, c }) => {
      // @ts-expect-error null marker
      newBoard[r][c] = null;
    });

    await new Promise((res) => setTimeout(res, 180));

    // Fall down
    for (let c = 0; c < gridSize; c++) {
      const colTiles: Tile[] = [];
      for (let r = 0; r < gridSize; r++) {
        if (newBoard[r][c] !== null) {
          colTiles.push(newBoard[r][c]);
        }
      }
      const missing = gridSize - colTiles.length;
      for (let i = 0; i < missing; i++) {
        const randomType = TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];
        colTiles.unshift(createTile(randomType));
      }
      for (let r = 0; r < gridSize; r++) {
        newBoard[r][c] = colTiles[r];
      }
    }

    setBoard(newBoard);
    await new Promise((res) => setTimeout(res, 200));

    // Recursive cascade check
    await processMatches(newBoard, combo);
  };

  // Check victory / game over
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    // RULE: To win, player MUST collect all required objective symbols!
    const allGoalsMet = targetGoals.every((g) => g.current >= g.needed);

    if (allGoalsMet) {
      setGameStatus('won');
      retroAudio.playFanfare();
      confetti({
        particleCount: 100,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#ff007f', '#00f0ff', '#ffe600', '#9d00ff', '#39ff14'],
      });
    } else if (movesLeft <= 0 && !isProcessing) {
      setGameStatus('lost');
    }
  }, [movesLeft, targetGoals, isProcessing, gameStatus]);

  // Handle Tile Click / Swap
  const handleTileClick = async (r: number, c: number) => {
    if (isProcessing || gameStatus !== 'playing') return;
    retroAudio.playClick();

    // If nothing selected yet, select this tile
    if (!selectedPos) {
      setSelectedPos({ r, c });
      return;
    }

    const { r: prevR, c: prevC } = selectedPos;

    // Clicking same tile cancels selection
    if (prevR === r && prevC === c) {
      setSelectedPos(null);
      return;
    }

    const isAdjacent = Math.abs(prevR - r) + Math.abs(prevC - c) === 1;

    // If not adjacent, just switch selection to the new clicked tile
    if (!isAdjacent) {
      setSelectedPos({ r, c });
      return;
    }

    // ADJACENT SWAP ATTEMPT
    setSelectedPos(null);
    setIsProcessing(true);

    // Deep clone the original board state
    const originalBoard: Tile[][] = board.map((row) =>
      row.map((cell) => ({ id: cell.id, type: cell.type }))
    );

    // Create swapped board
    const swappedBoard: Tile[][] = board.map((row) =>
      row.map((cell) => ({ id: cell.id, type: cell.type }))
    );

    const tempTile = swappedBoard[prevR][prevC];
    swappedBoard[prevR][prevC] = swappedBoard[r][c];
    swappedBoard[r][c] = tempTile;

    const matches = findMatches(swappedBoard, gridSize);

    if (matches.length > 0) {
      // VALID SWAP! Matches found!
      setBoard(swappedBoard);
      setMovesLeft((m) => Math.max(0, m - 1));
      await processMatches(swappedBoard, 0);
    } else {
      // INVALID SWAP: No 3-in-a-row formed!
      setInvalidShakePair({ r1: prevR, c1: prevC, r2: r, c2: c });
      retroAudio.playClick();

      // Show brief swapped state
      setBoard(swappedBoard);
      await new Promise((res) => setTimeout(res, 220));

      // Revert cleanly back to original untouched board
      setBoard(originalBoard);
      setInvalidShakePair(null);
      setIsProcessing(false);
    }
  };

  const handleClaimWin = () => {
    retroAudio.playSparkle();
    onWin({
      stars: currentConfig.rewardStars,
      coins: currentConfig.rewardCoins,
    });
    onClose();
  };

  const handleRestart = () => {
    handleSelectDifficulty(difficulty);
  };

  // Determine cell sizing based on grid size
  const getCellSizeClass = () => {
    if (gridSize === 6) return 'w-11 h-11 sm:w-13 sm:h-13 text-2xl sm:text-3xl';
    if (gridSize === 7) return 'w-9 h-9 sm:w-11 sm:h-11 text-xl sm:text-2xl';
    return 'w-8 h-8 sm:w-9 sm:h-9 text-lg sm:text-xl';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-xl y2k-glass-panel rounded-2xl border-4 border-pink-400 p-4 sm:p-5 shadow-2xl relative overflow-hidden flex flex-col max-h-[96vh]">
        {/* Title Bar */}
        <div className="flex items-center justify-between border-b-2 border-pink-400/40 pb-2.5 mb-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">💿</span>
            <span className="font-display tracking-wider text-xl text-pink-300 drop-shadow">
              GLITTER POP MATCH-3
            </span>
            <span className="text-[11px] font-mono text-cyan-300 border border-cyan-400/40 px-2 py-0.5 rounded">
              ANOS 2000
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-pink-600/80 hover:bg-pink-500 border border-white/60 text-white font-bold flex items-center justify-center cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Difficulty Level Selector Bar */}
        <div className="mb-2.5 shrink-0 bg-slate-900/90 p-1.5 rounded-xl border border-white/10 flex items-center justify-between gap-1 sm:gap-2">
          <span className="text-[11px] font-bold text-pink-300 px-1 hidden sm:inline">
            Dificuldade:
          </span>
          <div className="flex items-center gap-1.5 flex-1">
            {(Object.keys(DIFFICULTY_CONFIGS) as DifficultyLevel[]).map((level) => {
              const cfg = DIFFICULTY_CONFIGS[level];
              const isSelected = difficulty === level;
              return (
                <button
                  key={level}
                  onClick={() => handleSelectDifficulty(level)}
                  disabled={isProcessing}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs transition-all cursor-pointer flex flex-col items-center justify-center ${
                    isSelected
                      ? cfg.activeBtnStyle
                      : 'bg-slate-800/60 border border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="font-bold font-display">{cfg.name}</span>
                  <span className="text-[10px] opacity-90 hidden sm:inline">
                    ⭐+{cfg.rewardStars} · 🪙+{cfg.rewardCoins}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* HUD: Objectives Mandatory to Win */}
        <div className="bg-slate-900/80 p-2.5 sm:p-3 rounded-xl border-2 border-yellow-400/40 mb-2.5 shadow-inner shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs text-yellow-300 font-bold">
              <span>🎯</span>
              <span>OBJETIVOS ({currentConfig.name.toUpperCase()}):</span>
            </div>
            <div className="text-[11px] text-slate-300 flex items-center gap-2">
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded border border-white/10">
                Grade: {gridSize}x{gridSize}
              </span>
              <span>
                Jogadas:{' '}
                <span
                  className={`font-bold tabular-nums text-sm ${
                    movesLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-yellow-400'
                  }`}
                >
                  {movesLeft}
                </span>
              </span>
            </div>
          </div>

          <div className={`grid gap-2 ${targetGoals.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {targetGoals.map((g) => {
              const info = TILE_INFO[g.type];
              const isDone = g.current >= g.needed;
              return (
                <div
                  key={g.type}
                  className={`flex items-center justify-between p-1.5 sm:p-2 rounded-lg border-2 transition-all ${
                    isDone
                      ? 'bg-emerald-950/60 border-emerald-400'
                      : 'bg-black/50 border-pink-400/60'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl sm:text-2xl drop-shadow">{info.symbol}</span>
                    <span className="text-[11px] font-bold text-white hidden sm:inline">
                      {info.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-display text-sm sm:text-base tabular-nums ${
                        isDone ? 'text-emerald-400' : 'text-yellow-300'
                      }`}
                    >
                      {g.current}/{g.needed}
                    </div>
                    <div className="text-[9px] text-slate-400">
                      {isDone ? 'OK ✓' : 'Faltam ' + (g.needed - g.current)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Objective Feedback Notice */}
        {popNotification && (
          <div className="text-center font-display text-yellow-300 text-xs tracking-wider animate-bounce mb-1">
            ✨ {popNotification} ✨
          </div>
        )}

        {/* Game Grid Container */}
        <div className="bg-slate-950/90 p-2 sm:p-3 rounded-xl border-2 border-pink-500/40 shadow-inner flex flex-col items-center justify-center flex-1 overflow-auto">
          <div
            className="grid gap-1 sm:gap-1.5 select-none"
            style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
          >
            {board.map((row, r) =>
              row.map((tile, c) => {
                const isSelected = selectedPos?.r === r && selectedPos?.c === c;
                const isInvalidShake =
                  invalidShakePair &&
                  ((invalidShakePair.r1 === r && invalidShakePair.c1 === c) ||
                    (invalidShakePair.r2 === r && invalidShakePair.c2 === c));
                const isObjectiveTile = targetGoals.some(
                  (g) => g.type === tile.type && g.current < g.needed
                );
                const info = TILE_INFO[tile.type];

                return (
                  <button
                    key={`grid_cell_${r}_${c}_${tile.id}`}
                    onClick={() => handleTileClick(r, c)}
                    disabled={isProcessing || gameStatus !== 'playing'}
                    className={`${getCellSizeClass()} rounded-xl flex items-center justify-center transition-all duration-150 relative cursor-pointer
                      ${info.bg} border-2
                      ${
                        isSelected
                          ? 'scale-110 ring-4 ring-yellow-400 z-10 brightness-125 animate-pulse'
                          : 'hover:scale-105 active:scale-95'
                      }
                      ${isInvalidShake ? 'border-rose-500 animate-wiggle' : ''}
                      ${isObjectiveTile ? 'shadow-[0_0_8px_rgba(255,230,0,0.5)]' : ''}
                    `}
                    style={{
                      textShadow: '0 2px 6px rgba(0,0,0,0.6)',
                    }}
                  >
                    <span>{info.symbol}</span>
                    {/* Golden dot indicator for objective tiles */}
                    {isObjectiveTile && (
                      <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-yellow-400 shadow-sm" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Victory Screen Modal */}
        {gameStatus === 'won' && (
          <div className="absolute inset-0 bg-slate-950/94 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="text-5xl mb-2 animate-bounce">💖✨👑</div>
            <h3 className="font-display text-2xl sm:text-3xl text-pink-400 drop-shadow mb-1">
              OBJETIVOS CONCLUÍDOS!
            </h3>
            <span className="text-xs font-bold text-yellow-300 bg-yellow-950/60 border border-yellow-400/40 px-3 py-1 rounded-full mb-3">
              Modo {currentConfig.name} ({gridSize}x{gridSize}) Superado!
            </span>
            <p className="text-slate-200 text-xs sm:text-sm max-w-sm mb-4">
              Você coletou todos os símbolos dos anos 2000 necessários e garantiu seus recursos de reforma!
            </p>
            <div className="flex items-center gap-4 bg-pink-950/50 border-2 border-pink-400/50 px-6 py-3 rounded-2xl mb-6 shadow-xl">
              <div className="flex items-center gap-2">
                <span className="text-3xl">⭐</span>
                <div className="text-left">
                  <div className="text-xs text-pink-300 font-bold">
                    +{currentConfig.rewardStars} ESTRELAS
                  </div>
                  <div className="text-[11px] text-slate-400">P/ reformas e móveis</div>
                </div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="flex items-center gap-2">
                <span className="text-3xl">🪙</span>
                <div className="text-left">
                  <div className="text-xs text-yellow-300 font-bold">
                    +{currentConfig.rewardCoins} COINS
                  </div>
                  <div className="text-[11px] text-slate-400">P/ cores e paredes</div>
                </div>
              </div>
            </div>
            <button
              onClick={handleClaimWin}
              className="y2k-btn-primary px-8 py-3 rounded-xl font-display text-base sm:text-lg tracking-wider cursor-pointer"
            >
              COLETAR E MOBILIAR! ✨
            </button>
          </div>
        )}

        {/* Loss Screen Modal */}
        {gameStatus === 'lost' && (
          <div className="absolute inset-0 bg-slate-950/94 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="text-4xl mb-2">💔</div>
            <h3 className="font-display text-2xl text-rose-400 drop-shadow mb-1">
              MOVIMENTOS ESGOTADOS!
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xs mb-4">
              Você não coletou todos os símbolos do objetivo a tempo no modo {currentConfig.name}. Tente novamente ou escolha o modo Fácil para treinar!
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRestart}
                className="y2k-btn-cyan px-5 py-2.5 rounded-xl font-display text-xs sm:text-sm tracking-wider cursor-pointer"
              >
                TENTAR DE NOVO ↺
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs sm:text-sm text-slate-400 hover:text-white transition-colors"
              >
                Voltar à Casa
              </button>
            </div>
          </div>
        )}

        {/* Footer Info & Actions */}
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
            <span>Símbolos com ponto dourado são objetivos obrigatórios.</span>
          </span>
          <button
            onClick={handleRestart}
            className="text-pink-400 hover:text-pink-300 hover:underline cursor-pointer font-medium"
          >
            Reiniciar Tabuleiro
          </button>
        </div>
      </div>
    </div>
  );
};
