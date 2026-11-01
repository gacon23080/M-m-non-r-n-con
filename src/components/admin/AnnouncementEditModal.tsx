import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Announcement } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface AnnouncementEditModalProps {
  isOpen: boolean;
  announcement: Announcement | null;
  onClose: () => void;
  onSave: (ann: Announcement) => void;
}

export const AnnouncementEditModal: React.FC<AnnouncementEditModalProps> = ({
  isOpen,
  announcement,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [content, setAnnContent] = useState('');
  const [type, setAnnType] = useState<'notice' | 'event' | 'update'>('notice');

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title);
      setAnnContent(announcement.content);
      setAnnType(announcement.type as any);
    }
  }, [announcement]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcement) return;
    onSave({
      ...announcement,
      title: title.trim(),
      content: content.trim(),
      type
    });
  };

  if (!isOpen || !announcement) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[40px] border-4 border-[#FDE5EF] p-8 max-w-md w-full shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#FFF0F5] text-[#8E75B2] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h3 className="font-heading font-black text-2xl text-[#3F334D] leading-tight">
            Sửa Thông Báo ♡
          </h3>
          <p className="text-xs text-[#8E75B2] font-luxury italic mt-1">
            Cập nhật nội dung bảng tin cho cả lớp cùng xem nhé!
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[#62566F] mb-1.5 ml-1">
              Tiêu đề thông báo:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[#FFF0F5]/50 border-2 border-[#F1EBF9] text-xs text-[#3F334D] focus:border-[#D2C8F2] focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#62566F] mb-1.5 ml-1">
              Loại bảng tin:
            </label>
            <select
              value={type}
              onChange={(e: any) => setAnnType(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[#FFF0F5]/50 border-2 border-[#F1EBF9] text-xs text-[#3F334D] focus:border-[#D2C8F2] focus:outline-none cursor-pointer transition-colors"
            >
              <option value="notice">Thông báo chung</option>
              <option value="event">Sự kiện lớp</option>
              <option value="update">Cập nhật ứng dụng</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#62566F] mb-1.5 ml-1">
              Nội dung thông điệp:
            </label>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setAnnContent(e.target.value)}
              className="w-full p-4 rounded-2xl bg-[#FFF0F5]/50 border-2 border-[#F1EBF9] text-xs text-[#3F334D] focus:border-[#D2C8F2] focus:outline-none transition-colors resize-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-full bg-gradient-to-r from-[#8E75B2] to-[#A594D6] text-white font-black text-sm tracking-widest uppercase shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            <span>Lưu thay đổi ngay ♡</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
};
