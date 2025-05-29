import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { db, auth } from '../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';

const Checkout = ({ isOpen, onClose, onOrderComplete }) => {
    const { cart, getCartTotal, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [orderData, setOrderData] = useState({
        deliveryAddress: '',
        phone: '',
        notes: '',
        paymentMethod: 'cod'
    });
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        setOrderData({
            ...orderData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(price);
    };

    const validateForm = () => {
        if (!orderData.deliveryAddress.trim()) {
            setError('Delivery address is required');
            return false;
        }
        if (!orderData.phone.trim()) {
            setError('Phone number is required');
            return false;
        }
        if (cart.length === 0) {
            setError('Your cart is empty');
            return false;
        }
        return true;
    };

    const handlePlaceOrder = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            // Group items by farmer
            const ordersByFarmer = cart.reduce((acc, item) => {
                const farmerId = item.farmerId;
                if (!acc[farmerId]) {
                    acc[farmerId] = {
                        farmerId,
                        farmerName: item.farmerName,
                        items: [],
                        totalAmount: 0
                    };
                }
                acc[farmerId].items.push({
                    productId: item.id,
                    productName: item.name,
                    quantity: item.quantity,
                    pricePerUnit: item.price,
                    totalPrice: item.price * item.quantity,
                    imageUrl: item.imageUrl
                });
                acc[farmerId].totalAmount += item.price * item.quantity;
                return acc;
            }, {});

            // Create separate orders for each farmer
            const orderPromises = Object.values(ordersByFarmer).map(async (farmerOrder) => {
                const order = {
                    customerId: auth.currentUser.uid,
                    customerEmail: auth.currentUser.email,
                    farmerId: farmerOrder.farmerId,
                    farmerName: farmerOrder.farmerName,
                    items: farmerOrder.items,
                    totalAmount: farmerOrder.totalAmount,
                    deliveryAddress: orderData.deliveryAddress,
                    phone: orderData.phone,
                    notes: orderData.notes,
                    paymentMethod: orderData.paymentMethod,
                    status: 'pending',
                    paymentStatus: 'pending',
                    orderDate: new Date(),
                    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
                };

                return await addDoc(collection(db, 'orders'), order);
            });

            // Wait for all orders to be created
            await Promise.all(orderPromises);

            // Update product quantities
            const updatePromises = cart.map(async (item) => {
                const newQuantity = item.availableQuantity - item.quantity;
                await updateDoc(doc(db, 'products', item.id), {
                    quantity: Math.max(0, newQuantity),
                    updatedAt: new Date()
                });
            });

            await Promise.all(updatePromises);

            // Clear cart and show success
            clearCart();
            onOrderComplete();
            onClose();

        } catch (error) {
            console.error('Error placing order:', error);
            setError('Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="enhanced-card modal-content border-0">
                    {/* Header */}
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold d-flex align-items-center">
                            <span className="me-2" style={{ fontSize: '1.5rem' }}>📋</span>
                            Checkout
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                        ></button>
                    </div>

                    {/* Body */}
                    <div className="modal-body">
                        {error && (
                            <div className="alert alert-danger d-flex align-items-center mb-4">
                                <span className="me-2">⚠️</span>
                                {error}
                            </div>
                        )}

                        <div className="row">
                            {/* Order Summary */}
                            <div className="col-md-6">
                                <h6 className="fw-bold mb-3">Order Summary</h6>
                                <div className="bg-light rounded p-3 mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {cart.map((item) => (
                                        <div key={item.id} className="d-flex justify-content-between align-items-center mb-2">
                                            <div>
                                                <div className="fw-semibold">{item.name}</div>
                                                <small className="text-muted">
                                                    {item.quantity} × {formatPrice(item.price)}
                                                </small>
                                            </div>
                                            <div className="fw-bold">
                                                {formatPrice(item.price * item.quantity)}
                                            </div>
                                        </div>
                                    ))}
                                    <hr />
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h6 className="mb-0 fw-bold">Total:</h6>
                                        <h5 className="mb-0 fw-bold text-success">
                                            {formatPrice(getCartTotal())}
                                        </h5>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Details */}
                            <div className="col-md-6">
                                <h6 className="fw-bold mb-3">Delivery Details</h6>

                                <div className="mb-3">
                                    <label className="form-label-custom">Delivery Address *</label>
                                    <textarea
                                        className="form-control form-control-custom"
                                        name="deliveryAddress"
                                        rows="3"
                                        placeholder="Enter your complete delivery address"
                                        value={orderData.deliveryAddress}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label-custom">Phone Number *</label>
                                    <input
                                        type="tel"
                                        className="form-control form-control-custom"
                                        name="phone"
                                        placeholder="Enter your phone number"
                                        value={orderData.phone}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label-custom">Special Instructions</label>
                                    <textarea
                                        className="form-control form-control-custom"
                                        name="notes"
                                        rows="2"
                                        placeholder="Any special delivery instructions..."
                                        value={orderData.notes}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label-custom">Payment Method</label>
                                    <select
                                        className="form-select form-control-custom"
                                        name="paymentMethod"
                                        value={orderData.paymentMethod}
                                        onChange={handleInputChange}
                                    >
                                        <option value="cod">Cash on Delivery</option>
                                        <option value="online">Online Payment</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer border-0 pt-0">
                        <div className="w-100">
                            <div className="row g-2">
                                <div className="col-6">
                                    <button
                                        className="btn btn-outline-secondary w-100"
                                        onClick={onClose}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                                <div className="col-6">
                                    <button
                                        className="btn btn-primary-custom w-100 btn-animated"
                                        onClick={handlePlaceOrder}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Placing Order...
                                            </>
                                        ) : (
                                            `Place Order - ${formatPrice(getCartTotal())}`
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
