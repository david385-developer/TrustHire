   import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, ChevronRight, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCard } from '../../components/common/Skeleton';

import { useNavigate } from 'react-router-dom';

interface Application {
  _id: string;
  job: {
    _id: string;
    title: string;
    company: string;
    location: string;
    salary: { min: number; max: number };
  };
  feePaid: boolean;
  feeAmount: number;
  isPriority: boolean;
  status: string;
  appliedAt: string;
}

const ApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'fee'>('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/applications/my');
      setApplications(response.data.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'applied': return 'warning';
      case 'under_review': return 'info';
      case 'interview_scheduled': return 'warning';
      case 'shortlisted': return 'info';
      case 'hired': return 'success';
      case 'rejected': return 'danger';
      case 'fee_refunded': return 'success';
      case 'fee_forfeited': return 'danger';
      case 'withdrawn': return 'default';
      default: return 'default';
    }
  };

  const filterApplications = () => {
    switch (activeTab) {
      case 'active':
        return applications.filter((app) =>
          ['applied', 'under_review', 'interview_scheduled', 'interview_completed', 'shortlisted'].includes(app.status)
        );
      case 'completed':
        return applications.filter((app) =>
          ['rejected', 'hired', 'joined', 'fee_refunded', 'fee_forfeited', 'interview_no_show', 'withdrawn'].includes(app.status)
        );
      case 'fee':
        return applications.filter((app) => app.feePaid);
      default:
        return applications;
    }
  };

  const filteredApplications = filterApplications().filter(app => app.job);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 mb-2">My Applications</h1>
          <p className="text-gray-500">Track and manage all your job applications in one place.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-full w-fit">
        {[
          { key: 'all', label: 'All' },
          { key: 'active', label: 'Active' },
          { key: 'completed', label: 'Completed' },
          { key: 'fee', label: 'Fee Paid' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-[#1B4D3E] text-white shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredApplications.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredApplications.map((app) => (
            <Card key={app._id} hover className="group border border-transparent hover:border-[#1B4D3E]/10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-[#1B4D3E] font-bold text-xl border border-gray-100 group-hover:bg-white group-hover:border-[#1B4D3E]/20 transition-colors">
                    {app.job.company.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-[#1B4D3E] transition-colors">
                      {app.job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {app.job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {app.job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Applied on {format(new Date(app.appliedAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={getStatusVariant(app.status)} className="capitalize">
                      {app.status.replace('_', ' ')}
                    </Badge>
                    {app.feePaid && (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        <IndianRupee className="w-3 h-3" />
                        Fee Paid
                      </span>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    icon={<ChevronRight className="w-4 h-4" />}
                    onClick={() => navigate(`/dashboard/applications/${app._id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No applications found"
          description={
            activeTab === 'all' 
              ? "You haven't applied to any jobs yet. Start exploring opportunities!" 
              : `You don't have any ${activeTab} applications at the moment.`
          }
          action={
            <Button onClick={() => window.location.href = '/jobs'}>
              Browse Jobs
            </Button>
          }
        />
      )}
    </div>
  );
};

export default ApplicationsPage;

const Building = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>
);