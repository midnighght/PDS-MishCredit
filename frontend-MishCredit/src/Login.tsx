import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ROUTES, RESOURCES, ANIMATION } from "../constants";
import { useAuth } from "./hooks/useAuth.hook";

export interface UserLoginRequest {
  email: string;
  password: string;
}

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { login, isLoading, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();
  const rotation = useRef(0);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  console.log(`${rotation.current} app re-rendered`);

  const handleRotate = () => {
    const img = document.getElementById("appLogo");
    if (img) {
      rotation.current += ANIMATION.ROTATION_DEGREES;
      img.style.transform = `rotate(${rotation.current}deg)`;
      img.style.transition = `transform ${ANIMATION.TRANSITION_DURATION} ${ANIMATION.TRANSITION_EASING}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(formData.email, formData.password);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-col items-center justify-center flex-1">
        <form onSubmit={handleSubmit} className="flex flex-row">
          <div
            id="login-form"
            className="flex flex-col items-center gap-[5vh] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 box-border drop-shadow-sm w-64 p-5 rounded-lg bg-shadow flex-shrink-0 h-4/5 md:w-75 md:gap-10"
          >
            {/* Rotating Logo */}
            <img
              id="appLogo"
              onClick={handleRotate}
              className="w-1/2 mt-5 md:mt-3 md:mb-0 md:pb-0 rounded-xl cursor-pointer hover:shadow-lg transition-shadow duration-200"
              src={RESOURCES.LOGO}
              alt="App Logo"
              title="Click to rotate!"
            />

            {/* Welcome Message */}
            <h2 className="text-white text-xl font-bold text-center -mt-4">
              Welcome Back!
            </h2>

            {/* Error Display */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm w-full text-center">
                {error}
              </div>
            )}

            {/* Form Fields */}
            <div className="flex flex-col gap-4 w-48 md:w-48 opacity-75">
              <input
                name="email"
                className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
              <input
                name="password"
                className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                placeholder="Password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
              />

              <button
                className="bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>

              <p className="text-center text-white">
                New here? <br />
                <Link
                  to={ROUTES.REGISTER}
                  className="font-bold underline hover:text-gray-200 transition-colors duration-200"
                >
                  Register
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>

      <footer className="text-center py-4">
        <a
          href="https://github.com/Reistoge"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
        >
          @Ferran Rojas
        </a>
      </footer>
    </div>
  );
}

export default Login;
