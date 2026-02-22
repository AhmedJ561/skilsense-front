'use client'
import AnimatedCounter from "@/components/AnimatedCounter"
import { Box, Container, Grid, Typography } from "@mui/material"

export default function StatsSection() {
  return (
    <Box
      maxWidth="xl"
      sx={{
        // Using a very light tint of the brand aqua for the background
        backgroundColor: '#f8feff',
        py: { xs: 6, sm: 8, md: 10 },
        borderBottom: '1px solid',
        // Using the light aqua from the hero cards for the border
        borderColor: '#dbf1f2',
        position: 'relative',
        zIndex: 10,
        mx: 'auto'
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        <Grid container spacing={{ xs: 3, sm: 4 }}>
          {[
            { number: 50, suffix: 'K+', label: 'Active Users' },
            { number: 100, suffix: 'K+', label: 'Interviews Conducted' },
            { number: 95, suffix: '%', label: 'Success Rate' },
            { number: 4.9, suffix: '/5', label: 'User Rating' }
          ].map((stat, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
              <Box sx={{ textAlign: 'center', px: { xs: 1, sm: 2 } }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800, // Matches hero heading weight
                    // Using the Brand Teal color from your "Start For Free" button
                    color: '#49BBBD', 
                    mb: 1,
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
                  }}
                >
                  <AnimatedCounter
                    end={stat.number} 
                    suffix={stat.suffix} 
                    duration={2000 + idx * 200}
                    fontSize="inherit"
                  />
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 600, 
                    // A slightly muted color for the label
                    color: '#526162', 
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                >
                  {stat.label}
                </Typography>
                
                {/* Optional: A small orange accent bar to match the "Practice" text color */}
                <Box sx={{ 
                  width: '30px', 
                  height: '3px', 
                  backgroundColor: '#e98f11', 
                  margin: '8px auto 0',
                  borderRadius: '2px'
                }} />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}