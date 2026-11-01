import React, { useState } from 'react';
import { Heart, Eye, Sparkles, Edit3, Trash2 } from 'lucide-react';
import { Character } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { soundManager } from '../../lib/sound';
import { motion } from 'motion/react';

interface CharacterCardProps {
  character: Character;
  onOpenDetail: (character: Character) => void;
  onLike?: (characterId: string) => void;
  onEdit?: (character: Character) => void;
  onDelete?: (characterId: string) => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onOpenDetail,
  onLike,
  onEdit,
  onDelete
}) => {
  const { profile, isAdmin, toggleFavorite } = useAuth();
  const [isLikedLocally, setIsLikedLocally] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(character.likesCount);
  const [showHeartPop, setShowHeartPop] = useState<boolean>(false);

  const isFavorited = profile?.favorites?.includes(character.id) || false;

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playMagicChime();
    setShowHeartPop(true);
    setTimeout(() => setShowHeartPop(false), 800);

    if (!isLikedLocally) {
      setIsLikedLocally(true);
      setLikeCount((prev) => prev + 1);
      toggleFavorite(character.id);
      if (onLike) onLike(character.id);
    } else {
      setIsLikedLocally(false);
      setLikeCount((prev) => Math.max(0, prev - 1));
      toggleFavorite(character.id);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playBoop();
    if (onEdit) onEdit(character);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playBoop();
    if (onDelete && window.confirm(`Cô giáo có chắc chắn muốn xóa bé "${character.name}" khỏi lớp không?`)) {
      onDelete(character.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        soundManager.playBoop();
        onOpenDetail(character);
      }}
      className="group relative bg-white/75 backdrop-blur-xl rounded-3xl border border-white/90 p-3.5 shadow-[0_8px_25px_rgba(150,130,190,0.06)] hover:shadow-[0_16px_36px_rgba(150,130,190,0.12)] transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
    >
      {/* Top Image Container */}
      <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-[#FFF5F8] mb-3">
        <img
          src={character.avatarUrl || character.coverUrl}
          alt={character.name}
          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
          loading="lazy"
        />

        {/* Featured Badge */}
        {character.isFeatured && (
          <div className="absolute top-2.5 left-2.5 bg-white/85 backdrop-blur-md border border-white/90 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
            <Sparkles className="w-3 h-3 text-[#E2799F]" />
            <span className="text-[10px] font-bold text-[#3F334D] font-caption">
              Yêu thích ♡
            </span>
          </div>
        )}

        {/* Category Pill */}
        <div className="absolute top-2.5 right-2.5 bg-white/85 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-[#3F334D] border border-white/90 shadow-xs">
          {character.category}
        </div>

        {/* Teacher Edit & Delete Quick Buttons */}
        {isAdmin && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 z-10">
            {onEdit && (
              <button
                onClick={handleEditClick}
                className="p-1.5 rounded-full bg-white/90 hover:bg-white text-[#8E75B2] hover:text-[#5B4380] shadow-md border border-white transition-all cursor-pointer"
                title="Cô giáo sửa nhân vật này"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDeleteClick}
                className="p-1.5 rounded-full bg-white/90 hover:bg-red-50 text-red-500 hover:text-red-700 shadow-md border border-white transition-all cursor-pointer"
                title="Cô giáo xóa nhân vật này"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Floating Heart Reaction Animation */}
        {showHeartPop && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-ping">
            <span className="text-5xl text-[#E2799F] drop-shadow-md">💖</span>
          </div>
        )}

        {/* Like Button */}
        <button
          onClick={handleLikeClick}
          className={`absolute bottom-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-xs ${
            isLikedLocally || isFavorited
              ? 'bg-[#E2799F] text-white'
              : 'bg-white/80 hover:bg-white text-[#62566F]'
          }`}
          title="Yêu thích nhân vật"
        >
          <Heart className={`w-4 h-4 ${isLikedLocally || isFavorited ? 'fill-white' : ''}`} />
        </button>
      </div>

      {/* Content Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Creator */}
          <div className="text-[11px] font-semibold text-[#8E75B2] mb-0.5 truncate font-luxury italic">
            Tác giả: {character.creator}
          </div>

          {/* Name */}
          <h3 className="font-heading font-bold text-base text-[#3F334D] group-hover:text-[#8E75B2] transition-colors line-clamp-1 mb-1.5">
            {character.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-[#7A6C88] line-clamp-2 leading-relaxed mb-3">
            {character.shortDescription}
          </p>
        </div>

        {/* Tags & Stats Footer */}
        <div>
          {/* Tag Badges */}
          <div className="flex flex-wrap gap-1 mb-3">
            {character.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-semibold bg-white/70 text-[#4A3B53] px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs"
              >
                {tag}
              </span>
            ))}
            {character.tags.length > 3 && (
              <span className="text-[10px] text-[#A092B0] self-center">
                +{character.tags.length - 3}
              </span>
            )}
          </div>

          {/* Stats Bar */}
          <div className="pt-2.5 border-t border-black/5 flex items-center justify-between text-[11px] text-[#7A6C88]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-[#E2799F]" />
                {likeCount}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-[#8E75B2]" />
                {character.viewsCount}
              </span>
            </div>

            <span className="text-[11px] font-bold text-[#8E75B2] group-hover:underline flex items-center gap-1 font-heading">
              Chi tiết &rarr;
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
