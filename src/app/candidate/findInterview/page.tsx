'use client'

import { useState, useEffect } from 'react'
import { MapPin, Briefcase, DollarSign, LayoutGrid, List, Play, X, Clock, Globe, Calendar, Users } from 'lucide-react'
import Image from 'next/image'
import {
  Box,
  Card,
  Typography,
  Button,
  CircularProgress,
  Grid,
  Snackbar,
  Alert,
  IconButton,
  Chip,
  Modal,
  Skeleton,
  Avatar,
} from '@mui/material'
import { useInterviewStore } from '@/store/interview.store';
import { useTheme } from '@mui/material/styles'
import { useRouter } from 'next/navigation';

interface Interview {
  _id: string
  jobTitle: string
  requiredSkills: string[]
  status: 'open' | 'closed'
  postedDate: string
  location: string
  salary: string
  description: string
  isHired: boolean
  deadline?: string | null
  company: {
    companyName?: string
    industry?: string
    website?: string
    address?: string
    size?: string
    founded?: string
  } | string[]
}

// Create a new type that adds 'attended'
interface InterviewWithAttended extends Interview {
  attended: boolean
}



export default function FindInterviewPage() {
  const theme = useTheme()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [openSnackbar, setOpenSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const { findInterview, fetchAttendedInterviews } = useInterviewStore()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // ✅ view toggle state
  const [interviews, setInterviews] = useState<InterviewWithAttended[]>([]);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [candidateSkills, setCandidateSkills] = useState<string[]>([]);
  const [recommendedInterviews, setRecommendedInterviews] = useState<InterviewWithAttended[]>([]);
  const [allOtherInterviews, setAllOtherInterviews] = useState<InterviewWithAttended[]>([]);


  const fetchInterviews = async () => {
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user || user.role !== 'candidate') {
      setOpenSnackbar({
        open: true,
        message: 'You must be logged in as a candidate to get an interview',
        severity: 'error'
      });
      return [];
    }

    try {
      const res = await findInterview();
      if (!res.success) {
        throw new Error(res.message)
      }
      console.log("✅ Interview Fetched:", res.interview)
      return res.interview || [];
    } catch (err) {
      console.error(err);
      setOpenSnackbar({
        open: true,
        message: 'Failed to fetch interviews',
        severity: 'error'
      })
      return [];
    }
  }

  useEffect(() => {
    const loadInterviews = async () => {
      try {
        // Get candidate skills first from session storage (for display purposes)
        const userStr = sessionStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        let skills: string[] = [];

        if (user?.skills && Array.isArray(user.skills)) {
          skills = user.skills.map((s: any) => typeof s === 'string' ? s : s.name);
          console.log('🔍 Candidate skills raw:', skills);
          console.log('🔍 Normalized candidate skills:', skills);
          setCandidateSkills(skills);
        }

        // Fetch available interviews and attended in parallel
        const [data, res] = await Promise.all([
          fetchInterviews(),
          fetchAttendedInterviews(),
        ]);

        console.log('🔍 Raw data from fetchInterviews:', data);
        console.log('🔍 Raw res from fetchAttendedInterviews:', res);

        if (!data || data.length === 0) {
          console.log('⚠️ No interviews returned from API');
          setIsLoading(false);
          return;
        }

        console.log('🔍 All interviews from API:', data);

        // Build a Set of attended interview IDs as strings (avoids ObjectId vs string mismatch)
        const attendedIdSet = new Set();
        if (res.success && Array.isArray(res.interview)) {
          res.interview.forEach(function (a) {
            // Only hide the interview from the list if it was completely SUBMITTED.
            // If it is IN_PROGRESS, allow the candidate to Attend again to restart it.
            if (a.status !== 'SUBMITTED') return;

            var id = (a.interview && a.interview._id)
              ? a.interview._id.toString()
              : (a.interview ? a.interview.toString() : null);
            if (id) attendedIdSet.add(id);
          });
        }

        // Filter out already-attended interviews
        const availableInterviews = data.filter(function (inter: Interview) {
          const interId = inter._id && inter._id.toString ? inter._id.toString() : inter._id;
          const isAttended = attendedIdSet.has(interId);
          if (isAttended) {
            console.log('⏭️ Skipping attended interview:', inter.jobTitle, inter._id);
          }
          return !isAttended;
        }).map(function (inter: Interview) {
          return Object.assign({}, inter, { attended: false, isHired: false });
        });

        console.log('🔍 Available interviews after filtering:', availableInterviews.length);

        // Backend already filters by skill matching, so all returned interviews are "recommended"
        // We'll show them all in the Recommended section if skills exist
        // Otherwise show them in "All Available Interviews"

        if (skills.length > 0) {
          // Skills exist - show all as recommended (backend already filtered)
          setRecommendedInterviews(availableInterviews);
          setAllOtherInterviews([]);
        } else {
          // No skills - show all in "All Available Interviews"
          setRecommendedInterviews([]);
          setAllOtherInterviews(availableInterviews);
        }

        setInterviews(availableInterviews);

        console.log('🔍 Interviews found:', availableInterviews.length);
        console.log('🔍 Recommended:', availableInterviews.length);
      } catch (err) {
        console.error('loadInterviews error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInterviews();
  }, []);
  const handleCloseSnackbar = () => {
    setOpenSnackbar(prev => ({ ...prev, open: false }))
  }
  const [error, setError] = useState('')

  const { attendInterview } = useInterviewStore()
  const [startInterviewloading, setStartInterviewloading] = useState(false)
  const startInterview = async (interviewId: string) => {
    setStartInterviewloading(true)
    setError('')
    try {
      console.log('interviewId', interviewId)
      const response = await attendInterview(interviewId!)
      if (response.success === false) throw new Error(response.message || 'Failed to start interview')
      router.push(`/candidate/findInterview/${interviewId}?StartInterview=true`)
    } catch (err: any) {
      setError(err.message || 'Failed to start interview')
    } finally {
      setStartInterviewloading(false)
    }
  }


  function isCompanyObject(company: any): company is {
    companyName?: string;
    industry?: string;
    website?: string;
    address?: string;
    size?: string;
    founded?: string;
  } {
    return company && typeof company === 'object' && !Array.isArray(company);
  }

  // Render loading skeleton
  const renderSkeletonCard = (idx: number) => (
    <Card
      key={idx}
      sx={{
        pt: { xs: 3, sm: 4 },
        pl: { xs: 3, sm: 4 },
        pr: { xs: 3, sm: 4 },
        pb: 2,
        position: 'relative',
        width: viewMode === 'grid' ? { xs: '100%', sm: '48%', md: 'calc(33.333% - 16px)' } : '100%',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'column', md: viewMode === 'list' ? 'row' : 'column' },
        gap: 2,
      }}
    >
      <Skeleton
        variant="rounded"
        width={50}
        height={24}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          borderRadius: 2,
        }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Skeleton variant="text" width="60%" height={30} />
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          {Array.from(new Array(3)).map((_, i) => (
            <Skeleton key={i} variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
          ))}
        </Box>
      </Box>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {Array.from(new Array(3)).map((_, i) => (
          <Grid size={12} key={i}>
            <Skeleton variant="text" width="80%" height={20} />
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 2, width: '100%', maxWidth: 120 }}>
        <Skeleton variant="rectangular" width="100%" height={36} sx={{ borderRadius: 2 }} />
      </Box>
    </Card>
  );

  // Render interview card
  const renderInterviewCard = (inter: InterviewWithAttended) => (
    <Card
      key={inter._id}
      sx={{
        pt: { xs: 3, sm: 4 },
        pl: { xs: 3, sm: 4 },
        pr: { xs: 3, sm: 4 },
        pb: 2,
        position: 'relative',
        width: viewMode === 'grid' ? { xs: '100%', sm: '48%', md: 'calc(33.333% - 16px)' } : '100%',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'column', md: viewMode === 'list' ? 'row' : 'column' },
        justifyContent: 'space-between',
        backgroundColor: '#f9fafb',
        gap: 0,
        border: '1px solid #e2e8f0',
        boxShadow: theme.shadows[1],
        '&:hover': {
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          transform: 'translateY(-2px)',
          transition: 'all 0.3s ease',
        },
      }}
    >
      <Chip
        label={(() => {
          if (!inter.deadline) return 'Open'
          const d = new Date(inter.deadline)
          const now = new Date()
          if (d < now) return 'CLOSED'
          const hoursLeft = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60))
          if (hoursLeft < 24) return `${hoursLeft}h left`
          return `${Math.ceil(hoursLeft / 24)}d left`
        })()}
        sx={{
          position: 'absolute',
          top: { xs: 6, sm: 6, md: 10 },
          right: { xs: 6, sm: 6, md: 16 },
          fontWeight: 600,
          textTransform: 'uppercase',
          borderRadius: 2,
          px: { xs: 0.5, sm: 0.5, md: 1 },
          backgroundColor: (() => {
            if (!inter.deadline) return '#28bf5f'
            const d = new Date(inter.deadline)
            if (d < new Date()) return '#ef4444'
            return '#f59e0b'
          })(),
          color: '#fff',
          py: 0.5,
          fontSize: '0.75rem',
        }}
      />
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'column', md: viewMode === 'grid' ? 'column' : 'row' }, gap: viewMode === 'grid' ? 0 : 5 }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 0,
          pb: 2,
          borderBottom: '1px solid #e2e8f0'
        }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: theme.palette.primary.main,
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}
          >
            {isCompanyObject(inter.company)
              ? inter.company.companyName?.charAt(0) || 'C'
              : Array.isArray(inter.company) && inter.company[0]?.charAt(0) || 'C'}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                {isCompanyObject(inter.company)
                  ? inter.company.companyName || 'Company Name'
                  : Array.isArray(inter.company) && inter.company[0] || 'Company Name'}
              </Typography>
              {isCompanyObject(inter.company) && inter.company.industry && (
                <Chip
                  label={inter.company.industry}
                  size="small"
                  sx={{
                    backgroundColor: '#e2e8f0',
                    color: '#4a5568',
                    fontSize: '0.7rem',
                    height: 20,
                  }}
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              {isCompanyObject(inter.company) && inter.company.website && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Globe size={14} color="#64748b" />
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.primary.main,
                      '&:hover': { textDecoration: 'underline' },
                      cursor: 'pointer',
                      display: { xs: 'none', sm: 'block' }
                    }}
                    onClick={() => window.open((inter.company as { website?: string }).website, '_blank')}
                  >
                    Website
                  </Typography>
                </Box>
              )}
              {isCompanyObject(inter.company) && inter.company.address && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <MapPin size={14} color="#64748b" />
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    {inter.company.address}
                  </Typography>
                </Box>
              )}
              {isCompanyObject(inter.company) && inter.company.size && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Users size={14} color="#64748b" />
                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    {inter.company.size} employees
                  </Typography>
                </Box>
              )}
              {isCompanyObject(inter.company) && inter.company.founded && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Calendar size={14} color="#64748b" />
                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    Est. {new Date(inter.company.founded).getFullYear()}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'column' }, gap: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.text.primary, mb: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' }, whiteSpace: 'nowrap', mt: 1 }}>
            {inter.jobTitle}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5, alignItems: 'center' }}>
            {inter.requiredSkills.map((skill, idx) => (
              <Chip
                key={idx}
                label={skill}
                size="small"
                sx={{
                  backgroundColor: theme.palette.secondary.light,
                  color: 'white',
                  fontSize: '0.75rem',
                  height: 24,
                }}
              />
            ))}
          </Box>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
            {inter.description}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ gap: 1, alignItems: { xs: 'center', sm: 'center', md: viewMode === 'list' ? 'flex-end' : 'center' }, flexDirection: 'column', justifyContent: 'center', display: 'flex', position: { xs: 'static', sm: 'static', md: viewMode === 'list' ? 'relative' : 'static' } }}>
        <Box sx={{ display: 'flex', position: { xs: 'static', sm: 'static', md: viewMode === 'list' ? 'absolute' : 'static' }, top: { xs: 'auto', sm: 'auto', md: viewMode === 'list' ? '-50px' : 'auto' }, right: viewMode === 'list' ? '-10px' : 'auto', bottom: viewMode === 'list' ? 0 : 'auto', flexDirection: 'row', gap: 1, mt: viewMode === 'list' ? 0 : 1, borderTop: viewMode === 'list' ? 'none' : '1px solid #e2e8f0', borderBottom: viewMode === 'list' ? 'none' : '1px solid #e2e8f0', py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.text.secondary }}>
            <MapPin size={18} />
            <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>{inter.location}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.text.secondary }}>
            <DollarSign size={18} />
            <Typography variant="body2">{inter.salary}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.text.secondary }}>
            <Box sx={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </Box>
            <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
              {`${new Date(inter.postedDate).getUTCDate()} ${new Date(inter.postedDate).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })} ${new Date(inter.postedDate).getUTCFullYear()}`}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ position: { xs: 'static', sm: 'static', md: viewMode === 'list' ? 'absolute' : 'static' }, top: { xs: 'auto', sm: 'auto', md: viewMode === 'list' ? '70px' : 'auto' }, right: { xs: 'auto', sm: 'auto', md: viewMode === 'list' ? '-10px' : 'auto' }, }}>
          <Button
            variant="contained"
            onClick={() => setStartingId(inter._id)}
            startIcon={<Play size={16} />}
            sx={{
              whiteSpace: 'nowrap',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
              alignSelf: 'center',
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 20px ${theme.palette.primary.main}66`,
              },
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            Apply Now
          </Button>
        </Box>
      </Box>
      <Modal
        open={startingId === inter._id}
        onClose={() => setStartingId(null)}
        aria-labelledby="interview-prep-title"
        aria-describedby="interview-prep-description"
      >
        <Box
          sx={{
            position: 'absolute' as 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: 4,
            boxShadow: 24,
            minWidth: 300,
            maxWidth: 400,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography id="interview-prep-title" variant="h6" sx={{ fontWeight: 700 }}>
              Interview Preparation
            </Typography>
            <IconButton onClick={() => router.push('/candidate/findInterview')}>
              <X size={20} />
            </IconButton>
          </Box>
          <Typography id="interview-prep-description">
            Are you ready to start your interview? Make sure you have a stable internet connection.
          </Typography>
          {error && <Typography color="error">{error}</Typography>}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => router.push('/candidate/findInterview')}
              disabled={isLoading}
              sx={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => startInterview(inter._id)}
              disabled={isLoading || !!(inter.deadline && new Date(inter.deadline) < new Date())}
              sx={{
                flex: 1,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 20px ${theme.palette.primary.main}66`,
                },
              }}
            >
              {startInterviewloading ? <CircularProgress size={20} color="inherit" /> : 'Start Interview'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Card>
  );

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'column', md: 'row' }, alignItems: 'center', gap: 3 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.text.primary, mb: 2, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' } }}>
              Available Interviews
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
              Browse and apply for interview sessions posted by companies
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', sm: 'none', md: 'flex' } }}>
            <IconButton
              color={viewMode === 'grid' ? 'primary' : 'default'}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid />
            </IconButton>
            <IconButton
              color={viewMode === 'list' ? 'primary' : 'default'}
              onClick={() => setViewMode('list')}
            >
              <List />
            </IconButton>
          </Box>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'column', md: viewMode === 'grid' ? 'row' : 'column' }, flexWrap: 'wrap', gap: 3 }}>
            {Array.from(new Array(6)).map((_, idx) => renderSkeletonCard(idx))}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Recommended For You Section - shown when there are skill matches */}
            {recommendedInterviews.length > 0 && (
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.text.primary, mb: 3, fontSize: { xs: '1.5rem', md: '1.75rem' }, display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ position: 'relative', zIndex: 1, width: 40, height: 40, mr: 1 }}>
                    <Image src="/logo.svg" alt="SkillSense Logo" fill style={{ objectFit: 'contain' }} />
                  </Box>
                  Recommended For You
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                  Interviews matching your skills: {candidateSkills.join(', ')}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'column', md: viewMode === 'grid' ? 'row' : 'column' }, flexWrap: 'wrap', gap: 3 }}>
                  {recommendedInterviews.map((inter) => renderInterviewCard(inter))}
                </Box>
              </Box>
            )}

            {/* All Available Interviews Section - shown when there are non-matching interviews OR no skills in profile */}
            {(allOtherInterviews.length > 0 || (candidateSkills.length === 0 && interviews.length > 0)) && (
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.text.primary, mb: 3, fontSize: { xs: '1.5rem', md: '1.75rem' } }}>
                  <Briefcase size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                  {candidateSkills.length === 0 ? 'All Available Interviews' : 'Other Interviews'}
                </Typography>
                {candidateSkills.length === 0 && (
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                    Complete your profile with skills to get personalized recommendations
                  </Typography>
                )}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'column', md: viewMode === 'grid' ? 'row' : 'column' }, flexWrap: 'wrap', gap: 3 }}>
                  {allOtherInterviews.length > 0
                    ? allOtherInterviews.map((inter) => renderInterviewCard(inter))
                    : interviews.map((inter) => renderInterviewCard(inter))
                  }
                </Box>
              </Box>
            )}

            {/* Empty State */}
            {interviews.length === 0 && !isLoading && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '60vh',
                  width: '100%'
                }}
              >
                <Box
                  sx={{
                    textAlign: 'center',
                    maxWidth: 400,
                    p: 3,
                    border: `1px dashed ${theme.palette.divider}`,
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                    boxShadow: theme.shadows[1]
                  }}
                >
                  <Briefcase
                    size={48}
                    color={theme.palette.text.secondary}
                    style={{ marginBottom: 16, opacity: 0.8 }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: theme.palette.primary.main
                    }}
                  >
                    No Interviews Available
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.primary.main,
                      mb: 3
                    }}
                  >
                    Please wait until companies post interviews. Once available, you can browse and apply to relevant sessions.
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        )}
        {/* Success/Error Snackbar */}
        <Snackbar
          open={openSnackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={openSnackbar.severity as 'success' | 'error'}
            sx={{ width: '100%' }}
          >
            {openSnackbar.message}
          </Alert>
        </Snackbar>


      </Box>


    </>
  )
}
