import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, MessageCircle, ExternalLink, School, Feather, Edit3, ShieldCheck } from 'lucide-react';
import { TEACHER_PROFILE } from '../../lib/initialData';
import { soundManager } from '../../lib/sound';
import { useAuth } from '../../context/AuthContext';
import { TeacherEditModal, TeacherData } from '../teacher/TeacherEditModal';
import { db } from '../../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

interface HomeTeacherCornerProps {
  onExploreLibrary: () => void;
  onOpenInbox: () => void;
  onAddNewCharacter?: () => void;
  teacherData?: TeacherData;
  onUpdateTeacherData?: (data: TeacherData) => void;
}

export const HomeTeacherCorner: React.FC<HomeTeacherCornerProps> = ({
  onExploreLibrary,
  onOpenInbox,
  onAddNewCharacter,
  teacherData: propTeacherData,
  onUpdateTeacherData
}) => {
  const { isAdmin } = useAuth();

  // Internal state fallback if not supplied by props
  const [localTeacherData, setLocalTeacherData] = useState<TeacherData>(() => ({
    name: TEACHER_PROFILE.name,
    tagline: TEACHER_PROFILE.tagline,
    bio: TEACHER_PROFILE.bio,
    avatarUrl: TEACHER_PROFILE.avatarUrl,
    quote: TEACHER_PROFILE.quote,
    facebookUrl: 'https://facebook.com/',
    discordUrl: 'https://discord.gg/',
    aiStudioUrl: 'https://aistudio.google.com/'
  }));

  const teacherData: TeacherData = propTeacherData || localTeacherData;

  // Sync real-time with Firestore systemSettings/teacher
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'systemSettings', 'teacher'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as TeacherData;
        setLocalTeacherData(data);
      }
    }, (err) => {
      console.warn('systemSettings/teacher subscription note:', err);
    });

    return () => unsubscribe();
  }, []);

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  const handleSaveTeacherData = async (newData: TeacherData) => {
    setLocalTeacherData(newData);
    if (onUpdateTeacherData) {
      onUpdateTeacherData(newData);
    }
    try {
      await setDoc(doc(db, 'systemSettings', 'teacher'), newData, { merge: true });
    } catch (e) {
      console.warn('Could not save teacher data to Firestore:', e);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Main Teacher & Atelier Profile Card */}
      <div className="glass-panel rounded-3xl p-6 shadow-sm relative overflow-hidden">
        {/* Decorative corner tag & Admin Edit trigger */}
        <div className="flex items-center justify-between pb-3.5 border-b border-black/5 mb-4">
          <div className="flex items-center gap-2">
            <Feather className="w-4 h-4 text-[#8E75B2]" />
            <h2 className="font-heading font-bold text-base text-[#3F334D]">
              Atelier Cô Giáo ♡
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <button
                onClick={() => {
                  soundManager.playBoop();
                  setIsEditModalOpen(true);
                }}
                className="flex items-center gap-1 text-[11px] bg-gradient-to-r from-[#F0E6FA] to-[#FCE7F3] hover:opacity-90 text-[#3F334D] font-bold px-2.5 py-1 rounded-full border border-white/80 shadow-2xs cursor-pointer transition-all"
                title="Chỉnh sửa thông tin cô giáo"
              >
                <Edit3 className="w-3 h-3 text-[#8E75B2]" />
                <span>Sửa hồ sơ</span>
              </button>
            ) : (
              <span className="text-[10px] bg-white/70 text-[#7A6C88] px-2 py-0.5 rounded-full border border-white/80 transition-colors">
                Lớp Rắn Con
              </span>
            )}
          </div>
        </div>

        {/* Teacher Avatar & Identity */}
        <div className="flex flex-col items-center text-center mb-4">
          <div className="relative mb-3 group">
            <img
              src={teacherData.avatarUrl}
              alt={teacherData.name}
              className="w-22 h-22 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-[#E9DCF8] group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-xs">
              <Sparkles className="w-4 h-4 text-[#E2799F]" />
            </div>
          </div>

          <h3 className="font-heading font-bold text-xl text-[#3F334D] flex items-center justify-center gap-1.5">
            <span>{teacherData.name}</span>
            <span title="Giáo viên phụ trách">
              <ShieldCheck className="w-4 h-4 text-[#8E75B2]" />
            </span>
          </h3>
          <p className="text-xs text-[#8E75B2] font-medium mt-1 font-luxury italic max-w-xs">
            {teacherData.tagline}
          </p>
        </div>

        {/* Introduction */}
        <p className="text-xs text-[#7A6C88] leading-relaxed mb-4 text-justify">
          {teacherData.bio}
        </p>

        {/* Poetic Quote Card */}
        {teacherData.quote && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FEF8ED]/75 via-[#FFF4F8]/75 to-[#F6EDFC]/75 border border-white/90 text-xs text-[#4A3B53] font-luxury italic text-center shadow-xs mb-4">
            {teacherData.quote}
          </div>
        )}

        {/* External Creative Links (Facebook, Discord, AI Studio) - Prominently Outside */}
        <div className="space-y-2.5 my-4 pt-2 border-t border-black/5">
          <div className="text-[11px] font-bold text-[#4A3B53] font-caption tracking-wider uppercase flex items-center justify-between">
            <span>Kênh kết nối & Cộng đồng:</span>
            <span className="text-[10px] text-[#8E75B2] font-luxury italic">Trực tiếp</span>
          </div>

          {/* Facebook Link */}
          <a
            href={teacherData.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundManager.playBoop()}
            className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#EBF2FE]/90 to-[#F0E6FA]/90 hover:bg-white border border-[#CBD7F9] hover:border-[#A6C0FA] transition-all group cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2B529B] to-[#4267B2] flex items-center justify-center text-white shadow-xs">
                <span className="font-bold text-sm">f</span>
              </div>
              <div>
                <span className="text-xs font-bold text-[#2B529B] transition-colors block font-heading">
                  Facebook Lớp Học Rắn Con
                </span>
                <span className="text-[10px] text-[#7A6C88]">Nhóm thảo luận & cập nhật mới</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-[#7A8BB0] group-hover:translate-x-0.5 transition-all" />
          </a>

          {/* Discord Link */}
          <a
            href={teacherData.discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundManager.playBoop()}
            className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#EEECFC]/90 to-[#FCE8F2]/90 hover:bg-white border border-[#D5D0FA] hover:border-[#B5ACF8] transition-all group cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4853C3] to-[#6C76EB] flex items-center justify-center text-white shadow-xs">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#4853C3] transition-colors block font-heading">
                  Discord Trò Chuyện & Chia Sẻ
                </span>
                <span className="text-[10px] text-[#7A6C88]">Kênh voice, chat & workshop</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-[#8C95DC] group-hover:translate-x-0.5 transition-all" />
          </a>

          {/* Google AI Studio Link */}
          <a
            href={teacherData.aiStudioUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundManager.playBoop()}
            className="flex items-center justify-between p-3 rounded-2xl bg-white/70 hover:bg-white border border-white/90 hover:border-[#E8D5F9] transition-all group cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8E75B2] to-[#C084FC] flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#3F334D] group-hover:text-[#8E75B2] transition-colors block">
                  Google AI Studio Atelier
                </span>
                <span className="text-[10px] text-[#7A6C88]">Tạo prompt & thử nghiệm nhân vật</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-[#A092B0] group-hover:text-[#8E75B2] group-hover:translate-x-0.5 transition-all" />
          </a>
        </div>

        {/* Teacher Quick Add Character Button if admin */}
        {isAdmin && onAddNewCharacter && (
          <div className="my-3">
            <button
              onClick={() => {
                soundManager.playMagicChime();
                onAddNewCharacter();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#EAE2F8] via-[#FCE8F2] to-[#FEF5E7] hover:opacity-95 text-[#3F334D] font-bold text-xs border border-white shadow-xs transition-all cursor-pointer font-heading"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8E75B2]" />
              <span>+ Cô Giáo Thêm Bé Mới Vào Lớp</span>
            </button>
          </div>
        )}

        {/* Quick Classroom Rules */}
        <div className="pt-3 border-t border-black/5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#4A3B53]">
            <School className="w-4 h-4 text-[#8E75B2]" />
            <span>Nội quy lớp Rắn Con</span>
          </div>
          <ul className="text-[11px] text-[#7A6C88] space-y-1 list-disc list-inside">
            <li>Yêu thương, tôn trọng mọi nhân vật sáng tạo</li>
            <li>Lan tỏa năng lượng tích cực & nghệ thuật</li>
            <li>Bình chọn công tâm cho Bé Ngoan tuần</li>
          </ul>
        </div>
      </div>

      {/* Secret Inbox Quick Invitation Card */}
      <div className="glass-panel rounded-3xl p-5 border border-white/90 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#3F334D] font-heading mb-1">
            <Sparkles className="w-4 h-4 text-[#E2799F]" />
            <span>Gửi gắm tâm tình bí mật?</span>
          </div>
          <p className="text-[11px] text-[#7A6C88] leading-relaxed">
            Những lời thì thầm kín đáo gửi gắm vào Hòm Thư lớp học để nhận lời hồi đáp ngọt ngào ♡
          </p>
        </div>

        <button
          onClick={() => {
            soundManager.playBoop();
            onOpenInbox();
          }}
          className="mt-3 w-full text-center text-xs font-bold text-[#3F334D] bg-gradient-to-r from-[#EAE2F8] to-[#FDE5EF] hover:opacity-95 py-2.5 rounded-full border border-white transition-all cursor-pointer shadow-xs font-heading"
        >
          MỞ HÒM THƯ BÍ MẬT &rarr;
        </button>
      </div>

      {/* Modal for editing teacher details */}
      <TeacherEditModal
        isOpen={isEditModalOpen}
        initialData={teacherData}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveTeacherData}
      />
    </div>
  );
};
