import React, { useState } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Plus, 
  Pin, 
  Trash2,
  Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CommunityPost } from '../../types';
import { INITIAL_COMMUNITY_POSTS } from '../../lib/initialData';
import { useAuth } from '../../context/AuthContext';
import { soundManager } from '../../lib/sound';

export const CommunityWallView: React.FC = () => {
  const { profile, isAdmin } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_COMMUNITY_POSTS);
  const [newContent, setNewContent] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<'yellow' | 'pink' | 'lavender' | 'cyan' | 'green'>('pink');
  const [selectedSticker, setSelectedSticker] = useState<string>('🌸');
  const [filterMode, setFilterMode] = useState<'newest' | 'likes'>('newest');
  const [activeReplyPostId, setActiveReplyPostId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<{ [postId: string]: string }>({});
  const [repliesMap, setRepliesMap] = useState<{ [postId: string]: string[] }>({
    'post-1': ['Dạ cô giáo! Em tưới nước rồi ạ ♡', 'Sticker sao lấp lánh đẹp quá chừng!']
  });

  const noteColorClasses = {
    yellow: 'note-champagne',
    pink: 'note-rose',
    lavender: 'note-lavender',
    cyan: 'note-cyan',
    green: 'note-mint'
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    if (!profile) {
      alert('Vui lòng đăng nhập từ Cổng Trường để tham gia bảng tin nhé ♡');
      return;
    }

    soundManager.playMagicChime();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      authorId: profile?.uid || 'guest-1',
      authorName: profile?.displayName || 'Bé Mầm Non Mới',
      authorAvatar: profile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      content: newContent.trim(),
      noteColor: selectedColor,
      sticker: selectedSticker,
      likesCount: 1,
      likedBy: [profile?.uid || 'guest-1'],
      repliesCount: 0,
      createdAt: new Date().toISOString()
    };

    setPosts((prev) => [newPost, ...prev]);
    setNewContent('');
  };

  const handleLikePost = (postId: string) => {
    soundManager.playMagicChime();
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = p.likedBy?.includes(profile?.uid || 'guest');
          return {
            ...p,
            likesCount: isLiked ? p.likesCount - 1 : p.likesCount + 1,
            likedBy: isLiked
              ? p.likedBy.filter((uid) => uid !== (profile?.uid || 'guest'))
              : [...(p.likedBy || []), profile?.uid || 'guest']
          };
        }
        return p;
      })
    );
  };

  const handleDeletePost = (postId: string) => {
    soundManager.playBoop();
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleAddReply = (postId: string) => {
    const text = replyText[postId]?.trim();
    if (!text) return;
    soundManager.playMagicChime();

    setRepliesMap((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), `${profile?.displayName || 'Bé Ngoan'}: ${text}`]
    }));

    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, repliesCount: p.repliesCount + 1 } : p))
    );

    setReplyText((prev) => ({ ...prev, [postId]: '' }));
  };

  const displayPosts = [...posts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    if (filterMode === 'likes') return b.likesCount - a.likesCount;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Header Banner - Luxury & Ethereal (No mascot) */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-[#EAE2F8]/70 via-[#FDE5EF]/70 to-[#FEF5E7]/70">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">✨</span>
            <span className="text-xs uppercase font-bold tracking-widest text-[#8E75B2] bg-white/70 px-3 py-1 rounded-full border border-white font-caption">
              Bảng Ghi Chú Nghệ Thuật
            </span>
          </div>
          <h1 className="font-heading font-bold text-2xl md:text-4xl text-[#3F334D] mb-1">
            BẢNG TIN CỘNG ĐỒNG LỚP HỌC
          </h1>
          <p className="text-xs md:text-sm text-[#7A6C88] font-luxury italic">
            Dán những mảnh giấy note nhỏ nhắn, chia sẻ cảm xúc và tương tác cùng các bạn nhỏ trong trường!
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/70 px-4 py-2.5 rounded-2xl border border-white shrink-0">
          <Sparkles className="w-5 h-5 text-[#8E75B2]" />
          <span className="text-xs font-bold text-[#3F334D]">Atelier Memo</span>
        </div>
      </div>

      {/* Create Sticky Note Form Card */}
      <div className="glass-panel rounded-3xl p-6 shadow-sm">
        <h3 className="font-heading font-bold text-base text-[#3F334D] mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#8E75B2]" />
          <span>Dán một mảnh giấy note mới lên bảng</span>
        </h3>

        <form onSubmit={handleCreatePost} className="space-y-3">
          <textarea
            rows={3}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Viết một lời nhắn dễ thương cho cả lớp nghe nè..."
            className="w-full p-4 rounded-2xl bg-white/70 border border-white text-sm text-[#3F334D] placeholder-[#9F91A8] focus:outline-none focus:ring-2 focus:ring-[#D2C8F2]"
            required
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {/* Pick Color */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#3F334D] font-caption">Màu giấy:</span>
              {(['yellow', 'pink', 'lavender', 'cyan', 'green'] as const).map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                    selectedColor === color ? 'scale-125 border-[#3F334D]' : 'border-transparent'
                  }`}
                  style={{
                    backgroundColor:
                      color === 'yellow' ? '#FEF6E8' :
                      color === 'pink' ? '#FDE8F1' :
                      color === 'lavender' ? '#EFE8FA' :
                      color === 'cyan' ? '#E0F2FE' : '#E8FDF3'
                  }}
                />
              ))}
            </div>

            {/* Pick Sticker */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#3F334D] font-caption">Sticker:</span>
              {['🌸', '⭐', '👑', '🐶', '🐱', '🎵', '🍬'].map((stk) => (
                <button
                  type="button"
                  key={stk}
                  onClick={() => setSelectedSticker(stk)}
                  className={`p-1 text-base rounded-lg transition-transform cursor-pointer ${
                    selectedSticker === stk ? 'scale-130 bg-white shadow-xs' : 'hover:scale-110'
                  }`}
                >
                  {stk}
                </button>
              ))}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#EAE2F8] to-[#FDE5EF] font-bold text-xs text-[#3F334D] border border-white shadow-xs hover:shadow cursor-pointer font-heading"
            >
              DÁN LÊN BẢNG ♡
            </button>
          </div>
        </form>
      </div>

      {/* Wall Filters Bar */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-[#3F334D]">
          Tổng cộng <strong className="text-[#8E75B2]">{displayPosts.length}</strong> mẩu giấy note
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterMode('newest')}
            className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'newest'
                ? 'bg-[#9078B4] text-white shadow-2xs'
                : 'bg-white/70 text-[#4A3B53] border border-white'
            }`}
          >
            Mới nhất
          </button>
          <button
            onClick={() => setFilterMode('likes')}
            className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'likes'
                ? 'bg-[#9078B4] text-white shadow-2xs'
                : 'bg-white/70 text-[#4A3B53] border border-white'
            }`}
          >
            Nhiều tim nhất
          </button>
        </div>
      </div>

      {/* Sticky Notes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayPosts.map((post) => {
          const colorClass = noteColorClasses[post.noteColor] || 'note-rose';
          const isLiked = post.likedBy?.includes(profile?.uid || 'guest');
          const isExpanded = activeReplyPostId === post.id;
          const replies = repliesMap[post.id] || [];

          return (
            <div
              key={post.id}
              className={`p-5 rounded-3xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between ${colorClass}`}
            >
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-black/5 mb-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName}
                      className="w-7 h-7 rounded-full object-cover border border-white shadow-2xs"
                    />
                    <span className="font-heading font-bold text-xs text-[#3F334D] truncate max-w-[90px]">
                      {post.authorName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {post.sticker && <span className="text-lg">{post.sticker}</span>}
                    {post.isPinned && <Pin className="w-3.5 h-3.5 text-[#E2799F] fill-[#E2799F]" />}
                  </div>
                </div>

                <p className="text-xs text-[#4A3B53] leading-relaxed mb-3 whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>

              <div>
                <div className="pt-2.5 border-t border-black/5 flex items-center justify-between text-xs text-[#7A6C88]">
                  <button
                    onClick={() => handleLikePost(post.id)}
                    className="flex items-center gap-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'text-[#E2799F] fill-[#E2799F]' : 'text-[#7A6C88]'}`} />
                    <span className="font-bold">{post.likesCount}</span>
                  </button>

                  <button
                    onClick={() => setActiveReplyPostId(isExpanded ? null : post.id)}
                    className="flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{replies.length} phản hồi</span>
                  </button>

                  {(isAdmin || post.authorId === profile?.uid) && (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="text-rose-500 hover:text-rose-700 cursor-pointer"
                      title="Gỡ giấy note"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-2 border-t border-black/5 space-y-2">
                    <div className="max-h-28 overflow-y-auto space-y-1">
                      {replies.map((rep, idx) => (
                        <div key={idx} className="text-[11px] bg-white/70 p-2 rounded-xl text-[#3F334D]">
                          {rep}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-1">
                      <input
                        type="text"
                        placeholder="Trả lời..."
                        value={replyText[post.id] || ''}
                        onChange={(e) =>
                          setReplyText((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        className="flex-1 px-3 py-1 rounded-xl bg-white border border-white text-[11px] text-[#3F334D] focus:outline-none"
                      />
                      <button
                        onClick={() => handleAddReply(post.id)}
                        className="px-3 py-1 bg-[#3F334D] text-white text-[11px] rounded-xl font-bold cursor-pointer"
                      >
                        Gửi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
