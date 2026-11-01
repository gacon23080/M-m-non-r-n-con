import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  Sparkles, 
  Pin, 
  ShieldCheck, 
  Trash2,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnonymousMessage } from '../../types';
import { INITIAL_ANONYMOUS_MESSAGES } from '../../lib/initialData';
import { useAuth } from '../../context/AuthContext';
import { soundManager } from '../../lib/sound';

export const SecretInboxView: React.FC = () => {
  const { profile, isAdmin } = useAuth();
  const [messages, setMessages] = useState<AnonymousMessage[]>(INITIAL_ANONYMOUS_MESSAGES);
  const [nickname, setNickname] = useState<string>(profile?.displayName || 'Một chiếc bé giấu tên');
  const [messageText, setMessageText] = useState<string>('');
  const [isConfidential, setIsConfidential] = useState<boolean>(true); // Default secret letter
  const [isSent, setIsSent] = useState<boolean>(false);
  const [replyInput, setReplyInput] = useState<{ [id: string]: string }>({});

  const predefinedNicknames = [
    'Một chiếc bé giấu tên',
    'Bé Rắn Con #008',
    'Bé Mèo Thích Kẹo',
    'Fan Cứng Cô Giáo',
    'Ẩn Danh Đáng Yêu'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    soundManager.playMagicChime();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });

    const newMsg: AnonymousMessage = {
      id: `anon-${Date.now()}`,
      authorId: profile?.uid || 'guest-anon',
      nickname: nickname.trim() || profile?.displayName || 'Một chiếc bé giấu tên',
      message: messageText.trim(),
      status: 'approved',
      isPinned: false,
      isConfidential: isConfidential,
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [newMsg, ...prev]);
    setMessageText('');
    setIsSent(true);
    setTimeout(() => setIsSent(false), 3500);
  };

  const handleDelete = (id: string) => {
    soundManager.playBoop();
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const handleTogglePin = (id: string) => {
    soundManager.playBoop();
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isPinned: !m.isPinned } : m))
    );
  };

  const handleSendReply = (id: string) => {
    const replyText = replyInput[id]?.trim();
    if (!replyText) return;
    soundManager.playMagicChime();

    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, reply: replyText } : m))
    );
    setReplyInput((prev) => ({ ...prev, [id]: '' }));
  };

  const approvedMessages = messages.filter((m) => isAdmin || m.status === 'approved');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-[#EAE2F8]/70 via-[#FDE5EF]/70 to-[#FEF5E7]/70">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">💌</span>
            <span className="text-xs uppercase font-bold tracking-widest text-[#8E75B2] bg-white/70 px-3 py-1 rounded-full border border-white font-caption">
              Hòm Thư Kín Đáo • Cô Giáo & Tác Giả
            </span>
          </div>
          <h1 className="font-heading font-bold text-2xl md:text-4xl text-[#3F334D] mb-1">
            HÒM THƯ BÍ MẬT ♡
          </h1>
          <p className="text-xs md:text-sm text-[#7A6C88] font-luxury italic">
            Nơi gửi gắm những lời tỏ tình, câu hỏi hay thư tâm sự chỉ duy nhất bạn và Cô Giáo Admin đọc được!
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/70 px-4 py-2.5 rounded-2xl border border-white shrink-0">
          <Mail className="w-5 h-5 text-[#8E75B2]" />
          <span className="text-xs font-bold text-[#3F334D]">Atelier Mail</span>
        </div>
      </div>

      {/* Submission Form Card */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-black/5">
          <Mail className="w-5 h-5 text-[#8E75B2]" />
          <h2 className="font-heading font-bold text-base text-[#3F334D]">
            Gửi một phong thư tâm sự bí mật
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nickname Selection */}
          <div>
            <label className="block text-xs font-bold text-[#3F334D] mb-1.5 font-caption uppercase tracking-wider">
              Biệt danh người gửi:
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {predefinedNicknames.map((nick) => (
                <button
                  type="button"
                  key={nick}
                  onClick={() => {
                    soundManager.playBoop();
                    setNickname(nick);
                  }}
                  className={`text-xs px-3.5 py-1 rounded-full border transition-all cursor-pointer ${
                    nickname === nick
                      ? 'bg-[#9078B4] text-white border-[#9078B4] font-bold shadow-2xs'
                      : 'bg-white/70 text-[#4A3B53] border-white hover:bg-white'
                  }`}
                >
                  {nick}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Hoặc tự gõ biệt danh của bạn..."
              className="w-full md:w-80 px-4 py-2 rounded-2xl bg-white/70 border border-white text-xs text-[#3F334D] focus:outline-none focus:ring-2 focus:ring-[#D2C8F2]"
            />
          </div>

          {/* Message Content */}
          <div>
            <label className="block text-xs font-bold text-[#3F334D] mb-1.5 font-caption uppercase tracking-wider">
              Nội dung thư tâm sự:
            </label>
            <textarea
              rows={4}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Thì thầm những dòng tâm sự kín đáo gửi đến cô giáo..."
              className="w-full p-4 rounded-2xl bg-white/70 border border-white text-sm text-[#3F334D] placeholder-[#9F91A8] focus:outline-none focus:ring-2 focus:ring-[#D2C8F2]"
              required
            />
          </div>

          {/* Confidentiality Option */}
          <div className="flex items-center gap-2 p-3 bg-purple-50/70 rounded-2xl border border-purple-100">
            <input
              type="checkbox"
              id="confidential-check"
              checked={isConfidential}
              onChange={(e) => setIsConfidential(e.target.checked)}
              className="w-4 h-4 accent-[#8E75B2] cursor-pointer"
            />
            <label htmlFor="confidential-check" className="text-xs text-[#4A3C56] font-semibold cursor-pointer">
              🔒 Thư tâm sự bí mật (Chỉ duy nhất mình bạn và Cô Giáo Admin mới đọc được)
            </label>
          </div>

          {/* Submit Button & Sent Banner */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-[#7A6C88] font-luxury italic">
              🔒 Được bảo mật danh tính & quyền riêng tư.
            </span>

            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-[#EAE2F8] to-[#FDE5EF] font-bold text-xs text-[#3F334D] border border-white shadow-md hover:shadow-lg hover:scale-102 transition-all cursor-pointer font-heading"
            >
              <span>BỎ THƯ VÀO HÒM ♡</span>
              <Send className="w-3.5 h-3.5 text-[#8E75B2]" />
            </button>
          </div>

          {isSent && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold text-center animate-in zoom-in-95">
              ✨ Phong thư của bạn đã được bỏ vào Hòm Thư thành công! Cô Giáo sẽ đọc và trả lời cho bạn nhé ♡
            </div>
          )}
        </form>
      </div>

      {/* Public / Confidential Letter Wall */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <h3 className="font-heading font-bold text-lg text-[#3F334D]">
              Hòm thư tâm sự ({approvedMessages.length})
            </h3>
          </div>
          {isAdmin && (
            <span className="text-xs bg-white/80 text-[#3F334D] font-bold px-3.5 py-1 rounded-full border border-white flex items-center gap-1 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8E75B2]" />
              <span>Cô Giáo Admin (Xem được tất cả thư tâm sự)</span>
            </span>
          )}
        </div>

        {/* Letters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {approvedMessages.map((msg) => {
            const isOwner = msg.authorId === profile?.uid;
            const canRead = !msg.isConfidential || isOwner || isAdmin;

            return (
              <div
                key={msg.id}
                className={`p-5 rounded-3xl border transition-all relative flex flex-col justify-between ${
                  msg.isPinned
                    ? 'bg-gradient-to-br from-[#FFF5F8] to-white border-pink-200/80 shadow-md'
                    : 'glass-panel border-white shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#7A6C88] pb-2 border-b border-black/5 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#E2799F]" />
                      <strong className="text-[#3F334D] font-heading">{msg.nickname}</strong>
                      {msg.isConfidential && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Thư Bí Mật
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {msg.isPinned && (
                        <span className="text-[10px] font-bold bg-[#FFF0F5] text-[#E2799F] px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Pin className="w-2.5 h-2.5" /> Ghim
                        </span>
                      )}
                      <span className="text-[10px]">
                        {new Date(msg.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  {canRead ? (
                    <p className="text-xs md:text-sm text-[#4A3B53] leading-relaxed mb-4 italic font-luxury">
                      "{msg.message}"
                    </p>
                  ) : (
                    <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-center my-3">
                      <Lock className="w-6 h-6 text-[#8E75B2] mx-auto mb-1.5" />
                      <p className="text-xs text-[#6D5E7B] font-bold">
                        🔒 Thư tâm sự bí mật
                      </p>
                      <span className="text-[10px] text-[#827290] italic">
                        (Chỉ duy nhất tác giả và Cô Giáo Admin mới đọc được)
                      </span>
                    </div>
                  )}

                  {msg.reply && canRead && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FEF8ED]/80 to-[#FFF4F8]/80 border border-white mb-3">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8E75B2] mb-1 font-caption">
                        <span>🌸 Lời hồi đáp từ Cô Giáo Admin:</span>
                      </div>
                      <p className="text-xs text-[#4A3B53] leading-relaxed">
                        {msg.reply}
                      </p>
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <div className="pt-3 border-t border-black/5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleTogglePin(msg.id)}
                          className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#3F334D]"
                        >
                          {msg.isPinned ? 'Bỏ ghim' : 'Ghim thư'}
                        </button>
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center gap-1 cursor-pointer"
                          title="Xóa thư tâm sự (Cô Giáo)"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Xóa thư</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Viết lời hồi đáp cho thư này..."
                        value={replyInput[msg.id] || ''}
                        onChange={(e) =>
                          setReplyInput((prev) => ({ ...prev, [msg.id]: e.target.value }))
                        }
                        className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-white text-xs text-[#3F334D] focus:outline-none"
                      />
                      <button
                        onClick={() => handleSendReply(msg.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#9078B4] text-white text-xs font-bold hover:bg-[#7E66A2] cursor-pointer"
                      >
                        Trả lời
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
