// src/constant/balanceChangeStyles.js
import {
  CreditCard,
  Lock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  SlidersHorizontal,
} from "lucide-react";

export const BALANCE_CHANGE_STYLES = {
  topup: {
    label: "Top Up",
    icon: CreditCard,
    pillBg: "bg-emerald-700/30",
    pillText: "text-emerald-100",
    pillBorder: "border border-emerald-500/60",
    amountClass: "text-emerald-400",
  },

  buy_lock: {
    label: "Terkunci",
    icon: Lock,
    pillBg: "bg-amber-700/30",
    pillText: "text-amber-100",
    pillBorder: "border border-amber-500/60",
    amountClass: "text-amber-300",
  },

  buy_success: {
    label: "Beli Sukses",
    icon: CheckCircle,
    pillBg: "bg-emerald-700/30",
    pillText: "text-emerald-100",
    pillBorder: "border border-emerald-500/60",
    amountClass: "text-emerald-400",
  },

  buy_failed: {
    label: "Beli Gagal",
    icon: XCircle,
    pillBg: "bg-zinc-700/40",
    pillText: "text-zinc-100",
    pillBorder: "border border-zinc-600/60",
    amountClass: "text-zinc-300",
  },

  withdraw: {
    label: "Withdraw",
    icon: ArrowUpRight,
    pillBg: "bg-rose-700/30",
    pillText: "text-rose-100",
    pillBorder: "border border-rose-500/60",
    amountClass: "text-rose-400",
  },

  adjustment: {
    label: "Penyesuaian",
    icon: SlidersHorizontal,
    pillBg: "bg-sky-700/30",
    pillText: "text-sky-100",
    pillBorder: "border border-sky-500/60",
    amountClass: "text-sky-300",
  },
  reward: {
    label: "Reward",
    icon: GiftIcon,
    pillBg: "bg-emerald-900/40",
    pillText: "text-emerald-200",
    pillBorder: "border border-emerald-500/60",
  },
};
