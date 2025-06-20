import { Link, useNavigate } from "react-router";
import { useEffect } from "react";
import { verifyAuth, logout as logoutUser } from "../utils/auth";
import { useAuthStore } from "../store";

export default function Navbar() {
  const { user, isAuthenticated, setAuth, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Verify authentication status with backend
    const checkAuth = async () => {
      try {
        const { authenticated, user: authUser } = await verifyAuth();
        if (authenticated && authUser) {
          setAuth(authUser, authUser.token || null);
        } else if(!authenticated) {
          // Clear auth state if not authenticated
          logout();
        }
      } catch (error) {
        console.error("Auth verification failed:", error);
      }
    };

    checkAuth();
  }, [setAuth, logout]);

  const handleLogout = async () => {
    try {
      const success = await logoutUser();
      if (success) {
        logout();
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="navbar bg-base-200">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl">
          AI Ticket
        </Link>
      </div>
      <div className="flex gap-2">
        {!isAuthenticated ? (
          <>
            <Link to="/signup" className="btn btn-sm">
              Signup
            </Link>
            <Link to="/login" className="btn btn-sm">
              Login
            </Link>
          </>
        ) : (
          <>
            {user?.name && (
              <Link to="/profile" className="text-primary hover:underline">
                Hi, {user?.name}
              </Link>
            )}
            {user && user?.role === "admin" ? (
              <Link to="/admin" className="btn btn-sm">
                Admin
              </Link>
            ) : null}
            <button onClick={handleLogout} className="btn btn-sm">
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}
