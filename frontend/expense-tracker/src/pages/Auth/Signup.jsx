import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/Layouts/AuthLayout';
import Input from '../../Inputs/Input';
import ProfilePhotoSelector from '../../Inputs/ProfilePhotoSelector';
import { validateEmail } from '../../utils/helper';
import './AuthLayout.css';



const Signup = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handle signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!name) {
      setError("Name is required");
      return;
    }
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
    // Signup Api call
  }



  return (
    <AuthLayout>
      <div>
        <h3>Create your account</h3>
        <p>Join us today by entering your details</p>

        <form onSubmit={handleSignup}>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />



          <div>
            <Input
              label={"Full Name"}
              value={name}
              onChange={setName}
              placeholder="Deeksha"
              type="text"
              required
            />
            <Input
              label={"Email Address"}
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
              Sign Up
            </button>
            <p className="mt-4 text-center">
              Already have an account?{" "}
              <Link className="text-blue-500 hover:underline" to="/login">Login</Link>
            </p>
          </div>
        </form>
      </div>

    </AuthLayout>
  )
}

export default Signup
