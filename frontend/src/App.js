import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import Login from "./Login";
import Register from "./Register";
import Projects from "./Projects";
import PostProject from "./PostProject";
import ViewProposals from "./ViewProposals";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "./Dashboard";
import FreelancerHub from "./FreelancerHub";
import ChatUI from "./Chat";
import Notifications from "./Notifications";
import Reviews from "./Reviews";
import AdminDashboard from "./AdminDashboard";

function App() {
  return (
    <BrowserRouter>

      {/* ✅ Always outside Routes */}
      <Navbar />

      <Routes>

        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />

        <Route
          path="/post-project"
          element={
            <ProtectedRoute>
              <PostProject />
            </ProtectedRoute>
          }
        />

        <Route
          path="/proposals"
          element={
            <ProtectedRoute>
              <ViewProposals />
            </ProtectedRoute>
          }
        />

        <Route
          path="/freelancer"
          element={
            <ProtectedRoute>
              <FreelancerHub />
            </ProtectedRoute>
          }
        />

        {/* Others */}
        <Route path="/chat" element={<ChatUI />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/admin" element={<AdminDashboard />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;