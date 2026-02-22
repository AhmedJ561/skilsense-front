'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
    Box, Card, Typography, CircularProgress, Chip, Divider, Button,
    Grid, List, ListItem
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useInterviewStore } from '@/store/interview.store'
import { CheckCircle, BookOpen, Trophy, ArrowLeft, Star, AlertCircle } from 'lucide-react'
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface FeedbackResult {
    score: number
    skillLevel: string
    jobTitle?: string
    evaluation: {
        conceptAccuracy: number
        depthOfAnswer: number
        relevance: number
        timeEfficiency: number
    }
    feedback: {
        strengths: string[]
        weaknesses: string[]
        learningPath: string[]
    }
    status: string
}



export default function InterviewFeedbackPage() {
    const router = useRouter()
    const params = useParams()
    const id = params?.id as string
    const theme = useTheme()
    const { getInterviewFeedback } = useInterviewStore()
    const [isLoading, setIsLoading] = useState(true)
    const [feedback, setFeedback] = useState<FeedbackResult | null>(null)
    const [error, setError] = useState('')
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        if (!id) return
        const load = async () => {
            try {
                const res = await getInterviewFeedback(id)
                if (res.success && res.result) {
                    setFeedback(res.result)
                } else {
                    setError(res.message || 'Could not load feedback')
                }
            } catch (e: any) {
                setError(e.message || 'Error loading feedback')
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [id])



    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 3 }}>
                <CircularProgress sx={{ color: theme.palette.primary.main }} />
                <Typography variant="h6" sx={{ color: theme.palette.primary.main }}>Analyzing your interview performance...</Typography>
                <Typography variant="body2" color="text.secondary">AI is evaluating your answers. This may take a moment.</Typography>
            </Box>
        )
    }

    if (error || !feedback) {
        return (
            <Box sx={{ textAlign: 'center', py: 10 }}>
                <Typography variant="h5" color="error" mb={2}>{error || 'No feedback available yet'}</Typography>
                <Button variant="contained" onClick={() => router.push('/candidate/findInterview')} sx={{ bgcolor: theme.palette.primary.main, '&:hover': { bgcolor: theme.palette.primary.dark } }}>
                    Back to Interviews
                </Button>
            </Box>
        )
    }



    function getScore(target: string): number {
        if (!feedback?.evaluation) return 0;
        const entry = Object.entries(feedback.evaluation).find(([k]) => k.toLowerCase().includes(target.toLowerCase()));
        return entry ? Math.round(entry[1] as number) : 0;
    }

    const COLORS = [theme.palette.primary.main, theme.palette.primary.light, theme.palette.secondary.main, theme.palette.secondary.light]
    const pieData = feedback?.evaluation
        ? [
            { name: 'Concept Accuracy', value: getScore('concept') },
            { name: 'Depth of Answer', value: getScore('depth') },
            { name: 'Relevance', value: getScore('relevance') },
            { name: 'Time Efficiency', value: getScore('time') },
        ].filter(d => d.value > 0)
        : []

    // Safe fallback for AI Feedback format - check all possible locations
    let aiData = (feedback as any).aiFeedback || (feedback as any).feedback || {}
    
    // If aiData is a string, parse it as JSON
    if (typeof aiData === 'string') {
        try {
            aiData = JSON.parse(aiData)
        } catch (e) {
            aiData = {}
        }
    }
    
    // Ensure arrays
    const safeStrengths: string[] = Array.isArray(aiData?.strengths) ? aiData.strengths : []
    const safeWeaknesses: string[] = Array.isArray(aiData?.weaknesses) ? aiData.weaknesses : (Array.isArray(aiData?.improvements) ? aiData.improvements : [])
    const safeLearningPath: string[] = Array.isArray(aiData?.learningPath) ? aiData.learningPath : []

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, pb: 6 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button startIcon={<ArrowLeft size={16} />} onClick={() => router.push('/candidate/findInterview')} variant="outlined" size="small">
                    Back
                </Button>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="text.primary">
                        Interview Results
                    </Typography>
                    {feedback.jobTitle && (
                        <Typography variant="body2" color="text.secondary">{feedback.jobTitle}</Typography>
                    )}
                </Box>
            </Box>

            {/* Score Hero */}
            <Card sx={{ p: 4, background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`, color: 'white', borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
                    <Box>
                        <Typography variant="overline" sx={{ opacity: 0.85, letterSpacing: 2 }}>Overall Score</Typography>
                        <Typography variant="h1" fontWeight="bold" sx={{ fontSize: { xs: '3rem', md: '4rem' }, lineHeight: 1 }}>
                            {feedback.score}
                            <Typography component="span" variant="h4" sx={{ opacity: 0.7 }}>/100</Typography>
                        </Typography>
                        <Chip
                            label={feedback.skillLevel}
                            icon={<Star size={14} />}
                            sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                        />
                    </Box>
                    <Trophy size={80} style={{ opacity: 0.25 }} />
                </Box>
            </Card>

            <Box sx={{ mt: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card sx={{ p: 3, borderRadius: 3, height: '100%', borderLeft: `4px solid ${theme.palette.secondary.light}` }}>
                            <Typography sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircle size={20} color={theme.palette.secondary.main} />
                                Strengths
                            </Typography>
                            <List sx={{ pl: { xs: 0, md: 2 } }}>
                                {safeStrengths.map((item: string) => (
                                    <ListItem key={item} sx={{ px: 0, py: 0.5 }}>
                                        <Typography variant="body2" color="text.secondary">• {item}</Typography>
                                    </ListItem>
                                ))}
                            </List>
                            {safeStrengths.length === 0 && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No strengths data available.</Typography>
                            )}
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card sx={{ p: 3, borderRadius: 3, height: '100%', borderLeft: `4px solid ${theme.palette.primary.light}` }}>
                            <Typography sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AlertCircle size={20} color={theme.palette.primary.main} />
                                Areas for Improvement
                            </Typography>
                            <List sx={{ pl: 2 }}>
                                {safeWeaknesses.map((item: string) => (
                                    <ListItem key={item} sx={{ pl: 0, py: 0.5 }}>
                                        <Typography variant="body2" color="text.secondary">• {item}</Typography>
                                    </ListItem>
                                ))}
                            </List>
                            {safeWeaknesses.length === 0 && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No improvement areas identified.</Typography>
                            )}
                        </Card>
                    </Grid>
                </Box>
                {pieData.length > 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 1, flex: 1 }}>
                        <Card sx={{ p: 3, borderRadius: 3, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Typography variant="h6">
                                Evaluation Breakdown
                            </Typography>
                            <Box sx={{ width: '100%', minHeight: 300, display: 'flex', justifyContent: 'center' }}>
                                {isClient && (
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
                                            <Tooltip
                                                formatter={(value: number) => `${Math.round(value)}/10`}
                                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 8 }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </Box>
                        </Card>
                    </Box>
                )}
            </Box>

            {/* Learning Path */}
            {safeLearningPath.length > 0 && (
                <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <BookOpen size={20} color={theme.palette.primary.main} />
                        <Typography variant="h6" fontWeight="bold">Recommended Learning Path</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {safeLearningPath.map((step, i) => (
                            <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                <Box sx={{
                                    width: 28, height: 28, borderRadius: '50%', bgcolor: theme.palette.primary.main,
                                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                                }}>
                                    {i + 1}
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{step}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Card>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => router.push('/candidate/findInterview')}
                    sx={{ bgcolor: theme.palette.primary.main, '&:hover': { bgcolor: theme.palette.primary.dark }, px: 6, borderRadius: 2 }}
                >
                    Find More Interviews
                </Button>
            </Box>
        </Box>
    )
}
