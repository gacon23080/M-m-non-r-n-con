import React, { useState } from 'react';
import { 
  Trophy, 
  Crown, 
  Star, 
  Flower2, 
  Sparkles, 
  Archive, 
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Character } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { soundManager } from '../../lib/sound';

interface WeeklyRankingViewProps {
  characters: Character[];
  onOpenDetail: (character: Character) => void;
  onVoteCharacter: (characterId: string) => void;
}

export const WeeklyRankingView: React.FC<WeeklyRankingViewProps> = ({
  characters,
  onOpenDetail,
  onVoteCharacter
}) => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'current' | 'archive'>('current');
  const [votedIds, setVotedIds] = useState<string[]>([]);

  const sortedRanking = [...characters].sort((a, b) => b.weeklyLikesCount - a.weeklyLikesCount);
  const top1 = sortedRanking[0];
  const top2 = sortedRanking[1];
  const top3 = sortedRanking[2];
  const rest = sortedRanking.slice(3);

  const handleVote = (e: React.MouseEvent, charId: string) => {
    e.stopPropagation();
    if (votedIds.includes(charId)) return;

    soundManager.playMagicChime();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });

    setVotedIds((prev) => [...prev, charId]);
    onVoteCharacter(charId);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white/75 border border-white px-4 py-1.5 rounded-full shadow-2xs mb-3">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold text-[#4A3B53] font-caption tracking-wider">
            BẢNG VÀNG BÉ NGOAN • TUẦN 44
          </span>
        </div>

        <h1 className="font-heading font-bold text-2xl md:text-4xl text-[#3F334D] mb-2 tracking-tight">
          BẢNG VÀNG BÉ NGOAN TRONG TUẦN
        </h1>
        <p className="text-xs md:text-sm text-[#7A6C88] font-luxury italic">
          Tôn vinh những nhân vật chăm ngoan được cả lớp yêu quý nhất trong tuần này!
        </p>

        {/* Tab switch */}
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'current'
                ? 'bg-[#9078B4] text-white shadow-xs'
                : 'bg-white/70 text-[#4A3B53] hover:bg-white border border-white'
            }`}
          >
            Tuần Hiện Tại
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'archive'
                ? 'bg-[#9078B4] text-white shadow-xs'
                : 'bg-white/70 text-[#4A3B53] hover:bg-white border border-white'
            }`}
          >
            Lịch Sử Các Tuần Trước
          </button>
        </div>
      </div>

      {activeTab === 'current' ? (
        <>
          {/* Top 3 Podium Cards - Luxury & Distinctive */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8">
            
            {/* Rank 2 (Platinum / Silver Star) */}
            {top2 && (
              <div 
                onClick={() => onOpenDetail(top2)}
                className="glass-panel rounded-3xl p-6 shadow-md flex flex-col items-center text-center relative hover:-translate-y-2 transition-all cursor-pointer order-2 md:order-1 border-white"
              >
                {/* Silver Star Badge */}
                <div className="absolute -top-6 bg-gradient-to-r from-slate-200 via-white to-slate-200 border-2 border-white p-3 rounded-full shadow-md">
                  <Star className="w-5 h-5 text-slate-500 fill-slate-200" />
                </div>

                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 mb-2 font-caption">
                  Hạng 2 • Ngôi Sao Bạc
                </div>

                <img
                  src={top2.avatarUrl}
                  alt={top2.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-md mb-3"
                />

                <h3 className="font-heading font-bold text-lg text-[#3F334D] mb-0.5">
                  {top2.name}
                </h3>
                <p className="text-xs text-[#7A6C88] mb-3 font-luxury italic">
                  Tác giả: {top2.creator}
                </p>

                <div className="w-full bg-white/70 rounded-2xl py-2 px-3 flex items-center justify-between text-xs mb-3 border border-white">
                  <span className="text-[#7A6C88]">Phiếu tuần:</span>
                  <strong className="text-[#E2799F] font-bold text-sm">
                    {top2.weeklyLikesCount} ♡
                  </strong>
                </div>

                <button
                  onClick={(e) => handleVote(e, top2.id)}
                  disabled={votedIds.includes(top2.id)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    votedIds.includes(top2.id)
                      ? 'bg-slate-200 text-slate-500'
                      : 'bg-gradient-to-r from-[#EAE2F8] to-[#FDE5EF] text-[#3F334D] border border-white hover:shadow'
                  }`}
                >
                  {votedIds.includes(top2.id) ? 'Đã bỏ phiếu' : 'Bỏ phiếu cho bé ♡'}
                </button>
              </div>
            )}

            {/* Rank 1 (Gold Crown - Taller & Center) */}
            {top1 && (
              <div 
                onClick={() => onOpenDetail(top1)}
                className="glass-panel bg-gradient-to-b from-[#FFFDF7]/90 via-white/85 to-[#FFF7EC]/90 rounded-3xl border-2 border-amber-200/80 p-7 shadow-xl flex flex-col items-center text-center relative hover:-translate-y-2 transition-all cursor-pointer order-1 md:order-2 md:-translate-y-5"
              >
                {/* Gold Crown Badge */}
                <div className="absolute -top-7 bg-gradient-to-r from-amber-400 via-yellow-100 to-amber-400 border-2 border-white p-3.5 rounded-full shadow-lg animate-bounce">
                  <Crown className="w-7 h-7 text-amber-900 fill-amber-300" />
                </div>

                <div className="text-xs font-bold text-amber-700 uppercase tracking-widest mt-3 mb-2 font-caption flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>HẠNG 1 • QUÁN QUÂN BÉ NGOAN</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </div>

                <img
                  src={top1.avatarUrl}
                  alt={top1.name}
                  className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-xl mb-3 ring-2 ring-amber-300/50"
                />

                <h3 className="font-heading font-bold text-xl text-[#3F334D] mb-0.5">
                  {top1.name}
                </h3>
                <p className="text-xs text-[#7A6C88] mb-3 font-luxury italic">
                  Tác giả: {top1.creator}
                </p>

                <div className="w-full bg-white/80 border border-white rounded-2xl py-2.5 px-4 flex items-center justify-between text-xs mb-3 shadow-2xs">
                  <span className="text-[#7A6C88]">Phiếu bình chọn:</span>
                  <strong className="text-[#E2799F] font-bold text-base">
                    {top1.weeklyLikesCount} ♡
                  </strong>
                </div>

                <button
                  onClick={(e) => handleVote(e, top1.id)}
                  disabled={votedIds.includes(top1.id)}
                  className={`w-full py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                    votedIds.includes(top1.id)
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 text-amber-950 border border-white hover:brightness-105'
                  }`}
                >
                  {votedIds.includes(top1.id) ? 'Đã bỏ phiếu' : 'Bỏ phiếu cho Quán quân ♡'}
                </button>
              </div>
            )}

            {/* Rank 3 (Rose Gold / Bronze Flower) */}
            {top3 && (
              <div 
                onClick={() => onOpenDetail(top3)}
                className="glass-panel rounded-3xl p-6 shadow-md flex flex-col items-center text-center relative hover:-translate-y-2 transition-all cursor-pointer order-3 border-white"
              >
                {/* Bronze Flower Badge */}
                <div className="absolute -top-6 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600 border-2 border-white p-3 rounded-full shadow-md">
                  <Flower2 className="w-5 h-5 text-white fill-amber-200" />
                </div>

                <div className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mt-2 mb-2 font-caption">
                  Hạng 3 • Hoa Đồng
                </div>

                <img
                  src={top3.avatarUrl}
                  alt={top3.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-md mb-3"
                />

                <h3 className="font-heading font-bold text-lg text-[#3F334D] mb-0.5">
                  {top3.name}
                </h3>
                <p className="text-xs text-[#7A6C88] mb-3 font-luxury italic">
                  Tác giả: {top3.creator}
                </p>

                <div className="w-full bg-white/70 rounded-2xl py-2 px-3 flex items-center justify-between text-xs mb-3 border border-white">
                  <span className="text-[#7A6C88]">Phiếu tuần:</span>
                  <strong className="text-[#E2799F] font-bold text-sm">
                    {top3.weeklyLikesCount} ♡
                  </strong>
                </div>

                <button
                  onClick={(e) => handleVote(e, top3.id)}
                  disabled={votedIds.includes(top3.id)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    votedIds.includes(top3.id)
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gradient-to-r from-[#EAE2F8] to-[#FDE5EF] text-[#3F334D] border border-white hover:shadow'
                  }`}
                >
                  {votedIds.includes(top3.id) ? 'Đã bỏ phiếu' : 'Bỏ phiếu cho bé ♡'}
                </button>
              </div>
            )}

          </div>

          {/* Ranks 4+ List */}
          <div className="glass-panel rounded-3xl p-6 shadow-sm">
            <h3 className="font-heading font-bold text-base text-[#3F334D] mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#8E75B2]" />
              <span>Bảng xếp hạng tiếp theo</span>
            </h3>

            <div className="space-y-2.5">
              {rest.map((char, idx) => {
                const rankNum = idx + 4;
                const isVoted = votedIds.includes(char.id);

                return (
                  <div
                    key={char.id}
                    onClick={() => onOpenDetail(char)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/60 hover:bg-white border border-white/80 hover:border-[#D2C8F2] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-[#EAE2F8] text-[#3F334D] font-bold text-xs flex items-center justify-center font-heading">
                        #{rankNum}
                      </span>
                      <img
                        src={char.avatarUrl}
                        alt={char.name}
                        className="w-11 h-11 rounded-xl object-cover border border-white shadow-2xs"
                      />
                      <div>
                        <h4 className="font-heading font-bold text-sm text-[#3F334D]">
                          {char.name}
                        </h4>
                        <div className="text-xs text-[#7A6C88] font-luxury italic">
                          {char.creator} • {char.category}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-sm font-bold text-[#E2799F]">
                          {char.weeklyLikesCount} ♡
                        </span>
                        <div className="text-[10px] text-[#A092B0]">lượt bình chọn</div>
                      </div>

                      <button
                        onClick={(e) => handleVote(e, char.id)}
                        disabled={isVoted}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          isVoted
                            ? 'bg-gray-100 text-gray-400'
                            : 'bg-[#EAE2F8] hover:bg-[#DCD0F4] text-[#3F334D] border border-white'
                        }`}
                      >
                        {isVoted ? 'Đã bầu' : '+1 Bé Ngoan'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* Past Archived Rankings */
        <div className="glass-panel rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Archive className="w-5 h-5 text-[#8E75B2]" />
            <h3 className="font-heading font-bold text-lg text-[#3F334D]">
              Kỳ vinh danh các tuần đã qua
            </h3>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 border border-white flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#E2799F] font-caption">Tuần 43 (24/10 - 30/10)</div>
              <div className="font-heading font-bold text-sm text-[#3F334D] mt-1">
                Quán quân: Thiếu Chủ Bạch Ngọc (210 phiếu)
              </div>
              <p className="text-xs text-[#7A6C88] font-luxury italic">Á quân: Bé Rắn Con Tinh Nghịch • Quý quân: Tổng Tài Cố Niên</p>
            </div>
            <span className="text-2xl">👑</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 border border-white flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-amber-700 font-caption">Tuần 42 (17/10 - 23/10)</div>
              <div className="font-heading font-bold text-sm text-[#3F334D] mt-1">
                Quán quân: Bé Rắn Con Tinh Nghịch (195 phiếu)
              </div>
              <p className="text-xs text-[#7A6C88] font-luxury italic">Á quân: Học Trưởng Dương Quang • Quý quân: Tiểu Miêu Tuyết Lạc</p>
            </div>
            <span className="text-2xl">🌟</span>
          </div>
        </div>
      )}
    </div>
  );
};
