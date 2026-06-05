import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Video, MapPin, Phone, ExternalLink, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { buildAssetUrl } from '../services/api';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import AnimatedPage from '../components/common/AnimatedPage';

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

const KANBAN_COLUMNS = [
  { id: 'applied', label: 'Applied', color: 'border-slate-300 dark:border-slate-700 bg-slate-100/40 dark:bg-slate-900/40' },
  { id: 'shortlisted', label: 'Shortlisted', color: 'border-blue-300 dark:border-blue-900/40 bg-blue-50/20 dark:bg-blue-950/10' },
  { id: 'interview_scheduled', label: 'Interviewing', color: 'border-amber-300 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10' },
  { id: 'hired', label: 'Hired', color: 'border-emerald-300 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10' },
  { id: 'rejected', label: 'Rejected', color: 'border-rose-300 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10' }
];

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
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);

  // Modals state
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showHiredDialog, setShowHiredDialog] = useState(false);
  
  const [interviewData, setInterviewData] = useState({
    scheduledAt: '',
    mode: 'online',
    link: '',
    notes: ''
  });

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/applications/job/${id}`);
      const items = Array.isArray(response.data?.data) ? response.data.data : [];
      // Normalize any status like 'under_review' to 'applied' for Kanban column mapping
      const normalizedItems = items.map((app: any) => ({
        ...app,
        status: app.status === 'under_review' ? 'applied' : app.status
      }));
      
      setApplications(
        normalizedItems.sort((first: Application, second: Application) => {
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

  useEffect(() => {
    fetchApplications();
  }, [id]);

  const updateStatus = async (applicationId: string, status: string, successMessage: string) => {
    try {
      await api.put(`/applications/${applicationId}/status`, { status });
      toast.success(successMessage);
      await fetchApplications();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update application status');
    }
  };

  const submitInterview = async () => {
    if (!selectedApplication) return;
    
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
      await fetchApplications();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to schedule interview');
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, appId: string) => {
    setDraggedAppId(appId);
    e.dataTransfer.setData('text/plain', appId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('text/plain') || draggedAppId;
    if (!appId) return;
    setDraggedAppId(null);

    const app = applications.find(a => a._id === appId);
    if (!app || app.status === targetStatus) return;

    if (targetStatus === 'interview_scheduled') {
      setSelectedApplication(app);
      setShowInterviewModal(true);
    } else if (targetStatus === 'rejected') {
      setSelectedApplication(app);
      setShowRejectDialog(true);
    } else if (targetStatus === 'hired') {
      setSelectedApplication(app);
      setShowHiredDialog(true);
    } else {
      await updateStatus(appId, targetStatus, `Candidate moved to ${targetStatus}`);
    }
  };

  return (
    <AnimatedPage>
      <div className="space-y-6">
        
        {/* Back navigation */}
        <div>
          <Link 
            to="/recruiter/dashboard" 
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-semibold group transition-all"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
        </div>

        {/* Title and stats summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Applicant Pipeline</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Drag and drop candidate cards to update their status in the pipeline.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              {applications.filter(a => a.isPriority).length} Priority
            </span>
            <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
            <span>{applications.length} Total Applicants</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 skeleton-shimmer" />
                <div className="h-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 skeleton-shimmer" />
              </div>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <EmptyState
            title="No applications yet"
            description="Applications will appear here once candidates start applying to this posting."
            action={
              <Link to="/recruiter/dashboard">
                <button className="btn-primary py-2 px-4 text-xs font-bold">Back to Dashboard</button>
              </Link>
            }
          />
        ) : (
          /* KANBAN BOARD CONTAINER */
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start overflow-x-auto min-w-[900px] pb-6">
            {KANBAN_COLUMNS.map((column) => {
              const columnApps = applications.filter((app) => app.status === column.id);

              return (
                <div 
                  key={column.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                  className={`border rounded-2xl p-4 min-h-[500px] flex flex-col space-y-3 transition-colors ${column.color}`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      {column.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      {columnApps.length}
                    </span>
                  </div>

                  {/* Card Container */}
                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-1">
                    {columnApps.length === 0 ? (
                      <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-xl text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Drop Here
                      </div>
                    ) : (
                      columnApps.map((app) => (
                        <div
                          key={app._id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, app._id)}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl p-4 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-300 group"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {app.candidate.name}
                                </h4>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{app.candidate.email}</p>
                              </div>
                            </div>

                            {/* Badges row */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              {app.isPriority && (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[9px] font-extrabold rounded-md bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 uppercase tracking-wide">
                                  Priority
                                </span>
                              )}
                              <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                {typeof app.candidate.experience === 'number' ? `${app.candidate.experience}y exp` : 'Fresher'}
                              </span>
                            </div>

                            {/* Metadata list */}
                            <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850">
                              <div className="flex justify-between">
                                <span className="text-slate-400 dark:text-slate-500">Degree:</span>
                                <span className="font-semibold truncate max-w-[100px]">{app.candidate.qualification || '-'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400 dark:text-slate-500">Age:</span>
                                <span className="font-semibold">{getAge(app.candidate.dateOfBirth)} yrs</span>
                              </div>
                              {app.candidate.resume && (
                                <div className="pt-1 text-center">
                                  <a 
                                    href={buildAssetUrl(app.candidate.resume)} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                                  >
                                    <FileText className="w-3.5 h-3.5" /> View Resume <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              )}
                            </div>

                            {app.coverLetter && (
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-950/20 p-2 rounded-lg border border-slate-100/50 dark:border-slate-850/50 italic line-clamp-2">
                                "{app.coverLetter}"
                              </div>
                            )}

                          </div>
                        </div>
                      ))
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* SCHEDULE INTERVIEW MODAL */}
      <Modal isOpen={showInterviewModal} onClose={() => setShowInterviewModal(false)} title="Schedule Interview" size="md">
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Date & Time</label>
            <input
              type="datetime-local"
              className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              value={interviewData.scheduledAt}
              onChange={(event) => setInterviewData({ ...interviewData, scheduledAt: event.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Interview Mode</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'online', label: 'Online', icon: Video },
                { id: 'in-person', label: 'In-Person', icon: MapPin },
                { id: 'phone', label: 'Phone', icon: Phone }
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setInterviewData({ ...interviewData, mode: m.id })}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    interviewData.mode === m.id 
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-bold ring-1 ring-indigo-500' 
                      : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <m.icon className="w-5 h-5 mb-1.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {interviewData.mode === 'online' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Meeting Link</label>
              <input
                type="url"
                placeholder="e.g. https://meet.google.com/abc-defg-hij"
                className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                value={interviewData.link}
                onChange={(event) => setInterviewData({ ...interviewData, link: event.target.value })}
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Must start with https://</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Notes (Optional)</label>
            <textarea
              placeholder="Any instructions or topics the candidate should prepare for..."
              rows={4}
              className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white resize-none"
              value={interviewData.notes}
              onChange={(event) => setInterviewData({ ...interviewData, notes: event.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => {
                setShowInterviewModal(false);
                fetchApplications(); // Reset board if cancelled
              }} 
              className="flex-1 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl"
            >
              Cancel
            </button>
            <button 
              onClick={submitInterview} 
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/10 active:scale-95"
            >
              Schedule & Invite
            </button>
          </div>
        </div>
      </Modal>

      {/* REJECT CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={showRejectDialog}
        onClose={() => {
          setShowRejectDialog(false);
          fetchApplications();
        }}
        onConfirm={() => selectedApplication && updateStatus(selectedApplication._id, 'rejected', 'Candidate rejected, refund processed')}
        title="Reject Candidate"
        message="Are you sure you want to reject this candidate? If they applied with a Challenge Fee priority shield, this action will automatically process their gateway refund."
        variant="danger"
        confirmText="Confirm Rejection"
      />

      {/* HIRE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={showHiredDialog}
        onClose={() => {
          setShowHiredDialog(false);
          fetchApplications();
        }}
        onConfirm={() => selectedApplication && updateStatus(selectedApplication._id, 'hired', 'Candidate hired! Refund processed.')}
        title="Hire Candidate"
        message="Mark this candidate as Hired? Selecting this will reward their successful recruitment by automatically refunding their priority Challenge Fee."
        variant="primary"
        confirmText="Confirm Hire"
      />

    </AnimatedPage>
  );
};

export default RecruiterApplications;
