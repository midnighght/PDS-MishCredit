import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import { AuthProvider } from "./contexts/auth.context";
import { ROUTES as CONSTANT_ROUTES } from "../constants";
import ProtectedRoute from "./components/protectedRoute.component";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Default route redirects to login */}
            <Route
              path="/"
              element={<Navigate to={CONSTANT_ROUTES.LOGIN} replace />}
            />
            <Route path={CONSTANT_ROUTES.LOGIN} element={<Login />} />
            <Route
              path={CONSTANT_ROUTES.DASHBOARD}
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="*"
              element={<Navigate to={CONSTANT_ROUTES.LOGIN} replace />}
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;