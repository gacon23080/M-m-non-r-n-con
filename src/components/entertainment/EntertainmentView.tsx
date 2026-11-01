import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Coins, 
  Sprout, 
  Droplets, 
  Dices, 
  Gamepad2, 
  Gift, 
  TrendingUp, 
  Bell,
  Edit3,
  Check,
  Lock,
  Plus,
  LogIn,
  Camera,
  Activity,
  MessageSquare,
  Send,
  Hash,
  Users,
  Smile,
  Image as ImageIcon,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { soundManager } from '../../lib/sound';
import { PlantedFlower, GameResult } from '../../types';
import { db } from '../../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  limit
} from 'firebase/firestore';

const BUA_CUA_ITEMS = [
  { id: 'Bau', name: 'Bầu', icon: '🌸', color: 'from-[#FDE8E8] to-[#FBD5D5]' },
  { id: 'Cua', name: 'Cua', icon: '🦀', color: 'from-[#FEE2E2] to-[#FECACA]' },
  { id: 'Tom', name: 'Tôm', icon: '🦐', color: 'from-[#FFEDD5] to-[#FDBA74]' },
  { id: 'Ca', name: 'Cá', icon: '🐟', color: 'from-[#E0F2FE] to-[#BAE6FD]' },
  { id: 'Ga', name: 'Gà', icon: '🐔', color: 'from-[#FEF3C7] to-[#FDE68A]' },
  { id: 'Nai', name: 'Nai', icon: '🦌', color: 'from-[#F3E8FF] to-[#E9D5FF]' },
];

const TAI_XIU_SUM_MULTIPLIERS: Record<number, number> = {
  4: 50, 17: 50,
  5: 18, 16: 18,
  6: 14, 15: 14,
  7: 12, 14: 12,
  8: 8, 13: 8,
  9: 6, 10: 6, 11: 6, 12: 6
};

const FLOWER_SPECIES: Record<string, { name: string; icon: string; maxWater: number; reward: number }> = {
  rose: { name: 'Hoa Hồng Pastel', icon: '🌹', maxWater: 10, reward: 150 },
  lavender: { name: 'Hoa Oải Hương', icon: '🪻', maxWater: 50, reward: 800 },
  daisy: { name: 'Cúc Họa Mi', icon: '🌼', maxWater: 100, reward: 2000 },
  succulent: { name: 'Sen Đá Thạch Anh Hoàn Mỹ', icon: '🪴', maxWater: 200, reward: 5000 }
};

interface GardenSlotState extends PlantedFlower {
  isUnlocked: boolean;
  unlockCost?: number;
}

interface DiscordChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  imageUrl?: string;
  isBot?: boolean;
  chartSummary?: {
    dice: number[];
    total: number;
    outcome: string;
    parity: string;
    recentTrend: string[];
  };
  createdAt: string;
}

type BetCategory = 'TAI' | 'XIU' | 'CHAN' | 'LE' | 'NUMBER' | 'SUM';

export const EntertainmentView: React.FC = () => {
  const { profile, isAdmin, modifyCoins, updateProfileData, loginWithGoogle, currentUser, sendFriendRequest } = useAuth();
  const [activeTab, setActiveTab] = useState<'garden' | 'taixiu' | 'baucua' | 'checkin'>('garden');
  const [selectedUserCard, setSelectedUserCard] = useState<{ uid: string; displayName: string; photoURL: string } | null>(null);
  const [hasEnteredCasino, setHasEnteredCasino] = useState<boolean>(false);

  // ==================== NICKNAME & AVATAR EDIT STATE ====================
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [nicknameInput, setNicknameInput] = useState<string>(profile?.displayName || '');
  const [avatarInput, setAvatarInput] = useState<string>(profile?.photoURL || '');

  useEffect(() => {
    if (profile?.displayName) setNicknameInput(profile.displayName);
    if (profile?.photoURL) setAvatarInput(profile.photoURL);
  }, [profile?.displayName, profile?.photoURL]);

  const handleSaveProfileHeader = () => {
    if (!nicknameInput.trim()) return;
    updateProfileData({
      displayName: nicknameInput.trim(),
      photoURL: avatarInput.trim() || profile?.photoURL
    });
    setIsEditingProfile(false);
    soundManager.playMagicChime();
  };

  // ==================== TÀI XỈU DISCORD LIVE CHAT STATE (FIRESTORE SYNC) ====================
  const [discordChatMsgs, setDiscordChatMsgs] = useState<DiscordChatMessage[]>([]);
  const [chatInputText, setChatInputText] = useState<string>('');
  const [chatImageInput, setChatImageInput] = useState<string>('');
  const [showImagePicker, setShowImagePicker] = useState<boolean>(false);

  // Subscribe to Live Chat
  useEffect(() => {
    const q = query(collection(db, 'liveChatMessages'), orderBy('createdAt', 'asc'), limit(25));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DiscordChatMessage));
      setDiscordChatMsgs(msgs);
    });
    return () => unsubscribe();
  }, []);

  const handleSendDiscordChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatInputText.trim();
    if (!text && !chatImageInput.trim()) return;

    soundManager.playBoop();

    const newMsg: Omit<DiscordChatMessage, 'id'> = {
      senderId: profile?.uid || 'anon',
      senderName: profile?.displayName || 'Bé Ngoan',
      senderAvatar: profile?.photoURL || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      text: text,
      imageUrl: chatImageInput.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'liveChatMessages'), newMsg);
      
      // Trigger .tx command
      if (text.toLowerCase() === '.tx') {
        await handleTriggerTaiXiuSession();
      }
    } catch (err) {}

    setChatInputText('');
    setChatImageInput('');
    setShowImagePicker(false);
  };

  // ==================== TÀI XỈU SHARED SESSION STATE ====================
  const [session, setSession] = useState<any>(null);
  const [betTimer, setBetTimer] = useState<number>(0);
  const [myActiveBet, setMyActiveBet] = useState<{ 
    category: BetCategory; 
    amount: number; 
    selectedNumber?: number; 
    selectedSum?: number;
    hasCheckedResult?: boolean;
  } | null>(null);
  const [isShakingTaiXiu, setIsShakingTaiXiu] = useState<boolean>(false);
  const [taiXiuDice, setTaiXiuDice] = useState<number[]>([1, 1, 1]);
  const [taiXiuResultNotice, setTaiXiuResultNotice] = useState<any>(null);
  const [lastTxStats, setLastTxStats] = useState<any>(null);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [customBetInput, setCustomBetInput] = useState<string>('10');
  const [betCategory, setBetCategory] = useState<BetCategory>('TAI');
  const [selectedNumber, setSelectedNumber] = useState<number>(1);
  const [selectedSum, setSelectedSum] = useState<number>(10);
  const [taiXiuHistory, setTaiXiuHistory] = useState<GameResult[]>([]);

  // Subscribe to Tài Xỉu Session
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'gameSessions', 'taixiu'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSession(data);
      } else {
        // Set local waiting state if session document doesn't exist yet
        setSession({ status: 'waiting', gameType: 'taixiu' });
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync Local Timer & Game Logic with Shared Session
  useEffect(() => {
    if (!session) return;

    if (session.status === 'betting') {
      setIsShakingTaiXiu(false);
      setTaiXiuResultNotice(null);
      
      const interval = setInterval(() => {
        const now = Date.now();
        const expiry = new Date(session.expiresAt).getTime();
        const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
        setBetTimer(remaining);

        if (remaining === 0 && session.status === 'betting') {
          handleFinalizeTaiXiuSession();
        }
      }, 1000);
      return () => clearInterval(interval);
    }

    if (session.status === 'result') {
      setBetTimer(0);
      setTaiXiuDice(session.lastDice || [1, 1, 1]);
      
      // Calculate win/loss for current user if they had a bet
      if (myActiveBet && !myActiveBet.hasCheckedResult) {
        handleCheckMyTaiXiuResult(session.lastDice, session.lastTotal);
      }
    }

    if (session.status === 'waiting') {
      setBetTimer(0);
      setMyActiveBet(null);
    }
  }, [session, myActiveBet]);

  const handleCheckMyTaiXiuResult = (dice: number[], total: number) => {
    if (!myActiveBet || !profile) return;
    
    const { category, amount, selectedNumber: selNum, selectedSum: selSum } = myActiveBet;
    const isNoHu = (dice[0] === dice[1] && dice[1] === dice[2]);
    let isWon = false;
    let multiplier = 0;

    if (category === 'TAI') {
      isWon = total >= 11;
      multiplier = 1.95;
    } else if (category === 'XIU') {
      isWon = total <= 10;
      multiplier = 1.95;
    } else if (category === 'CHAN') {
      isWon = total % 2 === 0;
      multiplier = 1.95;
    } else if (category === 'LE') {
      isWon = total % 2 !== 0;
      multiplier = 1.95;
    } else if (category === 'NUMBER') {
      const matches = dice.filter(d => d === selNum).length;
      if (matches > 0) {
        isWon = true;
        multiplier = matches === 1 ? 2 : matches === 2 ? 3 : 4;
      }
    } else if (category === 'SUM') {
      if (total === selSum) {
        isWon = true;
        multiplier = TAI_XIU_SUM_MULTIPLIERS[selSum!] || 6;
      }
    }

    if (isWon && isNoHu) multiplier *= 3;
    const reward = isWon ? Math.floor(amount * multiplier) : 0;

    if (isWon) {
      modifyCoins(reward);
      soundManager.playMagicChime();
      confetti({ particleCount: isNoHu ? 150 : 80, spread: 80, origin: { y: 0.6 } });
    }

    const msg = isNoHu
      ? `🔥 NỔ HŨ TRIPLE ${dice[0]}-${dice[1]}-${dice[2]}! Thắng x3 = +${reward} Xu!`
      : isWon
      ? `🎉 Bạn đã đoán đúng! Nhận ngay +${reward} Xu!`
      : `Tiếc quá, kết quả là ${total} (${total >= 11 ? 'Tài' : 'Xỉu'}). Bạn mất ${amount} Xu.`;

    setTaiXiuResultNotice({
      total,
      won: isWon,
      reward,
      isNoHu,
      message: msg,
      dice
    });

    setMyActiveBet(prev => prev ? { ...prev, hasCheckedResult: true } : null);
  };

  const handleTriggerTaiXiuSession = async () => {
    if (session?.status === 'betting') return;
    
    soundManager.playMagicChime();
    const expiresAt = new Date(Date.now() + 30000).toISOString();
    
    // Use setDoc with merge to handle cases where the document doesn't exist yet
    await setDoc(doc(db, 'gameSessions', 'taixiu'), {
      gameType: 'taixiu',
      status: 'betting',
      startedAt: new Date().toISOString(),
      expiresAt,
      updatedAt: new Date().toISOString(),
      createdAt: session?.createdAt || new Date().toISOString()
    }, { merge: true });

    // Notify bot start
    await addDoc(collection(db, 'liveChatMessages'), {
      senderName: '🤖 Bot Mầm Non',
      senderAvatar: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=100&auto=format&fit=crop&q=80',
      text: '⚠️ PHIÊN TÀI XỈU MỚI BẮT ĐẦU! Mọi người có 30 giây để đặt cược nhé! (.tx để kích hoạt nếu hết phiên)',
      isBot: true,
      createdAt: new Date().toISOString()
    });
  };

  const handleFinalizeTaiXiuSession = async () => {
    // Basic locking
    const lastUpdate = session.updatedAt ? new Date(session.updatedAt).getTime() : 0;
    if (Date.now() - lastUpdate < 1500) return; 

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const d3 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2 + d3;

    await updateDoc(doc(db, 'gameSessions', 'taixiu'), {
      status: 'result',
      lastDice: [d1, d2, d3],
      lastTotal: total,
      updatedAt: new Date().toISOString()
    });

    // Bot posts result summary
    const outcome = total >= 11 ? 'Tài' : 'Xỉu';
    const parity = total % 2 === 0 ? 'Chẵn' : 'Lẻ';
    const recentTrendList = [...taiXiuHistory.slice(0, 9).map(h => (h.total || 0) >= 11 ? 'T' : 'X'), total >= 11 ? 'T' : 'X'];

    await addDoc(collection(db, 'liveChatMessages'), {
      senderName: '🤖 Bot Mầm Non',
      senderAvatar: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=100&auto=format&fit=crop&q=80',
      text: `🎲 Kết quả: ${d1}-${d2}-${d3} = ${total} (${outcome} - ${parity})`,
      isBot: true,
      chartSummary: {
        dice: [d1, d2, d3],
        total,
        outcome,
        parity,
        recentTrend: recentTrendList
      },
      createdAt: new Date().toISOString()
    });

    // Save history record
    await addDoc(collection(db, 'gameResults'), {
      gameType: 'taixiu',
      playerName: 'Sòng Bạc Mầm Non',
      result: [`${d1}`, `${d2}`, `${d3}`],
      total,
      createdAt: new Date().toISOString()
    });

    // Auto-return to waiting after 8s (longer for people to see)
    setTimeout(async () => {
      await updateDoc(doc(db, 'gameSessions', 'taixiu'), {
        status: 'waiting',
        updatedAt: new Date().toISOString()
      });
    }, 8000);
  };

  // ==================== BẦU CUA STATE ====================
  const [baucuaBets, setBaucuaBets] = useState<Record<string, number>>({});
  const [isRollingBaucua, setIsRollingBaucua] = useState<boolean>(false);
  const [baucuaDice, setBaucuaDice] = useState<string[]>([]);
  const [baucuaResultNotice, setBaucuaResultNotice] = useState<{
    won: boolean;
    reward: number;
    totalBet: number;
    rolled: string[];
  } | null>(null);

  const [lastBcStats, setLastBcStats] = useState<{
    rolled: string[];
    reward: number;
    won: boolean;
  } | null>(null);

  const [baucuaHistory, setBaucuaHistory] = useState<GameResult[]>([]);


  // ==================== DAILY CHECK-IN & LUCKY BOX ====================
  const [canCheckIn, setCanCheckIn] = useState<boolean>(false);
  const [isOpeningBox, setIsOpeningBox] = useState<boolean>(false);
  const [boxReward, setBoxReward] = useState<number | null>(null);

  // ==================== VƯỜN HOA PROGRESSION STATE ====================
  const [gardenSlots, setGardenSlots] = useState<GardenSlotState[]>([
    {
      id: 'f-0',
      slotIndex: 0,
      flowerType: 'rose',
      flowerName: FLOWER_SPECIES.rose.name,
      stage: 'sprout',
      waterCount: 3,
      maxWater: 10,
      rewardCoins: 150,
      plantedAt: Date.now(),
      readyToHarvest: false,
      isUnlocked: true,
    },
    {
      id: 'f-1',
      slotIndex: 1,
      flowerType: 'lavender',
      flowerName: FLOWER_SPECIES.lavender.name,
      stage: 'seed',
      waterCount: 0,
      maxWater: 50,
      rewardCoins: 800,
      plantedAt: Date.now(),
      readyToHarvest: false,
      isUnlocked: false,
      unlockCost: 100,
    },
    {
      id: 'f-2',
      slotIndex: 2,
      flowerType: 'daisy',
      flowerName: FLOWER_SPECIES.daisy.name,
      stage: 'seed',
      waterCount: 0,
      maxWater: 100,
      rewardCoins: 2000,
      plantedAt: Date.now(),
      readyToHarvest: false,
      isUnlocked: false,
      unlockCost: 250,
    },
    {
      id: 'f-3',
      slotIndex: 3,
      flowerType: 'succulent',
      flowerName: FLOWER_SPECIES.succulent.name,
      stage: 'seed',
      waterCount: 0,
      maxWater: 200,
      rewardCoins: 5000,
      plantedAt: Date.now(),
      readyToHarvest: false,
      isUnlocked: false,
      unlockCost: 500,
    },
  ]);

  // Firestore Subscriptions
  useEffect(() => {
    // 1. Tài Xỉu History query
    const qTX = query(collection(db, 'gameResults'), where('gameType', '==', 'taixiu'), orderBy('createdAt', 'desc'), limit(10));
    const unTX = onSnapshot(
      qTX,
      (snapshot) => {
        setTaiXiuHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GameResult)));
      },
      (err) => console.warn('TaiXiu history snapshot notice:', err)
    );

    // 2. Bầu Cua History query
    const qBC = query(collection(db, 'gameResults'), where('gameType', '==', 'baucua'), orderBy('createdAt', 'desc'), limit(10));
    const unBC = onSnapshot(
      qBC,
      (snapshot) => {
        setBaucuaHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GameResult)));
      },
      (err) => console.warn('Baucua history snapshot notice:', err)
    );


    return () => {
      unTX();
      unBC();
    };
  }, []);

  // Check Daily Check-In status
  useEffect(() => {
    if (profile?.lastCheckInAt) {
      const last = new Date(profile.lastCheckInAt).getTime();
      const now = Date.now();
      setCanCheckIn(now - last >= 24 * 60 * 60 * 1000);
    } else {
      setCanCheckIn(true);
    }
  }, [profile]);

  // Watering cooldown logic
  const now = Date.now();
  const recentWateringTimes = (profile?.lastWateringTimes || []).filter(t => now - t < 2 * 60 * 60 * 1000);
  const remainingWaters = 4 - recentWateringTimes.length;
  const oldestWateringTime = recentWateringTimes.length > 0 ? Math.min(...recentWateringTimes) : 0;
  const cooldownRemainingMs = oldestWateringTime > 0 ? (oldestWateringTime + 2 * 60 * 60 * 1000) - now : 0;
  const cooldownMinutes = Math.max(0, Math.ceil(cooldownRemainingMs / 60000));

  // Garden Plot Unlocking
  const handleUnlockSlot = (slotIndex: number) => {
    const slot = gardenSlots.find(s => s.slotIndex === slotIndex);
    if (!slot || slot.isUnlocked || !slot.unlockCost) return;

    const currentCoins = profile?.coins ?? 200;
    if (currentCoins < slot.unlockCost) {
      alert(`Bạn cần ${slot.unlockCost} Xu Bé Ngoan để mở chậu hoa này!`);
      return;
    }

    modifyCoins(-slot.unlockCost);
    soundManager.playMagicChime();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

    setGardenSlots(prev => prev.map(s => s.slotIndex === slotIndex ? { ...s, isUnlocked: true } : s));
  };

  // Handle Watering
  const handleWaterFlower = (slotIndex: number) => {
    if (remainingWaters <= 0) {
      alert(`Bạn đã dùng hết 4 lượt tưới trong 2 tiếng! Hãy quay lại sau khoảng ${cooldownMinutes} phút nhé.`);
      return;
    }

    soundManager.playPop();
    setGardenSlots((prev) =>
      prev.map((slot) => {
        if (slot.slotIndex !== slotIndex || !slot.isUnlocked || slot.readyToHarvest) return slot;
        const nextCount = slot.waterCount + 1;
        const isReady = nextCount >= slot.maxWater;
        return {
          ...slot,
          waterCount: nextCount,
          stage: isReady ? 'bloom' : nextCount > Math.floor(slot.maxWater / 3) ? 'sprout' : 'seed',
          readyToHarvest: isReady,
          lastWateredAt: now
        };
      })
    );

    updateProfileData({
      lastWateringTimes: [...(profile?.lastWateringTimes || []), now]
    });
  };

  // Handle Harvesting
  const handleHarvestFlower = (slotIndex: number) => {
    const slot = gardenSlots.find((s) => s.slotIndex === slotIndex);
    if (!slot || !slot.readyToHarvest) return;

    soundManager.playMagicChime();
    modifyCoins(slot.rewardCoins);
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });

    const speciesKeys: Array<'rose' | 'lavender' | 'daisy' | 'succulent'> = ['rose', 'lavender', 'daisy', 'succulent'];
    const pickedKey = speciesKeys[slotIndex % speciesKeys.length];
    const spec = FLOWER_SPECIES[pickedKey];

    setGardenSlots((prev) =>
      prev.map((s) => {
        if (s.slotIndex !== slotIndex) return s;
        return {
          ...s,
          id: `f-${Date.now()}-${slotIndex}`,
          flowerType: pickedKey,
          flowerName: spec.name,
          stage: 'seed',
          waterCount: 0,
          maxWater: spec.maxWater,
          rewardCoins: spec.reward,
          plantedAt: Date.now(),
          readyToHarvest: false,
        };
      })
    );
  };

  // ==================== TÀI XỈU BETTING LOGIC (SYNCED) ====================
  const handlePlayTaiXiu = async () => {
    if (session?.status !== 'betting') {
      alert('Chưa tới thời gian đặt cược hoặc phiên chưa bắt đầu! Hãy gõ .tx vào chat để bắt đầu.');
      return;
    }
    if (myActiveBet) {
      alert('Bạn đã đặt cược cho phiên này rồi!');
      return;
    }

    const finalBet = Math.max(1, parseInt(customBetInput) || betAmount);
    const currentCoins = profile?.coins ?? 200;

    if (currentCoins < finalBet) {
      alert('Bạn không đủ Xu Bé Ngoan để đặt cược!');
      return;
    }

    soundManager.playWheelTick();
    modifyCoins(-finalBet);

    setMyActiveBet({
      category: betCategory,
      amount: finalBet,
      selectedNumber: betCategory === 'NUMBER' ? selectedNumber : undefined,
      selectedSum: betCategory === 'SUM' ? selectedSum : undefined,
      hasCheckedResult: false
    });

    soundManager.playMagicChime();
  };

  // ==================== BẦU CUA PLAY LOGIC ====================
  const handlePlaceBetBaucua = (symbolId: string, amount: number) => {
    if (isRollingBaucua) return;
    const currentCoins = profile?.coins ?? 200;
    const currentTotalBet = Object.values(baucuaBets).reduce((a, b) => a + b, 0);

    if (currentCoins < currentTotalBet + amount) {
      alert('Bạn không đủ Xu Bé Ngoan để đặt tiếp!');
      return;
    }
    setBaucuaBets(prev => ({ ...prev, [symbolId]: (prev[symbolId] || 0) + amount }));
  };

  const handleRollBaucua = async () => {
    const totalBet = Object.values(baucuaBets).reduce((a, b) => a + b, 0);
    if (totalBet === 0 || isRollingBaucua) return;

    setIsRollingBaucua(true);
    soundManager.playWheelTick();
    setBaucuaResultNotice(null);

    modifyCoins(-totalBet);

    setTimeout(async () => {
      const rolled = [
        BUA_CUA_ITEMS[Math.floor(Math.random() * 6)].id,
        BUA_CUA_ITEMS[Math.floor(Math.random() * 6)].id,
        BUA_CUA_ITEMS[Math.floor(Math.random() * 6)].id
      ];

      setBaucuaDice(rolled);

      let totalWinnings = 0;
      Object.entries(baucuaBets).forEach(([symbolId, bet]) => {
        const count = rolled.filter(r => r === symbolId).length;
        if (count > 0) {
          totalWinnings += bet + (count * bet);
        }
      });

      const isWon = totalWinnings > 0;
      if (isWon) {
        modifyCoins(totalWinnings);
        soundManager.playMagicChime();
        confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
      }

      setBaucuaResultNotice({
        won: isWon,
        reward: totalWinnings,
        totalBet,
        rolled
      });

      setLastBcStats({
        rolled,
        reward: totalWinnings > 0 ? totalWinnings : -totalBet,
        won: isWon
      });

      setBaucuaBets({});
      setIsRollingBaucua(false);

      // Save to Firestore
      try {
        await addDoc(collection(db, 'gameResults'), {
          gameType: 'baucua',
          playerName: profile?.displayName || 'Bé Mầm Non',
          result: rolled,
          total: totalWinnings,
          won: isWon,
          amount: totalWinnings > 0 ? totalWinnings : -totalBet,
          createdAt: new Date().toISOString()
        });
      } catch (e) {
        console.warn('Could not post Baucua result to Firestore:', e);
      }

      setTimeout(() => {
        setBaucuaResultNotice(null);
      }, 4000);

    }, 3000);
  };

  // Daily Check-In & Lucky Box Logic
  const handleOpenLuckyBox = () => {
    if (!canCheckIn || isOpeningBox) return;
    setIsOpeningBox(true);
    soundManager.playWheelTick();

    setTimeout(() => {
      const baseCoins = 50;
      const luckyBonus = Math.floor(Math.random() * 150) + 20;
      const totalReward = baseCoins + luckyBonus;

      modifyCoins(totalReward);
      updateProfileData({ lastCheckInAt: new Date().toISOString() });

      setBoxReward(totalReward);
      setIsOpeningBox(false);
      setCanCheckIn(false);
      soundManager.playMagicChime();
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
    }, 1800);
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, 'liveChatMessages', msgId));
      soundManager.playBoop();
    } catch (e) {}
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 relative overflow-hidden">
      {/* Background Effect Layer */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-30">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F0F4FF] to-white" />
      </div>

      {/* Casino Entry Portal Overlay */}
      {!hasEnteredCasino && (
        <div className="fixed inset-0 z-[100] bg-white/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-700">
          <div className="glass-panel bg-white/95 rounded-[40px] p-6 md:p-12 max-w-lg w-full border-4 border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] text-center space-y-5 md:space-y-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 md:w-40 md:h-40 bg-pink-100/50 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 md:w-40 md:h-40 bg-purple-100/50 rounded-full blur-3xl" />
            
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto bg-gradient-to-tr from-[#D9C6F5] to-[#FBD5E5] rounded-3xl flex items-center justify-center text-4xl md:text-5xl shadow-lg animate-bounce">
                🎰
              </div>
              <h1 className="mt-4 md:mt-6 font-heading font-bold text-2xl md:text-4xl text-[#4A3C56] tracking-tight">
                SÒNG BẠC MẦM NON
              </h1>
              <p className="mt-2 md:mt-3 text-[#827290] text-sm md:text-base font-medium leading-relaxed">
                Chào mừng bé đến với khu vui chơi giải trí!<br/>
                Hãy chọn <strong>Đồng Ý</strong> để bắt đầu trải nghiệm sòng bạc live cùng mọi người nhé ♡
              </p>
            </div>

            <button
              onClick={() => {
                setHasEnteredCasino(true);
                soundManager.playMagicChime();
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#8E75B2] to-[#E2799F] text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-102 active:scale-95 transition-all cursor-pointer font-heading flex items-center justify-center gap-3"
            >
              <Check className="w-6 h-6" />
              <span>ĐỒNG Ý VÀO SÒNG</span>
            </button>
            

          </div>
        </div>
      )}
      {/* Top Banner & Profile Avatar Picker Header */}
      <div className="glass-panel rounded-3xl p-6 md:p-7 border border-white shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-white/90 via-[#FAF4FE]/90 to-[#FFF7EF]/90">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">✨</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#8E75B2] bg-white/80 px-3 py-1 rounded-full border border-white font-caption shadow-2xs">
              Mầm Non Rắn Con • Khu Giải Trí Pastel
            </span>
          </div>
          <h1 className="font-heading font-bold text-2xl md:text-3xl text-[#4A3C56]">
            KHU VUI CHƠI BÉ NGOAN ♡
          </h1>
          <p className="text-xs text-[#827290] font-luxury italic">
            Trồng hoa (10 - 100 giọt nước), Tài Xỉu Nổ Hũ & Khung Chat Pastel Tự Động Thống Kê!
          </p>
        </div>

        {/* Profile Avatar & Wallet Widget */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white shadow-xs">
            <div className="relative group cursor-pointer" onClick={() => setIsEditingProfile(!isEditingProfile)}>
              <img
                src={profile?.photoURL || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'}
                alt="Avatar"
                className="w-9 h-9 rounded-full border-2 border-pink-200 object-cover shadow-2xs"
              />
              <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">
                <Camera className="w-3.5 h-3.5" />
              </div>
            </div>

            {isEditingProfile ? (
              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  placeholder="Biệt danh..."
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  className="w-36 px-2 py-0.5 text-xs font-bold text-[#4A3C56] border border-[#D2C8F2] rounded-lg bg-white"
                />
                <div className="flex gap-1 items-center">
                  <input
                    type="text"
                    placeholder="Link hoặc tải ảnh..."
                    value={avatarInput}
                    onChange={(e) => setAvatarInput(e.target.value)}
                    className="w-24 px-2 py-0.5 text-[10px] text-[#4A3C56] border border-[#D2C8F2] rounded-lg bg-white"
                  />
                  <label className="px-1.5 py-0.5 bg-[#D9C6F5] hover:bg-[#8E75B2] hover:text-white text-[#4A3C56] text-[10px] font-bold rounded cursor-pointer transition-colors shrink-0">
                    📁
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              setAvatarInput(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                <button
                  onClick={handleSaveProfileHeader}
                  className="mt-0.5 py-0.5 px-2 bg-[#8E75B2] text-white text-[10px] font-bold rounded-md flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Check className="w-3 h-3" /> Lưu Avatar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <div>
                  <span className="text-[9px] uppercase font-bold text-[#827290] block leading-tight font-caption">
                    Học sinh
                  </span>
                  <span className="text-xs font-bold text-[#4A3C56] font-heading">
                    {profile?.displayName || 'Bé Ngoan'}
                  </span>
                </div>
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="p-1 text-[#8E75B2] hover:bg-[#FAF4FE] rounded-lg transition-all cursor-pointer"
                  title="Sửa avatar & biệt danh"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {!currentUser && (
              <button
                onClick={loginWithGoogle}
                className="ml-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold text-[10px] shadow-xs hover:opacity-90 flex items-center gap-1 cursor-pointer"
              >
                <LogIn className="w-3 h-3" />
                <span>Google</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FCD34D] to-[#F59E0B] flex items-center justify-center text-white shadow-xs animate-pulse">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-[#827290] block font-caption">
                Ví Xu Bé Ngoan
              </span>
              <span className="text-lg font-bold text-[#4A3C56] font-heading">
                {profile?.coins ?? 200} Xu
              </span>
            </div>
          </div>
        </div>
      </div>


      {/* Sub-Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 glass-panel rounded-2xl border border-white">
        <button
          onClick={() => setActiveTab('garden')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer font-heading ${
            activeTab === 'garden' ? 'bg-gradient-to-r from-[#D9C6F5] to-[#FBD5E5] text-[#4A3C56] shadow-xs scale-102' : 'text-[#827290] hover:text-[#4A3C56] hover:bg-white/50'
          }`}
        >
          <Sprout className="w-4 h-4 text-[#8E75B2]" />
          <span>Vườn Hoa</span>
        </button>

        <button
          onClick={() => setActiveTab('taixiu')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer font-heading ${
            activeTab === 'taixiu' ? 'bg-gradient-to-r from-[#D9C6F5] to-[#FBD5E5] text-[#4A3C56] shadow-xs scale-102' : 'text-[#827290] hover:text-[#4A3C56] hover:bg-white/50'
          }`}
        >
          <Dices className="w-4 h-4 text-[#E2799F]" />
          <span>Tài Xỉu Nổ Hũ</span>
        </button>

        <button
          onClick={() => setActiveTab('baucua')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer font-heading ${
            activeTab === 'baucua' ? 'bg-gradient-to-r from-[#D9C6F5] to-[#FBD5E5] text-[#4A3C56] shadow-xs scale-102' : 'text-[#827290] hover:text-[#4A3C56] hover:bg-white/50'
          }`}
        >
          <Gamepad2 className="w-4 h-4 text-[#8E75B2]" />
          <span>Bầu Cua</span>
        </button>

        <button
          onClick={() => setActiveTab('checkin')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer font-heading ${
            activeTab === 'checkin' ? 'bg-gradient-to-r from-[#D9C6F5] to-[#FBD5E5] text-[#4A3C56] shadow-xs scale-102' : 'text-[#827290] hover:text-[#4A3C56] hover:bg-white/50'
          }`}
        >
          <Gift className="w-4 h-4 text-[#F59E0B]" />
          <span>Điểm Danh & Lucky Box</span>
        </button>
      </div>

      {/* ==================== TAB 1: VƯỜN HOA ==================== */}
      {activeTab === 'garden' && (
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-black/5">
            <div>
              <h2 className="font-heading font-bold text-lg md:text-xl text-[#4A3C56]">
                Vườn Hoa Nông Trại Pastel
              </h2>
              <p className="text-xs text-[#827290] font-luxury italic">
                Ban đầu có 1 cây, mua thêm chậu mới và tưới giọt nước (10, 25, 50, 100 giọt) để thu hoạch tới 2,000 Xu!
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold bg-white/80 px-4 py-2 rounded-full border border-white shadow-2xs">
              <Droplets className="w-4 h-4 text-blue-500" />
              <span>
                Còn {remainingWaters}/4 lượt tưới {cooldownMinutes > 0 && `(Đợi ${cooldownMinutes} phút)`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {gardenSlots.map((slot) => {
              if (!slot.isUnlocked) {
                return (
                  <div
                    key={slot.id}
                    className="p-6 rounded-3xl bg-white/50 border-2 border-dashed border-[#D2C8F2] flex flex-col items-center text-center justify-center space-y-3"
                  >
                    <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center text-[#8E75B2]">
                      <Lock className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#4A3C56]">Chậu #{slot.slotIndex + 1} đang khóa</h4>
                      <span className="text-[10px] text-[#827290]">Mua để mở rộng vườn hoa</span>
                    </div>
                    <button
                      onClick={() => handleUnlockSlot(slot.slotIndex)}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-[#FCD34D] to-[#F59E0B] text-white font-bold text-xs shadow-xs hover:scale-105 transition-transform flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Mở chậu ({slot.unlockCost} Xu)</span>
                    </button>
                  </div>
                );
              }

              const progress = Math.min(100, Math.round((slot.waterCount / slot.maxWater) * 100));
              const spec = FLOWER_SPECIES[slot.flowerType] || FLOWER_SPECIES.rose;

              return (
                <div
                  key={slot.id}
                  className="p-5 rounded-3xl bg-white/70 hover:bg-white/90 border border-white shadow-xs flex flex-col items-center text-center justify-between transition-all group"
                >
                  <div className="w-full flex items-center justify-between text-[11px] text-[#827290] mb-2 font-caption">
                    <span>Chậu #{slot.slotIndex + 1}</span>
                    <span className="font-bold text-[#E2799F] bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
                      +{slot.rewardCoins} Xu
                    </span>
                  </div>

                  <div className="w-24 h-24 my-3 flex items-center justify-center rounded-full bg-gradient-to-tr from-[#FAF4FE] to-[#FFF7EF] border border-white shadow-xs group-hover:scale-105 transition-transform">
                    {slot.stage === 'seed' && (
                      <div className="flex flex-col items-center">
                        <span className="text-3xl">🌱</span>
                        <span className="text-[10px] text-[#827290] mt-1 font-semibold">Gieo hạt</span>
                      </div>
                    )}
                    {slot.stage === 'sprout' && (
                      <div className="flex flex-col items-center">
                        <span className="text-4xl animate-pulse">🌿</span>
                        <span className="text-[10px] text-[#8E75B2] mt-1 font-semibold">Đang lớn</span>
                      </div>
                    )}
                    {slot.stage === 'bloom' && (
                      <div className="flex flex-col items-center">
                        <span className="text-5xl animate-bounce">
                          {spec.icon}
                        </span>
                        <span className="text-[10px] text-[#E2799F] mt-1 font-bold">Nở rực rỡ!</span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-heading font-bold text-sm text-[#4A3C56] mb-1">
                    {slot.flowerName}
                  </h3>

                  <div className="w-full space-y-1 mb-4">
                    <div className="w-full h-2.5 rounded-full bg-black/5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#8E75B2] to-[#E2799F] rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-[#827290] font-semibold">
                      <span>Cần {slot.maxWater} giọt</span>
                      <span>{slot.waterCount}/{slot.maxWater} giọt</span>
                    </div>
                  </div>

                  {slot.readyToHarvest ? (
                    <button
                      onClick={() => handleHarvestFlower(slot.slotIndex)}
                      className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#FCD34D] to-[#F59E0B] text-white font-bold text-xs shadow-md hover:scale-102 transition-all cursor-pointer font-heading flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Thu Hoạch (+{slot.rewardCoins} Xu)</span>
                    </button>
                  ) : (
                    <button
                      disabled={remainingWaters <= 0}
                      onClick={() => handleWaterFlower(slot.slotIndex)}
                      className="w-full py-2 rounded-full bg-white hover:bg-[#FAF4FE] text-[#8E75B2] border border-[#D2C8F2] font-bold text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer font-heading flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Droplets className="w-3.5 h-3.5 text-blue-400" />
                      <span>Tưới 1 Giọt Nước</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== TAB 2: TÀI XỈU NỔ HŨ + CHAT PASTEL THỐNG KÊ ==================== */}
      {activeTab === 'taixiu' && (
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Tài Xỉu Arena */}
          <div className="w-full lg:col-span-7 glass-panel rounded-3xl p-5 md:p-8 border border-white shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-black/5">
              <div>
                <h2 className="font-heading font-bold text-lg md:text-xl text-[#4A3C56] flex items-center gap-2">
                  <span>Tài Xỉu Thần Tài Rắn Con</span>
                  <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                    🔥 Nổ Hũ x3
                  </span>
                </h2>
                <p className="text-xs text-[#827290] font-luxury italic">
                  Thắng ăn xu, thua mất xu cược! Đổ 3 mặt giống nhau kích hoạt Nổ Hũ x3.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-[#FAF4FE] px-4 py-2 rounded-full border border-[#D2C8F2] shadow-2xs">
                <span className="text-[10px] font-bold text-[#8E75B2] uppercase tracking-wider">Thời gian cược:</span>
                <span className={`font-heading font-bold text-lg ${betTimer <= 5 ? 'text-rose-500 animate-pulse' : 'text-[#4A3C56]'}`}>
                  {betTimer}s
                </span>
              </div>
            </div>

            {/* Dice Bowl Arena */}
            <div className="flex flex-col items-center justify-center py-2 md:py-4 relative">
              <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-tr from-white via-[#FAF4FE] to-[#FFF7EF] border-4 border-white shadow-xl flex items-center justify-center">
                {session?.status === 'result' ? (
                  <div className="flex flex-col items-center gap-2 animate-in zoom-in duration-300">
                    <div className="flex items-center gap-2">
                      {session.lastDice?.map((d: number, idx: number) => (
                        <div
                          key={idx}
                          className="w-12 h-12 rounded-xl bg-white border-2 border-[#D2C8F2] shadow-md flex items-center justify-center font-heading font-bold text-2xl text-[#4A3C56]"
                        >
                          {d}
                        </div>
                      ))}
                    </div>
                    <div className="text-center mt-2">
                      <span className="block text-xs font-bold text-[#827290] uppercase tracking-widest mb-1">Tổng điểm</span>
                      <span className="text-3xl font-heading font-bold text-[#E2799F] bg-white px-4 py-1 rounded-full border border-pink-100 shadow-sm">
                        {session.lastTotal}
                      </span>
                    </div>
                  </div>
                ) : session?.status === 'betting' ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3 animate-pulse">
                      <span className="text-5xl animate-spin" style={{ animationDuration: '2s' }}>🎲</span>
                      <span className="text-5xl animate-spin" style={{ animationDuration: '1.5s' }}>🎲</span>
                      <span className="text-5xl animate-spin" style={{ animationDuration: '2.5s' }}>🎲</span>
                    </div>
                    <div className="bg-white/80 px-4 py-1.5 rounded-full border border-white text-xs font-bold text-[#8E75B2]">
                      Đang nhận cược...
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center px-4">
                    <Dices className="w-12 h-12 text-[#D2C8F2] opacity-50" />
                    <p className="text-xs font-bold text-[#827290]">
                      Phiên chưa bắt đầu.<br/>Gõ <span className="text-[#8E75B2]">.tx</span> vào chat để bắt đầu!
                    </p>
                  </div>
                )}
              </div>
              <div className="text-center mt-4">
                {taiXiuResultNotice && (
                  <div className={`p-4 rounded-2xl border-2 animate-in slide-in-from-top-4 duration-500 ${
                    taiXiuResultNotice.won ? 'bg-green-50 border-green-200 text-green-700' : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}>
                    <div className="text-lg font-bold font-heading mb-1">{taiXiuResultNotice.won ? '🎉 THẮNG LỚN!' : '💬 TIẾC QUÁ!'}</div>
                    <div className="text-xs font-medium">{taiXiuResultNotice.message}</div>
                  </div>
                )}
                {myActiveBet && !taiXiuResultNotice && session?.status === 'betting' && (
                  <div className="p-3 bg-[#FAF4FE] rounded-2xl border border-[#D2C8F2] text-[#8E75B2] text-xs font-bold animate-pulse">
                    Đã cược {myActiveBet.amount} Xu vào {myActiveBet.category}. Đợi kết quả...
                  </div>
                )}
              </div>
            </div>

            {/* Betting Categories Selector */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { key: 'TAI', label: 'Tài (11 - 17)', sub: '1 ăn 1.95' },
                  { key: 'XIU', label: 'Xỉu (4 - 10)', sub: '1 ăn 1.95' },
                  { key: 'CHAN', label: 'Chẵn', sub: '1 ăn 1.95' },
                  { key: 'LE', label: 'Lẻ', sub: '1 ăn 1.95' },
                  { key: 'NUMBER', label: 'Cược Số Dice', sub: '1 ăn 2 - 4' },
                  { key: 'SUM', label: 'Cược Tổng Chính Xác', sub: 'Thưởng x50' },
                ].map((item) => (
                  <button
                    key={item.key}
                    disabled={session?.status !== 'betting' || !!myActiveBet}
                    onClick={() => setBetCategory(item.key as BetCategory)}
                    className={`px-4 py-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      betCategory === item.key
                        ? 'bg-[#4A3C56] text-white border-[#4A3C56] shadow-md scale-102 font-bold'
                        : 'bg-white/70 hover:bg-white text-[#4A3C56] border-white'
                    } disabled:opacity-50`}
                  >
                    <div className="text-xs font-heading font-bold">{item.label}</div>
                    <div className="text-[10px] opacity-75">{item.sub}</div>
                  </button>
                ))}
              </div>

              {betCategory === 'NUMBER' && (
                <div className="p-4 bg-white/70 rounded-2xl border border-white flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-[#4A3C56]">Chọn con số xúc xắc muốn cược (1 - 6):</span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <button
                        key={num}
                        disabled={session?.status !== 'betting' || !!myActiveBet}
                        onClick={() => setSelectedNumber(num)}
                        className={`w-10 h-10 rounded-xl font-bold border transition-all ${
                          selectedNumber === num ? 'bg-[#E2799F] text-white border-pink-400 shadow-sm' : 'bg-white text-[#4A3C56] border-gray-200'
                        } disabled:opacity-50`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {betCategory === 'SUM' && (
                <div className="p-4 bg-white/70 rounded-2xl border border-white flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-[#4A3C56]">Chọn Tổng Điểm (4 - 17):</span>
                  <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                    {Array.from({ length: 14 }, (_, i) => i + 4).map(sum => (
                      <button
                        key={sum}
                        disabled={session?.status !== 'betting' || !!myActiveBet}
                        onClick={() => setSelectedSum(sum)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          selectedSum === sum ? 'bg-[#8E75B2] text-white border-purple-400 shadow-sm' : 'bg-white text-[#4A3C56] border-gray-200'
                        } disabled:opacity-50`}
                      >
                        {sum} (x{TAI_XIU_SUM_MULTIPLIERS[sum]})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 bg-white/70 rounded-2xl border border-white space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-[#4A3C56]">Nhập số xu cược:</label>
                  <input
                    type="number"
                    min="1"
                    max={profile?.coins || 9999}
                    disabled={session?.status !== 'betting' || !!myActiveBet}
                    value={customBetInput}
                    onChange={(e) => setCustomBetInput(e.target.value)}
                    className="w-full sm:w-40 px-3 py-1.5 rounded-xl border border-[#D2C8F2] bg-white text-xs font-bold text-[#4A3C56] text-center focus:outline-none focus:ring-2 focus:ring-[#8E75B2]"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {[10, 20, 50, 100, 200, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      disabled={session?.status !== 'betting' || !!myActiveBet}
                      onClick={() => { setBetAmount(amt); setCustomBetInput(amt.toString()); }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        parseInt(customBetInput) === amt
                          ? 'bg-[#E2799F] text-white border-[#E2799F]'
                          : 'bg-white hover:bg-gray-50 text-[#4A3C56] border-gray-200'
                      } disabled:opacity-50`}
                    >
                      {amt} Xu
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={session?.status !== 'betting' || !!myActiveBet}
                onClick={handlePlayTaiXiu}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#8E75B2] via-[#E2799F] to-[#8E75B2] text-white font-bold text-sm shadow-md hover:shadow-lg hover:scale-101 transition-all cursor-pointer font-heading flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Dices className="w-5 h-5" />
                <span>
                  {myActiveBet ? `Đã đặt cược ${myActiveBet.amount} Xu` : `Xác Nhận Đặt Cược (${customBetInput || betAmount} Xu)`}
                </span>
              </button>
            </div>
          </div>

          {/* Win/Loss Result Notice Popup */}
          {taiXiuResultNotice && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="glass-panel bg-white/95 rounded-3xl p-6 md:p-8 max-w-sm w-full border-2 border-white shadow-2xl text-center space-y-4">
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl shadow-md ${
                  taiXiuResultNotice.won ? 'bg-gradient-to-tr from-green-400 to-emerald-500 text-white' : 'bg-gradient-to-tr from-rose-400 to-pink-500 text-white'
                }`}>
                  {taiXiuResultNotice.won ? '🎉' : '💬'}
                </div>

                <h3 className="font-heading font-bold text-xl text-[#4A3C56]">
                  {taiXiuResultNotice.won ? 'CHÚC MỪNG BẠN THẮNG!' : 'RẤT TIẾC! BẠN ĐÃ THUA'}
                </h3>

                <div className="flex justify-center gap-2 my-2">
                  {taiXiuResultNotice.dice.map((d: number, i: number) => (
                    <div key={i} className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center font-bold text-lg text-[#8E75B2]">
                      {d}
                    </div>
                  ))}
                </div>

                <p className="text-xs text-[#827290] font-medium">
                  {taiXiuResultNotice.message}
                </p>
                <button 
                  onClick={() => setTaiXiuResultNotice(null)}
                  className="mt-2 px-6 py-2 rounded-full bg-[#8E75B2] text-white text-xs font-bold"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}

          {/* Right: Pastel Discord-Style Live Game Chat Channel with Mini Chart Bot Post & Image Attachment */}
          <div className="w-full lg:col-span-5 glass-panel bg-white/95 backdrop-blur-xl rounded-3xl p-4 shadow-lg border border-white text-[#4A3C56] flex flex-col h-[500px] md:h-[680px] justify-between">
            {/* Header */}
            <div className="pb-3 border-b border-[#F1EBF9] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-[#8E75B2]" />
                <div>
                  <h3 className="font-bold text-sm text-[#4A3C56] font-heading">
                    #tai-xiu-live-chat
                  </h3>
                  <span className="text-[10px] text-[#827290] block font-caption">
                    Trò chuyện & Xem Bot tự động thống kê trận đấu
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Trực tiếp</span>
              </div>
            </div>

            {/* Live Messages List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 no-scrollbar pr-1">
              {discordChatMsgs.map((msg) => (
                <div key={msg.id} className="flex items-start gap-2.5 p-2 rounded-2xl bg-[#FAF4FE]/60 border border-white hover:bg-white transition-colors group">
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    onClick={() => setSelectedUserCard({ uid: `dc-${msg.id}`, displayName: msg.senderName, photoURL: msg.senderAvatar })}
                    className="w-8 h-8 rounded-full object-cover border border-[#D2C8F2] shrink-0 mt-0.5 shadow-2xs cursor-pointer hover:scale-110 transition-transform"
                    title="Bấm để kết bạn & chat 1-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          onClick={() => setSelectedUserCard({ uid: `dc-${msg.id}`, displayName: msg.senderName, photoURL: msg.senderAvatar })}
                          className={`text-xs font-bold cursor-pointer hover:underline ${msg.isBot ? 'text-[#E2799F]' : 'text-[#8E75B2]'}`}
                        >
                          {msg.senderName}
                        </span>
                        {msg.isBot && (
                          <span className="text-[9px] bg-pink-100 text-pink-700 font-bold px-1.5 py-0.2 rounded border border-pink-200">
                            BOT
                          </span>
                        )}
                        <span className="text-[9px] text-gray-400">{msg.createdAt}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            soundManager.playBoop();
                            setChatInputText(`@${msg.senderName}: `);
                          }}
                          className="p-1 text-[#8E75B2] hover:bg-white rounded-full text-[10px]"
                          title="Trả lời"
                        >
                          ↩
                        </button>
                        {(isAdmin || profile?.displayName === msg.senderName) && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded-full text-[10px]"
                            title="Xóa tin nhắn"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-[#4A3C56] mt-0.5 leading-relaxed break-words font-medium">
                      {msg.text}
                    </p>

                    {/* Render Image Attachment in Chat */}
                    {msg.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={msg.imageUrl}
                          alt="Attachment"
                          className="max-h-40 rounded-2xl border border-white shadow-xs object-cover hover:scale-102 transition-transform"
                        />
                      </div>
                    )}

                    {/* Bot Mini Chart Card Post */}
                    {msg.chartSummary && (
                      <div className="mt-2 p-3 bg-white rounded-2xl border border-[#D2C8F2] shadow-2xs space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#8E75B2] border-b border-black/5 pb-1">
                          <span className="flex items-center gap-1">
                            <Activity className="w-3.5 h-3.5 text-[#E2799F]" /> Thống Kê Trận Vừa Rồi
                          </span>
                          <span className="text-[#E2799F] font-heading">
                            🎲 {msg.chartSummary.dice.join('-')} = {msg.chartSummary.total} ({msg.chartSummary.outcome})
                          </span>
                        </div>

                        {/* Trend dots summary */}
                        <div className="flex items-center gap-1 text-[10px] text-[#827290]">
                          <span>Xu hướng:</span>
                          {msg.chartSummary.recentTrend.map((t, idx) => (
                            <span
                              key={idx}
                              className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                                t === 'Tài' ? 'bg-pink-100 text-pink-700' : 'bg-purple-100 text-purple-700'
                              }`}
                            >
                              {t === 'Tài' ? 'T' : 'X'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input Bar & Image Upload Attachment */}
            <div className="pt-2 border-t border-[#F1EBF9] space-y-2">
              {showImagePicker && (
                <div className="p-2 bg-purple-50 rounded-2xl border border-purple-100 flex items-center gap-2">
                  <input
                    type="text"
                    value={chatImageInput}
                    onChange={(e) => setChatImageInput(e.target.value)}
                    placeholder="Dán link ảnh đính kèm vào tin nhắn..."
                    className="flex-1 px-3 py-1 rounded-xl bg-white border border-[#D2C8F2] text-xs text-[#4A3C56] focus:outline-none"
                  />
                  <button
                    onClick={() => setShowImagePicker(false)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {showImagePicker && (
                <div className="p-2.5 mb-2 bg-[#FAF4FE] rounded-2xl border border-[#D2C8F2] flex flex-col gap-2 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between text-xs font-bold text-[#4A3C56]">
                    <span>Đính kèm hình ảnh:</span>
                    <button onClick={() => setShowImagePicker(false)} className="text-[#8E75B2] hover:text-[#4A3C56]">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Dán link ảnh URL..."
                      value={chatImageInput}
                      onChange={(e) => setChatImageInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-white rounded-xl border border-[#D2C8F2] focus:outline-none text-[#4A3C56]"
                    />
                    <label className="px-3 py-1.5 bg-[#8E75B2] hover:bg-[#7D64A3] text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shrink-0 flex items-center gap-1">
                      <span>📁 Tải từ máy</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (typeof reader.result === 'string') {
                                setChatImageInput(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  {chatImageInput && (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#D2C8F2] mt-1">
                      <img src={chatImageInput} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setChatImageInput('')}
                        className="absolute top-1 right-1 p-0.5 bg-black/60 text-white rounded-full text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSendDiscordChat} className="flex items-center gap-1.5 bg-[#FAF4FE] rounded-2xl px-3 py-2 border border-[#D2C8F2]">
                <label className="p-1 text-[#8E75B2] hover:bg-white rounded-xl transition-colors cursor-pointer" title="Đính kèm ảnh từ máy">
                  <ImageIcon className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === 'string') {
                            setChatImageInput(reader.result);
                            setShowImagePicker(true);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>

                <input
                  type="text"
                  value={chatInputText}
                  onChange={(e) => setChatInputText(e.target.value)}
                  placeholder="Gửi tin nhắn hoặc đính kèm ảnh..."
                  className="flex-1 bg-transparent text-xs text-[#4A3C56] placeholder-[#9F91A8] focus:outline-none"
                />

                <button
                  type="submit"
                  className="p-1.5 rounded-xl bg-[#8E75B2] hover:bg-[#7D64A3] text-white transition-colors cursor-pointer"
                  title="Gửi tin nhắn"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: BẦU CUA ==================== */}
      {activeTab === 'baucua' && (
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-black/5">
            <div>
              <h2 className="font-heading font-bold text-lg md:text-xl text-[#4A3C56]">
                Bầu Cua Tôm Cá Rắn Con
              </h2>
              <p className="text-xs text-[#827290] font-luxury italic">
                Trúng 1 linh vật x2, 2 linh vật x3, 3 linh vật x4! Thua chỉ mất đúng số tiền đã đặt cược.
              </p>
            </div>
          </div>

          {baucuaDice.length > 0 && !isRollingBaucua && (
            <div className="flex justify-center items-center gap-6 p-4 bg-gradient-to-r from-pink-50 via-purple-50 to-orange-50 rounded-2xl border border-white">
              {baucuaDice.map((d, i) => {
                const item = BUA_CUA_ITEMS.find(it => it.id === d);
                return (
                  <div key={i} className="flex flex-col items-center animate-bounce">
                    <span className="text-5xl">{item?.icon}</span>
                    <span className="text-xs font-bold text-[#4A3C56] mt-1">{item?.name}</span>
                  </div>
                );
              })}
            </div>
          )}

          {baucuaResultNotice && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="glass-panel bg-white/95 rounded-3xl p-6 md:p-8 max-w-sm w-full border-2 border-white shadow-2xl text-center space-y-4">
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl shadow-md ${
                  baucuaResultNotice.won ? 'bg-gradient-to-tr from-green-400 to-emerald-500 text-white' : 'bg-gradient-to-tr from-rose-400 to-pink-500 text-white'
                }`}>
                  {baucuaResultNotice.won ? '🎉' : '💬'}
                </div>

                <h3 className="font-heading font-bold text-xl text-[#4A3C56]">
                  {baucuaResultNotice.won ? 'CHÚC MỪNG BẠN THẮNG!' : 'CHƯA TRÚNG LINH VẬT NÀO'}
                </h3>

                <div className="flex justify-center gap-3 my-2">
                  {baucuaResultNotice.rolled.map((r, i) => {
                    const item = BUA_CUA_ITEMS.find(it => it.id === r);
                    return <span key={i} className="text-3xl">{item?.icon}</span>;
                  })}
                </div>

                <p className="text-xs text-[#827290] font-medium">
                  {baucuaResultNotice.won
                    ? `Bạn nhận lại +${baucuaResultNotice.reward} Xu Bé Ngoan!`
                    : `Tiền cược ${baucuaResultNotice.totalBet} Xu đã mất. Thử lại ván sau nhé!`}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {BUA_CUA_ITEMS.map((item) => {
              const currentBet = baucuaBets[item.id] || 0;
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-between gap-2 transition-all bg-gradient-to-b ${item.color} ${
                    currentBet > 0 ? 'border-[#E2799F] shadow-md scale-102' : 'border-white/80 hover:border-[#D2C8F2]'
                  }`}
                >
                  <span className="text-4xl">{item.icon}</span>
                  <span className="font-heading font-bold text-sm text-[#4A3C56]">{item.name}</span>
                  <span className="text-[11px] font-bold text-[#E2799F] bg-white/90 px-2 py-0.5 rounded-full border border-white">
                    {currentBet} Xu
                  </span>

                  <div className="flex gap-1 w-full mt-1">
                    {[10, 50].map((amt) => (
                      <button
                        key={amt}
                        disabled={isRollingBaucua}
                        onClick={() => handlePlaceBetBaucua(item.id, amt)}
                        className="flex-1 py-1 rounded-lg bg-white/90 hover:bg-white text-[10px] font-bold text-[#4A3C56] border border-white cursor-pointer"
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleRollBaucua}
            disabled={isRollingBaucua || Object.keys(baucuaBets).length === 0}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#8E75B2] via-[#E2799F] to-[#8E75B2] text-white font-bold text-sm shadow-md hover:shadow-lg hover:scale-101 transition-all cursor-pointer font-heading disabled:opacity-50"
          >
            {isRollingBaucua ? 'Đang mở bát Bầu Cua...' : 'Xác Nhận Đặt Cược & Lắc Bầu Cua'}
          </button>
        </div>
      )}

      {/* ==================== TAB 4: ĐIỂM DANH & LUCKY BOX ==================== */}
      {activeTab === 'checkin' && (
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white shadow-xs flex flex-col items-center text-center space-y-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-heading text-[#4A3C56]">
              Nhiệm Vụ Điểm Danh Mỗi Ngày
            </h2>
            <p className="text-xs text-[#827290] font-luxury italic mt-1">
              Điểm danh nhận 50 Xu cố định + 1 Lucky Box may mắn mở nhận thêm tới 170 Xu!
            </p>
          </div>

          <div className="relative my-4">
            <div className={`w-36 h-36 rounded-3xl bg-gradient-to-tr from-[#FCD34D] via-[#F59E0B] to-[#FEF3C7] border-4 border-white shadow-xl flex items-center justify-center cursor-pointer transition-transform hover:scale-105 ${
              isOpeningBox ? 'animate-bounce' : ''
            }`}>
              <Gift className="w-20 h-20 text-white shadow-sm" />
            </div>
          </div>

          {boxReward !== null && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 font-bold text-sm animate-pulse">
              🎉 Bạn đã nhận được tổng cộng +{boxReward} Xu Bé Ngoan vào ví!
            </div>
          )}

          <button
            onClick={handleOpenLuckyBox}
            disabled={!canCheckIn || isOpeningBox}
            className="w-full max-w-sm py-4 rounded-full bg-gradient-to-r from-[#FCD34D] to-[#F59E0B] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer font-heading disabled:opacity-50"
          >
            {isOpeningBox ? 'Đang mở Lucky Box...' : canCheckIn ? 'Điểm Danh & Mở Lucky Box' : 'Đã điểm danh hôm nay (Quay lại sau 24h)'}
          </button>
        </div>
      )}

      {/* Selected User Profile Modal */}
      {selectedUserCard && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
          <div className="bg-white rounded-3xl border border-[#D2C8F2] p-6 max-w-xs w-full shadow-2xl text-center space-y-4 relative">
            <button
              onClick={() => setSelectedUserCard(null)}
              className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>

            <img
              src={selectedUserCard.photoURL}
              alt={selectedUserCard.displayName}
              className="w-20 h-20 mx-auto rounded-full object-cover border-3 border-[#D2C8F2] shadow-md"
            />

            <div>
              <h3 className="font-heading font-bold text-base text-[#62566F]">
                {selectedUserCard.displayName}
              </h3>
              <span className="text-[10px] bg-[#E9E2FA] text-[#62566F] font-bold px-2 py-0.5 rounded-full border border-[#D2C8F2] mt-1 inline-block">
                Thành viên lớp Mầm Non Rắn Con
              </span>
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => {
                  if (!profile?.friends?.includes(selectedUserCard.uid)) {
                    sendFriendRequest(selectedUserCard.uid, selectedUserCard.displayName);
                  }
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  profile?.friends?.includes(selectedUserCard.uid)
                    ? 'bg-pink-100 text-pink-700 border-pink-200'
                    : 'bg-[#FFF0F5] text-[#62566F] border-[#E8DFF3] hover:bg-[#E9E2FA]'
                }`}
              >
                {profile?.friends?.includes(selectedUserCard.uid) ? '♥ Đã là bạn bè' : '+ Kết bạn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
