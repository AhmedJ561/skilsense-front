"use client";
import { Box, Button, Container, Typography, Chip } from "@mui/material";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";


export default function HeroSection() {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          alignItems: "flex-start",
          mt: { xs: 0, md: 2 },
        }}
      >
        {/* Left Content */}
        <Box
          className="wow animate__animated animate__fadeInUp"
          data-wow-once="true"
          sx={{
            flex: 1, //allows the content to expand to fill the available space
            mt: { xs: 4, md: 4 },
            textAlign: { xs: "left", lg: "left" },

            maxWidth: { xs: "100%", lg: "50%" },
          }}
        >
          <Chip
            label="AI-Powered Interview Platform"
            sx={{
              background: "#80CECF",
              color: "white",
              fontWeight: 600,
              fontSize: "0.875rem",
              height: "auto",
              py: 1,
              px: 2,
              mb: 1,
              borderRadius: "20px",
              border: "none",
              boxShadow: "0 2px 10px rgba(46, 125, 50, 0.1)",
            }}
          />

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "2.5rem", sm: "3rem", md: "3rem" },
              fontWeight: 800,
              color: "white",
              mb: 1,
              lineHeight: 1.2,
            }}
          >
            Interview{" "}
            <Box
              component="span"
              sx={{
                color: "#e98f11",
                position: "relative",
                fontSize: { xs: "2.5rem", sm: "3rem", md: "3rem" },
              }}
            >
              Practice
            </Box>{" "}
            <br />
            That Works
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: "white",
              mb: 1,
              fontSize: { xs: "1.125rem", md: "1rem" },
              lineHeight: 1.7,
              maxWidth: "600px",
              mx: { xs: "auto", lg: 0 },
            }}
          >
            Practice interviews, receive instant feedback, and land your dream
            job faster.
          </Typography>

          <Button
            variant="contained"
            size="large"
            component={Link}
            href="/auth/register?role=candidate"
            sx={{
              padding: "10px ",
              background: "white",
              textDecoration: "none",
              fontSize: "0.9rem",
              borderRadius: "20px",
              width: "150px",
              fontWeight: 700,
              color: "#49BBBD",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              "&:hover": {
                background: "white",
                boxShadow: "0 6px 12px rgba(46, 125, 50, 0.3)",
              },
            }}
          >
            Start For Free
            <ArrowRight size={20} style={{ marginLeft: 8 }} />
          </Button>
        </Box>

        {/* Right Content - Image */}
        <Box
          className="wow animate__animated animate__fadeInUp"
          data-wow-once="true"
          sx={{
            flex: 1,
            maxWidth: { xs: "100%", lg: "50%" },
            position: "relative",
            minHeight: { xs: "420px", md: "520px", lg: "86vh" },
            width: "100%",
            overflow: "visible",
          }}
        >
          {/* Background Box + Image 1 */}
          <Box
            sx={{
              position: { xs: "absolute", md: "absolute" },
              top: "10%",
              left: { xs: "1%", sm: "1%", md: "12%" },
              background: "#dbf1f2",
              padding: "15px",
              borderRadius: "15px",
              display: "flex",
              alignItems: "center",

              width: { xs: "fit-content", md: "fit-content" },
              height: { xs: "50px", md: "50px" },
              gap: 1,
              zIndex: 1,
            }}
          >
            <Image
              src="/Home/Group 6.svg"
              alt="Background Group"
              width={20}
              height={20}
              style={{ objectFit: "contain" }}
              priority
            />
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography sx={{ fontSize: "10px" }}>
                Easier Initial Screening
              </Typography>
              <Typography sx={{ fontSize: "10px", whiteSpace: "nowrap" }}>
                Assit companies in hiring
              </Typography>
            </Box>
          </Box>

          {/* Background Box + Image 1 */}
          <Box
            sx={{
              position: "absolute",
              top: { xs: "45%", sm: "", md: "60%" },
              left: { xs: "-3%", sm: "1%", md: "8%" },
              background: "linear-gradient(-45deg, #d1d0d1,#dbf1f2)",
              padding: "12px",
              borderRadius: "15px",
              display: "flex",
              gap: 1,
              zIndex: 2,
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
              <Image
                src="/Home/Group 6.svg"
                alt="Background Group"
                width={20}
                height={20}
                style={{ objectFit: "contain" }}
                priority
              />
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography sx={{ fontSize: "10px" }}>
                  Assist Candidates
                </Typography>
                <Typography sx={{ fontSize: "10px" }}>
                  Apply for relevant job vacancies
                </Typography>
              </Box>
            </Box>
            <Button
              sx={{
                mt: "4px",
                color: "white",
                padding: "6px 18px 6px 18px",
                background: "#d8587e",
                fontSize: "8px",
                borderRadius: "20px",
              }}
            >
              Join Now
            </Button>
          </Box>

          <Box
            sx={{
              position: "absolute",
              top: "20%",
              left: { xs: "80%", sm: "80%", md: "60%" },
              width: 60,
              height: 60,
            }}
          >
            <Image
              src="/Home/Group 9.svg"
              alt="Background Group"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </Box>

          {/* Background Box + Image 1 */}
          <Box
            sx={{
              position: { xs: "absolute", md: "absolute" },
              top: { xs: "60%", sm: "60%", md: "50%" },
              left: { xs: "50%", sm: "50%", md: "60%" },
              background: "linear-gradient(-45deg, #d1d0d1,#dbf1f2)",
              padding: "12px",
              zIndex: 1,
              borderRadius: "15px",
              display: "flex",
              gap: 1,
              alignItems: "center",
              width: { xs: "fit-content", md: "fit-content" },
              height: { xs: "fit-content", md: "fit-content" },
            }}
          >
            <Box
              sx={{
                background: "#f88c3d",
                padding: "3px 3px 3px 3px",
                height: "25px",
                borderRadius: "5px",
              }}
            >
              <Image
                src="/Home/email 2 1.svg"
                alt="Background Group"
                width={20}
                height={20}
                style={{ objectFit: "contain" }}
                priority
              />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography sx={{ fontSize: "10px" }}>
                Assist Candidates
              </Typography>
              <Typography sx={{ fontSize: "10px", whiteSpace: "nowrap" }}>
                Prepare for Interview
              </Typography>
            </Box>
          </Box>

          {/* Main Image */}
          <Box
            sx={{
              position: "relative",
              width: "100%",
              left: { xs: "12%", sm: "12%", md: 0 },
              height: { xs: "360px", md: "80vh" },
            }}
          >
            <Image
              src="/Home/women.svg"
              alt="AI Interview Platform"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
