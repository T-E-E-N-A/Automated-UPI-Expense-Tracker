import { useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';

const Input = ({ label, value, onChange, placeholder, type }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="mb-4">
      {label && <label className="block mb-2 text-gray-700 font-medium">{label}</label>}
      <div className="relative flex items-center border rounded-lg px-3 py-2 bg-white">
        <input
          type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          className="w-full outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />

        {type === 'password' && (
          <span className="absolute right-3 cursor-pointer text-gray-600">
            {showPassword ? (
              <FaRegEye size={20} onClick={togglePasswordVisibility} />
            ) : (
              <FaRegEyeSlash size={20} onClick={togglePasswordVisibility} />
            )}
          </span>
        )}
      </div>
    </div>
  );
};

export default Input;
