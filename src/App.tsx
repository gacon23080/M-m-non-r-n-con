import React, { useState, useEffect } from 'react';
import { 
  ArrowUp, 
  DoorOpen, 
  Sparkles, 
  ExternalLink
} from 'lucide-react';
import { Character, Announcement, AppNotification } from './types';
import { INITIAL_CHARACTERS, INITIAL_ANNOUNCEMENTS } from './lib/initialData';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MusicProvider, useMusic } from './context/MusicContext';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
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
import { AnnouncementEditModal } from './components/admin/AnnouncementEditModal';
import { CharacterEditModal } from './components/characters/CharacterEditModal';
import { soundManager } from './lib/sound';
import { motion, AnimatePresence } from 'motion/react';

const DEFAULT_CATEGORIES = [
  'Hiện đại',
  'Cổ trang',
  'Học đường',
  'Tổng tài',
  'Fantasy',
  'Anime',
  'Kinh dị',
  'Đời thường',
  'Thanh xuân',
  'Boylove',
  'Girllove',
  'Original Characters',
  'Khác'
];

const DEFAULT_TAGS = [
  '#Tsundere',
  '#GoldenRetriever',
  '#CEO',
  '#Historical',
  '#Fantasy',
  '#SchoolLife',
  '#Chibi',
  '#ColdMaleLead',
  '#Romance',
  '#Leader',
  '#MainOC',
  '#Magic',
  '#CatBoy',
  '#Cute'
];

const DEFAULT_TEACHER = {
  name: 'Cô Giáo Rắn Con',
  tagline: 'Chủ nhiệm lớp Mầm Non Rắn Con & Người kể chuyện AI Studio',
  bio: 'Không gian sáng tạo mộng mơ cho các tác giả Google AI Studio.',
  avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
  quote: 'Chào đón các bạn nhỏ ghé chơi! Ghé thăm Facebook và Discord để cùng trò chuyện và sáng tạo nhân vật nhé ♡',
  facebookUrl: 'https://facebook.com/',
  discordUrl: 'https://discord.gg/',
  aiStudioUrl: 'https://aistudio.google.com/'
};

const MainAppInner: React.FC = () => {
  const { startPlayback } = useMusic();
  const { profile, isAdmin, currentUser, loading } = useAuth();
  const [showEntrance, setShowEntrance] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [tags, setTags] = useState<string[]>(DEFAULT_TAGS);
  const [teacherData, setTeacherData] = useState(DEFAULT_TEACHER);

  // Subscribe to Categories & Tags from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'systemSettings', 'categoriesAndTags'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
        if (Array.isArray(data.tags)) {
          setTags(data.tags);
        }
      } else {
        setDoc(doc(db, 'systemSettings', 'categoriesAndTags'), {
          categories: DEFAULT_CATEGORIES,
          tags: DEFAULT_TAGS
        }, { merge: true }).catch(() => {});
      }
    }, (err) => {
      console.warn('categoriesAndTags subscription note:', err);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Teacher Data from Firestore (Strict real-time sync for all visitors)
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'systemSettings', 'teacher'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setTeacherData(prev => ({ ...prev, ...data }));
      }
    }, (err) => {
      console.warn('teacherData subscription note:', err);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateTeacherData = async (newData: any) => {
    setTeacherData(newData);
    try {
      await setDoc(doc(db, 'systemSettings', 'teacher'), newData, { merge: true });
    } catch (err) {
      console.warn('Failed to update teacher data in Firestore:', err);
    }
  };

  const handleAddCategory = async (cat: string) => {
    const trimmed = cat.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    const updated = [...categories, trimmed];
    setCategories(updated);
    soundManager.playMagicChime();
    try {
      await setDoc(doc(db, 'systemSettings', 'categoriesAndTags'), { categories: updated }, { merge: true });
    } catch (err) {
      console.warn('Failed to save category:', err);
    }
  };

  const handleDeleteCategory = async (cat: string) => {
    soundManager.playBoop();
    try {
      await setDoc(doc(db, 'systemSettings', 'categoriesAndTags'), { 
        categories: categories.filter(c => c !== cat) 
      }, { merge: true });
    } catch (err) {
      console.warn('Failed to delete category:', err);
    }
  };

  const handleAddTag = async (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    const formatted = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
    if (tags.includes(formatted)) return;
    const updated = [...tags, formatted];
    setTags(updated);
    soundManager.playMagicChime();
    try {
      await setDoc(doc(db, 'systemSettings', 'categoriesAndTags'), { tags: updated }, { merge: true });
    } catch (err) {
      console.warn('Failed to save tag:', err);
    }
  };

  const handleDeleteTag = async (tag: string) => {
    soundManager.playBoop();
    try {
      await setDoc(doc(db, 'systemSettings', 'categoriesAndTags'), { 
        tags: tags.filter(t => t !== tag) 
      }, { merge: true });
    } catch (err) {
      console.warn('Failed to delete tag:', err);
    }
  };
  
  // Subscribe to Characters (Strict: Never auto-seed if deleted or empty, 0 items stay 0)
  useEffect(() => {
    const q = query(collection(db, 'characters'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const c = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Character));
      setCharacters(c);
    }, (err) => {
      console.warn('characters subscription note:', err);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Announcements (Strict: Never auto-seed if deleted or empty, 0 items stay 0)
  useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const a = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
      
      // Auto-notify for new announcement
      if (a.length > 0 && announcements.length > 0) {
        const newest = a[0];
        const lastSeenAnn = localStorage.getItem('mnrc_last_announcement_id');
        if (newest.id !== lastSeenAnn && newest.id !== announcements[0]?.id) {
           setNotifications(prev => [
             {
               id: `ann-notif-${Date.now()}`,
               userId: currentUser?.uid || 'guest',
               type: 'announcement',
               title: '📢 Thông báo mới từ Cô Giáo!',
               message: newest.title,
               isRead: false,
               createdAt: 'Vừa xong'
             },
             ...prev
           ]);
           soundManager.playMagicChime();
           localStorage.setItem('mnrc_last_announcement_id', newest.id);
        }
      } else if (a.length > 0) {
         localStorage.setItem('mnrc_last_announcement_id', a[0].id);
      }
      
      setAnnouncements(a);
    }, (err) => {
      console.warn('announcements subscription note:', err);
    });
    return () => unsubscribe();
  }, [currentUser?.uid, announcements.length]);

  // Selected character for detail modal
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  // Character being edited or created
  const [characterToEdit, setCharacterToEdit] = useState<Character | null | 'NEW'>(null);
  
  // Profile & Notification Modals
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);

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

  // Announcement being edited
  const [announcementToEdit, setAnnouncementToEdit] = useState<Announcement | null>(null);

  useEffect(() => {
    // Check remembered skip entrance
    const skip = localStorage.getItem('mnrc_skip_entrance');
    if (skip === 'true' && profile) {
      setShowEntrance(false);
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#FFF5F8] flex items-center justify-center z-[9999]">
         <div className="flex flex-col items-center gap-4">
            <div className="animate-bounce">
               <Sparkles className="w-12 h-12 text-[#8E75B2]" />
            </div>
            <p className="font-heading font-bold text-[#8E75B2] text-sm animate-pulse">
               Lớp học đang mở cửa... ♡
            </p>
         </div>
      </div>
    );
  }

  const handleEnterClassroom = () => {
    setShowEntrance(false);
    startPlayback();
  };

  const handleVoteCharacter = async (charId: string) => {
    const char = characters.find(c => c.id === charId);
    if (!char) return;
    try {
      await updateDoc(doc(db, 'characters', charId), {
        weeklyLikesCount: (char.weeklyLikesCount || 0) + 1,
        likesCount: (char.likesCount || 0) + 1
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `characters/${charId}`);
    }
  };

  const handleLikeCharacter = async (charId: string) => {
    const char = characters.find(c => c.id === charId);
    if (!char) return;
    try {
      await updateDoc(doc(db, 'characters', charId), {
        likesCount: (char.likesCount || 0) + 1
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `characters/${charId}`);
    }
  };

  const handleAddCharacter = async (newChar: Character) => {
    try {
      const { id, ...data } = newChar;
      await addDoc(collection(db, 'characters'), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'characters');
    }
  };

  const handleUpdateCharacter = async (updated: Character) => {
    try {
      const { id, ...data } = updated;
      await updateDoc(doc(db, 'characters', id), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `characters/${updated.id}`);
    }
  };

  const handleDeleteCharacter = async (id: string) => {
    if (!isAdmin) return;
    soundManager.playBoop();
    
    try {
      await deleteDoc(doc(db, 'characters', id));
      if (selectedCharacter && selectedCharacter.id === id) {
        setSelectedCharacter(null);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `characters/${id}`);
    }
  };

  const handleOpenAddCharacter = () => {
    setCharacterToEdit('NEW');
  };

  const handleOpenEditCharacter = (char: Character) => {
    setCharacterToEdit(char);
  };

  const handleSaveCharacterFromModal = (savedChar: Character) => {
    // Relying on onSnapshot for state updates to ensure consistency with Firestore
    if (selectedCharacter && selectedCharacter.id === savedChar.id) {
      setSelectedCharacter(savedChar);
    }
  };

  const handleAddAnnouncement = async (newAnn: Announcement) => {
    try {
      const { id, ...data } = newAnn;
      await addDoc(collection(db, 'announcements'), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'announcements');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!isAdmin) return;
    soundManager.playBoop();
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `announcements/${id}`);
    }
  };

  const handleUpdateAnnouncement = async (ann: Announcement) => {
    if (!isAdmin) return;
    try {
      const { id, ...data } = ann;
      await updateDoc(doc(db, 'announcements', id), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `announcements/${ann.id}`);
    }
  };

  const scrollToTop = () => {
    soundManager.playBoop();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleOpenEditAnnouncement = (ann: Announcement) => {
    setAnnouncementToEdit(ann);
  };

  const handleSaveAnnouncementFromModal = async (savedAnn: Announcement) => {
    await handleUpdateAnnouncement(savedAnn);
    setAnnouncementToEdit(null);
  };

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

            {/* Main Content Area with Smooth Transitions */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 md:py-8 z-10 relative overflow-x-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  {/* VIEW: HOME */}
                  {activeTab === 'home' && (
                    <div className="space-y-6">
                      {/* Teacher Atelier & Social Channels Ribbon */}
                      <div className="p-4 md:p-5 rounded-3xl glass-panel border border-white shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-white/85 via-[#FAF4FE]/85 to-[#FFF7EF]/85">
                        <div className="flex items-center gap-3.5">
                          <div className="relative shrink-0">
                            <img
                              src={teacherData.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80"}
                              alt={teacherData.name || "Cô Giáo"}
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
                                {teacherData.name || "Atelier Cô Giáo"}
                              </span>
                            </div>
                            <p className="text-xs text-[#7A6C88] font-luxury italic line-clamp-1">
                              “{teacherData.quote || "Chào đón các bạn nhỏ ghé chơi! Ghé thăm Facebook và Discord để cùng trò chuyện và sáng tạo nhân vật nhé ♡"}”
                            </p>
                          </div>
                        </div>

                        {/* Direct Facebook & Discord Action Buttons with Matching Pastel Colors */}
                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-center md:justify-end shrink-0">
                          <a
                            href={teacherData.facebookUrl || "https://facebook.com/"}
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
                            href={teacherData.discordUrl || "https://discord.gg/"}
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

                      <div className="lg:col-span-12 order-1">
                        <HomeGoodStudentsCorner
                          characters={characters}
                          onOpenDetail={(char) => setSelectedCharacter(char)}
                          onOpenRanking={() => setActiveTab('ranking')}
                          onOpenRandom={() => setActiveTab('random')}
                          onSelectTag={(tag) => {
                            setSelectedTag(tag);
                            window.scrollTo({ top: 1200, behavior: 'smooth' });
                          }}
                        />
                      </div>

                      <div className="lg:col-span-8 order-2">
                        <HomeBulletinBoard
                          announcements={announcements}
                          characters={characters}
                          categories={categories}
                          searchTerm={searchTerm}
                          onSearchChange={setSearchTerm}
                          selectedCategory={selectedCategory}
                          onCategoryChange={setSelectedCategory}
                          selectedTag={selectedTag}
                          onTagChange={setSelectedTag}
                          onOpenDetail={(char) => setSelectedCharacter(char)}
                          onViewAllCharacters={() => setActiveTab('library')}
                          onAddNewCharacter={isAdmin ? handleOpenAddCharacter : undefined}
                          onEditCharacter={isAdmin ? handleOpenEditCharacter : undefined}
                          onDeleteCharacter={isAdmin ? handleDeleteCharacter : undefined}
                          onEditAnnouncement={isAdmin ? handleOpenEditAnnouncement : undefined}
                          onDeleteAnnouncement={isAdmin ? handleDeleteAnnouncement : undefined}
                          isAdmin={isAdmin}
                        />
                      </div>

                      <div className="lg:col-span-4 order-3">
                        <HomeTeacherCorner
                          teacherData={teacherData}
                          onUpdateTeacherData={handleUpdateTeacherData}
                          onExploreLibrary={() => setActiveTab('library')}
                          onOpenInbox={() => setActiveTab('inbox')}
                          onAddNewCharacter={isAdmin ? handleOpenAddCharacter : undefined}
                        />
                      </div>
                    </div>
                  )}

                  {/* VIEW: CHARACTER LIBRARY */}
                  {activeTab === 'library' && (
                    <CharacterLibraryView
                      characters={characters}
                      categories={categories}
                      allTags={tags}
                      onOpenDetail={(char) => setSelectedCharacter(char)}
                      onLikeCharacter={handleLikeCharacter}
                      onAddNewCharacter={handleOpenAddCharacter}
                      onEditCharacter={handleOpenEditCharacter}
                      onDeleteCharacter={handleDeleteCharacter}
                      onManageCategoriesAndTags={() => setActiveTab('admin')}
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
                      categories={categories}
                      tags={tags}
                      teacherData={teacherData}
                      onUpdateTeacherData={handleUpdateTeacherData}
                      onAddCategory={handleAddCategory}
                      onDeleteCategory={handleDeleteCategory}
                      onAddTag={handleAddTag}
                      onDeleteTag={handleDeleteTag}
                      onAddCharacter={handleAddCharacter}
                      onUpdateCharacter={handleUpdateCharacter}
                      onDeleteCharacter={handleDeleteCharacter}
                      onAddAnnouncement={handleAddAnnouncement}
                      onUpdateAnnouncement={handleUpdateAnnouncement}
                      onDeleteAnnouncement={handleDeleteAnnouncement}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
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

          {/* Modals with AnimatePresence */}
          <AnimatePresence>
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
            {characterToEdit !== null && (
              <CharacterEditModal
                isOpen={characterToEdit !== null}
                character={characterToEdit === 'NEW' ? null : characterToEdit}
                categories={categories}
                onClose={() => setCharacterToEdit(null)}
                onSave={handleSaveCharacterFromModal}
                onDelete={handleDeleteCharacter}
              />
            )}

            {/* Announcement Edit Modal */}
            {announcementToEdit !== null && (
              <AnnouncementEditModal
                isOpen={announcementToEdit !== null}
                announcement={announcementToEdit}
                onClose={() => setAnnouncementToEdit(null)}
                onSave={handleSaveAnnouncementFromModal}
              />
            )}

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
          </AnimatePresence>

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
