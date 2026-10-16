import React, { useState, useRef } from 'react';
import { RoomData } from '../types/game';
import { retroAudio } from '../utils/audio';

interface PhotoStudioProps {
  room: RoomData;
  screenshotDataUrl?: string;
  onClose: () => void;
}

type CoverTemplate = 'pop_magazine' | 'cyber_gamer' | 'cd_album' | 'delias_catalog';

const TEMPLATES: Record<
  CoverTemplate,
  { name: string; headline: string; subhead: string; banner: string; style: string; badge: string }
> = {
  pop_magazine: {
    name: 'Revista Pop 2000',
    headline: 'O QUARTO DOS SONHOS!',
    subhead: 'Tudo sobre estampas de oncinha, lava lamps & o novo hit do verão!',
    banner: 'EDIÇÃO DE COLECIONADOR · R$ 3,90',
    style: 'border-pink-500 text-pink-400',
    badge: 'TOP 10 Y2K',
  },
  cyber_gamer: {
    name: 'Cyber Zone 2003',
    headline: 'ULTRA SETUP 128-BIT',
    subhead: 'Como montar o refúgio gamer definitivo com iMac e neon translúcido!',
    banner: 'ANO 4 · N° 42 · GUIA SECRETO DE CÓDIGOS',
    style: 'border-cyan-400 text-cyan-300',
    badge: 'SPECIAL GAMER',
  },
  cd_album: {
    name: 'Capa de CD Digipack',
    headline: 'SUMMER NOSTALGIA HITS',
    subhead: 'Faixas exclusivas gravadas direto do rádio em fita K7 e MP3!',
    banner: 'COMPACT DISC DIGITAL AUDIO · STEREO',
    style: 'border-purple-400 text-purple-300',
    badge: 'HITS DO MILÊNIO',
  },
  delias_catalog: {
    name: 'Catálogo Teen Dreamz',
    headline: 'COLEÇÃO QUARTO RETRÔ',
    subhead: 'Móveis infláveis, tapetes de margarida e tudo o que você precisa.',
    banner: 'CATÁLOGO PRIMAVERA 2001 · DISK ENTREGA',
    style: 'border-yellow-400 text-yellow-300',
    badge: 'NOVA TENDÊNCIA',
  },
};

export const PhotoStudio: React.FC<PhotoStudioProps> = ({ room, screenshotDataUrl, onClose }) => {
  const [template, setTemplate] = useState<CoverTemplate>('pop_magazine');
  const [customHeadline, setCustomHeadline] = useState(TEMPLATES.pop_magazine.headline);
  const [customAuthor, setCustomAuthor] = useState('Por: Decoradora Y2K');
  const [filterStyle, setFilterStyle] = useState<'vintage' | 'vibrant' | 'chrome' | 'sparkle'>('vibrant');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeTpl = TEMPLATES[template];
  const imageSource = screenshotDataUrl || room.bgImage;

  const handleTemplateChange = (tpl: CoverTemplate) => {
    retroAudio.playClick();
    setTemplate(tpl);
    setCustomHeadline(TEMPLATES[tpl].headline);
  };

  const handleDownload = () => {
    retroAudio.playCamera();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSource;
    img.onload = () => {
      canvas.width = 1200;
      canvas.height = 800;

      // Draw room photo
      ctx.drawImage(img, 0, 0, 1200, 800);

      // Gradient Vignette
      const grad = ctx.createLinearGradient(0, 0, 0, 800);
      grad.addColorStop(0, 'rgba(0,0,0,0.6)');
      grad.addColorStop(0.3, 'rgba(0,0,0,0.1)');
      grad.addColorStop(0.7, 'rgba(0,0,0,0.2)');
      grad.addColorStop(1, 'rgba(0,0,0,0.7)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 800);

      // Top Title Bar
      ctx.font = 'bold 54px Righteous, sans-serif';
      ctx.fillStyle = template === 'cyber_gamer' ? '#00f0ff' : '#ff007f';
      ctx.fillText(activeTpl.name.toUpperCase(), 50, 70);

      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(activeTpl.banner, 50, 105);

      // Main Headline
      ctx.font = 'bold 64px Fredoka, sans-serif';
      ctx.fillStyle = '#ffe600';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 12;
      ctx.fillText(customHeadline, 50, 680);

      // Subhead & Author
      ctx.font = '26px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(activeTpl.subhead, 50, 725);
      ctx.fillText(customAuthor + ' · Anos 2000', 50, 760);

      // Barcode
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(1030, 680, 120, 70);
      ctx.fillStyle = '#000000';
      ctx.font = '14px monospace';
      ctx.fillText('||| | |||| | |||', 1035, 725);

      // Download trigger
      const link = document.createElement('a');
      link.download = `y2k_revista_${room.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-3xl y2k-glass-panel rounded-2xl border-4 border-pink-400 p-5 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-pink-400/40 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📸</span>
            <div>
              <h3 className="font-display text-xl text-pink-300">
                ESTÚDIO FOTOGRÁFICO Y2K
              </h3>
              <p className="text-xs text-slate-300">
                Transforme seu cômodo decorado em uma capa clássica de revista dos anos 2000!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-pink-600/80 hover:bg-pink-500 border border-white/60 text-white font-bold flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Magazine Preview Frame */}
        <div className="relative aspect-16/9 w-full rounded-xl overflow-hidden border-2 border-pink-400/60 shadow-xl mb-4 bg-slate-900 group">
          <img
            src={imageSource}
            alt={room.name}
            className={`w-full h-full object-cover transition-all ${
              filterStyle === 'vintage' ? 'sepia-50 contrast-90 brightness-95' : ''
            } ${filterStyle === 'chrome' ? 'contrast-125 saturate-150' : ''}`}
            referrerPolicy="no-referrer"
          />

          {/* Magazine Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60 p-4 sm:p-6 flex flex-col justify-between pointer-events-none">
            {/* Top Bar */}
            <div className="flex items-start justify-between">
              <div>
                <div className="font-display text-2xl sm:text-3xl text-pink-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wider">
                  {activeTpl.name.toUpperCase()}
                </div>
                <div className="text-[10px] sm:text-xs text-white/90 font-mono tracking-widest mt-0.5">
                  {activeTpl.banner}
                </div>
              </div>
              <div className="bg-yellow-400 text-black font-display text-[10px] sm:text-xs px-2.5 py-1 rounded-full shadow-lg font-bold">
                {activeTpl.badge}
              </div>
            </div>

            {/* Bottom Headlines */}
            <div className="flex items-end justify-between">
              <div className="max-w-md">
                <div className="font-display text-xl sm:text-2xl text-yellow-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-tight">
                  {customHeadline}
                </div>
                <div className="text-xs text-white drop-shadow mt-1 line-clamp-1">
                  {activeTpl.subhead}
                </div>
                <div className="text-[11px] text-cyan-300 font-semibold mt-1">
                  {customAuthor} · {room.name}
                </div>
              </div>

              {/* Barcode */}
              <div className="hidden sm:block bg-white text-black p-1.5 rounded shadow text-center font-mono text-[9px]">
                <div className="tracking-tighter">||| | |||| | ||||| | |||</div>
                <div className="text-[8px]">0 2000 987654</div>
              </div>
            </div>
          </div>
        </div>

        {/* Customization Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-slate-300 font-semibold block mb-1">
              Estilo da Revista:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(TEMPLATES) as CoverTemplate[]).map((tplKey) => (
                <button
                  key={tplKey}
                  onClick={() => handleTemplateChange(tplKey)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold text-left border transition-all cursor-pointer ${
                    template === tplKey
                      ? 'bg-pink-600 text-white border-white'
                      : 'bg-slate-900/60 border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  {TEMPLATES[tplKey].name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-semibold block mb-1">
              Manchete Principal:
            </label>
            <input
              type="text"
              value={customHeadline}
              onChange={(e) => setCustomHeadline(e.target.value)}
              className="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-400"
              maxLength={40}
            />

            <label className="text-xs text-slate-300 font-semibold block mt-2 mb-1">
              Crédito / Autor:
            </label>
            <input
              type="text"
              value={customAuthor}
              onChange={(e) => setCustomAuthor(e.target.value)}
              className="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-400"
              maxLength={30}
            />
          </div>
        </div>

        {/* Hidden Canvas for High-Res Export */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Footer */}
        <div className="flex items-center justify-between border-t-2 border-pink-400/30 pt-3 mt-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filtro:</span>
            <button
              onClick={() => setFilterStyle('vibrant')}
              className={`text-xs px-2 py-0.5 rounded cursor-pointer ${filterStyle === 'vibrant' ? 'bg-pink-500 text-white' : 'text-slate-400'}`}
            >
              Vibrante
            </button>
            <button
              onClick={() => setFilterStyle('vintage')}
              className={`text-xs px-2 py-0.5 rounded cursor-pointer ${filterStyle === 'vintage' ? 'bg-pink-500 text-white' : 'text-slate-400'}`}
            >
              Vintage 2000
            </button>
            <button
              onClick={() => setFilterStyle('chrome')}
              className={`text-xs px-2 py-0.5 rounded cursor-pointer ${filterStyle === 'chrome' ? 'bg-pink-500 text-white' : 'text-slate-400'}`}
            >
              Cyber Saturation
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-xs text-slate-300 hover:text-white px-3 py-2 cursor-pointer"
            >
              Voltar
            </button>
            <button
              onClick={handleDownload}
              className="y2k-btn-primary px-5 py-2 rounded-xl font-display text-sm tracking-wide flex items-center gap-1.5 cursor-pointer"
            >
              <span>💾</span>
              <span>BAIXAR CAPA (PNG)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
