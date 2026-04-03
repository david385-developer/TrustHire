import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import JobForm from '../components/jobs/JobForm';

const PostJob: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await api.post('/jobs', data);
      toast.success('Job posted successfully!');
      navigate('/recruiter/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            Post a New Job
          </h1>
          <p className="text-slate-500 font-medium">
            Fill in the details to create your job posting
          </p>
        </div>

        <JobForm job={null} onSubmit={onSubmit} loading={loading} />
      </div>
    </div>
  );
};

export default PostJob;
