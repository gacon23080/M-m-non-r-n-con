import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  BookOpen, 
  Heart, 
  Mail, 
  Bell, 
  Trophy, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  Check, 
  X, 
  RefreshCw,
  Sparkles,
  Layers,
  Tag,
  Music,
  Play,
  Pause,
  ExternalLink
} from 'lucide-react';
import { Character, Announcement, AnonymousMessage, CharacterCategory, MusicTrack } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useMusic } from '../../context/MusicContext';
import { soundManager } from '../../lib/sound';

interface AdminDashboardProps {
  characters: Character[];
  announcements: Announcement[];
  categories?: string[];
  tags?: string[];
  onAddCategory?: (category: string) => void;
  onDeleteCategory?: (category: string) => void;
  onAddTag?: (tag: string) => void;
  onDeleteTag?: (tag: string) => void;
  onAddCharacter: (character: Character) => void;
  onUpdateCharacter: (character: Character) => void;
  onDeleteCharacter: (id: string) => void;
  onAddAnnouncement: (announcement: Announcement) => void;
  onUpdateAnnouncement: (announcement: Announcement) => void;
  onDeleteAnnouncement: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  characters,
  announcements,
  categories: customCategories = [],
  tags: customTags = [],
  onAddCategory,
  onDeleteCategory,
  onAddTag,
  onDeleteTag,
  onAddCharacter,
  onUpdateCharacter,
  onDeleteCharacter,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement
}) => {
  const { profile } = useAuth();
  const { playlist, addTrackToPlaylist, removeTrack, currentTrack, isPlaying, togglePlay, selectTrack } = useMusic();
  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'characters' | 'announcements' | 'categories_tags' | 'music'>('overview');
  
  // Category & Tag Form State
  const [newCatInput, setNewCatInput] = useState<string>('');
  const [newTagInput, setNewTagInput] = useState<string>('');

  // Music Track Form State
  const [showAddMusicModal, setShowAddMusicModal] = useState<boolean>(false);
  const [newTrackTitle, setNewTrackTitle] = useState<string>('');
  const [newTrackArtist, setNewTrackArtist] = useState<string>('Cô Giáo Rắn Con');
  const [newTrackUrl, setNewTrackUrl] = useState<string>('');
  const [newTrackCategory, setNewTrackCategory] = useState<string>('Lớp học');
  const [newTrackDuration, setNewTrackDuration] = useState<string>('03:00');

  // Character Form State
  const [showCharModal, setShowCharModal] = useState<boolean>(false);
  const [editingCharId, setEditingCharId] = useState<string | null>(null);
  const [charName, setCharName] = useState<string>('');
  const [charCreator, setCharCreator] = useState<string>('');
  const [charCategory, setCharCategory] = useState<string>('Original Characters');
  const [charShortDesc, setCharShortDesc] = useState<string>('');
  const [charFullDesc, setCharFullDesc] = useState<string>('');
  const [charPersonality, setCharPersonality] = useState<string>('');
  const [charStory, setCharStory] = useState<string>('');
  const [charRelations, setCharRelations] = useState<string>('');
  const [charTags, setCharTags] = useState<string>('#Chibi, #Cute');
  const [charAiUrl, setCharAiUrl] = useState<string>('https://aistudio.google.com/');
  const [charAvatar, setCharAvatar] = useState<string>('https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=80');

  // Announcement Form State
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [annTitle, setAnnTitle] = useState<string>('');
  const [annContent, setAnnContent] = useState<string>('');
  const [annType, setAnnType] = useState<'notice' | 'event' | 'update'>('notice');

  const defaultCategories = [
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

  const categories = customCategories.length > 0 ? customCategories : defaultCategories;

  // Stats calculation
  const totalLikes = characters.reduce((acc, c) => acc + c.likesCount, 0);
  const totalWeeklyLikes = characters.reduce((acc, c) => acc + c.weeklyLikesCount, 0);
  const totalViews = characters.reduce((acc, c) => acc + c.viewsCount, 0);

  const handleOpenAddChar = () => {
    setEditingCharId(null);
    setCharName('');
    setCharCreator(profile?.displayName || 'Cô Giáo Rắn Con');
    setCharCategory('Original Characters');
    setCharShortDesc('');
    setCharFullDesc('');
    setCharPersonality('');
    setCharStory('');
    setCharRelations('');
    setCharTags('#Chibi, #Cute');
    setCharAiUrl('https://aistudio.google.com/');
    setCharAvatar('https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=80');
    setShowCharModal(true);
  };

  const handleOpenEditChar = (char: Character) => {
    setEditingCharId(char.id);
    setCharName(char.name);
    setCharCreator(char.creator);
    setCharCategory(char.category);
    setCharShortDesc(char.shortDescription);
    setCharFullDesc(char.fullDescription);
    setCharPersonality(char.personality);
    setCharStory(char.backgroundStory);
    setCharRelations(char.relationships);
    setCharTags(char.tags.join(', '));
    setCharAiUrl(char.googleAiStudioUrl);
    setCharAvatar(char.avatarUrl);
    setShowCharModal(true);
  };

  const handleSaveCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playMagicChime();

    const tagList = charTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    if (editingCharId) {
      const existing = characters.find((c) => c.id === editingCharId);
      if (existing) {
        onUpdateCharacter({
          ...existing,
          name: charName.trim(),
          creator: charCreator.trim(),
          category: charCategory,
          shortDescription: charShortDesc.trim(),
          fullDescription: charFullDesc.trim() || charShortDesc.trim(),
          personality: charPersonality.trim() || 'Thân thiện, chăm ngoan.',
          backgroundStory: charStory.trim() || 'Học sinh lớp Mầm Non Rắn Con.',
          relationships: charRelations.trim() || 'Bạn bè trong lớp.',
          tags: tagList,
          googleAiStudioUrl: charAiUrl.trim() || 'https://aistudio.google.com/',
          avatarUrl: charAvatar.trim() || existing.avatarUrl
        });
      }
    } else {
      const newChar: Character = {
        id: `char-${Date.now()}`,
        name: charName.trim(),
        creator: charCreator.trim() || 'Cô Giáo Rắn Con',
        category: charCategory,
        shortDescription: charShortDesc.trim(),
        fullDescription: charFullDesc.trim() || charShortDesc.trim(),
        personality: charPersonality.trim() || 'Thân thiện, chăm ngoan.',
        backgroundStory: charStory.trim() || 'Học sinh lớp Mầm Non Rắn Con.',
        relationships: charRelations.trim() || 'Bạn bè trong lớp.',
        tags: tagList,
        googleAiStudioUrl: charAiUrl.trim() || 'https://aistudio.google.com/',
        avatarUrl: charAvatar.trim(),
        coverUrl: charAvatar.trim(),
        gallery: [charAvatar.trim()],
        likesCount: 1,
        weeklyLikesCount: 1,
        viewsCount: 10,
        isFeatured: false,
        isPublished: true,
        createdAt: new Date().toISOString()
      };
      onAddCharacter(newChar);
    }

    setShowCharModal(false);
  };

  const handleAddAnn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    soundManager.playMagicChime();
    
    if (editingAnnId) {
      const updatedAnn: Announcement = {
        id: editingAnnId,
        title: annTitle.trim(),
        content: annContent.trim(),
        type: annType,
        isPinned: true,
        authorName: profile?.displayName || 'Cô Giáo Chủ Nhiệm',
        createdAt: announcements.find(a => a.id === editingAnnId)?.createdAt || new Date().toISOString()
      };
      onUpdateAnnouncement(updatedAnn);
      setEditingAnnId(null);
    } else {
      const newAnn: Announcement = {
        id: `ann-${Date.now()}`,
        title: annTitle.trim(),
        content: annContent.trim(),
        type: annType,
        isPinned: true,
        authorName: profile?.displayName || 'Cô Giáo Chủ Nhiệm',
        createdAt: new Date().toISOString()
      };
      onAddAnnouncement(newAnn);
    }

    setAnnTitle('');
    setAnnContent('');
    setAnnType('notice');
  };

  const handleStartEditAnn = (ann: Announcement) => {
    soundManager.playBoop();
    setEditingAnnId(ann.id);
    setAnnTitle(ann.title);
    setAnnContent(ann.content);
    setAnnType(ann.type as any);
    // Switch tab if not already on it
    setActiveAdminTab('announcements');
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner - Luxury & Ethereal (No mascot) */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white shadow-sm flex items-center justify-between bg-gradient-to-r from-[#EAE2F8]/70 via-[#FDE5EF]/70 to-[#FEF5E7]/70">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-[#8E75B2]" />
            <span className="text-xs uppercase font-bold tracking-widest text-[#8E75B2] bg-white/70 px-3 py-1 rounded-full border border-white font-caption">
              Khu vực quản trị trường học
            </span>
          </div>
          <h1 className="font-heading font-bold text-2xl md:text-4xl text-[#3F334D] mb-1">
            PHÒNG GIÁO VIÊN — QUẢN TRỊ LỚP
          </h1>
          <p className="text-xs md:text-sm text-[#7A6C88] font-luxury italic">
            Quản lý kho nhân vật, phát thông báo mới, duyệt hòm thư và theo dõi thống kê lớp học.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-white/70 px-4 py-2.5 rounded-2xl border border-white">
          <Sparkles className="w-5 h-5 text-[#8E75B2]" />
          <span className="text-xs font-bold text-[#3F334D]">Atelier Admin</span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveAdminTab('overview')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer font-heading ${
            activeAdminTab === 'overview'
              ? 'bg-[#A594D6] text-white shadow-xs'
              : 'bg-white text-[#62566F] border border-[#E8DFF3] hover:bg-white/80'
          }`}
        >
          Tổng Quan Thống Kê
        </button>
        <button
          onClick={() => setActiveAdminTab('characters')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer font-heading ${
            activeAdminTab === 'characters'
              ? 'bg-[#A594D6] text-white shadow-xs'
              : 'bg-white text-[#62566F] border border-[#E8DFF3] hover:bg-white/80'
          }`}
        >
          Quản Lý Nhân Vật ({characters.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('announcements')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer font-heading ${
            activeAdminTab === 'announcements'
              ? 'bg-[#A594D6] text-white shadow-xs'
              : 'bg-white text-[#62566F] border border-[#E8DFF3] hover:bg-white/80'
          }`}
        >
          Bảng Thông Báo ({announcements.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('categories_tags')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer font-heading flex items-center gap-1.5 ${
            activeAdminTab === 'categories_tags'
              ? 'bg-[#A594D6] text-white shadow-xs'
              : 'bg-white text-[#62566F] border border-[#E8DFF3] hover:bg-white/80'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Thể Loại & Tags ({categories.length}/{customTags.length})</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('music')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer font-heading flex items-center gap-1.5 ${
            activeAdminTab === 'music'
              ? 'bg-[#A594D6] text-white shadow-xs'
              : 'bg-white text-[#62566F] border border-[#E8DFF3] hover:bg-white/80'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>Quản Lý Playlist Nhạc ({playlist.length})</span>
        </button>
      </div>

      {/* OVERVIEW STATS */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-3xl bg-white/90 border border-[#E8DFF3] shadow-xs">
              <div className="flex items-center justify-between text-[#93879E] text-xs mb-1">
                <span>Tổng số bé</span>
                <BookOpen className="w-4 h-4 text-[#A594D6]" />
              </div>
              <div className="font-heading font-bold text-2xl text-[#62566F]">
                {characters.length}
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                Đang mở công khai
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-white/90 border border-[#E8DFF3] shadow-xs">
              <div className="flex items-center justify-between text-[#93879E] text-xs mb-1">
                <span>Phiếu bầu tuần</span>
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              <div className="font-heading font-bold text-2xl text-[#E11D48]">
                {totalWeeklyLikes}
              </div>
              <div className="text-[10px] text-[#93879E] mt-1">
                Bé ngoan tuần 44
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-white/90 border border-[#E8DFF3] shadow-xs">
              <div className="flex items-center justify-between text-[#93879E] text-xs mb-1">
                <span>Tổng lượt yêu thích</span>
                <Heart className="w-4 h-4 text-[#F472B6]" />
              </div>
              <div className="font-heading font-bold text-2xl text-[#62566F]">
                {totalLikes}
              </div>
              <div className="text-[10px] text-[#93879E] mt-1">
                Tất cả thời gian
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-white/90 border border-[#E8DFF3] shadow-xs">
              <div className="flex items-center justify-between text-[#93879E] text-xs mb-1">
                <span>Lượt xem trang</span>
                <Eye className="w-4 h-4 text-[#A594D6]" />
              </div>
              <div className="font-heading font-bold text-2xl text-[#62566F]">
                {totalViews}
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                Rất tích cực!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHARACTERS MANAGER */}
      {activeAdminTab === 'characters' && (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#E8DFF3] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-[#62566F]">
              Danh sách nhân vật trong tủ
            </h3>
            <button
              onClick={handleOpenAddChar}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#A594D6] hover:bg-[#8F7BBF] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Bé Mới</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#F1EBF9] text-[#93879E]">
                  <th className="pb-3 font-caption">Bé nhân vật</th>
                  <th className="pb-3 font-caption">Tác giả</th>
                  <th className="pb-3 font-caption">Thể loại</th>
                  <th className="pb-3 font-caption text-center">Tim tuần</th>
                  <th className="pb-3 font-caption text-center">Tổng tim</th>
                  <th className="pb-3 font-caption text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EBF9]">
                {characters.map((char) => (
                  <tr key={char.id} className="hover:bg-[#FFF0F5]/40 transition-colors">
                    <td className="py-3 flex items-center gap-2.5">
                      <img
                        src={char.avatarUrl}
                        alt={char.name}
                        className="w-9 h-9 rounded-xl object-cover border border-[#D2C8F2]"
                      />
                      <div>
                        <div className="font-bold text-[#62566F]">{char.name}</div>
                        <div className="text-[10px] text-[#93879E] line-clamp-1 max-w-xs">
                          {char.shortDescription}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-[#62566F] font-semibold">{char.creator}</td>
                    <td className="py-3">
                      <span className="bg-[#E9E2FA] text-[#62566F] px-2 py-0.5 rounded-md font-bold text-[10px]">
                        {char.category}
                      </span>
                    </td>
                    <td className="py-3 text-center font-bold text-[#E11D48]">
                      {char.weeklyLikesCount}
                    </td>
                    <td className="py-3 text-center text-[#62566F]">{char.likesCount}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditChar(char)}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#D2C8F2] text-[#62566F] cursor-pointer"
                          title="Sửa thông tin"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteCharacter(char.id)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                          title="Xóa nhân vật"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS MANAGER */}
      {activeAdminTab === 'announcements' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Create Announcement */}
          <div className="md:col-span-5 bg-white/90 backdrop-blur-md rounded-3xl border border-[#E8DFF3] p-5 shadow-sm">
            <h3 className="font-heading font-bold text-base text-[#62566F] mb-3 flex items-center justify-between">
              <span>{editingAnnId ? 'Chỉnh sửa thông báo' : 'Đăng thông báo mới'}</span>
              {editingAnnId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingAnnId(null);
                    setAnnTitle('');
                    setAnnContent('');
                    setAnnType('notice');
                  }}
                  className="text-[10px] font-bold text-rose-500 hover:underline"
                >
                  Hủy chỉnh sửa
                </button>
              )}
            </h3>
            <form onSubmit={handleAddAnn} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#62566F] mb-1">
                  Tiêu đề thông báo:
                </label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="Ví dụ: Chào mừng sự kiện tuần mới..."
                  className="w-full px-3 py-2 rounded-xl bg-[#FFF0F5]/50 border border-[#E8DFF3] text-xs text-[#62566F] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#62566F] mb-1">
                  Loại thông báo:
                </label>
                <select
                  value={annType}
                  onChange={(e: any) => setAnnType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FFF0F5]/50 border border-[#E8DFF3] text-xs text-[#62566F] focus:outline-none cursor-pointer"
                >
                  <option value="notice">Thông báo chung</option>
                  <option value="event">Sự kiện bé ngoan</option>
                  <option value="update">Cập nhật hệ thống</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#62566F] mb-1">
                  Nội dung chi tiết:
                </label>
                <textarea
                  rows={4}
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Nội dung truyền đạt tới phụ huynh và học sinh..."
                  className="w-full p-3 rounded-xl bg-[#FFF0F5]/50 border border-[#E8DFF3] text-xs text-[#62566F] focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 rounded-full text-white text-xs font-bold transition-all cursor-pointer font-heading ${
                  editingAnnId ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-[#A594D6] hover:bg-[#8F7BBF]'
                }`}
              >
                {editingAnnId ? 'LƯU THAY ĐỔI ♡' : 'ĐĂNG THÔNG BÁO LÊN BẢNG ♡'}
              </button>
            </form>
          </div>

          {/* List of Existing Announcements */}
          <div className="md:col-span-7 bg-white/90 backdrop-blur-md rounded-3xl border border-[#E8DFF3] p-5 shadow-sm space-y-3">
            <h3 className="font-heading font-bold text-base text-[#62566F]">
              Các thông báo đang ghim trên bảng tin ({announcements.length})
            </h3>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-3 rounded-2xl bg-[#FFF0F5]/50 border border-[#F1EBF9] flex items-start justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold bg-[#E9E2FA] text-[#62566F] px-2 py-0.5 rounded-md">
                        {ann.type}
                      </span>
                      <span className="font-heading font-bold text-xs text-[#62566F]">
                        {ann.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#93879E] line-clamp-2 leading-relaxed">
                      {ann.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEditAnn(ann)}
                      className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 cursor-pointer"
                      title="Sửa thông báo"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteAnnouncement(ann.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                      title="Gỡ thông báo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CATEGORIES & TAGS MANAGEMENT */}
      {activeAdminTab === 'categories_tags' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Categories Section */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#E8DFF3] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F1EBF9]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#8E75B2]" />
                <h3 className="font-heading font-bold text-sm text-[#4A3C56]">
                  Thể Loại Nhân Vật ({categories.length})
                </h3>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCatInput.trim()) return;
                onAddCategory?.(newCatInput.trim());
                setNewCatInput('');
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Thêm thể loại mới (vd: Huyễn Tưởng, Tiên Hiệp)..."
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#FFF0F5]/50 border border-[#E8DFF3] text-[#4A3C56] focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#8E75B2] hover:bg-[#7D64A3] text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm
              </button>
            </form>

            <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto pt-1">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF4FE] border border-[#D2C8F2] text-xs font-semibold text-[#4A3C56] group hover:border-[#8E75B2] transition-colors"
                >
                  <span>{cat}</span>
                  <button
                    type="button"
                    onClick={() => onDeleteCategory?.(cat)}
                    className="p-0.5 text-gray-400 hover:text-rose-500 rounded-full cursor-pointer transition-colors"
                    title={`Xóa thể loại ${cat}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tags Section */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#E8DFF3] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F1EBF9]">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#E2799F]" />
                <h3 className="font-heading font-bold text-sm text-[#4A3C56]">
                  Nhãn Tags Nhân Vật ({customTags.length})
                </h3>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newTagInput.trim()) return;
                onAddTag?.(newTagInput.trim());
                setNewTagInput('');
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Thêm nhãn tag mới (vd: #Tsundere, #CunCon)..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#FFF0F5]/50 border border-[#E8DFF3] text-[#4A3C56] focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#E2799F] hover:bg-[#D0658D] text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm Tag
              </button>
            </form>

            <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto pt-1">
              {customTags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF0F5] border border-[#FCD3E2] text-xs font-semibold text-[#8E75B2] group hover:border-[#E2799F] transition-colors"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => onDeleteTag?.(tag)}
                    className="p-0.5 text-gray-400 hover:text-rose-500 rounded-full cursor-pointer transition-colors"
                    title={`Xóa tag ${tag}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MUSIC PLAYLIST MANAGEMENT */}
      {activeAdminTab === 'music' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/90 p-5 rounded-3xl border border-[#E8DFF3] shadow-xs">
            <div>
              <h3 className="font-heading font-bold text-base text-[#4A3C56] flex items-center gap-2">
                <Music className="w-5 h-5 text-[#8E75B2]" />
                <span>Danh Sách Phát Nhạc Của Lớp ({playlist.length} bài)</span>
              </h3>
              <p className="text-xs text-[#827290] font-luxury italic">
                Cô giáo có thể xóa các bài nhạc không phù hợp, thêm bài hát mới và thay đổi nhạc nền
              </p>
            </div>
            <button
              onClick={() => setShowAddMusicModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8E75B2] to-[#E2799F] text-white text-xs font-bold shadow-xs hover:scale-102 transition-transform flex items-center gap-1.5 cursor-pointer font-heading"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Bài Hát Mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlist.map((track) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  className={`p-4 rounded-3xl border transition-all flex flex-col justify-between gap-3 bg-white ${
                    isCurrent ? 'border-[#8E75B2] shadow-md ring-2 ring-[#E9DCF8]' : 'border-[#E8DFF3] hover:border-[#8E75B2]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={track.coverUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&auto=format&fit=crop&q=80'}
                      alt={track.title}
                      className="w-12 h-12 rounded-2xl object-cover border border-[#D2C8F2] shadow-2xs shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-heading font-bold text-xs text-[#4A3C56] truncate">
                        {track.title}
                      </h4>
                      <p className="text-[11px] text-[#827290] truncate">
                        {track.artist}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] bg-[#FAF4FE] text-[#8E75B2] font-bold px-2 py-0.5 rounded-full border border-[#D2C8F2]">
                          {track.category || 'Lớp học'}
                        </span>
                        <span className="text-[9px] text-gray-400">
                          {track.duration || '03:00'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#F1EBF9]">
                    <button
                      onClick={() => {
                        selectTrack(track);
                        if (!isPlaying || !isCurrent) togglePlay();
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                        isCurrent && isPlaying
                          ? 'bg-[#8E75B2] text-white shadow-xs'
                          : 'bg-[#FAF4FE] hover:bg-[#E9DCF8] text-[#8E75B2]'
                      }`}
                    >
                      {isCurrent && isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isCurrent && isPlaying ? 'Đang phát' : 'Nghe thử'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Cô giáo có chắc chắn muốn xóa bài "${track.title}" khỏi danh sách phát không?`)) {
                          removeTrack(track.id);
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-xl text-rose-500 hover:bg-rose-50 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Xóa bài hát"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal Thêm Nhạc Mới */}
          {showAddMusicModal && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl border border-[#D2C8F2] p-6 max-w-md w-full shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#F1EBF9]">
                  <h3 className="font-heading font-bold text-base text-[#4A3C56] flex items-center gap-2">
                    <Music className="w-4 h-4 text-[#8E75B2]" />
                    <span>Thêm Bài Hát Mới Vào Playlist</span>
                  </h3>
                  <button
                    onClick={() => setShowAddMusicModal(false)}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newTrackTitle.trim()) return;
                    const newTrack: MusicTrack = {
                      id: `track-${Date.now()}`,
                      title: newTrackTitle.trim(),
                      artist: newTrackArtist.trim() || 'Cô Giáo Rắn Con',
                      youtubeUrl: newTrackUrl.trim() || undefined,
                      category: newTrackCategory,
                      duration: newTrackDuration,
                      coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
                      synthTheme: 'classroom',
                      order: playlist.length + 1
                    };
                    addTrackToPlaylist(newTrack);
                    setShowAddMusicModal(false);
                    setNewTrackTitle('');
                    setNewTrackUrl('');
                  }}
                  className="space-y-3 text-xs"
                >
                  <div>
                    <label className="block font-bold text-[#4A3C56] mb-1">Tên bài hát:</label>
                    <input
                      type="text"
                      required
                      placeholder="Giai Điệu Tuổi Thơ..."
                      value={newTrackTitle}
                      onChange={(e) => setNewTrackTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF4FE] border border-[#D2C8F2] text-[#4A3C56] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#4A3C56] mb-1">Nghệ sĩ / Ca sĩ:</label>
                    <input
                      type="text"
                      placeholder="Cô Giáo Rắn Con..."
                      value={newTrackArtist}
                      onChange={(e) => setNewTrackArtist(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF4FE] border border-[#D2C8F2] text-[#4A3C56] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#4A3C56] mb-1">Link YouTube (URL) hoặc để trống để dùng nhạc synth:</label>
                    <input
                      type="text"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={newTrackUrl}
                      onChange={(e) => setNewTrackUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF4FE] border border-[#D2C8F2] text-[#4A3C56] focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-[#4A3C56] mb-1">Thể loại:</label>
                      <select
                        value={newTrackCategory}
                        onChange={(e) => setNewTrackCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF4FE] border border-[#D2C8F2] text-[#4A3C56] focus:outline-none"
                      >
                        <option value="Lớp học">Lớp học</option>
                        <option value="Thư giãn">Thư giãn</option>
                        <option value="Vui nhộn">Vui nhộn</option>
                        <option value="Chuông trường">Chuông trường</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-[#4A3C56] mb-1">Thời lượng:</label>
                      <input
                        type="text"
                        placeholder="03:00"
                        value={newTrackDuration}
                        onChange={(e) => setNewTrackDuration(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF4FE] border border-[#D2C8F2] text-[#4A3C56] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-[#F1EBF9]">
                    <button
                      type="button"
                      onClick={() => setShowAddMusicModal(false)}
                      className="px-4 py-2 rounded-xl text-gray-500 font-bold"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#8E75B2] hover:bg-[#7D64A3] text-white font-bold cursor-pointer"
                    >
                      Thêm Vào Playlist
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CHARACTER CREATE/EDIT MODAL */}
      {showCharModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#D2C8F2] p-6 max-w-xl w-full shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1EBF9] mb-4">
              <h3 className="font-heading font-bold text-lg text-[#62566F]">
                {editingCharId ? 'Chỉnh sửa thông tin bé nhân vật' : 'Thêm bé nhân vật mới vào tủ'}
              </h3>
              <button
                onClick={() => setShowCharModal(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-[#93879E]" />
              </button>
            </div>

            <form onSubmit={handleSaveCharacter} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#62566F] mb-1">Tên nhân vật:</label>
                  <input
                    type="text"
                    value={charName}
                    onChange={(e) => setCharName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFF0F5]/50 border border-[#E8DFF3] text-[#62566F] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#62566F] mb-1">Tác giả (Creator):</label>
                  <input
                    type="text"
                    value={charCreator}
                    onChange={(e) => setCharCreator(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFF0F5]/50 border border-[#E8DFF3] text-[#62566F] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#62566F] mb-1">Thể loại:</label>
                  <select
                    value={charCategory}
                    onChange={(e: any) => setCharCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFF0F5]/50 border border-[#E8DFF3] text-[#62566F] focus:outline-none cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#62566F] mb-1">Nhãn tags (cách nhau dấu phẩy):</label>
                  <input
                    type="text"
                    value={charTags}
                    onChange={(e) => setCharTags(e.target.value)}
                    placeholder="#Tsundere, #CEO"
                    className="w-full px-3 py-2 rounded-xl bg-[#FFF0F5]/50 border border-[#E8DFF3] text-[#62566F] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#62566F] mb-1 flex items-center justify-between">
                  <span>Ảnh đại diện nhân vật:</span>
                  <label className="text-[10px] bg-[#E9E2FA] hover:bg-[#D2C8F2] text-[#62566F] font-bold px-2 py-0.5 rounded-lg cursor-pointer transition-colors flex items-center gap-1">
                    <span>📁 Tải ảnh từ máy</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 500 * 1024) {
                            alert('Ảnh quá lớn! Vui lòng chọn ảnh dưới 500KB nhé ♡');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              setCharAvatar(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </label>
                <input
                  type="text"
                  value={charAvatar}
                  onChange={(e) => setCharAvatar(e.target.value)}
                  placeholder="https://... hoặc đã tải từ máy"
                  className="w-full px-3 py-2 rounded-xl bg-[#FFF0F5]/50 border border-[#E8DFF3] text-[#62566F] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#62566F] mb-1">Mô tả ngắn (Quote mở đầu):</label>
                <input
                  type="text"
                  value={charShortDesc}
                  onChange={(e) => setCharShortDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FFF0F5]/50 border border-[#E8DFF3] text-[#62566F] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#62566F] mb-1">Cốt truyện đầy đủ:</label>
                <textarea
                  rows={2}
                  value={charFullDesc}
                  onChange={(e) => setCharFullDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#FFF0F5]/50 border border-[#E8DFF3] text-[#62566F] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#62566F] mb-1">Tính cách:</label>
                  <input
                    type="text"
                    value={charPersonality}
                    onChange={(e) => setCharPersonality(e.target.value)}
                    placeholder="Ấm áp, hoạt bát..."
                    className="w-full px-3 py-2 rounded-xl bg-[#FFF0F5]/50 border border-[#E8DFF3] text-[#62566F] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#62566F] mb-1">Liên kết Google AI Studio:</label>
                  <input
                    type="text"
                    value={charAiUrl}
                    onChange={(e) => setCharAiUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFF0F5]/50 border border-[#E8DFF3] text-[#62566F] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#F1EBF9]">
                <button
                  type="button"
                  onClick={() => setShowCharModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#93879E] cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-[#A594D6] text-white text-xs font-bold hover:bg-[#8F7BBF] transition-all cursor-pointer font-heading"
                >
                  LƯU THAY ĐỔI ♡
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
