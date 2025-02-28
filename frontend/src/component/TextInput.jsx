import PropTypes from "prop-types";
import { FiEye, FiEyeOff } from "react-icons/fi";


const TextInput = ({ type, name, placeholder, value, onChange, showPassword, togglePassword }) => {
  return (
    <div className="mb-4 relative">
      <input
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none pr-12"
        type={type === "password" && showPassword !== undefined ? (showPassword ? "text" : "password") : type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
      />
      {type === "password" && togglePassword && (
        <button
          type="button"
          className="absolute right-3 top-4 text-gray-500 dark:text-gray-400"
          onClick={togglePassword}
        >
          {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
        </button>
      )}
    </div>
  );
};

TextInput.propTypes = {
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  showPassword: PropTypes.bool,
  togglePassword: PropTypes.func,
};

export default TextInput;
