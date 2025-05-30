import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const RoleSelectionModal = ({ user, onRoleSelected }) => {
    const [selectedRole, setSelectedRole] = useState('customer');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRoleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            // Update user profile with selected role
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email: user.email,
                fullName: user.displayName || '',
                role: selectedRole,
                phone: user.phoneNumber || '',
                location: '',
                profilePicture: user.photoURL || '',
                provider: 'google',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            onRoleSelected(selectedRole);
        } catch (error) {
            console.error('Error saving role:', error);
            setError('Failed to save role. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="enhanced-card modal-content border-0">
                    {/* Header */}
                    <div className="modal-header border-0 text-center py-4"
                        style={{
                            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                            borderRadius: '20px 20px 0 0'
                        }}>
                        <div className="w-100">
                            <h4 className="modal-title fw-bold text-white mb-2">
                                Welcome to FarmConnect! 🌱
                            </h4>
                            <p className="text-white opacity-75 mb-0">
                                Please select your account type to continue
                            </p>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="modal-body p-4">
                        {/* User Info */}
                        <div className="text-center mb-4">
                            {user.photoURL && (
                                <img
                                    src={user.photoURL}
                                    alt="Profile"
                                    className="rounded-circle mb-3"
                                    style={{ width: '80px', height: '80px' }}
                                />
                            )}
                            <h5 className="fw-bold">{user.displayName}</h5>
                            <small className="text-muted">{user.email}</small>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <div className="alert alert-danger d-flex align-items-center mb-4">
                                <span className="me-2">⚠️</span>
                                {error}
                            </div>
                        )}

                        {/* Role Selection */}
                        <div className="mb-4">
                            <label className="form-label fw-semibold mb-3">I want to join as:</label>
                            <div className="row g-3">
                                <div className="col-6">
                                    <div
                                        className={`card h-100 hover-lift ${selectedRole === 'farmer' ? 'border-success bg-light' : 'border-light'}`}
                                        style={{ cursor: 'pointer', borderRadius: '12px' }}
                                        onClick={() => setSelectedRole('farmer')}
                                    >
                                        <div className="card-body text-center p-4">
                                            <div style={{ fontSize: '3rem' }} className="mb-2">👨‍🌾</div>
                                            <h6 className="fw-bold mb-2">Farmer</h6>
                                            <small className="text-muted">
                                                Sell your fresh produce directly to customers
                                            </small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div
                                        className={`card h-100 hover-lift ${selectedRole === 'customer' ? 'border-primary bg-light' : 'border-light'}`}
                                        style={{ cursor: 'pointer', borderRadius: '12px' }}
                                        onClick={() => setSelectedRole('customer')}
                                    >
                                        <div className="card-body text-center p-4">
                                            <div style={{ fontSize: '3rem' }} className="mb-2">🛒</div>
                                            <h6 className="fw-bold mb-2">Customer</h6>
                                            <small className="text-muted">
                                                Buy fresh, local produce from nearby farmers
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Selected Role Info */}
                        <div className="alert alert-info d-flex align-items-center">
                            <span className="me-2">ℹ️</span>
                            <small>
                                You selected: <strong className="text-capitalize">{selectedRole}</strong>
                                {selectedRole === 'farmer' ?
                                    ' - You can add and manage your products' :
                                    ' - You can browse and purchase products'
                                }
                            </small>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer border-0 pt-0">
                        <button
                            className="btn btn-primary-custom w-100 btn-animated"
                            onClick={handleRoleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Setting up your account...
                                </>
                            ) : (
                                `Continue as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleSelectionModal;
