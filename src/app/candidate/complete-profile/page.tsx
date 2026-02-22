'use client'

import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Chip, Snackbar, Alert, AlertColor } from '@mui/material';
import { useTheme } from '@mui/material/styles'
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'next/navigation';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
interface Skill { name: string; level: string; error?: boolean; }
interface Experience { company: string; position: string; duration: string; description?: string; }
interface Education { institution: string; degree: string; fieldOfStudy: string; duration: string; }
import { usePathname } from 'next/navigation';
import ClearIcon from '@mui/icons-material/Clear';
export default function CompleteProfilePage() {
  const theme = useTheme()
  const { completeProfile, fetchUserDetail } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();
  // States
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [about, setAboutText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [newExperience, setNewExperience] = useState({ company: '', position: '', duration: '', description: '' });
  const [newEducation, setNewEducation] = useState({ institution: '', degree: '', fieldOfStudy: '', duration: '' });



  const [showskillSection, setShowSkillSection] = useState(false);
  const [showExperienceSection, setShowExperienceSection] = useState(false);
  const [showEducationSection, setShowEducationSection] = useState(false);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [showEducationForm, setShowEducationForm] = useState(false);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: AlertColor }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const isCompleteProfilePage = pathname.includes('complete-profile');
  // Fetch existing profile on render
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetchUserDetail();
        if (res.success && res.user) {
          const u = res.user;
          if (u.skills) setSkills(u.skills);
          if (u.experiences) setExperiences(u.experiences);
          if (u.education) setEducation(u.education);
          if (u.about) setAboutText(u.about);
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    fetchProfile();
  }, []);

  // Handlers
  // Add this state
const [skillForms, setSkillForms] = useState<{name: string, level: string, error?: boolean}[]>([]);

// Add these handler functions
const handleSkillFormChange = (index: number, field: string, value: string) => {
  const updatedForms = [...skillForms];
  updatedForms[index] = { ...updatedForms[index], [field]: value };
   // Check if skill already exists (case-insensitive)
  if (field === 'name') {
    const skillExists = skills.some(skill => 
      skill.name.toLowerCase() === value.toLowerCase().trim()
    );
    updatedForms[index].error = skillExists;
  }
  setSkillForms(updatedForms);
};

const handleAddSkillFromForm = (index: number) => {
  const form = skillForms[index];
  
  if (!form.name.trim()) {
    setSnackbar({ open: true, message: 'Enter skill name', severity: 'warning' });
    return;
  }
  
  // Check for duplicate (case-insensitive)
  const skillExists = skills.some(skill => 
    skill.name.toLowerCase() === form.name.toLowerCase().trim()
  );
  
  if (skillExists) {
    setSnackbar({ open: true, message: 'Skill already added', severity: 'error' });
    
    // Mark this form as error
    const updatedForms = [...skillForms];
    updatedForms[index].error = true;
    setSkillForms(updatedForms);
    return;
  }
  
  // Add the skill to the skills list
  setSkills([...skills, { name: form.name, level: form.level as Skill['level'] }]);
  
  // Remove this specific form after adding
  const updatedForms = skillForms.filter((_, i) => i !== index);
  setSkillForms(updatedForms);
};


  const handleAddExperience = () => {
    if (!newExperience.company || !newExperience.position || !newExperience.duration) {
      setSnackbar({ open: true, message: 'Fill all experience fields', severity: 'warning' });
      return;
    }
    setExperiences([...experiences, { ...newExperience }]);
    setNewExperience({ company: '', position: '', duration: '', description: '' });
    setShowExperienceForm(false);
  };

  const handleAddEducation = () => {
    if (!newEducation.institution || !newEducation.degree || !newEducation.fieldOfStudy || !newEducation.duration) {
      setSnackbar({ open: true, message: 'Fill all education fields', severity: 'warning' });
      return;
    }
    setEducation([...education, { ...newEducation }]);
    setNewEducation({ institution: '', degree: '', fieldOfStudy: '', duration: '' });
    setShowEducationForm(false);
  };

  const handleRemoveSkill = (name: string) => setSkills(skills.filter(s => s.name !== name));
  const handleRemoveExperience = (index: number) => setExperiences(experiences.filter((_, i) => i !== index));
  const handleRemoveEducation = (index: number) => setEducation(education.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await completeProfile({ skills, experiences, education, about });
      if (!res.success) throw new Error(res.message || 'Failed to update profile');
      setSnackbar({ open: true, message: 'Profile updated!', severity: 'success' });
      router.replace('/candidate/dashboard');
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Error', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };
  const [sectionCompletion, setSectionCompletion] = useState({ skills: false, experiences: false, education: false, about: false });

  // sectionCompletion checks
  useEffect(() => {
    setSectionCompletion({
      skills: skills.length > 0,
      experiences: experiences.length > 0,
      education: education.length > 0,
      about: about.trim().length > 0,
    });
  }, [skills, experiences, education, about]);
  return (
    <Box sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 4 }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>

      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {isCompleteProfilePage && (
        <Typography variant="h3" sx={{ textAlign: 'center', color: theme.palette.primary.main, fontWeight: 700 }}>
          Complete Your Profile
        </Typography>
        )}
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 4 ,boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',background: 'linear-gradient(135deg, rgba(245, 243, 255, 0.95), rgba(237, 233, 254, 0.95))',borderRadius: '10px',padding: '20px',backdropFilter: 'blur(10px)',}}>

        {/* Skills Section */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 ,justifyContent:'space-between'}}>
          <Typography variant="h5" sx={{ color: theme.palette.primary.main, fontWeight: 600,fontSize: '1rem' }}>Skills</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1,cursor:'pointer' }} onClick={() => {
            setShowSkillSection(!showskillSection);
            setShowExperienceSection(false);
            setShowEducationSection(false);
          }} >
              <Typography variant="h5" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>{sectionCompletion.skills?<Typography>Completed</Typography>:<Typography></Typography>}</Typography>
                {showskillSection ? < ArrowDropUpIcon sx={{ color: theme.palette.primary.main ,transition:'ease-in 0.2s'}} /> : <ArrowDropDownIcon sx={{ color: theme.palette.primary.main, transition:'ease-in 0.2s' }} />}
          </Box>
          </Box>
{showskillSection && (
  <>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
      {skills.map(s => (
        <Chip
          key={s.name}
          label={s.name}
          size="small"
          onDelete={() => handleRemoveSkill(s.name)}
          sx={{
            backgroundColor: theme.palette.secondary.light,
            color: 'white',
            fontSize: '0.75rem',
            height: 24,
          }}
        />
      ))}
    </Box>
    
    {/* Show multiple input forms */}
    {skillForms.map((form, index) => (
      <Box key={index} sx={{ display: 'flex', gap: 2, mt: 2, alignItems: 'center' }}>
        <TextField 
          placeholder="Skill Name" 
          value={form.name} 
          onChange={e => handleSkillFormChange(index, 'name', e.target.value)}
          size="small"
          sx={{ width: 200 }}
        />
        <TextField 
          select 
          value={form.level} 
          onChange={e => handleSkillFormChange(index, 'level', e.target.value)}
          SelectProps={{ native: true }}
          size="small"
          sx={{ width: 150 }}
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Expert">Expert</option>
        </TextField>
        <Button 
          variant="contained" 
          size="small"
          onClick={() => handleAddSkillFromForm(index)}
          disabled={!form.name.trim()}
        >
          Add
        </Button>
      </Box>
    ))}
    
    {/* Button to add a new form */}
    <Button
      sx={{ mt: 2 ,backgroundColor: theme.palette.primary.main, '&:hover': { backgroundColor: theme.palette.primary.dark } ,color:'white'}}
      onClick={() => {
        // Add a new empty form
        setSkillForms([...skillForms, { name: '', level: 'Beginner' }]);
      }}
    >
      Add New Skill
    </Button>
  </>
)}
        </Box>

        {/* Experience Section */}
        <Box>
         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 ,justifyContent:'space-between'}}>
          <Typography variant='h5' sx={{ color: theme.palette.primary.main, fontWeight: 600,whiteSpace: 'nowrap',fontSize: '1rem' }}>Work Experience</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor:'pointer'}} onClick={() => {
            setShowExperienceSection(!showExperienceSection);
            setShowEducationSection(false);
            setShowSkillSection(false);
          }} >
              <Typography variant="h5" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>{sectionCompletion.experiences?<Typography>Completed</Typography>:<Typography></Typography>}</Typography>
         {showExperienceSection ? < ArrowDropUpIcon sx={{ color: theme.palette.primary.main ,transition:'ease-in 0.2s'}} /> : <ArrowDropDownIcon sx={{ color: theme.palette.primary.main, transition:'ease-in 0.2s' }} />}
          </Box>
          </Box>
          {showExperienceSection && (
         <>          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
            {experiences.map((exp, i) => (
              <Box key={i} sx={{ display: 'flex',flexDirection:'column', gap: 1,padding:'10px',border:'1px solid #e0e0e0',borderRadius:'5px',boxShadow:'0 2px 4px rgba(0,0,0,0.1)'}}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 ,width:'100%'}}>
                <Typography>{exp.company} - {exp.position} ({exp.duration})</Typography>

                <ClearIcon style={{ cursor: 'pointer', color: theme.palette.primary.main,fontSize:'large' }} onClick={() => handleRemoveExperience(i)} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography>{exp.description}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
          {showExperienceForm && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
              <Box sx={{ display: 'flex',flexDirection:{xs:'column',sm:'column',md:'row'}, gap: 2, mb: 1 }}>
              <TextField label="Company"  fullWidth value={newExperience.company} onChange={e => setNewExperience({ ...newExperience, company: e.target.value })} />
              <TextField label="Position" fullWidth value={newExperience.position} onChange={e => setNewExperience({ ...newExperience, position: e.target.value })} />
                </Box>
                <Box sx={{ display: 'flex', gap: 2  ,mb: 1,flexDirection:{xs:'column',sm:'column',md:'row'} }}>
              <TextField label="Duration" fullWidth value={newExperience.duration} onChange={e => setNewExperience({ ...newExperience, duration: e.target.value })} />
              <TextField label="Description" fullWidth value={newExperience.description} onChange={e => setNewExperience({ ...newExperience, description: e.target.value })}  />
                </Box>
              <Button  sx={{ backgroundColor: theme.palette.primary.main, '&:hover': { backgroundColor: theme.palette.primary.dark } ,color:'white',width:'100px',mx:'auto'}} onClick={handleAddExperience}>Add</Button>
            </Box>
          )}

         {!showExperienceForm? <Button  sx={{ mt: 2 ,backgroundColor: theme.palette.primary.main, '&:hover': { backgroundColor: theme.palette.primary.dark } ,color:'white',display:'flex',width:'200px',mx:{xs:'auto',sm:'auto',md:'0'}}}  onClick={() => setShowExperienceForm(!showExperienceForm)}>Add New Experience</Button>:("")}
          </>
          )}
        </Box>

        {/* Education Section */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 ,justifyContent:'space-between'}}>
          <Typography variant="h5" sx={{ color: theme.palette.primary.main, fontWeight: 600,fontSize: '1rem' }}>Education</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor:'pointer' }} onClick={() => {
            setShowEducationSection(!showEducationSection);
            setShowExperienceSection(false);
            setShowSkillSection(false);
          }} >
              <Typography variant="h5" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>{sectionCompletion.education?<Typography>Completed</Typography>:<Typography></Typography>}</Typography>
          {showEducationSection ? < ArrowDropUpIcon sx={{ color: theme.palette.primary.main ,transition:'ease-in 0.2s'}} /> : <ArrowDropDownIcon sx={{ color: theme.palette.primary.main, transition:'ease-in 0.2s' }} />}
          </Box>
          </Box>
          {showEducationSection && (
          <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
            {education.map((edu, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1 }}>
                <Typography>{edu.institution} - {edu.degree} ({edu.duration})</Typography>
                <Button size="small" color="error" onClick={() => handleRemoveEducation(i)}>Remove</Button>
              </Box>
            ))}
          </Box>
          {showEducationForm && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
              <TextField label="Institution" value={newEducation.institution} onChange={e => setNewEducation({ ...newEducation, institution: e.target.value })} />
              <TextField label="Degree" value={newEducation.degree} onChange={e => setNewEducation({ ...newEducation, degree: e.target.value })} />
              <TextField label="Field of Study" value={newEducation.fieldOfStudy} onChange={e => setNewEducation({ ...newEducation, fieldOfStudy: e.target.value })} />
              <TextField label="Duration" value={newEducation.duration} onChange={e => setNewEducation({ ...newEducation, duration: e.target.value })} />
              <Button variant="contained" onClick={handleAddEducation}>Add</Button>
            </Box>
          )}
          <Button sx={{ mt: 1 }} onClick={() => setShowEducationForm(!showEducationForm)}>Add New Education</Button>
          </>
          )}
        </Box>

        {/* About Section */}
        <Box>
         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 ,justifyContent:'space-between'}}>
          <Typography variant="h5" sx={{ color: theme.palette.primary.main, fontWeight: 600,fontSize: '1rem' }}>About</Typography>
          </Box>
          <TextField
            multiline
            rows={4}
            value={about}
            onChange={e => setAboutText(e.target.value)}
            fullWidth
            sx={{ mt: 1 }}
          />

        </Box>


        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={isLoading}
          sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`, '&:hover': { background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`, transform: 'translateY(-2px)', boxShadow: `0 6px 20px ${theme.palette.primary.main}66` } ,color:'white',alignSelf:'center',width:{xs:'100%',sm:'50%',md:'30%'}}}
        >
          {isLoading ? 'Saving...' : 'Complete Profile'}
        </Button>

        </Box>
      </Box>
    </Box>
  );
}
