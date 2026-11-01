import React, { useState, useMemo } from 'react';
import { Search, Filter, Sparkles, BookOpen, X, ArrowUpDown, Plus } from 'lucide-react';
import { Character, CharacterCategory } from '../../types';
import { CharacterCard } from '../characters/CharacterCard';
import { soundManager } from '../../lib/sound';
import { useAuth } from '../../context/AuthContext';

interface CharacterLibraryViewProps {
  characters: Character[];
  categories?: string[];
  allTags?: string[];
  onOpenDetail: (character: Character) => void;
  onLikeCharacter?: (id: string) => void;
  onEditCharacter?: (character: Character) => void;
  onDeleteCharacter?: (id: string) => void;
  onAddNewCharacter?: () => void;
  onManageCategoriesAndTags?: () => void;
}

export const CharacterLibraryView: React.FC<CharacterLibraryViewProps> = ({
  characters,
  categories: customCategories,
  allTags: customTags,
  onOpenDetail,
  onLikeCharacter,
  onEditCharacter,
  onDeleteCharacter,
  onAddNewCharacter,
  onManageCategoriesAndTags
}) => {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'likes' | 'views' | 'random'>('newest');

  const defaultCategories = [
    'Hiện đại',
    'Cổ trang',
    'Học đường',
    'Tổng tài',
    'Fantasy',
    'Anime',
    'Kinh dị',
    'Đời thường',
    'Thanh xuân',
    'Boylove',
    'Girllove',
    'Original Characters',
    'Khác'
  ];

  const categories = customCategories && customCategories.length > 0 ? customCategories : defaultCategories;

  const defaultTags = [
    '#Tsundere',
    '#GoldenRetriever',
    '#CEO',
    '#Historical',
    '#Fantasy',
    '#SchoolLife',
    '#Chibi',
    '#ColdMaleLead',
    '#Romance',
    '#Leader',
    '#MainOC',
    '#Magic',
    '#CatBoy'
  ];

  const allTags = customTags && customTags.length > 0 ? customTags : defaultTags;

  const handleTagToggle = (tag: string) => {
    soundManager.playBoop();
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const processedCharacters = useMemo(() => {
    let result = characters.filter((char) => {
      const matchSearch =
        char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        char.creator.toLowerCase().includes(searchTerm.toLowerCase()) ||
        char.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCat = selectedCategory ? char.category === selectedCategory : true;
      const matchTags =
        selectedTags.length === 0 ||
        selectedTags.every((t) => char.tags.includes(t));

      return matchSearch && matchCat && matchTags;
    });

    switch (sortBy) {
      case 'likes':
        result.sort((a, b) => b.likesCount - a.likesCount);
        break;
      case 'views':
        result.sort((a, b) => b.viewsCount - a.viewsCount);
        break;
      case 'random':
        result.sort(() => 0.5 - Math.random());
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result;
  }, [characters, searchTerm, selectedCategory, selectedTags, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header Banner - Ethereal & Refined (No mascot) */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-[#EAE2F8]/70 via-[#FDE5EF]/70 to-[#FEF5E7]/70">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">✨</span>
            <span className="text-xs uppercase font-bold tracking-widest text-[#8E75B2] bg-white/70 px-3 py-1 rounded-full border border-white/80 font-caption">
              Bộ Sưu Tập Google AI Studio
            </span>
          </div>
          <h1 className="font-heading font-bold text-2xl md:text-4xl text-[#3F334D] mb-1">
            TỦ NHÂN VẬT RẮN CON
          </h1>
          <p className="text-sm text-[#7A6C88] font-luxury italic">
            Nơi những câu chuyện nhỏ được bắt đầu. Khám phá và gặp gỡ các nhân vật độc đáo trong không gian mộng mơ.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white">
            <BookOpen className="w-5 h-5 text-[#8E75B2]" />
            <span className="text-xs font-bold text-[#3F334D]">
              {characters.length} nhân vật
            </span>
          </div>

          {onAddNewCharacter && (
            <button
              onClick={() => {
                soundManager.playMagicChime();
                onAddNewCharacter();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#8E75B2] to-[#E2799F] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer font-heading"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm bé mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Control Bar */}
      <div className="glass-panel rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#8E75B2] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên nhân vật hoặc tác giả..."
              className="w-full bg-white/70 border border-white rounded-2xl pl-10 pr-9 py-2.5 text-sm text-[#3F334D] placeholder-[#9F91A8] focus:outline-none focus:ring-2 focus:ring-[#D2C8F2]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9F91A8] hover:text-[#3F334D]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <ArrowUpDown className="w-4 h-4 text-[#8E75B2] shrink-0" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-white/70 border border-white rounded-2xl px-3.5 py-2 text-xs font-bold text-[#3F334D] focus:outline-none focus:ring-2 focus:ring-[#D2C8F2] cursor-pointer"
            >
              <option value="newest">Mới nhất</option>
              <option value="likes">Được yêu thích nhất</option>
              <option value="views">Xem nhiều nhất</option>
              <option value="random">Ngẫu nhiên</option>
            </select>
          </div>
        </div>

        {/* Categories Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] font-bold text-[#4A3C56] font-caption flex items-center gap-1.5 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-[#8E75B2]" />
              <span>Phân loại thể loại ({categories.length}):</span>
            </div>

            {isAdmin && onManageCategoriesAndTags && (
              <button
                onClick={onManageCategoriesAndTags}
                className="text-[10px] bg-white/70 hover:bg-white text-[#8E75B2] font-bold px-2.5 py-1 rounded-full border border-white shadow-2xs transition-colors cursor-pointer"
              >
                ⚙ Quản lý Thể Loại & Tag
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => {
                soundManager.playBoop();
                setSelectedCategory('');
              }}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                !selectedCategory
                  ? 'bg-[#9078B4] text-white shadow-xs'
                  : 'bg-white/70 text-[#4A3B53] hover:bg-white border border-white/80'
              }`}
            >
              Tất cả ({characters.length})
            </button>
            {categories.map((cat) => {
              const count = characters.filter((c) => c.category === cat).length;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    soundManager.playBoop();
                    setSelectedCategory(isSelected ? '' : cat);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#EAE2F8] to-[#FDE5EF] text-[#3F334D] font-bold shadow-xs border border-white'
                      : 'bg-white/70 text-[#62566F] hover:bg-white border border-white/80'
                  }`}
                >
                  {cat} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags Selection Bar */}
        <div className="pt-2 border-t border-black/5">
          <div className="text-[11px] font-bold text-[#4A3B53] mb-1.5 font-caption uppercase tracking-wider">
            Lọc theo nhãn tính cách / hình mẫu:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => {
              const isChecked = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-[#FDE2EC] border-[#F472B6] text-[#E11D48] font-bold'
                      : 'bg-white/60 border-white/80 text-[#7A6C88] hover:text-[#3F334D]'
                  }`}
                >
                  {tag} {isChecked && '✓'}
                </button>
              );
            })}
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="text-[11px] text-[#8E75B2] hover:underline font-bold self-center ml-2 cursor-pointer"
              >
                Xóa lọc nhãn
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Count & Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-bold text-[#3F334D]">
            Tìm thấy <strong className="text-[#8E75B2]">{processedCharacters.length}</strong> bé nhân vật
          </div>
        </div>

        {processedCharacters.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center">
            <Sparkles className="w-10 h-10 text-[#C4B5FD] mb-2" />
            <h3 className="font-heading font-bold text-lg text-[#3F334D] mt-2">
              Không có bé nhân vật nào khớp với tiêu chí tìm kiếm
            </h3>
            <p className="text-xs text-[#7A6C88] mt-1 max-w-sm">
              Bạn có thể làm mới bộ lọc hoặc đề xuất thêm nhân vật mới cho lớp nhé!
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedTags([]);
              }}
              className="mt-4 px-6 py-2 rounded-full bg-[#EAE2F8] font-bold text-xs text-[#3F334D] cursor-pointer border border-white"
            >
              Xem toàn bộ nhân vật
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {processedCharacters.map((char) => (
              <CharacterCard
                key={char.id}
                character={char}
                onOpenDetail={onOpenDetail}
                onLike={onLikeCharacter}
                onEdit={onEditCharacter}
                onDelete={onDeleteCharacter}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
