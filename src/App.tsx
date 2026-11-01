import React, { useState, useEffect } from 'react';
import { 
  ArrowUp, 
  DoorOpen, 
  Sparkles, 
  ExternalLink
} from 'lucide-react';
import { Character, Announcement, AppNotification } from './types';
import { INITIAL_CHARACTERS, INITIAL_ANNOUNCEMENTS } from './lib/initialData';
import { AuthProvider } from './context/AuthContext';
import { MusicProvider, useMusic } from './context/MusicContext';
import { FloatingDecorations } from './components/decorations/FloatingDecorations';
import { SnowEffect } from './components/decorations/SnowEffect';
import { EntranceGate } from './components/entrance/EntranceGate';
import { Navbar, NavTab } from './components/navigation/Navbar';
import { FloatingMusicPlayer } from './components/music/FloatingMusicPlayer';
import { CharacterDetailModal } from './components/characters/CharacterDetailModal';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { NotificationModal } from './components/notifications/NotificationModal';
import { HomeTeacherCorner } from './components/home/HomeTeacherCorner';
import { HomeBulletinBoard } from './components/home/HomeBulletinBoard';
import { HomeGoodStudentsCorner } from './components/home/HomeGoodStudentsCorner';
import { CharacterLibraryView } from './components/library/CharacterLibraryView';
import { WeeklyRankingView } from './components/ranking/WeeklyRankingView';
import { RandomHusbandView } from './components/random/RandomHusbandView';
import { EntertainmentView } from './components/entertainment/EntertainmentView';
import { MusicRoomView } from './components/music/MusicRoomView';
import { SecretInboxView } from './components/inbox/SecretInboxView';
import { CommunityWallView } from './components/community/CommunityWallView';
import { MessengerView } from './components/messenger/MessengerView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CharacterEditModal } from './components/characters/CharacterEditModal';
import { soundManager } from './lib/sound';

const MainAppInner: React.FC = () => {
  const { startPlayback } = useMusic();
  const [showEntrance, setShowEntrance] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [characters, setCharacters] = useState<Character[]>(() => {
    const saved = localStorage.getItem('mnrc_saved_characters');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_CHARACTERS;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  
  // Selected character for detail modal
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  // Character being edited or created
  const [characterToEdit, setCharacterToEdit] = useState<Character | null | 'NEW'>(null);
  
  // Profile & Notification Modals
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);

  // Save characters to localStorage whenever modified
  useEffect(() => {
    localStorage.setItem('mnrc_saved_characters', JSON.stringify(characters));
  }, [characters]);

  // Search & Filter state on homepage
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      userId: 'user',
      type: 'ranking',
      title: 'Bình chọn Bé Ngoan Tuần 44 đã mở!',
      message: 'Ghé bảng vàng để bỏ phiếu cho nhân vật bạn yêu quý nhất nhé ♡',
      isRead: false,
      createdAt: '1 giờ trước'
    },
    {
      id: 'notif-2',
      userId: 'user',
      type: 'announcement',
      title: 'Chào mừng bạn đến với Mầm Non Rắn Con',
      message: 'Khám phá ngay kho nhân vật sáng tạo Google AI Studio phong cách pastel mộng mơ.',
      isRead: false,
      createdAt: 'Hôm nay'
    }
  ]);

  useEffect(() => {
    // Check remembered skip entrance
    const skip = localStorage.getItem('mnrc_skip_entrance');
    if (skip === 'true') {
      setShowEntrance(false);
      // Auto start ambient audio
      startPlayback();
    }
  }, []);

  const handleEnterClassroom = () => {
    setShowEntrance(false);
    startPlayback();
  };

  const handleVoteCharacter = (charId: string) => {
    setCharacters((prev) =>
      prev.map((c) =>
        c.id === charId
          ? { ...c, weeklyLikesCount: c.weeklyLikesCount + 1, likesCount: c.likesCount + 1 }
          : c
      )
    );
  };

  const handleLikeCharacter = (charId: string) => {
    setCharacters((prev) =>
      prev.map((c) => (c.id === charId ? { ...c, likesCount: c.likesCount + 1 } : c))
    );
  };

  const handleAddCharacter = (newChar: Character) => {
    setCharacters((prev) => [newChar, ...prev]);
  };

  const handleUpdateCharacter = (updated: Character) => {
    setCharacters((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDeleteCharacter = (id: string) => {
    soundManager.playBoop();
    setCharacters((prev) => prev.filter((c) => c.id !== id));
    if (selectedCharacter && selectedCharacter.id === id) {
      setSelectedCharacter(null);
    }
  };

  const handleOpenAddCharacter = () => {
    setCharacterToEdit('NEW');
  };

  const handleOpenEditCharacter = (char: Character) => {
    setCharacterToEdit(char);
  };

  const handleSaveCharacterFromModal = (savedChar: Character) => {
    setCharacters((prev) => {
      const exists = prev.some((c) => c.id === savedChar.id);
      if (exists) {
        return prev.map((c) => (c.id === savedChar.id ? savedChar : c));
      } else {
        return [savedChar, ...prev];
      }
    });
    if (selectedCharacter && selectedCharacter.id === savedChar.id) {
      setSelectedCharacter(savedChar);
    }
  };

  const handleAddAnnouncement = (newAnn: Announcement) => {
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

  const handleDeleteAnnouncement = (id: string) => {
    soundManager.playBoop();
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  const scrollToTop = () => {
    soundManager.playBoop();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      {/* Animated Entrance Gate */}
      {showEntrance ? (
        <EntranceGate onEnter={handleEnterClassroom} />
      ) : (
        <div className="relative min-h-screen flex flex-col justify-between selection:bg-[#FCD3E2] selection:text-[#62566F]">
          {/* Background Environmental Floating Elements & Snow Effect */}
          <FloatingDecorations />
          <SnowEffect />

          {/* Sticky Navigation Header */}
          <Navbar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenProfile={() => setShowProfileModal(true)}
            onOpenNotifications={() => setShowNotificationModal(true)}
            unreadCount={unreadCount}
          />

          {/* Main Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 md:py-8 z-10 relative">
            
            {/* Teacher Atelier & Social Channels Ribbon */}
            <div className="mb-6 p-4 md:p-5 rounded-3xl glass-panel border border-white shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-white/85 via-[#FAF4FE]/85 to-[#FFF7EF]/85">
              <div className="flex items-center gap-3.5">
                <div className="relative shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80"
                    alt="Cô Giáo"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm ring-2 ring-[#E9DCF8]"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-2xs">
                    <Sparkles className="w-3 h-3 text-[#E2799F]" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-sm md:text-base text-[#3F334D]">
                      Không Gian Lớp Học Mầm Non Rắn Con ♡
                    </span>
                    <span className="text-[10px] bg-[#EAE2F8] text-[#8E75B2] font-bold px-2 py-0.5 rounded-full border border-white">
                      Atelier Cô Giáo
                    </span>
                  </div>
                  <p className="text-xs text-[#7A6C88] font-luxury italic line-clamp-1">
                    “Chào đón các bạn nhỏ ghé chơi! Ghé thăm Facebook và Discord để cùng trò chuyện và sáng tạo nhân vật nhé ♡”
                  </p>
                </div>
              </div>

              {/* Direct Facebook & Discord Action Buttons with Matching Pastel Colors */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-center md:justify-end shrink-0">
                <a
                  href="https://facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundManager.playBoop()}
                  className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#EBF2FE] to-[#F0E6FA] hover:bg-white text-[#2B529B] border border-[#CBD7F9] text-[10px] sm:text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer font-heading"
                  title="Mở nhóm Facebook"
                >
                  <span>Facebook Lớp</span>
                  <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </a>

                <a
                  href="https://discord.gg/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundManager.playBoop()}
                  className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#EEECFC] to-[#FCE8F2] hover:bg-white text-[#4853C3] border border-[#D5D0FA] text-[10px] sm:text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer font-heading"
                  title="Mở máy chủ Discord"
                >
                  <span>Discord</span>
                  <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </a>
              </div>
            </div>

            {/* VIEW: HOME */}
            {activeTab === 'home' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-3 order-2 lg:order-1">
                  <HomeTeacherCorner
                    onExploreLibrary={() => setActiveTab('library')}
                    onOpenInbox={() => setActiveTab('inbox')}
                    onAddNewCharacter={handleOpenAddCharacter}
                  />
                </div>

                <div className="lg:col-span-6 order-1 lg:order-2">
                  <HomeBulletinBoard
                    announcements={announcements}
                    characters={characters}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    selectedTag={selectedTag}
                    onTagChange={setSelectedTag}
                    onOpenDetail={(char) => setSelectedCharacter(char)}
                    onViewAllCharacters={() => setActiveTab('library')}
                    onAddNewCharacter={handleOpenAddCharacter}
                    onEditCharacter={handleOpenEditCharacter}
                    onDeleteCharacter={handleDeleteCharacter}
                  />
                </div>

                <div className="lg:col-span-3 order-3">
                  <HomeGoodStudentsCorner
                    characters={characters}
                    onOpenDetail={(char) => setSelectedCharacter(char)}
                    onOpenRanking={() => setActiveTab('ranking')}
                    onOpenRandom={() => setActiveTab('random')}
                    onSelectTag={(tag) => {
                      setSelectedTag(tag);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                  />
                </div>
              </div>
            )}

            {/* VIEW: CHARACTER LIBRARY */}
            {activeTab === 'library' && (
              <CharacterLibraryView
                characters={characters}
                onOpenDetail={(char) => setSelectedCharacter(char)}
                onLikeCharacter={handleLikeCharacter}
                onAddNewCharacter={handleOpenAddCharacter}
                onEditCharacter={handleOpenEditCharacter}
                onDeleteCharacter={handleDeleteCharacter}
              />
            )}

            {/* VIEW: WEEKLY RANKING */}
            {activeTab === 'ranking' && (
              <WeeklyRankingView
                characters={characters}
                onOpenDetail={(char) => setSelectedCharacter(char)}
                onVoteCharacter={handleVoteCharacter}
              />
            )}

            {/* VIEW: RANDOM CHARACTER */}
            {activeTab === 'random' && (
              <RandomHusbandView
                characters={characters}
                onOpenDetail={(char) => setSelectedCharacter(char)}
              />
            )}

            {/* VIEW: ENTERTAINMENT CENTER */}
            {activeTab === 'entertainment' && <EntertainmentView />}

            {/* VIEW: MUSIC ROOM */}
            {activeTab === 'music' && <MusicRoomView />}

            {/* VIEW: COMMUNITY WALL */}
            {activeTab === 'community' && <CommunityWallView />}

            {/* VIEW: SECRET INBOX */}
            {activeTab === 'inbox' && <SecretInboxView />}

            {/* VIEW: MESSENGER */}
            {activeTab === 'messenger' && <MessengerView />}

            {/* VIEW: ADMIN DASHBOARD */}
            {activeTab === 'admin' && (
              <AdminDashboard
                characters={characters}
                announcements={announcements}
                onAddCharacter={handleAddCharacter}
                onUpdateCharacter={handleUpdateCharacter}
                onDeleteCharacter={handleDeleteCharacter}
                onAddAnnouncement={handleAddAnnouncement}
                onDeleteAnnouncement={handleDeleteAnnouncement}
              />
            )}

          </main>

          {/* Persistent Floating Mini Music Disc Player */}
          <FloatingMusicPlayer />

          {/* Floating Quick Action Buttons */}
          <div className="fixed bottom-5 left-5 z-40 flex items-center gap-2 select-none">
            <button
              onClick={() => {
                soundManager.playBoop();
                setShowEntrance(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full glass-panel hover:bg-white text-xs font-bold text-[#3F334D] shadow-md transition-all cursor-pointer border border-white"
              title="Quay lại Cổng Trường"
            >
              <DoorOpen className="w-4 h-4 text-[#8E75B2]" />
              <span className="hidden sm:inline">Cổng trường</span>
            </button>

            <button
              onClick={scrollToTop}
              className="p-2.5 rounded-full glass-panel hover:bg-white text-[#3F334D] hover:text-[#8E75B2] shadow-md transition-all cursor-pointer border border-white"
              title="Lên đầu trang"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>

          {/* Character Detail Modal */}
          {selectedCharacter && (
            <CharacterDetailModal
              character={selectedCharacter}
              onClose={() => setSelectedCharacter(null)}
              onLike={handleLikeCharacter}
              onEdit={handleOpenEditCharacter}
              onDelete={handleDeleteCharacter}
            />
          )}

          {/* Character Create & Edit Modal */}
          <CharacterEditModal
            isOpen={characterToEdit !== null}
            character={characterToEdit === 'NEW' ? null : characterToEdit}
            onClose={() => setCharacterToEdit(null)}
            onSave={handleSaveCharacterFromModal}
            onDelete={handleDeleteCharacter}
          />

          {/* Profile Modal */}
          {showProfileModal && (
            <UserProfileModal
              characters={characters}
              onClose={() => setShowProfileModal(false)}
              onOpenCharacterDetail={(char) => {
                setShowProfileModal(false);
                setSelectedCharacter(char);
              }}
            />
          )}

          {/* Notifications Modal */}
          {showNotificationModal && (
            <NotificationModal
              notifications={notifications}
              onClose={() => setShowNotificationModal(false)}
              onMarkAllAsRead={() =>
                setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
              }
            />
          )}

          {/* Footer */}
          <footer className="mt-12 bg-white/60 backdrop-blur-xl border-t border-white/80 py-8 text-center text-xs text-[#7A6C88] z-10 relative">
            <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#E0D3F8] via-[#FCE4EE] to-[#FEF5E7] p-[1px] shadow-2xs">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-[#8E75B2]" />
                  </div>
                </div>
                <span className="font-heading font-bold text-sm text-[#3F334D]">
                  Mầm Non Rắn Con — GGAI Kindergarten & Character Atelier
                </span>
              </div>
              <p className="max-w-md text-center text-[11px] leading-relaxed font-luxury italic">
                Không gian nghệ thuật mộng mơ dành cho các nhà sáng tạo nhân vật Google AI Studio. 
                Cùng lan tỏa những câu chuyện ấm áp, kết nối tình bạn và lưu giữ ký ức tuổi thơ tươi đẹp ♡
              </p>
              <div className="flex items-center gap-4 text-[11px] font-semibold text-[#4A3B53] pt-2">
                <button onClick={() => setActiveTab('home')} className="hover:underline cursor-pointer">Trang chủ</button>
                <span>•</span>
                <button onClick={() => setActiveTab('library')} className="hover:underline cursor-pointer">Tủ nhân vật</button>
                <span>•</span>
                <button onClick={() => setActiveTab('ranking')} className="hover:underline cursor-pointer">Bé ngoan</button>
                <span>•</span>
                <button onClick={() => setActiveTab('entertainment')} className="hover:underline cursor-pointer">Góc vui chơi</button>
                <span>•</span>
                <button onClick={() => setActiveTab('inbox')} className="hover:underline cursor-pointer">Hòm thư</button>
              </div>
              <div className="text-[10px] text-[#8E75B2] pt-1">
                © 2026 Mầm Non Rắn Con. All adorable characters belong to their respective creators.
              </div>
            </div>
          </footer>
        </div>
      )}
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MusicProvider>
        <MainAppInner />
      </MusicProvider>
    </AuthProvider>
  );
}
