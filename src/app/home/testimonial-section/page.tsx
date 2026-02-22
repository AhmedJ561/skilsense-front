'use client'
import AnimatedCounter from "@/components/AnimatedCounter";
import { Box, Card, Container, Grid, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Stack } from "@mui/system";

export default function TestimonialSection() {
    const theme = useTheme();

    return (
        <>
         {/* Testimonials Section */}
              <Box className="wow animate__animated animate__fadeInUp" data-wow-once="true" sx={{ pt: { xs: 4, sm: 4, md: 6 }, position: 'relative', zIndex: 10 }}>
                <Container maxWidth="xl">
                  <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography
                      variant="h2"
                      sx={{
                        fontSize: { xs: '2.5rem', md: '3.5rem' },
                        fontWeight: 'bold',
                        color: theme.palette.primary.main, // Uses theme Orange
                        mb: 2,
                      }}
                    >
                      What Users Say
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        color: theme.palette.secondary.main, // Uses theme Aqua Blue
                        maxWidth: '800px',
                        mx: 'auto',
                        fontWeight: '300', 
                        fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.10rem' },
                      }}
                    >
                      Join thousands of successful candidates and companies
                    </Typography>
                  </Box>
                  <Grid container spacing={4}>
                    {[
                      {
                        name: 'Sarah Johnson',
                        role: 'Software Engineer',
                        company: 'Google',
                        text: 'SkillSense helped me prepare for my interviews. The AI feedback was incredibly accurate and helped me improve my communication skills.',
                        rating: 5
                      },
                      {
                        name: 'Michael Chen',
                        role: 'Product Manager',
                        company: 'Microsoft',
                        text: 'The mock interviews felt so realistic. I was able to practice different scenarios and get comfortable with the interview process.',
                        rating: 5
                      },
                      {
                        name: 'Emily Rodriguez',
                        role: 'Data Scientist',
                        company: 'Amazon',
                        text: 'The detailed feedback reports helped me identify my weaknesses and work on them systematically. Highly recommended!',
                        rating: 5
                      }
                    ].map((testimonial, idx) => (
                      <Grid className={`wow animate__animated animate__fadeInRight`} data-wow-once="true"  size={{ xs: 12,sm: 6,md: 4 }} key={idx}>
                        <Card sx={{ 
                          p: 4, 
                          height: '100%',
                          borderTop: `4px solid ${theme.palette.secondary.main}`, // Linked to Aqua Blue
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-10px)',
                            boxShadow: `0 10px 30px rgba(0, 206, 209, 0.15)` 
                          }
                        }}>
                          <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 3 }}>
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                backgroundColor: `${theme.palette.primary.main}15`, // Faint orange tint
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: theme.palette.primary.main, // Orange initial
                                fontWeight: 'bold',
                              }}
                            >
                              {testimonial.name.charAt(0)}
                            </Box>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                {testimonial.name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: theme.palette.secondary.main }}> 
                                {testimonial.role} at {testimonial.company}
                              </Typography>
                            </Box>
                          </Stack>
                          <Stack direction="row" spacing={0.5} sx={{ mb: 3, color: theme.palette.primary.main }}> 
                            <AnimatedCounter end={testimonial.rating} suffix="★" duration={2000} fontSize="inherit" />
                          </Stack>
                          <Typography
                            variant="body1"
                            sx={{
                              color: 'text.secondary',
                              fontStyle: 'italic',
                              lineHeight: 1.6,
                            }}
                          >
                            "{testimonial.text}"
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Container>
              </Box>
        </>
    )
}