'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, AlertCircle, TrendingUp, BookOpen, Target } from 'lucide-react'
import {
  Box,
  Card,
  Typography,
  Grid,
  List,
  ListItem,
  CircularProgress,
  Button,
  Chip,
  LinearProgress,
} from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useDashboardStore } from '@/store/dashboard.store'

interface Evaluation {
  conceptAccuracy: number
  depthOfAnswer: number
  relevance: number
  timeEfficiency: number
}

interface FeedbackResult {
  score: number
  skillLevel: string
  evaluation: Evaluation
  feedback: {
    strengths: string[]
    weaknesses: string[]
    improvements?: string[]  // legacy fallback
    learningPath: string[]
  }
}


export default function MockInterviewFeedback() {
  const theme = useTheme()
  const router = useRouter()
  const params = useParams()
  const attemptId = params.attemptId as string

  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const COLORS = ['#49BBBD', '#80CECF', '#E98F11', '#664040']

  useEffect(() => {
    const fetchFeedback = async () => {
      setIsLoading(true)
      setError(null)

      try {
        console.log('=== FETCHING FEEDBACK FOR ATTEMPT ===')
        console.log('Attempt ID:', attemptId)
        const result = await useDashboardStore.getState().fetchMockFeedbackByAttemptId(attemptId)
        console.log('Feedback result:', result)

        if (result.success && result.result) {
          console.log('Setting feedback:', result.result)
          setFeedback(result.result)
        } else {
          console.error('Feedback fetch failed:', result.message)
          setError(result.message || 'Failed to fetch feedback')
        }
      } catch (err: any) {
        console.error('Error fetching feedback:', err)
        setError(err.message || 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    if (attemptId) {
      fetchFeedback()
    }
  }, [attemptId])

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
        <Typography variant="h6" sx={{ color: '#49BBBD', fontWeight: 500 }}>
          Loading your feedback...
        </Typography>
      </Box>
    )
  }

  if (error || !feedback) {
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
        <AlertCircle size={48} style={{ color: '#ef4444' }} />
        <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
          {error || 'No feedback available'}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', maxWidth: '400px' }}>
          This might happen if you haven&apos;t completed the mock interview yet or the feedback hasn&apos;t been generated.
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.push('/candidate/dashboard')}
          sx={{
            backgroundColor: '#49BBBD',
            '&:hover': { backgroundColor: '#3aa8a9' },
          }}
        >
          Back to Dashboard
        </Button>
      </Box>
    )
  }

  const evaluation = feedback.evaluation
  const pieData = evaluation
    ? [
      { name: 'Concept Accuracy', value: getScore('concept') },
      { name: 'Depth of Answer', value: getScore('depth') },
      { name: 'Relevance', value: getScore('relevance') },
      { name: 'Time Efficiency', value: getScore('time') },
    ]
    : []

  function formatLabel(key: string): string {
    const cleanKey = key.split(':')[0].trim()
    const labels: Record<string, string> = {
      conceptAccuracy: 'Concept Accuracy',
      depthOfAnswer: 'Depth of Answer',
      relevance: 'Relevance',
      timeEfficiency: 'Time Efficiency',
      'depth Of Answer': 'Depth of Answer',
      'time Efficiency': 'Time Efficiency'
    }
    return labels[cleanKey] || cleanKey.replace(/([A-Z])/g, ' $1').trim()
  }

  function getScore(target: string): number {
    if (!evaluation) return 0;
    const entry = Object.entries(evaluation).find(([k]) => k.toLowerCase().includes(target.toLowerCase()));
    return entry ? Math.round(entry[1] as number) : 0;
  }

  function getScoreColor(score: number): string {
    if (score >= 85) return '#22c55e'
    if (score >= 70) return '#f59e0b'
    return '#ef4444'
  }

  function getScoreLabel(score: number): string {
    if (score >= 85) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 50) return 'Average'
    return 'Needs Improvement'
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Header */}
      <Box>
        <Button
          startIcon={<ArrowLeft size={20} />}
          onClick={() => router.back()}
          sx={{
            mb: 2,
            color: '#49BBBD',
            '&:hover': {
              backgroundColor: alpha('#49BBBD', 0.04),
            },
          }}
        >
          Back
        </Button>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 'bold',
            color: theme.palette.text.primary,
            mb: 1,
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
          }}
        >
          Mock Interview Feedback
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
          Detailed analysis of your mock interview performance
        </Typography>
      </Box>

      {/* Score Overview Cards */}
      <Grid container spacing={3}>
        {/* Score */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 'bold',
                color: getScoreColor(feedback.score),
                mb: 1,
              }}
            >
              {feedback.score}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Total Score
            </Typography>
            <Chip
              label={getScoreLabel(feedback.score)}
              size="small"
              sx={{
                mt: 1,
                backgroundColor: alpha(getScoreColor(feedback.score), 0.1),
                color: getScoreColor(feedback.score),
                fontWeight: 600,
              }}
            />
          </Card>
        </Grid>

        {/* Skill Level */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
              <Target size={32} style={{ color: '#49BBBD' }} />
            </Box>
            <Typography variant="h2" sx={{ fontWeight: 'bold', color: '#49BBBD', mb: 1 }}>
              {feedback.skillLevel}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Skill Level
            </Typography>
          </Card>
        </Grid>

        {/* Concept Accuracy */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
              <BookOpen size={32} style={{ color: '#49BBBD' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#49BBBD', mb: 1 }}>
              {getScore('concept')}/10
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Concept Accuracy
            </Typography>
          </Card>
        </Grid>

        {/* Time Efficiency */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
              <TrendingUp size={32} style={{ color: '#49BBBD' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#49BBBD', mb: 1 }}>
              {getScore('time')}/10
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Time Efficiency
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Evaluation Breakdown Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Evaluation Breakdown
            </Typography>
            {pieData.length > 0 ? (
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${Math.round(value)}`}
                      outerRadius={100}
                      fill="#49BBBD"
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => Math.round(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 300,
                }}
              >
                <Typography sx={{ color: 'text.secondary' }}>No evaluation data available</Typography>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Detailed Scores */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Detailed Scores
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {evaluation &&
                Object.entries(evaluation).map(([key, value]) => (
                  <Box key={key}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                        {formatLabel(key)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: getScoreColor(value),
                        }}
                      >
                        {Math.round(value)}/10
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(Math.round(value) / 10) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: alpha('#49BBBD', 0.1),
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getScoreColor(value),
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                ))}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Strengths and Weaknesses */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <CheckCircle size={20} color="#16a34a" />
              Strengths
            </Typography>
            {feedback.feedback?.strengths && feedback.feedback.strengths.length > 0 ? (
              <List sx={{ pl: 0 }}>
                {feedback.feedback.strengths.map((strength, idx) => (
                  <ListItem
                    key={idx}
                    sx={{
                      pl: 0,
                      py: 1.5,
                      borderBottom: idx < feedback.feedback!.strengths.length - 1 ? '1px solid #f1f5f9' : 'none',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: '#22c55e',
                          mt: 1,
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        {strength}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography sx={{ color: 'text.secondary' }}>No strengths identified yet</Typography>
            )}
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <AlertCircle size={20} color="#ea580c" />
              Areas for Improvement
            </Typography>
            {feedback.feedback?.weaknesses && feedback.feedback.weaknesses.length > 0 ? (
              <List sx={{ pl: 0 }}>
                {feedback.feedback.weaknesses.map((weakness, idx) => (
                  <ListItem
                    key={idx}
                    sx={{
                      pl: 0,
                      py: 1.5,
                      borderBottom: idx < feedback.feedback!.weaknesses.length - 1 ? '1px solid #f1f5f9' : 'none',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: '#f59e0b',
                          mt: 1,
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        {weakness}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography sx={{ color: 'text.secondary' }}>No areas for improvement identified</Typography>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Learning Path */}
      {feedback.feedback?.learningPath && feedback.feedback.learningPath.length > 0 ? (
        <Card sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <BookOpen size={20} color="#49BBBD" />
            Recommended Learning Path
          </Typography>
          <Grid container spacing={2}>
            {feedback.feedback.learningPath.map((item, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                <Box
                  sx={{
                    p: 2.5,
                    backgroundColor: alpha('#49BBBD', 0.04),
                    borderRadius: 3,
                    border: `1px solid ${alpha('#49BBBD', 0.2)}`,
                    height: '100%',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: '#49BBBD',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                      }}
                    >
                      {idx + 1}
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#49BBBD' }}>
                      Step {idx + 1}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6 }}>
                    {item}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Card>
      ) : (
        <Card sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <BookOpen size={20} color="#49BBBD" />
            Recommended Learning Path
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            No learning path recommendations available yet.
          </Typography>
        </Card>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          onClick={() => router.push('/candidate/mock-interview')}
          sx={{
            backgroundColor: '#49BBBD',
            '&:hover': { backgroundColor: '#3aa8a9' },
          }}
        >
          Take Another Mock Interview
        </Button>
        <Button
          variant="outlined"
          onClick={() => router.push('/candidate/dashboard')}
          sx={{
            color: '#49BBBD',
            borderColor: '#49BBBD',
            '&:hover': {
              borderColor: '#3aa8a9',
              backgroundColor: alpha('#49BBBD', 0.04),
            },
          }}
        >
          Back to Dashboard
        </Button>
      </Box>
    </Box>
  )
}
