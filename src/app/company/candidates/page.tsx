'use client'
import { Search, Mail, Eye, Trophy, CheckCircle, TrendingDown, BookOpen, UserCheck, UserX, Users, RefreshCw } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Card, Typography, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, InputAdornment,
  CircularProgress, Alert, Tab, Tabs, Modal, Divider, Button,
  LinearProgress, Avatar, Grid, Snackbar, Dialog,
} from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import { useInterviewStore } from '@/store/interview.store'

interface Candidate {
  _id: string
  rank?: number
  candidate: { _id: string; name: string; email: string }
  interview: { _id: string; jobTitle: string }
  attended: boolean
  isHired: boolean
  score?: number
  skillLevel?: string
  aiFeedback?: { strengths: string[]; weaknesses: string[]; learningPath: string[] }
  evaluation?: { conceptAccuracy: number; depthOfAnswer: number; relevance: number; timeEfficiency: number }
  snapshots?: { type: string; image: string; capturedAt: string }[]
  shortlisted?: boolean
}

const evalLabels: Record<string, string> = {
  conceptAccuracy: 'Concept Accuracy',
  depthOfAnswer: 'Answer Depth',
  relevance: 'Relevance',
  timeEfficiency: 'Time Efficiency',
}

const scoreColor = (score: number) => {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#f59e0b'
  return '#ef4444'
}

export default function CandidatesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [shortlist, setShortlist] = useState<Candidate[]>([])
  const [hiredCandidates, setHiredCandidates] = useState<Candidate[]>([])
  const [tab, setTab] = useState(0)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [reEvalLoading, setReEvalLoading] = useState(false)
  const [viewerImage, setViewerImage] = useState<{ src: string, type: string } | null>(null)
  const theme = useTheme()
  const { getCompanyCandidates, getCompanyShortlist, getCandidateDetail, reEvaluateFeedback, markHired, markShortlist, deleteCandidate } = useInterviewStore()

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [candRes, shortRes] = await Promise.all([
        getCompanyCandidates(),
        getCompanyShortlist(),
      ])
      if (candRes.success) {
        const allCandidates = candRes.candidates || []
        // Distinct separations based on user request:
        const hired = allCandidates.filter(c => c.isHired)
        const pureCandidates = allCandidates.filter(c => !c.isHired && !c.shortlisted)

        setHiredCandidates(hired)
        setCandidates(pureCandidates)
      } else setError(candRes.message || 'Failed to fetch candidates')

      if (shortRes.success) {
        const shortData = shortRes.candidates || []
        // Ensure shortlisted doesn't arbitrarily retain hired candidates either:
        setShortlist(shortData.filter(c => !c.isHired))
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }, [getCompanyCandidates, getCompanyShortlist])

  useEffect(() => { loadData() }, [loadData])

  const handleViewDetail = async (c: Candidate) => {
    setDetailLoading(true)
    setSelectedCandidate(c)
    try {
      const res = await getCandidateDetail(c._id)
      console.log('[CandidateDetail] API response:', JSON.stringify({
        success: res.success,
        hasResult: !!res.result,
        aiFeedback: res.result?.aiFeedback,
        snapshotCount: res.result?.snapshots?.length,
        status: res.result?.status,
        score: res.result?.score,
      }, null, 2))
      if (res.success && res.result) setSelectedCandidate(res.result)
    } catch (e) {
      console.error('[CandidateDetail] fetch failed:', e)
      /* use existing data */
    } finally {
      setDetailLoading(false)
    }
  }

  const handleHire = async (id: string, hired: boolean) => {
    const res = await markHired(id, hired)
    setSnackbar({ open: true, message: res.message, severity: res.success ? 'success' : 'error' })
    if (res.success) {
      setSelectedCandidate(prev => prev ? { ...prev, isHired: hired } : prev)
      await loadData()
    }
  }

  const handleShortlist = async (id: string, shortlisted: boolean) => {
    const res = await markShortlist(id, shortlisted)
    setSnackbar({ open: true, message: res.message, severity: res.success ? 'success' : 'error' })
    if (res.success) {
      setSelectedCandidate(prev => prev ? { ...prev, shortlisted } : prev)
      await loadData()
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to completely erase ${name} from your system?`)) return
    setDeleteLoading(id)
    const res = await deleteCandidate(id)
    setSnackbar({ open: true, message: res.message, severity: res.success ? 'success' : 'error' })
    if (res.success) {
      if (selectedCandidate?._id === id) setSelectedCandidate(null)
      await loadData()
    }
    setDeleteLoading(null)
  }

  const handleReEvaluate = async () => {
    if (!selectedCandidate) return
    setReEvalLoading(true)
    const res = await reEvaluateFeedback(selectedCandidate._id)
    setSnackbar({ open: true, message: res.message, severity: res.success ? 'success' : 'error' })
    if (res.success && res.result) setSelectedCandidate(res.result)
    setReEvalLoading(false)
  }

  // Update active list based on tab
  const activeList = tab === 0 ? candidates
    : tab === 1 ? shortlist
      : tab === 2 ? shortlist.filter(c => c.shortlisted)
        : hiredCandidates
  const filtered = activeList.filter(c =>
    c.candidate?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.candidate?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.interview?.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const groupedShortlist = useMemo(() => {
    if (tab !== 1 && tab !== 2) return null;
    const groups: Record<string, Candidate[]> = {};
    filtered.forEach(c => {
      const job = c.interview?.jobTitle || 'Unknown Role';
      if (!groups[job]) groups[job] = [];
      groups[job].push(c);
    });
    Object.values(groups).forEach(list => {
      list.sort((a, b) => (b.score || 0) - (a.score || 0));
    });
    return groups;
  }, [filtered, tab]);

  const renderCandidateRow = (c: Candidate, idx: number, showRank: boolean) => (
    <TableRow key={c._id} sx={{ '&:hover': { bgcolor: 'white' }, transition: 'background-color 0.2s', borderBottom: '1px solid #e2e8f0' }}>
      {showRank && (
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {(idx + 1) <= 3 ? <Trophy size={16} color={['#f59e0b', '#9ca3af', '#cd7f32'][(idx + 1) - 1]} /> : null}
            <Typography fontWeight={600}>#{idx + 1}</Typography>
          </Box>
        </TableCell>
      )}
      <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>{c.candidate?.name || '—'}</TableCell>
      <TableCell sx={{ color: theme.palette.text.secondary }}>{c.candidate?.email || '—'}</TableCell>
      <TableCell sx={{ color: theme.palette.text.secondary }}>{c.interview?.jobTitle || '—'}</TableCell>
      {showRank && (
        <TableCell><Typography fontWeight={700} color={scoreColor(c.score || 0)}>{c.score ?? '—'}</Typography></TableCell>
      )}
      {showRank && (
        <TableCell>
          <Chip label={c.skillLevel || '—'} size="small" sx={{ bgcolor: alpha(scoreColor(c.score || 0), 0.1), color: scoreColor(c.score || 0), fontWeight: 600 }} />
        </TableCell>
      )}
      <TableCell>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={c.isHired ? 'Hired' : c.attended ? 'Attended' : 'Registered'} size="small" sx={{ backgroundColor: c.isHired ? '#dcfce7' : c.attended ? '#dbeafe' : '#fef3c7', color: c.isHired ? '#166534' : c.attended ? '#1e40af' : '#92400e', fontWeight: 500 }} />
          {c.shortlisted && <Chip label="Shortlisted" size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 500 }} />}
        </Box>
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {!c.isHired && (
            <Button size="small" variant={c.shortlisted ? 'outlined' : 'contained'} onClick={() => handleShortlist(c._id, !c.shortlisted)} sx={{ minWidth: 0, px: 1, fontSize: '0.65rem', bgcolor: c.shortlisted ? undefined : '#f59e0b', borderColor: c.shortlisted ? '#ef4444' : undefined, color: c.shortlisted ? '#ef4444' : 'white', '&:hover': { bgcolor: c.shortlisted ? alpha('#ef4444', 0.1) : '#d97706' } }}>
              {c.shortlisted ? 'Remove Shortlist' : 'Shortlist'}
            </Button>
          )}
          <Button size="small" variant={c.isHired ? 'outlined' : 'contained'} onClick={() => handleHire(c._id, !c.isHired)} sx={{ minWidth: 0, px: 1, fontSize: '0.65rem', bgcolor: c.isHired ? undefined : '#22c55e', borderColor: c.isHired ? '#ef4444' : undefined, color: c.isHired ? '#ef4444' : 'white', '&:hover': { bgcolor: c.isHired ? alpha('#ef4444', 0.1) : '#16a34a' } }}>
            {c.isHired ? 'Remove' : 'Hire'}
          </Button>
          <IconButton size="small" onClick={() => handleViewDetail(c)} sx={{ p: 1 }} title="View Detail"><Eye size={18} color={theme.palette.text.secondary} /></IconButton>
          <IconButton size="small" component="a" href={`mailto:${c.candidate?.email}`} sx={{ p: 1 }}><Mail size={18} color={theme.palette.text.secondary} /></IconButton>
          <IconButton size="small" onClick={() => handleDelete(c._id, c.candidate?.name)} disabled={deleteLoading === c._id} sx={{ p: 1, color: '#ef4444' }} title="Clear Data">
            {deleteLoading === c._id ? <CircularProgress size={18} /> : <UserX size={18} />}
          </IconButton>
        </Box>
      </TableCell>
    </TableRow>
  )

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 3 }}>
        <CircularProgress sx={{ color: '#49BBBD' }} />
        <Typography variant="h6" sx={{ color: '#49BBBD', fontWeight: 500 }}>Loading candidates...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.text.primary, mb: 1 }}>Candidates</Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
          View candidates and AI-ranked shortlist
        </Typography>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Users size={16} />All Candidates ({candidates.length})</Box>} />
        <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Trophy size={16} />Evaluation Rankings ({shortlist.length})</Box>} />
        <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><BookOpen size={16} />My Shortlist ({shortlist.filter(c => c.shortlisted).length})</Box>} />
        <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CheckCircle size={16} />Hired ({hiredCandidates.length})</Box>} />
      </Tabs>

      {tab === 1 && (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Candidates below are ranked by AI evaluation score (highest first). All submitted interviews appear here.
        </Alert>
      )}
      {tab === 2 && (
        <Alert severity="success" sx={{ borderRadius: 2, bgcolor: alpha('#f59e0b', 0.1), color: '#b45309', border: '1px solid #fcd34d' }}>
          Candidates you have manually shortlisted for further consideration.
        </Alert>
      )}
      {tab === 3 && (
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          Candidates you have marked as hired for your company.
        </Alert>
      )}

      <Card sx={{
        p: { xs: 2, sm: 3, md: 4 },
        borderRadius: 3,
        backgroundColor: '#f9fafb',
        border: '1px solid #e2e8f0',
        boxShadow: theme.shadows[1],
        overflow: 'hidden'
      }}>
        <TextField
          fullWidth
          placeholder="Search by name, email, or job title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search size={20} color={theme.palette.text.secondary} /></InputAdornment> }}
        />

        {filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography sx={{ color: 'text.secondary' }} variant="body2">
              {activeList.length === 0
                ? tab === 0 ? 'No candidates have attended your interviews yet.'
                  : tab === 1 ? 'No submitted interviews yet. Candidates will appear here once they complete interviews.'
                    : tab === 2 ? 'You have not shortlisted any candidates yet.'
                      : 'No hired candidates yet. Mark candidates as hired to see them here.'
                : 'No results match your search.'}
            </Typography>
          </Box>
        ) : (tab === 1 || tab === 2) && groupedShortlist ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {Object.entries(groupedShortlist).map(([jobTitle, candidatesList]) => (
              <Box key={jobTitle}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: theme.palette.primary.main }}>
                  {jobTitle}
                  <Chip size="small" label={`${(candidatesList as Candidate[]).length} shortlisted`} sx={{ ml: 1.5, verticalAlign: 'middle', fontWeight: 600, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }} />
                </Typography>
                <TableContainer component={Card} variant="outlined" sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha('#49BBBD', 0.05) }}>
                        <TableCell sx={{ fontWeight: 600 }}>Rank</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>Applied For</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>Score</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>Level</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(candidatesList as Candidate[]).map((c: Candidate, idx: number) => renderCandidateRow(c, idx, true))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha('#49BBBD', 0.05) }}>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>Applied For</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((c: Candidate, idx: number) => renderCandidateRow(c, idx, false))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Candidate Detail Modal */}
      <Modal open={!!selectedCandidate} onClose={() => setSelectedCandidate(null)}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper', borderRadius: 2, p: { xs: 3, md: 4 },
          width: { xs: '95vw', sm: '80vw', md: '65vw' }, maxHeight: '90vh', overflowY: 'auto',
          boxShadow: theme.shadows[24],
        }}>
          {detailLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: '#49BBBD' }} /></Box>
          ) : selectedCandidate ? (
            <>
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: '#49BBBD', fontSize: '1.5rem', fontWeight: 700 }}>
                  {selectedCandidate.candidate?.name?.[0]?.toUpperCase() || '?'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" fontWeight="bold">{selectedCandidate.candidate?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedCandidate.candidate?.email}</Typography>
                  <Typography variant="caption" color="text.secondary">{selectedCandidate.interview?.jobTitle}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {!selectedCandidate.isHired && (
                    <Button
                      variant={selectedCandidate.shortlisted ? 'outlined' : 'contained'}
                      size="small"
                      onClick={() => handleShortlist(selectedCandidate._id, !selectedCandidate.shortlisted)}
                      sx={{
                        bgcolor: selectedCandidate.shortlisted ? undefined : '#f59e0b',
                        borderColor: selectedCandidate.shortlisted ? '#ef4444' : undefined,
                        color: selectedCandidate.shortlisted ? '#ef4444' : 'white',
                        '&:hover': { bgcolor: selectedCandidate.shortlisted ? alpha('#ef4444', 0.1) : '#d97706' }
                      }}
                    >
                      {selectedCandidate.shortlisted ? 'Remove Shortlist' : 'Shortlist'}
                    </Button>
                  )}
                  <Button
                    variant={selectedCandidate.isHired ? 'outlined' : 'contained'}
                    size="small"
                    startIcon={selectedCandidate.isHired ? <UserX size={16} /> : <UserCheck size={16} />}
                    onClick={() => handleHire(selectedCandidate._id, !selectedCandidate.isHired)}
                    sx={{
                      bgcolor: selectedCandidate.isHired ? undefined : '#22c55e',
                      borderColor: selectedCandidate.isHired ? '#ef4444' : undefined,
                      color: selectedCandidate.isHired ? '#ef4444' : 'white',
                      '&:hover': { bgcolor: selectedCandidate.isHired ? alpha('#ef4444', 0.1) : '#16a34a' }
                    }}
                  >
                    {selectedCandidate.isHired ? 'Remove Hire' : 'Mark as Hired'}
                  </Button>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Score + Level */}
              {selectedCandidate.score !== undefined && (
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                  <Card sx={{ p: 2, flex: 1, minWidth: 100, textAlign: 'center', border: `2px solid ${scoreColor(selectedCandidate.score)}` }}>
                    <Typography variant="h3" fontWeight="bold" color={scoreColor(selectedCandidate.score)}>{selectedCandidate.score}</Typography>
                    <Typography variant="caption" color="text.secondary">AI Score /100</Typography>
                  </Card>
                  <Card sx={{ p: 2, flex: 1, minWidth: 100, textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">{selectedCandidate.skillLevel || '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">Skill Level</Typography>
                  </Card>
                  <Card sx={{ p: 2, flex: 1, minWidth: 100, textAlign: 'center' }}>
                    <Chip label={selectedCandidate.isHired ? 'Hired' : selectedCandidate.attended ? 'Attended' : 'Registered'}
                      sx={{ bgcolor: selectedCandidate.isHired ? '#dcfce7' : '#dbeafe', color: selectedCandidate.isHired ? '#166534' : '#1e40af', fontWeight: 600 }} />
                    <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>Status</Typography>
                  </Card>
                </Box>
              )}

              {/* Not Submitted Banner */}
              {(selectedCandidate as any).status !== 'SUBMITTED' && !selectedCandidate.aiFeedback && (
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                  This candidate has <strong>not yet submitted</strong> their interview. Strengths, weaknesses, evaluation scores, and snapshots will appear here once they complete and submit.
                </Alert>
              )}

              {/* Re-evaluate button for submitted but empty feedback */}
              {(selectedCandidate as any).status === 'SUBMITTED' &&
                (!selectedCandidate.aiFeedback ||
                  (selectedCandidate.aiFeedback.strengths?.length === 0 &&
                    selectedCandidate.aiFeedback.weaknesses?.length === 0)) && (
                  <Alert
                    severity="warning"
                    sx={{ mb: 3, borderRadius: 2 }}
                    action={
                      <Button
                        size="small"
                        startIcon={reEvalLoading ? <CircularProgress size={14} color="inherit" /> : <RefreshCw size={14} />}
                        onClick={handleReEvaluate}
                        disabled={reEvalLoading}
                        sx={{ whiteSpace: 'nowrap', color: '#92400e' }}
                      >
                        {reEvalLoading ? 'Generating...' : 'Re-generate'}
                      </Button>
                    }
                  >
                    AI feedback was not saved correctly for this submission. Click Re-generate to fix it.
                  </Alert>
                )}

              {/* Evaluation */}
              {selectedCandidate.evaluation && (
                <Box mb={3}>
                  <Typography variant="subtitle1" fontWeight={700} mb={1.5}>Performance Breakdown</Typography>
                  {Object.entries(selectedCandidate.evaluation).filter(([k]) => k in evalLabels).map(([key, val]) => (
                    <Box key={key} mb={1.5}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">{evalLabels[key]}</Typography>
                        <Typography variant="body2" fontWeight={700} color={scoreColor((val as number) * 10)}>{val as number}/10</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={(val as number) * 10}
                        sx={{ height: 6, borderRadius: 3, bgcolor: 'grey.100', '& .MuiLinearProgress-bar': { bgcolor: scoreColor((val as number) * 10) } }} />
                    </Box>
                  ))}
                </Box>
              )}

              {/* AI Feedback */}
              {selectedCandidate.aiFeedback ? (
                <Grid container spacing={2} mb={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ p: 2, borderLeft: '3px solid #22c55e', height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <CheckCircle size={16} color="#22c55e" />
                        <Typography variant="subtitle2" fontWeight={700}>Strengths</Typography>
                      </Box>
                      {selectedCandidate.aiFeedback.strengths?.length > 0
                        ? selectedCandidate.aiFeedback.strengths.map((s, i) => (
                          <Typography key={i} variant="body2" color="text.secondary" mb={0.5}>• {s}</Typography>
                        ))
                        : <Typography variant="body2" color="text.disabled">No strengths recorded.</Typography>
                      }
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ p: 2, borderLeft: '3px solid #ef4444', height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <TrendingDown size={16} color="#ef4444" />
                        <Typography variant="subtitle2" fontWeight={700}>Areas to Improve</Typography>
                      </Box>
                      {selectedCandidate.aiFeedback.weaknesses?.length > 0
                        ? selectedCandidate.aiFeedback.weaknesses.map((w, i) => (
                          <Typography key={i} variant="body2" color="text.secondary" mb={0.5}>• {w}</Typography>
                        ))
                        : <Typography variant="body2" color="text.disabled">No weaknesses recorded.</Typography>
                      }
                    </Card>
                  </Grid>
                  {(selectedCandidate.aiFeedback.learningPath?.length ?? 0) > 0 && (
                    <Grid size={12}>
                      <Card sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                          <BookOpen size={16} color="#49BBBD" />
                          <Typography variant="subtitle2" fontWeight={700}>Learning Path</Typography>
                        </Box>
                        {selectedCandidate.aiFeedback.learningPath.map((step, i) => (
                          <Typography key={i} variant="body2" color="text.secondary" mb={0.5}>{i + 1}. {step}</Typography>
                        ))}
                      </Card>
                    </Grid>
                  )}
                </Grid>
              ) : null}

              {/* Snapshots */}
              {selectedCandidate.snapshots && selectedCandidate.snapshots.length > 0 ? (
                <Box mb={3}>
                  <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
                    Anti-Cheat Captures ({selectedCandidate.snapshots.length} photos)
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {selectedCandidate.snapshots.map((snap, i) => (
                      <Box key={i} sx={{ position: 'relative' }}>
                        <img
                          src={`data:image/jpeg;base64,${snap.image}`}
                          alt={`Snapshot ${snap.type}`}
                          onClick={() => setViewerImage({ src: snap.image, type: snap.type })}
                          style={{
                            cursor: 'pointer', width: '100%', height: 120, objectFit: 'cover', borderRadius: 8,
                            border: '2px solid #e2e8f0', transition: 'transform 0.2s ease-in-out'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        />
                        <Chip
                          label={snap.type}
                          size="small"
                          sx={{
                            position: 'absolute', top: 4, left: 4,
                            bgcolor: snap.type.includes('SCREEN')
                              ? '#6366f1'
                              : snap.type === 'START' ? '#22c55e' : snap.type === 'END' ? '#ef4444' : '#f59e0b',
                            color: 'white', fontSize: '0.65rem', height: 18,
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={0.5}>
                          {new Date(snap.capturedAt).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (selectedCandidate as any).status === 'SUBMITTED' ? (
                <Box mb={3}>
                  <Typography variant="subtitle1" fontWeight={700} mb={1}>
                    Anti-Cheat Captures
                  </Typography>
                  <Typography variant="body2" color="text.secondary">No snapshots were captured during this session.</Typography>
                </Box>
              ) : null}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button variant="outlined" onClick={() => setSelectedCandidate(null)}>Close</Button>
              </Box>
            </>
          ) : null}
        </Box>
      </Modal>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>

      <Dialog open={!!viewerImage} onClose={() => setViewerImage(null)} maxWidth="lg" fullWidth PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none' } }}>
        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', p: 1 }}>
          {viewerImage && (
            <>
              <Chip
                label={viewerImage.type}
                sx={{ position: 'absolute', top: 24, left: 24, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', fontWeight: 600, letterSpacing: 1 }}
              />
              <img
                src={`data:image/jpeg;base64,${viewerImage.src}`}
                alt="Full preview"
                style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: 12, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
              />
            </>
          )}
        </Box>
      </Dialog>
    </Box>
  )
}
