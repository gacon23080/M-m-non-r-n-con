export type CharacterCategory = 
  | 'Hiện đại'
  | 'Cổ trang'
  | 'Học đường'
  | 'Tổng tài'
  | 'Fantasy'
  | 'Anime'
  | 'Kinh dị'
  | 'Đời thường'
  | 'Thanh xuân'
  | 'Boylove'
  | 'Girllove'
  | 'Original Characters'
  | 'Khác'
  | (string & {});

export interface Character {
  id: string;
  name: string;
  creator: string;
  shortDescription: string;
  fullDescription: string;
  personality: string;
  backgroundStory: string;
  relationships: string;
  category: CharacterCategory;
  tags: string[];
  googleAiStudioUrl: string;
  avatarUrl: string;
  coverUrl: string;
  gallery: string[];
  likesCount: number;
  weeklyLikesCount: number;
  viewsCount: number;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'event' | 'character' | 'update' | 'notice';
  isPinned: boolean;
  authorName: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  noteColor: 'yellow' | 'pink' | 'lavender' | 'cyan' | 'green';
  sticker?: string;
  imageUrl?: string;
  likesCount: number;
  likedBy: string[];
  repliesCount: number;
  isPinned?: boolean;
  createdAt: string;
}

export interface CommunityReply {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface AnonymousMessage {
  id: string;
  authorId?: string;
  nickname: string;
  message: string;
  imageUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  isPinned?: boolean;
  isConfidential?: boolean;
  reply?: string;
  createdAt: string;
}

export type FlowerType = 'rose' | 'lavender' | 'daisy' | 'succulent';

export interface PlantedFlower {
  id: string;
  slotIndex: number;
  flowerType: FlowerType;
  flowerName: string;
  stage: 'seed' | 'sprout' | 'bloom';
  waterCount: number;
  maxWater: number;
  rewardCoins: number;
  plantedAt: number;
  lastWateredAt?: number; // For the 2-hour constraint
  readyToHarvest: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  bio: string;
  role: 'member' | 'admin';
  coins: number;
  friends: string[];
  plantedFlowers?: PlantedFlower[];
  stickers: string[];
  favorites: string[];
  lastCheckInAt?: string; // For daily check-in
  lastWateringTimes?: number[]; // For watering cooldown
  createdAt: string;
  updatedAt?: string;
}

export interface GameResult {
  id: string;
  gameType: 'taixiu' | 'baucua';
  playerName?: string;
  result: string[];
  total: number;
  won?: boolean;
  amount?: number;
  createdAt: string;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  coins: number;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  audioUrl?: string;
  youtubeUrl?: string;
  youtubeId?: string;
  coverUrl: string;
  category: string;
  duration: string;
  isDefault?: boolean;
  order: number;
  synthTheme?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: QuizQuestion[];
}

export interface CollectibleSticker {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: 'common' | 'rare' | 'legendary';
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  imageUrl?: string;
  sticker?: string;
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
  createdAt: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  participants: string[];
  participantNames?: Record<string, string>;
  participantAvatars?: Record<string, string>;
  name?: string;
  avatarUrl?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  createdBy: string;
  createdAt: string;
}

export interface FriendRequest {
  id: string;
  fromUid: string;
  fromName: string;
  fromAvatar: string;
  toUid: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: 'message' | 'like' | 'ranking' | 'announcement' | 'friend_request';
  title: string;
  message: string;
  link?: string;
  relatedId?: string; // e.g., friendRequestId
  isRead: boolean;
  createdAt: string;
}

export interface DrawRecord {
  id: string;
  userId: string;
  characterId: string;
  characterName: string;
  characterAvatar: string;
  drawnAt: string;
}
