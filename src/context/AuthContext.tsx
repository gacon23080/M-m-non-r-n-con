import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, addDoc, updateDoc, arrayUnion, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db, signInWithPopup, googleProvider, fbSignOut } from '../lib/firebase';
import { UserProfile, PlantedFlower, FriendRequest, AppNotification } from '../types';
import { soundManager } from '../lib/sound';

interface AuthContextType {
  currentUser: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithAdminPasscode: (adminId: string, pass: string) => boolean;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  toggleFavorite: (characterId: string) => void;
  modifyCoins: (delta: number) => boolean;
  sendFriendRequest: (toUid: string, toName: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
  updateFlowers: (flowers: PlantedFlower[]) => void;
  addSticker: (stickerId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const ADMIN_EMAIL = 'gacon23080@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userIsAdmin = user.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();

        try {
          const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
          if (profileDoc.exists()) {
            const data = profileDoc.data() as UserProfile;
            const merged: UserProfile = {
              ...data,
              coins: data.coins ?? 200,
              friends: data.friends ?? [],
              role: userIsAdmin ? 'admin' : (data.role || 'member')
            };
            setProfile(merged);
            setIsAdmin(userIsAdmin || data.role === 'admin');
          } else {
            const newProfile: UserProfile = {
              uid: user.uid,
              displayName: userIsAdmin ? 'Cô Giáo Rắn Con (Admin)' : (user.displayName || 'Bé Mầm Non Mới'),
              photoURL: user.photoURL || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
              bio: userIsAdmin ? 'Giáo viên phụ trách lớp Mầm Non Rắn Con ♡' : 'Học sinh chăm ngoan yêu thích sáng tạo nhân vật!',
              role: userIsAdmin ? 'admin' : 'member',
              coins: 200,
              friends: [],
              plantedFlowers: [],
              stickers: ['stk-snake'],
              favorites: [],
              createdAt: new Date().toISOString()
            };
            await setDoc(doc(db, 'profiles', user.uid), newProfile);
            setProfile(newProfile);
            setIsAdmin(userIsAdmin);
          }
        } catch (err) {
          console.warn('Error reading user profile:', err);
        }
      } else {
        const cachedAdmin = localStorage.getItem('mnrc_admin_session');
        if (cachedAdmin) {
          try {
            const parsed = JSON.parse(cachedAdmin);
            setProfile(parsed);
            setIsAdmin(true);
          } catch (e) {
            setProfile(null);
            setIsAdmin(false);
          }
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    soundManager.playBoop();
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.warn('Google sign-in error:', err.message);
    }
  };


  const loginWithAdminPasscode = (adminId: string, pass: string): boolean => {
    soundManager.playMagicChime();
    if (adminId.trim() === '23082010' && pass.trim() === 'Gàcon23082010') {
      const adminProfile: UserProfile = {
        uid: 'admin-teacher-master',
        displayName: 'Cô Giáo Rắn Con (Admin)',
        photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
        bio: 'Giáo viên phụ trách lớp Mầm Non Rắn Con ♡',
        role: 'admin',
        coins: 99999,
        friends: [],
        plantedFlowers: [],
        stickers: ['stk-snake', 'stk-star', 'stk-candy'],
        favorites: [],
        createdAt: new Date().toISOString()
      };
      setProfile(adminProfile);
      setIsAdmin(true);
      localStorage.setItem('mnrc_admin_session', JSON.stringify(adminProfile));
      return true;
    }
    return false;
  };

  const logout = async () => {
    soundManager.playBoop();
    localStorage.removeItem('mnrc_demo_profile');
    localStorage.removeItem('mnrc_admin_session');
    try {
      await fbSignOut(auth);
    } catch (e) {}
    setProfile(null);
    setIsAdmin(false);
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...data, updatedAt: new Date().toISOString() };
    setProfile(updated);
    if (currentUser) {
      try {
        await setDoc(doc(db, 'profiles', currentUser.uid), updated, { merge: true });
      } catch (e) {}
    } else if (isAdmin) {
      localStorage.setItem('mnrc_admin_session', JSON.stringify(updated));
    } else {
      localStorage.setItem('mnrc_demo_profile', JSON.stringify(updated));
    }
  };

  const modifyCoins = (delta: number): boolean => {
    if (!profile) return false;
    const current = profile.coins ?? 200;
    if (current + delta < 0) return false;
    updateProfileData({ coins: current + delta });
    return true;
  };

  const sendFriendRequest = async (toUid: string, toName: string) => {
    if (!profile) return;
    soundManager.playMagicChime();

    const request: Omit<FriendRequest, 'id'> = {
      fromUid: profile.uid,
      fromName: profile.displayName,
      fromAvatar: profile.photoURL,
      toUid: toUid,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'friendRequests'), request);
    
    // Add notification for the recipient
    const notif: Omit<AppNotification, 'id'> = {
      userId: toUid,
      type: 'friend_request',
      title: 'Lời mời kết bạn mới!',
      message: `${profile.displayName} muốn kết bạn với bạn ♡`,
      relatedId: docRef.id,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    await addDoc(collection(db, 'notifications'), notif);
  };

  const acceptFriendRequest = async (requestId: string) => {
    if (!profile) return;
    soundManager.playMagicChime();
    
    const requestDoc = await getDoc(doc(db, 'friendRequests', requestId));
    if (!requestDoc.exists()) return;
    
    const requestData = requestDoc.data() as FriendRequest;
    
    // Update request status
    await updateDoc(doc(db, 'friendRequests', requestId), { status: 'accepted' });
    
    // Add to friends list for both
    await updateDoc(doc(db, 'profiles', profile.uid), {
      friends: arrayUnion(requestData.fromUid)
    });
    await updateDoc(doc(db, 'profiles', requestData.fromUid), {
      friends: arrayUnion(profile.uid)
    });

    // Update local state if needed
    setProfile(prev => prev ? { ...prev, friends: [...(prev.friends || []), requestData.fromUid] } : null);
  };

  const rejectFriendRequest = async (requestId: string) => {
    if (!profile) return;
    soundManager.playBoop();
    await updateDoc(doc(db, 'friendRequests', requestId), { status: 'rejected' });
  };

  const updateFlowers = (flowers: PlantedFlower[]) => {
    updateProfileData({ plantedFlowers: flowers });
  };

  const toggleFavorite = (characterId: string) => {
    soundManager.playMagicChime();
    if (!profile) return;
    const currentFavs = profile.favorites || [];
    const exists = currentFavs.includes(characterId);
    const newFavs = exists ? currentFavs.filter((id) => id !== characterId) : [...currentFavs, characterId];
    updateProfileData({ favorites: newFavs });
  };

  const addSticker = (stickerId: string) => {
    soundManager.playMagicChime();
    if (!profile) return;
    const currentStickers = profile.stickers || [];
    if (!currentStickers.includes(stickerId)) {
      updateProfileData({ stickers: [...currentStickers, stickerId] });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        isAdmin,
        loading,
        loginWithGoogle,
        loginWithAdminPasscode,
        logout,
        updateProfileData,
        toggleFavorite,
        modifyCoins,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        updateFlowers,
        addSticker
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
