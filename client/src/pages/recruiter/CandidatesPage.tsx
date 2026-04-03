import React, { useEffect, useMemo, useState } from 'react';
import { Filter, Mail, MapPin, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import api, { buildAssetUrl } from '../../services/api';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCard } from '../../components/common/Skeleton';

interface Candidate {
  _id: string;
  name: string;
  email: string;
  location?: string;
  skills?: string[];
  experience?: number;
  qualification?: string;
  stream?: string;
  latestApplicationId?: string;
  latestJobTitle?: string;
  latestStatus?: string;
  applicationCount?: number;
  resume?: string;
}

const CandidatesPage: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const response = await api.get('/applications/recruiter/candidates');
        setCandidates(Array.isArray(response.data?.data) ? response.data.data : []);
      } catch (error: any) {
        setCandidates([]);
        toast.error(error.response?.data?.message || 'Failed to load candidates');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const filteredCandidates = useMemo(
    () =>
      candidates.filter((candidate) => {
        const query = searchTerm.toLowerCase();
        return (
          candidate.name?.toLowerCase().includes(query) ||
          candidate.email?.toLowerCase().includes(query) ||
          candidate.skills?.some((skill) => skill.toLowerCase().includes(query)) ||
          candidate.location?.toLowerCase().includes(query)
        );
      }),
    [candidates, searchTerm]
  );

  const shortlistCandidate = async (candidate: Candidate) => {
    if (!candidate.latestApplicationId) {
      toast.error('No application found to shortlist');
      return;
    }

    try {
      await api.put(`/applications/${candidate.latestApplicationId}/status`, { status: 'shortlisted' });
      toast.success(`${candidate.name} shortlisted`);
      setCandidates((current) =>
        current.map((item) =>
          item._id === candidate._id ? { ...item, latestStatus: 'shortlisted' } : item
        )
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to shortlist candidate');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Talent Pool</h1>
          <p className="text-slate-500 text-sm">Browse candidates who have applied to your jobs and take action quickly.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" icon={<Filter className="w-4 h-4" />}>Applicants Only</Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by candidate name, skill, or location..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((index) => <SkeletonCard key={index} />)}
        </div>
      ) : filteredCandidates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <Card key={candidate._id} hover className="group border border-slate-200 hover:border-blue-200 shadow-none transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  {candidate.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{candidate.name}</h3>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                    {candidate.latestJobTitle || 'Candidate'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{candidate.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{candidate.location || 'Not provided'}</span>
                </div>
                <p className="text-sm text-slate-600">
                  <strong>Experience:</strong> {typeof candidate.experience === 'number' ? `${candidate.experience} years` : 'Not provided'}
                </p>
                <p className="text-sm text-slate-600">
                  <strong>Applications:</strong> {candidate.applicationCount || 0}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {(candidate.skills || []).slice(0, 4).map((skill) => (
                  <Badge key={skill} variant="default" className="text-[10px] bg-slate-50 border-slate-200 text-slate-600 rounded-md uppercase tracking-wider font-bold">
                    {skill}
                  </Badge>
                ))}
                {!candidate.skills?.length && (
                  <span className="text-xs text-slate-400 font-medium">No skills added yet</span>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                {candidate.latestApplicationId ? (
                  <Link to={`/recruiter/applications`} className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-md">
                      View Pipeline
                    </Button>
                  </Link>
                ) : (
                  <Button variant="ghost" size="sm" className="flex-1 text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-md" disabled>
                    No Application
                  </Button>
                )}
                {candidate.resume ? (
                  <a href={buildAssetUrl(candidate.resume)} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full rounded-md">Resume</Button>
                  </a>
                ) : (
                  <Button variant="secondary" size="sm" className="flex-1 rounded-md" disabled>Resume</Button>
                )}
                <Button variant="primary" size="sm" className="flex-1 rounded-md" onClick={() => shortlistCandidate(candidate)}>
                  Shortlist
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No candidates found"
          description={searchTerm ? 'No candidates match your search criteria.' : "You don't have any candidates in your talent pool yet."}
          compact
        />
      )}
    </div>
  );
};

export default CandidatesPage;
