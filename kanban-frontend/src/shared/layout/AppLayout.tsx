import { useState } from "react";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  LayoutDashboard,
  ClipboardList,
  Kanban,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";

const NAV_ITEMS = [
  { label: "Tablero", icon: LayoutDashboard, path: "/" },
  { label: "Backlog", icon: ClipboardList, path: "/backlog" },
  { label: "Sprint actual", icon: Kanban, path: "/sprint" },
  { label: "Reportes", icon: BarChart3, path: "/reports" },
];

const PROJECTS = [
  { label: "Kanbix v2" },
  { label: "Mezzanine" },
];

const SIDEBAR_WIDTH = 220;
const SIDEBAR_COLLAPSED = 56;

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const isTablet = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const [collapsed, setCollapsed] = useState(false);

  const effectiveCollapsed = collapsed || isTablet;
  const sidebarWidth = effectiveCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: sidebarWidth,
            boxSizing: "border-box",
            bgcolor: "background.paper",
            borderRight: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        {/* Logo area */}
        <Box
          sx={{
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: effectiveCollapsed ? "center" : "space-between",
            px: effectiveCollapsed ? 0 : 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          {!effectiveCollapsed && (
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "18px",
                color: "primary.main",
                letterSpacing: "-0.02em",
              }}
            >
              Kanbix
            </Typography>
          )}
          {effectiveCollapsed && (
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "16px",
                color: "primary.main",
              }}
            >
              K
            </Typography>
          )}
          {isDesktop && (
            <IconButton size="small" onClick={() => setCollapsed(!collapsed)}>
              {effectiveCollapsed ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronLeft size={16} />
              )}
            </IconButton>
          )}
        </Box>

        {/* Navigation */}
        <List sx={{ px: effectiveCollapsed ? 0.5 : 1, pt: 1 }} dense>
          {NAV_ITEMS.map((item) => (
            <ListItemButton
              key={item.path}
              sx={{
                borderRadius: 1,
                mb: 0.25,
                justifyContent: effectiveCollapsed ? "center" : undefined,
                px: effectiveCollapsed ? 1 : 1.5,
              }}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon
                sx={{
                  minWidth: effectiveCollapsed ? 0 : 36,
                  color: "text.secondary",
                }}
              >
                <item.icon size={18} />
              </ListItemIcon>
              {!effectiveCollapsed && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                />
              )}
            </ListItemButton>
          ))}
        </List>

        {/* Projects section */}
        {!effectiveCollapsed && (
          <>
            <Typography
              sx={{
                px: 2,
                pt: 2,
                pb: 0.5,
                fontSize: "11px",
                fontWeight: 600,
                color: "text.secondary",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Proyectos
            </Typography>
            <List dense sx={{ px: 1 }}>
              {PROJECTS.map((project) => (
                <ListItemButton
                  key={project.label}
                  sx={{ borderRadius: 1, mb: 0.25, px: 1.5 }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      mr: 1.5,
                      flexShrink: 0,
                    }}
                  />
                  <ListItemText
                    primary={project.label}
                    primaryTypographyProps={{
                      fontSize: "13px",
                    }}
                  />
                </ListItemButton>
              ))}
              <ListItemButton sx={{ borderRadius: 1, px: 1.5 }}>
                <ListItemIcon sx={{ minWidth: 0, mr: 1.5 }}>
                  <Plus size={14} />
                </ListItemIcon>
                <ListItemText
                  primary="Nuevo proyecto"
                  primaryTypographyProps={{
                    fontSize: "13px",
                    color: "text.secondary",
                  }}
                />
              </ListItemButton>
            </List>
          </>
        )}

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Bottom actions */}
        <List dense sx={{ px: effectiveCollapsed ? 0.5 : 1, pb: 1 }}>
          {!effectiveCollapsed && user && (
            <ListItemButton sx={{ borderRadius: 1, px: 1.5 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 600,
                  mr: 1.5,
                  flexShrink: 0,
                }}
              >
                {user.nombre_completo?.charAt(0)?.toUpperCase() || "U"}
              </Box>
              <ListItemText
                primary={user.nombre_completo || user.email}
                primaryTypographyProps={{
                  fontSize: "13px",
                  fontWeight: 500,
                  noWrap: true,
                }}
              />
            </ListItemButton>
          )}
          <ListItemButton
            sx={{ borderRadius: 1, px: effectiveCollapsed ? 1 : 1.5 }}
            onClick={() => logout()}
          >
            <ListItemIcon
              sx={{
                minWidth: effectiveCollapsed ? 0 : 36,
                color: "text.secondary",
              }}
            >
              <LogOut size={18} />
            </ListItemIcon>
            {!effectiveCollapsed && (
              <ListItemText
                primary="Cerrar sesión"
                primaryTypographyProps={{
                  fontSize: "13px",
                  color: "text.secondary",
                }}
              />
            )}
          </ListItemButton>
        </List>
      </Drawer>

      {/* Main content area */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Navbar */}
        <Box
          sx={{
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              sx={{ fontSize: "13px", fontWeight: 600, color: "text.secondary" }}
            >
              Sprint 7
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton size="small" sx={{ color: "text.secondary" }}>
              <Settings size={18} />
            </IconButton>
          </Box>
        </Box>

        {/* Page content */}
        <Box sx={{ flex: 1, p: 3, overflow: "auto" }}>{children}</Box>
      </Box>
    </Box>
  );
}
