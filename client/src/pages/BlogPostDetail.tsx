import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Clock, Share2, Twitter, Linkedin, MessageCircle } from 'lucide-react';
import { blogPosts, BlogPost } from '../data/blogPosts';

const BlogPostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const post = blogPosts.find((p: BlogPost) => p.id === id);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="bg-[#F8FAF9] min-h-screen pt-20 pb-32 animate-fadeIn">
      {/* Progress Bar Container - Fixed at Top */}
      <div className="fixed top-16 left-0 w-full h-1 z-50 bg-[#1B4D3E]/5 pointer-events-none">
        <div className="h-full bg-[#1B4D3E] shadow-sm shadow-[#1B4D3E]/50 animate-expand-width"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        {/* Navigation */}
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-12 font-medium text-sm transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Journal
        </Link>

        {/* Header Section */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <span className="px-3 py-1 rounded bg-[#1B4D3E]/10 text-[#1B4D3E] text-[10px] font-bold uppercase tracking-widest">
              {post.category}
            </span>
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              <span className="w-1 h-1 bg-slate-300 rounded-full mx-1"></span>
              <Clock className="w-3.5 h-3.5" />
              {post.readTime}
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-10 leading-[1.1] tracking-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-200/50 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm ring-4 ring-slate-50 transition-transform hover:scale-105 cursor-pointer">
                <User className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{post.author}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                   {post.role}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2.5 rounded-full bg-slate-50 text-slate-400 hover:bg-[#1B4D3E]/10 hover:text-[#1B4D3E] transition-all border border-slate-100 shadow-sm active:scale-90">
                 <Share2 className="w-4 h-4" />
              </button>
              <button className="p-2.5 rounded-full bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100 shadow-sm active:scale-90">
                 <Twitter className="w-4 h-4" />
              </button>
               <button className="p-2.5 rounded-full bg-slate-50 text-slate-400 hover:bg-sky-50 hover:text-sky-600 transition-all border border-slate-100 shadow-sm active:scale-90">
                 <Linkedin className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="mb-16 rounded-[40px] overflow-hidden shadow-2xl border border-white/20 aspect-[16/9] animate-fadeInUp">
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-[20s] hover:scale-110"
          />
        </div>

        {/* Article Body */}
        <article className="bg-white rounded-[40px] p-8 md:p-16 border border-slate-200/50 shadow-xl shadow-slate-200/20 mb-20 animate-fadeInUp delay-200">
          <div 
            className="prose prose-lg prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:text-slate-900 prose-a:text-[#1B4D3E] prose-blockquote:border-l-4 prose-blockquote:border-[#1B4D3E] prose-blockquote:bg-slate-50 prose-blockquote:p-6 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-img:rounded-3xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Footer of the Post */}
        <div className="border-t border-slate-200 pt-16 flex flex-col items-center text-center">
           <div className="w-1.5 h-1.5 bg-[#1B4D3E] rounded-full mb-12 shadow-md"></div>
           <h3 className="text-2xl font-bold text-slate-900 mb-8">What are your thoughts?</h3>
           <div className="flex flex-wrap justify-center gap-4">
              <button className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 rounded-full font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95">
                 <MessageCircle className="w-5 h-5 text-slate-400" />
                 Leave a Comment
              </button>
              <button className="flex items-center gap-2 px-8 py-4 bg-[#1B4D3E] border border-[#1B4D3E] rounded-full font-bold text-white hover:bg-[#0F3D2E] transition-all shadow-xl active:scale-95">
                 Apply for Tech Jobs
              </button>
           </div>
        </div>

        {/* More Posts Suggestion */}
        <div className="mt-32">
           <div className="flex items-center justify-between mb-12">
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">You might also like</h3>
              <Link to="/blog" className="text-xs font-bold text-[#1B4D3E] uppercase tracking-widest hover:underline">View Journal</Link>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {blogPosts.filter((p: BlogPost) => p.id !== post.id).slice(0, 2).map((p: BlogPost) => (
                <Link key={p.id} to={`/blog/${p.id}`} className="group space-y-6 block">
                  <div className="aspect-[16/10] overflow-hidden rounded-3xl border border-slate-100 shadow-sm group-hover:shadow-lg transition-all">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-[#1B4D3E] uppercase tracking-widest">{p.category}</span>
                    <h4 className="text-xl font-bold text-slate-900 group-hover:text-[#1B4D3E] transition-colors line-clamp-2">{p.title}</h4>
                  </div>
                </Link>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostDetail;
