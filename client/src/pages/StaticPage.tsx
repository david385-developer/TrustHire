import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Mail, MapPin, MessageSquare, Send, Sparkles, Shield, Zap, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { staticPages } from '../data/staticPages';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Textarea from '../components/common/Textarea';

const StaticPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // Special case for Contact Page
  if (slug === 'contact') {
    const handleContactSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      toast.success('Strategy session requested! Our team will contact you within 24 hours.');
      const form = e.target as HTMLFormElement;
      form.reset();
    };

    return (
      <div className="min-h-screen pt-28 pb-20 bg-[#F8FAF9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
             <Link to="/" className="inline-flex items-center gap-2 text-emerald-600 hover:gap-3 transition-all font-bold mb-8 group">
               <ArrowLeft className="w-5 h-5" /> Return to Selection
             </Link>
             <h1 className="text-4xl md:text-6xl font-bold heading-font text-slate-900 mb-4">Connect with <span className="text-emerald-600">TrustHire</span></h1>
             <p className="text-xl text-slate-500 font-medium max-w-2xl">Have questions about our Priority Shield or Refund protocol? Our specialized support team is ready to assist your hiring journey.</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold heading-font text-slate-900 mb-8 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-emerald-500" /> Direct Channels
                </h3>
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 flex-shrink-0"><Mail className="w-6 h-6" /></div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email Protocol</p>
                      <a href="mailto:support@trusthire.in" className="text-lg font-bold text-slate-900 hover:text-emerald-600 transition-colors">support@trusthire.in</a>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0"><MapPin className="w-6 h-6" /></div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Global HQ</p>
                      <p className="text-lg font-bold text-slate-900 leading-tight">Remote-First Operations<br /><span className="text-slate-400 font-medium">Bhopal, India</span></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-[40px] text-white overflow-hidden relative group shadow-2xl">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-4">Priority Response</h3>
                  <p className="text-emerald-50/60 text-sm leading-relaxed mb-6 font-medium">Existing corporate partners and candidates with active Priority Shield status receive response times under 4 hours.</p>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Shield className="w-4 h-4" /> 24/7 Security Coverage
                  </div>
                </div>
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-emerald-500/10 blur-[60px] rounded-full"></div>
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl shadow-emerald-900/5 border border-slate-100">
                <form onSubmit={handleContactSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                       <Input placeholder="Enter your name" required className="rounded-2xl bg-slate-50 border-slate-100" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                       <Input type="email" placeholder="you@company.com" required className="rounded-2xl bg-slate-50 border-slate-100" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Reason for Inquiry</label>
                    <Select
                      required
                      options={[
                        { value: 'general', label: 'General Exploration' },
                        { value: 'support', label: 'Technical Protocol Assistance' },
                        { value: 'partnership', label: 'Strategic Partnership' },
                        { value: 'billing', label: 'Priority Fee & Refunds' }
                      ]}
                      className="rounded-2xl bg-slate-50 border-slate-100 h-14"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Message Body</label>
                    <Textarea
                      rows={6}
                      placeholder="Detail your inquiry here..."
                      required
                      maxLength={1000}
                      showCount
                      className="rounded-2xl bg-slate-50 border-slate-100"
                    />
                  </div>

                  <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 group active:scale-95">
                    Launch Inquiry <Send className="w-5 h-5 text-emerald-400 font-bold group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Special case for Blog Page
  if (slug === 'blog') {
    const defaultBlogs = [
      {
        title: "The Architecture of Trust in Modern Recruitment",
        date: "April 2, 2026",
        tag: "Strategy",
        icon: <Zap className="w-5 h-5 text-amber-500" />,
        excerpt: "Why the traditional application model is failing both recruiters and talent, and how intent-based signals are fixing it."
      },
      {
        title: "Eliminating No-Shows with Priority Protocols",
        date: "March 28, 2026",
        tag: "Insights",
        icon: <Shield className="w-5 h-5 text-emerald-500" />,
        excerpt: "The data behind the 70% decrease in interview drop-offs when candidates have skin in the game through refundable deposits."
      },
      {
        title: "Designing for High-Stake Career Decisions",
        date: "March 15, 2026",
        tag: "UX Design",
        icon: <Sparkles className="w-5 h-5 text-purple-500" />,
        excerpt: "How TrustHire's new interface prioritizes clarity, data hierarchy, and professional aesthetics for elite hiring."
      }
    ];

    return (
      <div className="min-h-screen pt-28 pb-20 bg-[#F8FAF9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="mb-16">
             <Link to="/" className="inline-flex items-center gap-2 text-emerald-600 hover:gap-3 transition-all font-bold mb-8 group">
               <ArrowLeft className="w-5 h-5" /> Return to Selection
             </Link>
             <h1 className="text-4xl md:text-6xl font-bold heading-font text-slate-900 mb-4">TrustHire <span className="text-emerald-600">Journal</span></h1>
             <p className="text-xl text-slate-500 font-medium max-w-2xl">Expert perspectives on the future of high-intent recruitment and professional trust engineering.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {defaultBlogs.map((blog, idx) => (
              <div key={idx} className="group bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-emerald-900/10 hover:-translate-y-2 transition-all cursor-pointer flex flex-col h-full" onClick={() => toast('Protocol restricted: Content coming soon!')}>
                <div className="flex items-center justify-between mb-8">
                   <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors">{blog.icon}</div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{blog.date}</span>
                </div>
                <div className="px-1 mb-8 flex-grow">
                   <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mb-4">{blog.tag}</span>
                   <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-4 group-hover:text-emerald-600 transition-colors">
                     {blog.title}
                   </h2>
                   <p className="text-slate-500 font-medium leading-relaxed">
                     {blog.excerpt}
                   </p>
                </div>
                <div className="pt-6 border-t border-slate-50 mt-auto flex items-center justify-between">
                   <span className="text-sm font-bold text-slate-400">Continue Reading</span>
                   <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white transform group-hover:translate-x-2 transition-all scale-0 group-hover:scale-100">
                     <ArrowRight className="w-5 h-5" />
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Standard Static Page Content
  const content = staticPages[slug || ''];

  if (!content) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[#F8FAF9]">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-8 animate-bounce"><AlertCircle className="w-12 h-12" /></div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Protocol Error: 404</h2>
        <p className="text-slate-500 font-medium mb-10 max-w-sm">The strategy page you are looking for has been moved or does not exist in the current deployment.</p>
        <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
          <ArrowLeft className="w-5 h-5" /> Return Base
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-emerald-600 hover:gap-3 transition-all font-bold mb-12 group">
          <ArrowLeft className="w-5 h-5" /> Home Selection
        </Link>
        <div className="mb-16">
          <h1 className="text-4xl md:text-6xl font-bold heading-font text-slate-900 mb-8 pb-10 border-b-4 border-emerald-500 inline-block">
            {content.title}
          </h1>
        </div>
        <div className="space-y-16 pb-20">
          {content.sections.map((section, idx) => (
            <div key={idx} className="animate-fadeUp" style={{ animationDelay: `${idx * 150}ms` }}>
               <h2 className="text-2xl md:text-3xl font-bold heading-font text-slate-900 mb-6 flex items-center gap-3">
                 <div className="w-2 h-8 bg-emerald-500 rounded-full" /> {section.heading}
               </h2>
               <div className="space-y-6">
                 {section.paragraphs?.map((p, i) => (
                   <p key={i} className="text-lg text-slate-600 leading-relaxed font-medium">
                     {p}
                   </p>
                 ))}
               </div>
            </div>
          ))}
        </div>
        <div className="bg-slate-50 p-10 rounded-[32px] border border-slate-100 text-center">
           <h3 className="text-xl font-bold text-slate-900 mb-4">Precision matters in every clause.</h3>
           <p className="text-slate-500 font-medium mb-8">For further clarification on our operational protocols, contact our strategy team.</p>
           <Link to="/contact">
             <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all">Connect with Support</button>
           </Link>
        </div>
      </div>
    </div>
  );
};

export default StaticPage;
