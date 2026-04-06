export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  role: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: 'commitment-driven-hiring',
    title: 'Why Commitment-Driven Hiring is the Future of Tech Recruitment',
    excerpt: 'Traditional hiring is broken. Discover how the commitment-driven model reduces churn and improves retention.',
    content: `
      <p>In today's fast-paced tech landscape, the average tenure of a software engineer at a Silicon Valley firm is less than two years. This high turnover rate costs companies billions in recruitment, training, and lost productivity.</p>
      
      <h2>The Problem with Traditional Hiring</h2>
      <p>Traditional hiring focuses heavily on skills and experience, often overlooking cultural fit and long-term commitment. Candidates are often lured by higher salaries and "perks" that don't satisfy the human need for stability and meaningful work.</p>
      
      <h2>What is Commitment-Driven Hiring?</h2>
      <p>TrustHire introduces a new paradigm: <strong>Commitment-Driven Hiring</strong>. By asking for an upfront commitment from both the employer and the employee, we create a bond that goes beyond the paycheck.</p>
      
      <ul>
        <li><strong>Vested Interest:</strong> Both parties have skin in the game.</li>
        <li><strong>Transparency:</strong> Clear expectations from day one.</li>
        <li><strong>Security:</strong> The Challenge Fee model ensures that only serious candidates apply.</li>
      </ul>

      <blockquote>"Commitment is what transforms a promise into reality."</blockquote>

      <p>As we move into 2024, the demand for stable, high-performing teams will only grow. TrustHire is here to help you build those teams.</p>
    `,
    author: 'David Smith',
    role: 'Founder, TrustHire',
    date: '2024-03-15',
    readTime: '5 min read',
    category: 'Industry Trends',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'surviving-the-technical-interview',
    title: 'Surviving the Technical Interview: 5 Tips from Top Recruiters',
    excerpt: 'Mastering the technical interview requires more than just coding skills. Learn the secrets of the trade.',
    content: `
      <p>The technical interview can be a daunting experience, even for seasoned developers. However, with the right approach, you can turn it into an opportunity to showcase your problem-solving skills and professional attitude.</p>
      
      <h2>1. Understand the "Why"</h2>
      <p>Recruiters care less about the correct syntax and more about your thought process. Talk through your solution as you write it. Explain why you chose one algorithm over another.</p>
      
      <h2>2. Master the Fundamentals</h2>
      <p>Don't just memorize LeetCode solutions. Understand the underlying data structures and time complexity. Be prepared to discuss trade-offs.</p>

      <h2>3. Communication is Key</h2>
      <p>A technical interview is a collaboration. Ask clarifying questions. If you're stuck, don't stay silent—explain where you're struggling.</p>

      <p>Check out our dashboard for more tools to help you succeed in your next interview.</p>
    `,
    author: 'Sarah Chen',
    role: 'Lead Recruiter',
    date: '2024-03-10',
    readTime: '8 min read',
    category: 'Career Advice',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'remote-work-best-practices',
    title: 'Remote Work in 2024: Best Practices for Managers',
    excerpt: 'Managing remote teams requires a shift in mindset. Here is how to keep your team engaged and productive.',
    content: `
      <p>Remote work is here to stay. While it offers flexibility, it also presents unique challenges for management. Trust is the foundation of any successful remote team.</p>
      
      <h2>Building a Culture of Trust</h2>
      <p>At TrustHire, we believe that transparency is the antidote to micromanagement. Set clear KPIs and focus on outcomes rather than hours worked.</p>
      
      <h2>Tools for Engagement</h2>
      <p>Use tools that encourage asynchronous communication. Reduce the number of synchronous meetings to prevent burnout.</p>

      <p>Our platform helps managers track recruitment progress without the need for constant check-ins.</p>
    `,
    author: 'Michael Ross',
    role: 'HR Consultant',
    date: '2024-03-05',
    readTime: '6 min read',
    category: 'Management',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=1200'
  }
];
