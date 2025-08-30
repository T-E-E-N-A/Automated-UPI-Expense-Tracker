import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/Layouts/AuthLayout';
import { UserContext } from '../../context/UserContext';
import Input from '../../Inputs/Input';
import { validateEmail } from '../../utils/helper';
import './AuthLayout.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);


  
  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError("Please enter a valid email");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    
     // Login Api call
      //fake user data
  setUser({
      name: "Test User",
      email: email,
    });
  }
 

 

  return (
    <AuthLayout>
      <div>
        <h3>Welcome Back</h3>
        <p>Please enter your details to login</p>

        <form onSubmit={handleLogin}>
          <Input
            label={" Email Address"}
            value={email}
            onChange={setEmail}
            placeholder="deeksha@gmail.com"
            type="email"
            required
          />
          <Input
            label={" Password"}
            value={password}
            onChange={setPassword}
            placeholder="Minimum 6 characters"
            type="password"
            required
          />

          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200">
            Login
          </button>
          <p className="mt-4 text-center">
            Don't have an account?{" "}
            <Link className="text-blue-500 hover:underline" to="/signup">SignUp</Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}

export default Login
