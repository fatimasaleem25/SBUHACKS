import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import "./Login.css";

const Login = () => {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: window.location.origin,
      },
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">🧠 MindMesh</h1>
        <p className="login-subtitle">Welcome! Start collaborating and building your mind projects.</p>
        <button className="login-button" onClick={handleLogin}>
          Log In
        </button>
      </div>
    </div>
  );
};

export default Login;
