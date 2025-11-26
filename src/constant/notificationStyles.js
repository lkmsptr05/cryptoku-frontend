// src/constant/notificationStyles.js
import {
  Settings,
  CheckCircle,
  AlertTriangle,
  LogOut,
  Gift,
  Award,
  TrendingUp,
  Hourglass,
} from "lucide-react";

export const NOTIFICATION_STYLES = {
  system: {
    label: "System",
    icon: Settings,
    pillBg: "bg-sky-500/15",
    pillText: "text-sky-200",
    pillBorder: "border border-sky-500/40",
  },

  topup_success: {
    label: "Top Up Berhasil",
    icon: CheckCircle,
    pillBg: "bg-emerald-500/15",
    pillText: "text-emerald-200",
    pillBorder: "border border-emerald-500/40",
  },

  topup_failed: {
    label: "Top Up Gagal",
    icon: AlertTriangle,
    pillBg: "bg-rose-500/15",
    pillText: "text-rose-200",
    pillBorder: "border border-rose-500/40",
  },

  withdraw_request: {
    label: "Withdraw Request",
    icon: LogOut,
    pillBg: "bg-amber-500/15",
    pillText: "text-amber-200",
    pillBorder: "border border-amber-500/40",
  },

  withdraw_success: {
    label: "Withdraw Sukses",
    icon: CheckCircle,
    pillBg: "bg-emerald-500/15",
    pillText: "text-emerald-200",
    pillBorder: "border border-emerald-500/40",
  },

  promo: {
    label: "Promo",
    icon: Gift,
    pillBg: "bg-indigo-500/15",
    pillText: "text-indigo-200",
    pillBorder: "border border-indigo-500/40",
  },

  reward: {
    label: "Reward",
    icon: Award,
    pillBg: "bg-sky-500/15",
    pillText: "text-sky-200",
    pillBorder: "border border-sky-500/40",
  },

  buy_success: {
    label: "Buy Berhasil",
    icon: TrendingUp,
    pillBg: "bg-sky-500/15",
    pillText: "text-sky-200",
    pillBorder: "border border-sky-500/40",
  },

  buy_failed: {
    label: "Buy Gagal",
    icon: AlertTriangle,
    pillBg: "bg-rose-500/15",
    pillText: "text-rose-200",
    pillBorder: "border border-rose-500/40",
  },

  buy_pending: {
    label: "Dalam Proses",
    icon: Hourglass,
    pillBg: "bg-yellow-500/20",
    pillText: "text-yellow-400",
    pillBorder: "border border-yellow-500/30",
  },
};
