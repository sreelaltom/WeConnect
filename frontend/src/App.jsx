import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import People from "./pages/People";
import CreatePostPage from "./pages/CreatePostPage"; // ✅ Import CreatePostPage
import { PrivateRoute } from "./components/PrivateRoute";
import Layout from "./components/Layout"; // ✅ Import Layout

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<AuthPage />} />

        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Layout>
                <Home />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Layout>
                <Profile />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/people"
          element={
            <PrivateRoute>
              <Layout>
                <People />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/create-post" // ✅ Route for Create Post Page
          element={
            <PrivateRoute>
              <Layout>
                <CreatePostPage />
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
