import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import MyProjects from "./components/MyProjects";
import CreateProject from "./components/CreateProject";
import ProjectDetail from "./components/ProjectDetail";
import Collaborators from "./components/Collaborators";
import AIInsights from "./components/AIInsights";
import MindMaps from "./components/MindMaps";
import Transcripts from "./components/Transcripts";
import Settings from "./components/Settings";

function App() {
  const { isAuthenticated, isLoading, user, logout } = useAuth0();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#0A1126",
          color: "#C9D8E6",
          fontSize: "1.2rem",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              user={user}
              logout={() => logout({ returnTo: window.location.origin })}
            />
          }
        >
          <Route index element={<Navigate to="/projects" replace />} />
          <Route path="projects" element={<MyProjects />} />
          <Route path="projects/new" element={<CreateProject />} />
          <Route path="projects/:projectId" element={<ProjectDetail />} />
          <Route path="collaborators" element={<Collaborators />} />
          <Route path="ai-insights" element={<AIInsights />} />
          <Route path="mind-maps" element={<MindMaps />} />
          <Route path="transcripts" element={<Transcripts />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
