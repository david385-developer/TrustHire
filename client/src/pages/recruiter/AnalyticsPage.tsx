import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BarChart2,
  Briefcase,
  CheckCircle2,
  Download,
  Eye,
  TrendingUp,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import api from '../../services/api';

interface AnalyticsData {
  totalJobs: number;
  totalApplications: number;
  shortlisted: number;
  hired: number;
  rejected: number;
  underReview: number;
  averageApplicationsPerJob: number;
  topJobs: Array<{
    _id: string;
    title: string;
    viewCount: number;
    applicationCount: number;
    priorityCount: number;
    shortlistedCount: number;
    hiredCount: number;
  }>;
  applicationTrend: Array<{ date: string; count: number }>;
}

const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await api.get('/recruiter/analytics');
        setData(response.data?.data || null);
      } catch (error: any) {
        setData(null);
        toast.error(error.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const stats = [
    { label: 'Total Jobs', value: data?.totalJobs ?? 0, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Applications', value: data?.totalApplications ?? 0, icon: Eye, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Shortlisted', value: data?.shortlisted ?? 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Hires', value: data?.hired ?? 0, icon: CheckCircle2, color: 'text-amber-600', bg: 'bg-amber-50' }
  ];

  const trendMax = useMemo(() => {
    const counts = data?.applicationTrend?.map((point) => point.count) || [];
    return counts.length ? Math.max(...counts, 1) : 1;
  }, [data]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Analytics & Reports</h1>
          <p className="text-slate-500 text-sm">Monitor your hiring pipeline performance with live recruiter data.</p>
        </div>
        <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />} disabled>
          Export Coming Soon
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="group border border-slate-200 hover:border-blue-200 shadow-none transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-emerald-600 bg-emerald-50 flex items-center gap-1 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                Live
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border border-slate-200 shadow-none">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Application Trend</h3>
          </div>
          {loading ? (
            <div className="h-64 animate-pulse bg-slate-50 rounded-lg" />
          ) : data?.applicationTrend?.length ? (
            <div className="space-y-4">
              <div className="h-64 flex items-end gap-3">
                {data.applicationTrend.slice(-7).map((point) => (
                  <div key={point.date} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-slate-100 rounded-t-md overflow-hidden">
                      <div
                        className="bg-blue-600 rounded-t-md"
                        style={{ height: `${Math.max((point.count / trendMax) * 180, 12)}px` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">{point.date.slice(5)}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500">Last 7 recorded application days across all your active jobs.</p>
            </div>
          ) : (
            <EmptyState compact title="No trend data yet" description="Application activity will appear here as candidates apply." />
          )}
        </Card>

        <Card className="border border-slate-200 shadow-none">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-900">Pipeline Breakdown</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Under Review', value: data?.underReview ?? 0, color: 'bg-sky-500' },
              { label: 'Shortlisted', value: data?.shortlisted ?? 0, color: 'bg-violet-500' },
              { label: 'Hired', value: data?.hired ?? 0, color: 'bg-emerald-500' },
              { label: 'Rejected', value: data?.rejected ?? 0, color: 'bg-rose-500' }
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  <span className="text-sm font-bold text-slate-900">{item.value}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color}`}
                    style={{
                      width: `${Math.min(
                        ((item.value || 0) / Math.max(data?.totalApplications || 1, 1)) * 100,
                        100
                      )}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-sm text-slate-600">
              Average applications per job: <strong>{data?.averageApplicationsPerJob ?? 0}</strong>
            </p>
          </div>
        </Card>
      </div>

      <Card className="border border-slate-200 shadow-none">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Top Performing Jobs</h3>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((index) => <div key={index} className="h-16 bg-slate-50 rounded-lg animate-pulse" />)}
          </div>
        ) : data?.topJobs?.length ? (
          <div className="space-y-4">
            {data.topJobs.map((job) => (
              <div key={job._id} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{job.title}</h4>
                  <div className="flex items-center gap-4 text-xs text-slate-400 font-medium uppercase tracking-wider">
                    <span>{job.viewCount} views</span>
                    <span>{job.applicationCount} applications</span>
                    <span>{job.priorityCount} priority</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{job.hiredCount} hires</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{job.shortlistedCount} shortlisted</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState compact title="No job performance data yet" description="Post a job and start receiving applications to see analytics here." />
        )}
      </Card>
    </div>
  );
};

export default AnalyticsPage;
