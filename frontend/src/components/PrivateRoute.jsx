import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

export const PrivateRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuth(!!token); // true if token exists, false otherwise
  }, []);

  if (isAuth === null) {
    // Still checking token in localStorage
    return <div>Loading...</div>; // or a spinner
  }

  if (!isAuth) {
    return <Navigate to="/" replace />;
  }

  return children;
};
