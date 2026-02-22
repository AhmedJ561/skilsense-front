'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, BookOpen, Award, RefreshCw, Trash2 } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import { useDashboardStore } from '@/store/dashboard.store'
import type {
  DashboardStats,
  SkillProficiency,
  InterviewRecord,
  MockInterviewHistory,
  MockFeedback,
} from '@/store/dashboard.store'
import { Skill } from '@/types'
import { useRouter } from 'next/navigation'

export default function CandidateDashboard() {
  const theme = useTheme()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Data states
  const [skills, setSkills] = useState<Skill[]>([])
  const [attendedInterviews, setAttendedInterviews] = useState<InterviewRecord[]>([])
  const [mockHistory, setMockHistory] = useState<MockInterviewHistory[]>([])
  const [overallFeedback, setOverallFeedback] = useState<MockFeedback | undefined>(undefined)

  // Computed states
  const [stats, setStats] = useState<DashboardStats>({
    totalInterviews: 0,
    completedInterviews: 0,
    averageScore: 0,
    improvement: 0,
    skillsCount: 0,
  })
  const [performanceTrend, setPerformanceTrend] = useState<
    Array<{ month: string; score: number; interviewCount?: number }>
  >([])
  const [skillProficiency, setSkillProficiency] = useState<SkillProficiency[]>([])

  // Fetch all dashboard data
  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    setError(null)

    try {
      // Fetch all data in parallel
      const store = useDashboardStore.getState()
      const [profileData, interviewsData, mockHistoryData, feedbackData] = await Promise.all([
        store.fetchUserProfile(),
        store.fetchAttendedInterviews(),
        store.fetchMockInterviewHistory(),
        store.fetchOverallMockFeedback(),
      ])

      // Process profile data
      if (profileData.success && profileData.user) {
        setSkills(profileData.user.skills || [])

        // Calculate skill proficiency from user skills
        const proficiency = (profileData.user.skills || []).map((skill: Skill) => ({
          name: skill.name,
          level: getSkillLevelNumber(skill.level),
          yearsOfExperience: skill.yearsOfExperience,
        }))
        setSkillProficiency(proficiency)
      }

      // Process attended interviews
      if (interviewsData.success) {
        // Only count interviews that have been attended and have a score
        const submittedInterviews = (interviewsData.interviews || []).filter(
          (interview: InterviewRecord) => interview.attended && interview.score !== undefined
        );
        setAttendedInterviews(submittedInterviews)
      }

      // Process mock history
      if (mockHistoryData.success) {
        console.log('=== MOCK HISTORY DATA ===')
        console.log('Mock history data:', mockHistoryData.history)
        console.log('Mock history count:', mockHistoryData.history?.length)
        if (mockHistoryData.history && mockHistoryData.history.length > 0) {
          mockHistoryData.history.forEach((m, i) => {
            console.log(`Mock ${i}: _id=${m._id}, status=${m.status}, totalScore=${m.totalScore}, startedAt=${m.startedAt}`)
          })
        }
        setMockHistory(mockHistoryData.history || [])
      } else {
        console.log('Mock history fetch failed:', mockHistoryData.message)
      }

      // Process overall feedback
      if (feedbackData.success && feedbackData.result) {
        console.log('Overall feedback:', feedbackData.result)
        setOverallFeedback(feedbackData.result)
      } else {
        console.log('Overall feedback not available:', feedbackData.message)
      }

      // Calculate stats and trends
      const calculatedStats = store.calculateDashboardStats(
        profileData.user?.skills || [],
        interviewsData.interviews || [],
        mockHistoryData.history || [],
        feedbackData.result
      )
      console.log('Calculated stats:', calculatedStats)
      setStats(calculatedStats)

      const trend = store.calculatePerformanceTrend(
        mockHistoryData.history || [],
        interviewsData.interviews || []
      )
      console.log('Performance trend calculated:', trend)
      console.log('Performance trend length:', trend.length)
      setPerformanceTrend(trend)
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Helper function to convert skill level to number
  const getSkillLevelNumber = (level: string): number => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 30
      case 'intermediate':
        return 60
      case 'advanced':
        return 90
      default:
        return 50
    }
  }

  // Initial load
  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Handle refresh
  const handleRefresh = () => {
    fetchDashboardData(true)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Get status color
  const getStatusColor = (attended: boolean, isHired?: boolean) => {
    if (isHired) {
      return { bg: theme.palette.secondary.light, color: 'white', label: 'Hired' }
    }
    if (attended) {
      return { bg: theme.palette.secondary.main, color: 'white', label: 'Submitted' }
    }
    return { bg: theme.palette.primary.light, color: 'white', label: 'Pending' }
  }

  // Loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 3,
        }}
      >
        <CircularProgress sx={{ color: '#49BBBD' }} />
        <Typography sx={{ color: '#49BBBD', fontWeight: 500 }} variant="h6">
          Loading your dashboard...
        </Typography>
        <Typography
          sx={{ color: '#49BBBD', textAlign: 'center', maxWidth: '300px' }}
          variant="body2"
        >
          Preparing your interview insights and analytics
        </Typography>
      </Box>
    )
  }

  // Error state with retry
  if (error && skills.length === 0 && attendedInterviews.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 3,
        }}
      >
        <Alert severity="error" sx={{ maxWidth: '500px' }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={handleRefresh}
          startIcon={<RefreshCw />}
          sx={{ backgroundColor: '#49BBBD', '&:hover': { backgroundColor: '#3aa8a9' } }}
        >
          Retry
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Header with Refresh */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
          Candidate Dashboard
        </Typography>
        <Button
          variant="outlined"
          onClick={handleRefresh}
          disabled={isRefreshing}
          startIcon={
            isRefreshing ? (
              <CircularProgress size={20} sx={{ color: '#49BBBD' }} />
            ) : (
              <RefreshCw size={20} />
            )
          }
          sx={{
            color: '#49BBBD',
            borderColor: '#49BBBD',
            '&:hover': {
              borderColor: '#3aa8a9',
              backgroundColor: alpha('#49BBBD', 0.04),
            },
          }}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Grid */}
      <Grid container spacing={3}>
        {[
          { icon: BookOpen, label: 'Total Interviews', value: stats.totalInterviews.toString() },
          {
            icon: Award,
            label: 'Average Score',
            value: stats.averageScore > 0 ? `${stats.averageScore}%` : 'N/A',
          },
          {
            icon: TrendingUp,
            label: 'Improvement',
            value:
              stats.improvement !== 0 || overallFeedback
                ? `${stats.improvement > 0 ? '+' : ''}${stats.improvement}%`
                : 'N/A',
            color: stats.improvement > 0 ? '#ffffffff' : stats.improvement < 0 ? '#ef4444' : '#ffffff',
          },
          { icon: BarChart3, label: 'Skills Added', value: stats.skillsCount.toString() },
        ].map((stat, idx) => {
          const Icon = stat.icon
          const gradientBg = idx % 2 === 0
            ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`
            : `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.light} 100%)`;

          return (
            <Grid size={{ xs: 6, sm: 6, md: 3 }} key={idx}>
              <Card
                sx={{
                  height: '100%',
                  minHeight: 120,
                  background: gradientBg,
                }}
              >
                <CardContent sx={{ p: { xs: 1.5, sm: 3 } }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{ color: 'white', fontWeight: 500, mb: 1 }}
                        variant="body2"
                      >
                        {stat.label}
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 'bold',
                          color: stat.color || 'white',
                          fontSize: { xs: '1.25rem', sm: '1.5rem' },
                        }}
                        variant="h4"
                      >
                        {stat.value}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: 2,
                        backgroundColor: 'white',
                      }}
                    >
                      <Icon size={24} style={{ color: idx % 2 === 0 ? theme.palette.primary.main : theme.palette.secondary.main }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Performance Trend */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography
              sx={{ fontWeight: 'bold', color: theme.palette.text.primary, mb: 3 }}
              variant="h6"
            >
              Overall Performance Trend
            </Typography>
            <Typography
              sx={{ color: 'text.secondary', mb: 2, fontSize: '0.875rem' }}
              variant="caption"
            >
              Combined progress from mock and company interviews
            </Typography>
            {performanceTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke={theme.palette.primary.main}
                    strokeWidth={3}
                    dot={{ fill: theme.palette.primary.main, r: 5 }}
                    activeDot={{ r: 7, stroke: theme.palette.primary.main, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 300,
                  gap: 2,
                }}
              >
                <Typography sx={{ color: 'text.secondary' }} variant="body2">
                  No performance data yet
                </Typography>
                <Typography sx={{ color: 'text.secondary' }} variant="caption">
                  Take mock interviews or attend company interviews to see your progress trend
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => router.push('/candidate/mock-interview')}
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 6px 20px ${theme.palette.primary.main}66`,
                      },
                    }}
                  >
                    Take Mock Interview
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => router.push('/candidate/findInterview')}
                    sx={{
                      color: theme.palette.primary.main,
                      borderColor: theme.palette.primary.main,
                      '&:hover': {
                        borderColor: theme.palette.secondary.main,
                        color: theme.palette.secondary.main,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Find Interviews
                  </Button>
                </Box>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Skills Proficiency */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography
              sx={{ fontWeight: 'bold', color: theme.palette.text.primary, mb: 3 }}
              variant="h6"
            >
              Skills Proficiency
            </Typography>
            {skillProficiency.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={skillProficiency}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="level" fill={theme.palette.primary.main} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 300,
                }}
              >
                <Typography sx={{ color: 'text.secondary' }} variant="body2">
                  No skills added yet. Complete your profile to see skills proficiency.
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Overall Feedback Section (if available) */}
      {overallFeedback && (
        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography
            sx={{ fontWeight: 'bold', color: theme.palette.text.primary, mb: 3 }}
            variant="h6"
          >
            Overall Performance Summary
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                  {overallFeedback.averageScore}%
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Average Score
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ color: theme.palette.secondary.main, fontWeight: 'bold' }}>
                  {overallFeedback.totalAttempts}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Mock Interviews
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h3"
                  sx={{
                    color: overallFeedback.trend === 'Improving' ? '#22c55e' : theme.palette.primary.main,
                    fontWeight: 'bold',
                  }}
                >
                  {overallFeedback.trend}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Trend
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ color: theme.palette.secondary.main, fontWeight: 'bold' }}>
                  {overallFeedback.overallSkillLevel}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Skill Level
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {overallFeedback && (() => {
            // Check for aiFeedback or feedback field and parse if string
            let feedbackData = (overallFeedback as any).aiFeedback || (overallFeedback as any).feedback || null;
            if (typeof feedbackData === 'string') {
              try {
                feedbackData = JSON.parse(feedbackData);
              } catch (e) {
                feedbackData = null;
              }
            }

            if (!feedbackData) return null;

            const safeStrengths = Array.isArray(feedbackData.strengths) ? feedbackData.strengths : []
            const safeWeaknesses = Array.isArray(feedbackData.weaknesses) ? feedbackData.weaknesses : (Array.isArray(feedbackData.improvements) ? feedbackData.improvements : [])

            return (
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: theme.palette.secondary.main }}>
                      Strengths:
                    </Typography>
                    {safeStrengths.length > 0 ? (
                      safeStrengths.map((strength: any, idx: any) => (
                        <Chip
                          key={idx}
                          label={strength}
                          size="small"
                          sx={{
                            m: 0.5,
                            backgroundColor: theme.palette.secondary.light,
                            color: 'white',
                            fontWeight: 500,
                          }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">No strengths identified yet.</Typography>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: theme.palette.primary.main }}>
                      Areas for Improvement:
                    </Typography>
                    {safeWeaknesses.length > 0 ? (
                      safeWeaknesses.map((weakness: any, idx: any) => (
                        <Chip
                          key={idx}
                          label={weakness}
                          size="small"
                          sx={{
                            m: 0.5,
                            backgroundColor: theme.palette.primary.light,
                            color: 'white',
                            fontWeight: 500,
                          }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">No areas for improvement identified yet.</Typography>
                    )}
                  </Grid>
                </Grid>
              </Box>
            )
          })()}
        </Card>
      )}

      {/* Mock Interview Performance History */}
      <Card sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography
          sx={{ fontWeight: 'bold', color: theme.palette.text.primary, mb: 3 }}
          variant="h6"
        >
          Mock Interview Performance History
        </Typography>
        {mockHistory.filter((m) => m.status === 'SUBMITTED' && m.totalScore).length > 0 ? (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                    Difficulty
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                    Score
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                    Skill Level
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockHistory
                  .filter((m) => m.status === 'SUBMITTED' && m.totalScore)
                  .slice(0, 10)
                  .map((mock) => {
                    const scoreColor =
                      mock.totalScore >= 85
                        ? '#22c55e'
                        : mock.totalScore >= 70
                          ? '#f59e0b'
                          : '#ef4444'
                    return (
                      <TableRow
                        key={mock._id}
                        sx={{
                          '&:hover': { backgroundColor: alpha('#49BBBD', 0.04) },
                          borderBottom: '1px solid #f1f5f9',
                        }}
                      >
                        <TableCell
                          sx={{
                            color: theme.palette.text.primary,
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                          }}
                        >
                          {formatDate(mock.startedAt)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={mock.difficulty}
                            size="small"
                            sx={{
                              backgroundColor:
                                mock.difficulty === 'Easy'
                                  ? '#dcfce7'
                                  : mock.difficulty === 'Medium'
                                    ? '#fef3c7'
                                    : '#fee2e2',
                              color:
                                mock.difficulty === 'Easy'
                                  ? '#166534'
                                  : mock.difficulty === 'Medium'
                                    ? '#92400e'
                                    : '#991b1b',
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: scoreColor,
                              fontSize: { xs: '0.875rem', sm: '1rem' },
                            }}
                          >
                            {mock.totalScore}%
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            color: theme.palette.text.primary,
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                          }}
                        >
                          {mock.skillLevel || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              onClick={() =>
                                router.push(`/candidate/mock-interview/feedback/${mock._id}`)
                              }
                              sx={{
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                color: 'black',
                                fontWeight: 500,
                                '&:hover': { color: '#49BBBD' },
                              }}
                            >
                              View Feedback
                            </Button>
                            <IconButton
                              size="small"
                              onClick={async () => {
                                if (window.confirm('Are you sure you want to remove this interview from your dashboard?')) {
                                  const res = await useDashboardStore.getState().hideMockInterview(mock._id);
                                  if (res.success) {
                                    handleRefresh();
                                  } else {
                                    setError(res.message);
                                  }
                                }
                              }}
                              sx={{
                                color: 'error.main',
                                '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.1) },
                                mt: { xs: 1, sm: 0 }
                              }}
                            >
                              <Trash2 size={18} />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 5,
              gap: 2,
            }}
          >
            <Typography sx={{ color: 'text.secondary' }} variant="body2">
              No mock interviews taken yet
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/candidate/mock-interview')}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 20px ${theme.palette.primary.main}66`,
                },
              }}
            >
              Start Mock Interview
            </Button>
          </Box>
        )}
      </Card>

      {/* Recent Interviews */}
      <Card sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography
          sx={{ fontWeight: 'bold', color: theme.palette.text.primary, mb: 3 }}
          variant="h6"
        >
          Recent Interviews
        </Typography>
        {attendedInterviews.length > 0 ? (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                    Role
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                    Company
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                    Score
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendedInterviews.slice(0, 10).map((interview) => {
                  // Determine status based on score and attended flag
                  const isSubmitted = interview.attended && interview.score !== undefined;
                  const isEvaluated = interview.attended && interview.score !== undefined;
                  const statusColors = getStatusColor(isSubmitted, isEvaluated)

                  return (
                    <TableRow
                      key={interview._id}
                      sx={{
                        '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.05) },
                        borderBottom: '1px solid #f1f5f9',
                      }}
                    >
                      <TableCell
                        sx={{
                          color: theme.palette.text.primary,
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        }}
                      >
                        {formatDate(interview.createdAt)}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: theme.palette.text.primary,
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        }}
                      >
                        {interview.interview?.jobTitle || 'N/A'}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: theme.palette.text.primary,
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        }}
                      >
                        {interview.interview?.company?.companyName || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: theme.palette.primary.main,
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                          }}
                        >
                          {interview.score ? `${Math.round(interview.score)}%` : 'Pending'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={interview.score ? 'SUBMITTED' : 'PENDING'}
                          size="small"
                          sx={{
                            backgroundColor: statusColors.bg,
                            color: statusColors.color,
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            onClick={() =>
                              router.push(`/candidate/findInterview/feedback/${interview._id}`)
                            }
                            sx={{
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              color: theme.palette.primary.main,
                              fontWeight: 600,
                              '&:hover': {
                                color: theme.palette.secondary.main,
                                transform: 'translateY(-1px)',
                              },
                            }}
                          >
                            View Feedback
                          </Button>
                          <IconButton
                            size="small"
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to remove this interview from your dashboard?')) {
                                const res = await useDashboardStore.getState().hideCompanyInterview(interview._id);
                                if (res.success) {
                                  handleRefresh();
                                } else {
                                  setError(res.message);
                                }
                              }
                            }}
                            sx={{
                              color: 'error.main',
                              '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.1) },
                              mt: { xs: 1, sm: 0 }
                            }}
                          >
                            <Trash2 size={18} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 5,
              gap: 2,
            }}
          >
            <Typography sx={{ color: 'text.secondary' }} variant="body2">
              No company interviews attended yet
            </Typography>
            <Button
              variant="outlined"
              onClick={() => router.push('/candidate/findInterview')}
              sx={{
                color: '#49BBBD',
                borderColor: '#49BBBD',
                '&:hover': {
                  borderColor: '#3aa8a9',
                  backgroundColor: alpha('#49BBBD', 0.04),
                },
              }}
            >
              Browse Interviews
            </Button>
          </Box>
        )}
      </Card>
    </Box>
  )
}
