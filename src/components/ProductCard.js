import React, { useState } from 'react';

const ProductCard = ({ product, onAddToCart, onContactFarmer, showActions = true }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [imageError, setImageError] = useState(false);

    const getProductIcon = (productName) => {
        const name = productName.toLowerCase();
        if (name.includes('tomato')) return '🍅';
        if (name.includes('carrot')) return '🥕';
        if (name.includes('potato')) return '🥔';
        if (name.includes('onion')) return '🧅';
        if (name.includes('apple')) return '🍎';
        if (name.includes('banana')) return '🍌';
        if (name.includes('orange')) return '🍊';
        if (name.includes('lettuce') || name.includes('cabbage')) return '🥬';
        if (name.includes('corn')) return '🌽';
        if (name.includes('pepper')) return '🌶️';
        return '🥬';
    };

    const handleAddToCart = async () => {
        if (onAddToCart) {
            setIsLoading(true);
            try {
                await onAddToCart(product);
            } catch (error) {
                console.error('Error adding to cart:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleContactFarmer = () => {
        if (onContactFarmer) {
            onContactFarmer(product);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(price);
    };

    const formatDate = (date) => {
        if (!date) return '';
        const dateObj = date.toDate ? date.toDate() : new Date(date);
        return dateObj.toLocaleDateString('en-IN');
    };

    return (
        <div className="product-card enhanced-card h-100 fade-in">
            {/* Product Image */}
            <div className="product-image-container">
                {product.imageUrl && !imageError ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="product-image"
                        onError={() => setImageError(true)}
                        loading="lazy"
                    />
                ) : (
                    <div
                        className="d-flex align-items-center justify-content-center h-100 bg-pattern-2"
                        style={{ height: '220px' }}
                    >
                        <span style={{ fontSize: '4rem' }}>
                            {getProductIcon(product.name)}
                        </span>
                    </div>
                )}

                {/* Enhanced Badges */}
                <span className="badge badge-custom badge-fresh position-absolute top-0 end-0 m-3">
                    Fresh
                </span>
                {product.quantity > 0 ? (
                    <span className="badge badge-custom badge-available position-absolute top-0 start-0 m-3">
                        Available
                    </span>
                ) : (
                    <span className="badge badge-custom badge-out-of-stock position-absolute top-0 start-0 m-3">
                        Out of Stock
                    </span>
                )}
            </div>

            <div className="card-body p-4">
                {/* Product Name */}
                <h5 className="card-title fw-bold mb-3 text-truncate" title={product.name}>
                    {product.name}
                </h5>

                {/* Category */}
                {product.category && (
                    <span className="badge bg-light text-dark mb-3 text-capitalize"
                        style={{ borderRadius: '20px', padding: '6px 12px' }}>
                        {product.category}
                    </span>
                )}

                {/* Price */}
                <div className="d-flex align-items-baseline mb-3">
                    <span className="price-display mb-0">
                        {formatPrice(product.price)}
                    </span>
                    <span className="text-muted ms-2">per unit</span>
                </div>

                {/* Quantity */}
                <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <small className="text-muted">Available: </small>
                            <span className={`fw-semibold ${product.quantity < 10 ? 'text-warning' : 'text-success'}`}>
                                {product.quantity} units
                            </span>
                        </div>
                        {product.quantity < 10 && product.quantity > 0 && (
                            <span className="badge badge-custom badge-low-stock">
                                Low Stock
                            </span>
                        )}
                    </div>
                </div>

                {/* Description */}
                {product.description && (
                    <div className="mb-3">
                        <p className="text-muted small mb-0" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}>
                            {product.description}
                        </p>
                    </div>
                )}

                {/* Farmer Info */}
                <div className="farmer-info mb-3">
                    <div className="d-flex align-items-center">
                        <span className="me-2" style={{ fontSize: '1.5rem' }}>👨‍🌾</span>
                        <div>
                            <small className="text-muted d-block">Sold by</small>
                            <span className="fw-semibold small">
                                {product.farmerDisplayName || product.farmerName}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Date Added */}
                {product.createdAt && (
                    <div className="mb-3">
                        <small className="text-muted">
                            Listed on: {formatDate(product.createdAt)}
                        </small>
                    </div>
                )}

                {/* Action Buttons */}
                {showActions && (
                    <div className="d-grid gap-2">
                        <button
                            className={`btn btn-animated fw-semibold ${product.quantity > 0 ? 'btn-primary-custom' : 'btn-secondary'
                                }`}
                            onClick={handleAddToCart}
                            disabled={isLoading || product.quantity === 0}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <span className="me-2">🛒</span>
                                    {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                                </>
                            )}
                        </button>

                        <button
                            className="btn btn-animated btn-secondary-custom btn-sm"
                            onClick={handleContactFarmer}
                        >
                            <span className="me-2">📞</span>
                            Contact Farmer
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
