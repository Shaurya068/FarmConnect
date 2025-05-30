import React, { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { updatePassword, updateEmail } from 'firebase/auth';
import { auth, db } from '../firebase';

const ProfilePage = ({ isOpen, onClose, userProfile, onProfileUpdate }) => {
    const [activeTab, setActiveTab] = useState('personal');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [personalInfo, setPersonalInfo] = useState({
        fullName: '',
        email: '',
        phone: '',
        location: '',
        bio: ''
    });

    const [securityInfo, setSecurityInfo] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        smsNotifications: false,
        marketingEmails: true,
        language: 'en',
        theme: 'light'
    });

    useEffect(() => {
        if (userProfile) {
            setPersonalInfo({
                fullName: userProfile.fullName || '',
                email: userProfile.email || auth.currentUser?.email || '',
                phone: userProfile.phone || '',
                location: userProfile.location || '',
                bio: userProfile.bio || ''
            });
        }
    }, [userProfile]);

    const handlePersonalInfoChange = (e) => {
        setPersonalInfo({
            ...personalInfo,
            [e.target.name]: e.target.value
        });
        setError('');
        setSuccess('');
    };

    const handleSecurityChange = (e) => {
        setSecurityInfo({
            ...securityInfo,
            [e.target.name]: e.target.value
        });
        setError('');
        setSuccess('');
    };

    const handlePreferencesChange = (e) => {
        const { name, type, checked, value } = e.target;
        setPreferences({
            ...preferences,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const savePersonalInfo = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Update Firestore document
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                fullName: personalInfo.fullName,
                phone: personalInfo.phone,
                location: personalInfo.location,
                bio: personalInfo.bio,
                updatedAt: new Date()
            });

            // Update email if changed
            if (personalInfo.email !== auth.currentUser.email) {
                await updateEmail(auth.currentUser, personalInfo.email);
            }

            setSuccess('Profile updated successfully!');
            onProfileUpdate();
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async () => {
        if (securityInfo.newPassword !== securityInfo.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (securityInfo.newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await updatePassword(auth.currentUser, securityInfo.newPassword);
            setSuccess('Password updated successfully!');
            setSecurityInfo({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Error updating password:', error);
            setError('Failed to update password: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const savePreferences = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                preferences: preferences,
                updatedAt: new Date()
            });

            setSuccess('Preferences saved successfully!');
        } catch (error) {
            console.error('Error saving preferences:', error);
            setError('Failed to save preferences: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-xl">
                <div className="enhanced-card modal-content border-0">
                    {/* Header */}
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold d-flex align-items-center">
                            <span className="me-2" style={{ fontSize: '1.5rem' }}>👤</span>
                            My Profile
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                        ></button>
                    </div>

                    {/* Body */}
                    <div className="modal-body p-0">
                        <div className="row g-0">
                            {/* Sidebar Navigation */}
                            <div className="col-md-3 bg-light">
                                <div className="p-4">
                                    {/* User Avatar */}
                                    <div className="text-center mb-4">
                                        <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                background: 'linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)',
                                                fontSize: '2.5rem'
                                            }}>
                                            {userProfile?.role === "farmer" ? "👨‍🌾" : "🛒"}
                                        </div>
                                        <h6 className="fw-bold">{personalInfo.fullName || 'User'}</h6>
                                        <small className="text-muted text-capitalize">{userProfile?.role}</small>
                                    </div>

                                    {/* Navigation Tabs */}
                                    <div className="nav flex-column nav-pills">
                                        <button
                                            className={`nav-link text-start ${activeTab === 'personal' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('personal')}
                                        >
                                            <span className="me-2">👤</span>
                                            Personal Info
                                        </button>
                                        <button
                                            className={`nav-link text-start ${activeTab === 'security' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('security')}
                                        >
                                            <span className="me-2">🔒</span>
                                            Security
                                        </button>
                                        <button
                                            className={`nav-link text-start ${activeTab === 'preferences' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('preferences')}
                                        >
                                            <span className="me-2">⚙️</span>
                                            Preferences
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="col-md-9">
                                <div className="p-4">
                                    {/* Alerts */}
                                    {error && (
                                        <div className="alert alert-danger d-flex align-items-center mb-4">
                                            <span className="me-2">⚠️</span>
                                            {error}
                                        </div>
                                    )}

                                    {success && (
                                        <div className="alert alert-success d-flex align-items-center mb-4">
                                            <span className="me-2">✅</span>
                                            {success}
                                        </div>
                                    )}

                                    {/* Personal Information Tab */}
                                    {activeTab === 'personal' && (
                                        <div className="fade-in">
                                            <h5 className="fw-bold mb-4">Personal Information</h5>

                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label-custom">Full Name</label>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-custom"
                                                        name="fullName"
                                                        value={personalInfo.fullName}
                                                        onChange={handlePersonalInfoChange}
                                                        placeholder="Enter your full name"
                                                    />
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label-custom">Email Address</label>
                                                    <input
                                                        type="email"
                                                        className="form-control form-control-custom"
                                                        name="email"
                                                        value={personalInfo.email}
                                                        onChange={handlePersonalInfoChange}
                                                        placeholder="Enter your email"
                                                    />
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label-custom">Phone Number</label>
                                                    <input
                                                        type="tel"
                                                        className="form-control form-control-custom"
                                                        name="phone"
                                                        value={personalInfo.phone}
                                                        onChange={handlePersonalInfoChange}
                                                        placeholder="Enter your phone number"
                                                    />
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label-custom">Location</label>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-custom"
                                                        name="location"
                                                        value={personalInfo.location}
                                                        onChange={handlePersonalInfoChange}
                                                        placeholder="City, State"
                                                    />
                                                </div>

                                                <div className="col-12">
                                                    <label className="form-label-custom">Bio</label>
                                                    <textarea
                                                        className="form-control form-control-custom"
                                                        name="bio"
                                                        rows="4"
                                                        value={personalInfo.bio}
                                                        onChange={handlePersonalInfoChange}
                                                        placeholder="Tell us about yourself..."
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <button
                                                    className="btn btn-primary-custom btn-animated"
                                                    onClick={savePersonalInfo}
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        'Save Changes'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Security Tab */}
                                    {activeTab === 'security' && (
                                        <div className="fade-in">
                                            <h5 className="fw-bold mb-4">Security Settings</h5>

                                            <div className="row g-3">
                                                <div className="col-12">
                                                    <label className="form-label-custom">Current Password</label>
                                                    <input
                                                        type="password"
                                                        className="form-control form-control-custom"
                                                        name="currentPassword"
                                                        value={securityInfo.currentPassword}
                                                        onChange={handleSecurityChange}
                                                        placeholder="Enter current password"
                                                    />
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label-custom">New Password</label>
                                                    <input
                                                        type="password"
                                                        className="form-control form-control-custom"
                                                        name="newPassword"
                                                        value={securityInfo.newPassword}
                                                        onChange={handleSecurityChange}
                                                        placeholder="Enter new password"
                                                    />
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label-custom">Confirm New Password</label>
                                                    <input
                                                        type="password"
                                                        className="form-control form-control-custom"
                                                        name="confirmPassword"
                                                        value={securityInfo.confirmPassword}
                                                        onChange={handleSecurityChange}
                                                        placeholder="Confirm new password"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <button
                                                    className="btn btn-primary-custom btn-animated"
                                                    onClick={changePassword}
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                                            Updating...
                                                        </>
                                                    ) : (
                                                        'Update Password'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Preferences Tab */}
                                    {activeTab === 'preferences' && (
                                        <div className="fade-in">
                                            <h5 className="fw-bold mb-4">Preferences</h5>

                                            <div className="row g-4">
                                                {/* Notifications */}
                                                <div className="col-12">
                                                    <h6 className="fw-semibold mb-3">Notifications</h6>
                                                    <div className="form-check mb-2">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            name="emailNotifications"
                                                            checked={preferences.emailNotifications}
                                                            onChange={handlePreferencesChange}
                                                        />
                                                        <label className="form-check-label">
                                                            Email Notifications
                                                        </label>
                                                    </div>
                                                    <div className="form-check mb-2">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            name="smsNotifications"
                                                            checked={preferences.smsNotifications}
                                                            onChange={handlePreferencesChange}
                                                        />
                                                        <label className="form-check-label">
                                                            SMS Notifications
                                                        </label>
                                                    </div>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            name="marketingEmails"
                                                            checked={preferences.marketingEmails}
                                                            onChange={handlePreferencesChange}
                                                        />
                                                        <label className="form-check-label">
                                                            Marketing Emails
                                                        </label>
                                                    </div>
                                                </div>

                                                {/* Language & Theme */}
                                                <div className="col-md-6">
                                                    <label className="form-label-custom">Language</label>
                                                    <select
                                                        className="form-select form-control-custom"
                                                        name="language"
                                                        value={preferences.language}
                                                        onChange={handlePreferencesChange}
                                                    >
                                                        <option value="en">English</option>
                                                        <option value="hi">Hindi</option>
                                                        <option value="mr">Marathi</option>
                                                    </select>
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label-custom">Theme</label>
                                                    <select
                                                        className="form-select form-control-custom"
                                                        name="theme"
                                                        value={preferences.theme}
                                                        onChange={handlePreferencesChange}
                                                    >
                                                        <option value="light">Light</option>
                                                        <option value="dark">Dark</option>
                                                        <option value="auto">Auto</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <button
                                                    className="btn btn-primary-custom btn-animated"
                                                    onClick={savePreferences}
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        'Save Preferences'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
