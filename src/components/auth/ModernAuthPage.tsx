import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  Sprout, 
  Mail, 
  Lock, 
  Building, 
  Eye, 
  EyeOff,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

const ModernAuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [userRole, setUserRole] = useState<'farmer' | 'buyer'>('farmer');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'role' | 'auth'>('role');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const { signInWithGoogle, signInWithFacebook, signInWithEmail, signUpWithEmail } = useAuth();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: {
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    try {
      if (provider === 'google') {
        await signInWithGoogle(userRole);
      } else {
        await signInWithFacebook(userRole);
      }
      toast.success(`Welcome! You're signed in as a ${userRole}.`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      toast.error(errorMessage);
      console.error(error);
    }
    setLoading(false);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmail(formData.email, formData.password);
        toast.success(`Welcome back! You're signed in as a ${userRole}.`);
      } else {
        await signUpWithEmail(formData.email, formData.password, userRole);
        toast.success(`Account created successfully! Welcome as a ${userRole}.`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const handleRoleSelect = (role: 'farmer' | 'buyer') => {
    console.log('Role selected:', role);
    setUserRole(role);
    setStep('auth');
    console.log('Step changed to:', 'auth');
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
    setStep('role');
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center px-4 py-8">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full blur-3xl"></div>
      </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8"
        >
          {/* Debug info */}
          <div className="absolute top-2 right-2 text-xs text-gray-400">
            Step: {step} | Role: {userRole}
          </div>
        {/* Header */}
        <motion.div 
          variants={itemVariants}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl mb-6 shadow-lg"
          >
            <Sprout className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1 
            variants={itemVariants}
            className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2"
          >
            FarmConnect
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-gray-600 text-lg"
          >
            Direct farm-to-buyer marketplace
          </motion.p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'role' && (
            <motion.div
              key="role"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
                  Choose Your Role
                </h2>
                <p className="text-gray-600 text-center mb-8">
                  Select how you want to use FarmConnect
                </p>
                
                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRoleSelect('farmer')}
                    className="w-full group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                    style={{ opacity: 1, visibility: 'visible', display: 'block' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center">
                      <div className="p-3 bg-white/20 rounded-xl mr-4">
                        <Sprout className="w-8 h-8" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-semibold mb-1">I'm a Farmer</h3>
                        <p className="text-emerald-100 text-sm">
                          Sell your crops directly to buyers
                        </p>
                      </div>
                      <ArrowRight className="w-6 h-6 ml-auto group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRoleSelect('buyer')}
                    className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                    style={{ opacity: 1, visibility: 'visible', display: 'block' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center">
                      <div className="p-3 bg-white/20 rounded-xl mr-4">
                        <Building className="w-8 h-8" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-semibold mb-1">I'm a Buyer</h3>
                        <p className="text-blue-100 text-sm">
                          Find fresh crops from local farmers
                        </p>
                      </div>
                      <ArrowRight className="w-6 h-6 ml-auto group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
          
          {step === 'auth' && (
            <div className="w-full">
              {/* Role Indicator */}
              <motion.div 
                variants={itemVariants}
                className="mb-6"
              >
                <div className="flex items-center justify-center mb-4">
                  <button
                    onClick={() => setStep('role')}
                    className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                    Back to Role Selection
                  </button>
                </div>
                
                <div className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
                  {userRole === 'farmer' ? (
                    <Sprout className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <Building className="w-6 h-6 text-blue-600" />
                  )}
                  <span className="font-semibold text-gray-800">
                    {userRole === 'farmer' ? 'Farmer Account' : 'Buyer Account'}
                  </span>
                </div>
              </motion.div>

              {/* Auth Form */}
              <form 
                onSubmit={handleEmailAuth} 
                className="space-y-6"
              >
                <div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 bg-white text-gray-900 ${
                        errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ opacity: 1, visibility: 'visible' }}
                      required
                    />
                  </div>
                  {errors.email && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center mt-2 text-red-600 text-sm"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </motion.div>
                  )}
                </div>
                
                <div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className={`w-full pl-12 pr-12 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 bg-white text-gray-900 ${
                        errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ opacity: 1, visibility: 'visible' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center mt-2 text-red-600 text-sm"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.password}
                    </motion.div>
                  )}
                </div>

                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className={`w-full pl-12 pr-12 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 ${
                          errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center mt-2 text-red-600 text-sm"
                      >
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.confirmPassword}
                      </motion.div>
                    )}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 disabled:opacity-50 font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center"
                  style={{ opacity: 1, visibility: 'visible' }}
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="w-6 h-6 mr-2" />
                  )}
                  {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                </button>
              </form>

              {/* Social Login */}
              <div className="mt-8">
                <div className="flex items-center mb-6">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-4 text-gray-500 text-sm font-medium">or continue with</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>
                
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-700 text-sm text-center">
                    <strong>Note:</strong> Social login opens in a popup window. Please allow popups for this site.
                  </p>
                </div>

                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSocialLogin('google')}
                    disabled={loading}
                    className="w-full flex items-center justify-center px-6 py-4 border-2 border-gray-200 rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md bg-white"
                    style={{ opacity: 1, visibility: 'visible' }}
                  >
                    <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="font-medium">Continue with Google</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSocialLogin('facebook')}
                    disabled={loading}
                    className="w-full flex items-center justify-center px-6 py-4 border-2 border-gray-200 rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md bg-white"
                    style={{ opacity: 1, visibility: 'visible' }}
                  >
                    <svg className="w-6 h-6 mr-3" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="font-medium">Continue with Facebook</span>
                  </motion.button>
                </div>
              </div>

              {/* Toggle Auth Mode */}
              <div className="text-center mt-8">
                <button
                  onClick={toggleAuthMode}
                  className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ModernAuthPage;
