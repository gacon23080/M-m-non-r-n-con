import React from 'react';
import { Bell, X, CheckCheck, MessageCircle, Heart, Trophy, Sparkles, UserPlus, Check, Trash2 } from 'lucide-react';
import { AppNotification } from '../../types';
import { soundManager } from '../../lib/sound';
import { useAuth } from '../../context/AuthContext';

interface NotificationModalProps {
  notifications: AppNotification[];
  onClose: () => void;
  onMarkAllAsRead: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  notifications,
  onClose,
  onMarkAllAsRead
}) => {
  const { acceptFriendRequest, rejectFriendRequest } = useAuth();

  const getIcon = (type: string) => {
    switch (type) {
      case 'ranking':
        return <Trophy className="w-4 h-4 text-amber-500" />;
      case 'like':
        return <Heart className="w-4 h-4 text-rose-500" />;
      case 'message':
        return <MessageCircle className="w-4 h-4 text-[#A594D6]" />;
      case 'friend_request':
        return <UserPlus className="w-4 h-4 text-indigo-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-pink-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-[#D2C8F2] shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#FFF0F5] to-[#E9E2FA] border-b border-[#E8DFF3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#A594D6]" />
            <h3 className="font-heading font-bold text-base text-[#62566F]">
              Thông Báo Lớp Học
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playMagicChime();
                onMarkAllAsRead();
              }}
              className="text-[11px] font-bold text-[#A594D6] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Đã đọc hết</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white text-[#93879E] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {notifications.length === 0 ? (
            <div className="py-12 text-center">
              <Sparkles className="w-10 h-10 text-[#E8DFF3] mx-auto mb-3" />
              <p className="text-sm text-[#93879E] italic">Lớp học hiện chưa có thông báo mới ♡</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-3 ${
                  notif.isRead
                    ? 'bg-white/60 border-[#F1EBF9]'
                    : 'bg-[#FFF0F5] border-[#FCD3E2] shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white shadow-xs shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading font-bold text-xs text-[#62566F] truncate">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-[#93879E]">
                        {notif.createdAt}
                      </span>
                    </div>
                    <p className="text-xs text-[#93879E] mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>

                {notif.type === 'friend_request' && !notif.isRead && (
                  <div className="flex gap-2 ml-11">
                    <button
                      onClick={() => acceptFriendRequest(notif.relatedId || '')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-indigo-500 text-white text-[10px] font-bold shadow-sm hover:bg-indigo-600 transition-all cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      Đồng ý
                    </button>
                    <button
                      onClick={() => rejectFriendRequest(notif.relatedId || '')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 text-[10px] font-bold hover:bg-gray-50 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      Từ chối
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
