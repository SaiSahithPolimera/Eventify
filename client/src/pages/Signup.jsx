import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";
import { AttendeeIcon, OrganizerIcon } from '../components/Icons';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'attendee'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({
      ...prev,
      role
    }));
    if (errors.role) {
      setErrors(prev => ({
        ...prev,
        role: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 6) {
      newErrors.name = 'Name must be at least 6 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    const result = await signup(formData);

    if (result.success) {
      navigate("/login", { state: { message: "Account created! Please login." } });
    }
    else {
      if (result.errors) {
        const backendErrors = {};
        result.errors.forEach(err => {
          backendErrors[err.fieldName || 'submit'] = err.message;
        });
        setErrors(backendErrors);
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-white px-4 py-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-md relative">
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-5 backdrop-blur-sm bg-opacity-95">
          <div className="text-center">
            <h1 className="text-2xl  font-sans">
              Join Eventify today
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 text-sm rounded-lg border-2 ${errors.name
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-rose-500'
                  } focus:ring-2 focus:border-transparent outline-none transition-all bg-white`}
              />
              {errors.name && (
                <p className="text-xs text-red-600 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 text-sm rounded-lg border-2 ${errors.email
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-rose-500'
                  } focus:ring-2 focus:border-transparent outline-none transition-all bg-white`}
              />
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleChange('attendee')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 text-sm rounded-lg border-2 transition-all cursor-pointer ${formData.role === 'attendee'
                    ? 'border-rose-500 bg-rose-50 text-rose-700'
                    : 'border-gray-300 hover:border-gray-400 bg-white text-gray-700'
                    }`}
                >
                  <AttendeeIcon />
                  <span className="font-medium">Attendee</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('organizer')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 text-sm rounded-lg border-2 transition-all cursor-pointer ${formData.role === 'organizer'
                    ? 'border-pink-500 bg-pink-50 text-pink-700'
                    : 'border-gray-300 hover:border-gray-400 bg-white text-gray-700'
                    }`}
                >
                  <OrganizerIcon />
                  <span className="font-medium">Organizer</span>
                </button>
              </div>
              {errors.role && (
                <p className="text-xs text-red-600 mt-1">{errors.role}</p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 text-sm rounded-lg border-2 ${errors.password
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-rose-500'
                    } focus:ring-2 focus:border-transparent outline-none transition-all bg-white`}
                />
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 text-sm rounded-lg border-2 ${errors.confirmPassword
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-rose-500'
                    } focus:ring-2 focus:border-transparent outline-none transition-all bg-white`}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {errors.submit && (
              <div className="p-2 rounded-lg bg-red-50 border border-red-200">
                <p className="text-xs text-red-600">{errors.submit}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 px-4 rounded-lg font-medium text-white text-sm transition-all ${isLoading
                ? 'bg-rose-400 cursor-not-allowed'
                : 'bg-pink-500 hover:bg-pink-600 cursor-pointer'
                }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent hover:from-rose-700 hover:to-pink-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;