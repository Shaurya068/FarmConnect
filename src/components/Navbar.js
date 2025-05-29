import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useCart } from '../context/CartContext';

const Navbar = ({ user, userProfile, role, onCartClick, onProfileClick }) => {
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const { getCartItemsCount, getCartTotal } = useCart();

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(price);
    };

    const toggleProfileDropdown = () => {
        setShowProfileDropdown(!showProfileDropdown);
    };

    const toggleMobileMenu = () => {
        setShowMobileMenu(!showMobileMenu);
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light navbar-custom sticky-top">
            <div className="container">
                {/* Brand */}
                <div className="navbar-brand d-flex align-items-center">
                    <span className="me-3" style={{ fontSize: '2.5rem' }}>🌱</span>
                    <span className="navbar-brand-custom">FarmConnect</span>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="navbar-toggler d-lg-none border-0"
                    onClick={toggleMobileMenu}
                    style={{ background: 'none' }}
                >
                    <span style={{ fontSize: '1.5rem' }}>☰</span>
                </button>

                {/* Navigation Items */}
                <div className={`collapse navbar-collapse ${showMobileMenu ? 'show' : ''}`}>
                    <div className="navbar-nav ms-auto d-flex align-items-center">

                        {/* Dashboard Link */}
                        <div className="nav-item me-3">
                            <span className="nav-link fw-semibold text-muted">
                                <span className="me-2">
                                    {role === "farmer" ? "👨‍🌾" : "🏪"}
                                </span>
                                {role === "farmer" ? "Farmer Dashboard" : "Marketplace"}
                            </span>
                        </div>

                        {/* Cart Button (Only for customers) */}
                        {role === "customer" && (
                            <div className="nav-item me-3">
                                <button
                                    className="btn btn-primary-custom btn-animated position-relative d-flex align-items-center"
                                    onClick={onCartClick}
                                    style={{ borderRadius: '25px', padding: '8px 16px' }}
                                >
                                    <span className="me-2" style={{ fontSize: '1.2rem' }}>🛒</span>
                                    <span className="d-none d-md-inline">Cart</span>

                                    {/* Cart Badge */}
                                    {getCartItemsCount() > 0 && (
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                            {getCartItemsCount()}
                                            <span className="visually-hidden">items in cart</span>
                                        </span>
                                    )}
                                </button>

                                {/* Cart Total (Desktop only) */}
                                {getCartItemsCount() > 0 && (
                                    <div className="d-none d-lg-block">
                                        <small className="text-muted">
                                            Total: {formatPrice(getCartTotal())}
                                        </small>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Notifications (Future feature) */}
                        <div className="nav-item me-3">
                            <button className="btn btn-outline-secondary position-relative" style={{ borderRadius: '50%', width: '45px', height: '45px' }}>
                                <span style={{ fontSize: '1.2rem' }}>🔔</span>
                                {/* Notification badge */}
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning">
                                    3
                                    <span className="visually-hidden">notifications</span>
                                </span>
                            </button>
                        </div>

                        {/* User Profile Dropdown */}
                        <div className="nav-item dropdown position-relative">
                            <button
                                className="btn btn-link nav-link dropdown-toggle d-flex align-items-center p-0 border-0 bg-transparent"
                                onClick={toggleProfileDropdown}
                                style={{ textDecoration: 'none' }}
                            >
                                {/* User Avatar */}
                                <div className="rounded-circle d-flex align-items-center justify-content-center me-2 hover-lift"
                                    style={{
                                        width: '45px',
                                        height: '45px',
                                        background: 'linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)',
                                        fontSize: '1.5rem',
                                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                                    }}>
                                    {role === "farmer" ? "👨‍🌾" : "🛒"}
                                </div>

                                {/* User Info (Desktop only) */}
                                <div className="d-none d-lg-block text-start">
                                    <div className="fw-bold text-capitalize gradient-text" style={{ fontSize: '0.9rem' }}>
                                        {userProfile?.fullName || role}
                                    </div>
                                    <small className="text-muted">{user.email}</small>
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {showProfileDropdown && (
                                <div className="dropdown-menu dropdown-menu-end show enhanced-card border-0 shadow-lg"
                                    style={{ minWidth: '280px', marginTop: '10px' }}>

                                    {/* User Info Header */}
                                    <div className="dropdown-header bg-light rounded-top p-3">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                                style={{
                                                    width: '50px',
                                                    height: '50px',
                                                    background: 'linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)',
                                                    fontSize: '1.5rem'
                                                }}>
                                                {role === "farmer" ? "👨‍🌾" : "🛒"}
                                            </div>
                                            <div>
                                                <div className="fw-bold">{userProfile?.fullName || 'User'}</div>
                                                <small className="text-muted">{user.email}</small>
                                                <div>
                                                    <span className="badge bg-primary text-capitalize">{role}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="dropdown-divider"></div>

                                    {/* Profile Actions */}
                                    <button className="dropdown-item d-flex align-items-center py-2" onClick={onProfileClick}>
                                        <span className="me-3" style={{ fontSize: '1.2rem' }}>👤</span>
                                        <div>
                                            <div className="fw-semibold">My Profile</div>
                                            <small className="text-muted">Manage your account</small>
                                        </div>
                                    </button>

                                    {role === "farmer" && (
                                        <>
                                            <button className="dropdown-item d-flex align-items-center py-2">
                                                <span className="me-3" style={{ fontSize: '1.2rem' }}>📊</span>
                                                <div>
                                                    <div className="fw-semibold">Sales Analytics</div>
                                                    <small className="text-muted">View your performance</small>
                                                </div>
                                            </button>
                                            <button className="dropdown-item d-flex align-items-center py-2">
                                                <span className="me-3" style={{ fontSize: '1.2rem' }}>📦</span>
                                                <div>
                                                    <div className="fw-semibold">Manage Products</div>
                                                    <small className="text-muted">Add, edit, or remove items</small>
                                                </div>
                                            </button>
                                        </>
                                    )}

                                    {role === "customer" && (
                                        <>
                                            <button className="dropdown-item d-flex align-items-center py-2">
                                                <span className="me-3" style={{ fontSize: '1.2rem' }}>📋</span>
                                                <div>
                                                    <div className="fw-semibold">Order History</div>
                                                    <small className="text-muted">View past orders</small>
                                                </div>
                                            </button>
                                            <button className="dropdown-item d-flex align-items-center py-2">
                                                <span className="me-3" style={{ fontSize: '1.2rem' }}>❤️</span>
                                                <div>
                                                    <div className="fw-semibold">Wishlist</div>
                                                    <small className="text-muted">Saved products</small>
                                                </div>
                                            </button>
                                        </>
                                    )}

                                    <div className="dropdown-divider"></div>

                                    {/* Settings */}
                                    <button className="dropdown-item d-flex align-items-center py-2">
                                        <span className="me-3" style={{ fontSize: '1.2rem' }}>⚙️</span>
                                        <div>
                                            <div className="fw-semibold">Settings</div>
                                            <small className="text-muted">Preferences & privacy</small>
                                        </div>
                                    </button>

                                    <button className="dropdown-item d-flex align-items-center py-2">
                                        <span className="me-3" style={{ fontSize: '1.2rem' }}>❓</span>
                                        <div>
                                            <div className="fw-semibold">Help & Support</div>
                                            <small className="text-muted">Get assistance</small>
                                        </div>
                                    </button>

                                    <div className="dropdown-divider"></div>

                                    {/* Logout */}
                                    <button
                                        className="dropdown-item d-flex align-items-center py-2 text-danger"
                                        onClick={handleLogout}
                                    >
                                        <span className="me-3" style={{ fontSize: '1.2rem' }}>👋</span>
                                        <div>
                                            <div className="fw-semibold">Sign Out</div>
                                            <small>Log out of your account</small>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Cart Summary (Only for customers) */}
            {role === "customer" && getCartItemsCount() > 0 && (
                <div className="d-lg-none">
                    <div className="container">
                        <div className="alert alert-info d-flex justify-content-between align-items-center mb-0 mt-2">
                            <small>
                                <strong>{getCartItemsCount()}</strong> items in cart
                            </small>
                            <small className="fw-bold">
                                {formatPrice(getCartTotal())}
                            </small>
                        </div>
                    </div>
                </div>
            )}

            {/* Click outside to close dropdown */}
            {showProfileDropdown && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100"
                    style={{ zIndex: 1040 }}
                    onClick={() => setShowProfileDropdown(false)}
                ></div>
            )}
        </nav>
    );
};

export default Navbar;
