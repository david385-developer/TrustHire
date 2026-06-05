import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, MapPin, Filter, X, Briefcase, 
  Clock, IndianRupee, Zap, Tag, Star
} from 'lucide-react';
import api from '../services/api';
import Pagination from '../components/common/Pagination';
import AnimatedPage from '../components/common/AnimatedPage';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  salary: { min: number; max: number; currency: string };
  skills: string[];
  experienceRequired: { min: number; max: number };
  challengeFeeAmount: number;
  createdAt: string;
  viewCount?: number;
}

const CATEGORIES = ["Technology", "Marketing", "Finance", "Design", "Sales", "HR", "Operations", "Healthcare", "Education", "Legal", "Other"];

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
    category: '',
    minSalary: '',
    maxSalary: '',
    minExp: '',
    maxExp: '',
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
      if (appliedFilters.category) params.category = appliedFilters.category;
      if (appliedFilters.minSalary) params.minSalary = appliedFilters.minSalary;
      if (appliedFilters.maxSalary) params.maxSalary = appliedFilters.maxSalary;
      if (appliedFilters.minExp) params.minExp = appliedFilters.minExp;
      if (appliedFilters.maxExp) params.maxExp = appliedFilters.maxExp;
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
    const reset = { search: '', location: '', type: '', category: '', minSalary: '', maxSalary: '', minExp: '', maxExp: '', hasFee: '', sort: '-createdAt' };
    setFilters(reset);
    setAppliedFilters(reset);
    setSearchInput('');
    setLocationInput('');
    setCurrentPage(1);
  };

  const removeCategory = () => {
    setFilters(prev => ({ ...prev, category: '' }));
    setAppliedFilters(prev => ({ ...prev, category: '' }));
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

  const formatExperience = (exp: { min: number; max: number }) => {
    if (!exp) return '0 yrs';
    const min = exp.min ?? 0;
    const max = exp.max ?? 0;
    if (min === 0 && max === 0) return 'Fresher';
    if (min === max) return `${min} yrs`;
    return `${min}-${max} yrs`;
  };

  const SidebarContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          Filter Options
        </h3>
        <button 
          onClick={handleClearFilters} 
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-wider"
        >
          Reset
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider block">
            Job Type
          </label>
          <div className="space-y-2">
            {['full-time', 'part-time', 'contract', 'remote'].map(type => (
              <label key={type} className="flex items-center gap-2.5 group cursor-pointer">
                <input 
                  type="radio" 
                  name="type" 
                  value={type}
                  checked={filters.type === type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="w-4 h-4 border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-900"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 capitalize transition-colors">
                  {type.replace('-', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider block">
            Category
          </label>
          <select 
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider block">
            Salary Range (LPA)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="number" 
              placeholder="Min" 
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              value={filters.minSalary}
              onChange={(e) => setFilters({...filters, minSalary: e.target.value})}
            />
            <input 
              type="number" 
              placeholder="Max" 
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              value={filters.maxSalary}
              onChange={(e) => setFilters({...filters, maxSalary: e.target.value})}
            />
          </div>
        </div>

        <div>
           <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider block">
            Experience (Years)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="number" 
              placeholder="Min" 
              min="0"
              max="20"
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              value={filters.minExp}
              onChange={(e) => setFilters({...filters, minExp: e.target.value})}
            />
            <input 
              type="number" 
              placeholder="Max"
              min="0"
              max="20" 
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              value={filters.maxExp}
              onChange={(e) => setFilters({...filters, maxExp: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider block">
            Challenge Fee
          </label>
          <select 
            value={filters.hasFee}
            onChange={(e) => setFilters({...filters, hasFee: e.target.value})}
            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            <option value="">All Job Listings</option>
            <option value="yes">Priority (Has Fee)</option>
            <option value="no">Standard (No Fee)</option>
          </select>
        </div>
      </div>

      <button 
        onClick={handleApplyFilters}
        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
      >
        Apply Filters
      </button>
    </div>
  );

  return (
    <AnimatedPage>
      <div className="flex flex-col min-h-[calc(100vh-80px)] bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        
        {/* SEARCH BAR PANEL */}
        <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 px-4 py-3 shadow-sm transition-colors">
          <div className="flex flex-col md:flex-row items-center gap-3 max-w-7xl mx-auto w-full">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search jobs, skills, titles..." 
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
                value={searchInput}
                onChange={handleSearchChange}
              />
            </div>
            <div className="relative flex-1 w-full">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="City or remote location..." 
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
                value={locationInput}
                onChange={handleLocationChange}
                onFocus={() => locationInput && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              {showSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden py-1">
                  {locationSuggestions.map(loc => (
                    <button 
                      key={loc} 
                      onClick={() => handleLocationSelect(loc)}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <select 
                className="text-xs border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 flex-1 md:flex-none transition-all"
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
                className="md:hidden p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* PANELS SPLIT VIEW */}
        <div className="flex-grow flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6 overflow-hidden">
          
          {/* DESKTOP FILTER SIDEBAR */}
          <aside className="hidden md:block w-60 flex-shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 overflow-y-auto shadow-sm">
            <SidebarContent />
          </aside>

          {/* MAIN LISTINGS PANEL */}
          <main className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2 overflow-x-auto">
                <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  {loading ? 'Searching...' : `${jobs.length} Opportunities Found`}
                </h2>
                {appliedFilters.category && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 text-xs font-bold whitespace-nowrap">
                    <Tag className="w-3.5 h-3.5" />
                    {appliedFilters.category}
                    <X className="w-3.5 h-3.5 cursor-pointer hover:text-red-500 transition-colors" onClick={removeCategory} />
                  </span>
                )}
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 animate-pulse space-y-3">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <Search className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No matching opportunities found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Try checking your spelling or modifying your filters.</p>
                <button 
                  onClick={handleClearFilters}
                  className="btn-primary text-xs py-2 px-4 shadow-none"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <Link 
                    key={job._id} 
                    to={`/jobs/${job._id}`}
                    className="block group"
                  >
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/40 transition-all duration-300 cursor-pointer">
                      <div className="flex gap-4">
                        
                        {/* Company avatar */}
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-indigo-600 dark:text-indigo-400 text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                          {job.company.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                            <div>
                              <h3 className="text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {job.title}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5 mt-0.5 font-medium">
                                {job.company}
                                <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{job.category}</span>
                              </p>
                            </div>
                            {job.challengeFeeAmount > 0 && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-200 dark:border-amber-900/30 flex-shrink-0 self-start">
                                <Star className="w-3 h-3 fill-amber-500" />
                                Priority · ₹{job.challengeFeeAmount}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-slate-400" />{job.location}</span>
                            <span className="flex items-center gap-1"><Briefcase className="w-4 h-4 text-slate-400" />{job.type}</span>
                            <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-slate-400" />{formatExperience(job.experienceRequired)}</span>
                            <span className="flex items-center gap-1"><IndianRupee className="w-4 h-4 text-slate-400" />{formatSalary(job.salary)}</span>
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-slate-400" />{getTimeAgo(job.createdAt)}</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {job.skills.slice(0, 3).map(skill => (
                              <span key={skill} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                {skill}
                              </span>
                            ))}
                            {job.skills.length > 3 && (
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold self-center">+{job.skills.length - 3} more</span>
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
              <div className="mt-6">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            )}
          </main>
        </div>

        {/* MOBILE FILTERS DRAWER */}
        {showFilters && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-[280px] bg-white dark:bg-slate-900 p-5 overflow-y-auto animate-slideInRight shadow-2xl border-l border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Filters</h3>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent />
            </div>
          </div>
        )}

      </div>
    </AnimatedPage>
  );
};

export default Jobs;
