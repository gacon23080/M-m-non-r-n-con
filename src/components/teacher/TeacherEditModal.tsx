import React, { useState } from 'react';
import { X, Sparkles, Save, Link as LinkIcon, Image, User, Check } from 'lucide-react';
import { soundManager } from '../../lib/sound';
import { compressImageFile } from '../../lib/imageCompressor';

export interface TeacherData {
  name: string;
  tagline: string;
  bio: string;
  avatarUrl: string;
  quote: string;
  facebookUrl: string;
  discordUrl: string;
  aiStudioUrl: string;
}

interface TeacherEditModalProps {
  initialData: TeacherData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TeacherData) => void;
}

export const TeacherEditModal: React.FC<TeacherEditModalProps> = ({
  initialData,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<TeacherData>(initialData);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playMagicChime();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const AVATAR_PRESETS = [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=400&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white/95 rounded-3xl border border-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#F0E6FA] via-[#FCE8F2] to-[#FFF3E3] border-b border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#8E75B2]" />
            <div>
              <h3 className="font-heading font-bold text-base md:text-lg text-[#382D42]">
                Chỉnh sửa Hồ Sơ Cô Giáo & Kênh Kết Nối
              </h3>
              <p className="text-xs text-[#7A6C88] font-luxury italic">
                Cập nhật lời giới thiệu, ảnh đại diện và liên kết Facebook, Discord
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
          {/* Avatar Preview & Selection */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-[#FAF7FD] border border-[#EADBFA]">
            <img
              src={formData.avatarUrl || AVATAR_PRESETS[0]}
              alt="Avatar preview"
              className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-[#D9C6F5]"
            />
            <div className="flex-1 w-full space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#4A3B53] flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5 text-[#8E75B2]" />
                  <span>Ảnh đại diện Cô Giáo:</span>
                </label>
                <label className="text-[10px] bg-[#EADBFA] hover:bg-[#D9C6F5] text-[#4A3B53] font-bold px-3 py-1 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 border border-white/50 shadow-2xs">
                  <span>📁 Tải ảnh từ máy</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const dataUrl = await compressImageFile(file);
                          if (dataUrl) setFormData(prev => ({ ...prev, avatarUrl: dataUrl }));
                        } catch (err) {
                          console.warn('Image error:', err);
                        }
                      }
                    }}
                  />
                </label>
              </div>
              <input
                type="text"
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                placeholder="https://... hoặc đã tải từ máy"
                className="w-full text-xs px-3.5 py-2 rounded-xl bg-white border border-[#D9C6F5] focus:outline-none focus:ring-2 focus:ring-[#8E75B2]/30 text-[#382D42]"
                required
              />
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-[#7A6C88]">Chọn nhanh ảnh mẫu:</span>
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      soundManager.playBoop();
                      setFormData({ ...formData, avatarUrl: preset });
                    }}
                    className="w-6 h-6 rounded-full overflow-hidden border border-white hover:scale-115 transition-transform"
                  >
                    <img src={preset} alt="preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Name & Tagline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#4A3B53] mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#8E75B2]" />
                <span>Tên cô giáo hiển thị:</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ví dụ: Cô Giáo Rắn Con / Cô Giáo Gà Con"
                className="w-full text-xs px-3.5 py-2 rounded-xl bg-white border border-[#D9C6F5] focus:outline-none focus:ring-2 focus:ring-[#8E75B2]/30 text-[#382D42]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A3B53] mb-1.5">
                Chức danh / Câu đề từ:
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="Ví dụ: Người ươm mầm cho những câu chuyện AI Studio..."
                className="w-full text-xs px-3.5 py-2 rounded-xl bg-white border border-[#D9C6F5] focus:outline-none focus:ring-2 focus:ring-[#8E75B2]/30 text-[#382D42]"
                required
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-[#4A3B53] mb-1.5">
              Lời chào & Giới thiệu chi tiết của Cô Giáo:
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Chia sẻ về tình yêu dành cho lớp học và cộng đồng sáng tạo..."
              className="w-full text-xs p-3 rounded-xl bg-white border border-[#D9C6F5] focus:outline-none focus:ring-2 focus:ring-[#8E75B2]/30 text-[#382D42] resize-none"
              required
            />
          </div>

          {/* Poetic Quote */}
          <div>
            <label className="block text-xs font-bold text-[#4A3B53] mb-1.5">
              Câu châm ngôn / Trích dẫn thơ mộng:
            </label>
            <input
              type="text"
              value={formData.quote}
              onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
              placeholder="“Mỗi nhân vật được tạo ra là một hạt giống ước mơ...”"
              className="w-full text-xs px-3.5 py-2 rounded-xl bg-white border border-[#D9C6F5] focus:outline-none focus:ring-2 focus:ring-[#8E75B2]/30 text-[#382D42]"
            />
          </div>

          {/* Social Links: Facebook, Discord, AI Studio */}
          <div className="pt-2 border-t border-black/5 space-y-3">
            <div className="text-xs font-bold text-[#4A3B53] flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-[#8E75B2]" />
              <span>Liên kết Mạng Xã Hội Ngoài Lớp Học (Facebook & Discord):</span>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#7A6C88] mb-1">
                  Đường dẫn Facebook (Nhóm / Trang / Profile):
                </label>
                <input
                  type="url"
                  value={formData.facebookUrl}
                  onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                  placeholder="https://facebook.com/groups/..."
                  className="w-full text-xs px-3.5 py-2 rounded-xl bg-white border border-[#D9C6F5] focus:outline-none focus:ring-2 focus:ring-[#8E75B2]/30 text-[#382D42]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#7A6C88] mb-1">
                  Đường dẫn Discord Server (Cộng Đồng Trò Chuyện):
                </label>
                <input
                  type="url"
                  value={formData.discordUrl}
                  onChange={(e) => setFormData({ ...formData, discordUrl: e.target.value })}
                  placeholder="https://discord.gg/..."
                  className="w-full text-xs px-3.5 py-2 rounded-xl bg-white border border-[#D9C6F5] focus:outline-none focus:ring-2 focus:ring-[#8E75B2]/30 text-[#382D42]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#7A6C88] mb-1">
                  Đường dẫn Google AI Studio:
                </label>
                <input
                  type="url"
                  value={formData.aiStudioUrl}
                  onChange={(e) => setFormData({ ...formData, aiStudioUrl: e.target.value })}
                  placeholder="https://aistudio.google.com/..."
                  className="w-full text-xs px-3.5 py-2 rounded-xl bg-white border border-[#D9C6F5] focus:outline-none focus:ring-2 focus:ring-[#8E75B2]/30 text-[#382D42]"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-semibold text-[#7A6C88] hover:bg-gray-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#8E75B2] to-[#B399D4] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer font-heading"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Đã lưu thành công!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-white" />
                  <span>Lưu thông tin cô giáo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
