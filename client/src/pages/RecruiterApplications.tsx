import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api, { buildAssetUrl } from '../services/api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Textarea from '../components/common/Textarea';
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
    if (!interviewData.scheduledAt) {
      toast.error('Please select an interview date and time');
      return;
    }
    if (interviewData.mode === 'online' && !interviewData.link.trim()) {
      toast.error('Meeting link is required for online interviews');
      return;
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
    <div className="space-y-6 animate-fadeIn">
      <Link to="/recruiter/dashboard" className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-2 font-medium">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Applications</h1>
          <p className="text-slate-500 text-sm">Review and manage candidates for this position.</p>
        </div>
      </div>

      <Card className="p-1 border border-slate-200 shadow-none">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { key: 'all', label: `All (${applications.length})` },
            { key: 'priority', label: `Priority (${applications.filter((application) => application.isPriority).length})` },
            { key: 'pending', label: `Pending (${applications.filter((application) => application.status === 'applied').length})` }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'all' | 'priority' | 'pending')}
              className={`px-6 py-2 rounded text-sm font-bold transition-all whitespace-nowrap uppercase tracking-widest ${
                activeTab === tab.key ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

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
            <Card key={application._id} hover className="border border-slate-200 shadow-none group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded flex items-center justify-center text-slate-600 font-bold text-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    {application.candidate.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {application.candidate.name}
                      </h3>
                      {application.isPriority && <Badge variant="priority">Priority</Badge>}
                    </div>
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 font-medium uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {application.candidate.email}
                      </span>
                      <span>Applied {format(new Date(application.appliedAt), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant={application.status === 'hired' ? 'success' : application.status === 'rejected' ? 'danger' : 'warning'}>
                    {application.status.replace(/_/g, ' ')}
                  </Badge>
                  {application.status !== 'rejected' && application.status !== 'hired' && application.status !== 'joined' && (
                    <>
                      <Button variant="secondary" size="sm" onClick={() => updateStatus(application._id, 'shortlisted', 'Candidate shortlisted')}>
                        Shortlist
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedApplication(application);
                          setShowInterviewModal(true);
                        }}
                      >
                        Interview
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setSelectedApplication(application);
                          setShowRejectDialog(true);
                        }}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {application.candidate.skills && application.candidate.skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {application.candidate.skills.slice(0, 5).map((skill) => (
                    <span key={skill} className="text-[10px] font-bold text-slate-400 border border-slate-100 px-2 py-0.5 rounded uppercase tracking-widest">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
                <p><strong>DOB:</strong> {application.candidate.dateOfBirth ? new Date(application.candidate.dateOfBirth).toLocaleDateString() : '-'}</p>
                <p><strong>Age:</strong> {getAge(application.candidate.dateOfBirth)}</p>
                <p><strong>Qualification:</strong> {application.candidate.qualification || '-'}</p>
                <p><strong>Stream:</strong> {application.candidate.stream || '-'}</p>
                <p><strong>Graduation:</strong> {application.candidate.graduationStatus || '-'}</p>
                <p><strong>Experience:</strong> {typeof application.candidate.experience === 'number' ? `${application.candidate.experience} years` : '-'}</p>
                {application.candidate.resume && (
                  <a href={buildAssetUrl(application.candidate.resume)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {'View Resume ->'}
                  </a>
                )}
              </div>

              {application.coverLetter && (
                <details className="mt-4 rounded border border-slate-200 p-3">
                  <summary className="cursor-pointer text-sm font-medium">Cover Letter</summary>
                  <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">{application.coverLetter}</p>
                </details>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showInterviewModal} onClose={() => setShowInterviewModal(false)} title="Schedule Interview" size="md">
        <div className="space-y-4">
          <Input
            label="Date & Time"
            type="datetime-local"
            value={interviewData.scheduledAt}
            onChange={(event) => setInterviewData({ ...interviewData, scheduledAt: event.target.value })}
          />

          <Select
            label="Interview Mode"
            value={interviewData.mode}
            onChange={(event) => setInterviewData({ ...interviewData, mode: event.target.value })}
            options={[
              { value: 'online', label: 'Online' },
              { value: 'in_person', label: 'In-Person' },
              { value: 'phone', label: 'Phone' }
            ]}
          />

          {interviewData.mode === 'online' && (
            <Input
              label="Meeting Link"
              placeholder="https://meet.google.com/xxx"
              value={interviewData.link}
              onChange={(event) => setInterviewData({ ...interviewData, link: event.target.value })}
            />
          )}

          <Textarea
            label="Notes (Optional)"
            placeholder="Any additional information for the candidate..."
            rows={4}
            value={interviewData.notes}
            onChange={(event) => setInterviewData({ ...interviewData, notes: event.target.value })}
          />

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowInterviewModal(false)} className="flex-1">Cancel</Button>
            <Button variant="primary" onClick={submitInterview} className="flex-1">Schedule</Button>
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
