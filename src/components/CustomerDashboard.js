import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import ProductCard from "./ProductCard";
import { useCart } from "../context/CartContext";

export default function CustomerDashboard({ onCartClick, orderSuccess }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "products"));
                setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.farmerName && product.farmerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.farmerDisplayName && product.farmerDisplayName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleAddToCart = async (product) => {
        const cartItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            farmerId: product.farmerId,
            farmerName: product.farmerName,
            availableQuantity: product.quantity
        };

        addToCart(cartItem);

        // Show success message
        const toast = document.createElement('div');
        toast.className = 'alert alert-success position-fixed';
        toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        toast.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="me-2">✅</span>
                <div>
                    <strong>${product.name}</strong> added to cart!
                </div>
            </div>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            document.body.removeChild(toast);
        }, 3000);
    };

    const handleContactFarmer = (product) => {
        alert(`Contact farmer: ${product.farmerName}\nEmail: ${product.farmerEmail || 'Not available'}`);
    };

    return (
        <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)' }}>
            <div className="container py-5">
                {/* Header Section */}
                <div className="text-center text-white mb-5">
                    <h1 className="display-4 fw-bold mb-3">Fresh Produce Marketplace</h1>
                    <p className="lead mb-4">Discover fresh, local products from farmers near you</p>

                    {/* Search Bar */}
                    <div className="row justify-content-center">
                        <div className="col-md-6">
                            <div className="search-container">
                                <input
                                    type="text"
                                    className="form-control search-input"
                                    placeholder="Search products or farmers..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <span className="search-icon">🔍</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Section */}
                <div className="card shadow-lg border-0">
                    <div className="card-header bg-white py-4">
                        <div className="d-flex justify-content-between align-items-center flex-wrap">
                            <h2 className="mb-0 fw-bold text-dark">Available Products</h2>
                            <div className="d-flex align-items-center gap-3">
                                <span className="badge bg-primary fs-6 px-3 py-2">
                                    {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="card-body p-4">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
                                <h4 className="text-muted">Loading fresh products...</h4>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-5">
                                <div className="mb-3" style={{ fontSize: '4rem' }}>🥕</div>
                                <h3 className="text-muted">No products found</h3>
                                <p className="text-muted">Try adjusting your search or check back later for new listings!</p>
                            </div>
                        ) : (
                            <div className="row g-4">
                                {filteredProducts.map((product) => (
                                    <div key={product.id} className="col-lg-4 col-md-6">
                                        <ProductCard
                                            product={product}
                                            onAddToCart={handleAddToCart}
                                            onContactFarmer={handleContactFarmer}
                                            showActions={true}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
