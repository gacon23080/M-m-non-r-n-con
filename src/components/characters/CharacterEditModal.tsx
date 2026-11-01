import React, { useState, useEffect } from 'react';
import { X, Sparkles, Save, Image, Tag, User, BookOpen, ExternalLink, Trash2, Heart, Check } from 'lucide-react';
import { Character, CharacterCategory } from '../../types';
import { soundManager } from '../../lib/sound';

interface CharacterEditModalProps {
  isOpen: boolean;
  character?: Character | null; // null if adding new
  categories?: string[];
  onClose: () => void;
  onSave: (charData: Character) => void;
  onDelete?: (id: string) => void;
}

export const CharacterEditModal: React.FC<CharacterEditModalProps> = ({
  isOpen,
  character,
  categories: customCategories,
  onClose,
  onSave,
  onDelete
}) => {
  const isEditing = Boolean(character);

  const categories: CharacterCategory[] = customCategories && customCategories.length > 0 
    ? (customCategories as CharacterCategory[]) 
    : [
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

  const [name, setName] = useState<string>('');
  const [creator, setCreator] = useState<string>('');
  const [category, setCategory] = useState<string>('Original Characters');
  const [shortDescription, setShortDescription] = useState<string>('');
  const [fullDescription, setFullDescription] = useState<string>('');
  const [personality, setPersonality] = useState<string>('');
  const [backgroundStory, setBackgroundStory] = useState<string>('');
  const [relationships, setRelationships] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [coverUrl, setCoverUrl] = useState<string>('');
  const [googleAiStudioUrl, setGoogleAiStudioUrl] = useState<string>('https://aistudio.google.com/');
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);


  const PRESET_AVATARS = [
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80'
  ];

  useEffect(() => {
    if (character) {
      setName(character.name || '');
      setCreator(character.creator || 'Cô Giáo Rắn Con');
      setCategory(character.category || 'Original Characters');
      setShortDescription(character.shortDescription || '');
      setFullDescription(character.fullDescription || '');
      setPersonality(character.personality || '');
      setBackgroundStory(character.backgroundStory || '');
      setRelationships(character.relationships || '');
      setTagsInput(character.tags?.join(', ') || '#Chibi, #Cute');
      setAvatarUrl(character.avatarUrl || PRESET_AVATARS[0]);
      setCoverUrl(character.coverUrl || PRESET_AVATARS[0]);
      setGoogleAiStudioUrl(character.googleAiStudioUrl || 'https://aistudio.google.com/');
      setIsFeatured(character.isFeatured || false);
    } else {
      setName('');
      setCreator('Cô Giáo Rắn Con');
      setCategory('Original Characters');
      setShortDescription('');
      setFullDescription('');
      setPersonality('');
      setBackgroundStory('');
      setRelationships('');
      setTagsInput('#Pastel, #Chibi, #Sweet');
      setAvatarUrl(PRESET_AVATARS[0]);
      setCoverUrl('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80');
      setGoogleAiStudioUrl('https://aistudio.google.com/');
      setIsFeatured(false);
    }
    setConfirmDelete(false);
  }, [character, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    soundManager.playMagicChime();

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    const updatedOrNewChar: Character = {
      id: character?.id || `char-${Date.now()}`,
      name: name.trim(),
      creator: creator.trim() || 'Cô Giáo Rắn Con',
      category: category as any,
      shortDescription: shortDescription.trim(),
      fullDescription: fullDescription.trim() || shortDescription.trim(),
      personality: personality.trim() || 'Dịu dàng, đáng yêu, thân thiện',
      backgroundStory: backgroundStory.trim() || 'Được sáng tạo với tình yêu thương tại Mầm Non Rắn Con',
      relationships: relationships.trim() || 'Bạn bè tốt của các bé trong lớp Rắn Con',
      tags: parsedTags.length > 0 ? parsedTags : ['#Pastel', '#Cute'],
      avatarUrl: avatarUrl.trim() || PRESET_AVATARS[0],
      coverUrl: coverUrl.trim() || avatarUrl.trim() || PRESET_AVATARS[0],
      gallery: character?.gallery || [avatarUrl.trim() || PRESET_AVATARS[0]],
      googleAiStudioUrl: googleAiStudioUrl.trim() || 'https://aistudio.google.com/',
      likesCount: character?.likesCount || 0,
      weeklyLikesCount: character?.weeklyLikesCount || 0,
      viewsCount: character?.viewsCount || 1,
      isFeatured: isFeatured,
      isPublished: true,
      createdAt: character?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(updatedOrNewChar);
    onClose();
  };

  const handleDelete = () => {
    if (character && onDelete) {
      soundManager.playBoop();
      onDelete(character.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white/95 rounded-3xl border border-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#F0E6FA] via-[#FCE8F2] to-[#FFF3E3] border-b border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#8E75B2]" />
            <div>
              <h3 className="font-heading font-bold text-base md:text-lg text-[#382D42]">
                {isEditing ? `Chỉnh sửa nhân vật: ${character?.name}` : 'Thêm Nhân Vật Mới Vào Lớp'}
              </h3>
              <p className="text-xs text-[#7A6C88] font-luxury italic">
                Quyền hạn Cô Giáo: Quản lý toàn bộ thông tin, câu chuyện, hình ảnh và liên kết AI Studio
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playBoop();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-white/80 text-[#7A6C88] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Top Section: Avatar & Cover Preview & Quick Image Selection */}
          <div className="p-4 rounded-2xl bg-[#FAF7FD] border border-[#EADBFA] space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group">
                <img
                  src={avatarUrl || PRESET_AVATARS[0]}
                  alt="Avatar preview"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-[#D9C6F5]"
                />
                <span className="absolute bottom-1 right-1 bg-black/60 text-[9px] text-white px-1.5 py-0.5 rounded font-caption">
                  Avatar
                </span>
              </div>

              <div className="flex-1 w-full space-y-2">
                <div>
                  <label className="text-xs font-bold text-[#4A3B53] flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5">
                      <Image className="w-3.5 h-3.5 text-[#8E75B2]" />
                      <span>Ảnh đại diện (Avatar):</span>
                    </span>
                    <label className="text-[10px] bg-[#EADBFA] hover:bg-[#D9C6F5] text-[#4A3B53] font-bold px-2 py-0.5 rounded-lg cursor-pointer transition-colors">
                      📁 Tải ảnh từ máy
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (typeof reader.result === 'string') {
                                setAvatarUrl(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </label>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://... hoặc đã tải từ máy"
                    className="w-full text-xs px-3.5 py-2 rounded-xl bg-white border border-[#D9C6F5] focus:outline-none focus:ring-2 focus:ring-[#8E75B2]/30 text-[#382D42]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#4A3B53] flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5">
                      <Image className="w-3.5 h-3.5 text-[#8E75B2]" />
                      <span>Ảnh bìa / Banner (Cover):</span>
                    </span>
                    <label className="text-[10px] bg-[#EADBFA] hover:bg-[#D9C6F5] text-[#4A3B53] font-bold px-2 py-0.5 rounded-lg cursor-pointer transition-colors">
                      📁 Tải ảnh từ máy
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (typeof reader.result === 'string') {
                                setCoverUrl(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </label>
                  <input
                    type="text"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="https://... hoặc đã tải từ máy"
                    className="w-full text-xs px-3.5 py-2 rounded-xl bg-white border border-[#D9C6F5] focus:outline-none focus:ring-2 focus:ring-[#8E75B2]/30 text-[#382D42]"
                  />
                </div>
              </div>
            </div>

            {/* Quick Preset Selector */}
            <div className="pt-2 border-t border-[#EADBFA]/60">
              <span className="text-[11px] font-semibold text-[#7A6C88] block mb-1.5">
                Gợi ý nhanh ảnh anime / chibi pastel chất lượng cao:
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_AVATARS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      soundManager.playBoop();
                      setAvatarUrl(preset);
                      if (!coverUrl) setCoverUrl(preset);
                    }}
                    className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-transform hover:scale-110 ${
                      avatarUrl === preset ? 'border-[#8E75B2] ring-2 ring-[#8E75B2]/30' : 'border-white'
                    }`}
                  >
                    <img src={preset} alt={`preset-${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Name & Creator */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#4A3B53] mb-1.5">
                Tên nhân vật (*):
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Bé Rắn Tinh Nghịch, Thiếu Chủ Bạch Ngọc..."
                className="w-full text-xs px-3.5 py-2 rounded-xl bg-white border border-[#D9C6F5] focus:outline-none focus:ring-2 focus:ring-[#8E75B2]/30 text-[#382D42]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A3B53] mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#8E75B2]" />
                <span>Tác giả sáng tạo (*):</span>
              </label>
              <input
                type="text"
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                placeholder="Ví dụ: Cô Giáo Rắn Con, Mộng Tử Các..."
                className="w-full text-xs px-3.5 py-2 rounded-xl bg-white border border-[#D9C6F5] focus:outline-none focus:ring-2 focus:ring-[#8E75B2]/30 text-[#382D42]"
                required
              />
            </div>
          </div>

          {/* Category & Featured */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#4A3B53] mb-1.5">
                Thể loại nhân vật:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CharacterCategory)}
                className="w-full text-xs px-3.5 py-2 rounded-xl bg-white border border-[#D9C6F5] focus:outline-none focus:ring-2 focus:ring-[#8E75B2]/30 text-[#382D42]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 pt-5">
              <label className="flex items-center gap-2 text-xs font-bold text-[#4A3B53] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-[#D2C8F2] text-[#8E75B2] focus:ring-[#EAE2F8]"
                />
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#E2799F]" />
                  Đánh dấu nhân vật nổi bật (Featured / Bé Yêu)
                </span>
              </label>
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-bold text-[#4A3B53] mb-1.5">
              Mô tả ngắn gọn (Hiển thị trên thẻ):
            </label>
            <textarea
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Một câu tóm tắt cuốn hút về tính cách và nét đặc biệt của nhân vật..."
              className="w-full text-xs p-3 rounded-xl bg-white border border-[#D9C6F5] focus:outline-none focus:ring-2 focus:ring-[#8E75B2]/30 text-[#382D42] resize-none"
              required
            />
          </div>

          {/* Full Story & Background */}
          <div>
            <label className="block text-xs font-bold text-[#4A3B53] mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#8E75B2]" />
              <span>Tiểu sử & Cốt truyện chi tiết (Full Lore):</span>
            </label>
            <textarea
              rows={3}
              value={backgroundStory}
              onChange={(e) => setBackgroundStory(e.target.value)}
              placeholder="Nguồn gốc, bối cảnh xuất thân, những ước mơ và sự kiện đáng nhớ..."
              className="w-full text-xs p-3 rounded-xl bg-white border border-[#D9C6F5] focus:outline-none focus:ring-2 focus:ring-[#8E75B2]/30 text-[#382D42] resize-none"
            />
          </div>

          {/* Personality & Relationships */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#4A3B53] mb-1.5">
                Thiết lập tính cách:
              </label>
              <textarea
                rows={2}
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                placeholder="Tsundere, ấm áp, kiêu kỳ, ngọt ngào, hài hước..."
                className="w-full text-xs p-3 rounded-xl bg-white border border-[#D9C6F5] focus:outline-none focus:ring-2 focus:ring-[#8E75B2]/30 text-[#382D42] resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A3B53] mb-1.5">
                Mối quan hệ & Bạn bè:
              </label>
              <textarea
                rows={2}
                value={relationships}
                onChange={(e) => setRelationships(e.target.value)}
                placeholder="Thân thiết với ai, có tình cảm đặc biệt với ai..."
                className="w-full text-xs p-3 rounded-xl bg-white border border-[#D9C6F5] focus:outline-none focus:ring-2 focus:ring-[#8E75B2]/30 text-[#382D42] resize-none"
              />
            </div>
          </div>

          {/* Tags & Google AI Studio URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#4A3B53] mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#8E75B2]" />
                <span>Thẻ phân loại (ngăn cách bằng dấu phẩy):</span>
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="#Chibi, #Cute, #Tsundere"
                className="w-full text-xs px-3.5 py-2 rounded-xl bg-white border border-[#D9C6F5] focus:outline-none focus:ring-2 focus:ring-[#8E75B2]/30 text-[#382D42]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A3B53] mb-1.5 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-[#8E75B2]" />
                <span>Link Google AI Studio trực tiếp:</span>
              </label>
              <input
                type="url"
                value={googleAiStudioUrl}
                onChange={(e) => setGoogleAiStudioUrl(e.target.value)}
                placeholder="https://aistudio.google.com/..."
                className="w-full text-xs px-3.5 py-2 rounded-xl bg-white border border-[#D9C6F5] focus:outline-none focus:ring-2 focus:ring-[#8E75B2]/30 text-[#382D42]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-black/5 flex items-center justify-between">
            {isEditing && onDelete ? (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-500 font-semibold">Chắc chắn xóa bé này?</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-3 py-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Xác nhận xóa
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1.5 text-xs text-[#7A6C88] hover:text-[#382D42]"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa nhân vật</span>
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs font-semibold text-[#7A6C88] hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#8E75B2] via-[#E2799F] to-[#8E75B2] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer font-heading"
              >
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Lưu cập nhật nhân vật' : 'Thêm bé vào lớp ngay'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
