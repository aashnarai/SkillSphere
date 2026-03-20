import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import Login from "./Login";
import Register from "./Register";
import Projects from "./Projects";
import PostProject from "./PostProject";
import ViewProposals from "./ViewProposals";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

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
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;