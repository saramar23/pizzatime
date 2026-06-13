import { useEffect, useState } from "react"

export function useSessionId() {
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    const existing = sessionStorage.getItem("pt-session");
    if (existing) {
      setSessionId(existing);
    } else {
      const id = crypto.randomUUID();
      sessionStorage.setItem("pt-session", id);
      setSessionId(id);
    }
  }, [])

  return sessionId;
}