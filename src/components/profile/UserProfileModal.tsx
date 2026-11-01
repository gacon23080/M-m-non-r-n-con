import React, { useState } from 'react';
import { 
  X, 
  User, 
  Heart, 
  Sparkles, 
  Edit3, 
  Check, 
  LogOut, 
  LogIn, 
  ShieldCheck, 
  Award 
} from 'lucide-react';
import { Character } from '../../types';
import { INITIAL_STICKERS } from '../../lib/initialData';
import { useAuth } from '../../context/AuthContext';
import { soundManager } from '../../lib/sound';
import { compressImageFile } from '../../lib/imageCompressor';
import { motion } from 'motion/react';

interface UserProfileModalProps {
  characters: Character[];
  onClose: () => void;
  onOpenCharacterDetail: (char: Character) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  characters,
  onClose,
  onOpenCharacterDetail
}) => {
  const { profile, isAdmin, updateProfileData, logout, loginWithGoogle } = useAuth();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(profile?.displayName || '');
  const [editBio, setEditBio] = useState<string>(profile?.bio || '');
  const [editAvatar, setEditAvatar] = useState<string>(profile?.photoURL || '');

  const favoriteChars = characters.filter((c) => profile?.favorites?.includes(c.id));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playMagicChime();
    await updateProfileData({
      displayName: editName.trim() || 'Bé Mầm Non',
      bio: editBio.trim() || 'Thành viên lớp Mầm Non Rắn Con ♡',
      photoURL: editAvatar.trim() || profile?.photoURL
    });
    setIsEditing(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 md:p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#E8DFF3] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#D2C8F2] via-[#FCD3E2] to-[#FCF0DB] border-b border-[#E8DFF3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#62566F]" />
            <h2 className="font-heading font-bold text-lg text-[#62566F]">
              Hồ Sơ Bé Ngoan Lớp Học
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/80 hover:bg-white text-[#62566F] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Profile Overview */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-3xl bg-[#FFF0F5]/50 border border-[#FCD3E2]">
            <img
              src={profile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
              alt={profile?.displayName}
              className="w-20 h-20 rounded-full object-cover border-3 border-[#D2C8F2] shadow-md"
            />

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-heading font-bold text-xl text-[#62566F]">
                    {profile?.displayName || 'Khách Ghé Thăm'}
                  </h3>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-0.5">
                    <span className="text-[10px] bg-[#E9E2FA] text-[#62566F] font-bold px-2 py-0.5 rounded-full border border-[#D2C8F2]">
                      {isAdmin ? 'Cô Giáo Phụ Trách (Admin)' : 'Học Sinh Chăm Ngoan'}
                    </span>
                    <span className="text-[10px] text-[#93879E]">
                      Tham gia: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : 'Hôm nay'}
                    </span>
                  </div>
                </div>

                {profile && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="self-center sm:self-start flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-xs font-bold text-[#62566F] border border-[#E8DFF3] hover:bg-[#FFF0F5] transition-all cursor-pointer shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#A594D6]" />
                    <span>{isEditing ? 'Hủy sửa' : 'Chỉnh sửa'}</span>
                  </button>
                )}
              </div>

                {/* Wallet Info - Real-time sync */}
                <div className="mt-3 flex items-center gap-3 bg-white/80 px-4 py-2 rounded-2xl border border-white shadow-xs w-fit">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FCD34D] to-[#F59E0B] flex items-center justify-center text-white shadow-xs animate-pulse">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-[#827290] block font-caption">
                      Ví Xu Bé Ngoan
                    </span>
                    <span className="text-sm font-bold text-[#4A3C56] font-heading">
                      {profile?.coins ?? 200} Xu
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#93879E] mt-3 leading-relaxed">
                  {profile?.bio || 'Chưa có tiểu sử giới thiệu.'}
                </p>
              </div>
            </div>

          {/* Edit Form */}
          {isEditing && (
            <form onSubmit={handleSaveProfile} className="p-4 rounded-3xl bg-white border border-[#D2C8F2] shadow-sm space-y-3">
              <h4 className="font-heading font-bold text-sm text-[#62566F]">
                Cập nhật thông tin bé ngoan
              </h4>
              <div>
                <label className="block text-[11px] font-bold text-[#62566F] mb-1">
                  Tên hiển thị:
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FFF0F5]/50 border border-[#E8DFF3] text-xs text-[#62566F] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#62566F] mb-1">
                  Ảnh đại diện:
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    placeholder="Dán link ảnh hoặc tải từ máy..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#FFF0F5]/50 border border-[#E8DFF3] text-xs text-[#62566F] focus:outline-none"
                  />
                  <label className="px-3 py-2 rounded-xl bg-[#E9E2FA] hover:bg-[#D2C8F2] text-[#62566F] font-bold text-xs cursor-pointer transition-colors shrink-0 flex items-center gap-1">
                    <span>Tải từ máy 📁</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const dataUrl = await compressImageFile(file);
                            if (dataUrl) setEditAvatar(dataUrl);
                          } catch (err) {
                            console.warn('Image error:', err);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#62566F] mb-1">
                  Giới thiệu ngắn:
                </label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FFF0F5]/50 border border-[#E8DFF3] text-xs text-[#62566F] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#93879E] cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-full bg-[#A594D6] text-white text-xs font-bold hover:bg-[#8F7BBF] cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          )}

          {/* Stickers Owned */}
          <div>
            <h4 className="font-heading font-bold text-sm text-[#62566F] mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Nhãn dán đã thu thập ({profile?.stickers?.length || 1})</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {INITIAL_STICKERS.filter((s) => profile?.stickers?.includes(s.id) || s.id === 'stk-snake').map((stk) => (
                <div
                  key={stk.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#FFF0F5] border border-[#FCD3E2] shadow-xs"
                >
                  <span className="text-xl">{stk.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-[#62566F]">{stk.name}</div>
                    <div className="text-[9px] text-[#93879E]">{stk.rarity}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Favorites List */}
          <div>
            <h4 className="font-heading font-bold text-sm text-[#62566F] mb-3 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-[#F43F5E]" />
              <span>Những bé nhân vật yêu thích ({favoriteChars.length})</span>
            </h4>

            {favoriteChars.length === 0 ? (
              <div className="p-4 rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-xs text-[#93879E] text-center">
                Bạn chưa thêm bé nhân vật nào vào mục yêu thích. Hãy bấm vào biểu tượng trái tim trên các thẻ nhân vật nhé!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {favoriteChars.map((char) => (
                  <div
                    key={char.id}
                    onClick={() => {
                      onClose();
                      onOpenCharacterDetail(char);
                    }}
                    className="p-2 rounded-2xl bg-[#FFF0F5]/50 border border-[#E8DFF3] hover:border-[#D2C8F2] flex items-center gap-2 cursor-pointer transition-all hover:scale-102"
                  >
                    <img
                      src={char.avatarUrl}
                      alt={char.name}
                      className="w-9 h-9 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-[#62566F] truncate">{char.name}</div>
                      <div className="text-[10px] text-[#93879E] truncate">{char.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Account Actions / Log in options */}
          <div className="pt-4 border-t border-[#F1EBF9] flex flex-col gap-3">
            {profile ? (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-full bg-[#62566F] text-white text-xs font-bold hover:bg-[#4A3E56] transition-all cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="font-heading font-bold text-xs text-[#62566F]">
                  Đăng nhập tài khoản của bạn:
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={loginWithGoogle}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#EAE2F8] hover:bg-[#D2C8F2] text-[#4A3B53] text-xs font-bold transition-all cursor-pointer border border-[#D2C8F2]"
                  >
                    <span>🌐 Gmail (Google)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
};
