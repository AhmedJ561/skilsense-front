'use client'

import { useState, useEffect } from 'react'
import { Play, Clock, BarChart3 } from 'lucide-react'

import {
  Box,
  Card,
  Typography,
  Button,
  Grid,
  List,
  Skeleton,
  DialogContent,
  ListItem,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Dialog from '@mui/material/Dialog'
import { useRouter } from 'next/navigation'

export default function MockInterviewPage() {
  const theme = useTheme()
  const router=useRouter()
  const [isLoading, setIsLoading] = useState(true)
const [openstableInternet, setOpenStableInternet] = useState(false)
const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 750) // 0.75 seconds loading time

    return () => clearTimeout(timer)
  }, [])


    const handleStartInterview = (difficulty: string) => {  
    
     // Here you can add logic to navigate to the interview interface or initialize the interview session
     setOpenStableInternet(false)
      router.push(`/candidate/mock-interview/${difficulty}`);
    }
   

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.text.primary, mb: 2, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' } }}>
          Start a Mock Interview
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
          Practice with AI-generated questions tailored to your skills
        </Typography>
      </Box>
      {isLoading ? (
  <Grid container spacing={3}>
    {[1, 2, 3].map((_, idx) => (
      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
        <Card sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Skeleton for title */}
          <Skeleton variant="text" width="60%" height={30} sx={{ mb: 3 }} />

          {/* Skeleton for duration */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Skeleton variant="circular" width={20} height={20} />
              <Skeleton variant="text" width="30%" height={20} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Skeleton variant="circular" width={20} height={20} />
              <Skeleton variant="text" width="40%" height={20} />
            </Box>
          </Box>

          {/* Skeleton for button */}
          <Skeleton variant="rounded" width="100%" height={40} />
        </Card>
      </Grid>
    ))}
  </Grid>
) : (
  <Grid container spacing={3}>
    {[
      { difficulty: 'Easy', duration: '5 mins', questions: '5' },
      { difficulty: 'Medium', duration: '15 mins', questions: '10' },
      { difficulty: 'Hard', duration: '30 mins', questions: '15' },
    ].map((session, idx) => (
      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
        <Card
          sx={{
            p: { xs: 3, sm: 4 },
            '&:hover': {
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease',
            },
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.text.primary, mb: 3 }}>
            {session.difficulty} Level
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: theme.palette.text.secondary }}>
              <Clock size={20} />
              <Typography variant="body2">{session.duration}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: theme.palette.text.secondary }}>
              <BarChart3 size={20} />
              <Typography variant="body2">{session.questions} Questions</Typography>
            </Box>
          </Box>
          <Button
            onClick={() => {
              setSelectedDifficulty(session.difficulty)
              setOpenStableInternet(true)
            }}
            variant="contained"
            fullWidth
            startIcon={<Play size={18} />}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
              '&:hover': { 
                background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 20px ${theme.palette.primary.main}66`,
              },
            }}
          >
            Start Interview
          </Button>
        </Card>
      </Grid>
    ))}
  </Grid>
)}

     <Dialog
  open={openstableInternet}
  onClose={() => setOpenStableInternet(false)}
>
  <DialogContent>
    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
      Stable Internet Required
    </Typography>

    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
      Please ensure you have a stable internet connection before starting the interview.
    </Typography>

    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
      <Button
        onClick={() => {
          if (!selectedDifficulty) return
          handleStartInterview(selectedDifficulty)
        }}
      >
        OK
      </Button>
    </Box>
  </DialogContent>
</Dialog>


      <Card sx={{ p: { xs: 3, sm: 4 } }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.text.primary, mb: 3 }}>
          How It Works
        </Typography>
        <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            'Select difficulty level and interview duration',
            'AI generates questions based on your skills',
            'Answer questions in the interview interface',
            'Get instant feedback and improvement suggestions',
            'Track your progress over time',
          ].map((step, idx) => (
            <ListItem key={idx} sx={{ display: 'flex', gap: 2, p: 0 }}>
              <Box
                sx={{
                  flexShrink: 0,
                  width: 32,
                  height: 32,
                  background: theme.palette.primary.main,
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                }}
              >
                {idx + 1}
              </Box>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, pt: 0.75 }}>
                {step}
              </Typography>
            </ListItem>
          ))}
        </List>
      </Card>
    </Box>
  )
}
