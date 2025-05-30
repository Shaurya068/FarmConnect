import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';

const OrderHistory = ({ isOpen, onClose }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        if (isOpen && auth.currentUser) {
            fetchOrders();
        }
    }, [isOpen]);

    const fetchOrders = async () => {
        setLoading(true);
        setError('');

        try {
            const q = query(
                collection(db, 'orders'),
                where('customerId', '==', auth.currentUser.uid),
                orderBy('orderDate', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const ordersData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setOrders(ordersData);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Failed to load order history');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(price);
    };

    const formatDate = (date) => {
        if (!date) return 'Unknown';
        const dateObj = date.toDate ? date.toDate() : new Date(date);
        return dateObj.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { class: 'bg-warning', icon: '⏳', text: 'Pending' },
            confirmed: { class: 'bg-info', icon: '✅', text: 'Confirmed' },
            delivered: { class: 'bg-success', icon: '📦', text: 'Delivered' },
            cancelled: { class: 'bg-danger', icon: '❌', text: 'Cancelled' }
        };

        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`badge ${config.class} d-flex align-items-center`}>
                <span className="me-1">{config.icon}</span>
                {config.text}
            </span>
        );
    };

    const getPaymentStatusBadge = (status) => {
        const statusConfig = {
            pending: { class: 'bg-warning', text: 'Pending' },
            completed: { class: 'bg-success', text: 'Paid' },
            failed: { class: 'bg-danger', text: 'Failed' }
        };

        const config = statusConfig[status] || statusConfig.pending;
        return <span className={`badge ${config.class}`}>{config.text}</span>;
    };

    if (!isOpen) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-xl">
                <div className="enhanced-card modal-content border-0">
                    {/* Header */}
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold d-flex align-items-center">
                            <span className="me-2" style={{ fontSize: '1.5rem' }}>📋</span>
                            Order History
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                        ></button>
                    </div>

                    {/* Body */}
                    <div className="modal-body">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
                                <h4 className="text-muted">Loading your orders...</h4>
                            </div>
                        ) : error ? (
                            <div className="alert alert-danger d-flex align-items-center">
                                <span className="me-2">⚠️</span>
                                {error}
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-5">
                                <div className="mb-4" style={{ fontSize: '4rem' }}>📦</div>
                                <h3 className="text-muted mb-3">No orders yet</h3>
                                <p className="text-muted">Start shopping to see your order history here!</p>
                            </div>
                        ) : (
                            <div className="row">
                                {/* Orders List */}
                                <div className={selectedOrder ? 'col-md-6' : 'col-12'}>
                                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                        {orders.map((order) => (
                                            <div
                                                key={order.id}
                                                className={`card mb-3 hover-lift ${selectedOrder?.id === order.id ? 'border-primary' : ''}`}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <div className="card-body">
                                                    <div className="row align-items-center">
                                                        <div className="col-md-8">
                                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                                <h6 className="fw-bold mb-0">
                                                                    Order #{order.id.slice(-8).toUpperCase()}
                                                                </h6>
                                                                {getStatusBadge(order.status)}
                                                            </div>

                                                            <div className="mb-2">
                                                                <small className="text-muted">
                                                                    📅 {formatDate(order.orderDate)}
                                                                </small>
                                                            </div>

                                                            <div className="mb-2">
                                                                <small className="text-muted">
                                                                    👨‍🌾 {order.farmerName}
                                                                </small>
                                                            </div>

                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <span className="fw-bold text-success">
                                                                    {formatPrice(order.totalAmount)}
                                                                </span>
                                                                {getPaymentStatusBadge(order.paymentStatus)}
                                                            </div>
                                                        </div>

                                                        <div className="col-md-4 text-end">
                                                            <div className="mb-2">
                                                                <small className="text-muted">
                                                                    {order.items?.length || 0} item(s)
                                                                </small>
                                                            </div>
                                                            <button className="btn btn-outline-primary btn-sm">
                                                                View Details
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Details */}
                                {selectedOrder && (
                                    <div className="col-md-6">
                                        <div className="card border-primary">
                                            <div className="card-header bg-primary text-white">
                                                <h6 className="mb-0 fw-bold">
                                                    Order Details - #{selectedOrder.id.slice(-8).toUpperCase()}
                                                </h6>
                                            </div>
                                            <div className="card-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                                {/* Order Status */}
                                                <div className="mb-4">
                                                    <div className="row">
                                                        <div className="col-6">
                                                            <small className="text-muted d-block">Status</small>
                                                            {getStatusBadge(selectedOrder.status)}
                                                        </div>
                                                        <div className="col-6">
                                                            <small className="text-muted d-block">Payment</small>
                                                            {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Order Items */}
                                                <div className="mb-4">
                                                    <h6 className="fw-bold mb-3">Items Ordered</h6>
                                                    {selectedOrder.items?.map((item, index) => (
                                                        <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                                                            <div>
                                                                <div className="fw-semibold">{item.productName}</div>
                                                                <small className="text-muted">
                                                                    {item.quantity} × {formatPrice(item.pricePerUnit)}
                                                                </small>
                                                            </div>
                                                            <div className="fw-bold">
                                                                {formatPrice(item.totalPrice)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <hr />
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <h6 className="mb-0 fw-bold">Total</h6>
                                                        <h5 className="mb-0 fw-bold text-success">
                                                            {formatPrice(selectedOrder.totalAmount)}
                                                        </h5>
                                                    </div>
                                                </div>

                                                {/* Delivery Information */}
                                                <div className="mb-4">
                                                    <h6 className="fw-bold mb-3">Delivery Information</h6>
                                                    <div className="bg-light p-3 rounded">
                                                        <div className="mb-2">
                                                            <small className="text-muted d-block">Address</small>
                                                            <span>{selectedOrder.deliveryAddress}</span>
                                                        </div>
                                                        <div className="mb-2">
                                                            <small className="text-muted d-block">Phone</small>
                                                            <span>{selectedOrder.phone}</span>
                                                        </div>
                                                        {selectedOrder.estimatedDelivery && (
                                                            <div className="mb-2">
                                                                <small className="text-muted d-block">Estimated Delivery</small>
                                                                <span>{formatDate(selectedOrder.estimatedDelivery)}</span>
                                                            </div>
                                                        )}
                                                        {selectedOrder.notes && (
                                                            <div>
                                                                <small className="text-muted d-block">Notes</small>
                                                                <span>{selectedOrder.notes}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Farmer Information */}
                                                <div className="mb-4">
                                                    <h6 className="fw-bold mb-3">Farmer Information</h6>
                                                    <div className="d-flex align-items-center p-3 bg-light rounded">
                                                        <span className="me-3" style={{ fontSize: '2rem' }}>👨‍🌾</span>
                                                        <div>
                                                            <div className="fw-semibold">{selectedOrder.farmerName}</div>
                                                            <small className="text-muted">Farmer</small>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Payment Information */}
                                                <div className="mb-4">
                                                    <h6 className="fw-bold mb-3">Payment Information</h6>
                                                    <div className="bg-light p-3 rounded">
                                                        <div className="mb-2">
                                                            <small className="text-muted d-block">Payment Method</small>
                                                            <span className="text-capitalize">
                                                                {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <small className="text-muted d-block">Order Date</small>
                                                            <span>{formatDate(selectedOrder.orderDate)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {orders.length > 0 && (
                        <div className="modal-footer border-0 pt-0">
                            <div className="w-100 text-center">
                                <small className="text-muted">
                                    Showing {orders.length} order(s) • Click on any order to view details
                                </small>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderHistory;
