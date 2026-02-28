import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";

function HomeRedirect() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    if (user.roles.includes("ADMIN")) {
      navigate("/admin", { replace: true });
    } else if (user.roles.includes("HR")) {
      navigate("/hr", { replace: true });
    } else if (user.roles.includes("TRAINER")) {
      navigate("/trainer", { replace: true });
    } else if (user.roles.includes("EMPLOYEE")) {
      navigate("/employee", { replace: true });
    }
  }, [user, navigate]);

  return null;
}

export default HomeRedirect;