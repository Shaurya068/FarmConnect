import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthPage = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        role: 'customer',
        phone: '',
        location: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error when user types
    };

    const validateForm = () => {
        if (!formData.email || !formData.password) {
            setError('Email and password are required');
            return false;
        }

        if (!isLogin) {
            if (!formData.fullName) {
                setError('Full name is required');
                return false;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return false;
            }
            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                // Login
                await signInWithEmailAndPassword(auth, formData.email, formData.password);
            } else {
                // Signup
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    formData.email,
                    formData.password
                );

                // Create user profile in Firestore
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    uid: userCredential.user.uid,
                    email: formData.email,
                    fullName: formData.fullName,
                    role: formData.role,
                    phone: formData.phone || '',
                    location: formData.location || '',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }

            if (onAuthSuccess) {
                onAuthSuccess();
            }
        } catch (error) {
            console.error('Auth error:', error);

            // Handle specific Firebase errors
            switch (error.code) {
                case 'auth/user-not-found':
                    setError('No account found with this email');
                    break;
                case 'auth/wrong-password':
                    setError('Incorrect password');
                    break;
                case 'auth/email-already-in-use':
                    setError('Email is already registered');
                    break;
                case 'auth/weak-password':
                    setError('Password is too weak');
                    break;
                case 'auth/invalid-email':
                    setError('Invalid email address');
                    break;
                default:
                    setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            fullName: '',
            role: 'customer',
            phone: '',
            location: ''
        });
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center p-4 bg-pattern-2">

            <div className="enhanced-card fade-in" style={{ maxWidth: '500px', width: '100%' }}>
                {/* Header */}
                <div className="text-white text-center py-5"
                    style={{
                        background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                        borderRadius: '20px 20px 0 0'
                    }}>
                    <div className="d-flex align-items-center justify-content-center mb-3">
                        <span className="me-3" style={{ fontSize: '3.5rem' }}>🌱</span>
                        <h1 className="h2 fw-bold mb-0">FarmConnect</h1>
                    </div>
                    <p className="mb-0 opacity-75 lead">
                        {isLogin ? 'Welcome back to the marketplace!' : 'Join our farming community'}
                    </p>
                </div>

                <div className="p-5">
                    {/* Toggle Buttons */}
                    <div className="row g-2 mb-4">
                        <div className="col-6">
                            <button
                                type="button"
                                className={`btn w-100 btn-animated ${isLogin ? 'btn-primary-custom' : 'btn-outline-primary'}`}
                                onClick={() => setIsLogin(true)}
                            >
                                Login
                            </button>
                        </div>
                        <div className="col-6">
                            <button
                                type="button"
                                className={`btn w-100 btn-animated ${!isLogin ? 'btn-primary-custom' : 'btn-outline-primary'}`}
                                onClick={() => setIsLogin(false)}
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="alert alert-danger d-flex align-items-center mb-4 slide-up" role="alert">
                            <span className="me-2">⚠️</span>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="slide-up">
                        {/* Role Selection (Signup only) */}
                        {!isLogin && (
                            <div className="mb-4">
                                <label className="form-label-custom">I am a:</label>
                                <div className="row g-3">
                                    <div className="col-6">
                                        <div className={`card h-100 hover-lift ${formData.role === 'farmer' ? 'border-success bg-light' : 'border-light'}`}
                                            style={{ cursor: 'pointer', borderRadius: '12px' }}
                                            onClick={() => setFormData({ ...formData, role: 'farmer' })}>
                                            <div className="card-body text-center p-3">
                                                <div style={{ fontSize: '2.5rem' }}>👨‍🌾</div>
                                                <small className="fw-semibold">Farmer</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className={`card h-100 hover-lift ${formData.role === 'customer' ? 'border-primary bg-light' : 'border-light'}`}
                                            style={{ cursor: 'pointer', borderRadius: '12px' }}
                                            onClick={() => setFormData({ ...formData, role: 'customer' })}>
                                            <div className="card-body text-center p-3">
                                                <div style={{ fontSize: '2.5rem' }}>🛒</div>
                                                <small className="fw-semibold">Customer</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Full Name (Signup only) */}
                        {!isLogin && (
                            <div className="mb-3">
                                <label htmlFor="fullName" className="form-label-custom">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    className="form-control form-control-custom"
                                    id="fullName"
                                    name="fullName"
                                    placeholder="Enter your full name"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        {/* Email */}
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label-custom">
                                Email Address
                            </label>
                            <input
                                type="email"
                                className="form-control form-control-custom"
                                id="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label-custom">
                                Password
                            </label>
                            <input
                                type="password"
                                className="form-control form-control-custom"
                                id="password"
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        {/* Confirm Password (Signup only) */}
                        {!isLogin && (
                            <div className="mb-3">
                                <label htmlFor="confirmPassword" className="form-label-custom">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    className="form-control form-control-custom"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        {/* Phone (Signup only) */}
                        {!isLogin && (
                            <div className="mb-3">
                                <label htmlFor="phone" className="form-label-custom">
                                    Phone Number <span className="text-muted">(Optional)</span>
                                </label>
                                <input
                                    type="tel"
                                    className="form-control form-control-custom"
                                    id="phone"
                                    name="phone"
                                    placeholder="Enter your phone number"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                />
                            </div>
                        )}

                        {/* Location (Signup only) */}
                        {!isLogin && (
                            <div className="mb-4">
                                <label htmlFor="location" className="form-label-custom">
                                    Location <span className="text-muted">(Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control form-control-custom"
                                    id="location"
                                    name="location"
                                    placeholder="City, State"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                />
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="btn btn-animated btn-primary-custom btn-lg w-100 fw-semibold"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    {isLogin ? 'Signing in...' : 'Creating account...'}
                                </>
                            ) : (
                                isLogin ? 'Sign In' : 'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Toggle Link */}
                    <div className="text-center mt-4">
                        <p className="mb-0">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button
                                type="button"
                                className="btn btn-link p-0 fw-semibold gradient-text"
                                onClick={toggleMode}
                            >
                                {isLogin ? 'Sign up here' : 'Sign in here'}
                            </button>
                        </p>
                    </div>

                    {/* Demo Notice */}
                    <div className="alert alert-info d-flex align-items-center justify-content-center mt-4"
                        style={{ borderRadius: '12px', border: 'none', background: 'rgba(33, 150, 243, 0.1)' }}>
                        <span className="me-2">ℹ️</span>
                        <small>Demo accounts available for testing</small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
