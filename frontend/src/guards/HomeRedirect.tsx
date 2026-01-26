import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";

function HomeRedirect() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    if (user.role === "ADMIN") {
      navigate("/admin", { replace: true });
    } else if (user.role === "EMPLOYEE") {
      navigate("/employee", { replace: true });
    }
  }, [user]);

  return null;
}

export default HomeRedirect;