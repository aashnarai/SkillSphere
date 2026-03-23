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

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
        {/* ✅ PROTECTED ROUTES */}
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
              <Route path="/notifications" element={<Notifications />} />

            </ProtectedRoute>
          }
        />
              <Route path="/chat" element={<ChatUI />} />
<Route path="/reviews" element={<Reviews />} />

      </Routes>
      <FreelancerHub />

    </BrowserRouter>
  );
}

export default App;