import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Sparkles, 
  Pin, 
  ShieldCheck, 
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Image as ImageIcon,
  X as XIcon
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  limit 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import confetti from 'canvas-confetti';
import { AnonymousMessage } from '../../types';
import { INITIAL_ANONYMOUS_MESSAGES } from '../../lib/initialData';
import { useAuth } from '../../context/AuthContext';
import { soundManager } from '../../lib/sound';
import { compressImageFile } from '../../lib/imageCompressor';
import { motion } from 'motion/react';

export const SecretInboxView: React.FC = () => {
  const { profile, isAdmin, currentUser } = useAuth();
  const [messages, setMessages] = useState<AnonymousMessage[]>([]);
  const [nickname, setNickname] = useState<string>(profile?.displayName || 'Một chiếc bé giấu tên');
  const [messageText, setMessageText] = useState<string>('');
  const [imageAttachment, setImageAttachment] = useState<string>('');
  const [isConfidential, setIsConfidential] = useState<boolean>(true); // Default secret letter
  const [isSent, setIsSent] = useState<boolean>(false);
  const [replyInput, setReplyInput] = useState<{ [id: string]: string }>({});

  // Subscribe to anonymous messages
  React.useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'anonymousMessages'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const m = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() } as AnonymousMessage));
      setMessages(m);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'anonymousMessages');
    });
    return () => unsubscribe();
  }, [currentUser]);

  const predefinedNicknames = [
    'Một chiếc bé giấu tên',
    'Bé Rắn Con #008',
    'Bé Mèo Thích Kẹo',
    'Fan Cứng Cô Giáo',
    'Ẩn Danh Đáng Yêu'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() && !imageAttachment) return;

    soundManager.playMagicChime();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });

    const newMsg: Omit<AnonymousMessage, 'id'> = {
      authorId: profile?.uid || 'guest-anon',
      nickname: nickname.trim() || profile?.displayName || 'Một chiếc bé giấu tên',
      message: messageText.trim(),
      imageUrl: imageAttachment || undefined,
      status: 'approved',
      isPinned: false,
      isConfidential: isConfidential,
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'anonymousMessages'), newMsg);
      setMessageText('');
      setImageAttachment('');
      setIsSent(true);
      setTimeout(() => setIsSent(false), 3500);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'anonymousMessages');
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    soundManager.playBoop();
    try {
      await deleteDoc(doc(db, 'anonymousMessages', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `anonymousMessages/${id}`);
    }
  };

  const handleTogglePin = async (id: string) => {
    if (!isAdmin) return;
    const msg = messages.find((m: AnonymousMessage) => m.id === id);
    if (!msg) return;

    soundManager.playBoop();
    try {
      await updateDoc(doc(db, 'anonymousMessages', id), { isPinned: !msg.isPinned });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `anonymousMessages/${id}`);
    }
  };

  const handleSendReply = async (id: string) => {
    const replyText = replyInput[id]?.trim();
    if (!replyText || !isAdmin) return;
    soundManager.playMagicChime();

    try {
      await updateDoc(doc(db, 'anonymousMessages', id), { reply: replyText });
      setReplyInput((prev: { [id: string]: string }) => ({ ...prev, [id]: '' }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `anonymousMessages/${id}`);
    }
  };

  const approvedMessages = messages.filter((m: AnonymousMessage) => isAdmin || m.status === 'approved');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner - Ultra Luxury */}
      <div className="glass-panel rounded-[40px] p-8 md:p-10 border border-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-[#EAE2F8]/50 via-[#FDE5EF]/50 to-[#FEF5E7]/50 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">💌</span>
            <span className="text-[9px] uppercase font-bold tracking-[0.3em] text-[#8E75B2] bg-white/60 px-3 py-1 rounded-full border border-white font-caption">
              Atelier Private Mailbox
            </span>
          </div>
          <h1 className="font-luxury font-[100] text-3xl md:text-5xl tracking-[0.1em] text-[#3F334D] mb-2 uppercase">
            Hòm Thư Bí Mật ♡
          </h1>
          <p className="text-xs md:text-sm text-[#7A6C88] font-luxury italic tracking-wide">
            Nơi gửi gắm những lời tỏ tình, câu hỏi hay thư tâm sự chỉ duy nhất bạn và Cô Giáo Admin đọc được!
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md px-6 py-4 rounded-3xl border border-white shrink-0 shadow-sm relative z-10">
          <Mail className="w-6 h-6 text-[#8E75B2] opacity-70" />
          <span className="text-[10px] font-bold text-[#3F334D] tracking-[0.2em] uppercase">Secret Archives</span>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-100/30 to-transparent blur-3xl rounded-full" />
      </div>

      {/* Submission Form Card */}
      <div className="glass-panel rounded-[40px] p-8 md:p-10 shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-white/80">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-black/5">
          <div className="w-10 h-10 rounded-full bg-[#FAF4FE] flex items-center justify-center border border-[#EADBFA]">
            <Send className="w-5 h-5 text-[#8E75B2]" />
          </div>
          <h2 className="font-luxury font-[200] text-2xl text-[#3F334D] tracking-wide uppercase">
            Soạn một phong thư tâm sự
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nickname Selection */}
          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-[#8E75B2] font-caption uppercase tracking-[0.2em] ml-1">
              Danh xưng người gửi:
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {predefinedNicknames.map((nick) => (
                <button
                  type="button"
                  key={nick}
                  onClick={() => {
                    soundManager.playBoop();
                    setNickname(nick);
                  }}
                  className={`text-[10px] px-4 py-2 rounded-full border transition-all cursor-pointer font-bold tracking-wider ${
                    nickname === nick
                      ? 'bg-[#9078B4] text-white border-[#9078B4] shadow-md scale-105'
                      : 'bg-white/50 text-[#4A3B53] border-white/80 hover:bg-white hover:border-[#D2C8F2]'
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
              placeholder="Hoặc đặt biệt danh riêng của bạn..."
              className="w-full md:w-96 px-5 py-3 rounded-2xl bg-white/60 border border-white/80 text-xs text-[#3F334D] focus:outline-none focus:ring-4 focus:ring-[#8E75B2]/10 focus:border-[#D2C8F2] transition-all"
            />
          </div>

          {/* Message Content */}
          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-[#8E75B2] font-caption uppercase tracking-[0.2em] ml-1">
              Lời thì thầm kín đáo:
            </label>
            <textarea
              rows={5}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Thì thầm những dòng tâm sự mộng mơ gửi đến cô giáo..."
              className="w-full p-5 rounded-3xl bg-white/60 border border-white/80 text-sm text-[#3F334D] placeholder-[#9F91A8] focus:outline-none focus:ring-4 focus:ring-[#8E75B2]/10 focus:border-[#D2C8F2] transition-all resize-none shadow-inner-sm"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5">
            {/* Confidentiality Option */}
            <div className="flex items-center gap-3 p-4 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 flex-1 group cursor-pointer hover:bg-white/60 transition-all">
              <input
                type="checkbox"
                id="confidential-check"
                checked={isConfidential}
                onChange={(e) => setIsConfidential(e.target.checked)}
                className="w-5 h-5 rounded-md accent-[#8E75B2] cursor-pointer"
              />
              <label htmlFor="confidential-check" className="flex flex-col cursor-pointer">
                <span className="text-xs text-[#4A3C56] font-bold tracking-wide uppercase">🔒 Chế độ bí mật</span>
                <span className="text-[10px] text-[#827290] font-luxury italic">Chỉ mình bạn & Cô Giáo đọc được nội dung</span>
              </label>
            </div>

            {/* Image Attachment - High Prominence */}
            <label className="flex items-center justify-center gap-2.5 px-6 py-4 bg-white hover:bg-[#FAF4FE] text-[#8E75B2] font-bold text-xs rounded-2xl border border-[#EADBFA] transition-all cursor-pointer shadow-sm hover:shadow-md group min-w-[200px]">
              <div className="p-1.5 bg-[#FAF4FE] rounded-lg group-hover:scale-110 transition-transform">
                <ImageIcon className="w-4 h-4" />
              </div>
              <span className="tracking-[0.1em] uppercase">{imageAttachment ? 'Thay đổi ảnh' : '📁 Tải ảnh từ máy'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const dataUrl = await compressImageFile(file);
                      if (dataUrl) setImageAttachment(dataUrl);
                    } catch (err) {
                      console.warn('Image error:', err);
                    }
                  }
                }}
              />
            </label>
          </div>

          {/* Image Preview */}
          {imageAttachment && (
            <div className="relative w-40 h-40 group animate-in fade-in zoom-in-95">
              <img src={imageAttachment} className="w-full h-full object-cover rounded-3xl border-[4px] border-white shadow-xl" alt="Preview" />
              <button
                type="button"
                onClick={() => setImageAttachment('')}
                className="absolute -top-3 -right-3 p-2 bg-rose-500 text-white rounded-full shadow-2xl hover:bg-rose-600 transition-all hover:rotate-90"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Submit Button & Sent Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-black/5">
            <div className="flex items-center gap-2 text-[10px] text-[#827290] font-luxury italic tracking-wide">
              <ShieldCheck className="w-4 h-4 text-[#8E75B2] opacity-60" />
              <span>Dữ liệu của bạn được mã hóa & bảo mật tuyệt đối tại AI Studio Boutique.</span>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 rounded-full bg-gradient-to-r from-[#8E75B2] via-[#E2799F] to-[#8E75B2] font-bold text-sm text-white border border-white/20 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-98 transition-all cursor-pointer font-heading uppercase tracking-[0.2em]"
            >
              <span>Gửi thư ngay ♡</span>
              <Send className="w-4 h-4" />
            </button>
          </div>

          {isSent && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-[11px] font-bold text-center flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Phong thư mộng mơ đã được bỏ vào hòm thư thành công! Cô giáo sẽ hồi đáp sớm nhất nhé ♡</span>
            </motion.div>
          )}
        </form>
      </div>

      {/* Public / Confidential Letter Wall */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
            <h3 className="font-luxury font-[200] text-2xl text-[#3F334D] tracking-wider uppercase">
              Lưu trữ tâm sự ({approvedMessages.length})
            </h3>
          </div>
          {isAdmin && (
            <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-[#EAE2F8] to-[#FFF0F5] text-[#3F334D] font-bold px-4 py-1.5 rounded-full border border-white text-[10px] shadow-sm tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8E75B2]" />
              <span>CO GIAO ADMIN PRIVILEGES</span>
            </div>
          )}
        </div>

        {/* Letters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {approvedMessages.map((msg: AnonymousMessage) => {
            const isOwner = msg.authorId === profile?.uid;
            const canRead = !msg.isConfidential || isOwner || isAdmin;

            return (
              <motion.div
                key={msg.id}
                layout
                className={`p-6 md:p-8 rounded-[40px] border transition-all relative flex flex-col justify-between ${
                  msg.isPinned
                    ? 'bg-gradient-to-br from-[#FFF5F8] to-white border-pink-200/50 shadow-lg scale-[1.01]'
                    : 'bg-white/60 backdrop-blur-xl border-white/80 shadow-sm hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-[#7A6C88] pb-4 border-b border-black/5 mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-[#E2799F] shadow-sm shadow-[#E2799F]" />
                      <strong className="text-[#3F334D] font-luxury font-[300] tracking-widest uppercase text-xs">{msg.nickname}</strong>
                      {msg.isConfidential && (
                        <span className="bg-purple-100/80 text-purple-700 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-purple-200">
                          <Lock className="w-2.5 h-2.5" /> SECRECY
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {msg.isPinned && (
                        <Pin className="w-3.5 h-3.5 text-[#E2799F] fill-[#E2799F] opacity-70" />
                      )}
                      <span className="font-luxury italic opacity-70">
                        {new Date(msg.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  {canRead && msg.imageUrl && (
                    <img 
                      src={msg.imageUrl} 
                      className="w-full max-h-72 object-cover rounded-3xl mb-5 border-[3px] border-white shadow-md hover:scale-[1.01] transition-transform" 
                      alt="Letter attachment" 
                    />
                  )}

                  {canRead ? (
                    <p className="text-xs md:text-sm text-[#4A3B53] leading-relaxed mb-6 italic font-luxury tracking-wide">
                      "{msg.message}"
                    </p>
                  ) : (
                    <div className="p-6 rounded-3xl bg-purple-50/40 border border-purple-100 text-center my-4 backdrop-blur-sm">
                      <div className="w-12 h-12 rounded-full bg-white/80 mx-auto mb-3 flex items-center justify-center border border-purple-100 shadow-inner">
                        <Lock className="w-5 h-5 text-[#8E75B2]" />
                      </div>
                      <p className="text-xs text-[#6D5E7B] font-bold tracking-widest uppercase">
                        Thư tâm sự bí mật
                      </p>
                      <p className="text-[10px] text-[#827290] italic mt-1 px-4 leading-relaxed">
                        Chỉ duy nhất tác giả và Cô Giáo Admin mới có chìa khóa để mở phong thư này.
                      </p>
                    </div>
                  )}

                  {msg.reply && canRead && (
                    <div className="p-5 rounded-3xl bg-gradient-to-br from-[#FEF8ED] via-[#FFF4F8] to-[#F6EDFC] border border-white shadow-inner-sm mb-4 relative overflow-hidden group/reply">
                      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/reply:opacity-20 transition-opacity">
                        <Sparkles className="w-8 h-8 text-[#8E75B2]" />
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-[#8E75B2] mb-2 font-caption uppercase tracking-[0.2em]">
                        <div className="w-1 h-1 rounded-full bg-[#8E75B2]" />
                        <span>Lời hồi đáp từ Cô Giáo:</span>
                      </div>
                      <p className="text-xs text-[#4A3B53] leading-relaxed font-luxury">
                        {msg.reply}
                      </p>
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <div className="pt-4 border-t border-black/5 flex flex-col gap-3 mt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTogglePin(msg.id)}
                          className="text-[9px] font-bold px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-[#3F334D] border border-black/5 shadow-2xs tracking-widest uppercase"
                        >
                          {msg.isPinned ? 'Bỏ ghim' : 'Ghim thư'}
                        </button>
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="text-[9px] font-bold px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center gap-1.5 cursor-pointer border border-rose-100/50 shadow-2xs tracking-widest uppercase"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Gỡ thư</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Cô giáo viết lời hồi đáp..."
                        value={replyInput[msg.id] || ''}
                        onChange={(e) =>
                          setReplyInput((prev: { [id: string]: string }) => ({ ...prev, [msg.id]: e.target.value }))
                        }
                        className="flex-1 px-4 py-2 rounded-2xl bg-white/80 border border-white text-xs text-[#3F334D] focus:outline-none focus:ring-2 focus:ring-[#8E75B2]/20"
                      />
                      <button
                        onClick={() => handleSendReply(msg.id)}
                        className="px-5 py-2 rounded-2xl bg-[#9078B4] text-white text-[10px] font-bold hover:bg-[#7E66A2] cursor-pointer shadow-md tracking-wider uppercase"
                      >
                        Hồi đáp
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
