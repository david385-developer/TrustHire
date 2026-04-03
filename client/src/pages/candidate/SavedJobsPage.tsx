import React, { useState, useEffect } from 'react';
import { Bookmark, MapPin, DollarSign, ChevronRight, Search } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

const SavedJobsPage: React.FC = () => {
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      // Assuming there's an endpoint for saved jobs, if not we'll just show an empty state for now
      // const response = await api.get('/jobs/saved');
      // setSavedJobs(response.data.data);
      setSavedJobs([]); // Mock empty for now
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Saved Jobs</h1>
          <p className="text-gray-500">Keep track of opportunities you're interested in.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : savedJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedJobs.map((job) => (
            <Card key={job._id} hover className="group border border-transparent hover:border-[#1B4D3E]/10 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-[#1B4D3E] font-bold text-xl group-hover:bg-white group-hover:border-[#1B4D3E]/20 transition-colors">
                    {job.company.charAt(0)}
                  </div>
                  <button className="p-2 text-[#1B4D3E] bg-[#1B4D3E]/10 rounded-full hover:bg-[#1B4D3E] hover:text-white transition-all">
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#1B4D3E] transition-colors mb-1">{job.title}</h3>
                <p className="text-[#1B4D3E] font-medium text-sm mb-4">{job.company}</p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <DollarSign className="w-4 h-4" />
                    ₹{job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                <Button variant="primary" size="sm" className="flex-1">Apply Now</Button>
                <Button variant="ghost" size="sm" icon={<ChevronRight className="w-4 h-4" />}>Details</Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No saved jobs"
          description="You haven't saved any jobs yet. Browse our listings to find your next opportunity!"
          action={
            <Button onClick={() => window.location.href = '/jobs'} icon={<Search className="w-4 h-4" />}>
              Find Jobs
            </Button>
          }
        />
      )}
    </div>
  );
};

export default SavedJobsPage;