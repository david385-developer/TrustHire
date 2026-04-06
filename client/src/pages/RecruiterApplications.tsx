import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Video, MapPin, Phone } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api, { buildAssetUrl } from '../services/api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { SkeletonCard } from '../components/common/Skeleton';

interface Application {
  _id: string;
  candidate: {
    _id: string;
    name: string;
    email: string;
    skills?: string[];
    experience?: number;
    resume?: string;
    dateOfBirth?: string;
    qualification?: string;
    stream?: string;
    graduationStatus?: string;
  };
  coverLetter: string;
  feePaid: boolean;
  feeAmount: number;
  isPriority: boolean;
  status: string;
  appliedAt: string;
}

const getAge = (dob?: string) => {
  if (!dob) return '-';
  const date = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const month = today.getMonth() - date.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < date.getDate())) age -= 1;
  return age >= 0 ? String(age) : '-';
};

const RecruiterApplications: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'priority' | 'pending'>('all');
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [interviewData, setInterviewData] = useState({
    scheduledAt: '',
    mode: 'online',
    link: '',
    notes: ''
  });

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/applications/job/${id}`);
        const items = Array.isArray(response.data?.data) ? response.data.data : [];
        setApplications(
          items.sort((first: Application, second: Application) => {
            if (first.isPriority && !second.isPriority) return -1;
            if (!first.isPriority && second.isPriority) return 1;
            return new Date(second.appliedAt).getTime() - new Date(first.appliedAt).getTime();
          })
        );
      } catch (error: any) {
        setApplications([]);
        toast.error(error.response?.data?.message || 'Failed to fetch applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [id]);

  const filteredApplications = useMemo(() => {
    switch (activeTab) {
      case 'priority':
        return applications.filter((application) => application.isPriority);
      case 'pending':
        return applications.filter((application) => application.status === 'applied');
      default:
        return applications;
    }
  }, [activeTab, applications]);

  const refreshApplications = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/applications/job/${id}`);
      const items = Array.isArray(response.data?.data) ? response.data.data : [];
      setApplications(items);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to refresh applications');
    } finally {
      setLoading(false);
    }
  };

  const submitInterview = async () => {
    if (!selectedApplication) return;
    
    // Validations
    if (!interviewData.scheduledAt) {
      toast.error('Please select an interview date and time');
      return;
    }

    if (interviewData.mode === 'online') {
      const link = interviewData.link.trim();
      if (!link) {
        toast.error('Please enter a meeting link');
        return;
      }
      if (link.includes('xxx') || link.length < 10) {
        toast.error('Please enter a valid meeting link (not the placeholder)');
        return;
      }
      if (!link.startsWith('https://')) {
        toast.error('Meeting link must start with https://');
        return;
      }
    }

    try {
      await api.put(`/applications/${selectedApplication._id}/interview`, interviewData);
      toast.success('Interview scheduled successfully');
      setShowInterviewModal(false);
      setSelectedApplication(null);
      setInterviewData({ scheduledAt: '', mode: 'online', link: '', notes: '' });
      await refreshApplications();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to schedule interview');
    }
  };

  const updateStatus = async (applicationId: string, status: string, successMessage: string) => {
    try {
      await api.put(`/applications/${applicationId}/status`, { status });
      toast.success(successMessage);
      await refreshApplications();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update application');
    }
  };

  return (
    <div className="p-4 md:p-6 bg-[#F8FAF9] min-h-screen animate-fadeIn">
      <div className="max-w-6xl mx-auto">
        <Link to="/recruiter/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-medium text-sm transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Job Applications</h1>
            <p className="text-slate-500 text-sm font-medium">Review and manage candidates for this position</p>
          </div>
        </div>

        <div className="mb-8 flex items-center gap-2 border-b border-gray-200">
          {[
            { key: 'all', label: `All (${applications.length})` },
            { key: 'priority', label: `Priority (${applications.filter((application) => application.isPriority).length})` },
            { key: 'pending', label: `Pending (${applications.filter((application) => application.status === 'applied').length})` }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'all' | 'priority' | 'pending')}
              className={`px-4 py-2 text-xs font-bold transition-all relative uppercase tracking-widest ${
                activeTab === tab.key 
                  ? 'text-[#1B4D3E] after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#1B4D3E]' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((index) => <SkeletonCard key={index} />)}
          </div>
        ) : filteredApplications.length === 0 ? (
          <EmptyState
            heading="No applications yet"
            description="Applications will appear here once candidates start applying."
            action={
              <Link to="/recruiter/dashboard">
                <Button variant="primary">Back to Dashboard</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <Card key={application._id} className="border border-slate-200 shadow-sm group bg-white overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-[#1B4D3E] font-bold text-xl group-hover:bg-[#1B4D3E]/5 transition-colors">
                      {application.candidate.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#1B4D3E] transition-colors">
                          {application.candidate.name}
                        </h3>
                        {application.isPriority && <Badge variant="priority">Priority Shield</Badge>}
                      </div>
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {application.candidate.email}
                        </span>
                        <span>Applied {format(new Date(application.appliedAt), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <Badge variant={application.status === 'hired' ? 'success' : application.status === 'rejected' ? 'danger' : 'warning'}>
                      {application.status.replace(/_/g, ' ')}
                    </Badge>
                    {application.status !== 'rejected' && application.status !== 'hired' && application.status !== 'joined' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => updateStatus(application._id, 'shortlisted', 'Candidate shortlisted')}
                          className="px-3 py-1.5 text-[10px] font-bold text-slate-600 bg-slate-100 rounded hover:bg-slate-200 uppercase tracking-widest transition-colors"
                        >
                          Shortlist
                        </button>
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowInterviewModal(true);
                          }}
                          className="px-3 py-1.5 text-[10px] font-bold text-white bg-[#1B4D3E] rounded hover:bg-[#0F3D2E] uppercase tracking-widest transition-colors"
                        >
                          Interview
                        </button>
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowRejectDialog(true);
                          }}
                          className="px-3 py-1.5 text-[10px] font-bold text-red-600 hover:bg-red-50 rounded uppercase tracking-widest transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 pb-5 pt-0">
                  {application.candidate.skills && application.candidate.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {application.candidate.skills.slice(0, 5).map((skill) => (
                        <span key={skill} className="text-[10px] font-bold text-slate-400 border border-slate-100 px-2 py-0.5 rounded uppercase tracking-widest bg-slate-50">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-600 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Qualification</p>
                      <p className="font-semibold text-slate-700">{application.candidate.qualification || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Experience</p>
                      <p className="font-semibold text-slate-700">{typeof application.candidate.experience === 'number' ? `${application.candidate.experience} years` : '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Age</p>
                      <p className="font-semibold text-slate-700">{getAge(application.candidate.dateOfBirth)} yrs</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Document</p>
                      {application.candidate.resume ? (
                        <a href={buildAssetUrl(application.candidate.resume)} target="_blank" rel="noopener noreferrer" className="text-[#1B4D3E] font-bold hover:underline">
                          View Resume →
                        </a>
                      ) : <span className="font-semibold text-slate-400 italic">No Resume</span>}
                    </div>
                  </div>

                  {application.coverLetter && (
                    <div className="mt-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Candidate Cover Letter</p>
                      <p className="text-xs text-slate-600 bg-white border border-slate-100 p-3 rounded-lg leading-relaxed whitespace-pre-wrap italic">
                        "{application.coverLetter}"
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showInterviewModal} onClose={() => setShowInterviewModal(false)} title="Schedule Interview" size="md">
        <div className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Date & Time</label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-[#1B4D3E] transition-all"
              value={interviewData.scheduledAt}
              onChange={(event) => setInterviewData({ ...interviewData, scheduledAt: event.target.value })}
            />
          </div>

          <div>
             <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Interview Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'online', label: 'Online', icon: Video },
                { id: 'in_person', label: 'In-Person', icon: MapPin },
                { id: 'phone', label: 'Phone', icon: Phone }
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setInterviewData({ ...interviewData, mode: m.id })}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                    interviewData.mode === m.id 
                      ? 'border-[#1B4D3E] bg-[#1B4D3E]/5 text-[#1B4D3E]' 
                      : 'border-slate-100 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  <m.icon className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {interviewData.mode === 'online' && (
            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">Meeting Link</label>
              <input
                type="url"
                placeholder="e.g. https://meet.google.com/abc-defg-hij"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-[#1B4D3E] transition-all"
                value={interviewData.link}
                onChange={(event) => setInterviewData({ ...interviewData, link: event.target.value })}
              />
              <p className="text-[10px] text-slate-400 font-medium">e.g. https://meet.google.com/abc-defg-hij or a Zoom link</p>
            </div>
          )}

          <div>
             <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Notes (Optional)</label>
            <textarea
              placeholder="Any additional information for the candidate..."
              rows={4}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-[#1B4D3E] transition-all resize-none"
              value={interviewData.notes}
              onChange={(event) => setInterviewData({ ...interviewData, notes: event.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => setShowInterviewModal(false)} 
              className="flex-1 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={submitInterview} 
              className="flex-1 py-2 bg-[#1B4D3E] text-white text-xs font-bold rounded hover:bg-[#0F3D2E] uppercase tracking-widest transition-all shadow-md active:scale-95"
            >
              Schedule
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showRejectDialog}
        onClose={() => setShowRejectDialog(false)}
        onConfirm={() => selectedApplication && updateStatus(selectedApplication._id, 'rejected', 'Application rejected')}
        title="Reject Application"
        message="Are you sure you want to reject this application? If the candidate paid a Challenge Fee, it will be refunded automatically."
        variant="danger"
        confirmText="Reject"
      />
    </div>
  );
};

export default RecruiterApplications;
