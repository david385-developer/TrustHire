import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Tag from '../common/Tag';

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
}

interface JobFormProps {
  job: any | null; // null for create mode, object for edit mode
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
}

const JobForm: React.FC<JobFormProps> = ({ job, onSubmit, loading }) => {
  const [skills, setSkills] = useState<string[]>(job?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [enableFee, setEnableFee] = useState(job?.challengeFeeAmount > 0);

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<JobFormData>({
    defaultValues: {
      challengeFeeDays: 30
    }
  });

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
        challengeFeeDays: job.challengeFeeDays || 30
      });
      setSkills(job.skills || []);
      setEnableFee(job.challengeFeeAmount > 0);
    }
  }, [job, reset]);

  const description = watch('description');

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim().toLowerCase())) {
        setSkills([...skills, skillInput.trim().toLowerCase()]);
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
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
      challengeFeeAmount: enableFee ? Number(data.challengeFeeAmount) : 0,
      challengeFeeDays: enableFee ? Number(data.challengeFeeDays) : 30
    };

    await onSubmit(jobData);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)}>
      <Card className="mb-6">
        <h2 className="text-xl font-serif text-gray-900 mb-6">
          Basic Information
        </h2>
        <div className="space-y-4">
          <Input
            label="Job Title"
            placeholder="e.g., Senior React Developer"
            error={errors.title?.message}
            {...register('title', { required: 'Job title is required' })}
          />

          <Input
            label="Company Name"
            placeholder="Your company name"
            error={errors.company?.message}
            {...register('company', { required: 'Company name is required' })}
          />

          <Input
            label="Location"
            placeholder="e.g., Mumbai, India or Remote"
            error={errors.location?.message}
            {...register('location', { required: 'Location is required' })}
          />

          <Select
            label="Job Type"
            error={errors.type?.message}
            {...register('type', { required: 'Job type is required' })}
            options={[
              { value: '', label: 'Select job type' },
              { value: 'full-time', label: 'Full-time' },
              { value: 'part-time', label: 'Part-time' },
              { value: 'contract', label: 'Contract' },
              { value: 'remote', label: 'Remote' }
            ]}
          />
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="text-xl font-serif text-gray-900 mb-6">
          Salary & Experience
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salary Range (INR per year)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Minimum (e.g., 1200000)"
                error={errors.salaryMin?.message}
                {...register('salaryMin', {
                  required: 'Minimum salary is required',
                  min: { value: 0, message: 'Must be positive' }
                })}
              />
              <Input
                type="number"
                placeholder="Maximum (e.g., 1800000)"
                error={errors.salaryMax?.message}
                {...register('salaryMax', {
                  required: 'Maximum salary is required',
                  min: { value: 0, message: 'Must be positive' }
                })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience Required (years)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Minimum (e.g., 3)"
                error={errors.experienceMin?.message}
                {...register('experienceMin', {
                  required: 'Minimum experience is required',
                  min: { value: 0, message: 'Must be positive' }
                })}
              />
              <Input
                type="number"
                placeholder="Maximum (e.g., 7)"
                error={errors.experienceMax?.message}
                {...register('experienceMax', {
                  required: 'Maximum experience is required',
                  min: { value: 0, message: 'Must be positive' }
                })}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="text-xl font-serif text-gray-900 mb-6">
          Skills & Description
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Skills
            </label>
            <Input
              placeholder="Type a skill and press Enter"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
            />
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {skills.map((skill) => (
                  <Tag
                    key={skill}
                    label={skill}
                    onRemove={() => handleRemoveSkill(skill)}
                    variant="primary"
                  />
                ))}
              </div>
            )}
          </div>

          <Textarea
            label="Job Description"
            placeholder="Describe the role, responsibilities, and requirements..."
            rows={10}
            showCount
            maxCount={2000}
            maxLength={2000}
            value={description}
            error={errors.description?.message}
            {...register('description', {
              required: 'Job description is required',
              minLength: { value: 100, message: 'Description must be at least 100 characters' }
            })}
          />
        </div>
      </Card>

      <Card className="mb-6 border-2 border-[var(--dashboard-accent)]">
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            id="enableFee"
            checked={enableFee}
            onChange={(e) => setEnableFee(e.target.checked)}
            className="w-4 h-4 text-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] border-gray-300 rounded"
          />
          <label htmlFor="enableFee" className="text-xl font-serif text-gray-900">
            Enable Challenge Fee
          </label>
        </div>

        {enableFee && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <Input
              label="Challenge Fee Amount (₹)"
              type="number"
              placeholder="e.g., 500"
              error={errors.challengeFeeAmount?.message}
              {...register('challengeFeeAmount', {
                required: enableFee ? 'Fee amount is required' : false,
                min: { value: 100, message: 'Minimum fee is ₹100' },
                max: { value: 5000, message: 'Maximum fee is ₹5000' }
              })}
            />

            <Input
              label="Auto-refund if not reviewed within (days)"
              type="number"
              placeholder="30"
              error={errors.challengeFeeDays?.message}
              {...register('challengeFeeDays', {
                required: enableFee ? 'Days is required' : false,
                min: { value: 7, message: 'Minimum 7 days' },
                max: { value: 90, message: 'Maximum 90 days' }
              })}
            />

            <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100">
              Candidates who pay this fee will receive prioritized review for this position. The fee is fully refundable as per our policy.
            </p>
          </div>
        )}
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
        >
          {job ? 'Update Job Posting' : 'Post Job Now'}
        </Button>
      </div>
    </form>
  );
};

export default JobForm;
