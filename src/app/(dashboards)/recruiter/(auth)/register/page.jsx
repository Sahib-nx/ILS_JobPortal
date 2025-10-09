"use client";

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const handleGoogleLogin = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/google?userType=recruiter`;
    };

    const handleRegister = async () => {
        setIsLoading(true);
        setError('');

        if (!formData.name || !formData.email || !formData.password) {
            setError('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            console.log('Response status:', response.status);
            console.log('Response data:', data);

            if (response.ok && data.success) {
                console.log('Registration successful, storing data...');


                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userId', data.user.id);
                localStorage.setItem('name', data.user.name);


                setSuccess(true);

                setTimeout(() => {
                    window.location.href = "/recruiter-form";
                }, 2000);
            } else {
                console.log('Registration failed:', data);
                setError(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError('Network error. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#dbeafe] via-blue-50 to-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="text-center max-w-sm sm:max-w-md">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 animate-bounce">
                        <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#1c398e] mb-3 sm:mb-4">Welcome to ILS!</h2>
                    <p className="text-sm sm:text-base text-blue-600 mb-4 sm:mb-6 px-4">Your Recruiter account has been created successfully. Redirecting to Company Registration Page...</p>
                    <div className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#1c398e] animate-spin" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#dbeafe] via-blue-50 to-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-[#1c398e]/10 to-blue-300/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-blue-400/10 to-[#1c398e]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className={`w-full max-w-sm sm:max-w-md lg:max-w-lg relative z-10 transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <div className="text-center mb-6 sm:mb-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#1c398e] to-[#3b82f6] rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-lg sm:text-2xl shadow-xl mx-auto mb-3 sm:mb-4 transform hover:scale-105 transition-transform duration-300">
                        ILS
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#1c398e] mb-1 sm:mb-2">Create Your Recruiter Account</h1>
                </div>

                <div className="bg-white/80 backdrop-blur-lg rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/50">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <div className="space-y-4 sm:space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-[#1c398e] mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4 sm:w-5 sm:h-5" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1c398e] focus:border-transparent transition-all duration-300 placeholder-blue-300 text-[#1c398e] text-sm sm:text-base"
                                    placeholder="Choose a username"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#1c398e] mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4 sm:w-5 sm:h-5" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1c398e] focus:border-transparent transition-all duration-300 placeholder-blue-300 text-[#1c398e] text-sm sm:text-base"
                                    placeholder="your.email@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#1c398e] mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4 sm:w-5 sm:h-5" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1c398e] focus:border-transparent transition-all duration-300 placeholder-blue-200 text-[#1c398e] text-sm sm:text-base"
                                    placeholder="Create a secure password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-[#1c398e] transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-start space-x-2">
                            <input type="checkbox" className="rounded border-blue-300 text-[#1c398e] focus:ring-[#1c398e] mt-0.5 sm:mt-1 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                I agree to the{' '}
                                <a href="/terms" className="text-[#1c398e] hover:text-blue-600 transition-colors">
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href="/privacy" className="text-[#1c398e] hover:text-blue-600 transition-colors">
                                    Privacy Policy
                                </a>
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={handleRegister}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-[#1c398e] to-[#3b82f6] text-white py-3 sm:py-4 rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-[1.02] font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                    <span>Creating account...</span>
                                </>
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                </>
                            )}
                        </button>
                    </div>


                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-blue-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white/80 text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <button
                            onClick={handleGoogleLogin}
                            type="button"
                            className="mt-4 w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-50 hover:shadow-md transition-all duration-300 font-medium"
                        >
                            <img
                                src="https://www.svgrepo.com/show/475656/google-color.svg"
                                alt="Google"
                                className="w-5 h-5"
                            />
                            <span>Sign up with Google</span>
                        </button>
                    </div>


                    <div className="mt-6 sm:mt-8 text-center">
                        <p className="text-sm sm:text-base text-gray-600">
                            Already have an account?{' '}
                            <a href="/auth/login" className="text-[#1c398e] hover:text-blue-600 font-semibold transition-colors">
                                Sign in here
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;