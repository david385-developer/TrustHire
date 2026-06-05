import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import AnimatedPage from '../components/common/AnimatedPage';

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

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
} as const;

const Home: React.FC = () => {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

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

  const formatSalary = (salary: { min: number; max: number; currency: string }) => {
    const formatAmount = (amount: number) => {
      if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
      return `${(amount / 1000).toFixed(0)}K`;
    };
    return `₹${formatAmount(salary.min)} - ₹${formatAmount(salary.max)}`;
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        
        {/* SECTION 1: HERO */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden hero-gradient py-20">
          <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none">
            <div className="absolute top-1/4 right-0 w-96 h-96 bg-indigo-500/25 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-10 left-10 w-80 h-80 bg-violet-500/20 blur-[100px] rounded-full"></div>
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              
              <motion.div 
                className="lg:col-span-7 space-y-6 text-left"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-wide uppercase rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                  <ShieldCheck className="w-3.5 h-3.5" /> Trust-Driven Recruitment Platform
                </span>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                  Your Commitment Is Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-400">Strongest Resume</span>
                </h1>
                
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                  In a market flooded by low-intent automated applications, stand out. Pay a refundable Challenge Fee to verify your genuine interest and get fast-tracked reviews.
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <Link to="/jobs" className="btn-primary px-8 py-3.5 text-base font-semibold shadow-lg shadow-indigo-500/20 dark:shadow-none hover:scale-[1.02] active:scale-[0.98]">
                    Browse Jobs <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a href="#how-it-works" className="btn-outline px-8 py-3.5 text-base font-semibold hover:scale-[1.02] active:scale-[0.98]">
                    How It Works
                  </a>
                </div>
              </motion.div>

              <motion.div 
                className="lg:col-span-5 relative hidden lg:block"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="relative space-y-6">
                  {/* Floating App Card 1 */}
                  <motion.div 
                    className="glass-card p-5 rounded-2xl shadow-xl w-72 ml-auto"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/50 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">Application Sent</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Priority review active</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Floating App Card 2 */}
                  <motion.div 
                    className="glass-card p-5 rounded-2xl shadow-xl w-72 mr-auto"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950/50 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Star className="w-5 h-5 fill-indigo-600 dark:fill-indigo-400" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">Challenge Fee Paid</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Escrow refund guaranteed</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* SECTION 2: STATS BAR */}
        <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">2,500+</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Jobs Posted</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">15,000+</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Verified Candidates</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">850+</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Top Companies</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">98%</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Refund Success Rate</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: HOW IT WORKS */}
        <section id="how-it-works" className="py-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">How TrustHire Works</h2>
              <p className="text-slate-500 dark:text-slate-400">A transparent commitment-based system designed to value everyone's time.</p>
            </div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-100px' }}
            >
              {[
                { icon: UserPlus, step: 1, title: "Create Your Profile", text: "Sign up and build your verified portfolio listing skills, experience, and uploaded resume." },
                { icon: Send, step: 2, title: "Apply with Commitment", text: "Browse jobs. Option to apply with a refundable Challenge Fee to flag your high-intent profile." },
                { icon: Trophy, step: 3, title: "Get Hired or Refunded", text: "Receive review or interview scheduling. The fee is fully refunded upon selection or rejection." }
              ].map((item, idx) => (
                <motion.div 
                  key={idx} 
                  variants={itemVariants}
                  className="glass-card rounded-2xl p-8 text-center relative border border-slate-200/50 dark:border-slate-800/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/40 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-6 relative">
                    <item.icon className="w-6 h-6" />
                    <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white dark:ring-slate-900">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{item.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* SECTION 4: FEATURED JOBS */}
        <section className="py-20 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Featured Opportunities</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Explore latest roles prioritizing committed candidates.</p>
              </div>
              <Link to="/jobs" className="group text-indigo-600 dark:text-indigo-400 font-semibold text-sm flex items-center gap-1.5 hover:underline">
                View All Jobs <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-60 rounded-2xl skeleton-shimmer bg-slate-100 dark:bg-slate-800"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredJobs.map((job) => (
                  <Link key={job._id} to={`/jobs/${job._id}`} className="group block">
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-6 hover-lift hover:border-indigo-200 dark:hover:border-indigo-900/50 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-lg font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                          {job.company.charAt(0)}
                        </div>
                        {job.challengeFeeAmount > 0 && (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-900/30">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                            ₹{job.challengeFeeAmount}
                          </span>
                        )}
                      </div>

                      <div className="flex-grow space-y-2">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 truncate">
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <Building2 className="w-4 h-4" />
                          <span>{job.company}</span>
                        </div>

                        <div className="flex flex-wrap gap-4 pt-2">
                          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
                            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                            {formatSalary(job.salary)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                        {job.skills.slice(0, 3).map((skill) => (
                          <span key={skill} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-[10px] font-medium border border-slate-200/20 dark:border-slate-800/40">
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

        {/* SECTION 5: ESCROW & SECURITY */}
        <section className="py-20 bg-slate-900 dark:bg-slate-950 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/10 blur-[120px] rounded-full"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-6">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold">For Candidates</h3>
                <ul className="space-y-4">
                  {[
                    'Stand out from the crowd of passive applicants instantly',
                    'Get priority review from recruiters within 7 days',
                    '100% Refund if rejected, hired, or not reviewed on time',
                    'Your fee is handled via secure payment gateways in escrow',
                    'Forfeiture occurs only in unexcused interview no-shows'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-300">
                      <CheckCircle className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-6">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                  <SearchCheck className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-emerald-400">For Recruiters</h3>
                <ul className="space-y-4">
                  {[
                    'Eliminate low-intent candidates and spam cover letters',
                    'Stop interview no-shows: candidates have skin in the game',
                    'Filter instantly by priority commitment tag',
                    'Save hours of manual resume vetting per role',
                    'Increase interview-to-hire conversion rates'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-300">
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 6: TESTIMONIALS */}
        <section className="py-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">What Our Users Say</h2>
              <p className="text-slate-500 dark:text-slate-400">Real stories from candidates and recruiters who found success on TrustHire.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { text: "The Challenge Fee helped me stand out in a crowded market. I got interview calls within 3 days and was hired as a Senior Developer.", name: "Priya S.", role: "Software Developer" },
                { text: "No more wasting time on uncommitted applicants. TrustHire filters for quality, not just quantity. Our time-to-hire dropped by 50%.", name: "Rahul M.", role: "HR Manager" },
                { text: "I was skeptical about the fee initially, but the transparency and refund system gave me confidence. I got refunded after being hired!", name: "Ankit K.", role: "Data Analyst" }
              ].map((t, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative flex flex-col justify-between text-left">
                  <div>
                    <Quote className="w-8 h-8 text-indigo-500/10 mb-4" />
                    <p className="text-slate-600 dark:text-slate-300 italic text-sm leading-relaxed mb-6">"{t.text}"</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 rounded-full flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 text-sm border border-indigo-100 dark:border-indigo-900/30">
                      {t.name.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 7: CTA BANNER */}
        <section className="py-20 bg-gradient-to-r from-indigo-900 to-indigo-950 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]"></div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Ready to Elevate Your Job Search?</h2>
            <p className="text-lg text-indigo-100/80 max-w-xl mx-auto">Join thousands of high-intent candidates and recruiters changing the hiring game.</p>
            
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link to="/register" className="btn-primary bg-white text-indigo-900 hover:bg-indigo-50 px-8 py-3.5 text-base font-semibold shadow-xl border border-transparent">
                Get Started Free
              </Link>
              <Link to="/register?role=recruiter" className="btn-outline border-white text-white hover:bg-white/10 px-8 py-3.5 text-base font-semibold">
                Post a Job <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </AnimatedPage>
  );
};

export default Home;
