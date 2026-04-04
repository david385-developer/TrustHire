import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, MapPin, Filter, X, Briefcase, 
  Clock, IndianRupee
} from 'lucide-react';
import api from '../services/api';
import Pagination from '../components/common/Pagination';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: { min: number; max: number; currency: string };
  skills: string[];
  experienceRequired: { min: number; max: number };
  challengeFeeAmount: number;
  createdAt: string;
  viewCount?: number;
}

const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    location: '',
    type: '',
    minSalary: '',
    maxSalary: '',
    hasFee: '',
    sort: '-createdAt'
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [searchInput, setSearchInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const locationDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const ALL_LOCATIONS = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Lucknow", "Kochi", "Indore", "Chandigarh", "Noida", "Gurgaon", "Remote", "Work From Home"];

  useEffect(() => {
    fetchJobs();
  }, [currentPage, appliedFilters]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: 12,
        sort: appliedFilters.sort
      };
      if (appliedFilters.search) params.search = appliedFilters.search;
      if (appliedFilters.location) params.location = appliedFilters.location;
      if (appliedFilters.type) params.type = appliedFilters.type;
      if (appliedFilters.minSalary) params.minSalary = appliedFilters.minSalary;
      if (appliedFilters.maxSalary) params.maxSalary = appliedFilters.maxSalary;
      if (appliedFilters.hasFee) params.hasFee = appliedFilters.hasFee === 'yes';

      const response = await api.get('/jobs', { params });
      setJobs(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setAppliedFilters(prev => ({ ...prev, search: value }));
      setCurrentPage(1);
    }, 500);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationInput(value);
    if (value.length > 0) {
      setLocationSuggestions(ALL_LOCATIONS.filter(loc => loc.toLowerCase().includes(value.toLowerCase())));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
    if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current);
    locationDebounceRef.current = setTimeout(() => {
      setAppliedFilters(prev => ({ ...prev, location: value }));
      setCurrentPage(1);
    }, 500);
  };

  const handleLocationSelect = (loc: string) => {
    setLocationInput(loc);
    setShowSuggestions(false);
    setAppliedFilters(prev => ({ ...prev, location: loc }));
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setCurrentPage(1);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    const reset = { search: '', location: '', type: '', minSalary: '', maxSalary: '', hasFee: '', sort: '-createdAt' };
    setFilters(reset);
    setAppliedFilters(reset);
    setSearchInput('');
    setLocationInput('');
    setCurrentPage(1);
  };

  const formatSalary = (salary: { min: number; max: number }) => {
    const f = (n: number) => n >= 100000 ? `${(n / 100000).toFixed(1)}L` : `${(n / 1000).toFixed(0)}K`;
    return `₹${f(salary.min)} - ₹${f(salary.max)}`;
  };

  const getTimeAgo = (date: string) => {
    const d = Math.floor((new Date().getTime() - new Date(date).getTime()) / 86400000);
    if (d === 0) return 'Today';
    if (d === 1) return 'Yesterday';
    if (d < 7) return `${d}d ago`;
    return `${Math.floor(d / 7)}w ago`;
  };

  const SidebarContent = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <h3 className="text-[11px] font-semibold text-gray-900 uppercase tracking-wider">
          Filters
        </h3>
        <button onClick={handleClearFilters} className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider">Reset</button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[11px] font-semibold text-gray-900 mb-1.5 uppercase tracking-wider block">
            Job Type
          </label>
          <div className="space-y-1.5">
            {['full-time', 'part-time', 'contract', 'remote'].map(type => (
              <label key={type} className="flex items-center gap-2 group cursor-pointer">
                <input 
                  type="radio" 
                  name="type" 
                  value={type}
                  checked={filters.type === type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="w-3 h-3 rounded border-gray-300 text-[#1B4D3E]"
                />
                <span className="text-xs text-gray-600 group-hover:text-[#1B4D3E] capitalize transition-colors">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-gray-900 mb-1.5 uppercase tracking-wider block">
            Salary Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="number" 
              placeholder="Min" 
              className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-white text-gray-900 outline-none"
              value={filters.minSalary}
              onChange={(e) => setFilters({...filters, minSalary: e.target.value})}
            />
            <input 
              type="number" 
              placeholder="Max" 
              className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-white text-gray-900 outline-none"
              value={filters.maxSalary}
              onChange={(e) => setFilters({...filters, maxSalary: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-gray-900 mb-1.5 uppercase tracking-wider block">
            Challenge Fee
          </label>
          <select 
            value={filters.hasFee}
            onChange={(e) => setFilters({...filters, hasFee: e.target.value})}
            className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-white text-gray-900 outline-none"
          >
            <option value="">All Job Listings</option>
            <option value="yes">Priority (Has Fee)</option>
            <option value="no">Standard (No Fee)</option>
          </select>
        </div>

        <div>
           <label className="text-[11px] font-semibold text-gray-900 mb-1.5 uppercase tracking-wider block">
            Experience
          </label>
          <div className="p-2 bg-blue-50 border border-blue-100 rounded text-[10px] text-blue-600 font-medium">
            Filter by experience coming soon.
          </div>
        </div>
      </div>

      <button 
        onClick={handleApplyFilters}
        className="w-full py-1.5 bg-[#1B4D3E] text-white rounded text-xs font-medium hover:bg-[#0F3D2E] transition-all"
      >
        Apply Filters
      </button>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50 pt-16">
      {/* SEARCH BAR - FIXED AT TOP */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex flex-col md:flex-row items-center gap-2 max-w-7xl mx-auto">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search jobs, skills..." 
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md outline-none focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] text-gray-900"
              value={searchInput}
              onChange={handleSearchChange}
            />
          </div>
          <div className="relative flex-1 w-full">
            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Location..." 
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md outline-none focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] text-gray-900"
              value={locationInput}
              onChange={handleLocationChange}
              onFocus={() => locationInput && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {showSuggestions && locationSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden py-1">
                {locationSuggestions.map(loc => (
                  <button 
                    key={loc} 
                    onClick={() => handleLocationSelect(loc)}
                    className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-xs text-gray-700 transition-colors"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select 
              className="text-[11px] border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-700 outline-none flex-1 md:flex-none"
              value={appliedFilters.sort}
              onChange={(e) => setAppliedFilters({...appliedFilters, sort: e.target.value})}
            >
              <option value="-createdAt">Newest</option>
              <option value="createdAt">Oldest</option>
              <option value="-salary.max">High Salary</option>
              <option value="salary.min">Low Salary</option>
            </select>
            <button 
              onClick={() => setShowFilters(true)}
              className="md:hidden p-1.5 bg-white border border-gray-200 rounded text-gray-600"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT - FILLS REMAINING SPACE */}
      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full">
        {/* FILTERS SIDEBAR */}
        <aside className="hidden md:block w-52 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto p-3">
          <SidebarContent />
        </aside>

        {/* JOB CARDS - SCROLLABLE */}
        <main className="flex-1 overflow-y-auto p-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              {loading ? 'Finding jobs...' : `${jobs.length} Jobs Found`}
            </h2>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-3 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-100"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                      <div className="h-2 bg-gray-100 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No matches found</p>
              <button 
                onClick={handleClearFilters}
                className="mt-2 text-xs text-[#1B4D3E] font-medium hover:underline"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {jobs.map((job) => (
                <Link 
                  key={job._id} 
                  to={`/jobs/${job._id}`}
                  className="block"
                >
                  <div className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition cursor-pointer">
                    <div className="flex gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-100 font-bold text-[#1B4D3E] text-xs">
                        {job.company.charAt(0)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 truncate">{job.title}</h3>
                            <p className="text-xs text-gray-500 truncate">{job.company}</p>
                          </div>
                          {job.challengeFeeAmount > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex-shrink-0">
                              Priority · ₹{job.challengeFeeAmount}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-gray-500 mb-1.5">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                          <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.type}</span>
                          <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />{formatSalary(job.salary)}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{getTimeAgo(job.createdAt)}</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {job.skills.slice(0, 3).map(skill => (
                            <span key={skill} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 3 && (
                            <span className="text-[10px] text-gray-400">+{job.skills.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </main>
      </div>

      {/* MOBILE FILTERS DRAWER */}
      {showFilters && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-[280px] bg-white p-4 overflow-y-auto animate-slideInRight shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Filters</h3>
              <button 
                onClick={() => setShowFilters(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
