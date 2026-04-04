import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Star, Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface JobFormData {
  title: string;
  description: string;
  company: string;
  location: string;
  type: string;
  salaryMin: number;
  salaryMax: number;
  experienceMin: number;
  experienceMax: number;
  challengeFeeAmount: number;
  challengeFeeDays: number;
  feeEnabled: boolean;
}

interface JobFormProps {
  job: any | null; 
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
}

const JobForm: React.FC<JobFormProps> = ({ job, onSubmit, loading }) => {
  const [skills, setSkills] = useState<string[]>(job?.skills || []);
  const [skillInput, setSkillInput] = useState('');

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<JobFormData>({
    defaultValues: {
      type: 'full-time',
      challengeFeeDays: 30,
      feeEnabled: job?.challengeFeeAmount > 0
    }
  });

  const feeEnabled = watch('feeEnabled');

  useEffect(() => {
    if (job) {
      reset({
        title: job.title,
        description: job.description,
        company: job.company,
        location: job.location,
        type: job.type,
        salaryMin: job.salary?.min || '',
        salaryMax: job.salary?.max || '',
        experienceMin: job.experienceRequired?.min || '',
        experienceMax: job.experienceRequired?.max || '',
        challengeFeeAmount: job.challengeFeeAmount || '',
        challengeFeeDays: job.challengeFeeDays || 30,
        feeEnabled: job.challengeFeeAmount > 0
      });
      setSkills(job.skills || []);
    }
  }, [job, reset]);

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      const val = skillInput.trim().toLowerCase();
      if (val && !skills.includes(val)) {
        setSkills([...skills, val]);
      }
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const submitHandler = async (data: JobFormData) => {
    if (skills.length === 0) {
      toast.error('Please add at least one skill');
      return;
    }

    const jobData = {
      title: data.title,
      description: data.description,
      company: data.company,
      location: data.location,
      type: data.type,
      salary: {
        min: Number(data.salaryMin),
        max: Number(data.salaryMax),
        currency: 'INR'
      },
      experienceRequired: {
        min: Number(data.experienceMin),
        max: Number(data.experienceMax)
      },
      skills,
      challengeFeeAmount: data.feeEnabled ? Number(data.challengeFeeAmount) : 0,
      challengeFeeDays: data.feeEnabled ? Number(data.challengeFeeDays) : 30
    };

    await onSubmit(jobData);
  };

  const inputClass = "w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-gray-900 placeholder:text-gray-400 transition-all";
  const labelClass = "block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider";

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-3">
      {/* Job Title */}
      <div>
        <label className={labelClass}>
          Job Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('title', { required: 'Job title is required' })}
          className={inputClass}
          placeholder="e.g. Senior React Developer"
        />
        {errors.title && (
          <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.title.message}</p>
        )}
      </div>

      {/* Company + Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('company', { required: 'Company name is required' })}
            className={inputClass}
            placeholder="e.g. TechCorp"
          />
          {errors.company && (
            <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.company.message}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>
            Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('location', { required: 'Location is required' })}
            className={inputClass}
            placeholder="e.g. Bangalore, India or Remote"
          />
          {errors.location && (
            <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.location.message}</p>
          )}
        </div>
      </div>

      {/* Job Type + Salary Range */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>
            Job Type <span className="text-red-500">*</span>
          </label>
          <select
            {...register('type', { required: 'Type is required' })}
            className={`${inputClass} bg-white`}
          >
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="remote">Remote</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Min Salary (₹)</label>
          <input
            type="number"
            {...register('salaryMin', { required: 'Required' })}
            className={inputClass}
            placeholder="500000"
          />
        </div>
        <div>
          <label className={labelClass}>Max Salary (₹)</label>
          <input
            type="number"
            {...register('salaryMax', { required: 'Required' })}
            className={inputClass}
            placeholder="1200000"
          />
        </div>
      </div>

      {/* Experience Range */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Min Experience (yrs)</label>
          <input
            type="number"
            {...register('experienceMin', { required: 'Required' })}
            className={inputClass}
            placeholder="0"
          />
        </div>
        <div>
          <label className={labelClass}>Max Experience (yrs)</label>
          <input
            type="number"
            {...register('experienceMax', { required: 'Required' })}
            className={inputClass}
            placeholder="5"
          />
        </div>
      </div>

      {/* Skills Tag Input */}
      <div>
        <label className={labelClass}>
          Required Skills <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap items-center gap-1.5 border border-gray-300 rounded-md px-3 py-1.5 bg-white min-h-[38px] focus-within:ring-1 focus-within:ring-[#2563EB] focus-within:border-[#2563EB] transition-all">
          {skills.map((skill, i) => (
            <span key={i} className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">
              {skill}
              <button type="button" onClick={() => removeSkill(i)} className="text-emerald-500 hover:text-emerald-700">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleAddSkill}
            className="flex-1 min-w-[100px] outline-none text-sm text-gray-900 bg-transparent"
            placeholder={skills.length === 0 ? "Type and press Enter" : "Add more..."}
          />
        </div>
      </div>

      {/* Description Area */}
      <div>
        <label className={labelClass}>
          Job Description <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('description', { 
            required: 'Description is required',
            minLength: { value: 100, message: 'Minimum 100 characters' }
          })}
          rows={4}
          className={`${inputClass} resize-none`}
          placeholder="Describe the role, responsibilities, and requirements..."
        />
        {errors.description && (
          <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.description.message}</p>
        )}
      </div>

      {/* Challenge Fee Box */}
      <div className="border border-amber-200 bg-amber-50 rounded-lg p-3 transition-all mt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-bold text-gray-900 uppercase tracking-tight">Challenge Fee</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" {...register('feeEnabled')} className="sr-only peer" />
            <div className="w-8 h-4.5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>

        {feeEnabled && (
          <div className="grid grid-cols-2 gap-3 mt-3 animate-fadeUp">
            <div>
              <label className="block text-[10px] font-bold text-amber-700 mb-1 uppercase tracking-wider">
                Fee Amount (₹)
              </label>
              <input
                type="number"
                {...register('challengeFeeAmount', { required: feeEnabled })}
                className="w-full px-3 py-1.5 text-sm border border-amber-200 rounded-md outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-gray-900 bg-white"
                placeholder="500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-amber-700 mb-1 uppercase tracking-wider">
                Refund Window (days)
              </label>
              <input
                type="number"
                {...register('challengeFeeDays', { required: feeEnabled })}
                className="w-full px-3 py-1.5 text-sm border border-amber-200 rounded-md outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-gray-900 bg-white"
                placeholder="30"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 flex-shrink-0">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-1.5 text-[11px] font-bold text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors uppercase tracking-widest"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-1.5 text-[11px] font-bold bg-[#1B4D3E] text-white rounded-md hover:bg-[#0F3D2E] disabled:opacity-50 flex items-center gap-2 transition-all shadow-md uppercase tracking-widest active:scale-95"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Plus className={`w-3.5 h-3.5 ${job ? 'rotate-45' : ''}`} />
              {job ? 'Update Job' : 'Post Job'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default JobForm;
