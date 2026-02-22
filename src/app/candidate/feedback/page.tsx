'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import {
  Box,
  Card,
  Typography,
  Grid,
  List,
  ListItem,
  CircularProgress,
} from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import { useMockInterviewStore } from '@/store/mock-interview.store'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

export default function FeedbackPage() {
  const theme = useTheme()
  const { getOverallFeedback, isLoading: storeLoading } = useMockInterviewStore()
  const [mockFeedback, setMockFeedback] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch overall mock feedback
  useEffect(() => {
    let isMounted = true

      ; (async () => {
        try {
          const res = await getOverallFeedback()
          if (isMounted && res?.result) {
            setMockFeedback(res.result)
          }
        } catch (err) {
          console.error(err)
        } finally {
          if (isMounted) setIsLoading(false)
        }
      })()

    return () => {
      isMounted = false
    }
  }, [getOverallFeedback])

  if (isLoading || storeLoading) {
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
          Loading feedback...
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: '#49BBBD', textAlign: 'center', maxWidth: '300px' }}
        >
          Preparing your interview feedback and insights
        </Typography>
      </Box>
    )
  }



  // Dynamic mock feedback
  const dynamicMockFeedback =
    mockFeedback && mockFeedback.averageScore
      ? {
        date: new Date().toLocaleDateString(),
        type: 'Mock Interview',
        trend: mockFeedback.trend,
        score: mockFeedback.averageScore,
        evaluation: mockFeedback.evaluation,
        skillLevel: mockFeedback.overallSkillLevel ?? '', // ✅ Skill Level
        strengths: mockFeedback.feedback?.strengths ?? [],
        weaknesses: mockFeedback.feedback?.weaknesses ?? [],
        learningPath: mockFeedback.feedback?.learningPath ?? [],
      }
      : null

  const feedbackList = [dynamicMockFeedback].filter(Boolean)
  const COLORS = ['#80CECF', '#E98F11', '#49BBBD', '#664040']
  const evaluation = dynamicMockFeedback?.evaluation
  function getScore(target: string): number {
    if (!evaluation) return 0;
    const entry = Object.entries(evaluation).find(([k]) => k.toLowerCase().includes(target.toLowerCase()));
    return entry ? Math.round(entry[1] as number) : 0;
  }

  const pieData = evaluation
    ? [
      { name: 'Concept Accuracy', value: getScore('concept') },
      { name: 'Depth of Answer', value: getScore('depth') },
      { name: 'Relevance', value: getScore('relevance') },
      { name: 'Time Efficiency', value: getScore('time') },
    ]
    : []

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 'bold',
            color: theme.palette.text.primary,
            mb: 2,
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
          }}
        >
          Your Feedback
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
          Review detailed feedback from your interviews
        </Typography>
      </Box>
      {feedbackList.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {feedbackList.map((feedback: any, idx) => (
            <Card key={idx} sx={{ p: { xs: 3, sm: 4 } }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'flex-start',
                  gap: 2,
                  mb: 4,
                }}
              >
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 'bold', color: theme.palette.text.primary, mb: 1 }}
                  >
                    {feedback.type}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {feedback.date}
                  </Typography>
                  {/* Skill Level */}
                  {feedback.skillLevel && (
                    <Typography variant="body2" sx={{ color: '#49BBBD', mt: 0.5, whiteSpace: 'nowrap' }}>
                      Skill Level: <strong>{feedback.skillLevel}</strong>
                    </Typography>
                  )}
                  {/* Skill Level */}
                  {feedback.trend && (
                    <Typography variant="body2" sx={{ color: '#49BBBD', mt: 0.5 }}>
                      Trend: <strong>{feedback.trend}</strong>
                    </Typography>
                  )}
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h2"
                    sx={{ fontWeight: 'bold', color: '#49BBBD', mb: 0.5 }}
                  >
                    {feedback.score}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Overall Score
                  </Typography>
                </Box>


              </Box>

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, mt: 2 }} >

                <Box>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <CheckCircle size={20} color="#16a34a" />
                      Strengths
                    </Typography>
                    <List sx={{ pl: 2 }}>
                      {feedback.strengths.map((strength: string) => (
                        <ListItem key={strength} sx={{ pl: 0, py: 0.5 }}>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            • {strength}
                          </Typography>
                        </ListItem>
                      ))}
                    </List>
                  </Grid>

                  <Grid sx={{ mt: 3 }} size={{ xs: 12, md: 6 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <AlertCircle size={20} color="#ea580c" />
                      Areas for Improvement
                    </Typography>
                    <List sx={{ pl: 2 }}>
                      {feedback.weaknesses.map((weakness: string) => (
                        <ListItem key={weakness} sx={{ pl: 0, py: 0.5 }}>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            • {weakness}
                          </Typography>
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Box>
                {pieData.length > 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Evaluation Breakdown
                    </Typography>
                    <Box sx={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={100}
                            fill="#E98F11"
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
                  </Box>
                )}

              </Box>

              {/* Learning Path */}
              {feedback.learningPath?.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <TrendingUp size={20} color="#49BBBD" />
                    Learning Path
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {feedback.learningPath.map((item: string, idx: number) => (
                      <Box
                        key={idx}
                        sx={{
                          p: 1.5,
                          backgroundColor: alpha('#49BBBD', 0.04),
                          borderRadius: 2,
                          border: `1px solid ${alpha('#49BBBD', 0.2)}`,
                        }}
                      >
                        <Typography variant="body2" sx={{ color: '#49BBBD', fontWeight: 500 }}>
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}


            </Card>
          ))}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
            No Feedback Available
          </Typography>
        </Box>
      )}

    </Box>
  )
}
