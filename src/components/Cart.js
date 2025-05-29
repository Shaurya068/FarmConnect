import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const Cart = ({ isOpen, onClose, onCheckout }) => {
    const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(price);
    };

    if (!isOpen) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="enhanced-card modal-content border-0">
                    {/* Header */}
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold d-flex align-items-center">
                            <span className="me-2" style={{ fontSize: '1.5rem' }}>🛒</span>
                            Shopping Cart ({cart.length} items)
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                        ></button>
                    </div>

                    {/* Body */}
                    <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {cart.length === 0 ? (
                            <div className="text-center py-4">
                                <div style={{ fontSize: '4rem' }}>🛒</div>
                                <h4 className="text-muted">Your cart is empty</h4>
                                <p className="text-muted">Add some fresh products to get started!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cart.map((item) => (
                                    <div key={item.id} className="card border-0 bg-light">
                                        <div className="card-body p-3">
                                            <div className="row align-items-center">
                                                {/* Product Image */}
                                                <div className="col-3">
                                                    {item.imageUrl ? (
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.name}
                                                            className="img-fluid rounded"
                                                            style={{ height: '60px', objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <div className="bg-secondary rounded d-flex align-items-center justify-content-center"
                                                            style={{ height: '60px', width: '60px' }}>
                                                            <span style={{ fontSize: '1.5rem' }}>📦</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Product Details */}
                                                <div className="col-6">
                                                    <h6 className="mb-1 fw-bold">{item.name}</h6>
                                                    <small className="text-muted">by {item.farmerName}</small>
                                                    <div className="fw-bold text-success">
                                                        {formatPrice(item.price)} per unit
                                                    </div>
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="col-3">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div className="input-group input-group-sm">
                                                            <button
                                                                className="btn btn-outline-secondary"
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            >
                                                                -
                                                            </button>
                                                            <input
                                                                type="number"
                                                                className="form-control text-center"
                                                                value={item.quantity}
                                                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                                                                min="0"
                                                                max={item.availableQuantity}
                                                            />
                                                            <button
                                                                className="btn btn-outline-secondary"
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                disabled={item.quantity >= item.availableQuantity}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="text-center mt-2">
                                                        <small className="fw-bold">
                                                            {formatPrice(item.price * item.quantity)}
                                                        </small>
                                                    </div>
                                                    <div className="text-center">
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => removeFromCart(item.id)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {cart.length > 0 && (
                        <div className="modal-footer border-0 pt-0">
                            <div className="w-100">
                                {/* Total */}
                                <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
                                    <h5 className="mb-0 fw-bold">Total:</h5>
                                    <h4 className="mb-0 fw-bold text-success">
                                        {formatPrice(getCartTotal())}
                                    </h4>
                                </div>

                                {/* Action Buttons */}
                                <div className="row g-2">
                                    <div className="col-6">
                                        <button
                                            className="btn btn-outline-secondary w-100"
                                            onClick={clearCart}
                                        >
                                            Clear Cart
                                        </button>
                                    </div>
                                    <div className="col-6">
                                        <button
                                            className="btn btn-primary-custom w-100 btn-animated"
                                            onClick={onCheckout}
                                        >
                                            Proceed to Checkout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Cart;
