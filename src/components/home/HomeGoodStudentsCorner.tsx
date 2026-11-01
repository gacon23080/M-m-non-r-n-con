import React from 'react';
import { Trophy, Sparkles, Flame, Crown, Star, Flower2 } from 'lucide-react';
import { Character } from '../../types';
import { soundManager } from '../../lib/sound';

interface HomeGoodStudentsCornerProps {
  characters: Character[];
  onOpenDetail: (character: Character) => void;
  onOpenRanking: () => void;
  onOpenRandom: () => void;
  onSelectTag: (tag: string) => void;
}

export const HomeGoodStudentsCorner: React.FC<HomeGoodStudentsCornerProps> = ({
  characters,
  onOpenDetail,
  onOpenRanking,
  onOpenRandom,
  onSelectTag
}) => {
  const topWeekly = [...characters]
    .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
    .slice(0, 3);

  const popularTags = [
    '#Tsundere',
    '#GoldenRetriever',
    '#CEO',
    '#Historical',
    '#Fantasy',
    '#Chibi',
    '#SchoolLife',
    '#ColdMaleLead',
    '#Romance'
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Bảng xếp hạng bé chồng (Top 3 Preview) */}
      <div className="glass-panel rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-black/5 mb-3">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h3 className="font-heading font-bold text-sm text-[#3F334D]">
              Bảng xếp hạng bé chồng
            </h3>
          </div>
          <button
            onClick={() => {
              soundManager.playBoop();
              onOpenRanking();
            }}
            className="text-[11px] font-bold text-[#8E75B2] hover:underline cursor-pointer"
          >
            Xem BXH &rarr;
          </button>
        </div>

        <div className="space-y-2.5">
          {topWeekly.length === 0 ? (
            <div className="p-4 text-center rounded-2xl bg-white/40 text-xs text-[#7A6C88] font-luxury italic">
              Chưa có bé nhân vật nào trong bảng xếp hạng. Hãy thêm nhân vật mới vào lớp nhé ♡
            </div>
          ) : (
            <>
              {topWeekly.map((char, index) => {
                const icons = [
                  <Crown key="1" className="w-4 h-4 text-amber-500 fill-amber-200" />,
                  <Star key="2" className="w-4 h-4 text-slate-400 fill-slate-200" />,
                  <Flower2 key="3" className="w-4 h-4 text-amber-700 fill-amber-100" />
                ];

              return (
                <div
                  key={char.id}
                  onClick={() => {
                    soundManager.playBoop();
                    onOpenDetail(char);
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/60 hover:bg-white border border-white/80 hover:border-[#D2C8F2] transition-all cursor-pointer group shadow-xs"
                >
                  {/* Rank Badge */}
                  <div className="w-6 flex items-center justify-center font-bold text-xs">
                    {icons[index]}
                  </div>

                  {/* Avatar */}
                  <img
                    src={char.avatarUrl}
                    alt={char.name}
                    className="w-10 h-10 rounded-xl object-cover border border-white shadow-xs group-hover:scale-105 transition-transform"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#3F334D] truncate group-hover:text-[#8E75B2]">
                      {char.name}
                    </div>
                    <div className="text-[10px] text-[#7A6C88] truncate font-luxury italic">
                      bởi {char.creator}
                    </div>
                  </div>

                  {/* Total Likes */}
                  <div className="text-right">
                    <div className="text-[11px] font-bold text-[#E2799F]">
                      {char.likesCount} ♡
                    </div>
                    <div className="text-[9px] text-[#A092B0]">tổng lượt tim</div>
                  </div>
                </div>
              );
            })}
            </>
          )}
        </div>
      </div>

      {/* 2. Bé Chồng Hôm Nay (Celestial Mystery Fortune Widget - No Mascot) */}
      <div className="glass-panel rounded-3xl p-5 shadow-sm text-center relative overflow-hidden bg-gradient-to-br from-[#FFF5F8]/70 via-[#F7EFFF]/70 to-[#FEF9ED]/70 border border-white">
        <div className="flex items-center justify-center gap-1.5 mb-1.5">
          <Sparkles className="w-4 h-4 text-[#E2799F]" />
          <h3 className="font-heading font-bold text-sm text-[#3F334D]">
            Bé Chồng Hôm Nay ♡
          </h3>
        </div>

        <p className="text-[11px] text-[#7A6C88] mb-3 leading-tight font-luxury italic">
          Hôm nay duyên phận sẽ dẫn lối bạn gặp gỡ ai trong lớp Rắn?
        </p>

        {/* Ethereal Mystery Crystal Orb Icon */}
        <div className="flex justify-center my-3">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#E0D3F8] via-[#FCE4EE] to-[#FEF5E7] p-[2px] shadow-md animate-pulse">
            <div className="w-full h-full rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center">
              <span className="text-3xl filter drop-shadow">🔮</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playMagicChime();
            onOpenRandom();
          }}
          className="w-full mt-2 py-2.5 px-4 rounded-full bg-gradient-to-r from-[#EAE2F8] via-[#FDE4EE] to-[#FEF5E7] text-[#3F334D] font-bold text-xs border border-white shadow-sm hover:shadow-md hover:scale-102 transition-all cursor-pointer font-heading"
        >
          BỐC MỘT BÉ DUYÊN PHẬN ♡
        </button>
      </div>

      {/* 3. Khẩu Vị Của Lớp (Popular Tags) */}
      <div className="glass-panel rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-1.5 pb-2.5 border-b border-black/5 mb-3">
          <Flame className="w-4 h-4 text-orange-400" />
          <h3 className="font-heading font-bold text-sm text-[#3F334D]">
            Khẩu vị của lớp
          </h3>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {popularTags.map((tag, idx) => (
            <button
              key={idx}
              onClick={() => {
                soundManager.playBoop();
                onSelectTag(tag);
              }}
              className="text-[11px] font-semibold bg-white/60 hover:bg-[#EAE2F8] text-[#4A3B53] px-3 py-1 rounded-full border border-white/80 transition-all cursor-pointer shadow-2xs"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Những Chiếc Char Nổi Bật (Circular Avatars) */}
      <div className="glass-panel rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-2.5 border-b border-black/5 mb-3">
          <h3 className="font-heading font-bold text-sm text-[#3F334D]">
            Những chiếc char nổi bật
          </h3>
          <span className="text-[10px] text-[#7A6C88]">
            {characters.length} bé
          </span>
        </div>

        <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
          {characters.slice(0, 5).map((char) => (
            <div
              key={char.id}
              onClick={() => {
                soundManager.playBoop();
                onOpenDetail(char);
              }}
              className="flex flex-col items-center group cursor-pointer"
              title={`${char.name} (bởi ${char.creator})`}
            >
              <img
                src={char.avatarUrl}
                alt={char.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-white group-hover:scale-110 ring-2 ring-[#E9DCF8] transition-all shadow-xs"
              />
              <span className="text-[10px] text-[#4A3B53] truncate max-w-[50px] mt-1 text-center font-caption">
                {char.name.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
