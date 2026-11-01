import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Music, 
  Disc3, 
  Bell, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink,
  Sparkles,
  X,
  Save,
  Link as LinkIcon
} from 'lucide-react';
import { useMusic, extractYouTubeId } from '../../context/MusicContext';
import { useAuth } from '../../context/AuthContext';
import { soundManager } from '../../lib/sound';
import { MusicTrack } from '../../types';

export const MusicRoomView: React.FC = () => {
  const {
    playlist,
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    progress,
    togglePlay,
    selectTrack,
    setVolume,
    toggleMute,
    addTrackToPlaylist,
    updateTrack,
    removeTrack
  } = useMusic();

  const { isAdmin } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');

  // Track Edit / Add Modal State for Admin
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingTrack, setEditingTrack] = useState<MusicTrack | null>(null);
  const [trackTitle, setTrackTitle] = useState<string>('');
  const [trackArtist, setTrackArtist] = useState<string>('');
  const [trackCategory, setTrackCategory] = useState<string>('Lớp học');
  const [trackYoutubeUrl, setTrackYoutubeUrl] = useState<string>('');
  const [trackCoverUrl, setTrackCoverUrl] = useState<string>('');

  const categories = ['Tất cả', 'Lớp học', 'Thư giãn', 'Vui nhộn', 'Chuông trường'];

  const filteredPlaylist = selectedCategory === 'Tất cả'
    ? playlist
    : playlist.filter((t) => t.category === selectedCategory);

  const handlePlayBell = () => {
    soundManager.playSchoolBell();
  };

  const handleOpenAddTrack = () => {
    setEditingTrack(null);
    setTrackTitle('');
    setTrackArtist('Cô Giáo Rắn Con');
    setTrackCategory('Lớp học');
    setTrackYoutubeUrl('https://www.youtube.com/watch?v=');
    setTrackCoverUrl('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80');
    setIsEditModalOpen(true);
  };

  const handleOpenEditTrack = (track: MusicTrack) => {
    setEditingTrack(track);
    setTrackTitle(track.title);
    setTrackArtist(track.artist);
    setTrackCategory(track.category);
    setTrackYoutubeUrl(track.youtubeUrl || (track.youtubeId ? `https://www.youtube.com/watch?v=${track.youtubeId}` : ''));
    setTrackCoverUrl(track.coverUrl);
    setIsEditModalOpen(true);
  };

  const handleSaveTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackTitle.trim()) return;

    soundManager.playMagicChime();
    const ytId = trackYoutubeUrl ? extractYouTubeId(trackYoutubeUrl) : null;

    if (editingTrack) {
      updateTrack({
        ...editingTrack,
        title: trackTitle.trim(),
        artist: trackArtist.trim() || 'Lớp Rắn Con',
        category: trackCategory,
        youtubeUrl: trackYoutubeUrl.trim() || undefined,
        youtubeId: ytId || undefined,
        coverUrl: trackCoverUrl.trim() || editingTrack.coverUrl,
      });
    } else {
      const newTrack: MusicTrack = {
        id: `track-${Date.now()}`,
        title: trackTitle.trim(),
        artist: trackArtist.trim() || 'Cô Giáo Rắn Con',
        category: trackCategory,
        youtubeUrl: trackYoutubeUrl.trim() || undefined,
        youtubeId: ytId || undefined,
        coverUrl: trackCoverUrl.trim() || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
        duration: '3:45',
        order: playlist.length + 1,
      };
      addTrackToPlaylist(newTrack);
    }

    setIsEditModalOpen(false);
  };

  const handleDeleteTrack = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Cô giáo có chắc chắn muốn xóa bài hát này khỏi danh sách phát?')) {
      removeTrack(id);
    }
  };

  const currentYtId = currentTrack?.youtubeId || (currentTrack?.youtubeUrl ? extractYouTubeId(currentTrack.youtubeUrl) : null);

  return (
    <div className="space-y-6">
      {/* Header Banner - Luxury & Ethereal */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-[#EAE2F8]/70 via-[#FDE5EF]/70 to-[#FEF5E7]/70">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🎵</span>
            <span className="text-xs uppercase font-bold tracking-widest text-[#8E75B2] bg-white/70 px-3 py-1 rounded-full border border-white font-caption">
              Phòng phát thanh nghệ thuật
            </span>
          </div>
          <h1 className="font-heading font-bold text-2xl md:text-4xl text-[#4A3C56] mb-1">
            PHÒNG ÂM NHẠC LỚP HỌC
          </h1>
          <p className="text-xs md:text-sm text-[#827290] font-luxury italic">
            Giai điệu êm dịu đồng hành cùng bạn khi sáng tạo nhân vật. Hỗ trợ nhạc YouTube tự động phát trực tiếp!
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={handleOpenAddTrack}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#8E75B2] to-[#E2799F] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer font-heading"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm nhạc YouTube</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 bg-white/70 px-4 py-2.5 rounded-2xl border border-white shadow-xs">
            <Disc3 className="w-5 h-5 text-[#8E75B2] animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-xs font-bold text-[#4A3C56]">Atelier Melody</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Turntable / Vinyl Showcase */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 shadow-sm flex flex-col items-center text-center justify-between">
          <div className="relative w-52 h-52 my-4">
            {/* Vinyl record spinning */}
            <div
              className={`w-full h-full rounded-full bg-slate-900 border-8 border-slate-800 shadow-2xl flex items-center justify-center relative overflow-hidden transition-all ${
                isPlaying && currentTrack ? 'animate-spin' : ''
              }`}
              style={{ animationDuration: '6s' }}
            >
              <div className="absolute inset-4 rounded-full border border-slate-700/60" />
              <div className="absolute inset-8 rounded-full border border-slate-700/60" />
              <div className="absolute inset-12 rounded-full border border-slate-700/60" />
              
              <img
                src={currentTrack?.coverUrl || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80"}
                alt={currentTrack?.title || "Phát nhạc"}
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
              />
            </div>
          </div>

          <div className="w-full mt-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] bg-white/80 text-[#4A3C56] font-bold px-3 py-1 rounded-full border border-white">
                {currentTrack?.category || 'Lớp học'}
              </span>
              {currentYtId && (
                <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span>YouTube Stream</span>
                </span>
              )}
            </div>

            <h3 className="font-heading font-bold text-lg text-[#4A3C56] mt-2 mb-0.5 truncate">
              {currentTrack?.title || 'Chưa có bản nhạc nào'}
            </h3>
            <p className="text-xs text-[#827290] mb-4 font-luxury italic">
              {currentTrack?.artist || 'Danh sách phát hiện đang trống'}
            </p>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-[#EAE2F8] rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-[#8E75B2] to-[#E2799F] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Player Controls */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={togglePlay}
                disabled={playlist.length === 0}
                className="p-3.5 rounded-full bg-gradient-to-r from-[#8E75B2] to-[#E2799F] text-white shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-40"
                title={isPlaying ? "Tạm dừng" : "Phát"}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              <button
                onClick={handlePlayBell}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-[#FAF4FE] text-[#8E75B2] text-xs font-bold border border-[#D2C8F2] shadow-xs cursor-pointer transition-all font-heading"
                title="Rung chuông vào học"
              >
                <Bell className="w-4 h-4" />
                <span>Rung chuông vào lớp</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Playlist Table & Admin Controls */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            {/* Category Filter Pills */}
            <div className="flex items-center justify-between pb-3 border-b border-black/5 mb-4">
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      soundManager.playBoop();
                      setSelectedCategory(cat);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#8E75B2] text-white shadow-xs'
                        : 'bg-white/60 hover:bg-white text-[#827290]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <span className="text-xs text-[#827290] font-caption">
                {filteredPlaylist.length} bản nhạc
              </span>
            </div>

            {/* Tracks List */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {filteredPlaylist.length === 0 ? (
                <div className="p-8 text-center bg-white/40 rounded-2xl border border-white text-xs text-[#827290] font-luxury italic">
                  Không có bản nhạc nào trong danh mục này. Cô giáo có thể nhấn &quot;Thêm nhạc YouTube&quot; để bổ sung bài hát mới!
                </div>
              ) : (
                <>
                  {filteredPlaylist.map((track) => {
                    const isSelected = currentTrack?.id === track.id;
                    const hasYt = track.youtubeUrl || track.youtubeId;
                  return (
                    <div
                      key={track.id}
                      onClick={() => selectTrack(track)}
                      className={`p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#FAF4FE] to-[#FFF7EF] border border-[#D2C8F2] shadow-xs'
                          : 'bg-white/50 hover:bg-white/80 border border-white/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative">
                          <img
                            src={track.coverUrl}
                            alt={track.title}
                            className="w-10 h-10 rounded-xl object-cover border border-white shadow-xs"
                          />
                          {isSelected && isPlaying && (
                            <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center">
                              <span className="text-white text-xs animate-ping">♫</span>
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="font-heading font-bold text-sm text-[#4A3C56] truncate flex items-center gap-1.5">
                            <span>{track.title}</span>
                            {hasYt && (
                              <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.2 rounded font-bold">
                                YouTube
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#827290] font-luxury italic truncate">
                            {track.artist} • {track.category}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#8E75B2] font-caption">
                          {track.duration}
                        </span>

                        {/* Admin edit & delete track buttons */}
                        {isAdmin && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditTrack(track);
                              }}
                              className="p-1.5 rounded-full hover:bg-white text-[#8E75B2] transition-colors cursor-pointer"
                              title="Cô giáo sửa bài này"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteTrack(track.id, e)}
                              className="p-1.5 rounded-full hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Cô giáo xóa bài này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isSelected) {
                              togglePlay();
                            } else {
                              selectTrack(track);
                            }
                          }}
                          className="p-1.5 rounded-full bg-[#EAE2F8] hover:bg-[#DCD0F4] text-[#4A3C56] cursor-pointer border border-white shadow-xs"
                        >
                          {isSelected && isPlaying ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5 ml-0.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
                </>
              )}
            </div>
          </div>

          {/* Volume Control Bar */}
          <div className="pt-4 border-t border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-3 w-1/2">
              <button onClick={toggleMute} className="text-[#8E75B2]">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full accent-[#8E75B2] h-1.5 bg-[#EAE2F8] rounded-lg cursor-pointer"
              />
            </div>

            <span className="text-[11px] text-[#827290] font-caption">
              Âm lượng: {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Admin Track Modal (Add / Edit) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white/95 rounded-3xl border border-white shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 mb-4">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-[#8E75B2]" />
                <h3 className="font-heading font-bold text-base text-[#4A3C56]">
                  {editingTrack ? 'Chỉnh Sửa Bài Hát' : 'Thêm Bản Nhạc Mới Cho Lớp'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-[#827290]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTrack} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4A3C56] mb-1">Tên bài hát (*):</label>
                <input
                  type="text"
                  value={trackTitle}
                  onChange={(e) => setTrackTitle(e.target.value)}
                  placeholder="Ví dụ: Giai điệu mộng mơ..."
                  className="w-full text-xs px-3.5 py-2 rounded-xl bg-white border border-[#D2C8F2] focus:outline-none focus:ring-2 focus:ring-[#8E75B2]/30 text-[#4A3C56]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3C56] mb-1">Nghệ sĩ / Thể hiện:</label>
                <input
                  type="text"
                  value={trackArtist}
                  onChange={(e) => setTrackArtist(e.target.value)}
                  placeholder="Ví dụ: Lofi Chill..."
                  className="w-full text-xs px-3.5 py-2 rounded-xl bg-white border border-[#D2C8F2] focus:outline-none focus:ring-2 focus:ring-[#8E75B2]/30 text-[#4A3C56]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3C56] mb-1 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-[#E2799F]" />
                  <span>Đường dẫn YouTube (Tự động phát không chuyển tab):</span>
                </label>
                <input
                  type="url"
                  value={trackYoutubeUrl}
                  onChange={(e) => setTrackYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full text-xs px-3.5 py-2 rounded-xl bg-white border border-[#D2C8F2] focus:outline-none focus:ring-2 focus:ring-[#8E75B2]/30 text-[#4A3C56]"
                />
                <span className="text-[10px] text-[#827290] mt-0.5 block">
                  Dán link YouTube (video, shorts, hoặc link thường) — nhạc sẽ tự phát trực tiếp trong web!
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3C56] mb-1">Thể loại:</label>
                <select
                  value={trackCategory}
                  onChange={(e) => setTrackCategory(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl bg-white border border-[#D2C8F2] focus:outline-none focus:ring-2 focus:ring-[#8E75B2]/30 text-[#4A3C56]"
                >
                  {categories.filter((c) => c !== 'Tất cả').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3C56] mb-1">Link ảnh bìa (Cover URL):</label>
                <input
                  type="url"
                  value={trackCoverUrl}
                  onChange={(e) => setTrackCoverUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs px-3.5 py-2 rounded-xl bg-white border border-[#D2C8F2] focus:outline-none focus:ring-2 focus:ring-[#8E75B2]/30 text-[#4A3C56]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#827290] hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-2 rounded-full bg-gradient-to-r from-[#8E75B2] to-[#E2799F] text-white font-bold text-xs shadow-md hover:shadow-lg font-heading"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingTrack ? 'Lưu thay đổi' : 'Thêm bài hát'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
