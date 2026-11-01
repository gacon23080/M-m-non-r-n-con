import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Sparkles, ArrowRight, DoorOpen, LogIn, ShieldCheck } from 'lucide-react';
import { soundManager } from '../../lib/sound';
import { useAuth } from '../../context/AuthContext';
import { useMusic } from '../../context/MusicContext';

interface EntranceGateProps {
  onEnter: () => void;
}

export const EntranceGate: React.FC<EntranceGateProps> = ({ onEnter }) => {
  const { profile, loginWithGoogle } = useAuth();
  const { startPlayback } = useMusic();
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [rememberPreference, setRememberPreference] = useState<boolean>(false);
  const [isEntering, setIsEntering] = useState<boolean>(false);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.enabled = next;
  };

  const handleEnterSchool = () => {
    if (!profile) return;
    setIsEntering(true);
    soundManager.enabled = true;
    startPlayback(); // Immediate interaction trigger
    if (rememberPreference) {
      localStorage.setItem('mnrc_skip_entrance', 'true');
    }

    setTimeout(() => {
      onEnter();
    }, 800);
  };

  const snowflakes = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: 10 + Math.random() * 15,
    delay: Math.random() * 10,
    opacity: Math.random() * 0.3 + 0.1
  }));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center select-none bg-gradient-to-tr from-[#EFE8FA] via-[#FDE8F1] to-[#FEF6E8] overflow-hidden h-full"
      >
        <div className="fixed inset-0 pointer-events-none z-10">
          {snowflakes.map((flake) => (
            <motion.div
              key={flake.id}
              className="absolute rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.3)]"
              style={{
                left: `${flake.x}%`,
                width: `${flake.size}px`,
                height: `${flake.size}px`,
                opacity: flake.opacity
              }}
              initial={{ y: -10 }}
              animate={{
                y: ['0vh', '105vh'],
                x: [`${flake.x}%`, `${flake.x + (flake.id % 2 === 0 ? 3 : -3)}%`],
              }}
              transition={{
                duration: flake.duration,
                repeat: Infinity,
                delay: flake.delay,
                ease: 'linear',
              }}
            />
          ))}
        </div>

        <div className="absolute top-4 left-0 w-full px-6 flex justify-between items-center z-30">
          <div className="flex items-center gap-2 bg-white/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[7px] font-bold text-[#827290] shadow-sm tracking-[0.2em] uppercase">
            <Sparkles className="w-2.5 h-2.5 text-[#9078B4]" />
            <span>AI Studio</span>
          </div>

          <button
            onClick={handleToggleSound}
            className="p-2 rounded-full bg-white/30 backdrop-blur-md border border-white/20 text-[#827290] shadow-sm hover:bg-white/50 transition-all cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3 opacity-50" />}
          </button>
        </div>

        <main className="flex flex-col items-center justify-center px-4 z-20 gap-4 max-w-sm w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="flex flex-col items-center"
          >
            <div className="w-12 h-12 rounded-full bg-white/60 backdrop-blur-xl border border-white shadow-lg flex items-center justify-center mb-4">
              <DoorOpen className="w-5 h-5 text-[#9078B4] opacity-80" />
            </div>
            
            <span className="font-luxury text-xs text-[#8E75B2] mb-1 font-[200] tracking-[0.5em] uppercase ml-[0.5em]">Atelier</span>
            <h1 className="font-luxury text-4xl font-[100] tracking-[0.1em] text-[#4A3C56] leading-[1] uppercase text-center drop-shadow-sm">
              MẦM NON<br />
              <span className="tracking-[0.2em]">RẮN CON</span>
            </h1>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full bg-white/30 backdrop-blur-2xl p-6 md:p-8 rounded-[40px] border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col items-center"
          >
            {profile ? (
              <div className="w-full flex flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-3">
                  <img 
                    src={profile.photoURL} 
                    alt={profile.displayName} 
                    className="w-20 h-20 rounded-full border-[4px] border-white shadow-lg object-cover" 
                  />
                  <div className="text-center">
                    <h2 className="font-luxury text-xl text-[#4A3C56] font-[200] tracking-wide">Chào bé, {profile.displayName}!</h2>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEnterSchool}
                  disabled={isEntering}
                  className="w-full py-4 rounded-full bg-white/90 text-[#4A3C56] font-luxury font-bold text-xs tracking-[0.2em] uppercase border border-white shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>VÀO LỚP HỌC ♡</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-40" />
                </motion.button>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center gap-6">
                <div className="text-center space-y-1">
                  <span className="text-[8px] font-bold text-[#8E75B2] tracking-[0.3em] uppercase opacity-60">Secured Portal</span>
                  <h3 className="font-luxury text-2xl text-[#4A3C56] font-[100] tracking-[0.1em] uppercase">Xác thực</h3>
                </div>
                
                <button 
                  onClick={loginWithGoogle} 
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-full bg-white/80 border border-white hover:bg-white text-[#4A3C56] font-luxury font-bold text-xs tracking-[0.1em] transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                  <span className="uppercase">Tiếp tục với Gmail</span>
                </button>
              </div>
            )}
          </motion.div>
        </main>

        <div className="absolute bottom-6 left-0 w-full flex justify-center">
          <label className="flex items-center gap-2 text-[9px] text-[#827290] font-luxury tracking-[0.2em] uppercase cursor-pointer bg-white/20 px-4 py-2 rounded-full border border-white/20 backdrop-blur-xl">
            <input
              type="checkbox"
              checked={rememberPreference}
              onChange={(e) => setRememberPreference(e.target.checked)}
              className="w-3 h-3 rounded accent-[#8E75B2]"
            />
            <span>Ghi nhớ danh tính</span>
          </label>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
