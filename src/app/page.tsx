'use client'

import React from 'react'
import {
  Box
} from '@mui/material'
import HeroSection from './home/hero-section/page'
import StatsSection from './home/stats-section/page'
import FeatureSection from './home/feature-section/page'
import HowItWorkSection from './home/how-it-work-section/page'
import TestimonialSection from './home/testimonial-section/page'
import CTASection from './home/cta-section/page'
import Footer from './home/footer/page'
import Navbar from './home/navbar/page'

export default function Home() {
 
 
  return (
    
      
<>
     <Box   maxWidth="xl" sx={{ backgroundImage: "url('/Home/Header.svg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight:'100vh',
    position: 'relative',
    overflow: 'hidden',
    mx:'auto',
    // Curve only on desktop
    clipPath: {
      xs: 'none',              // no curve on mobile
      md: 'ellipse(100% 95% at 50% 0%)', // curve on desktop
    },
   }}>

      <Navbar />
      <HeroSection />
      </Box>
     
      <StatsSection />
      <FeatureSection />
      <HowItWorkSection />
      <TestimonialSection />
      <CTASection />
      <Footer />
  </>

  )
}