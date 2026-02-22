'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Trophy, LayoutGrid, List, MapPin, DollarSign, Calendar, Lock, ChevronRight, CheckCircle, TrendingDown, BookOpen, Star, Eye } from 'lucide-react'
import {
  Box, Card, Typography, Button, Chip, IconButton, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar,
  Alert, Skeleton, Grid, Table, TableHead, TableRow, TableCell,
  TableBody, TableContainer, Avatar, LinearProgress, Divider,
} from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import { useInterviewStore } from '@/store/interview.store'

interface Interview {
  _id: string
  jobTitle: string
  requiredSkills: string[]
  isHired: boolean
  location?: string
  salary?: string
  description?: string
  postedDate: string
  createdAt?: string
  deadline?: string | null
}

interface FormData {
  jobTitle: string
  requiredSkills: string[]
  location: string
  salary: string
  description: string
  newSkill: string
  deadline: string
}

const emptyForm: FormData = {
  jobTitle: '', requiredSkills: [], location: '', salary: '', description: '', newSkill: '', deadline: ''
}

const scoreColor = (s?: number) => {
  if (!s) return '#94a3b8'
  if (s >= 80) return '#22c55e'
  if (s >= 60) return '#f59e0b'
  return '#ef4444'
}

const isClosed = (deadline?: string | null) =>
  !!deadline && new Date(deadline) < new Date()

const deadlineLabel = (deadline?: string | null) => {
  if (!deadline) return null
  const d = new Date(deadline)
  const now = new Date()
  if (d < now) return { label: 'CLOSED', color: '#ef4444', bg: '#fef2f2' }
  const hoursLeft = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60))
  if (hoursLeft < 24) return { label: `Closes in ${hoursLeft}h`, color: '#f59e0b', bg: '#fffbeb' }
  const daysLeft = Math.ceil(hoursLeft / 24)
  return { label: `Closes in ${daysLeft}d`, color: '#0ea5e9', bg: '#f0f9ff' }
}

const evalLabels: Record<string, string> = {
  conceptAccuracy: 'Concept Accuracy',
  depthOfAnswer: 'Answer Depth',
  relevance: 'Relevance',
  timeEfficiency: 'Time Efficiency',
}

export default function InterviewPage() {
  const theme = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [formData, setFormData] = useState<FormData>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  // Shortlist modal state
  const [shortlistInterviewId, setShortlistInterviewId] = useState<string | null>(null)
  const [shortlistTitle, setShortlistTitle] = useState('')
  const [shortlistData, setShortlistData] = useState<any[]>([])
  const [shortlistLoading, setShortlistLoading] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null)

  const { createInterview, updateInterview, deleteInterview, getInterviewByCompany, getInterviewShortlist, markHired, markShortlist } = useInterviewStore()

  const loadInterviews = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await getInterviewByCompany()
      if (res.success) setInterviews(res.interview || [])
      else throw new Error(res.message)
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to load interviews', severity: 'error' })
    } finally {
      setIsLoading(false)
    }
  }, [getInterviewByCompany])

  useEffect(() => { loadInterviews() }, [loadInterviews])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!formData.jobTitle.trim()) e.jobTitle = 'Job title is required'
    if (!formData.requiredSkills.length) e.skills = 'At least one skill is required'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitLoading(true)
    try {
      const payload = {
        jobTitle: formData.jobTitle.trim(),
        requiredSkills: formData.requiredSkills,
        location: formData.location.trim(),
        salary: formData.salary.trim(),
        description: formData.description.trim(),
        deadline: formData.deadline || null,
      }
      const res = editingId
        ? await updateInterview(editingId, payload)
        : await createInterview(payload)

      if (res.success) {
        setSnackbar({ open: true, message: res.message, severity: 'success' })
        setOpenDialog(false)
        setFormData(emptyForm)
        setEditingId(null)
        await loadInterviews()
      } else {
        setSnackbar({ open: true, message: res.message, severity: 'error' })
      }
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleEdit = (iv: Interview) => {
    setEditingId(iv._id)
    setFormData({
      jobTitle: iv.jobTitle,
      requiredSkills: [...iv.requiredSkills],
      location: iv.location || '',
      salary: iv.salary || '',
      description: iv.description || '',
      newSkill: '',
      deadline: iv.deadline ? new Date(iv.deadline).toISOString().slice(0, 16) : '',
    })
    setErrors({})
    setOpenDialog(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleteLoading(true)
    try {
      const res = await deleteInterview(deleteId)
      setSnackbar({ open: true, message: res.message, severity: res.success ? 'success' : 'error' })
      if (res.success) { setDeleteId(null); await loadInterviews() }
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleViewShortlist = async (iv: Interview) => {
    setShortlistInterviewId(iv._id)
    setShortlistTitle(iv.jobTitle)
    setShortlistData([])
    setShortlistLoading(true)
    try {
      const res = await getInterviewShortlist(iv._id)
      if (res.success) setShortlistData(res.candidates || [])
    } catch { /* silent */ } finally {
      setShortlistLoading(false)
    }
  }

  const handleHire = async (candidateId: string, hired: boolean) => {
    try {
      const res = await markHired(candidateId, hired)
      setSnackbar({ open: true, message: res.message, severity: res.success ? 'success' : 'error' })
      // Refresh shortlist data
      if (shortlistInterviewId) {
        const res = await getInterviewShortlist(shortlistInterviewId)
        if (res.success) setShortlistData(res.candidates || [])
      }
      // Update selected candidate if viewing
      if (selectedCandidate) {
        setSelectedCandidate({ ...selectedCandidate, isHired: hired })
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to update hire status', severity: 'error' })
    }
  }

  const handleShortlist = async (candidateId: string, shortlisted: boolean) => {
    try {
      const res = await markShortlist(candidateId, shortlisted)
      setSnackbar({ open: true, message: res.message, severity: res.success ? 'success' : 'error' })
      // Refresh shortlist data
      if (shortlistInterviewId) {
        const res = await getInterviewShortlist(shortlistInterviewId)
        if (res.success) setShortlistData(res.candidates || [])
      }
      // Update selected candidate if viewing
      if (selectedCandidate) {
        setSelectedCandidate({ ...selectedCandidate, shortlisted })
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to update shortlist status', severity: 'error' })
    }
  }

  const addSkill = () => {
    const sk = formData.newSkill.trim()
    if (sk && !formData.requiredSkills.includes(sk)) {
      setFormData(p => ({ ...p, requiredSkills: [...p.requiredSkills, sk], newSkill: '' }))
    }
  }

  const removeSkill = (sk: string) =>
    setFormData(p => ({ ...p, requiredSkills: p.requiredSkills.filter(s => s !== sk) }))

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.text.primary, mb: 0.5 }}>Interviews</Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>Manage your job postings and view ranked shortlists</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={() => setViewMode('grid')} sx={{ bgcolor: viewMode === 'grid' ? alpha('#49BBBD', 0.1) : undefined }}>
            <LayoutGrid size={18} color={viewMode === 'grid' ? '#49BBBD' : theme.palette.text.secondary} />
          </IconButton>
          <IconButton onClick={() => setViewMode('list')} sx={{ bgcolor: viewMode === 'list' ? alpha('#49BBBD', 0.1) : undefined }}>
            <List size={18} color={viewMode === 'list' ? '#49BBBD' : theme.palette.text.secondary} />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => { setEditingId(null); setFormData(emptyForm); setErrors({}); setOpenDialog(true) }}
            sx={{ bgcolor: '#49BBBD', '&:hover': { bgcolor: '#3aa9ab' }, borderRadius: 2 }}
          >
            Post Interview
          </Button>
        </Box>
      </Box>

      {/* Interview List */}
      {isLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map(i => <Grid key={i} size={{ xs: 12, md: 6, lg: 4 }}><Skeleton variant="rectangular" height={220} sx={{ borderRadius: 3 }} /></Grid>)}
        </Grid>
      ) : interviews.length === 0 ? (
        <Card sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: 3,
          backgroundColor: '#f9fafb',
          border: '1px dashed #e2e8f0',
          boxShadow: 'none'
        }}>
          <Typography color="text.secondary">No interviews posted yet. Click "Post Interview" to get started.</Typography>
        </Card>
      ) : viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {interviews.map((iv) => {
            const dl = deadlineLabel(iv.deadline)
            const closed = isClosed(iv.deadline)
            return (
              <Grid key={iv._id} size={{ xs: 12, md: 6, lg: 4 }}>
                <Card sx={{
                  p: 3,
                  borderRadius: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: closed ? '1.5px solid #fca5a5' : '1px solid #e2e8f0',
                  position: 'relative',
                  overflow: 'visible',
                  backgroundColor: '#f9fafb',
                  boxShadow: theme.shadows[1],
                  '&:hover': {
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease',
                  }
                }}>
                  {dl && (
                    <Chip label={dl.label} size="small" sx={{ position: 'absolute', top: -10, right: 12, bgcolor: dl.bg, color: dl.color, fontWeight: 700, fontSize: '0.7rem' }} />
                  )}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: closed ? '#fca5a5' : '#49BBBD', width: 40, height: 40 }}>
                          {closed ? <Lock size={18} color="white" /> : <Trophy size={18} color="white" />}
                        </Avatar>
                        <Typography variant="h6" fontWeight={700} fontSize="1rem">{iv.jobTitle}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                      {iv.requiredSkills.slice(0, 4).map(s => (
                        <Chip key={s} label={s} size="small" sx={{ bgcolor: alpha('#49BBBD', 0.1), color: '#49BBBD', fontWeight: 500 }} />
                      ))}
                      {iv.requiredSkills.length > 4 && <Chip label={`+${iv.requiredSkills.length - 4}`} size="small" />}
                    </Box>
                    {iv.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <MapPin size={13} color={theme.palette.text.secondary} />
                        <Typography variant="caption" color="text.secondary">{iv.location}</Typography>
                      </Box>
                    )}
                    {iv.salary && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <DollarSign size={13} color={theme.palette.text.secondary} />
                        <Typography variant="caption" color="text.secondary">{iv.salary}</Typography>
                      </Box>
                    )}
                    {iv.deadline && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <Calendar size={13} color={closed ? '#ef4444' : '#0ea5e9'} />
                        <Typography variant="caption" color={closed ? 'error' : 'text.secondary'}>
                          Deadline: {new Date(iv.deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Trophy size={14} />}
                      onClick={() => handleViewShortlist(iv)}
                      sx={{ flex: 1, bgcolor: '#49BBBD', '&:hover': { bgcolor: '#3aa9ab' }, fontSize: '0.75rem' }}
                    >
                      Shortlist
                    </Button>
                    <IconButton size="small" onClick={() => handleEdit(iv)} sx={{ border: '1px solid', borderColor: 'divider' }}>
                      <Edit2 size={15} color={theme.palette.text.secondary} />
                    </IconButton>
                    <IconButton size="small" onClick={() => setDeleteId(iv._id)} sx={{ border: '1px solid', borderColor: 'divider' }}>
                      <Trash2 size={15} color="#ef4444" />
                    </IconButton>
                  </Box>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      ) : (
        <Card sx={{
          borderRadius: 3,
          backgroundColor: '#f9fafb',
          border: '1px solid #e2e8f0',
          boxShadow: theme.shadows[1],
        }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha('#49BBBD', 0.05) }}>
                  <TableCell sx={{ fontWeight: 700 }}>Job Title</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Skills</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Deadline</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {interviews.map((iv) => {
                  const dl = deadlineLabel(iv.deadline)
                  const closed = isClosed(iv.deadline)
                  return (
                    <TableRow key={iv._id} sx={{ '&:hover': { bgcolor: 'white' }, transition: 'background-color 0.2s', borderBottom: '1px solid #e2e8f0' }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {closed && <Lock size={14} color="#ef4444" />}
                          <Typography fontWeight={600}>{iv.jobTitle}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {iv.requiredSkills.slice(0, 3).map(s => <Chip key={s} label={s} size="small" sx={{ bgcolor: alpha('#49BBBD', 0.1), color: '#49BBBD' }} />)}
                          {iv.requiredSkills.length > 3 && <Chip label={`+${iv.requiredSkills.length - 3}`} size="small" />}
                        </Box>
                      </TableCell>
                      <TableCell><Typography variant="body2" color="text.secondary">{iv.location || '—'}</Typography></TableCell>
                      <TableCell>
                        {dl ? <Chip label={dl.label} size="small" sx={{ bgcolor: dl.bg, color: dl.color, fontWeight: 600 }} /> : <Typography variant="body2" color="text.secondary">No deadline</Typography>}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button size="small" startIcon={<Trophy size={13} />} onClick={() => handleViewShortlist(iv)} sx={{ color: '#49BBBD', minWidth: 0, px: 1 }}>Shortlist</Button>
                          <IconButton size="small" onClick={() => handleEdit(iv)}><Edit2 size={15} /></IconButton>
                          <IconButton size="small" onClick={() => setDeleteId(iv._id)}><Trash2 size={15} color="#ef4444" /></IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={openDialog} onClose={() => !submitLoading && setOpenDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {editingId ? 'Edit Interview' : 'Post New Interview'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
          <TextField label="Job Title *" value={formData.jobTitle} onChange={e => setFormData(p => ({ ...p, jobTitle: e.target.value }))} error={!!errors.jobTitle} helperText={errors.jobTitle} fullWidth size="small" />
          <TextField label="Location" value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} fullWidth size="small" />
          <TextField label="Salary Range" value={formData.salary} onChange={e => setFormData(p => ({ ...p, salary: e.target.value }))} fullWidth size="small" placeholder="e.g. $60k–$80k" />
          <TextField label="Description" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} fullWidth multiline rows={3} size="small" />

          {/* Deadline Picker */}
          <TextField
            label="Application Deadline (optional)"
            type="datetime-local"
            value={formData.deadline}
            onChange={e => setFormData(p => ({ ...p, deadline: e.target.value }))}
            fullWidth size="small"
            InputLabelProps={{ shrink: true }}
            helperText="After this date/time, candidates cannot register for this interview"
            InputProps={{
              startAdornment: <Calendar size={15} color="#49BBBD" style={{ marginRight: 6 }} />
            }}
          />

          {/* Required Skills */}
          <Box>
            <Typography variant="body2" fontWeight={600} mb={1}>Required Skills *</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
              <TextField
                size="small"
                placeholder="e.g. React, Node.js"
                value={formData.newSkill}
                onChange={e => setFormData(p => ({ ...p, newSkill: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                fullWidth
              />
              <Button variant="outlined" onClick={addSkill} sx={{ minWidth: 60 }}>Add</Button>
            </Box>
            {errors.skills && <Typography variant="caption" color="error">{errors.skills}</Typography>}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {formData.requiredSkills.map(s => (
                <Chip key={s} label={s} size="small" onDelete={() => removeSkill(s)}
                  sx={{ bgcolor: alpha('#49BBBD', 0.1), color: '#49BBBD' }} />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDialog(false)} disabled={submitLoading}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitLoading}
            sx={{ bgcolor: '#49BBBD', '&:hover': { bgcolor: '#3aa9ab' } }}
          >
            {submitLoading ? <CircularProgress size={18} sx={{ color: 'white' }} /> : editingId ? 'Save Changes' : 'Post Interview'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onClose={() => !deleteLoading && setDeleteId(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={700}>Delete Interview?</DialogTitle>
        <DialogContent>
          <Typography>This will permanently remove the interview posting. This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteId(null)} disabled={deleteLoading}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleteLoading}>
            {deleteLoading ? <CircularProgress size={18} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Shortlist Modal */}
      <Dialog open={!!shortlistInterviewId} onClose={() => { setShortlistInterviewId(null); setSelectedCandidate(null) }} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Trophy size={22} color="#f59e0b" />
            <Box>
              <Typography fontWeight={700} fontSize="1.15rem">Shortlist — {shortlistTitle}</Typography>
              <Typography variant="caption" color="text.secondary">Candidates ranked by AI score (best → worst)</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 0 }}>
          {shortlistLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: '#49BBBD' }} /></Box>
          ) : shortlistData.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Trophy size={40} color="#d1d5db" />
              <Typography variant="h6" fontWeight={600} mt={2} color="text.secondary">No submissions yet</Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>Candidates will appear here once they submit their interviews.</Typography>
            </Box>
          ) : selectedCandidate ? (
            // Candidate detail view
            <Box sx={{ p: 3 }}>
              <Button startIcon={<ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />} onClick={() => setSelectedCandidate(null)} sx={{ mb: 2 }}>
                Back to Shortlist
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ width: 52, height: 52, bgcolor: '#49BBBD', fontWeight: 700, fontSize: '1.3rem' }}>
                  {selectedCandidate.candidate?.name?.[0]?.toUpperCase() || '?'}
                </Avatar>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {selectedCandidate.rank <= 3 && <Star size={16} color={['#f59e0b', '#9ca3af', '#cd7f32'][selectedCandidate.rank - 1]} fill={['#f59e0b', '#9ca3af', '#cd7f32'][selectedCandidate.rank - 1]} />}
                    <Typography variant="h6" fontWeight={700}>#{selectedCandidate.rank} {selectedCandidate.candidate?.name}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">{selectedCandidate.candidate?.email}</Typography>
                </Box>
                <Box sx={{ ml: 'auto', textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={800} color={scoreColor(selectedCandidate.score)}>{selectedCandidate.score ?? '—'}</Typography>
                  <Typography variant="caption" color="text.secondary">AI Score /100</Typography>
                </Box>
              </Box>
              {selectedCandidate.evaluation && (
                <Box mb={3}>
                  <Typography variant="subtitle2" fontWeight={700} mb={1.5}>Performance Breakdown</Typography>
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
              {(selectedCandidate.aiFeedback || (selectedCandidate.strengths && selectedCandidate.strengths.length > 0) || (selectedCandidate.areasForImprovement && selectedCandidate.areasForImprovement.length > 0)) && (
                <Grid container spacing={2} mb={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ p: 2, borderLeft: '3px solid #22c55e' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}><CheckCircle size={15} color="#22c55e" /><Typography variant="subtitle2" fontWeight={700}>Strengths</Typography></Box>
                      {(selectedCandidate.aiFeedback?.strengths || selectedCandidate.strengths || []).map((s: string, i: number) => <Typography key={i} variant="body2" color="text.secondary" mb={0.5}>• {s}</Typography>)}
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ p: 2, borderLeft: '3px solid #ef4444' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}><TrendingDown size={15} color="#ef4444" /><Typography variant="subtitle2" fontWeight={700}>Improvements</Typography></Box>
                      {(selectedCandidate.aiFeedback?.weaknesses || selectedCandidate.areasForImprovement || []).map((w: string, i: number) => <Typography key={i} variant="body2" color="text.secondary" mb={0.5}>• {w}</Typography>)}
                    </Card>
                  </Grid>
                  {((selectedCandidate.aiFeedback?.learningPath || []).length > 0) && (
                    <Grid size={12}>
                      <Card sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}><BookOpen size={15} color="#49BBBD" /><Typography variant="subtitle2" fontWeight={700}>Learning Path</Typography></Box>
                        {(selectedCandidate.aiFeedback?.learningPath || []).map((step: string, i: number) => <Typography key={i} variant="body2" color="text.secondary" mb={0.5}>{i + 1}. {step}</Typography>)}
                      </Card>
                    </Grid>
                  )}
                </Grid>
              )}

              {/* Hire Action */}
              <Card sx={{ p: 2, mt: 3, bgcolor: selectedCandidate.isHired ? alpha('#22c55e', 0.05) : alpha('#49BBBD', 0.05), border: `1px solid ${selectedCandidate.isHired ? '#22c55e' : '#49BBBD'}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} color={selectedCandidate.isHired ? '#166534' : '#0d9488'}>
                      {selectedCandidate.isHired ? '✓ Candidate is Hired' : 'Ready to Hire?'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedCandidate.isHired ? 'This candidate has been marked as hired' : 'Mark this candidate as hired for the position'}
                    </Typography>
                  </Box>
                  <Button
                    variant={selectedCandidate.isHired ? 'outlined' : 'contained'}
                    size="small"
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
              </Card>

              {/* Shortlist Action */}
              {!selectedCandidate.isHired && (
                <Card sx={{ p: 2, mt: 2, bgcolor: selectedCandidate.shortlisted ? alpha('#f59e0b', 0.05) : alpha('#49BBBD', 0.05), border: `1px solid ${selectedCandidate.shortlisted ? '#f59e0b' : '#49BBBD'}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} color={selectedCandidate.shortlisted ? '#92400e' : '#0d9488'}>
                        {selectedCandidate.shortlisted ? '✓ Candidate is Shortlisted' : 'Add to Shortlist?'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedCandidate.shortlisted ? 'This candidate is on your shortlist' : 'Mark this candidate as a top choice'}
                      </Typography>
                    </Box>
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
                      {selectedCandidate.shortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
                    </Button>
                  </Box>
                </Card>
              )}
            </Box>
          ) : (
            // Ranked list
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha('#49BBBD', 0.05) }}>
                    <TableCell sx={{ fontWeight: 700, width: 60 }}>Rank</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Candidate</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Score</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Level</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shortlistData.map((c, idx) => (
                    <TableRow key={c._id} sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.03) }, bgcolor: idx === 0 ? alpha('#f59e0b', 0.04) : undefined }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {idx === 0 && <Trophy size={16} color="#f59e0b" />}
                          {idx === 1 && <Trophy size={16} color="#9ca3af" />}
                          {idx === 2 && <Trophy size={16} color="#cd7f32" />}
                          <Typography fontWeight={700} color={idx === 0 ? '#f59e0b' : undefined}>#{c.rank}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#49BBBD', fontSize: '0.85rem' }}>
                            {c.candidate?.name?.[0]?.toUpperCase() || '?'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{c.candidate?.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{c.candidate?.email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography fontWeight={700} color={scoreColor(c.score)}>{c.score ?? '—'}</Typography>
                          <Box sx={{ width: 60 }}>
                            <LinearProgress variant="determinate" value={c.score || 0}
                              sx={{ height: 4, borderRadius: 2, bgcolor: 'grey.100', '& .MuiLinearProgress-bar': { bgcolor: scoreColor(c.score) } }} />
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={c.skillLevel || '—'} size="small" sx={{ bgcolor: alpha(scoreColor(c.score), 0.12), color: scoreColor(c.score), fontWeight: 600 }} />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={c.isHired ? 'Hired' : 'Submitted'}
                            size="small"
                            sx={{ bgcolor: c.isHired ? '#dcfce7' : '#f3e8ff', color: c.isHired ? '#166534' : '#7c3aed', fontWeight: 500 }}
                          />
                          {c.shortlisted && (
                            <Chip
                              label="Shortlisted"
                              size="small"
                              sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 500 }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {!c.isHired && (
                            <Button
                              size="small"
                              variant={c.shortlisted ? 'outlined' : 'contained'}
                              onClick={() => handleShortlist(c._id, !c.shortlisted)}
                              sx={{
                                minWidth: 0,
                                px: 1,
                                fontSize: '0.65rem',
                                bgcolor: c.shortlisted ? undefined : '#f59e0b',
                                borderColor: c.shortlisted ? '#ef4444' : undefined,
                                color: c.shortlisted ? '#ef4444' : 'white',
                                '&:hover': { bgcolor: c.shortlisted ? alpha('#ef4444', 0.1) : '#d97706' }
                              }}
                            >
                              {c.shortlisted ? 'Remove' : 'Shortlist'}
                            </Button>
                          )}
                          <Button
                            size="small"
                            variant={c.isHired ? 'outlined' : 'contained'}
                            onClick={() => handleHire(c._id, !c.isHired)}
                            sx={{
                              minWidth: 0,
                              px: 1,
                              fontSize: '0.65rem',
                              bgcolor: c.isHired ? undefined : '#22c55e',
                              borderColor: c.isHired ? '#ef4444' : undefined,
                              color: c.isHired ? '#ef4444' : 'white',
                              '&:hover': { bgcolor: c.isHired ? alpha('#ef4444', 0.1) : '#16a34a' }
                            }}
                          >
                            {c.isHired ? 'Remove' : 'Hire'}
                          </Button>
                          <IconButton
                            size="small"
                            onClick={() => setSelectedCandidate(c)}
                            sx={{ color: '#49BBBD', minWidth: 0, p: 0.5 }}
                          >
                            <Eye size={16} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => { setShortlistInterviewId(null); setSelectedCandidate(null) }}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}
