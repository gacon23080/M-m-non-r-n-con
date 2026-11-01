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
  X,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { soundManager } from '../../lib/sound';
import { compressImageFile } from '../../lib/imageCompressor';
import { PlantedFlower, GameResult } from '../../types';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
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
  limit,
  getDocs,
  runTransaction
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

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
    isTriple?: boolean;
    recentTrend: string[];
    countTai?: number;
    countXiu?: number;
    pctTai?: number;
    pctXiu?: number;
  };
  createdAt: string;
}

type BetCategory = 'TAI' | 'XIU' | 'CHAN' | 'LE' | 'NUMBER' | 'SUM';

const formatChatTime = (isoString?: string) => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return isoString;
  }
};

const renderDiePipCard = (value: number) => {
  return (
    <div className="relative w-11 h-11 sm:w-12 sm:h-12 bg-white rounded-xl shadow-md border-2 border-[#D2C8F2] flex items-center justify-center p-1.5 transition-transform hover:scale-105">
      {value === 1 && (
        <span className="w-4 h-4 rounded-full bg-rose-500 shadow-xs" />
      )}
      {value === 2 && (
        <div className="w-full h-full flex flex-col justify-between p-0.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4A3C56] self-start" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#4A3C56] self-end" />
        </div>
      )}
      {value === 3 && (
        <div className="w-full h-full flex flex-col justify-between p-0.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4A3C56] self-start" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#4A3C56] self-center" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#4A3C56] self-end" />
        </div>
      )}
      {value === 4 && (
        <div className="w-full h-full grid grid-cols-2 gap-1 p-0.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 place-self-center" />
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 place-self-center" />
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 place-self-center" />
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 place-self-center" />
        </div>
      )}
      {value === 5 && (
        <div className="w-full h-full relative p-0.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4A3C56] absolute top-1 left-1" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#4A3C56] absolute top-1 right-1" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#4A3C56] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#4A3C56] absolute bottom-1 left-1" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#4A3C56] absolute bottom-1 right-1" />
        </div>
      )}
      {value === 6 && (
        <div className="w-full h-full grid grid-cols-2 gap-y-1 gap-x-1.5 p-0.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4A3C56] place-self-center" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#4A3C56] place-self-center" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#4A3C56] place-self-center" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#4A3C56] place-self-center" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#4A3C56] place-self-center" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#4A3C56] place-self-center" />
        </div>
      )}
    </div>
  );
};

export const EntertainmentView: React.FC = () => {
  const { 
    profile, 
    isAdmin, 
    modifyCoins, 
    updateProfileData, 
    loginWithGoogle, 
    currentUser, 
    sendFriendRequest,
    updateFlowers 
  } = useAuth();
  const [activeTab, setActiveTab] = useState<'garden' | 'taixiu' | 'baucua' | 'checkin'>('garden');
  const [selectedUserCard, setSelectedUserCard] = useState<{ uid: string; displayName: string; photoURL: string } | null>(null);
  const [hasEnteredCasino, setHasEnteredCasino] = useState<boolean>(true);

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

  // Real-time profiles map for dynamic avatar & name updates
  const [profilesMap, setProfilesMap] = useState<Record<string, { displayName?: string; photoURL?: string }>>({});

  useEffect(() => {
    const q = query(collection(db, 'profiles'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const map: Record<string, { displayName?: string; photoURL?: string }> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (doc.id) {
          map[doc.id] = { displayName: data.displayName, photoURL: data.photoURL };
        }
      });
      setProfilesMap(map);
    }, (err) => {
      console.warn('profiles subscription in EntertainmentView note:', err);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Live Chat (generous limit to prevent message loss)
  useEffect(() => {
    const q = query(collection(db, 'liveChatMessages'), orderBy('createdAt', 'asc'), limit(150));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DiscordChatMessage));
      setDiscordChatMsgs(msgs);
    }, (err) => {
      console.warn('liveChatMessages subscription note:', err);
    });
    return () => unsubscribe();
  }, []);

  const handleSendDiscordChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatInputText.trim();
    if (!text && !chatImageInput.trim()) return;

    soundManager.playBoop();

    // Check if message is the .tx trigger command (e.g. '.tx', '.tx ', 'tx', '.TX')
    const lower = text.toLowerCase();
    const isTxCmd = lower === '.tx' || lower.startsWith('.tx ') || lower === 'tx';

    // Clear input right away
    setChatInputText('');
    setChatImageInput('');
    setShowImagePicker(false);

    // If it's the .tx command, trigger the session immediately!
    if (isTxCmd) {
      handleTriggerTaiXiuSession();
    }

    const currentSenderId = profile?.uid || currentUser?.uid || 'guest-user';
    const currentSenderName = profile?.displayName || currentUser?.displayName || 'Bé Mầm Non';
    const currentSenderAvatar = profile?.photoURL || currentUser?.photoURL || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80';

    const newMsg: Omit<DiscordChatMessage, 'id'> = {
      senderId: currentSenderId,
      senderName: currentSenderName,
      senderAvatar: currentSenderAvatar,
      text: text,
      imageUrl: chatImageInput.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    // Optimistically add to local state immediately so user sees their chat with ZERO delay
    const optimisticId = `local-${Date.now()}`;
    setDiscordChatMsgs(prev => [...prev, { id: optimisticId, ...newMsg }]);

    try {
      await addDoc(collection(db, 'liveChatMessages'), newMsg);
    } catch (err) {
      console.warn('Could not post live chat message to Firestore:', err);
    }
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
    }, (err) => {
      console.warn('gameSessions subscription note:', err);
      setSession((prev: any) => prev || { status: 'waiting', gameType: 'taixiu' });
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
    const now = Date.now();
    const isActivelyBetting = session?.status === 'betting' && session?.expiresAt && new Date(session.expiresAt).getTime() > now;
    if (isActivelyBetting) return;
    
    soundManager.playMagicChime();
    const expiresAt = new Date(now + 30000).toISOString();
    
    const newSessionData = {
      gameType: 'taixiu',
      status: 'betting',
      startedAt: new Date(now).toISOString(),
      expiresAt,
      updatedAt: new Date(now).toISOString(),
      createdAt: session?.createdAt || new Date(now).toISOString()
    };

    // Immediate local state update so the betting interface opens right now!
    setSession(newSessionData);
    setBetTimer(30);
    setTaiXiuResultNotice(null);
    setMyActiveBet(null);

    // Clear previous bets from Firestore
    try {
      const betsSnap = await getDocs(collection(db, 'gameSessions', 'taixiu', 'bets'));
      for (const d of betsSnap.docs) {
        await deleteDoc(doc(db, 'gameSessions', 'taixiu', 'bets', d.id));
      }
    } catch (err) {
      console.warn('Could not clear previous bets:', err);
    }

    // Sync with Firestore
    try {
      await setDoc(doc(db, 'gameSessions', 'taixiu'), newSessionData, { merge: true });
    } catch (err) {
      console.warn('Could not sync gameSessions/taixiu:', err);
    }

    try {
      await addDoc(collection(db, 'liveChatMessages'), {
        senderId: 'bot-may-man',
        senderName: '🤖 Bot May Mắn',
        senderAvatar: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=100&auto=format&fit=crop&q=80',
        text: '🎲 PHIÊN TÀI XỈU MỚI ĐÃ MỞ! 30 giây đặt cược bắt đầu! (Mọi người đều có thể tham gia cược cùng lúc nhé ♡)',
        isBot: true,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Could not post bot announcement:', err);
    }
  };

  const handleFinalizeTaiXiuSession = async () => {
    if (!session || session.status !== 'betting') return;
    
    try {
      await runTransaction(db, async (transaction) => {
        const sessionDocRef = doc(db, 'gameSessions', 'taixiu');
        const sessionSnap = await transaction.get(sessionDocRef);
        
        if (!sessionSnap.exists()) return;
        const currentData = sessionSnap.data();
        if (currentData.status !== 'betting') return; // Already finalized by someone else

        // Check if truly expired (with 1s buffer)
        const expiresAt = new Date(currentData.expiresAt).getTime();
        if (Date.now() < expiresAt - 1000) return;

        // Roll dice
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const d3 = Math.floor(Math.random() * 6) + 1;
        const total = d1 + d2 + d3;

        // Finalize session status
        transaction.update(sessionDocRef, {
          status: 'result',
          lastDice: [d1, d2, d3],
          lastTotal: total,
          updatedAt: new Date().toISOString()
        });

        // Now fetch bets and post to chat (outside transaction to avoid complex reads, or just do it after)
        // Actually we can post the message after the transaction succeeds.
        // We'll return the result from the transaction.
        return { d1, d2, d3, total };
      }).then(async (result) => {
        if (!result) return;
        const { d1, d2, d3, total } = result;

        // Fetch all bets for this session to announce winners
        let winnerList: string[] = [];
        try {
          const betsSnap = await getDocs(collection(db, 'gameSessions', 'taixiu', 'bets'));
          const allBets = betsSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as any));
          
          allBets.forEach(b => {
            const { category, amount, selectedNumber: selNum, selectedSum: selSum, displayName } = b;
            let isWon = false;
            let mult = 1.95;
            if (category === 'TAI') isWon = total >= 11;
            else if (category === 'XIU') isWon = total <= 10;
            else if (category === 'CHAN') isWon = total % 2 === 0;
            else if (category === 'LE') isWon = total % 2 !== 0;
            else if (category === 'NUMBER') {
              const matches = [d1, d2, d3].filter(d => d === selNum).length;
              isWon = matches > 0;
              mult = matches === 1 ? 2 : matches === 2 ? 3 : 4;
            }
            else if (category === 'SUM') {
              isWon = total === selSum;
              mult = TAI_XIU_SUM_MULTIPLIERS[selSum] || 6;
            }

            if (isWon) {
              const reward = Math.floor(amount * mult);
              winnerList.push(`${displayName || 'Bé Mầm Non'} (+${reward} Xu)`);
            }
          });
        } catch (err) {
          console.warn('Could not fetch bets for finalization:', err);
        }

        const outcome = total >= 11 ? 'Tài' : 'Xỉu';
        const parity = total % 2 === 0 ? 'Chẵn' : 'Lẻ';
        const isTriple = (d1 === d2 && d2 === d3);

        const recentTrend = taiXiuHistory.slice(0, 10).map(h => (h.total && h.total >= 11 ? 'T' : 'X')).reverse();
        recentTrend.push(outcome === 'Tài' ? 'T' : 'X');
        const countTai = recentTrend.filter(t => t === 'T').length;
        const countXiu = recentTrend.filter(t => t === 'X').length;
        const totalCount = countTai + countXiu || 1;
        const pctTai = Math.round((countTai / totalCount) * 100);
        const pctXiu = 100 - pctTai;
        
        const statsText = winnerList.length > 0 
          ? `📊 Thống kê phiên: Có ${winnerList.length} bé thắng cược và các bé chưa trúng thưởng trong phiên này. Hệ thống đã tự động cộng thưởng cho các bé thắng!`
          : '📊 Thống kê phiên: Phiên này chưa có bé nào trúng thưởng (Có thắng có thua). Cố gắng phiên sau nhé ♡';

        await addDoc(collection(db, 'liveChatMessages'), {
          senderId: 'bot-may-man',
          senderName: '🤖 Bot May Mắn',
          senderAvatar: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=100&auto=format&fit=crop&q=80',
          text: `🎲 KẾT QUẢ PHIÊN: [${d1}] [${d2}] [${d3}] = ${total} điểm [${outcome.toUpperCase()} - ${parity.toUpperCase()}]${isTriple ? ' 🔥 BÃO TAM HOA (X3 THƯỞNG)!' : ''}\n\n${statsText}`,
          isBot: true,
          chartSummary: {
            dice: [d1, d2, d3],
            total,
            outcome,
            parity,
            isTriple,
            recentTrend,
            countTai,
            countXiu,
            pctTai,
            pctXiu
          },
          createdAt: new Date().toISOString()
        });

        await addDoc(collection(db, 'gameResults'), {
          gameType: 'taixiu',
          playerName: profile?.displayName || 'Sòng Bạc Mầm Non',
          result: [`${d1}`, `${d2}`, `${d3}`],
          total,
          createdAt: new Date().toISOString()
        });
      });
    } catch (err) {
      console.warn('Transaction failed in Tai Xiu finalization:', err);
    }
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
  const INITIAL_GARDEN: GardenSlotState[] = [
    {
      id: 'f-0',
      slotIndex: 0,
      flowerType: 'rose',
      flowerName: FLOWER_SPECIES.rose.name,
      stage: 'seed',
      waterCount: 0,
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
  ];

  const [gardenSlots, setGardenSlots] = useState<GardenSlotState[]>(INITIAL_GARDEN);

  // Sync garden with profile
  useEffect(() => {
    if (profile?.plantedFlowers && profile.plantedFlowers.length > 0) {
      // Merge saved flowers with initial unlock states if needed
      const merged = INITIAL_GARDEN.map(initial => {
        const saved = profile.plantedFlowers?.find(f => f.slotIndex === initial.slotIndex);
        if (saved) {
          return { ...initial, ...saved, isUnlocked: true };
        }
        return initial;
      });
      setGardenSlots(merged);
    }
  }, [profile?.plantedFlowers]);

  // Firestore Subscriptions
  useEffect(() => {
    if (!currentUser) return;
    // 1. Tài Xỉu History query
    const qTX = query(collection(db, 'gameResults'), where('gameType', '==', 'taixiu'), orderBy('createdAt', 'desc'), limit(10));
    const unTX = onSnapshot(
      qTX,
      (snapshot) => {
        setTaiXiuHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GameResult)));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'gameResults (taixiu)')
    );

    // 2. Bầu Cua History query
    const qBC = query(collection(db, 'gameResults'), where('gameType', '==', 'baucua'), orderBy('createdAt', 'desc'), limit(10));
    const unBC = onSnapshot(
      qBC,
      (snapshot) => {
        setBaucuaHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GameResult)));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'gameResults (baucua)')
    );


    return () => {
      unTX();
      unBC();
    };
  }, [currentUser]);

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

  // Watering cooldown logic: 4 times per 2 hours
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

    const updated = gardenSlots.map(s => s.slotIndex === slotIndex ? { ...s, isUnlocked: true } : s);
    setGardenSlots(updated);
    updateFlowers(updated.filter(s => s.isUnlocked));
  };

  // Handle Watering
  const handleWaterFlower = (slotIndex: number) => {
    if (remainingWaters <= 0) {
      alert(`Bạn đã dùng hết 4 lượt tưới trong 2 tiếng! Hãy quay lại sau khoảng ${cooldownMinutes} phút nhé.`);
      return;
    }

    soundManager.playPop();
    const updated = gardenSlots.map((slot) => {
      if (slot.slotIndex !== slotIndex || !slot.isUnlocked || slot.readyToHarvest) return slot;
      const nextCount = slot.waterCount + 1;
      const isReady = nextCount >= slot.maxWater;
      return {
        ...slot,
        waterCount: nextCount,
        stage: isReady ? 'bloom' : nextCount > Math.floor(slot.maxWater / 3) ? 'sprout' : 'seed',
        readyToHarvest: isReady,
        lastWateredAt: now
      } as GardenSlotState;
    });

    setGardenSlots(updated);
    updateFlowers(updated.filter(s => s.isUnlocked));

    updateProfileData({
      lastWateringTimes: [...recentWateringTimes, now]
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

    const updated = gardenSlots.map((s) => {
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
      } as GardenSlotState;
    });

    setGardenSlots(updated);
    updateFlowers(updated.filter(s => s.isUnlocked));
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

    if (!profile) {
      alert('Vui lòng đăng nhập để tham gia đặt cược nhé ♡');
      return;
    }
    if (currentCoins < finalBet) {
      alert('Bạn không đủ Xu Bé Ngoan để đặt cược!');
      return;
    }
    soundManager.playWheelTick();
    modifyCoins(-finalBet);

    const betData = {
      category: betCategory,
      amount: finalBet,
      selectedNumber: betCategory === 'NUMBER' ? selectedNumber : undefined,
      selectedSum: betCategory === 'SUM' ? selectedSum : undefined,
      uid: profile.uid,
      displayName: profile.displayName,
      createdAt: new Date().toISOString()
    };

    setMyActiveBet({
      ...betData,
      hasCheckedResult: false
    });

    try {
      await setDoc(doc(db, 'gameSessions', 'taixiu', 'bets', profile.uid), betData);
    } catch (err) {
      console.warn('Could not save bet to Firestore:', err);
    }

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

  const handleDeleteMessage = async (msgId: string, senderId?: string, senderName?: string) => {
    const isMine = (profile?.uid && senderId && profile.uid === senderId) ||
                   (currentUser?.uid && senderId && currentUser.uid === senderId) ||
                   (profile?.displayName && senderName && profile.displayName === senderName);
    
    if (!isAdmin && !isMine) {
      alert('Chỉ người gửi mới có thể thu hồi tin nhắn của mình, hoặc Admin mới có quyền xóa!');
      return;
    }

    try {
      setDiscordChatMsgs(prev => prev.filter(m => m.id !== msgId));
      if (!msgId.startsWith('local-')) {
        await deleteDoc(doc(db, 'liveChatMessages', msgId));
      }
      soundManager.playBoop();
    } catch (e) {
      console.warn('Could not delete/recall message:', e);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 relative overflow-hidden">
      {/* Background Effect Layer */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-30">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F0F4FF] to-white" />
      </div>

      {/* Casino Entry Portal removed per user request */}
      {/* Top Banner & Profile Avatar Picker Header */}
      <div className="glass-panel rounded-3xl p-6 md:p-7 border border-white shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-white/90 via-[#FAF4FE]/90 to-[#FFF7EF]/90">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">✨</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#8E75B2] bg-white/80 px-3 py-1 rounded-full border border-white font-caption shadow-2xs">
              Mầm Non Rắn Con • Khu Giải Trí Pastel
            </span>
          </div>
          <h1 className="font-luxury font-[100] text-3xl md:text-5xl text-[#4A3C56] tracking-[0.1em] uppercase">
            KHU VUI CHƠI BÉ NGOAN ♡
          </h1>
          <p className="text-[10px] md:text-xs text-[#827290] font-luxury italic tracking-widest uppercase opacity-70 mt-1">
            Vườn hoa mộng mơ • Tài Xỉu Nổ Hũ • Chat Pastel Nghệ Thuật
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
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const dataUrl = await compressImageFile(file);
                            if (dataUrl) setAvatarInput(dataUrl);
                          } catch (err) {
                            console.warn('Image error:', err);
                          }
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

      {/* Sub-Tabs Content Area with Smooth Transitions */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* ==================== TAB 1: VƯỜN HOA ==================== */}
            {activeTab === 'garden' && (
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-black/5">
            <div>
              <h2 className="font-heading font-bold text-lg md:text-xl text-[#4A3C56]">
                Vườn Hoa Nông Trại Pastel
              </h2>
              <p className="text-xs text-[#827290] font-luxury italic">
                Bạn có 4 lượt tưới mỗi 2 tiếng. Mỗi cây cần từ 10 - 100 giọt nước để thu hoạch tới 2,000 Xu!
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
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-500">
          
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
                          className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-white border-2 border-[#D2C8F2] shadow-md flex items-center justify-center font-heading font-bold text-xl md:text-2xl text-[#4A3C56]"
                        >
                          {d}
                        </div>
                      ))}
                    </div>
                    <div className="text-center mt-1 flex flex-col items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-heading font-bold text-[#E2799F] bg-white px-3 py-0.5 rounded-full border border-pink-100 shadow-xs">
                          {session.lastTotal} điểm
                        </span>
                        <span className={`text-xs font-heading font-black px-3 py-1 rounded-full text-white shadow-xs ${
                          session.lastTotal >= 11 ? 'bg-gradient-to-r from-rose-500 to-pink-500' : 'bg-gradient-to-r from-purple-600 to-indigo-600'
                        }`}>
                          {session.lastTotal >= 11 ? 'TÀI' : 'XỈU'}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#827290] font-bold mt-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                        🛑 Phiên đã dừng lại
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
                    <div className="bg-white/90 px-4 py-1.5 rounded-full border border-white text-xs font-bold text-[#8E75B2] shadow-xs">
                      Đang nhận cược... ({betTimer}s)
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center px-4">
                    <Dices className="w-10 h-10 text-[#8E75B2] animate-bounce" />
                    <p className="text-xs font-bold text-[#4A3C56]">
                      Sẵn sàng chơi Tài Xỉu!
                    </p>
                  </div>
                )}
              </div>

              {/* Direct Start Session Button on Board */}
              {session?.status !== 'betting' && (
                <div className="mt-4 flex flex-col items-center gap-1.5">
                  <button
                    onClick={handleTriggerTaiXiuSession}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#8E75B2] via-[#E2799F] to-[#8E75B2] text-white font-bold text-xs shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-pointer font-heading flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>BẮT ĐẦU CƯỢC PHIÊN MỚI (.tx)</span>
                  </button>
                  <span className="text-[10px] text-[#827290] font-luxury italic">
                    (Hoặc gõ <strong className="text-[#8E75B2]">.tx</strong> vào kênh chat bên cạnh nhé!)
                  </span>
                </div>
              )}

              <div className="text-center mt-3">
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
              {discordChatMsgs.map((msg) => {
                const isMine = (profile?.uid && msg.senderId && profile.uid === msg.senderId) ||
                               (currentUser?.uid && msg.senderId && currentUser.uid === msg.senderId) ||
                               (profile?.displayName && msg.senderName && profile.displayName === msg.senderName);
                const canManage = isAdmin || isMine;
                const senderProf = msg.senderId ? profilesMap[msg.senderId] : null;
                const displayAvatar = (isMine && profile?.photoURL) ? profile.photoURL : (senderProf?.photoURL || msg.senderAvatar);
                const displayName = (isMine && profile?.displayName) ? profile.displayName : (senderProf?.displayName || msg.senderName);

                return (
                  <div key={msg.id} className="flex items-start gap-2.5 p-2 rounded-2xl bg-[#FAF4FE]/60 border border-white hover:bg-white transition-colors group">
                    <img
                      src={displayAvatar}
                      alt={displayName}
                      onClick={() => setSelectedUserCard({ uid: msg.senderId || `dc-${msg.id}`, displayName: displayName, photoURL: displayAvatar })}
                      className="w-8 h-8 rounded-full object-cover border border-[#D2C8F2] shrink-0 mt-0.5 shadow-2xs cursor-pointer hover:scale-110 transition-transform"
                      title="Bấm để kết bạn & chat 1-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            onClick={() => setSelectedUserCard({ uid: msg.senderId || `dc-${msg.id}`, displayName: displayName, photoURL: displayAvatar })}
                            className={`text-xs font-bold cursor-pointer hover:underline ${msg.isBot ? 'text-[#E2799F]' : 'text-[#8E75B2]'}`}
                          >
                            {displayName}
                          </span>
                          {msg.isBot && (
                            <span className="text-[9px] bg-pink-100 text-pink-700 font-bold px-1.5 py-0.2 rounded border border-pink-200">
                              BOT MAY MẮN
                            </span>
                          )}
                          {isMine && !msg.isBot && (
                            <span className="text-[9px] bg-purple-100 text-[#8E75B2] font-bold px-1.5 py-0.2 rounded border border-purple-200">
                              Tôi
                            </span>
                          )}
                          <span className="text-[9px] text-gray-400">
                            {formatChatTime(msg.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
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
                          {canManage && (
                            <button
                              onClick={() => handleDeleteMessage(msg.id, msg.senderId, msg.senderName)}
                              className="px-1.5 py-0.5 text-rose-500 hover:bg-rose-50 rounded-lg text-[10px] flex items-center gap-0.5 cursor-pointer transition-colors"
                              title={isMine && !isAdmin ? "Thu hồi tin nhắn này" : "Xóa tin nhắn (Admin)"}
                            >
                              <span>🗑️</span>
                              <span className="text-[9px] font-semibold">{isMine && !isAdmin ? "Thu hồi" : "Xóa"}</span>
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

                      {/* Bot May Mắn Full 3-Dice & Trend Chart Card */}
                      {msg.chartSummary && (
                        <div className="mt-2.5 p-3.5 bg-gradient-to-br from-white via-[#FAF6FE] to-[#FFF5F8] rounded-2xl border-2 border-[#D2C8F2] shadow-xs space-y-3">
                          {/* Card Header */}
                          <div className="flex items-center justify-between border-b border-black/5 pb-2">
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span className="text-xs font-bold text-[#4A3C56] font-heading">
                                THỐNG KÊ PHIÊN TÀI XỈU
                              </span>
                            </div>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                              ĐÃ DỪNG 🛑
                            </span>
                          </div>

                          {/* 3 Dice Breakdown Chart */}
                          <div>
                            <div className="text-[9px] uppercase font-bold text-[#827290] mb-1.5 tracking-wider font-caption">
                              Biểu đồ 3 xí ngầu:
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {msg.chartSummary.dice.map((dVal, dIdx) => (
                                <div key={dIdx} className="flex flex-col items-center gap-1 p-2 bg-white rounded-xl border border-[#E9DCF8] shadow-2xs">
                                  <span className="text-[9px] font-bold text-[#8E75B2]">
                                    Xúc xắc #{dIdx + 1}
                                  </span>
                                  {renderDiePipCard(dVal)}
                                  <span className="text-xs font-heading font-bold text-[#4A3C56]">
                                    {dVal} điểm
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Result Outcome & Parity Banner */}
                          <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                            msg.chartSummary.outcome === 'Tài'
                              ? 'bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200 text-rose-800'
                              : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 text-purple-800'
                          }`}>
                            <div>
                              <div className="text-[9px] font-bold uppercase tracking-wider opacity-80">
                                Kết quả phiên vừa rồi:
                              </div>
                              <div className="text-base font-heading font-black">
                                {msg.chartSummary.outcome.toUpperCase()} — {msg.chartSummary.total} ĐIỂM
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold font-heading bg-white shadow-2xs border border-current">
                                {msg.chartSummary.parity} {msg.chartSummary.isTriple ? '• 🔥 BÃO X3!' : ''}
                              </span>
                            </div>
                          </div>

                          {/* Trend Cầu Tài Xỉu Chart */}
                          <div className="space-y-1.5 bg-white/90 p-2.5 rounded-xl border border-[#E9DCF8] shadow-2xs">
                            <div className="flex items-center justify-between text-[10px] font-bold text-[#62566F]">
                              <span>Biểu đồ soi cầu (Lịch sử gần đây):</span>
                              <span>
                                Tài: {msg.chartSummary.pctTai ?? 50}% • Xỉu: {msg.chartSummary.pctXiu ?? 50}%
                              </span>
                            </div>

                            {/* Percentage Bar */}
                            <div className="h-2 rounded-full overflow-hidden flex bg-gray-100">
                              <div
                                className="h-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-500"
                                style={{ width: `${msg.chartSummary.pctTai ?? 50}%` }}
                              />
                              <div
                                className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-500"
                                style={{ width: `${msg.chartSummary.pctXiu ?? 50}%` }}
                              />
                            </div>

                            {/* Sequence of Past Rounds */}
                            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
                              {msg.chartSummary.recentTrend.map((t, idx) => {
                                const isLast = idx === msg.chartSummary!.recentTrend.length - 1;
                                const isT = t === 'T' || t === 'Tài';
                                return (
                                  <div
                                    key={idx}
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 transition-transform ${
                                      isT
                                        ? 'bg-rose-500 text-white shadow-xs'
                                        : 'bg-indigo-600 text-white shadow-xs'
                                    } ${isLast ? 'ring-2 ring-amber-400 scale-110 font-black' : 'opacity-80'}`}
                                    title={isT ? 'Tài' : 'Xỉu'}
                                  >
                                    {isT ? 'T' : 'X'}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Prompt & Quick Action Button to Start New Round */}
                          <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-black/5">
                            <span className="text-[10px] text-[#827290] font-luxury italic text-center sm:text-left">
                              🔔 Phiên đã dừng! Gõ <strong className="text-[#8E75B2]">.tx</strong> để mở phiên mới:
                            </span>
                            <button
                              type="button"
                              onClick={handleTriggerTaiXiuSession}
                              className="w-full sm:w-auto px-3 py-1 rounded-xl bg-gradient-to-r from-[#8E75B2] to-[#E2799F] hover:opacity-90 text-white font-bold text-[11px] shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Dices className="w-3 h-3" />
                              <span>Mở Phiên Mới (.tx)</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat Input Bar & Image Upload Attachment */}
            <div className="pt-2 border-t border-[#F1EBF9] space-y-2">
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
                            if (file.size > 500 * 1024) {
                              alert('Ảnh quá lớn! Vui lòng chọn ảnh dưới 500KB để đảm bảo mượt mà nhé ♡');
                              return;
                            }
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
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const dataUrl = await compressImageFile(file);
                          if (dataUrl) {
                            setChatImageInput(dataUrl);
                            setShowImagePicker(true);
                          }
                        } catch (err) {
                          console.warn('Image error:', err);
                        }
                      }
                    }}
                  />
                </label>

                <input
                  type="text"
                  value={chatInputText}
                  onChange={(e) => setChatInputText(e.target.value)}
                  placeholder="Gửi tin nhắn hoặc gõ .tx để bắt đầu cược..."
                  className="flex-1 bg-transparent text-xs text-[#4A3C56] placeholder-[#9F91A8] focus:outline-none"
                />

                <button
                  type="button"
                  onClick={handleTriggerTaiXiuSession}
                  className="px-2 py-1 rounded-lg bg-[#FAF4FE] hover:bg-[#EAE2F8] text-[#8E75B2] border border-[#D2C8F2] text-[10px] font-bold shrink-0 cursor-pointer transition-colors shadow-2xs"
                  title="Kích hoạt phiên Tài Xỉu ngay"
                >
                  .tx 🎲
                </button>

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
    </motion.div>
        </AnimatePresence>
      </div>

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
