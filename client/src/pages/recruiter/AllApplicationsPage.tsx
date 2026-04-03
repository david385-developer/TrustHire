import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCard } from '../../components/common/Skeleton';

const AllApplicationsPage: React.FC = () => {
  type RecruiterApplication = {
    _id: string;
    appliedAt: string;
    status: string;
    coverLetter?: string;
    job: { _id: string; title: string; location: string };
    candidate: { name: string; email: string; dateOfBirth?: string; qualification?: string; stream?: string; graduationStatus?: string; experience?: number; skills?: string[]; resume?: string };
  };
  const [applications, setApplications] = useState<RecruiterApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/applications/recruiter/all');
      setApplications(response.data.data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => 
    app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.candidate?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">All Applications</h1>
          <p className="text-slate-500 text-sm">Review and manage all incoming applications across your job posts.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" icon={<Filter className="w-4 h-4" />}>Filter</Button>
          <Button variant="primary" size="sm">Export CSV</Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by candidate name or job title..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filteredApplications.length > 0 ? (
        <>
        <div className="hidden md:block bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Applied For</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApplications.map((app) => (
                <tr key={app._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-100">
                        {app.candidate?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{app.candidate?.name}</p>
                        <p className="text-xs text-slate-500">{app.candidate?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900 text-sm">{app.job?.title}</p>
                    <p className="text-xs text-slate-500">{app.job?.location}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={app.status === 'hired' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}>
                      {app.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {format(new Date(app.appliedAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => window.location.href = `/recruiter/jobs/${app.job._id}/applications`}
                    >
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="md:hidden space-y-3">
          {filteredApplications.map((app) => (
            <Card key={app._id} className="border border-slate-200">
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-slate-900">{app.candidate?.name}</p>
                <p className="text-slate-500">{app.candidate?.email}</p>
                <p><strong>Job:</strong> {app.job?.title}</p>
                <p><strong>Status:</strong> {app.status?.replace('_', ' ')}</p>
                <p><strong>Date:</strong> {format(new Date(app.appliedAt), 'MMM dd, yyyy')}</p>
                <p><strong>DOB:</strong> {app.candidate?.dateOfBirth ? new Date(app.candidate.dateOfBirth).toLocaleDateString() : '-'}</p>
                <p><strong>Qualification:</strong> {app.candidate?.qualification || '-'} {app.candidate?.stream ? `(${app.candidate.stream})` : ''}</p>
                <p><strong>Graduation:</strong> {app.candidate?.graduationStatus || '-'}</p>
                <p><strong>Experience:</strong> {typeof app.candidate?.experience === 'number' ? `${app.candidate.experience} years` : '-'}</p>
                <div className="flex flex-wrap gap-1">{(app.candidate?.skills || []).slice(0, 8).map((s: string) => <span key={s} className="px-2 py-1 rounded-full bg-slate-100 text-xs">{s}</span>)}</div>
                {app.candidate?.resume && <a className="text-blue-600 hover:underline" href={app.candidate.resume} target="_blank" rel="noreferrer">View Resume →</a>}
                {app.coverLetter && <details><summary className="text-slate-700">Cover Letter</summary><p className="mt-1 text-slate-600 whitespace-pre-wrap">{app.coverLetter}</p></details>}
              </div>
            </Card>
          ))}
        </div>
        </>
      ) : (
        <EmptyState
          title="No applications found"
          description={searchTerm ? "No applications match your search criteria." : "You haven't received any applications yet."}
          compact
        />
      )}
    </div>
  );
};

export default AllApplicationsPage;