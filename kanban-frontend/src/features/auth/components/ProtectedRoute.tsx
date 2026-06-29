import { type ReactNode } from "react";
import { useAuthGuard } from "../hooks/useAuthGuard";
import { useAuth } from "../hooks/useAuth";
import { CircularProgress, Box } from "@mui/material";

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  useAuthGuard();
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
