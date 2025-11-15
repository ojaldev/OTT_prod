import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, ChevronRight, BarChart2, PieChart, TrendingUp, Grid, ShieldCheck, Sparkles, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LoginData } from '../types/User';
import Button from '../components/common/Button';
import { validateEmail } from '../utils/validation';
import ChartSlideshow from '../components/login/ChartSlideshow';
import LivePreviewCharts from '../components/login/LivePreviewCharts';

const Login: React.FC = () => {
  const { state, login } = useAuth();
  useTheme(); // Keep the hook to ensure context subscription for dark mode
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<LoginData>();

  // Redirect if already authenticated
  if (state.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: LoginData) => {
    try {
      setIsLoading(true);
      await login(data.email, data.password);
    } catch (error: any) {
      setError('root', {
        type: 'manual',
        message: error.message || 'Login failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 transition-colors duration-200">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-600/10" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-purple-400/20 blur-3xl dark:bg-purple-700/10" />
      {/* Left side - Slideshow Preview */}
      <div className="hidden lg:flex lg:w-3/5 p-8 flex-col">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/10 text-indigo-700 dark:text-indigo-300 border border-indigo-600/20">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">Insight-driven analytics</span>
          </div>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">OTT Analytics Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Discover insights from our comprehensive content library</p>
        </div>
        <ChartSlideshow height={320} className="w-full max-w-3xl self-center" />
        <LivePreviewCharts className="mt-6" height={240} />
        
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
          <h3 className="font-medium text-blue-800 dark:text-blue-300 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Premium Analytics Access
          </h3>
          <ul className="mt-2 space-y-1">
            <li className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
              <ChevronRight className="w-4 h-4 mr-1 text-blue-500" />
              Interactive dashboards with 15+ advanced visualizations
            </li>
            <li className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
              <ChevronRight className="w-4 h-4 mr-1 text-blue-500" />
              Custom filters and real-time data updates
            </li>
            <li className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
              <ChevronRight className="w-4 h-4 mr-1 text-blue-500" />
              Export reports and data in multiple formats
            </li>
          </ul>
        </div>
      </div>
      
      {/* Right side - Login Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-6 lg:p-8">
        <div className="max-w-md w-full space-y-6 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-xl shadow-black/5 p-6 lg:p-8">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">Access the full OTT Analytics experience</p>

          <div className="mt-4 flex justify-center space-x-4">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-2">
                <BarChart2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Advanced Charts</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-2">
                <Grid className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Custom Filters</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-2">
                <PieChart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Export Reports</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
            <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-500" />
            Enterprise-grade security
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
                <span className="text-red-500 dark:text-red-400 ml-1">*</span>
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  validate: (value) => validateEmail(value) || 'Please enter a valid email address'
                })}
                type="email"
                placeholder="Enter your email"
                className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white ${errors.email ? 'border-red-300 dark:border-red-700 text-red-900 dark:text-red-300 placeholder-red-300 dark:placeholder-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              />
              {errors.email && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1 relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
                <span className="text-red-500 dark:text-red-400 ml-1">*</span>
              </label>
              <input
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white ${errors.password ? 'border-red-300 dark:border-red-700 text-red-900 dark:text-red-300 placeholder-red-300 dark:placeholder-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              />
              <button
                type="button"
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {errors.password && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 select-none">
                <input type="checkbox" {...register('remember')} className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500" />
                Remember me
              </label>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                Your data is encrypted
              </div>
            </div>
          </div>

          {(errors.root || state.error) && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="text-red-600 dark:text-red-400 text-sm">
                {errors.root?.message || state.error}
              </p>
            </div>
          )}

          <div>
            <Button
              type="submit"
              className="w-full"
              loading={isLoading || state.loading}
              disabled={isLoading || state.loading}
            >
              Sign in
            </Button>
          </div>

          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Sign up here
              </Link>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Create an account to access full analytics, custom filters, and data export features
            </p>
          </div>
        </form>
        </div>
      </div>
      
      {/* Mobile Slideshow - Only visible on smaller screens */}
      <div className="lg:hidden w-full px-4 py-6 space-y-6 mt-4">
        <h3 className="text-lg font-medium text-center text-gray-900 dark:text-white">
          Preview Analytics
        </h3>
        <ChartSlideshow height={180} className="w-full" />
        <LivePreviewCharts height={220} />
        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
          <p className="text-sm text-center text-gray-600 dark:text-gray-300">
            Sign up for full access to all analytics features and interactive dashboards
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
