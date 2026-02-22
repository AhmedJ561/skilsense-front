"use client";

import { useState, useEffect } from 'react'
import { Briefcase, Users, Clock, TrendingUp } from "lucide-react";
import {
  Box,
  Card,
  CardContent,
  Typography,
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
} from "@mui/material";
import { useTheme, alpha } from '@mui/material/styles'
import { useInterviewStore } from '@/store/interview.store'
import { useRouter } from 'next/navigation'

export default function CompanyDashboard() {
  const theme = useTheme();
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [interviews, setInterviews] = useState<any[]>([])
  const [candidates, setCandidates] = useState<any[]>([])
  const { getInterviewByCompany, getCompanyCandidates } = useInterviewStore()

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const userStr = sessionStorage.getItem('user')
        if (userStr) setUser(JSON.parse(userStr))

        const [res, candRes] = await Promise.all([
          getInterviewByCompany(),
          getCompanyCandidates()
        ])

        if (res.success) {
          setInterviews(res.interview || [])
        } else {
          setError(res.message || 'Failed to load interviews')
        }

        if (candRes.success) {
          setCandidates(candRes.candidates || [])
        }
      } catch (err: any) {
        setError(err.message || 'Something went wrong')
      } finally {
        setIsLoading(false)
      }
    }
    loadDashboard()
  }, [])

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 3 }}>
        <CircularProgress sx={{ color: '#49BBBD' }} />
        <Typography variant="h6" sx={{ color: "#49BBBD", fontWeight: 500 }}>Loading your dashboard...</Typography>
        <Typography variant="body2" sx={{ color: "#49BBBD", textAlign: 'center', maxWidth: '300px' }}>
          Preparing your company analytics and candidate insights
        </Typography>
      </Box>
    )
  }

  const totalCandidates = candidates.length
  const openInterviews = interviews.filter((iv: any) => !iv.isHired).length
  const hiredCount = candidates.filter((c: any) => c.isHired).length

  const stats = [
    { label: "Jobs Posted", value: interviews.length.toString(), icon: Briefcase },
    { label: "Candidates", value: totalCandidates.toString(), icon: Users },
    { label: "Open Interviews", value: openInterviews.toString(), icon: Clock },
    { label: "Hired", value: hiredCount.toString(), icon: TrendingUp },
  ];

  return (
    <>
      <Box>
        {user && (
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", color: theme.palette.text.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
            Welcome Back&nbsp;
            <Typography component="span" sx={{ color: '#49BBBD', fontWeight: "bold" }}>{user.name}</Typography>
          </Typography>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {/* Stats Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 2, sm: 3 } }}>
          {stats.map((stat, idx) => (
            <Card key={idx} sx={{
              height: '100%',
              minHeight: 120,
              background: '#49BBBD',
            }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 3 } }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 500, mb: 1 }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2, backgroundColor: 'white' }}>
                    <stat.icon size={24} style={{ color: '#49BBBD' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Recent Interviews Table */}
        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: theme.palette.text.primary, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              Recent Interview Postings
            </Typography>
            <Button
              variant="contained"
              size="small"
              sx={{
                background: '#49BBBD',
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  background: '#3aa8a9',
                }
              }}
              onClick={() => router.push('/company/interviews')}
            >
              View All
            </Button>
          </Box>

          {interviews.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Briefcase size={48} color="#49BBBD" style={{ opacity: 0.5, marginBottom: 16 }} />
              <Typography sx={{ color: 'text.secondary', fontSize: '1.1rem', mb: 3 }} variant="body1">
                You haven't posted any interviews yet.
              </Typography>
              <Button
                variant="contained"
                sx={{
                  background: '#49BBBD',
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    background: '#3aa8a9',
                  }
                }}
                onClick={() => router.push('/company/interviews')}
              >
                Post Your First Interview
              </Button>
            </Box>
          ) : (
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Job Title</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Skills</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {interviews.slice(0, 5).map((iv: any) => (
                    <TableRow
                      key={iv._id}
                      sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.04) }, borderBottom: '1px solid #f1f5f9' }}
                    >
                      <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 500, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {iv.jobTitle}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.secondary, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        {iv.location || '—'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(iv.requiredSkills || []).slice(0, 3).map((skill: string, i: number) => (
                            <Chip key={i} label={skill} size="small" sx={{ backgroundColor: '#e0f7f7', color: '#49BBBD', fontSize: '0.7rem' }} />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={iv.isHired ? 'Closed' : 'Open'}
                          size="small"
                          sx={{
                            backgroundColor: iv.isHired ? '#fee2e2' : '#dcfce7',
                            color: iv.isHired ? '#dc2626' : '#16a34a',
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="text"
                          size="small"
                          sx={{ color: '#49BBBD', fontWeight: 500, fontSize: { xs: '0.75rem', sm: '0.875rem' }, '&:hover': { color: '#3aa8a9' } }}
                          onClick={() => router.push('/company/interviews')}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Box>
    </>
  );
}
