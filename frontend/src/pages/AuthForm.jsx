import { useState } from "react";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import TextInput from "../component/TextInput";
import "react-toastify/dist/ReactToastify.css";
import PropTypes from "prop-types";

const AuthForm = ({
  title,
  buttonText,
  endpoint,
  redirectPath,
  altText,
  altLink,
  altHref,
  showNameField,
}) => {
  const [user, setUser] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendUrl}${endpoint}`, user);
      localStorage.setItem("token", data.token);
      toast.success(`${title} Successful!`, { position: "top-center" });

      setTimeout(() => {
        navigate(redirectPath);
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || `${title} Failed!`, {
        position: "top-center",
      });
    } finally {
      setUser({ name: "", email: "", password: "" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      <ToastContainer />
      <form
        className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl p-6 sm:p-8 bg-white dark:bg-zinc-900 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700 transition-all"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white text-center mb-6">
          {title}
        </h2>

        {showNameField && (
          <TextInput
            type="text"
            name="name"
            placeholder="Full Name"
            value={user.name}
            onChange={handleChange}
          />
        )}

        <TextInput
          type="email"
          name="email"
          placeholder="Email"
          value={user.email}
          onChange={handleChange}
        />

        <TextInput
          type="password"
          name="password"
          placeholder="Password"
          value={user.password}
          onChange={handleChange}
          showPassword={showPassword}
          togglePassword={() => setShowPassword(!showPassword)}
        />

        {title === "Welcome To Impluse" && (
          <div className="text-right mb-4">
            <NavLink
              to="/forgot-password"
              className="text-blue-500 dark:text-blue-400 text-sm hover:underline"
            >
              Forgot Password?
            </NavLink>
          </div>
        )}

        <button
          className="custom-button w-full p-3 sm:p-4 text-white font-medium rounded-lg"
          type="submit"
        >
          {buttonText}
        </button>

        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
          {altText}{" "}
          <NavLink
            to={altHref}
            className="text-blue-500 dark:text-blue-400"
          >
            {altLink}
          </NavLink>
        </p>
      </form>
    </div>
  );
};

AuthForm.propTypes = {
  title: PropTypes.string.isRequired,
  buttonText: PropTypes.string.isRequired,
  endpoint: PropTypes.string.isRequired,
  redirectPath: PropTypes.string.isRequired,
  altText: PropTypes.string.isRequired,
  altLink: PropTypes.string.isRequired,
  altHref: PropTypes.string.isRequired,
  showNameField: PropTypes.bool,
};

export default AuthForm;
