import { Box, Typography } from "@mui/material";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: "background.default",
      }}
    >
      {/* Left panel — branding */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "45%",
          bgcolor: "primary.main",
          p: 6,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: "-50%",
            left: "-25%",
            width: "150%",
            height: "150%",
            background:
              "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)",
            pointerEvents: "none",
          },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: "#FFFFFF",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            mb: 1.5,
            position: "relative",
          }}
        >
          Kanbix
        </Typography>
        <Typography
          sx={{
            color: "rgba(255,255,255,0.75)",
            fontSize: "15px",
            textAlign: "center",
            maxWidth: 320,
            lineHeight: 1.6,
            position: "relative",
          }}
        >
          Gestión ágil de proyectos con tableros Kanban, sprints, y reportes en tiempo real.
        </Typography>
      </Box>

      {/* Right panel — form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          px: 3,
          py: 6,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          {/* Mobile logo */}
          <Typography
            variant="h5"
            sx={{
              display: { xs: "block", md: "none" },
              textAlign: "center",
              color: "primary.main",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              mb: 4,
            }}
          >
            Kanbix
          </Typography>

          <Typography
            variant="h4"
            sx={{ mb: subtitle ? 0.5 : 3, color: "text.primary" }}
          >
            {title}
          </Typography>

          {subtitle && (
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: "14px",
                mb: 3,
              }}
            >
              {subtitle}
            </Typography>
          )}

          {children}
        </Box>
      </Box>
    </Box>
  );
}
