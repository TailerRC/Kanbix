import { useEffect, useState } from "react";

type Status = "loading" | "online" | "offline";

interface HealthResponse {
  status: string;
}

export default function HealthCheck() {
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;

    fetch(`${apiUrl}/health`)
      .then((res) => {
        if (!res.ok) throw new Error("Respuesta no OK");
        return res.json() as Promise<HealthResponse>;
      })
      .then((data) => {
        setStatus("online");
        setMessage(`Backend respondió: "${data.status}"`);
      })
      .catch((err) => {
        setStatus("offline");
        setMessage(`No se pudo conectar al backend (${apiUrl}). ¿Está corriendo con uvicorn?`);
        console.error(err);
      });
  }, []);

  const colors: Record<Status, string> = {
    loading: "#999",
    online: "#16a34a",
    offline: "#dc2626",
  };

  const labels: Record<Status, string> = {
    loading: "Verificando conexión...",
    online: "✅ Conectado al backend",
    offline: "❌ Backend no disponible",
  };

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: "420px",
        margin: "60px auto",
        padding: "24px",
        border: `2px solid ${colors[status]}`,
        borderRadius: "8px",
        textAlign: "center",
      }}
    >
      <h2 style={{ margin: "0 0 12px", color: colors[status] }}>
        {labels[status]}
      </h2>
      <p style={{ color: "#555", fontSize: "14px" }}>{message}</p>
    </div>
  );
}