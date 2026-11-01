import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Sparkles, ArrowRight, DoorOpen, LogIn, ShieldCheck } from 'lucide-react';
import { soundManager } from '../../lib/sound';
import { useAuth } from '../../context/AuthContext';

interface EntranceGateProps {
  onEnter: () => void;
}

export const EntranceGate: React.FC<EntranceGateProps> = ({ onEnter }) => {
  const { profile, loginWithGoogle, loginWithAdminPasscode } = useAuth();
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [rememberPreference, setRememberPreference] = useState<boolean>(false);
  const [isEntering, setIsEntering] = useState<boolean>(false);
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.enabled = next;
  };

  const handleEnterSchool = () => {
    if (!profile) {
      alert('Vui lòng đăng nhập để bước vào lớp học nhé ♡');
      return;
    }
    setIsEntering(true);
    if (rememberPreference) {
      localStorage.setItem('mnrc_skip_entrance', 'true');
    }

    setTimeout(() => {
      onEnter();
    }, 600);
  };

  // Generate 28 soft falling snowflakes for entrance
  const snowflakes = Array.from({ length: 28 }).map((_, i) => ({
    id: i,
    x: (i * 3.7) % 100,
    size: (i % 4) + 3,
    duration: 12 + (i % 8),
    delay: (i % 6) * 1.5,
  }));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.04 }}
        transition={{ duration: 0.8 }}
        className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-between items-center select-none bg-gradient-to-tr from-[#EFE8FA] via-[#FDE8F1] to-[#FEF6E8]"
      >
        {/* Falling gentle snowflakes */}
        {snowflakes.map((flake) => (
          <motion.div
            key={flake.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${flake.x}%`,
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
            }}
            initial={{ y: -20, opacity: 0 }}
            animate={{
              y: ['0vh', '105vh'],
              x: [0, (flake.id % 2 === 0 ? 15 : -15), 0],
              opacity: [0, 0.7, 0.7, 0],
            }}
            transition={{
              duration: flake.duration,
              repeat: Infinity,
              delay: flake.delay,
              ease: 'linear',
            }}
          />
        ))}

        {/* Ambient floating pastel glowing orbs */}
        <motion.div
          className="absolute -top-40 -left-40 w-[680px] h-[680px] rounded-full bg-gradient-to-br from-[#E2D5F8]/45 via-[#EFE5FB]/30 to-transparent blur-3xl pointer-events-none"
          animate={{
            x: [0, 60, -30, 0],
            y: [0, 45, -20, 0],
            scale: [1, 1.1, 0.96, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="absolute -bottom-48 -right-48 w-[720px] h-[720px] rounded-full bg-gradient-to-tl from-[#FDE3ED]/50 via-[#FEF4E2]/35 to-transparent blur-3xl pointer-events-none"
          animate={{
            x: [0, -50, 30, 0],
            y: [0, -60, 40, 0],
            scale: [1, 0.94, 1.08, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Top Control Bar */}
        <header className="w-full max-w-5xl px-6 py-6 flex justify-between items-center z-30">
          <div className="flex items-center gap-2.5 bg-white/60 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/80 text-xs font-semibold text-[#4E4059] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#9078B4]" />
            <span className="tracking-widest uppercase text-[10px] font-bold text-[#827290]">
              Google AI Studio • Character Atelier
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSound}
              className="flex items-center gap-1.5 bg-white/60 hover:bg-white text-[#4E4059] px-3.5 py-1.5 rounded-full border border-white/80 text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Bật/Tắt âm thanh"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#9078B4]" />
                  <span>Âm thanh: Bật</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-gray-400" />
                  <span>Đã tắt</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowAdminLogin(!showAdminLogin)}
              className="flex items-center gap-1.5 bg-[#4A3C56] hover:bg-[#382D42] text-white px-3.5 py-1.5 rounded-full border border-white/20 text-[10px] font-bold transition-all shadow-xs cursor-pointer"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Cổng Admin</span>
            </button>
          </div>
        </header>

        {/* Center Portal */}
        <main className="relative w-full max-w-3xl flex flex-col items-center justify-center text-center px-6 z-20 my-auto">
          
          {/* Glowing Halo */}
          <div className="absolute w-[440px] h-[440px] rounded-full bg-gradient-to-tr from-[#E9DCF8]/50 via-[#FCE4EE]/40 to-[#FEF5E7]/50 blur-3xl pointer-events-none" />

          {/* Logo Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative mb-5"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/80 backdrop-blur-2xl border-2 border-white shadow-[0_10px_30px_rgba(144,120,180,0.15)] flex items-center justify-center">
              <DoorOpen className="w-8 h-8 text-[#9078B4]" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="font-playfair text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-normal text-[#4A3C56] mb-4 drop-shadow-sm select-none"
          >
            MẦM NON RẮN CON
          </motion.h1>

          <div className="max-w-md w-full bg-white/40 backdrop-blur-md p-6 rounded-[32px] border border-white/60 shadow-xl mb-8">
            {profile ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-2">
                  <img src={profile.photoURL} alt={profile.displayName} className="w-16 h-16 rounded-full border-2 border-[#D2C8F2]" />
                  <span className="font-heading font-bold text-[#4A3C56]">Chào bé, {profile.displayName}!</span>
                  <p className="text-xs text-[#827290]">Bạn đã sẵn sàng để vào lớp chưa?</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEnterSchool}
                  disabled={isEntering}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#F0E6FA] via-[#FCE8F2] to-[#FFF3E3] text-[#4A3C56] font-bold text-lg px-8 py-3.5 rounded-full border-2 border-white shadow-lg cursor-pointer font-heading"
                >
                  <span>VÀO LỚP NGAY ♡</span>
                  <ArrowRight className="w-5 h-5 text-[#8E75B2]" />
                </motion.button>
              </div>
            ) : showAdminLogin ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#8E75B2] font-bold text-sm mb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>XÁC THỰC CÔ GIÁO ADMIN</span>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const id = (form.elements.namedItem('adminId') as HTMLInputElement).value;
                    const pass = (form.elements.namedItem('adminPass') as HTMLInputElement).value;
                    if (loginWithAdminPasscode(id, pass)) {
                      setShowAdminLogin(false);
                    } else {
                      alert('Thông tin không chính xác!');
                    }
                  }}
                  className="space-y-3"
                >
                  <input name="adminId" type="text" placeholder="Mã ID Cô Giáo..." className="w-full px-4 py-2.5 rounded-2xl bg-white/80 border border-[#D2C8F2] text-sm focus:outline-none" required />
                  <input name="adminPass" type="password" placeholder="Mật khẩu Cô Giáo..." className="w-full px-4 py-2.5 rounded-2xl bg-white/80 border border-[#D2C8F2] text-sm focus:outline-none" required />
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setShowAdminLogin(false)} className="flex-1 py-2.5 rounded-2xl bg-white/50 text-[#827290] text-xs font-bold border border-white hover:bg-white transition-all">Hủy</button>
                    <button type="submit" className="flex-2 py-2.5 rounded-2xl bg-[#8E75B2] text-white text-xs font-bold shadow-md hover:bg-[#78619E] transition-all">Đăng nhập Admin</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="text-sm font-bold text-[#8E75B2] mb-1">ĐĂNG NHẬP ĐỂ VÀO LỚP</div>
                <div className="grid grid-cols-1 gap-3">
                  <button onClick={loginWithGoogle} className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-white border border-[#E8DFF3] hover:bg-[#F0E6FA] text-base font-bold text-[#4A3C56] transition-all shadow-sm">
                    <span className="text-xl">🌐</span> Đăng nhập bằng Google (Gmail)
                  </button>
                </div>
                <p className="text-[10px] text-[#827290] italic">Chúng tớ không lưu mật khẩu của bạn đâu, yên tâm nhé ♡</p>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full max-w-xl pb-8 px-6 flex flex-col items-center text-center z-30">
          <label className="flex items-center gap-2 text-xs text-[#827290] cursor-pointer hover:text-[#4A3C56] select-none transition-colors">
            <input
              type="checkbox"
              checked={rememberPreference}
              onChange={(e) => setRememberPreference(e.target.checked)}
              className="rounded border-[#D2C8F2] text-[#8E75B2] focus:ring-[#EAE2F8]"
            />
            <span>Ghi nhớ phiên đăng nhập, lần sau vào thẳng lớp học</span>
          </label>
        </footer>

        {/* Transition Flash */}
        {isEntering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 bg-white/70 backdrop-blur-md pointer-events-none z-50"
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};
