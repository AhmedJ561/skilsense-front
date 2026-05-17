'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Box, Card, Typography, Grid, List, ListItem, CircularProgress, Button } from '@mui/material'
import { CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'
import { alpha, useTheme } from '@mui/material/styles'
import { useMockInterviewStore } from '@/store/mock-interview.store'
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
export default function InstantFeedbackPage() {
  const theme = useTheme()
  const router = useRouter()
  const params = useParams()
  const attemptId: string = params?.attemptId as string

  const { getMockFeedbackByAttemptId } = useMockInterviewStore()
  const [feedback, setFeedback] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!attemptId) return

    const fetchFeedback = async () => {
      setIsLoading(true)
      try {
        const response = await getMockFeedbackByAttemptId(attemptId)
        // Backend double-wraps: response.result.result contains actual feedback data
        const feedbackData = response.result?.result || response.result
        if (response.success && feedbackData) {
          setFeedback(feedbackData)
        }
      } catch (err) {
        console.error('=== FETCH ERROR ===', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeedback()
  }, [attemptId, getMockFeedbackByAttemptId])

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 2 }}>
        <CircularProgress sx={{ color: '#49BBBD' }} />
        <Typography variant="h6" sx={{ color: '#49BBBD' }}>
          Loading your feedback...
        </Typography>
      </Box>
    )
  }

  if (!feedback) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Typography variant="h6" color="error">
          Feedback not found
        </Typography>
      </Box>
    )
  }

  const { score, skillLevel, evaluation, feedback: feedbackData } = feedback

  // Extract strengths, weaknesses, and learningPath from feedbackData
  const strengths = Array.isArray(feedbackData?.strengths) ? feedbackData.strengths : []
  const improvements = Array.isArray(feedbackData?.weaknesses) ? feedbackData.weaknesses : []
  const learningPath = Array.isArray(feedbackData?.learningPath) ? feedbackData.learningPath : []
  const COLORS = ['#80CECF', '#E98F11', '#49BBBD', '#664040']

  const pieData = evaluation
    ? Object.entries(evaluation).filter(([key]) => key !== '_id').map(([key, value]) => ({
      name: key.replace(/([A-Z])/g, ' $1'), // Convert camelCase to readable labels
      value: Math.round(value as number),
    }))
    : []


  return (
    <Box sx={{ p: { xs: 0, sm: 0, md: 3 }, minHeight: '100vh', bgcolor: 'background.default', display: 'flex', justifyContent: 'center' }}>
      <Card sx={{ maxWidth: 1200, width: '100%', p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* Score & Skill Level */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" sx={{ fontSize: { xs: '20px', md: '30px' } }} fontWeight="bold" color={theme.palette.text.primary}>
            Mock Interview Feedback
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>Skill Level</Typography>
              <Typography variant="body1" sx={{ color: '#49BBBD', fontWeight: 600 }}>{skillLevel}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ color: '#49BBBD', fontWeight: 'bold' }}>{score}%</Typography>
              <Typography variant="body2" color="text.secondary">Overall Score</Typography>
            </Box>
          </Box>
        </Box>

        {/* Top Section: Overview & Pie Chart */}
        {pieData.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card variant="outlined" sx={{ width: '100%', maxWidth: 600, p: 3, borderRadius: 3, borderColor: alpha('#E98F11', 0.2), backgroundColor: alpha('#E98F11', 0.02) }}>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 600 }}>
                Evaluation Breakdown
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, value }) => `${name.split(' ')[0]}: ${Math.round(value)}`}
                      outerRadius={100}
                      fill="#E98F11"
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `${Math.round(value)}/10`}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 8 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Box>
        )}

        {/* Strengths & Weaknesses */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Grid container spacing={4} sx={{ width: '100%' }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ p: 3, height: '100%', borderRadius: 3, borderColor: alpha('#16a34a', 0.2), backgroundColor: alpha('#16a34a', 0.02) }}>
                <Typography sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CheckCircle size={22} color="#16a34a" />
                  Strengths
                </Typography>
                <List sx={{ p: 0 }}>
                  {strengths?.map((item: string, idx: number) => (
                    <ListItem key={idx} sx={{ px: 0, py: 1, alignItems: 'flex-start' }}>
                      <Box sx={{ mt: 0.5, mr: 1.5, width: 6, height: 6, borderRadius: '50%', backgroundColor: '#16a34a', flexShrink: 0 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{item}</Typography>
                    </ListItem>
                  ))}
                </List>
                {strengths.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>No strengths data available.</Typography>
                )}
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ p: 3, height: '100%', borderRadius: 3, borderColor: alpha('#ea580c', 0.2), backgroundColor: alpha('#ea580c', 0.02) }}>
                <Typography sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AlertCircle size={22} color="#ea580c" />
                  Areas for Improvement
                </Typography>
                <List sx={{ p: 0 }}>
                  {improvements?.map((item: string, idx: number) => (
                    <ListItem key={idx} sx={{ px: 0, py: 1, alignItems: 'flex-start' }}>
                      <Box sx={{ mt: 0.5, mr: 1.5, width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ea580c', flexShrink: 0 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{item}</Typography>
                    </ListItem>
                  ))}
                </List>
                {improvements.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>No improvement areas identified.</Typography>
                )}
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Fallback if ALL data is empty */}
        {(strengths.length === 0 && improvements.length === 0 && learningPath.length === 0 && pieData.length === 0) && (
          <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(239, 68, 68, 0.05)', borderRadius: 2, border: '1px dashed #ef4444' }}>
            <Typography variant="body1" color="error">
              The AI has not provided detailed feedback for this attempt yet, or the feedback format was incompatible.
            </Typography>
          </Box>
        )}

        {/* Learning Path */}
        {learningPath?.length > 0 && (
          <Box>
            <Typography sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp size={20} color="#49BBBD" />
              Learning Path
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {learningPath.map((item: string, idx: number) => (
                <Box key={idx} sx={{ p: 1.5, borderRadius: 2, border: `1px solid ${alpha('#49BBBD', 0.2)}`, backgroundColor: alpha('#49BBBD', 0.04) }}>
                  <Typography variant="body2" sx={{ color: '#49BBBD', fontWeight: 500 }}>{item}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button variant="contained" color="primary" onClick={() => router.push('/candidate/mock-interview')}>
            Back to Dashboard
          </Button>
        </Box>
      </Card>
    </Box>
  )
}
