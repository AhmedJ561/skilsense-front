'use client'

import {
  Button, Card, Chip, Divider,
  LinearProgress, TextField, Typography, Radio,
  RadioGroup, FormControlLabel, Checkbox, FormGroup,
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Snackbar, Alert,
  Skeleton, Grid
} from '@mui/material';
import { Box } from '@mui/system';
import { ArchiveIcon, PersonStandingIcon, TimerIcon, Camera, Mic, AlertCircle } from 'lucide-react';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useInterviewStore } from '@/store/interview.store';
import { useRouter } from 'next/navigation';


// Define question types
interface Question {
  id?: string;
  question: string;
  type: 'radio' | 'checkbox' | 'text';
  options?: string[] | null;
  correctAnswers?: string[] | null;
  explanation?: string | null;
  skillCategory?: string;
  difficulty?: string;
  expectedKeywords?: string[];
}

interface UserAnswer {
  questionId: string;
  question: string;
  type: 'radio' | 'checkbox' | 'text';
  answer: string | string[];
  timeTaken: number; // seconds
  timestamp: Date;
}

interface InterviewStartupProps {
  interviewId: string
}

export default function InterviewStartup({ interviewId }: InterviewStartupProps) {
  const fetchInProgress = useRef(false);
  // Add this ref
  // State for current answer
  const [answer, setAnswer] = useState<string | string[]>('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const { getInterviewquestions, submitInterviewAnswers } = useInterviewStore();
  const [snapshots, setSnapshots] = useState<{ type: string; image: string }[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const router = useRouter();
  const [timePerQuestion, setTimePerQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-interview setup states
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [cameraGranted, setCameraGranted] = useState<boolean | null>(null);
  const [micGranted, setMicGranted] = useState<boolean | null>(null);
  const [screenGranted, setScreenGranted] = useState<boolean | null>(null);

  // Camera anti-cheat refs
  const videoRef = useRef<HTMLVideoElement>(null); // Hidden persistent capture video
  const setupVideoRef = useRef<HTMLVideoElement>(null); // Visible setup video
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  // Screen capture refs
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const screenCanvasRef = useRef<HTMLCanvasElement>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const midSnapshotTaken = useRef(false);

  // Store all user answers
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());

  // Dialog states
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isinitialMount = useRef(true);
  const formatTime = (sec: number) =>
    `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

  // ── Camera/Anti-cheat helpers ─────────────────────────────────────────────

  // Capture a frame from ANY video element into base64
  const captureFromVideo = useCallback((video: HTMLVideoElement | null, canvas: HTMLCanvasElement | null): string | null => {
    if (!video || !canvas || video.readyState < 2) return null;
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, 320, 240);
    return canvas.toDataURL('image/jpeg', 0.6).split(',')[1]; // base64 only
  }, []);

  // Webcam capture — used for START/MID/END/CAMERA labels
  const captureFrameAsBase64 = useCallback((): string | null => {
    if (!cameraStreamRef.current) return null;
    return captureFromVideo(videoRef.current, canvasRef.current);
  }, [captureFromVideo]);

  // Screen capture — used alongside webcam at START/MID/END
  const captureScreenAsBase64 = useCallback((): string | null => {
    if (!screenStreamRef.current) return null;
    return captureFromVideo(screenVideoRef.current, screenCanvasRef.current);
  }, [captureFromVideo]);

  // Add both webcam + screen snapshots at once (screen skipped for START)
  const sendSnapshot = useCallback((type: 'START' | 'MID' | 'END' | 'CAMERA') => {
    const webcamFrame = captureFrameAsBase64();
    const screenFrame = type !== 'START' ? captureScreenAsBase64() : null;

    setSnapshots(prev => {
      const next = [...prev];
      if (webcamFrame) next.push({ type, image: webcamFrame });
      if (screenFrame) next.push({ type: `${type}_SCREEN` as any, image: screenFrame });
      console.log(`[Snapshot] ${type}: webcam=${!!webcamFrame}, screen=${!!screenFrame}`);
      return next;
    });
  }, [captureFrameAsBase64, captureScreenAsBase64]);

  // Wait for a video element to be ready then capture
  const waitForVideoAndCapture = useCallback((type: 'START' | 'MID' | 'END' | 'CAMERA', maxWaitMs = 6000): void => {
    const video = videoRef.current;
    if (!video) return;

    const doCapture = () => sendSnapshot(type);

    if (video.readyState >= 2) {
      // Video already has data — capture immediately
      doCapture();
      return;
    }

    // Otherwise wait for loadeddata or a timeout fallback
    const onReady = () => {
      video.removeEventListener('loadeddata', onReady);
      clearTimeout(fallback);
      doCapture();
    };
    const fallback = setTimeout(() => {
      video.removeEventListener('loadeddata', onReady);
      doCapture(); // try anyway
    }, maxWaitMs);
    video.addEventListener('loadeddata', onReady);
  }, [sendSnapshot]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 }, audio: true });
      cameraStreamRef.current = stream;
      setCameraGranted(true);
      setMicGranted(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => { });
      }
      if (setupVideoRef.current) {
        setupVideoRef.current.srcObject = stream;
        setupVideoRef.current.play().catch(() => { });
      }
    } catch {
      setCameraGranted(false);
      setMicGranted(false);
      console.warn('Camera access denied — anti-cheat screenshots disabled');
    }
  }, []);

  const startScreenCapture = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: 1280, height: 720, displaySurface: 'monitor' } as any
      });
      screenStreamRef.current = stream;
      setScreenGranted(true);
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
        screenVideoRef.current.play().catch(() => { });
      }
      // If user stops screen share manually, clean up
      stream.getVideoTracks()[0]?.addEventListener('ended', () => {
        screenStreamRef.current = null;
        setScreenGranted(false);
      });
      console.log('[ScreenCapture] Screen sharing started');
    } catch (e) {
      setScreenGranted(false);
      console.warn('[ScreenCapture] Screen capture declined or unavailable:', e);
    }
  }, []);

  const stopCamera = useCallback(() => {
    cameraStreamRef.current?.getTracks().forEach(t => t.stop());
    cameraStreamRef.current = null;
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current = null;
  }, []);


  const parseQuestions = (questionsData: any): Question[] => {
    try {
      // If it's already an array, return it
      if (Array.isArray(questionsData)) {
        return questionsData;
      }

      // If it's a string, try to parse it
      if (typeof questionsData === 'string') {
        // Clean the string - remove markdown code blocks if present
        let cleaned = questionsData.trim();

        // Remove markdown code blocks if they exist
        if (cleaned.startsWith('```json')) {
          cleaned = cleaned.replace(/```json\n?/, '').replace(/\n?```$/, '');
        } else if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/```\n?/, '').replace(/\n?```$/, '');
        }

        // Remove any trailing commas before closing braces/brackets
        cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');

        try {
          return JSON.parse(cleaned);
        } catch (parseError) {
          console.error('Initial parse failed, attempting to fix JSON:', parseError);

          // Try to fix common JSON issues
          // 1. Add missing quotes around property names
          cleaned = cleaned.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');

          // 2. Fix single quotes to double quotes
          cleaned = cleaned.replace(/'/g, '"');

          // 3. Remove trailing commas
          cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');

          return JSON.parse(cleaned);
        }
      }

      // If it's an object with a questions property
      if (questionsData && questionsData.questions) {
        return parseQuestions(questionsData.questions);
      }

      console.error('Unexpected questions format:', questionsData);
      return [];
    } catch (error) {
      console.error('Error parsing questions:', error);
      return [];
    }
  };
  // Scroll to top when question changes
  useEffect(() => {
    if (isinitialMount.current) {
      isinitialMount.current = false;
      return;
    }
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [questionIndex]);


  // Scroll to top when question changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);


  useEffect(() => {
    if (!isSetupComplete) return; // Wait for setup to finish First

    // If we already have questions or fetch is in progress, don't fetch again
    if (questions.length > 0 || fetchInProgress.current) {
      console.log('⏭️ Skipping fetch - data already loaded or fetch in progress');
      return;
    }

    const fetchQuestions = async () => {
      // Prevent concurrent fetches
      if (fetchInProgress.current) {
        console.log('⚠️ Fetch already in progress, skipping');
        return;
      }

      fetchInProgress.current = true;
      setIsLoading(true);

      try {
        console.log('📝 Fetching interview questions for:', interviewId);
        const response = await getInterviewquestions(interviewId);
        console.log('📝 Get questions response:', response);

        if (response.success && response.result) {
          console.log('✅ Response received, parsing questions...');

          // Parse questions with error handling
          let parsedQuestions = [];
          try {
            parsedQuestions = parseQuestions(response.result.questions);
          } catch (parseError) {
            console.error('Failed to parse questions:', parseError);
            setSnackbar({
              open: true,
              message: 'Failed to parse questions. Please try again.',
              severity: 'error'
            });
            return;
          }

          // Filter valid questions
          const questionsWithIds = parsedQuestions
            .filter(q => q && typeof q.question === 'string')
            .map((q, index) => ({
              ...q,
              id: q.id || `q${index + 1}`,
              questionId: q.id || `q${index + 1}`,
              type: q.type || 'text',
              options: Array.isArray(q.options) ? q.options : []
            }));

          console.log('✅ Questions processed:', questionsWithIds.length);

          if (questionsWithIds.length === 0) {
            setSnackbar({
              open: true,
              message: 'No valid questions available',
              severity: 'error'
            });
            return;
          }

          // Set all the state
          setQuestions(questionsWithIds);
          setTimePerQuestion(response.result.timePerQuestion || 120);
          setTimeLeft(response.result.timePerQuestion || 120);
          setQuestionStartTime(new Date());
          // startCamera was already called during Setup phase
          // Take START snapshot after video is confirmed ready
          waitForVideoAndCapture('START');

        } else {
          console.error('API Error Response:', response);
          setSnackbar({
            open: true,
            message: response?.message || 'Failed to start interview from server',
            severity: 'error'
          });
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load questions. Please try again.',
          severity: 'error'
        });
      } finally {
        setIsLoading(false);
        fetchInProgress.current = false;
      }
    };

    fetchQuestions();

    // Cleanup function
    return () => {
      // Don't reset the refs on cleanup to prevent re-fetching
      console.log('🧹 Cleanup');
    };
  }, [interviewId, isSetupComplete]); // Depend on setup completion
  // Save answer when moving to next question
  const saveCurrentAnswer = () => {
    if (!questions[questionIndex]) return;

    const currentQuestion = questions[questionIndex];
    const endTime = new Date();
    const timeTaken = Math.floor((endTime.getTime() - questionStartTime.getTime()) / 1000);

    const userAnswer: UserAnswer = {
      questionId: currentQuestion.id || `q${questionIndex + 1}`,
      question: currentQuestion.question,
      type: currentQuestion.type,
      answer: answer,
      timeTaken,
      timestamp: new Date()
    };

    setUserAnswers(prev => {
      // Check if answer for this question already exists
      const existingIndex = prev.findIndex(a => a.questionId === userAnswer.questionId);
      if (existingIndex >= 0) {
        // Update existing answer
        const updated = [...prev];
        updated[existingIndex] = userAnswer;
        return updated;
      } else {
        // Add new answer
        return [...prev, userAnswer];
      }
    });

    // Reset start time for next question
    setQuestionStartTime(new Date());
  };

  // Handle moving to next question
  const handleNextQuestion = () => {
    if (questionIndex + 1 >= questions.length) {
      // Last question - show submit dialog
      saveCurrentAnswer();
      setSubmitDialogOpen(true);
      return;
    }

    // Save current answer
    saveCurrentAnswer();

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const nextIndex = questionIndex + 1;
    setQuestionIndex(nextIndex);

    // Check for MID snapshot (at halfway mark)
    if (!midSnapshotTaken.current && questions.length > 2 && nextIndex === Math.floor(questions.length / 2)) {
      midSnapshotTaken.current = true;
      sendSnapshot('MID');
    }

    const nextQuestion = questions[nextIndex];

    // Reset answer based on next question type
    if (nextQuestion.type === 'checkbox') {
      setAnswer([]);
    } else {
      setAnswer('');
    }

    setTimeLeft(timePerQuestion);
  };

  // Handle answer changes
  const handleAnswerChange = (value: string | string[]) => {
    setAnswer(value);
  };

  // Handle checkbox selection
  const handleCheckboxChange = (option: string) => {
    const currentAnswers = Array.isArray(answer) ? answer : [];

    if (currentAnswers.includes(option)) {
      setAnswer(currentAnswers.filter(item => item !== option));
    } else {
      setAnswer([...currentAnswers, option]);
    }
  };

  // Timer effect
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (timePerQuestion <= 0 || questions.length === 0) return;
    if (questionIndex >= questions.length) return;
    if (timeLeft <= 0) return;
    // Don't start timer if interview is already completed/submitted
    if (isSubmitting) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;

        if (newTime <= 0) {
          clearInterval(timerRef.current as NodeJS.Timeout);
          timerRef.current = null;

          // Don't auto-submit if already submitting or completed
          if (isSubmitting) return 0;

          // Auto-move to next question when time is up
          if (questionIndex + 1 < questions.length) {
            setTimeout(() => {
              if (!isSubmitting) {
                handleNextQuestion();
              }
            }, 100);
          } else {
            // Last question - save and open submit dialog (but don't auto-submit)
            if (!isSubmitting) {
              saveCurrentAnswer();
              setSubmitDialogOpen(true);
            }
          }
          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timePerQuestion, questionIndex, questions.length, timeLeft]);




  // Submit all answers
  const handleSubmitInterview = async () => {
    setIsSubmitting(true);
    try {
      // ── Capture END snapshot BEFORE stopping camera ──────────────────────────
      // (stopCamera() sets cameraStreamRef to null which breaks captureFrameAsBase64)
      const endWebcamFrame = captureFrameAsBase64();
      const endScreenFrame = captureScreenAsBase64();

      // Build final snapshot list including the END captures
      const finalSnapshots: { type: string; image: string }[] = [
        ...snapshots,
        ...(endWebcamFrame ? [{ type: 'END', image: endWebcamFrame }] : []),
        ...(endScreenFrame ? [{ type: 'END_SCREEN', image: endScreenFrame }] : []),
      ];
      console.log(`[Submit] Total snapshots: ${finalSnapshots.length}`, finalSnapshots.map(s => s.type));

      // Now safe to stop streams
      stopCamera();

      // Format answers for backend
      const formattedAnswers = userAnswers.map(answer => ({
        questionId: answer.questionId,
        question: answer.question,
        answer: Array.isArray(answer.answer) ? answer.answer.join(', ') : answer.answer,
        timeTaken: answer.timeTaken
      }));

      // Call submission API
      const response = await submitInterviewAnswers(interviewId, formattedAnswers, finalSnapshots);

      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Interview submitted! AI is evaluating your answers...',
          severity: 'success'
        });

        // Redirect to results page
        setTimeout(() => {
          if (response.result?.interviewCandidateId) {
            router.push(`/candidate/findInterview/feedback/${response.result.interviewCandidateId}`);
          } else {
            router.push(`/candidate/dashboard`);
          }
        }, 2000);
      } else {
        throw new Error(response.message || 'Submission failed');
      }
    } catch (error: any) {
      console.error('Error submitting interview:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to submit interview. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
      setSubmitDialogOpen(false);
    }
  };


  // Handle end interview
  const handleEndInterview = () => {
    setEndDialogOpen(true);
  };

  const handleConfirmEndInterview = async () => {
    setEndDialogOpen(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Save current answer if any
    if (isAnswerValid()) {
      saveCurrentAnswer();
    }

    // Submit whatever answers we have
    await handleSubmitInterview();
  };

  // Check if answer is valid
  const isAnswerValid = () => {
    const currentQuestion = questions[questionIndex];
    if (!currentQuestion) return false;

    switch (currentQuestion.type) {
      case 'text':
        return typeof answer === 'string' && answer.trim().length > 0;
      case 'radio':
        return typeof answer === 'string' && answer.length > 0;
      case 'checkbox':
        return Array.isArray(answer) && answer.length > 0;
      default:
        return false;
    }
  };

  // Handle paste prevention (only for text questions)
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    alert('Copy-paste is disabled for this mock interview. Please type your answer.');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      e.preventDefault();
      alert('Paste is disabled. Please type your answer.');
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    alert('Right-click menu is disabled for this text field.');
  };

  // Render answer input based on question type
  const renderAnswerInput = () => {
    const currentQuestion = questions[questionIndex];
    if (!currentQuestion) return null;

    const { type, options } = currentQuestion;

    switch (type) {
      case 'radio':
        return (
          <RadioGroup
            value={answer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            sx={{ mt: 2 }}
          >
            {options?.map((option, idx) => (
              <FormControlLabel
                key={idx}
                value={option}
                control={<Radio />}
                label={option}
                sx={{
                  mb: 1,
                  p: 1,
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              />
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        const checkboxAnswers = Array.isArray(answer) ? answer : [];
        return (
          <FormGroup sx={{ mt: 2 }}>
            {options?.map((option, idx) => (
              <FormControlLabel
                key={idx}
                control={
                  <Checkbox
                    checked={checkboxAnswers.includes(option)}
                    onChange={() => handleCheckboxChange(option)}
                  />
                }
                label={option}
                sx={{
                  mb: 1,
                  p: 1,
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              />
            ))}
          </FormGroup>
        );

      case 'text':
        return (
          <TextField
            multiline
            rows={8}
            fullWidth
            value={answer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            onContextMenu={handleContextMenu}
            placeholder="Type your answer here... Be as detailed as possible."
            inputProps={{
              onCopy: (e: React.ClipboardEvent) => e.preventDefault(),
              onCut: (e: React.ClipboardEvent) => e.preventDefault(),
              onDragStart: (e: React.DragEvent) => e.preventDefault(),
              onDrop: (e: React.DragEvent) => e.preventDefault(),
            }}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                fontSize: '0.95rem',
                lineHeight: 1.5,
                '&:hover': { backgroundColor: 'rgba(73, 187, 189, 0.04)' }
              }
            }}
          />
        );

      default:
        return null;
    }
  };



  const currentQuestion = questions[questionIndex] || questions[0] || null;


  const question = currentQuestion?.question || '';
  const type = currentQuestion?.type || 'text';


  return (
    <>
      {/* Hidden elements for anti-cheat capture */}
      <video ref={videoRef} style={{ display: 'none' }} autoPlay muted playsInline />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <canvas ref={screenCanvasRef} style={{ display: 'none' }} />
      <video ref={screenVideoRef} style={{ display: 'none' }} autoPlay muted playsInline />

      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3, display: 'flex', justifyContent: 'center' }}>

        {!isSetupComplete ? (
          <Card sx={{ maxWidth: 800, width: '100%', p: 4 }}>
            <Typography variant="h4" fontWeight="bold" align="center" mb={2}>
              Interview Setup
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center" mb={4}>
              Before we begin, we need to ensure your camera and microphone are working properly.
              This interview may be proctored using snapshots to ensure fairness.
            </Typography>

            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{
                    width: '100%',
                    height: 240,
                    bgcolor: 'grey.900',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <video
                    ref={setupVideoRef}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    autoPlay
                    muted
                    playsInline
                  />
                  {cameraGranted === false && (
                    <Typography color="error" variant="body2" sx={{ position: 'absolute' }}>
                      Camera Access Denied
                    </Typography>
                  )}
                  {cameraGranted === null && (
                    <Typography color="white" variant="body2" sx={{ position: 'absolute' }}>
                      Camera Preview
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box display="flex" flexDirection="column" gap={3}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: cameraGranted ? 'success.light' : cameraGranted === false ? 'error.light' : 'grey.200' }}>
                      <Camera color={cameraGranted ? '#1b5e20' : cameraGranted === false ? '#b71c1c' : '#757575'} />
                    </Box>
                    <Box>
                      <Typography fontWeight="bold">Camera Access</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {cameraGranted ? 'Access granted' : cameraGranted === false ? 'Access denied' : 'Pending permission'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" gap={2}>
                    <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: micGranted ? 'success.light' : micGranted === false ? 'error.light' : 'grey.200' }}>
                      <Mic color={micGranted ? '#1b5e20' : micGranted === false ? '#b71c1c' : '#757575'} />
                    </Box>
                    <Box>
                      <Typography fontWeight="bold">Microphone Access</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {micGranted ? 'Access granted' : micGranted === false ? 'Access denied' : 'Pending permission'}
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={startCamera}
                    sx={{ mt: 2 }}
                    color={cameraGranted === false ? 'error' : 'primary'}
                  >
                    {cameraGranted === null ? 'Request Permissions' : 'Test Again'}
                  </Button>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={1}>
                <AlertCircle size={16} /> Ensure you are in a quiet and well-lit environment.
              </Typography>
              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={startScreenCapture}
                  color={screenGranted ? 'success' : screenGranted === false ? 'error' : 'inherit'}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {screenGranted ? '✓ Screen Shared' : 'Share Entire Screen'}
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  disabled={!cameraGranted || !screenGranted}
                  onClick={() => setIsSetupComplete(true)}
                >
                  Start Interview
                </Button>
              </Box>
            </Box>
          </Card>
        ) : isLoading ? (
          <Card sx={{ maxWidth: 900, width: '100%', p: 3 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Skeleton variant="text" width="60%" height={30} />
              <Skeleton variant="rounded" width={120} height={32} />
            </Box>

            {/* Progress bar */}
            <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 4, mb: 2 }} />

            {/* Question counter and stats */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Skeleton variant="text" width="45%" height={20} />
              <Skeleton variant="text" width="25%" height={20} />
            </Box>

            {/* Question */}
            <Box mt={2} p={2} sx={{ bgcolor: 'grey.50', borderRadius: 2 }}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="text" width="30%" height={24} />
              </Box>
              <Skeleton variant="text" width="100%" height={60} />
              <Skeleton variant="text" width="90%" height={20} sx={{ mt: 1 }} />
              <Skeleton variant="text" width="95%" height={20} />
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Answer Section */}
            <Box mt={2}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="text" width="20%" height={24} />
                <Skeleton variant="rounded" width={120} height={28} sx={{ ml: 'auto' }} />
              </Box>

              <Skeleton variant="rectangular" width="100%" height={80} sx={{ borderRadius: 2, mb: 1 }} />

              {/* Instructions */}
              <Skeleton variant="text" width="50%" height={16} />
            </Box>

            {/* Actions */}
            <Box display="flex" justifyContent="space-between" mt={2}>
              <Skeleton variant="rounded" width={150} height={36} />
              <Box display="flex" gap={2}>
                <Skeleton variant="text" width={80} height={20} sx={{ alignSelf: 'center' }} />
                <Skeleton variant="rounded" width={150} height={36} />
              </Box>
            </Box>

            {/* Interview info */}
            <Box mt={1} pt={1} sx={{ borderTop: '1px dashed', borderColor: 'divider' }}>
              <Skeleton variant="text" width="40%" height={16} />
            </Box>
          </Card>
        ) : questions.length === 0 ? (
          <Card sx={{ maxWidth: 900, width: '100%', p: 5, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <AlertCircle size={48} color="#d32f2f" />
            </Box>
            <Typography variant="h5" color="error" gutterBottom fontWeight="bold">
              Failed to Load Interview Questions
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              The AI was unable to generate questions for this interview. Please try again or verify your profile skills are fully updated.
            </Typography>
            <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
              Try Again
            </Button>
          </Card>
        ) : (
          <Card sx={{ maxWidth: 900, width: '100%', p: 3 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" fontWeight="bold">
                Interview
              </Typography>
              <Chip
                icon={<TimerIcon />}
                label={`Time: ${formatTime(timeLeft)}`}
                color={timeLeft < 10 ? 'error' : timeLeft < 30 ? 'warning' : 'primary'}
              />
            </Box>

            {/* Progress bar */}
            <LinearProgress
              value={questions.length > 0 ? ((questionIndex + 1) / questions.length) * 100 : 0}
              variant="determinate"
              sx={{ my: 2, height: 8, borderRadius: 4 }}
            />

            {/* Question counter and stats */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Question {questionIndex + 1} of {questions.length} • {userAnswers.length} answered
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatTime(timePerQuestion)} per question
              </Typography>
            </Box>

            {/* Question */}
            <Box mt={2} p={2} sx={{ bgcolor: 'grey.50', borderRadius: 2 }}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <ArchiveIcon />
                <Typography fontWeight="bold">
                  Question {questionIndex + 1}
                </Typography>

              </Box>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                {question}
              </Typography>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Answer Section */}
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <PersonStandingIcon color="action" />
                <Typography fontWeight="bold">Your Answer</Typography>
                <Chip
                  label={
                    type === 'text' ? `${typeof answer === 'string' ? answer.length : 0} characters` :
                      type === 'radio' ? 'Select one' :
                        type === 'checkbox' ? `${Array.isArray(answer) ? answer.length : 0} selected` :
                          'Answer'
                  }
                  size="small"
                  variant="outlined"
                  sx={{ ml: 'auto' }}
                />
              </Box>

              {renderAnswerInput()}

              {/* Instructions */}
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                {type === 'radio' && 'Select one correct answer'}
                {type === 'checkbox' && 'Select all correct answers'}
                {type === 'text' && 'Type your answer (copy-paste is disabled)'}
              </Typography>
            </Box>

            {/* Actions */}
            <Box display="flex" justifyContent="space-between" mt={2}>
              <Button
                variant="outlined"
                color="error"
                onClick={handleEndInterview}
                sx={{ minWidth: 150 }}
              >
                End Interview
              </Button>

              <Box display="flex" gap={2}>
                <Typography variant="body2" sx={{ alignSelf: 'center', color: 'text.secondary' }}>
                  Auto-next in: {formatTime(timeLeft)}
                </Typography>
                <Button
                  variant="contained"
                  disabled={!isAnswerValid()}
                  onClick={handleNextQuestion}
                  sx={{ minWidth: 150 }}
                >
                  {questionIndex + 1 >= questions.length ? 'Complete Interview' : 'Next Question'}
                </Button>
              </Box>
            </Box>

            {/* Interview info */}
            <Box mt={1} pt={1} sx={{ borderTop: '1px dashed', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Questions: {questions.length}
              </Typography>
            </Box>
          </Card>
        )}
      </Box>

      {/* End Interview Dialog */}
      <Dialog open={endDialogOpen} onClose={() => setEndDialogOpen(false)}>
        <DialogTitle>End Interview?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to end the interview?
            {userAnswers.length > 0
              ? ` You have answered ${userAnswers.length} out of ${questions.length} questions. Your progress will be saved.`
              : ' You have not answered any questions yet.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEndDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmEndInterview} color="error" variant="contained">
            End Interview
          </Button>
        </DialogActions>
      </Dialog>

      {/* Submit Interview Dialog */}
      <Dialog open={submitDialogOpen} onClose={() => setSubmitDialogOpen(false)}>
        <DialogTitle>Submit Interview?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have completed all questions. You answered {userAnswers.length} out of {questions.length} questions.
            Are you ready to submit your answers for evaluation?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitDialogOpen(false)} disabled={isSubmitting}>
            Review Answers
          </Button>
          <Button
            onClick={handleSubmitInterview}
            color="primary"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Interview'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}