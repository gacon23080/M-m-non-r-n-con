import React, { useState } from 'react';
import { 
  Home, 
  BookOpen, 
  Trophy, 
  Sparkles, 
  Gamepad2, 
  Music, 
  MessageSquare, 
  Mail, 
  MessageCircle, 
  Bell, 
  User, 
  ShieldCheck, 
  LogIn, 
  ChevronDown,
  Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { soundManager } from '../../lib/sound';

export type NavTab = 
  | 'home' 
  | 'library' 
  | 'ranking' 
  | 'random' 
  | 'entertainment' 
  | 'music' 
  | 'community' 
  | 'inbox' 
  | 'messenger' 
  | 'admin';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenProfile,
  onOpenNotifications,
  unreadCount = 2
}) => {
  const { profile, isAdmin, loginWithGoogle } = useAuth();
  const [showAuthMenu, setShowAuthMenu] = useState<boolean>(false);

  const navItems = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'library', label: 'Tủ nhân vật', icon: BookOpen },
    { id: 'ranking', label: 'Bé ngoan', icon: Trophy },
    { id: 'random', label: 'Bé Chồng', icon: Sparkles },
    { id: 'entertainment', label: 'Góc vui chơi', icon: Gamepad2 },
    { id: 'music', label: 'Âm nhạc', icon: Music },
    { id: 'community', label: 'Bảng tin lớp', icon: MessageSquare },
    { id: 'inbox', label: 'Hòm thư', icon: Mail },
  ];

  const handleTabClick = (tabId: NavTab) => {
    soundManager.playBoop();
    onSelectTab(tabId);
  };

  return (
    <header className="sticky top-0 z-40 w-full px-4 md:px-8 py-3 bg-white/70 backdrop-blur-2xl border-b border-white/80 shadow-[0_4px_30px_rgba(150,130,190,0.06)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left: Brand Identity */}
        <div 
          onClick={() => handleTabClick('home')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          {/* Ethereal Brand Crest (no mascot) */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E9DCF8] via-[#FCE4EE] to-[#FEF5E7] p-[1.5px] shadow-sm group-hover:shadow-md transition-all">
            <div className="w-full h-full rounded-[14px] bg-white/80 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#9078B4] group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-lg md:text-xl text-[#3F334D] tracking-tight group-hover:text-[#9078B4] transition-colors">
                Mầm Non Rắn Con
              </span>
              <span className="text-[10px] bg-gradient-to-r from-[#F0E6FA] to-[#FCE7F3] text-[#7A6C88] px-2.5 py-0.5 rounded-full font-bold border border-white/80 tracking-wider">
                GGAI
              </span>
            </div>
            <p className="text-[11px] text-[#7A6C88] tracking-wide font-luxury italic hidden sm:block">
              Góc nhỏ dành cho những chiếc char đáng yêu ♡
            </p>
          </div>
        </div>

        {/* Center: Main Navigation Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id as NavTab)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-[#EAE2F8] via-[#FDE5EF] to-[#FEF5E7] text-[#3F334D] font-bold shadow-sm border border-white scale-102'
                    : 'text-[#62566F] hover:bg-white/70 hover:text-[#9078B4] border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#8E75B2]' : 'text-[#A092B0]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Messenger Button */}
          <button
            onClick={() => handleTabClick('messenger')}
            className={`relative p-2.5 rounded-full border transition-all cursor-pointer ${
              activeTab === 'messenger'
                ? 'bg-[#EAE2F8] text-[#3F334D] border-[#CBB8E8]'
                : 'bg-white/75 hover:bg-white text-[#62566F] border-white/80 shadow-xs'
            }`}
            title="Góc Trò Chuyện (Messenger)"
          >
            <MessageCircle className="w-4 h-4 text-[#8E75B2]" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#E2799F] rounded-full border-2 border-white" />
          </button>

          {/* Notifications Button */}
          <button
            onClick={() => {
              soundManager.playBoop();
              onOpenNotifications();
            }}
            className="relative p-2.5 rounded-full bg-white/75 hover:bg-white text-[#62566F] border border-white/80 transition-all cursor-pointer shadow-xs"
            title="Thông báo"
          >
            <Bell className="w-4 h-4 text-[#8E75B2]" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-[#E2799F] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Admin Dashboard */}
          {isAdmin && (
            <button
              onClick={() => handleTabClick('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                activeTab === 'admin'
                  ? 'bg-[#9078B4] text-white border-[#9078B4]'
                  : 'bg-[#F2ECFA] text-[#4A3B53] hover:bg-[#EAE2F8] border-white/80'
              }`}
              title="Phòng Giáo Viên (Admin)"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Phòng GV</span>
            </button>
          )}

          {/* Member Profile / Auth Button */}
          <div className="relative">
            {profile ? (
              <button
                onClick={() => {
                  soundManager.playBoop();
                  onOpenProfile();
                }}
                className="flex items-center gap-2 bg-white/80 hover:bg-white pl-1.5 pr-3 py-1 rounded-full border border-white/90 text-xs font-bold text-[#3F334D] transition-all cursor-pointer shadow-xs"
              >
                <img
                  src={profile.photoURL}
                  alt={profile.displayName}
                  className="w-6 h-6 rounded-full object-cover border border-[#D2C8F2]"
                />
                <span className="max-w-[85px] truncate">{profile.displayName}</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowAuthMenu((prev) => !prev)}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-[#EAE2F8] via-[#FCE4EE] to-[#FEF5E7] text-[#3F334D] px-3.5 py-1.5 rounded-full text-xs font-bold border border-white shadow-xs hover:opacity-95 transition-all cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-[#9078B4]" />
                  <span>Vào Lớp</span>
                  <ChevronDown className="w-3 h-3 ml-0.5" />
                </button>

                {showAuthMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-white p-2 z-50 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={() => {
                        setShowAuthMenu(false);
                        loginWithGoogle();
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-[#3F334D] hover:bg-[#FFF0F5] rounded-2xl text-left transition-colors cursor-pointer"
                    >
                      <LogIn className="w-4 h-4 text-[#9078B4]" />
                      <span>Đăng nhập Google</span>
                    </button>
                    <p className="px-3 py-2 text-[10px] text-[#93879E] italic leading-tight">
                      Vui lòng sử dụng tài khoản Google để tham gia lớp học ♡
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
