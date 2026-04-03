import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, MapPin, Filter, X, Eye, Briefcase, 
  DollarSign, Star, SlidersHorizontal, ChevronRight, 
  Calendar, Clock, Building, Zap
} from 'lucide-react';
import api from '../services/api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';

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
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-500" />
          Quick Filters
        </h3>
        <button onClick={handleClearFilters} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider">Reset</button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
            <Briefcase className="w-4 h-4 text-slate-400" /> Job Type
          </label>
          <div className="space-y-2">
            {['full-time', 'part-time', 'contract', 'remote'].map(type => (
              <label key={type} className="flex items-center gap-3 group cursor-pointer">
                <input 
                  type="radio" 
                  name="type" 
                  value={type}
                  checked={filters.type === type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-600 group-hover:text-emerald-600 capitalize transition-colors">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
            <DollarSign className="w-4 h-4 text-slate-400" /> Salary Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="number" 
              placeholder="Min" 
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              value={filters.minSalary}
              onChange={(e) => setFilters({...filters, minSalary: e.target.value})}
            />
            <input 
              type="number" 
              placeholder="Max" 
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              value={filters.maxSalary}
              onChange={(e) => setFilters({...filters, maxSalary: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
            <Star className="w-4 h-4 text-amber-400" /> Challenge Fee
          </label>
          <select 
            value={filters.hasFee}
            onChange={(e) => setFilters({...filters, hasFee: e.target.value})}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none"
          >
            <option value="">All Job Listings</option>
            <option value="yes">Priority (Has Fee)</option>
            <option value="no">Standard (No Fee)</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" /> Experience
          </label>
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-600 font-medium">
            Filter by experience coming soon to provide better matching.
          </div>
        </div>
      </div>

      <button 
        onClick={handleApplyFilters}
        className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
      >
        Apply Active Filters
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAF9] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* TOP SEARCH SECTION */}
        <div className="mb-12">
          <div className="bg-white p-2 md:p-3 rounded-[32px] shadow-2xl shadow-emerald-900/5 border border-emerald-100 flex flex-col md:flex-row items-center gap-2 transform -translate-y-4 animate-fadeUp">
            <div className="flex-1 w-full flex items-center px-4 gap-3 border-b md:border-b-0 md:border-r border-slate-100 py-2">
              <Search className="w-6 h-6 text-emerald-500" />
              <input 
                type="text" 
                placeholder="Search jobs, companies, or skills..." 
                className="w-full bg-transparent border-none outline-none font-medium text-slate-700 placeholder:text-slate-400 py-2"
                value={searchInput}
                onChange={handleSearchChange}
              />
            </div>
            <div className="flex-1 w-full flex items-center px-4 gap-3 relative py-2">
              <MapPin className="w-6 h-6 text-slate-400" />
              <input 
                type="text" 
                placeholder="Location (e.g. Remote, Mumbai)" 
                className="w-full bg-transparent border-none outline-none font-medium text-slate-700 placeholder:text-slate-400 py-2"
                value={locationInput}
                onChange={handleLocationChange}
                onFocus={() => locationInput && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              {showSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 overflow-hidden py-1">
                  {locationSuggestions.map(loc => (
                    <button 
                      key={loc} 
                      onClick={() => handleLocationSelect(loc)}
                      className="w-full text-left px-5 py-3 hover:bg-emerald-50 text-slate-600 text-sm font-medium transition-colors border-b border-slate-50 last:border-none"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={fetchJobs}
              className="w-full md:w-auto px-10 py-4 bg-emerald-600 text-white rounded-[24px] font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
            >
              Search
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* SIDEBAR */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-28 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <SidebarContent />
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <div className="lg:col-span-9">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900">
                {loading ? 'Finding jobs...' : `${jobs.length} Opportunities Found`}
              </h2>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400 mr-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Sort:
                </div>
                <select 
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={appliedFilters.sort}
                  onChange={(e) => setAppliedFilters({...appliedFilters, sort: e.target.value})}
                >
                  <option value="-createdAt">Newest Postings</option>
                  <option value="createdAt">Oldest Postings</option>
                  <option value="-salary.max">Highest Salary</option>
                  <option value="salary.min">Lowest Salary</option>
                </select>
                <button 
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-48 bg-white border border-slate-100 rounded-[32px] animate-pulse"></div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <EmptyState 
                icon={<Search className="w-20 h-20 text-slate-200" />}
                heading="No matches found"
                description="We couldn't find any jobs matching your current filters. Try expanding your search area or removing filters."
                action={<Button onClick={handleClearFilters} variant="primary">Reset Search</Button>}
              />
            ) : (
              <div className="space-y-6">
                {jobs.map((job, idx) => (
                  <Link 
                    key={job._id} 
                    to={`/jobs/${job._id}`}
                    className="group block"
                  >
                    <div className={`bg-white border-2 rounded-[32px] p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/5 hover:-translate-y-1 flex flex-col md:flex-row gap-6 ${job.challengeFeeAmount > 0 ? 'border-emerald-500/20 border-l-emerald-500 border-l-[6px]' : 'border-white hover:border-slate-100 border-l-slate-200 border-l-[6px]'}`}>
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl font-bold text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all transform group-hover:rotate-6 flex-shrink-0">
                        {job.company.charAt(0)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors truncate">{job.title}</h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
                              <span className="flex items-center gap-1.5"><Building className="w-4 h-4" />{job.company}</span>
                              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{job.location}</span>
                              <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" />{formatSalary(job.salary)}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-row md:flex-col items-center md:items-end gap-3 flex-shrink-0">
                            {job.challengeFeeAmount > 0 ? (
                              <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-50 text-amber-600 text-xs font-bold ring-1 ring-amber-200">
                                <Star className="w-4 h-4 fill-amber-500" />
                                Priority · ₹{job.challengeFeeAmount}
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-50 text-slate-400 text-xs font-bold border border-slate-100 uppercase tracking-wider">
                                Standard
                              </div>
                            )}
                            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{getTimeAgo(job.createdAt)}</span>
                              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{job.viewCount || 0}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-slate-50">
                          <div className="flex flex-wrap gap-2">
                            {job.skills.slice(0, 4).map(skill => (
                              <span key={skill} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-emerald-100 flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                {skill}
                              </span>
                            ))}
                          </div>
                          <button className="flex items-center gap-2 text-emerald-600 font-bold text-sm group-hover:translate-x-2 transition-transform">
                            Apply Now <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-12">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE FILTERS DRAWER */}
      {showFilters && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white p-8 overflow-y-auto animate-slideInRight shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold heading-font text-slate-900">Search Filters</h3>
              <button 
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
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
