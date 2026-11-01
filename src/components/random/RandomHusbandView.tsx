import React, { useState } from 'react';
import { Sparkles, RefreshCw, ExternalLink, Heart, Share2, History, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Character, DrawRecord } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { soundManager } from '../../lib/sound';

interface RandomHusbandViewProps {
  characters: Character[];
  onOpenDetail: (character: Character) => void;
}

export const RandomHusbandView: React.FC<RandomHusbandViewProps> = ({
  characters,
  onOpenDetail
}) => {
  const { profile, toggleFavorite } = useAuth();
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [revealedChar, setRevealedChar] = useState<Character | null>(null);
  const [spinIndex, setSpinIndex] = useState<number>(0);
  const [drawHistory, setDrawHistory] = useState<DrawRecord[]>([]);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const eligibleChars = characters.filter((c) => c.isPublished);

  const handleStartDraw = () => {
    if (isSpinning || eligibleChars.length === 0) return;

    soundManager.playMagicChime();
    setIsSpinning(true);
    setRevealedChar(null);

    let counter = 0;
    const interval = setInterval(() => {
      soundManager.playWheelTick();
      setSpinIndex((prev) => (prev + 1) % eligibleChars.length);
      counter++;

      if (counter >= 18) {
        clearInterval(interval);
        const randomChar = eligibleChars[Math.floor(Math.random() * eligibleChars.length)];
        setRevealedChar(randomChar);
        setIsSpinning(false);

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        soundManager.playMagicChime();

        const newRecord: DrawRecord = {
          id: `draw-${Date.now()}`,
          userId: profile?.uid || 'guest',
          characterId: randomChar.id,
          characterName: randomChar.name,
          characterAvatar: randomChar.avatarUrl,
          drawnAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        setDrawHistory((prev) => [newRecord, ...prev.slice(0, 7)]);
      }
    }, 90);
  };

  const handleShare = () => {
    soundManager.playBoop();
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const currentCharSilhouette = eligibleChars[spinIndex] || eligibleChars[0];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-white/70 border border-white px-4 py-1.5 rounded-full mb-3 shadow-2xs">
          <Sparkles className="w-4 h-4 text-[#E2799F]" />
          <span className="text-xs font-bold text-[#E2799F] font-caption tracking-wider">
            CELESTIAL GACHA • DUYÊN PHẬN ĐỊNH MỆNH
          </span>
        </div>

        <h1 className="font-heading font-bold text-3xl md:text-5xl text-[#3F334D] mb-2 tracking-tight">
          BÉ CHỒNG HÔM NAY ♡
        </h1>
        <p className="text-xs md:text-sm text-[#7A6C88] max-w-md mx-auto font-luxury italic">
          Mỗi ngày một điều bất ngờ ngọt ngào. Hãy để duyên số dẫn lối bạn đến với chân ái định mệnh!
        </p>
      </div>

      {/* Main Mystery / Reveal Card - Luxury Frosted & Ethereal (No Mascot) */}
      <div className="glass-panel rounded-3xl border border-white p-6 md:p-10 shadow-xl text-center relative overflow-hidden bg-gradient-to-br from-[#FFF8FB]/80 via-white/80 to-[#FEF9EE]/80">
        {!revealedChar && !isSpinning ? (
          /* Mystery Idle State */
          <div className="flex flex-col items-center py-6">
            {/* Celestial Ethereal Orb */}
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#E0D3F8] via-[#FCE4EE] to-[#FEF5E7] p-[2.5px] shadow-lg animate-pulse mb-4">
              <div className="w-full h-full rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center">
                <span className="text-5xl">🔮</span>
              </div>
            </div>

            <h3 className="font-heading font-bold text-xl md:text-2xl text-[#3F334D] mt-2 mb-2">
              Chiếc Bé Nào Sẽ Thuộc Về Bạn Hôm Nay?
            </h3>
            <p className="text-xs text-[#7A6C88] max-w-sm mb-6 leading-relaxed font-luxury italic">
              Vòng xoay duyên phận sẽ chọn ngẫu nhiên 1 trong số các nhân vật đã tốt nghiệp lớp Mầm Non Rắn Con.
            </p>

            <button
              onClick={handleStartDraw}
              className="px-10 py-4 rounded-full bg-gradient-to-r from-[#EAE2F8] via-[#FDE4EE] to-[#FEF5E7] text-[#3F334D] font-bold text-base md:text-lg border border-white shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer font-heading"
            >
              BỐC MỘT BÉ DUYÊN PHẬN ♡
            </button>
          </div>
        ) : isSpinning ? (
          /* Spinning Lottery Silhouette Animation */
          <div className="flex flex-col items-center py-6">
            <div className="relative w-48 h-64 rounded-3xl overflow-hidden border-2 border-[#CBB8E8] shadow-2xl bg-[#EAE2F8]/60 flex items-center justify-center animate-pulse">
              <img
                src={currentCharSilhouette?.avatarUrl}
                alt="Silhouette"
                className="w-full h-full object-cover filter brightness-0 opacity-35 blur-xs transition-all duration-75"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl animate-spin">✨</span>
              </div>
            </div>

            <div className="font-heading font-bold text-lg text-[#3F334D] mt-6 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-[#8E75B2] animate-spin" />
              <span>Đang kết nối duyên số cùng các bé...</span>
            </div>
          </div>
        ) : (
          /* Revealed Character Card */
          revealedChar && (
            <div className="flex flex-col md:flex-row items-center gap-8 text-left py-2 animate-in zoom-in-95 duration-300">
              {/* Artwork */}
              <div className="relative w-56 md:w-64 aspect-3/4 rounded-3xl overflow-hidden border-2 border-white shadow-2xl shrink-0 group">
                <img
                  src={revealedChar.avatarUrl}
                  alt={revealedChar.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute top-3 left-3 bg-white/85 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#E2799F] border border-white">
                  {revealedChar.category}
                </div>
              </div>

              {/* Character Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8E75B2] mb-1 font-caption">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Duyên Phận Của Bạn Hôm Nay Là:</span>
                  </div>

                  <h2 className="font-heading font-bold text-2xl md:text-3xl text-[#3F334D]">
                    {revealedChar.name}
                  </h2>
                  <div className="text-xs text-[#7A6C88] mt-0.5 font-luxury italic">
                    Tác giả: <strong className="text-[#3F334D]">{revealedChar.creator}</strong>
                  </div>
                </div>

                <p className="text-xs md:text-sm text-[#4A3B53] leading-relaxed p-4 rounded-2xl bg-white/70 border border-white">
                  "{revealedChar.shortDescription}"
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {revealedChar.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold bg-white/70 text-[#4A3B53] px-3 py-0.5 rounded-full border border-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => onOpenDetail(revealedChar)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#9078B4] hover:bg-[#7E66A2] text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                  >
                    <span>Xem hồ sơ chi tiết</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={revealedChar.googleAiStudioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#3F334D] hover:bg-[#2F263B] text-white font-bold text-xs transition-all shadow-md"
                  >
                    <span>Google AI Studio</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => toggleFavorite(revealedChar.id)}
                    className="p-2.5 rounded-full bg-white text-[#E2799F] border border-white hover:bg-[#FFF0F5] transition-all cursor-pointer shadow-2xs"
                    title="Lưu vào mục yêu thích"
                  >
                    <Heart className="w-4 h-4 fill-[#E2799F]" />
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-2.5 rounded-full bg-white text-[#4A3B53] border border-white hover:bg-[#FFF0F5] transition-all cursor-pointer shadow-2xs"
                    title="Chia sẻ kết quả"
                  >
                    <Share2 className="w-4 h-4 text-[#8E75B2]" />
                  </button>

                  <button
                    onClick={handleStartDraw}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/80 hover:bg-white border border-white text-xs font-bold text-[#3F334D] transition-all cursor-pointer ml-auto"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#8E75B2]" />
                    <span>Bốc lại</span>
                  </button>
                </div>

                {copiedLink && (
                  <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-xl border border-emerald-200 inline-block">
                    Đã sao chép link chia sẻ kết quả!
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>

      {/* Draw History Section */}
      {drawHistory.length > 0 && (
        <div className="glass-panel rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-[#8E75B2]" />
            <h3 className="font-heading font-bold text-sm text-[#3F334D]">
              Lịch sử bốc gần đây của bạn
            </h3>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {drawHistory.map((rec) => (
              <div
                key={rec.id}
                className="flex items-center gap-2 p-2 rounded-2xl bg-white/70 border border-white shrink-0"
              >
                <img
                  src={rec.characterAvatar}
                  alt={rec.characterName}
                  className="w-8 h-8 rounded-full object-cover border border-[#D2C8F2]"
                />
                <div>
                  <div className="text-xs font-bold text-[#3F334D]">{rec.characterName}</div>
                  <div className="text-[10px] text-[#7A6C88]">Lúc {rec.drawnAt}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
