import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';
import { blogPosts, BlogPost } from '../data/blogPosts';

const Blog: React.FC = () => {
  return (
    <div className="bg-[#F8FAF9] min-h-screen pt-12 pb-24 animate-fadeIn">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 mb-20 text-center">
        <span className="inline-block px-4 py-1.5 rounded-full bg-[#1B4D3E]/10 text-[#1B4D3E] text-xs font-bold uppercase tracking-widest mb-6">
          Our Journal
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Insights for the Modern <br />
          <span className="text-[#1B4D3E]">Tech Industry</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-500 font-medium leading-relaxed">
          Discover the latest trends in tech recruitment, career advice, and 
          management best practices from our team of experts.
        </p>
      </div>

      {/* Featured Post */}
      <div className="max-w-7xl mx-auto px-4 mb-24">
        <Link 
          to={`/blog/${blogPosts[0].id}`}
          className="group block relative bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-500"
        >
          <div className="flex flex-col lg:flex-row min-h-[450px]">
            <div className="lg:w-1/2 overflow-hidden bg-slate-100">
              <img 
                src={blogPosts[0].image} 
                alt={blogPosts[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-6">
                <span className="px-3 py-1 rounded bg-[#1B4D3E] text-white text-[10px] font-bold uppercase tracking-wider">
                  Featured
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {blogPosts[0].category}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 group-hover:text-[#1B4D3E] transition-colors leading-tight">
                {blogPosts[0].title}
              </h2>
              <p className="text-slate-500 text-lg mb-8 leading-relaxed line-clamp-3">
                {blogPosts[0].excerpt}
              </p>
              <div className="flex items-center gap-6 mt-auto pt-8 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{blogPosts[0].author}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {blogPosts[0].role}
                    </p>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2 text-[#1B4D3E] font-bold text-sm">
                  Read Full Post
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Grid Posts */}
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-2xl font-bold text-slate-900 mb-12 flex items-center gap-3">
           Latest Articles
           <div className="h-0.5 bg-[#1B4D3E] w-12 rounded-full"></div>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {blogPosts.slice(1).map((post: BlogPost) => (
            <Link 
              key={post.id}
              to={`/blog/${post.id}`}
              className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-[#1B4D3E]/30 hover:shadow-xl transition-all duration-300"
            >
              <div className="h-56 overflow-hidden bg-slate-100">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-[#1B4D3E] uppercase tracking-widest bg-[#1B4D3E]/5 px-2 py-0.5 rounded">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readTime}
                  </div>
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-[#1B4D3E] transition-colors leading-snug">
                  {post.title}
                </h4>
                <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1.5 text-[#1B4D3E] text-xs font-bold uppercase tracking-widest group-hover:gap-3 transition-all">
                    Detail
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="max-w-7xl mx-auto px-4 mt-32">
        <div className="bg-[#1B4D3E] rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[80%] rounded-full bg-white blur-[120px]"></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[80%] rounded-full bg-white blur-[120px]"></div>
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Stay ahead in tech.</h2>
            <p className="text-white/70 text-lg mb-10 font-medium">Join 50k+ readers receiving our weekly digest on hiring, career growth, and market trends.</p>
            <div className="flex flex-col sm:flex-row gap-3 bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20">
              <input 
                type="email" 
                placeholder="Work email address" 
                className="flex-1 px-6 py-4 bg-transparent text-white outline-none placeholder:text-white/40 font-medium"
              />
              <button className="bg-white text-[#1B4D3E] px-10 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-lg active:scale-95">
                Join Community
              </button>
            </div>
            <p className="mt-6 text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">Zero Spam • One Email/Week • Opt-out anytime</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
