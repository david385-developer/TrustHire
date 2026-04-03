import React from 'react';
import Badge from './Badge';

type ApplicationStatus =
  | 'applied'
  | 'under_review'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'interview_no_show'
  | 'shortlisted'
  | 'rejected'
  | 'hired'
  | 'joined'
  | 'fee_refunded'
  | 'fee_forfeited';

interface StatusBadgeProps {
  status: ApplicationStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusConfig: Record<
    ApplicationStatus,
    { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }
  > = {
    applied: { label: 'Applied', variant: 'warning' },
    under_review: { label: 'Under Review', variant: 'info' },
    interview_scheduled: { label: 'Interview Scheduled', variant: 'warning' },
    interview_completed: { label: 'Interview Completed', variant: 'info' },
    interview_no_show: { label: 'Interview No-Show', variant: 'danger' },
    shortlisted: { label: 'Shortlisted', variant: 'info' },
    rejected: { label: 'Rejected', variant: 'danger' },
    hired: { label: 'Hired', variant: 'success' },
    joined: { label: 'Joined', variant: 'success' },
    fee_refunded: { label: 'Fee Refunded', variant: 'success' },
    fee_forfeited: { label: 'Fee Forfeited', variant: 'danger' }
  };

  const config = statusConfig[status] || { label: status, variant: 'default' };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default StatusBadge;
