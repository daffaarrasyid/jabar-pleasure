'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  XCircle,
  Sparkles,
  MapPin,
  CheckCheck,
  Calendar,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import {
  AppNotification,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/api';

export const NOTIFICATION_EVENT = 'jabarpleasure:notification-updated';

interface NotificationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDestination?: (destinationIdOrSlug: string | number) => void;
  onUnreadCountChange?: (count: number) => void;
}

export default function NotificationSheet({
  isOpen,
  onClose,
  onSelectDestination,
  onUnreadCountChange,
}: NotificationSheetProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const dispatchUpdate = (count: number) => {
    onUnreadCountChange?.(count);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(NOTIFICATION_EVENT, { detail: { unreadCount: count } })
      );
    }
  };

  const fetchList = async (unreadOnly = false) => {
    setIsLoading(true);
    try {
      const res = await getNotifications(unreadOnly);
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
      dispatchUpdate(res.unreadCount);
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchList(activeTab === 'unread');
    }
  }, [isOpen, activeTab]);

  const handleMarkAsRead = async (id: number) => {
    try {
      const res = await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount(res.unreadCount);
      dispatchUpdate(res.unreadCount);
    } catch (err) {
      console.warn('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      const now = new Date().toISOString();
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: now })));
      setUnreadCount(0);
      dispatchUpdate(0);
    } catch (err) {
      console.warn('Failed to mark all read:', err);
    }
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.read_at) {
      await handleMarkAsRead(notif.id);
    }

    if (notif.type === 'new_destination') {
      const target = notif.data?.slug || notif.data?.destination_id;
      if (target && onSelectDestination) {
        onClose();
        onSelectDestination(target);
      }
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Baru saja';
      if (diffMins < 60) return `${diffMins} mnt lalu`;
      if (diffHours < 24) return `${diffHours} jam lalu`;
      if (diffDays === 1) return 'Kemarin';
      if (diffDays < 7) return `${diffDays} hari lalu`;
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return '';
    }
  };

  if (!isOpen) return null;

  const filteredNotifications =
    activeTab === 'unread'
      ? notifications.filter((n) => !n.read_at)
      : notifications;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs transition-opacity p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Sheet Container (Mobile-first max-w-md matching app frame) */}
      <div className="relative w-full max-w-md max-h-[85vh] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-10 animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200">
        {/* Top Handle on Mobile */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EEF0FF] text-[#4941EC] flex items-center justify-center font-bold">
              <Bell className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-tight">
                Notifikasi
              </h3>
              <p className="text-xs text-gray-500">
                {unreadCount > 0
                  ? `${unreadCount} notifikasi belum dibaca`
                  : 'Semua notifikasi telah dibaca'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                title="Tandai semua dibaca"
                className="text-[11px] font-semibold text-[#4941EC] hover:text-[#3831C5] px-2.5 py-1.5 rounded-lg hover:bg-[#EEF0FF] transition-colors flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tandai Dibaca</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-gray-50/70 border-b border-gray-100 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-[#4941EC] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-200/60'
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('unread')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'unread'
                ? 'bg-[#4941EC] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-200/60'
            }`}
          >
            <span>Belum Dibaca</span>
            {unreadCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'unread'
                    ? 'bg-white text-[#4941EC]'
                    : 'bg-[#EF4444] text-white'
                }`}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Notifications List Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-5/6" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-12 px-6 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-[#EEF0FF] text-[#4941EC] flex items-center justify-center mb-3">
                <Bell className="w-7 h-7 stroke-[1.8] opacity-80" />
              </div>
              <p className="text-sm font-bold text-gray-800">Belum ada notifikasi</p>
              <p className="text-xs text-gray-500 max-w-[240px] mt-1 leading-relaxed">
                {activeTab === 'unread'
                  ? 'Semua notifikasi Anda sudah dibaca.'
                  : 'Pemberitahuan terkait konfirmasi destinasi dan tempat wisata baru akan tampil di sini.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isUnread = !notif.read_at;

              // Render styling based on notification type
              let Icon = Bell;
              let iconBg = 'bg-[#EEF0FF] text-[#4941EC]';
              let badgeText = 'Pemberitahuan';
              let badgeClass = 'bg-[#EEF0FF] text-[#4941EC]';

              if (notif.type === 'submission_approved') {
                Icon = CheckCircle2;
                iconBg = 'bg-emerald-50 text-emerald-600 border border-emerald-100';
                badgeText = 'Pengajuan Diterima';
                badgeClass = 'bg-emerald-100/70 text-emerald-700';
              } else if (notif.type === 'submission_rejected') {
                Icon = XCircle;
                iconBg = 'bg-red-50 text-red-500 border border-red-100';
                badgeText = 'Pengajuan Ditolak';
                badgeClass = 'bg-red-100/70 text-red-600';
              } else if (notif.type === 'new_destination') {
                Icon = Sparkles;
                iconBg = 'bg-gradient-to-br from-[#4941EC]/10 to-[#60CE9F]/20 text-[#4941EC] border border-[#4941EC]/20';
                badgeText = 'Destinasi Baru';
                badgeClass = 'bg-[#4941EC]/10 text-[#4941EC]';
              }

              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 transition-colors cursor-pointer flex gap-3 relative ${
                    isUnread ? 'bg-[#F9FAFB]/90 hover:bg-[#EEF0FF]/30' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  {/* Left Icon */}
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}
                  >
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${badgeClass}`}
                      >
                        {badgeText}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {formatRelativeTime(notif.created_at)}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug line-clamp-1">
                      {notif.title}
                    </h4>

                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {notif.message}
                    </p>

                    {/* Additional Metadata Card (if new destination or reject reason) */}
                    {notif.type === 'new_destination' && notif.data?.name && (
                      <div className="mt-2 p-2 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs hover:border-[#4941EC]/30 transition-all">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-[#60CE9F] shrink-0" />
                          <span className="font-semibold text-gray-800 truncate">
                            {notif.data.name}
                          </span>
                          {notif.data.regency && (
                            <span className="text-[11px] text-gray-400 shrink-0">
                              • {notif.data.regency}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-[#4941EC] flex items-center gap-0.5 shrink-0 ml-2">
                          Lihat
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    )}

                    {notif.type === 'submission_rejected' && notif.data?.admin_note && (
                      <div className="mt-2 p-2 rounded-xl bg-red-50/50 border border-red-100 text-[11px] text-red-700">
                        <span className="font-bold">Catatan Kurator: </span>
                        {notif.data.admin_note}
                      </div>
                    )}
                  </div>

                  {/* Unread Blue Dot Indicator */}
                  {isUnread && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#4941EC] shrink-0 mt-1.5 animate-pulse" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

