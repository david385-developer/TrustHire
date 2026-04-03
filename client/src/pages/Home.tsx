import React, { useEffect, useState, useRef } from 'react'; // TrustHire Landing Page — v2.1.0
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  CheckCircle,
  Users,
  Building2,
  ShieldCheck,
  DollarSign,
  UserPlus,
  Send,
  Trophy,
  MapPin,
  Star,
  Quote,
  SearchCheck
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
        const response = await api.get('/jobs?limit=6&sort=-createdAt');
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
      <section className="relative min-h-[100vh] flex items-center pt-20 overflow-hidden bg-gradient-to-br from-[#0F3D2E] to-[#1B4D3E]">
        {/* Decorative background elements — BEHIND text */}
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-emerald-500/20 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full"></div>
          <div className="absolute inset-0 hero-pattern opacity-10"></div>
        </div>

        {/* Text content — ON TOP of background */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 flex items-center w-full">
          <div className="grid lg:grid-cols-12 gap-16 items-center w-full">
            <div className="lg:col-span-7">
              <span className="inline-block text-white/80 text-sm font-medium mb-8 px-4 py-1.5 border border-white/30 rounded-full backdrop-blur-sm">
                ✦ Trust-Driven Hiring Platform
              </span>
              
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight heading-font">
                Your Commitment Is Your <span className="text-emerald-400">Strongest Resume</span>
              </h1>
              
              <p className="text-lg md:text-xl text-white/80 mb-12 leading-relaxed max-w-xl body-font">
                In a world of AI-polished applications, stand out with genuine commitment. Pay an optional Challenge Fee to show recruiters you mean business.
              </p>

              <div className="flex flex-wrap gap-5">
                <Link to="/jobs" className="px-10 py-5 bg-white text-[#1B4D3E] rounded-full text-lg font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-950/20 flex items-center justify-center">
                  Browse Jobs
                </Link>
                <a href="#how-it-works" className="px-10 py-5 border-2 border-white text-white rounded-full text-lg font-bold hover:bg-white/10 transition-all flex items-center justify-center">
                  How It Works
                </a>
              </div>
            </div>

            <div className="lg:col-span-12 relative hidden lg:block lg:col-start-8 lg:col-end-13">
              <div className="relative space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-2xl animate-float-rotate origin-left max-w-xs ml-auto">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Application Submitted</p>
                      <p className="text-sm text-slate-500">Priority review active ✓</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-2xl animate-float-rotate delay-700 max-w-xs mr-auto">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                      <Star className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Challenge Fee: ₹500</p>
                      <p className="text-sm text-slate-500">Commitment verified</p>
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
      <section ref={statsRef} className="py-8 md:py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <p className="text-center text-gray-400 font-bold uppercase tracking-widest text-xs mb-8">Trusted by thousands of professionals</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="text-center group">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-6 transition-transform">
                <Briefcase className="w-8 h-8" />
              </div>
              <p className={`text-5xl font-bold heading-font text-[#1B4D3E] mb-2 ${statsVisible ? 'animate-fadeUp' : 'opacity-0'}`}>2,500+</p>
              <p className="text-gray-600 font-medium tracking-wide">Jobs Posted</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6 transition-transform">
                <Users className="w-8 h-8" />
              </div>
              <p className={`text-5xl font-bold heading-font text-[#1B4D3E] mb-2 ${statsVisible ? 'animate-fadeUp' : 'opacity-0'}`} style={{ animationDelay: '100ms' }}>15,000+</p>
              <p className="text-gray-600 font-medium tracking-wide">Candidates</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mx-auto mb-6 transition-transform">
                <Building2 className="w-8 h-8" />
              </div>
              <p className={`text-5xl font-bold heading-font text-[#1B4D3E] mb-2 ${statsVisible ? 'animate-fadeUp' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>850+</p>
              <p className="text-gray-600 font-medium tracking-wide">Companies</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mx-auto mb-6 transition-transform">
                <Star className="w-8 h-8" />
              </div>
              <p className={`text-5xl font-bold heading-font text-[#1B4D3E] mb-2 ${statsVisible ? 'animate-fadeUp' : 'opacity-0'}`} style={{ animationDelay: '300ms' }}>98%</p>
              <p className="text-gray-600 font-medium tracking-wide">Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section id="how-it-works" className="py-12 md:py-16 bg-[#FAFAF7]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold heading-font text-gray-900 mb-4">How TrustHire Works</h2>
            <p className="text-gray-600">Three simple steps to your next opportunity. We focus on commitment, transparency, and results.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 border-t-2 border-dashed border-emerald-200"></div>
            
            <div className="relative text-center group">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-lg flex items-center justify-center text-emerald-600 mx-auto mb-10 group-hover:scale-110 transition-all border border-emerald-50">
                <UserPlus className="w-10 h-10" />
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
              </div>
              <h3 className="text-2xl font-bold heading-font text-gray-900 mb-4">Create Your Profile</h3>
              <p className="text-gray-600 leading-relaxed">Sign up and build your professional profile with skills, experience, and resume.</p>
            </div>

            <div className="relative text-center group">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-lg flex items-center justify-center text-emerald-600 mx-auto mb-10 group-hover:scale-110 transition-all border border-emerald-50">
                <Send className="w-10 h-10" />
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
              </div>
              <h3 className="text-2xl font-bold heading-font text-gray-900 mb-4">Apply with Confidence</h3>
              <p className="text-gray-600 leading-relaxed">Browse jobs and apply. Add an optional Challenge Fee to signal commitment and get prioritized review.</p>
            </div>

            <div className="relative text-center group">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-lg flex items-center justify-center text-emerald-600 mx-auto mb-10 group-hover:scale-110 transition-all border border-emerald-50">
                <Trophy className="w-10 h-10" />
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
              </div>
              <h3 className="text-2xl font-bold heading-font text-gray-900 mb-4">Get Hired or Refunded</h3>
              <p className="text-gray-600 leading-relaxed">Your fee is refunded if rejected or hired. You only lose it if you skip your interview.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: FEATURED JOBS */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold heading-font text-gray-900 mb-2">Featured Opportunities</h2>
              <p className="text-gray-600">Explore roles from top companies who value commitment</p>
            </div>
            <Link to="/jobs" className="group text-emerald-600 font-bold text-sm flex items-center gap-2 hover:gap-4 transition-all">
              View All Jobs <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-72 bg-gray-50 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredJobs.map((job) => (
                <Link key={job._id} to={`/jobs/${job._id}`} className="group">
                  <div className="h-full bg-white border border-gray-100 rounded-3xl p-8 shadow-sm group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-300 flex flex-col">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#1B4D3E] text-xl font-bold group-hover:bg-[#1B4D3E] group-hover:text-white transition-colors">
                        {job.company.charAt(0)}
                      </div>
                      {job.challengeFeeAmount > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 text-xs font-bold ring-1 ring-amber-200">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          ₹{job.challengeFeeAmount}
                        </div>
                      )}
                    </div>

                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-emerald-600 transition-colors">{job.title}</h3>
                      <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                        <Building2 className="w-4 h-4" />
                        <span>{job.company}</span>
                      </div>

                      <div className="flex flex-wrap gap-4 mb-6">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          {formatSalary(job.salary)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-50">
                      {job.skills.slice(0, 3).map((skill) => (
                        <span key={skill} className="px-3 py-1 rounded-lg bg-gray-50 text-gray-600 text-[10px] font-bold uppercase tracking-wider">
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
      <section className="py-12 md:py-16 bg-[#0F3D2E] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full"></div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-8 border border-emerald-500/30">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-bold heading-font mb-8">For Candidates</h3>
              <ul className="space-y-6">
                {[
                  'Stand out from hundreds of applications instantly',
                  'Get prioritized review from global recruiters',
                  '100% Refund if rejected or not reviewed in time',
                  'Your fee is returned upon successful hiring',
                  'Fee is only at risk if you fail to attend an interview'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-white/80 group">
                    <div className="mt-1 w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-lg group-hover:text-white transition-colors">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mb-8 border border-blue-500/30">
                <SearchCheck className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-bold heading-font mb-8 text-blue-400">For Recruiters</h3>
              <ul className="space-y-6">
                {[
                  'Automatically filter committed candidates from causal browsers',
                  'Virtually eliminate interview no-shows with commitment signal',
                  'Instant quality signal for thousands of serious applicants',
                  'Save average 12+ hours per role on screening',
                  'Significantly better hiring conversion and retention rates'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-white/80 group">
                    <div className="mt-1 w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <span className="text-lg group-hover:text-white transition-colors">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: TESTIMONIALS */}
      <section className="py-12 md:py-16 bg-[#FAFAF7]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 text-gray-900">
            <h2 className="text-3xl md:text-4xl font-bold heading-font mb-4 text-gray-900">What Our Users Say</h2>
            <p className="text-gray-600">Real stories from candidates and recruiters who found success on TrustHire.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { text: "The Challenge Fee helped me stand out in a crowded market. I got interview calls within 3 days and was hired as a Senior Developer.", name: "Priya S.", role: "Software Developer", color: "emerald" },
              { text: "No more wasting time on uncommitted applicants. TrustHire filters for quality, not just quantity. Our time-to-hire dropped by 50%.", name: "Rahul M.", role: "HR Manager", color: "blue" },
              { text: "I was skeptical about the fee initially, but the transparency and refund system gave me confidence. I got refunded after being hired!", name: "Ankit K.", role: "Data Analyst", color: "amber" }
            ].map((t, i) => (
              <div key={i} className="bg-white p-10 rounded-3xl shadow-sm border-l-4 border-emerald-500 hover:shadow-xl transition-all group">
                <Quote className="w-12 h-12 text-gray-100 mb-6 group-hover:text-emerald-500 transition-colors" />
                <p className="text-lg text-gray-700 italic mb-10 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-400">{t.name.split(' ').map(n=>n[0]).join('')}</div>
                  <div>
                    <h4 className="font-bold text-gray-900">{t.name}</h4>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: CTA BANNER */}
      <section className="py-12 md:py-16 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-[40px] bg-gradient-to-br from-[#0F3D2E] to-[#1B4D3E] p-8 md:p-16 overflow-hidden text-center text-white shadow-2xl">
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-bold heading-font mb-8">Ready to Find Your Next Opportunity?</h2>
              <p className="text-xl text-white/80 mb-12">Join thousands of professionals who trust TrustHire for a serious career journey.</p>
              
              <div className="flex flex-wrap justify-center gap-6">
                <Link to="/register" className="px-10 py-5 bg-white text-[#1B4D3E] rounded-full text-lg font-bold hover:scale-105 transition-all shadow-xl">
                  Get Started Free
                </Link>
                <Link to="/recruiter/register" className="px-10 py-5 border-2 border-white text-white rounded-full text-lg font-bold hover:bg-white/10 transition-all flex items-center gap-3">
                  Post a Job <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
