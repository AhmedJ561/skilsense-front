'use client'
import { Box, Card, Container, Grid, Typography } from "@mui/material";
import { ArrowRight } from "lucide-react";

export default function HowItWorkSection() {
    return (
        <Box
            className="wow animate__animated animate__fadeInUp" data-wow-once="true"
            maxWidth="xl"
            sx={{
                backgroundColor: 'background.paper',
                py: { xs: 4, sm: 4, md: 6 },
                position: 'relative',
                zIndex: 10,
                mx: "auto"
            }}
        >
            <Container maxWidth="xl">
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography
                        variant="h2"
                        sx={{
                            fontSize: { xs: '2.5rem', md: '3.5rem' },
                            fontWeight: 'bold',
                            // Using Teal for the main section heading
                            color: '#49BBBD', 
                            mb: 2,
                        }}
                    >
                        How It Works
                    </Typography>
                    <Typography
                        variant="h5"
                        sx={{
                            color: 'text.primary',
                            maxWidth: '800px',
                            mx: 'auto',
                            fontWeight: '400', // Adjusted from 100 for better readability
                        }}
                    >
                        Get started in minutes and begin your interview preparation journey
                    </Typography>
                </Box>
                <Grid container spacing={4}>
                    {[
                        {
                            step: '1',
                            title: 'Create Account',
                            description: 'Sign up as a candidate or company in seconds'
                        },
                        {
                            step: '2',
                            title: 'Select Interview',
                            description: 'Choose difficulty level and interview type'
                        },
                        {
                            step: '3',
                            title: 'Practice Interview',
                            description: 'Answer AI-generated questions with video recording'
                        },
                        {
                            step: '4',
                            title: 'Get Feedback',
                            description: 'Receive detailed analysis and improvement suggestions'
                        }
                    ].map((item, idx) => (
                        <Grid className={`wow animate__animated animate__fadeInLeft`} data-wow-once="true"
                            data-wow-delay={`${idx * 0.1}s`} size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                            <Box sx={{ position: 'relative', textAlign: 'center', height: '100%',pb:{xs:3,sm:3,md:0} }}>
                                <Card
                                    sx={{
                                        p: 4,
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'flex-start',
                                        borderRadius: '15px', // Matching the Hero card style
                                        border: '1px solid #dbf1f2', // Light aqua border
                                        boxShadow: '0 4px 20px rgba(73, 187, 189, 0.08)', // Soft teal shadow
                                        transition: 'transform 0.3s ease',
                                        overflow: 'visible', // 🔑 KEY LINE
                                        '&:hover': {
                                            transform: 'translateY(-5px)'
                                            
                                        }
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 64,
                                            height: 64,
                                            position:'absolute',
                                            top:-32,
                                            
                                           
                                        
                                            // Using the Orange accent from the Hero "Practice" text
                                            backgroundColor: '#e98f11', 
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                           
                                            color: 'white',
                                            fontSize: '1.5rem',
                                            fontWeight: 'bold',
                                            boxShadow: '0 4px 12px rgba(233, 143, 17, 0.3)',
                                        }}
                                    >
                                        {item.step}
                                    </Box>
                                    <Box sx={{mt:'10px'}}>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: 'bold',
                                            color: '#49BBBD', // Teal for step titles
                                           
                                        }}
                                    >
                                        {item.title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'text.secondary',
                                            lineHeight: 1.6
                                        }}
                                    >
                                        {item.description}
                                    </Typography>
                                    </Box>
                                </Card>
                                {idx < 3 && (
                                    <Box
                                        sx={{
                                            display: { xs: 'none', lg: 'block' },
                                            position: 'absolute',
                                            top: '50%',
                                            right: -32,
                                            transform: 'translateY(-50%)',
                                            zIndex: 2
                                        }}
                                    >
                                        <Box sx={{ color: '#80CECF' }}> {/* Light Teal arrow */}
                                            <ArrowRight size={32} />
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    )
}
