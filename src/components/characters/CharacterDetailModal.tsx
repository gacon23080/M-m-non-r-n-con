import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Share2, 
  ExternalLink, 
  Eye, 
  Sparkles, 
  Send, 
  MessageCircle, 
  Tag, 
  User,
  Edit3,
  Trash2
} from 'lucide-react';
import { Character } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { soundManager } from '../../lib/sound';

interface CharacterDetailModalProps {
  character: Character;
  onClose: () => void;
  onLike?: (id: string) => void;
  onEdit?: (character: Character) => void;
  onDelete?: (characterId: string) => void;
}

interface CommentItem {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

export const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({
  character,
  onClose,
  onLike,
  onEdit,
  onDelete
}) => {
  const { profile, isAdmin, toggleFavorite } = useAuth();
  const [activeTab, setActiveTab] = useState<'story' | 'personality' | 'relations' | 'gallery'>('story');
  const [likesCount, setLikesCount] = useState<number>(character.likesCount);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [comments, setComments] = useState<CommentItem[]>([
    {
      id: 'c1',
      authorName: 'Bé Rắn Lớp Trưởng',
      authorAvatar: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=100&auto=format&fit=crop&q=80',
      text: 'Bé này chăm ngoan và đáng yêu quá chừng! Lớp mình cho bé điểm 10 bé ngoan nha ♡',
      createdAt: 'Hôm qua lúc 15:30'
    },
    {
      id: 'c2',
      authorName: 'Mây Bồng Bềnh',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      text: 'Thiết lập tính cách quá đỉnh! Mình đã trò chuyện thử trên Google AI Studio rồi, cuốn xỉu luôn!',
      createdAt: '2 giờ trước'
    }
  ]);
  const [commentInput, setCommentInput] = useState<string>('');

  const isFavorited = profile?.favorites?.includes(character.id) || false;

  const handleLike = () => {
    soundManager.playMagicChime();
    setLikesCount((prev) => prev + 1);
    toggleFavorite(character.id);
    if (onLike) onLike(character.id);
  };

  const handleShare = () => {
    soundManager.playBoop();
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    soundManager.playMagicChime();

    const newComment: CommentItem = {
      id: `comm-${Date.now()}`,
      authorName: profile?.displayName || 'Bé Mầm Non Mới',
      authorAvatar: profile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      text: commentInput.trim(),
      createdAt: 'Vừa xong'
    };

    setComments((prev) => [newComment, ...prev]);
    setCommentInput('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-[#E8DFF3] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header with Close & Actions */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#FFF0F5] via-[#E9E2FA] to-[#FCF0DB] border-b border-[#E8DFF3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold bg-white/90 text-[#62566F] px-3 py-1 rounded-full border border-[#D2C8F2] shadow-xs">
              {character.category}
            </span>
            <span className="text-xs text-[#93879E]">Tác giả: {character.creator}</span>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && onEdit && (
              <button
                onClick={() => {
                  soundManager.playBoop();
                  onClose();
                  onEdit(character);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#8E75B2] hover:bg-[#F0E6FA] text-xs font-bold border border-[#D2C8F2] shadow-xs cursor-pointer transition-all"
                title="Cô giáo chỉnh sửa bé này"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Sửa bé này</span>
              </button>
            )}

            {isAdmin && onDelete && (
              <button
                onClick={() => {
                  soundManager.playBoop();
                  if (window.confirm(`Cô giáo có chắc chắn muốn xóa bé "${character.name}" khỏi lớp không?`)) {
                    onClose();
                    onDelete(character.id);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-red-500 hover:bg-red-50 text-xs font-bold border border-red-200 shadow-xs cursor-pointer transition-all"
                title="Cô giáo xóa bé này"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa</span>
              </button>
            )}

            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/80 hover:bg-white text-[#62566F] border border-[#E8DFF3] transition-all cursor-pointer shadow-xs"
              title="Sao chép liên kết"
            >
              <Share2 className="w-4 h-4 text-[#A594D6]" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/80 hover:bg-white text-[#62566F] hover:text-[#E11D48] border border-[#E8DFF3] transition-all cursor-pointer shadow-xs"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Top Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Artwork Column */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative w-full aspect-3/4 rounded-3xl overflow-hidden shadow-lg border-2 border-[#E8DFF3] bg-[#FFF0F5]">
                <img
                  src={character.avatarUrl || character.coverUrl}
                  alt={character.name}
                  className="w-full h-full object-cover"
                />
                {character.isFeatured && (
                  <div className="absolute top-3 left-3 bg-[#FFF0F5]/90 backdrop-blur-sm border border-[#FCD3E2] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-[#F43F5E]" />
                    <span className="text-xs font-bold text-[#E11D48]">Bé Nổi Bật ♡</span>
                  </div>
                )}
              </div>

              {/* Action Buttons under artwork */}
              <div className="w-full mt-4 flex items-center gap-3">
                <button
                  onClick={handleLike}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer shadow-md ${
                    isFavorited
                      ? 'bg-[#F43F5E] text-white shadow-[#F43F5E]/30'
                      : 'bg-gradient-to-r from-[#D2C8F2] to-[#FCD3E2] text-[#62566F] hover:opacity-95'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-white' : ''}`} />
                  <span>{isFavorited ? 'Đã yêu thích' : 'Yêu thích bé'} ({likesCount})</span>
                </button>

                <a
                  href={character.googleAiStudioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-4 py-3 bg-[#62566F] hover:bg-[#4A3E56] text-white rounded-2xl font-bold text-sm transition-all shadow-md"
                  title="Mở Google AI Studio để trò chuyện cùng bé"
                >
                  <span>AI Studio</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {copiedLink && (
                <div className="mt-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Đã sao chép liên kết chia sẻ!
                </div>
              )}
            </div>

            {/* Info Column */}
            <div className="md:col-span-7 flex flex-col justify-between">
              <div>
                <h1 className="font-heading font-bold text-2xl md:text-3xl text-[#62566F] mb-2">
                  {character.name}
                </h1>

                <div className="flex items-center gap-4 text-xs text-[#93879E] mb-4">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#A594D6]" />
                    Tạo bởi: <strong className="text-[#62566F]">{character.creator}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-[#A594D6]" />
                    {character.viewsCount} lượt xem
                  </span>
                </div>

                {/* Short Intro Quote */}
                <div className="p-4 rounded-2xl bg-[#FFF0F5] border border-[#FCD3E2] text-sm text-[#62566F] italic leading-relaxed mb-4">
                  "{character.shortDescription}"
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {character.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="flex items-center gap-1 text-xs font-semibold bg-[#E9E2FA] text-[#62566F] px-3 py-1 rounded-full border border-[#D2C8F2]"
                    >
                      <Tag className="w-3 h-3 text-[#A594D6]" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Navigation Tabs for Details */}
                <div className="flex items-center gap-2 border-b border-[#E8DFF3] pb-2 mb-4">
                  <button
                    onClick={() => setActiveTab('story')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'story'
                        ? 'bg-[#D2C8F2] text-[#62566F]'
                        : 'text-[#93879E] hover:text-[#62566F]'
                    }`}
                  >
                    Cốt truyện
                  </button>
                  <button
                    onClick={() => setActiveTab('personality')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'personality'
                        ? 'bg-[#D2C8F2] text-[#62566F]'
                        : 'text-[#93879E] hover:text-[#62566F]'
                    }`}
                  >
                    Tính cách
                  </button>
                  <button
                    onClick={() => setActiveTab('relations')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'relations'
                        ? 'bg-[#D2C8F2] text-[#62566F]'
                        : 'text-[#93879E] hover:text-[#62566F]'
                    }`}
                  >
                    Mối quan hệ
                  </button>
                  <button
                    onClick={() => setActiveTab('gallery')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'gallery'
                        ? 'bg-[#D2C8F2] text-[#62566F]'
                        : 'text-[#93879E] hover:text-[#62566F]'
                    }`}
                  >
                    Bộ sưu tập ảnh ({character.gallery?.length || 1})
                  </button>
                </div>

                {/* Tab Contents */}
                <div className="text-sm text-[#62566F] leading-relaxed min-h-[140px]">
                  {activeTab === 'story' && (
                    <div className="space-y-3">
                      <p>{character.fullDescription}</p>
                      <div className="p-3 bg-[#FCF0DB]/60 rounded-xl border border-[#FCF0DB] text-xs">
                        <strong>Tiểu sử nền:</strong> {character.backgroundStory}
                      </div>
                    </div>
                  )}

                  {activeTab === 'personality' && (
                    <div className="p-4 bg-[#E9E2FA]/40 rounded-2xl border border-[#D2C8F2] space-y-2">
                      <div className="font-bold text-[#A594D6]">Đặc trưng tính cách:</div>
                      <p>{character.personality}</p>
                    </div>
                  )}

                  {activeTab === 'relations' && (
                    <div className="p-4 bg-[#FFF0F5] rounded-2xl border border-[#FCD3E2] space-y-2">
                      <div className="font-bold text-[#F472B6]">Các mối quan hệ thân thiết:</div>
                      <p>{character.relationships}</p>
                    </div>
                  )}

                  {activeTab === 'gallery' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {(character.gallery?.length ? character.gallery : [character.avatarUrl]).map((img, idx) => (
                        <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-[#E8DFF3] shadow-xs">
                          <img src={img} alt={`${character.name} ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Classroom Comments Section */}
          <div className="pt-6 border-t border-[#E8DFF3]">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-[#A594D6]" />
              <h3 className="font-heading font-bold text-lg text-[#62566F]">
                Lời nhắn gửi từ các bạn trong lớp ({comments.length})
              </h3>
            </div>

            {/* Comment Input */}
            <form onSubmit={handleAddComment} className="flex gap-2 mb-6">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Gửi một lời khen hoặc lời chúc ngọt ngào cho bé..."
                className="flex-1 px-4 py-3 rounded-2xl bg-[#FFF0F5]/60 border border-[#E8DFF3] text-sm text-[#62566F] placeholder-[#93879E] focus:outline-none focus:ring-2 focus:ring-[#D2C8F2]"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#D2C8F2] to-[#FCD3E2] font-bold text-sm text-[#62566F] hover:shadow-md transition-all cursor-pointer"
              >
                <span>Gửi</span>
                <Send className="w-3.5 h-3.5 text-[#A594D6]" />
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
              {comments.map((comm) => (
                <div
                  key={comm.id}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FFF0F5]/40 border border-[#F1EBF9]"
                >
                  <img
                    src={comm.authorAvatar}
                    alt={comm.authorName}
                    className="w-8 h-8 rounded-full object-cover border border-[#D2C8F2]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#62566F]">{comm.authorName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#93879E]">{comm.createdAt}</span>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              soundManager.playBoop();
                              setComments((prev) => prev.filter((c) => c.id !== comm.id));
                            }}
                            className="p-1 rounded text-rose-500 hover:bg-rose-100 transition-colors cursor-pointer"
                            title="Xóa bình luận này (Cô Giáo)"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-[#62566F] mt-1 leading-relaxed">{comm.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
