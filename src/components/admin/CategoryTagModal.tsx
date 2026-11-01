import React, { useState } from 'react';
import { X, Plus, Trash2, Tag, Layers, Sparkles } from 'lucide-react';
import { soundManager } from '../../lib/sound';

interface CategoryTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  tags: string[];
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
  onAddTag: (tag: string) => void;
  onDeleteTag: (tag: string) => void;
}

export const CategoryTagModal: React.FC<CategoryTagModalProps> = ({
  isOpen,
  onClose,
  categories,
  tags,
  onAddCategory,
  onDeleteCategory,
  onAddTag,
  onDeleteTag,
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'tags'>('categories');
  const [newCatInput, setNewCatInput] = useState<string>('');
  const [newTagInput, setNewTagInput] = useState<string>('');

  if (!isOpen) return null;

  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatInput.trim()) return;
    soundManager.playMagicChime();
    onAddCategory(newCatInput.trim());
    setNewCatInput('');
  };

  const handleAddTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    soundManager.playMagicChime();
    const formatted = newTagInput.trim().startsWith('#')
      ? newTagInput.trim()
      : `#${newTagInput.trim()}`;
    onAddTag(formatted);
    setNewTagInput('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white/95 rounded-3xl border border-white shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#F0E6FA] via-[#FCE8F2] to-[#FFF3E3] border-b border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#8E75B2]" />
            <div>
              <h3 className="font-heading font-bold text-base text-[#4A3C56]">
                Quản Lý Thể Loại & Nhãn Tag
              </h3>
              <p className="text-xs text-[#827290] font-luxury italic">
                Quyền hạn Cô Giáo: Thêm mới hoặc xóa các phân loại cho lớp học
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playBoop();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-white text-[#827290]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-black/5 px-6 pt-3 bg-white">
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer font-heading ${
              activeTab === 'categories'
                ? 'border-[#8E75B2] text-[#8E75B2]'
                : 'border-transparent text-[#827290] hover:text-[#4A3C56]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Thể Loại Nhân Vật ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tags')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer font-heading ${
              activeTab === 'tags'
                ? 'border-[#8E75B2] text-[#8E75B2]'
                : 'border-transparent text-[#827290] hover:text-[#4A3C56]'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Thẻ Nhãn Phân Loại ({tags.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'categories' ? (
            <div className="space-y-4">
              {/* Add category form */}
              <form onSubmit={handleAddCat} className="flex gap-2">
                <input
                  type="text"
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  placeholder="Nhập tên thể loại mới (ví dụ: Trinh thám, Xuyên không...)"
                  className="flex-1 text-xs px-3.5 py-2 rounded-xl bg-white border border-[#D2C8F2] focus:outline-none focus:ring-2 focus:ring-[#8E75B2]/30 text-[#4A3C56]"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8E75B2] to-[#E2799F] text-white font-bold text-xs shadow-xs hover:shadow-md cursor-pointer font-heading"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm</span>
                </button>
              </form>

              {/* List of categories */}
              <div className="flex flex-wrap gap-2 pt-2">
                {categories.map((cat) => (
                  <div
                    key={cat}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#D2C8F2] text-xs font-semibold text-[#4A3C56] shadow-2xs group"
                  >
                    <span>{cat}</span>
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playBoop();
                        onDeleteCategory(cat);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      title={`Xóa thể loại ${cat}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Add tag form */}
              <form onSubmit={handleAddTagSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="Nhập nhãn tag mới (ví dụ: #Cute, #Tsundere, #Hero...)"
                  className="flex-1 text-xs px-3.5 py-2 rounded-xl bg-white border border-[#D2C8F2] focus:outline-none focus:ring-2 focus:ring-[#8E75B2]/30 text-[#4A3C56]"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8E75B2] to-[#E2799F] text-white font-bold text-xs shadow-xs hover:shadow-md cursor-pointer font-heading"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm</span>
                </button>
              </form>

              {/* List of tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#D2C8F2] text-xs font-semibold text-[#8E75B2] shadow-2xs group"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playBoop();
                        onDeleteTag(tag);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      title={`Xóa tag ${tag}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
