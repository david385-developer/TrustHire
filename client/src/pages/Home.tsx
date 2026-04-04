import React, { useEffect, useState, useRef } from 'react'; // TrustHire Landing Page — v2.1.0
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle,
  Building2,
  ShieldCheck,
  DollarSign,
  Send,
  Trophy,
  MapPin,
  Star,
  Quote,
  SearchCheck,
  UserPlus
} from 'lucide-react';
import api from '../services/api';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: { min: number; max: number; currency: string };
  skills: string[];
  challengeFeeAmount: number;
  createdAt: string;
}

const Home: React.FC = () => {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        const response = await api.get('/jobs?limit=3&sort=-createdAt');
        setFeaturedJobs(response.data.data);
      } catch (error) {
        console.error('Error fetching featured jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedJobs();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const formatSalary = (salary: { min: number; max: number; currency: string }) => {
    const formatAmount = (amount: number) => {
      if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
      return `${(amount / 1000).toFixed(0)}K`;
    };
    return `₹${formatAmount(salary.min)} - ₹${formatAmount(salary.max)}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* SECTION 1: HERO */}
      <section className="relative h-screen flex items-center bg-gradient-to-br from-[#0F3D2E] to-[#1B4D3E] overflow-hidden">
        {/* Decorative background elements — BEHIND text */}
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-emerald-500/20 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full"></div>
          <div className="absolute inset-0 hero-pattern opacity-10"></div>
        </div>

        {/* Text content — ON TOP of background */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-16 items-center w-full">
            <div className="lg:col-span-7">
              <span className="inline-block text-white/80 text-sm font-medium mb-8 px-4 py-1.5 border border-white/30 rounded-full backdrop-blur-sm">
                ✦ Trust-Driven Hiring Platform
              </span>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight heading-font">
                Your Commitment Is Your <span className="text-emerald-400">Strongest Resume</span>
              </h1>
              
              <p className="text-sm md:text-base lg:text-lg text-white/80 mb-8 leading-relaxed max-w-xl body-font">
                In a world of AI-polished applications, stand out with genuine commitment. Pay an optional Challenge Fee to show recruiters you mean business.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link to="/jobs" className="px-5 py-2.5 text-sm md:px-6 md:py-3 md:text-base bg-white text-[#1B4D3E] rounded-full font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-950/20 flex items-center justify-center">
                  Browse Jobs
                </Link>
                <a href="#how-it-works" className="px-5 py-2.5 text-sm md:px-6 md:py-3 md:text-base border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition-all flex items-center justify-center">
                  How It Works
                </a>
              </div>
            </div>

            <div className="lg:col-span-12 relative hidden md:block lg:col-start-8 lg:col-end-13">
              <div className="relative space-y-4">
                <div className="bg-white p-4 md:p-5 rounded-2xl shadow-2xl animate-float-rotate origin-left w-48 md:w-56 ml-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Application Submitted</p>
                      <p className="text-xs text-slate-500">Priority review active ✓</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 md:p-5 rounded-2xl shadow-2xl animate-float-rotate delay-700 w-48 md:w-56 mr-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                      <Star className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Challenge Fee: ₹500</p>
                      <p className="text-xs text-slate-500">Commitment verified</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Curved Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden pointer-events-none z-10">
          <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
            <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,213.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* SECTION 2: STATS BAR */}
      <section ref={statsRef} className="h-auto py-6 md:py-8 bg-white flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 w-full">
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 lg:gap-16">
            <div className="text-center group">
              <p className={`text-2xl md:text-3xl font-bold heading-font text-[#1B4D3E] mb-1 ${statsVisible ? 'animate-fadeUp' : 'opacity-0'}`}>2,500+</p>
              <p className="text-xs md:text-sm text-gray-600 font-medium tracking-wide">Jobs Posted</p>
            </div>
            <div className="text-center group">
              <p className={`text-2xl md:text-3xl font-bold heading-font text-[#1B4D3E] mb-1 ${statsVisible ? 'animate-fadeUp' : 'opacity-0'}`} style={{ animationDelay: '100ms' }}>15,000+</p>
              <p className="text-xs md:text-sm text-gray-600 font-medium tracking-wide">Candidates</p>
            </div>
            <div className="text-center group">
              <p className={`text-2xl md:text-3xl font-bold heading-font text-[#1B4D3E] mb-1 ${statsVisible ? 'animate-fadeUp' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>850+</p>
              <p className="text-xs md:text-sm text-gray-600 font-medium tracking-wide">Companies</p>
            </div>
            <div className="text-center group">
              <p className={`text-2xl md:text-3xl font-bold heading-font text-[#1B4D3E] mb-1 ${statsVisible ? 'animate-fadeUp' : 'opacity-0'}`} style={{ animationDelay: '300ms' }}>98%</p>
              <p className="text-xs md:text-sm text-gray-600 font-medium tracking-wide">Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section id="how-it-works" className="min-h-screen flex flex-col justify-center bg-[#FAFAF7] py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-6">
            <h2 className="text-2xl md:text-3xl font-bold heading-font text-gray-900 mb-2">How TrustHire Works</h2>
            <p className="text-sm md:text-base text-gray-500">Three simple steps to your next opportunity. We focus on commitment, transparency, and results.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6">
            <div className="relative bg-white rounded-xl p-4 md:p-5 shadow-sm text-center group">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4 group-hover:scale-110 transition-all">
                <UserPlus className="w-6 h-6" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-xs">1</div>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Create Your Profile</h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">Sign up and build your professional profile with skills, experience, and resume.</p>
            </div>

            <div className="relative bg-white rounded-xl p-4 md:p-5 shadow-sm text-center group">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4 group-hover:scale-110 transition-all">
                <Send className="w-6 h-6" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-xs">2</div>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Apply with Confidence</h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">Browse jobs and apply. Add an optional Challenge Fee to signal commitment.</p>
            </div>

            <div className="relative bg-white rounded-xl p-4 md:p-5 shadow-sm text-center group">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4 group-hover:scale-110 transition-all">
                <Trophy className="w-6 h-6" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-xs">3</div>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Get Hired or Refunded</h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">Your fee is refunded if rejected or hired. No risk for serious candidates.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: FEATURED JOBS */}
      <section className="min-h-screen flex flex-col justify-center bg-white py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold heading-font text-gray-900 mb-1">Featured Opportunities</h2>
              <p className="text-sm text-gray-600">Explore roles from top companies who value commitment</p>
            </div>
            <Link to="/jobs" className="group text-emerald-600 font-bold text-xs md:text-sm flex items-center gap-2 hover:gap-3 transition-all">
              View All Jobs <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-50 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mt-6">
              {featuredJobs.map((job) => (
                <Link key={job._id} to={`/jobs/${job._id}`} className="group">
                  <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-[#1B4D3E] text-lg font-bold group-hover:bg-[#1B4D3E] group-hover:text-white transition-colors">
                        {job.company.charAt(0)}
                      </div>
                      {job.challengeFeeAmount > 0 && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold ring-1 ring-amber-200">
                          <Star className="w-3 h-3 fill-amber-500" />
                          ₹{job.challengeFeeAmount}
                        </div>
                      )}
                    </div>

                    <div className="flex-grow">
                      <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1 truncate group-hover:text-emerald-600 transition-colors">{job.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{job.company}</span>
                      </div>

                      <div className="flex flex-wrap gap-3 mb-4">
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-600">
                          <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                          {formatSalary(job.salary)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-4 border-t border-gray-50">
                      {job.skills.slice(0, 3).map((skill) => (
                        <span key={skill} className="px-2 py-0.5 rounded-md bg-gray-50 text-gray-600 text-[10px] font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 5: CHALLENGE FEE EXPLAINER */}
      <section className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white overflow-hidden relative py-8 md:py-10">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full"></div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="p-5 md:p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg md:text-xl font-bold heading-font mb-6">For Candidates</h3>
              <ul className="space-y-4">
                {[
                  'Stand out from hundreds of applications instantly',
                  'Get prioritized review from global recruiters',
                  '100% Refund if rejected or not reviewed in time',
                  'Your fee is returned upon successful hiring',
                  'Fee is only at risk if you fail to attend an interview'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/80 group">
                    <div className="mt-1 w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />
                    </div>
                    <span className="text-sm group-hover:text-white transition-colors">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 md:p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mb-6 border border-blue-500/30">
                <SearchCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg md:text-xl font-bold heading-font mb-6 text-blue-400">For Recruiters</h3>
              <ul className="space-y-4">
                {[
                  'Automatically filter committed candidates from causal browsers',
                  'Virtually eliminate interview no-shows with commitment signal',
                  'Instant quality signal for serious applicants',
                  'Save average 12+ hours per role on screening',
                  'Significantly better hiring conversion and retention rates'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/80 group">
                    <div className="mt-1 w-4 h-4 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-2.5 h-2.5 text-blue-400" />
                    </div>
                    <span className="text-sm group-hover:text-white transition-colors">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: TESTIMONIALS */}
      <section className="min-h-screen flex flex-col justify-center bg-[#FAFAF7] py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-6">
            <h2 className="text-2xl md:text-3xl font-bold heading-font mb-2 text-gray-900">What Our Users Say</h2>
            <p className="text-sm md:text-base text-gray-500">Real stories from candidates and recruiters who found success on TrustHire.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mt-6">
            {[
              { text: "The Challenge Fee helped me stand out in a crowded market. I got interview calls within 3 days and was hired as a Senior Developer.", name: "Priya S.", role: "Software Developer" },
              { text: "No more wasting time on uncommitted applicants. TrustHire filters for quality, not just quantity. Our time-to-hire dropped by 50%.", name: "Rahul M.", role: "HR Manager" },
              { text: "I was skeptical about the fee initially, but the transparency and refund system gave me confidence. I got refunded after being hired!", name: "Ankit K.", role: "Data Analyst" }
            ].map((t, i) => (
              <div key={i} className={`bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100 ${i > 0 ? 'hidden md:block' : ''}`}>
                <Quote className="w-6 h-6 text-emerald-500/20 mb-3" />
                <p className="text-sm text-gray-700 italic mb-4 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center font-bold text-emerald-600 text-xs">
                    {t.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{t.name}</h4>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: CTA BANNER */}
      <section className="h-auto py-10 md:py-14 bg-gradient-to-r from-[#1B4D3E] to-[#0F3D2E] flex items-center justify-center text-center">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold heading-font mb-4 text-white">Ready to Find Your Next Opportunity?</h2>
            <p className="text-sm md:text-base text-white/80 mb-6">Join thousands of professionals who trust TrustHire for a serious career journey.</p>
            
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <Link to="/register" className="px-5 py-2.5 text-sm bg-white text-[#1B4D3E] rounded-full font-bold hover:scale-105 transition-all shadow-xl">
                Get Started Free
              </Link>
              <Link to="/recruiter/register" className="px-5 py-2.5 text-sm border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition-all flex items-center gap-2">
                Post a Job <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
