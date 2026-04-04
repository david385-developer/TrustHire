import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
    <div className="p-4 md:p-6 h-screen flex flex-col bg-[#F8FAF9] overflow-hidden animate-fadeIn">
      <div className="max-w-2xl mx-auto w-full bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-0">
        {/* Header — compact as requested */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              Post a New Job
            </h1>
            <p className="text-xs text-gray-500">
              Fill in the details below to create a job posting
            </p>
          </div>
          <button 
            onClick={() => navigate(-1)}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        </div>

        {/* Form Area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <JobForm job={null} onSubmit={onSubmit} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default PostJob;
