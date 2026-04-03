import {
  Clipboard,
  ClipboardList,
  Star,
  RefreshCw,
  Calendar,
  Clock,
  AlertTriangle,
  DollarSign,
  XCircle,
  Trophy,
  LogOut,
  AlertCircle
} from 'lucide-react';

export type NotificationType =
  | 'application_submitted'
  | 'application_received'
  | 'priority_application'
  | 'status_updated'
  | 'interview_scheduled'
  | 'interview_reminder'
  | 'interview_no_show'
  | 'fee_refunded'
  | 'fee_forfeited'
  | 'hired'
  | 'rejected'
  | 'application_withdrawn'
  | 'job_posted'
  | 'profile_incomplete';

export const notificationIconMap: Record<
  NotificationType,
  { Icon: any; colorClass: string }
> = {
  application_submitted: { Icon: Clipboard, colorClass: 'text-slate-600' },
  application_received: { Icon: ClipboardList, colorClass: 'text-blue-600' },
  priority_application: { Icon: Star, colorClass: 'text-amber-500' },
  status_updated: { Icon: RefreshCw, colorClass: 'text-blue-600' },
  interview_scheduled: { Icon: Calendar, colorClass: 'text-purple-600' },
  interview_reminder: { Icon: Clock, colorClass: 'text-orange-500' },
  interview_no_show: { Icon: AlertTriangle, colorClass: 'text-red-600' },
  fee_refunded: { Icon: DollarSign, colorClass: 'text-green-600' },
  fee_forfeited: { Icon: XCircle, colorClass: 'text-red-600' },
  hired: { Icon: Trophy, colorClass: 'text-green-600' },
  rejected: { Icon: XCircle, colorClass: 'text-red-600' },
  application_withdrawn: { Icon: LogOut, colorClass: 'text-slate-500' },
  job_posted: { Icon: Clipboard, colorClass: 'text-slate-600' },
  profile_incomplete: { Icon: AlertCircle, colorClass: 'text-yellow-500' }
};

