import PropTypes from "prop-types";
import { FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";

const TextInput = ({ 
  type, 
  name, 
  placeholder, 
  value, 
  onChange, 
  showPassword, 
  togglePassword, 
  className = "",
  error,
  success,
  helperText,
  icon: Icon,
  required = true,
  onBlur,
  disabled = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(Boolean(value));
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef(null);
  
  useEffect(() => {
    setHasValue(Boolean(value));
  }, [value]);
  
  // Determine visual state
  const getStateStyles = () => {
    if (disabled) return "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-zinc-900 cursor-not-allowed";
    if (error) return "border-red-500 dark:border-red-400";
    if (success) return "border-green-500 dark:border-green-400";
    if (isFocused) return "border-blue-500 dark:border-blue-400";
    if (isHovered) return "border-gray-400 dark:border-gray-500";
    return "border-gray-200 dark:border-gray-700";
  };
  
  // Handle custom blur event
  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  // Handle hover state
  const handleMouseEnter = () => {
    if (!disabled) setIsHovered(true);
  };
  
  const handleMouseLeave = () => {
    if (!disabled) setIsHovered(false);
  };
  
  return (
    <div className="relative w-full mb-5">
      <div 
        className="relative w-full" 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Left Icon (if provided) */}
        {Icon && (
          <div className={`absolute left-3.5 top-1/2 transform -translate-y-1/2 z-10 ${
            disabled ? 'text-gray-400 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'
          }`}>
            <Icon size={18} />
          </div>
        )}
        
        <input
          ref={inputRef}
          className={`w-full ${Icon ? 'pl-10' : 'px-4'} pr-4 py-3.5
          bg-white dark:bg-zinc-800 
          border ${getStateStyles()} 
          rounded-lg transition-all duration-200 ease-in-out 
          focus:outline-none focus:ring-1 focus:ring-offset-0
          ${error ? 'focus:ring-red-500/30 dark:focus:ring-red-400/30' : 
            success ? 'focus:ring-green-500/30 dark:focus:ring-green-400/30' : 
            'focus:ring-blue-500/30 dark:focus:ring-blue-400/30'
          }
          text-gray-700 dark:text-gray-200
          ${hasValue || isFocused ? 'placeholder-gray-400 dark:placeholder-gray-500' : 'placeholder-transparent'}
          ${disabled ? 'opacity-70 cursor-not-allowed' : ''}
          ${className}`}
          type={type === "password" && showPassword !== undefined ? (showPassword ? "text" : "password") : type}
          name={name}
          id={name}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            if (!disabled) onChange(e);
          }}
          onFocus={() => !disabled && setIsFocused(true)}
          onBlur={handleBlur}
          required={required}
          disabled={disabled}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${name}-error` : helperText ? `${name}-helper` : undefined}
          autoComplete={type === "password" ? "current-password" : type === "email" ? "email" : "off"}
        />
        
        {/* Floating Label */}
        <label
          htmlFor={name}
          className={`absolute text-sm transition-all duration-200 ease-in-out pointer-events-none z-10
          ${hasValue || isFocused 
            ? `top-0 translate-y-[-50%] left-3 text-xs font-medium ${
                error ? 'text-red-500 dark:text-red-400' : 
                success ? 'text-green-500 dark:text-green-400' :
                disabled ? 'text-gray-400 dark:text-gray-500' :
                'text-blue-500 dark:text-blue-400'
              }`
            : `top-1/2 -translate-y-1/2 ${Icon ? 'left-10' : 'left-4'} text-gray-500 dark:text-gray-400`
          }`}
        >
          <span className={`${hasValue || isFocused ? 'bg-white dark:bg-zinc-800 px-1' : ''}`}>
            {placeholder}
            {required && (
              <span className="text-red-500 ml-0.5">*</span>
            )}
          </span>
        </label>
        
        {/* Password Toggle Button */}
        {type === "password" && togglePassword && (
          <button
            type="button"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 
            hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200 focus:outline-none
            focus:text-blue-500 dark:focus:text-blue-400 z-10 p-1"
            onClick={togglePassword}
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={disabled}
            tabIndex={disabled ? -1 : 0}
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
        
        {/* Status Icon (success/error) */}
        {(error || success) && type !== "password" && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10">
            {error ? <FiAlertCircle className="text-red-500 dark:text-red-400" /> : <FiCheckCircle className="text-green-500 dark:text-green-400" />}
          </div>
        )}
      </div>
      
      {/* Helper Text or Error Message */}
      <div 
        id={error ? `${name}-error` : helperText ? `${name}-helper` : undefined}
        className={`mt-1 text-xs ${
          error ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
        } flex items-center gap-1.5 min-h-[18px] transition-opacity duration-200`}
        style={{ opacity: ((helperText && isFocused) || error) ? 1 : 0 }}
      >
        {error && <FiAlertCircle size={12} />}
        <span>{error || (isFocused ? helperText : '')}</span>
      </div>
    </div>
  );
};

TextInput.propTypes = {
  type: PropTypes.string.isRequired,
  name: PropTypes.string,
  placeholder: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  showPassword: PropTypes.bool,
  togglePassword: PropTypes.func,
  className: PropTypes.string,
  error: PropTypes.string,
  success: PropTypes.bool,
  helperText: PropTypes.string,
  icon: PropTypes.elementType,
  required: PropTypes.bool,
  onBlur: PropTypes.func,
  disabled: PropTypes.bool
};

export default TextInput;
