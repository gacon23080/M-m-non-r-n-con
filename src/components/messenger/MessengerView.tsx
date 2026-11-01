import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Search, 
  Plus, 
  Users, 
  Smile, 
  Image as ImageIcon, 
  UserPlus,
  UserCheck,
  Heart,
  X,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  doc,
  updateDoc,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Conversation, ChatMessage, UserProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { soundManager } from '../../lib/sound';
import { compressImageFile } from '../../lib/imageCompressor';

const DEMO_MEMBERS: Array<{ uid: string; displayName: string; photoURL: string; bio: string }> = [
  {
    uid: 'teacher-1',
    displayName: 'Cô Giáo Rắn Con (Admin)',
    photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    bio: 'Giáo viên phụ trách lớp Mầm Non Rắn Con ♡'
  },
  {
    uid: 'member-be-ran',
    displayName: 'Bé Rắn Nho Nhỏ',
    photoURL: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=100&auto=format&fit=crop&q=80',
    bio: 'Học sinh chăm ngoan thích vẽ biểu đồ!'
  },
  {
    uid: 'member-be-meo',
    displayName: 'Bé Mèo Thích Kẹo',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    bio: 'Trồng hoa chuyên nghiệp & chơi Tài Xỉu'
  }
];

export const MessengerView: React.FC = () => {
  const { profile, isAdmin, modifyCoins, sendFriendRequest } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState<string>('');
  const [imageAttachment, setImageAttachment] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; senderName: string; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showNewGroupModal, setShowNewGroupModal] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [showMemberModal, setShowMemberModal] = useState<boolean>(false);
  const [selectedUserCard, setSelectedUserCard] = useState<{ uid: string; displayName: string; photoURL: string } | null>(null);
  const [allMembers, setAllMembers] = useState<UserProfile[]>([]);
  const [profilesMap, setProfilesMap] = useState<{ [uid: string]: UserProfile }>({});

  // Fetch and subscribe to all members for real-time name & avatar updates
  useEffect(() => {
    const q = query(collection(db, 'profiles'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const members = snapshot.docs.map(doc => doc.data() as UserProfile);
      setAllMembers(members);
      const map: { [uid: string]: UserProfile } = {};
      members.forEach(m => {
        if (m.uid) map[m.uid] = m;
      });
      setProfilesMap(map);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'profiles');
    });
    return () => unsubscribe();
  }, []);

  const handleDeleteMessage = async (msgId: string) => {
    soundManager.playBoop();
    if (activeConvId && !activeConvId.startsWith('demo-')) {
      try {
        const { deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'conversations', activeConvId, 'messages', msgId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `conversations/${activeConvId}/messages/${msgId}`);
      }
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
    }
  };

  // Subscribe to conversations
  useEffect(() => {
    if (!profile?.uid) return;
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', profile.uid),
      orderBy('lastMessageAt', 'desc')
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const convs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
        setConversations(convs);
        if (convs.length > 0 && !activeConvId) {
          setActiveConvId(convs[0].id);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'conversations');
        // Fallback conversations
        const fallbackGroup: Conversation = {
          id: 'demo-conv-1',
          type: 'group',
          participants: [profile.uid, 'teacher-1'],
          name: 'Lớp Mầm Non Rắn Con ♡',
          avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
          lastMessage: 'Chào mừng bé đến với góc trò chuyện!',
          lastMessageAt: new Date().toISOString(),
          createdBy: 'teacher-1',
          createdAt: new Date().toISOString()
        };
        const fallbackDirect: Conversation = {
          id: 'demo-direct-1',
          type: 'direct',
          participants: [profile.uid, 'teacher-1'],
          name: 'Cô Giáo Rắn Con (Admin)',
          avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
          lastMessage: 'Chào bé! Cô rất vui được trò chuyện riêng với bé ♡',
          lastMessageAt: new Date().toISOString(),
          createdBy: profile.uid,
          createdAt: new Date().toISOString()
        };
        setConversations([fallbackGroup, fallbackDirect]);
        if (!activeConvId) setActiveConvId('demo-conv-1');
      }
    );
    return () => unsubscribe();
  }, [profile?.uid]);

  // Subscribe to messages
  useEffect(() => {
    if (!activeConvId) return;
    if (activeConvId === 'demo-conv-1') {
      setMessages([
        {
          id: 'm-1',
          conversationId: 'demo-conv-1',
          senderId: 'teacher-1',
          senderName: 'Cô Giáo Rắn Con',
          senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
          text: 'Chủ nhật vui vẻ nhé các bé ngoan ♡ Hãy cùng sáng tạo nhân vật thật đẹp nha!',
          createdAt: new Date().toISOString()
        }
      ]);
      return;
    }
    if (activeConvId === 'demo-direct-1') {
      setMessages([
        {
          id: 'm-d1',
          conversationId: 'demo-direct-1',
          senderId: 'teacher-1',
          senderName: 'Cô Giáo Rắn Con (Admin)',
          senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
          text: 'Trò chuyện 1-1 riêng tư giữa cô và bé! Mỗi tin nhắn được thưởng +10 Xu đó nhé ♡',
          createdAt: new Date().toISOString()
        }
      ]);
      return;
    }

    const q = query(
      collection(db, 'conversations', activeConvId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
        setMessages(msgs);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, `conversations/${activeConvId}/messages`);
      }
    );
    return () => unsubscribe();
  }, [activeConvId]);

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const activeOtherUid = activeConv && activeConv.type === 'direct' ? activeConv.participants.find(p => p !== profile?.uid) : null;
  const activeOtherProf = activeOtherUid ? profilesMap[activeOtherUid] : null;
  const activeHeaderAvatar = (activeConv?.type === 'direct' && activeOtherProf?.photoURL) ? activeOtherProf.photoURL : (activeConv?.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80');
  const activeHeaderName = (activeConv?.type === 'direct' && activeOtherProf?.displayName) ? activeOtherProf.displayName : (activeConv?.name || '');

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageInput.trim() && !imageAttachment) || !activeConvId || !profile) return;

    soundManager.playBoop();
    modifyCoins(10); // +10 Xu per chat message

    const msgData: ChatMessage = {
      id: `m-${Date.now()}`,
      conversationId: activeConvId,
      senderId: profile.uid,
      senderName: profile.displayName,
      senderAvatar: profile.photoURL,
      text: messageInput.trim(),
      ...(imageAttachment ? { imageUrl: imageAttachment } : {}),
      ...(replyingTo ? { replyTo: replyingTo } : {}),
      createdAt: new Date().toISOString()
    };

    if (activeConvId.startsWith('demo-')) {
      setMessages((prev) => [...prev, msgData]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? { ...c, lastMessage: messageInput.trim() || 'Đã gửi hình ảnh', lastMessageAt: new Date().toISOString() }
            : c
        )
      );
    } else {
      try {
        const { id, ...payload } = msgData;
        await addDoc(collection(db, 'conversations', activeConvId, 'messages'), payload);
        await updateDoc(doc(db, 'conversations', activeConvId), {
          lastMessage: messageInput.trim() || 'Đã gửi hình ảnh',
          lastMessageAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `conversations/${activeConvId}`);
      }
    }

    setMessageInput('');
    setImageAttachment('');
    setReplyingTo(null);
  };

  const handleStartDirectChat = async (member: { uid: string; displayName: string; photoURL: string }) => {
    if (!profile) return;
    soundManager.playMagicChime();
    setShowMemberModal(false);

    // Find existing direct chat
    const existing = conversations.find(
      (c) => c.type === 'direct' && c.participants.includes(member.uid) && c.participants.includes(profile.uid)
    );

    if (existing) {
      setActiveConvId(existing.id);
      return;
    }

    const newDirect: Omit<Conversation, 'id'> = {
      type: 'direct',
      participants: [profile.uid, member.uid],
      name: member.displayName,
      avatarUrl: member.photoURL,
      lastMessage: 'Bắt đầu cuộc trò chuyện riêng...',
      lastMessageAt: new Date().toISOString(),
      createdBy: profile.uid,
      createdAt: new Date().toISOString()
    };

    try {
      const docRef = await addDoc(collection(db, 'conversations'), newDirect);
      setActiveConvId(docRef.id);
    } catch (e) {
      const localDirect: Conversation = {
        id: `direct-${Date.now()}`,
        ...newDirect
      };
      setConversations((prev) => [localDirect, ...prev]);
      setActiveConvId(localDirect.id);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !profile) return;

    soundManager.playMagicChime();
    const newGroup: Omit<Conversation, 'id'> = {
      type: 'group',
      participants: [profile.uid, 'teacher-1'],
      name: newGroupName.trim(),
      avatarUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=100&auto=format&fit=crop&q=80',
      lastMessage: 'Nhóm chat mới vừa được thành lập!',
      lastMessageAt: new Date().toISOString(),
      createdBy: profile.uid,
      createdAt: new Date().toISOString()
    };

    try {
      const docRef = await addDoc(collection(db, 'conversations'), newGroup);
      setActiveConvId(docRef.id);
    } catch (err) {
      const localGroup: Conversation = {
        id: `group-${Date.now()}`,
        ...newGroup
      };
      setConversations((prev) => [localGroup, ...prev]);
      setActiveConvId(localGroup.id);
    }
    setShowNewGroupModal(false);
    setNewGroupName('');
  };

  const filteredConversations = conversations.filter((c) =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#E8DFF3] shadow-lg overflow-hidden h-auto min-h-[600px] md:h-[680px] flex flex-col md:flex-row">
      
      {/* Left Sidebar: Conversations & Friends */}
      <div className={`w-full md:w-80 border-r border-[#E8DFF3] flex flex-col bg-[#FFF0F5]/30 ${activeConvId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-[#E8DFF3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#A594D6]" />
            <h2 className="font-heading font-bold text-base text-[#62566F]">
              Góc Trò Chuyện
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowMemberModal(true)}
              className="p-1.5 rounded-full bg-white hover:bg-[#FFF0F5] text-[#62566F] border border-[#E8DFF3] transition-colors cursor-pointer"
              title="Kết bạn & Nhắn 1-1"
            >
              <UserPlus className="w-4 h-4 text-[#E2799F]" />
            </button>
            <button
              onClick={() => setShowNewGroupModal(true)}
              className="p-1.5 rounded-full bg-white hover:bg-[#FFF0F5] text-[#62566F] border border-[#E8DFF3] transition-colors cursor-pointer"
              title="Tạo nhóm trò chuyện mới"
            >
              <Plus className="w-4 h-4 text-[#A594D6]" />
            </button>
          </div>
        </div>

        <div className="p-3">
          <div className="relative flex items-center bg-white rounded-2xl border border-[#E8DFF3] px-3 py-1.5">
            <Search className="w-3.5 h-3.5 text-[#93879E] mr-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm bạn bè hoặc nhóm..."
              className="w-full text-xs text-[#62566F] placeholder-[#93879E] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.map((conv) => {
            const isSelected = conv.id === activeConvId;
            const otherUid = conv.type === 'direct' ? conv.participants.find(p => p !== profile?.uid) : null;
            const otherProf = otherUid ? profilesMap[otherUid] : null;
            const convAvatar = (conv.type === 'direct' && otherProf?.photoURL) ? otherProf.photoURL : (conv.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80');
            const convName = (conv.type === 'direct' && otherProf?.displayName) ? otherProf.displayName : conv.name;

            return (
              <div
                key={conv.id}
                onClick={() => {
                  soundManager.playBoop();
                  setActiveConvId(conv.id);
                }}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#E9E2FA] to-[#FFF0F5] border border-[#D2C8F2] shadow-xs'
                    : 'hover:bg-white/80'
                }`}
              >
                <div className="relative">
                  <img
                    src={convAvatar}
                    alt={convName}
                    className="w-10 h-10 rounded-full object-cover border border-[#D2C8F2]"
                  />
                  {conv.type === 'group' ? (
                    <div className="absolute -bottom-1 -right-1 bg-[#A594D6] text-white p-0.5 rounded-full">
                      <Users className="w-2.5 h-2.5" />
                    </div>
                  ) : (
                    <div className="absolute -bottom-1 -right-1 bg-[#E2799F] text-white p-0.5 rounded-full">
                      <Heart className="w-2.5 h-2.5 fill-current" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-xs text-[#62566F] truncate">
                      {convName}
                    </span>
                    {conv.type === 'direct' && (
                      <span className="text-[9px] bg-pink-100 text-pink-700 font-bold px-1.5 py-0.2 rounded-full">
                        Chat 1-1
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#93879E] truncate mt-0.5">
                    {conv.lastMessage}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Active Chat Area */}
      <div className={`flex-1 flex flex-col justify-between bg-white/70 ${!activeConvId ? 'hidden md:flex' : 'flex'}`}>
        {activeConv ? (
          <>
            {/* Active Conversation Header */}
            <div className="px-5 py-3 border-b border-[#E8DFF3] bg-white/80 backdrop-blur-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveConvId(null)}
                  className="p-1 md:hidden text-[#8E75B2] hover:bg-purple-50 rounded-lg mr-1"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <img
                  src={activeHeaderAvatar}
                  alt={activeHeaderName}
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border border-[#D2C8F2]"
                />
                <div>
                  <h3 className="font-heading font-bold text-xs md:text-sm text-[#62566F] flex items-center gap-1.5">
                    <span className="truncate max-w-[120px] md:max-w-none">{activeHeaderName}</span>
                    {activeConv.type === 'direct' && (
                      <span className="text-[8px] md:text-[10px] bg-purple-100 text-purple-700 px-1.5 md:px-2 py-0.5 rounded-full font-bold">
                        1-1
                      </span>
                    )}
                  </h3>
                  <p className="text-[9px] md:text-[10px] text-[#93879E]">
                    +10 Xu / tin nhắn!
                  </p>
                </div>
              </div>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {messages.map((msg) => {
                const isMe = msg.senderId === profile?.uid;
                const senderProf = profilesMap[msg.senderId];
                const msgAvatar = isMe ? (profile?.photoURL || msg.senderAvatar) : (senderProf?.photoURL || msg.senderAvatar);
                const msgName = isMe ? (profile?.displayName || msg.senderName) : (senderProf?.displayName || msg.senderName);

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'} group relative`}
                  >
                    {!isMe && (
                      <img
                        src={msgAvatar}
                        alt={msgName}
                        onClick={() => setSelectedUserCard({ uid: msg.senderId, displayName: msgName, photoURL: msgAvatar })}
                        className="w-7 h-7 rounded-full object-cover border border-[#D2C8F2] mb-1 cursor-pointer hover:scale-110 transition-transform"
                        title="Bấm để xem hồ sơ & kết bạn"
                      />
                    )}

                    <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      {!isMe && (
                        <span
                          onClick={() => setSelectedUserCard({ uid: msg.senderId, displayName: msgName, photoURL: msgAvatar })}
                          className="text-[10px] text-[#93879E] mb-0.5 ml-1 font-bold cursor-pointer hover:text-[#8E75B2] transition-colors"
                        >
                          {msgName}
                        </span>
                      )}
                      
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed relative ${
                          isMe
                            ? 'bg-gradient-to-r from-[#D2C8F2] to-[#FCD3E2] text-[#62566F] rounded-br-xs shadow-xs font-semibold'
                            : 'bg-[#FFF0F5] text-[#62566F] rounded-bl-xs border border-[#F1EBF9]'
                        }`}
                      >
                        {/* Quoted Reply if present */}
                        {msg.replyTo && (
                          <div className="p-2 mb-2 rounded-xl bg-white/70 border-l-3 border-[#A594D6] text-[10px] text-[#62566F]">
                            <span className="font-bold text-[#8E75B2]">@{msg.replyTo.senderName}:</span> "{msg.replyTo.text}"
                          </div>
                        )}

                        {msg.imageUrl && (
                          <img
                            src={msg.imageUrl}
                            alt="Attached image"
                            className="max-w-xs max-h-48 rounded-xl object-cover mb-2 border border-white shadow-xs"
                          />
                        )}

                        {msg.sticker ? (
                          <span className="text-3xl select-none">{msg.sticker}</span>
                        ) : (
                          msg.text
                        )}

                        {/* Hover Action Bar: Reply & Delete */}
                        <div className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-xs p-1 rounded-full shadow-xs border border-[#E8DFF3] ${
                          isMe ? '-left-16' : '-right-16'
                        }`}>
                          <button
                            onClick={() => {
                              soundManager.playBoop();
                              setReplyingTo({ id: msg.id, senderName: msg.senderName, text: msg.text || 'Hình ảnh' });
                            }}
                            className="p-1 text-[#8E75B2] hover:bg-[#FFF0F5] rounded-full text-[10px]"
                            title="Phản hồi tin nhắn này"
                          >
                            ↩
                          </button>
                          {(isMe || isAdmin) && (
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
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Replying Preview Bar */}
            {replyingTo && (
              <div className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border-t border-[#E8DFF3] flex items-center justify-between text-xs text-[#62566F]">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-[#8E75B2] font-bold">↩ Phản hồi @{replyingTo.senderName}:</span>
                  <span className="italic truncate text-[11px]">"{replyingTo.text}"</span>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Attachment Preview */}
            {imageAttachment && (
              <div className="px-4 py-2 bg-purple-50 border-t border-[#E8DFF3] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={imageAttachment} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-purple-200" />
                  <span className="text-xs text-[#62566F] font-bold">Đã đính kèm ảnh từ máy</span>
                </div>
                <button
                  type="button"
                  onClick={() => setImageAttachment('')}
                  className="p-1 rounded-full text-rose-500 hover:bg-rose-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Message Input Box */}
            <div className="p-3.5 border-t border-[#E8DFF3] bg-white/90 relative">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <label className="p-2 rounded-full bg-[#FFF0F5] hover:bg-[#E9E2FA] text-[#8E75B2] transition-colors cursor-pointer" title="Đính kèm hình ảnh từ máy">
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
                          if (dataUrl) setImageAttachment(dataUrl);
                        } catch (err) {
                          console.warn('Image error:', err);
                        }
                      }
                    }}
                  />
                </label>

                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={replyingTo ? `Viết câu trả lời cho @${replyingTo.senderName}...` : "Nhập tin nhắn..."}
                  className="flex-1 px-4 py-2.5 rounded-full bg-[#FFF0F5]/50 border border-[#E8DFF3] text-xs text-[#62566F] placeholder-[#93879E] focus:outline-none focus:ring-2 focus:ring-[#D2C8F2]"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-full bg-gradient-to-r from-[#D2C8F2] to-[#FCD3E2] text-[#62566F] hover:shadow-md transition-all cursor-pointer font-bold"
                  title="Gửi tin nhắn (+10 Xu)"
                >
                  <Send className="w-4 h-4 text-[#62566F]" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#93879E] text-sm">
            Chọn một cuộc trò chuyện để bắt đầu nhắn tin ♡
          </div>
        )}
      </div>

      {/* Member Directory & Direct Messaging Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#D2C8F2] p-6 max-w-md w-full shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFF3] mb-3">
              <h3 className="font-heading font-bold text-base text-[#62566F] flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-[#E2799F]" />
                <span>Danh Sách Bạn Bè & Thành Viên Lớp</span>
              </h3>
              <button onClick={() => setShowMemberModal(false)} className="p-1 rounded-full text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {allMembers.filter(m => m.uid !== profile?.uid).map((mem) => {
                const isFriend = profile?.friends?.includes(mem.uid);
                return (
                  <div key={mem.uid} className="p-3 rounded-2xl bg-[#FFF0F5]/60 border border-[#FCD3E2] flex items-center justify-between gap-3">
                    <img src={mem.photoURL} alt={mem.displayName} className="w-10 h-10 rounded-full object-cover border border-[#D2C8F2]" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-[#62566F] truncate">{mem.displayName}</h4>
                      <p className="text-[10px] text-[#93879E] truncate">{mem.bio}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          if (!isFriend) {
                            sendFriendRequest(mem.uid, mem.displayName);
                          }
                        }}
                        disabled={isFriend}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                          isFriend ? 'bg-pink-100 text-pink-700 border-pink-200 cursor-default' : 'bg-white text-[#62566F] border-[#E8DFF3] hover:bg-[#FFF0F5]'
                        }`}
                      >
                        {isFriend ? '♥ Bạn bè' : '+ Kết bạn'}
                      </button>

                      <button
                        onClick={() => handleStartDirectChat({ uid: mem.uid, displayName: mem.displayName, photoURL: mem.photoURL })}
                        className="px-3 py-1 rounded-full bg-[#A594D6] hover:bg-[#8F7BBF] text-white text-[10px] font-bold transition-all cursor-pointer"
                      >
                        Chat 1-1
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* New Group Modal */}
      {showNewGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#D2C8F2] p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-heading font-bold text-base text-[#62566F] mb-3">
              Tạo nhóm trò chuyện mới
            </h3>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Tên nhóm..."
                className="w-full px-3 py-2 rounded-xl bg-[#FFF0F5]/50 border border-[#E8DFF3] text-xs text-[#62566F] focus:outline-none focus:ring-2 focus:ring-[#D2C8F2]"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewGroupModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#93879E] hover:bg-gray-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#A594D6] text-white text-xs font-bold hover:bg-[#8F7BBF] cursor-pointer"
                >
                  Tạo nhóm
                </button>
              </div>
            </form>
          </div>
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

              <button
                onClick={() => {
                  handleStartDirectChat(selectedUserCard);
                  setSelectedUserCard(null);
                }}
                className="px-4 py-2 rounded-full bg-[#A594D6] hover:bg-[#8F7BBF] text-white text-xs font-bold transition-all cursor-pointer"
              >
                Chat 1-1
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
