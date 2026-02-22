'use client'

import {
  Button, Card, Chip, Divider,
  LinearProgress, TextField, Typography, Radio,
  RadioGroup, FormControlLabel, Checkbox, FormGroup,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Snackbar, Alert,
  Skeleton
} from '@mui/material';
import { Box } from '@mui/system';
import { ArchiveIcon, PersonStandingIcon, TimerIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import { useMockInterviewStore } from '@/store/mock-interview.store';
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

export default function Page() {
  const params = useParams();
  // const router = useRouter();
  const MockInterviewDifficultyParam = params?.difficulty;
  // Use a ref to track if data is already loaded
  const isDataLoaded = useRef(false);
  const fetchInProgress = useRef(false);
  // Add this ref
  // State for current answer
  const [answer, setAnswer] = useState<string | string[]>('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const { getMockQuestions, submitMockAnswers } = useMockInterviewStore(); // Add submitMockAnswers to store
  const [questions, setQuestions] = useState<Question[]>([]);
  const router = useRouter();
  const [timePerQuestion, setTimePerQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);



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
        const difficulty = MockInterviewDifficultyParam?.toString() || 'easy';
        console.log('🚀 Fetching questions with difficulty:', difficulty);

        const response = await getMockQuestions(difficulty);

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
          // attemptId is generated on submit now
          setTimePerQuestion(response.result.timePerQuestion);
          setTimeLeft(response.result.timePerQuestion);
          setQuestionStartTime(new Date());

          const firstQuestion = questionsWithIds[0];
          setAnswer(firstQuestion.type === 'checkbox' ? [] : '');

          // Mark as loaded after successful state updates
          isDataLoaded.current = true;
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
  }, [MockInterviewDifficultyParam]);
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

    const nextQuestion = questions[questionIndex + 1];
    setQuestionIndex(prev => prev + 1);

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
      // Format answers for backend
      const formattedAnswers = userAnswers.map(answer => ({
        questionId: answer.questionId,
        question: answer.question,
        answer: Array.isArray(answer.answer) ? answer.answer.join(', ') : answer.answer,
        timeTaken: answer.timeTaken
      }));

      // Call submission API
      const difficulty = MockInterviewDifficultyParam?.toString() || 'easy';
      const response = await submitMockAnswers(difficulty, formattedAnswers);

      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Interview submitted successfully!',
          severity: 'success'
        });

        // Redirect to results page
        setTimeout(() => {
          if (response.result?.attemptId) {
            router.push(`/candidate/mock-interview/feedback/${response.result.attemptId}`);
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
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3, display: 'flex', justifyContent: 'center' }}>

        {isLoading ? (
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
        ) : (
          <Card sx={{ maxWidth: 900, width: '100%', p: 3 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" fontWeight="bold">
                Mock Interview — {MockInterviewDifficultyParam?.toString().toUpperCase() || 'EASY'} Level
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