import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  ChevronUp, 
  ListMusic,
  Disc3,
  Minimize2,
  Plus,
  Trash2,
  Music
} from 'lucide-react';
import { useMusic, extractYouTubeId } from '../../context/MusicContext';
import { useAuth } from '../../context/AuthContext';
import { soundManager } from '../../lib/sound';

export const FloatingMusicPlayer: React.FC = () => {
  const {
    playlist,
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    isPlayerExpanded,
    togglePlay,
    nextTrack,
    selectTrack,
    setVolume,
    toggleMute,
    togglePlayerExpanded,
    addTrackToPlaylist,
    removeTrack
  } = useMusic();

  const { isAdmin } = useAuth();
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newArtist, setNewArtist] = useState<string>('');
  const [newUrl, setNewUrl] = useState<string>('');

  const currentYtId = currentTrack?.youtubeId || (currentTrack?.youtubeUrl ? extractYouTubeId(currentTrack.youtubeUrl) : null);

  const handleAddTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    soundManager.playMagicChime();
    const newTrackObj = {
      id: `track-${Date.now()}`,
      title: newTitle.trim(),
      artist: newArtist.trim() || 'Cô Giáo Rắn Con',
      youtubeUrl: newUrl.trim() || undefined,
      coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
      category: 'Tự chọn',
      duration: '03:30',
      order: playlist.length + 1
    };

    addTrackToPlaylist(newTrackObj);
    setNewTitle('');
    setNewArtist('');
    setNewUrl('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 select-none flex flex-col items-end">
      {/* Hidden YouTube Audio Streamer */}
      {currentYtId && (
        <div className="hidden">
          <iframe
            key={currentYtId}
            width="1"
            height="1"
            src={`https://www.youtube-nocookie.com/embed/${currentYtId}?autoplay=${isPlaying ? 1 : 0}&enablejsapi=1&playsinline=1&controls=0`}
            title="YouTube In-App Audio"
            allow="autoplay; encrypted-media"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      )}

      {/* Expanded Playlist & Controls Drawer */}
      {isPlayerExpanded && (
        <div className="mb-3 w-84 sm:w-90 glass-panel bg-white/95 backdrop-blur-2xl rounded-3xl border border-white shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-black/5 mb-3">
            <div className="flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-[#8E75B2]" />
              <span className="font-heading font-bold text-sm text-[#4A3C56]">
                Danh sách nhạc phát lớp học
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="p-1 rounded-full bg-pink-50 hover:bg-pink-100 text-[#E2799F] transition-colors cursor-pointer"
                title="Thêm nhạc mới (Cô Giáo)"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={togglePlayerExpanded}
                className="p-1 rounded-full hover:bg-gray-100 text-[#827290] transition-colors cursor-pointer"
                title="Thu nhỏ đĩa nhạc"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Add Custom Track Form for Teacher / Admin */}
          {showAddForm && (
            <form onSubmit={handleAddTrack} className="p-3 mb-3 bg-[#FAF4FE] rounded-2xl border border-[#D2C8F2] space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#8E75B2] block font-caption">
                ✨ Thêm bài nhạc mới vào lớp học:
              </span>
              <input
                type="text"
                placeholder="Tên bài hát..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#D2C8F2] text-xs text-[#4A3C56] focus:outline-none"
                required
              />
              <input
                type="text"
                placeholder="Nghệ sĩ / Ca sĩ..."
                value={newArtist}
                onChange={(e) => setNewArtist(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#D2C8F2] text-xs text-[#4A3C56] focus:outline-none"
              />
              <input
                type="url"
                placeholder="Link YouTube (tùy chọn)..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#D2C8F2] text-xs text-[#4A3C56] focus:outline-none"
              />
              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1 rounded-xl text-[10px] text-gray-500 hover:bg-gray-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 rounded-xl bg-[#8E75B2] text-white font-bold text-[10px] shadow-2xs cursor-pointer"
                >
                  Thêm Bài Nhạc
                </button>
              </div>
            </form>
          )}

          {/* Track List */}
          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
            {playlist.map((track) => {
              const isSelected = track.id === currentTrack.id;
              const hasYt = track.youtubeUrl || track.youtubeId;
              return (
                <div
                  key={track.id}
                  className={`flex items-center justify-between gap-2 p-2 rounded-2xl transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#EAE2F8] to-[#FDE5EF] text-[#4A3C56] font-bold border border-white'
                      : 'hover:bg-white/80 text-[#6D5E7B]'
                  }`}
                >
                  <div
                    onClick={() => selectTrack(track)}
                    className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                  >
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-8 h-8 rounded-xl object-cover shadow-xs shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs truncate flex items-center gap-1">
                        <span>{track.title}</span>
                        {hasYt && (
                          <span className="text-[9px] bg-pink-100 text-pink-700 px-1 rounded font-bold">
                            YT
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#827290] truncate font-luxury italic">
                        {track.artist}
                      </div>
                    </div>
                  </div>

                  {/* Track Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-[#8E75B2] font-caption">
                      {track.duration}
                    </span>
                    {(isAdmin || playlist.length > 1) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTrack(track.id);
                        }}
                        className="p-1 text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Xóa bài nhạc"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Volume Slider */}
          <div className="mt-3 pt-3 border-t border-black/5 flex items-center gap-2">
            <button onClick={toggleMute} className="text-[#8E75B2] hover:text-[#4A3C56] cursor-pointer">
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
        </div>
      )}

      {/* Main Mini Corner Vinyl Disc Widget */}
      {!isPlayerExpanded ? (
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex items-center gap-2"
        >
          {/* Track name preview on hover */}
          {isHovered && (
            <div className="bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white shadow-md text-xs font-bold text-[#4A3C56] animate-in fade-in slide-in-from-right-2 duration-150 flex items-center gap-2">
              <span className="truncate max-w-[120px]">{currentTrack.title}</span>
              <button
                onClick={togglePlayerExpanded}
                className="text-[10px] text-[#8E75B2] hover:underline font-normal cursor-pointer"
              >
                Mở playlist
              </button>
            </div>
          )}

          {/* Compact Spinning Record Disc Badge */}
          <div className="relative flex items-center gap-1.5 glass-panel bg-white/85 backdrop-blur-xl border border-white/90 rounded-full shadow-[0_6px_24px_rgba(144,120,180,0.15)] p-1.5 group">
            {/* Spinning Vinyl Record Icon */}
            <button
              onClick={togglePlay}
              className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-[#E0D3F8] via-[#FCE4EE] to-[#FEF5E7] p-[1.5px] shadow-xs cursor-pointer hover:scale-105 transition-transform"
              title={isPlaying ? "Tạm dừng nhạc" : "Phát nhạc lớp học"}
            >
              <div className="w-full h-full rounded-full bg-[#3F334D] flex items-center justify-center relative overflow-hidden">
                <Disc3 className={`w-6 h-6 text-[#FCD34D] ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3.5s' }} />
                
                {/* Play/Pause Overlay */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </div>
              </div>
            </button>

            {/* Quick Next & Expand Controls */}
            <div className="flex items-center gap-0.5 pr-1">
              <button
                onClick={nextTrack}
                className="p-1 rounded-full hover:bg-[#FFF0F5] text-[#827290] hover:text-[#4A3C56] transition-colors cursor-pointer"
                title="Bài tiếp theo"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={togglePlayerExpanded}
                className="p-1 rounded-full hover:bg-[#FFF0F5] text-[#8E75B2] hover:text-[#4A3C56] transition-colors cursor-pointer"
                title="Mở danh sách phát"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Mini Controls Pill when drawer is open */
        <div className="glass-panel bg-white/90 backdrop-blur-2xl border border-white/90 rounded-full shadow-md px-3 py-1.5 flex items-center gap-2">
          <div 
            onClick={togglePlay}
            className="cursor-pointer w-7 h-7 rounded-full bg-gradient-to-tr from-[#E0D3F8] to-[#FCE4EE] p-[1px] flex items-center justify-center"
          >
            <Disc3 className={`w-4 h-4 text-[#8E75B2] ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3.5s' }} />
          </div>

          <div className="text-[10px] font-bold text-[#4A3C56] truncate max-w-[80px]">
            {currentTrack.title}
          </div>

          <button
            onClick={togglePlay}
            className="p-1 rounded-full bg-[#EAE2F8] text-[#4A3C56] hover:bg-[#D9C6F5] transition-all cursor-pointer font-bold"
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
          </button>
        </div>
      )}
    </div>
  );
};
