'use client'

import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts'
import { TrendingUp, Users, Briefcase, Award, Star } from 'lucide-react'
import {
  Box, Card, CardContent, Typography, CircularProgress, Chip, LinearProgress, Alert,
} from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import { useInterviewStore } from '@/store/interview.store'

const COLORS = ['#49BBBD', '#E98F11', '#80CECF', '#DDC3C3', '#955757', '#7c3aed']

const scoreColor = (s: number) => {
  if (s >= 80) return '#22c55e'
  if (s >= 60) return '#f59e0b'
  return '#ef4444'
}

export default function AnalyticsPage() {
  const theme = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [analytics, setAnalytics] = useState<any>(null)

  const { getCompanyAnalytics } = useInterviewStore()

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const res = await getCompanyAnalytics()
      if (res.success && res.analytics) {
        setAnalytics(res.analytics)
      } else {
        setError('Failed to load analytics data.')
      }
      setIsLoading(false)
    }
    load()
  }, [getCompanyAnalytics])

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 3 }}>
        <CircularProgress sx={{ color: '#49BBBD' }} />
        <Typography variant="h6" sx={{ color: '#49BBBD', fontWeight: 500 }}>Loading analytics...</Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: 'center', maxWidth: 300 }}>
          Aggregating your real hiring data
        </Typography>
      </Box>
    )
  }

  if (error || !analytics) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error || 'No data available.'}</Alert>
      </Box>
    )
  }

  const {
    totalInterviews, totalApplicants, hireRate, avgScore,
    skillDemand, statusBreakdown, monthlyTrend, topJobs,
  } = analytics

  const statCards = [
    { icon: Briefcase, label: 'Interviews Posted', value: totalInterviews?.toString() ?? '0' },
    { icon: Users, label: 'Total Applicants', value: totalApplicants?.toString() ?? '0' },
    { icon: TrendingUp, label: 'Hire Rate', value: `${hireRate ?? 0}%` },
    { icon: Star, label: 'Avg AI Score', value: avgScore > 0 ? `${avgScore}/100` : 'N/A' },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Header */}
      <Box>
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.text.primary, mb: 1 }}>
          Analytics & Insights
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
          Real hiring metrics from your posted interviews
        </Typography>
      </Box>

      {/* Key Metric Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
        {statCards.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Card key={idx} sx={{ height: 120, background: '#49BBBD' }}>
              <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500, mb: 0.5 }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'white' }}>
                    <Icon size={20} style={{ color: '#49BBBD' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )
        })}
      </Box>

      {/* Charts Row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        {/* Monthly Applicant Trend */}
        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
            Applicant Trend (Last 6 Months)
          </Typography>
          {monthlyTrend && monthlyTrend.some((m: any) => m.applicants > 0) ? (
            <ResponsiveContainer width="100%" height={270}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000', 0.06)} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="applicants" name="Applicants" stroke="#49BBBD" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="hired" name="Hired" stroke="#E98F11" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ height: 270, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body2" color="text.secondary">No applicant data yet. Candidates will appear here as they apply.</Typography>
            </Box>
          )}
        </Card>

        {/* Skill Demand Pie */}
        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
            Skills You&apos;re Hiring For
          </Typography>
          {skillDemand && skillDemand.length > 0 ? (
            <ResponsiveContainer width="100%" height={270}>
              <PieChart>
                <Pie
                  data={skillDemand}
                  cx="50%" cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={90}
                  dataKey="value"
                >
                  {skillDemand.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ height: 270, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body2" color="text.secondary">Post interviews with required skills to see demand data.</Typography>
            </Box>
          )}
        </Card>
      </Box>

      {/* Bottom Row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3 }}>
        {/* Application Status Breakdown */}
        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>Application Status</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {statusBreakdown?.map((item: any, idx: number) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Chip
                  label={item.status}
                  size="small"
                  sx={{ backgroundColor: item.color, color: item.textColor, fontWeight: 600, minWidth: 90 }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, ml: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={totalApplicants > 0 ? (item.count / totalApplicants) * 100 : 0}
                    sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'grey.100', '& .MuiLinearProgress-bar': { bgcolor: item.textColor } }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', minWidth: 32, textAlign: 'right' }}>{item.count}</Typography>
                </Box>
              </Box>
            ))}
            {(!statusBreakdown || statusBreakdown.every((s: any) => s.count === 0)) && (
              <Typography variant="body2" color="text.secondary">No applicants yet.</Typography>
            )}
          </Box>
        </Card>

        {/* Top Performing Jobs */}
        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>Top Jobs by Applicants</Typography>
          {topJobs && topJobs.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {topJobs.map((job: any, idx: number) => (
                <Box key={idx} sx={{ pb: 2, borderBottom: idx < topJobs.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{job.title}</Typography>
                    {job.avgScore > 0 && (
                      <Chip
                        icon={<Award size={12} />}
                        label={`Avg ${job.avgScore}`}
                        size="small"
                        sx={{ bgcolor: alpha(scoreColor(job.avgScore), 0.1), color: scoreColor(job.avgScore), fontWeight: 600, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">{job.applicants} applicant{job.applicants !== 1 ? 's' : ''}</Typography>
                    {job.hired > 0 && (
                      <Typography variant="body2" sx={{ color: '#16a34a', fontWeight: 500 }}>{job.hired} hired</Typography>
                    )}
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={totalApplicants > 0 ? (job.applicants / totalApplicants) * 100 : 0}
                    sx={{ mt: 0.75, height: 4, borderRadius: 2, bgcolor: 'grey.100', '& .MuiLinearProgress-bar': { bgcolor: '#49BBBD' } }}
                  />
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Briefcase size={36} color={theme.palette.text.secondary} style={{ opacity: 0.4, marginBottom: 8 }} />
              <Typography variant="body2" color="text.secondary">Post interviews to see job performance data.</Typography>
            </Box>
          )}
        </Card>
      </Box>

      {/* Avg Score Bar Chart (only if data exists) */}
      {topJobs && topJobs.some((j: any) => j.avgScore > 0) && (
        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>Average AI Score by Job</Typography>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topJobs.filter((j: any) => j.avgScore > 0)} margin={{ left: 0, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000', 0.06)} />
              <XAxis dataKey="title" tick={{ fontSize: 11 }} interval={0} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: any) => [`${v}/100`, 'Avg Score']} />
              <Bar dataKey="avgScore" name="Avg Score" radius={[4, 4, 0, 0]}>
                {topJobs
                  .filter((j: any) => j.avgScore > 0)
                  .map((j: any, i: number) => (
                    <Cell key={i} fill={scoreColor(j.avgScore)} />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </Box>
  )
}
