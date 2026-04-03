import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import JobForm from '../components/jobs/JobForm';
import Button from '../components/common/Button';
import { SkeletonCard } from '../components/common/Skeleton';

const EditJob: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [job, setJob] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await api.get(`/jobs/${id}`);
      setJob(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch job');
    } finally {
      setFetching(false);
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await api.put(`/jobs/${id}`, data);
      toast.success('Job updated successfully!');
      navigate('/recruiter/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update job');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-3xl mx-auto">
        <SkeletonCard />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-xl font-bold text-slate-900 mb-2">Job not found</p>
        <p className="text-slate-500 mb-6">{error || 'This job does not exist.'}</p>
        <Link to="/recruiter/dashboard">
          <Button variant="primary" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">
              Edit Job
            </h1>
            <p className="text-slate-500 font-medium">
              Update the details of your job posting
            </p>
          </div>
          <Link to="/recruiter/dashboard" className="text-blue-600 hover:underline flex items-center gap-2 font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>

        <JobForm job={job} onSubmit={onSubmit} loading={loading} />
      </div>
    </div>
  );
};

export default EditJob;
