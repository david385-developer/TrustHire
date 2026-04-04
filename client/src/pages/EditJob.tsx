import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import JobForm from '../components/jobs/JobForm';

const EditJob: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [job, setJob] = useState<any>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/jobs/${id}`);
        setJob(response.data.data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to fetch job');
        navigate('/recruiter/dashboard');
      } finally {
        setFetching(false);
      }
    };
    fetchJob();
  }, [id, navigate]);

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
      <div className="flex items-center justify-center h-screen bg-[#F8FAF9]">
        <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 h-screen flex flex-col bg-[#F8FAF9] overflow-hidden animate-fadeIn">
      <div className="max-w-2xl mx-auto w-full bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-0">
        {/* Header — compact consistent structure */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              Edit Job Posting
            </h1>
            <p className="text-xs text-gray-500">
              Modify the details of your job listing below
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
          <JobForm job={job} onSubmit={onSubmit} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default EditJob;
