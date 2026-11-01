import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  X, 
  Sparkles, 
  Filter, 
  ArrowRight,
  Pin
} from 'lucide-react';
import { Announcement, Character, CharacterCategory } from '../../types';
import { CharacterCard } from '../characters/CharacterCard';
import { soundManager } from '../../lib/sound';

interface HomeBulletinBoardProps {
  announcements: Announcement[];
  characters: Character[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedTag: string;
  onTagChange: (tag: string) => void;
  onOpenDetail: (char: Character) => void;
  onViewAllCharacters: () => void;
  onEditCharacter?: (char: Character) => void;
  onDeleteCharacter?: (id: string) => void;
  onAddNewCharacter?: () => void;
}

export const HomeBulletinBoard: React.FC<HomeBulletinBoardProps> = ({
  announcements,
  characters,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedTag,
  onTagChange,
  onOpenDetail,
  onViewAllCharacters,
  onEditCharacter,
  onDeleteCharacter,
  onAddNewCharacter
}) => {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const categories: CharacterCategory[] = [
    'Hiện đại',
    'Cổ trang',
    'Học đường',
    'Tổng tài',
    'Fantasy',
    'Anime',
    'Original Characters'
  ];

  const filteredCharacters = characters.filter((char) => {
    const matchSearch = 
      char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      char.creator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      char.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchCat = selectedCategory ? char.category === selectedCategory : true;
    const matchTag = selectedTag ? char.tags.includes(selectedTag) : true;

    return matchSearch && matchCat && matchTag;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Classroom Bulletin Board Card - Luxury Frosted Glass */}
      <div className="glass-panel rounded-3xl p-6 shadow-sm relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5 mb-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#8E75B2]" />
            <div>
              <h2 className="font-heading font-bold text-lg md:text-xl text-[#3F334D] tracking-tight">
                BẢNG TIN LỚP RẮN CON
              </h2>
              <p className="text-[11px] text-[#7A6C88] font-luxury italic">
                Thông báo mới nhất từ ban cán sự và cô giáo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-white/70 px-3 py-1 rounded-full border border-white/80 text-xs font-bold text-[#E2799F] shadow-2xs">
            <Bell className="w-3.5 h-3.5 text-[#E2799F]" />
            <span>Mới cập nhật</span>
          </div>
        </div>

        {/* Announcements List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              onClick={() => {
                soundManager.playBoop();
                setSelectedAnnouncement(ann);
              }}
              className="p-4 rounded-2xl bg-white/70 hover:bg-white border border-white/90 hover:border-[#D2C8F2] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] text-[#7A6C88] mb-1.5">
                  <span className="bg-[#EAE2F8]/70 text-[#4A3B53] font-bold px-2 py-0.5 rounded-md">
                    {ann.type === 'event' ? 'Sự kiện' : ann.type === 'update' ? 'Cập nhật' : 'Thông báo'}
                  </span>
                  {ann.isPinned && <Pin className="w-3 h-3 text-[#E2799F] fill-[#E2799F]" />}
                </div>

                <h4 className="font-heading font-bold text-xs text-[#3F334D] line-clamp-2 mb-1.5">
                  {ann.title}
                </h4>

                <p className="text-[11px] text-[#7A6C88] line-clamp-2 leading-relaxed">
                  {ann.content}
                </p>
              </div>

              <div className="pt-2 mt-2 border-t border-black/5 flex items-center justify-between text-[10px] text-[#8E75B2]">
                <span>{ann.authorName}</span>
                <span className="font-bold">Chi tiết &rarr;</span>
              </div>
            </div>
          ))}
        </div>

        {/* Announcement Detail Modal */}
        {selectedAnnouncement && (
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="glass-panel bg-white/95 rounded-3xl border border-white p-6 max-w-lg w-full shadow-2xl relative">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5 text-[#7A6C88]"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="text-xs font-bold text-[#8E75B2] uppercase tracking-widest mb-1 font-caption">
                BẢNG TIN LỚP HỌC
              </div>
              <h3 className="font-heading font-bold text-lg text-[#3F334D] mb-3">
                {selectedAnnouncement.title}
              </h3>
              <p className="text-sm text-[#4A3B53] leading-relaxed mb-4 whitespace-pre-line">
                {selectedAnnouncement.content}
              </p>
              <div className="text-xs text-[#7A6C88] flex items-center justify-between border-t border-black/5 pt-3">
                <span>Người đăng: {selectedAnnouncement.authorName}</span>
                <span>{new Date(selectedAnnouncement.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Sleek Character Search Bar (No Mascot) */}
      <div className="w-full">
        <div className="relative flex items-center bg-white/75 backdrop-blur-xl rounded-full border border-white/90 shadow-xs hover:border-[#C4B5FD] transition-all px-5 py-3">
          <Search className="w-4 h-4 text-[#8E75B2] mr-3 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm những chiếc char đáng yêu..."
            className="w-full bg-transparent text-sm text-[#3F334D] placeholder-[#9F91A8] focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="text-[#9F91A8] hover:text-[#3F334D] p-1 cursor-pointer"
              title="Xóa tìm kiếm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills & Tag indicators */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => {
            soundManager.playBoop();
            onCategoryChange('');
          }}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            !selectedCategory
              ? 'bg-[#9078B4] text-white shadow-xs'
              : 'bg-white/70 text-[#4A3B53] hover:bg-white border border-white/80'
          }`}
        >
          Tất cả thể loại
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              soundManager.playBoop();
              onCategoryChange(cat === selectedCategory ? '' : cat);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-[#EAE2F8] to-[#FDE5EF] text-[#3F334D] font-bold shadow-xs border border-white'
                : 'bg-white/60 text-[#62566F] hover:bg-white border border-white/70'
            }`}
          >
            {cat}
          </button>
        ))}

        {selectedTag && (
          <div className="flex items-center gap-1 px-3 py-1 bg-[#FDE2EC] text-[#3F334D] text-xs font-bold rounded-full border border-pink-200">
            <span>Tag: {selectedTag}</span>
            <button onClick={() => onTagChange('')} className="hover:text-black">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* 3. Horizontally Scrolling Announcement Ticker */}
      <div className="glass-panel border border-white rounded-2xl py-2 px-4 overflow-hidden flex items-center shadow-2xs">
        <div className="flex items-center gap-1.5 bg-white/80 text-[#3F334D] px-3 py-0.5 rounded-full text-xs font-bold shrink-0 mr-3 shadow-2xs">
          <Bell className="w-3 h-3 text-[#E2799F]" />
          <span>Bản tin:</span>
        </div>

        <div className="overflow-hidden whitespace-nowrap w-full">
          <div className="animate-marquee inline-block text-xs font-semibold text-[#4A3B53]">
            ✦ Chào mừng bạn ghé thăm Mầm Non Rắn Con! • Đừng quên bốc Bé Chồng hôm nay tại góc vui chơi • Bình chọn Bé Ngoan Trong Tuần đang diễn ra sôi nổi! • Gửi tâm tư kín đáo vào Hòm Thư Bí Mật nhé ♡
          </div>
        </div>
      </div>

      {/* 4. Featured Characters Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E2799F]" />
            <div>
              <h2 className="font-heading font-bold text-lg md:text-xl text-[#3F334D]">
                NHỮNG BÉ ĐANG ĐƯỢC YÊU THÍCH ♡
              </h2>
              <p className="text-xs text-[#7A6C88] font-luxury italic">
                Tuyển chọn những nhân vật nhận được nhiều tình cảm nhất từ cộng đồng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onAddNewCharacter && (
              <button
                onClick={() => {
                  soundManager.playMagicChime();
                  onAddNewCharacter();
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#8E75B2] to-[#E2799F] hover:opacity-95 px-3.5 py-1.5 rounded-full transition-all cursor-pointer shadow-xs font-heading"
              >
                <span>+ Thêm bé mới</span>
              </button>
            )}

            <button
              onClick={() => {
                soundManager.playBoop();
                onViewAllCharacters();
              }}
              className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#8E75B2] hover:text-[#3F334D] bg-white/70 hover:bg-white px-3.5 py-1.5 rounded-full border border-white/80 transition-all cursor-pointer shadow-xs"
            >
              <span>Xem tất cả nhân vật</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Character Grid */}
        {filteredCharacters.length === 0 ? (
          <div className="glass-panel rounded-3xl p-10 text-center flex flex-col items-center">
            <Sparkles className="w-10 h-10 text-[#C4B5FD] mb-2" />
            <h3 className="font-heading font-bold text-base text-[#3F334D] mt-2">
              Chưa tìm thấy bé nhân vật nào phù hợp
            </h3>
            <p className="text-xs text-[#7A6C88] mt-1">
              Bạn hãy thử đổi từ khóa tìm kiếm hoặc chọn lại bộ lọc thể loại nhé!
            </p>
            <button
              onClick={() => {
                onSearchChange('');
                onCategoryChange('');
                onTagChange('');
              }}
              className="mt-4 text-xs font-bold text-[#3F334D] bg-[#EAE2F8] hover:bg-[#DCD0F4] px-5 py-2 rounded-full transition-all cursor-pointer border border-white"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredCharacters.slice(0, 6).map((char) => (
              <CharacterCard
                key={char.id}
                character={char}
                onOpenDetail={onOpenDetail}
                onEdit={onEditCharacter}
                onDelete={onDeleteCharacter}
              />
            ))}
          </div>
        )}

        {/* Bottom Explore Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              soundManager.playMagicChime();
              onViewAllCharacters();
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#EAE2F8] via-[#FDE4EE] to-[#FEF5E7] text-[#3F334D] font-bold text-xs border border-white shadow-md hover:shadow-lg hover:scale-102 transition-all cursor-pointer font-heading flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#8E75B2]" />
            <span>Khám phá thêm tủ nhân vật</span>
          </button>
        </div>
      </div>
    </div>
  );
};
