import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { uploadImageToCloudinary, validateImageFile } from "../utils/cloudinary";

export default function FarmerDashboard() {
    const [activeTab, setActiveTab] = useState('products'); // 'products' or 'add'
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState({
        name: "",
        price: "",
        quantity: "",
        description: "",
        category: "vegetables"
    });
    const [isLoading, setIsLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState("");
    const [editingProduct, setEditingProduct] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    // Fetch farmer's products
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        if (!auth.currentUser) return;

        setLoading(true);
        try {
            const q = query(
                collection(db, "products"),
                where("farmerId", "==", auth.currentUser.uid)
            );
            const querySnapshot = await getDocs(q);
            const productsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProducts(productsData);
        } catch (error) {
            console.error("Error fetching products:", error);
            setError("Failed to fetch products");
        } finally {
            setLoading(false);
        }
    };

    // Handle image selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setError("");

        if (file) {
            const validation = validateImageFile(file);
            if (!validation.isValid) {
                setError(validation.error);
                return;
            }

            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Add new product
    const handleAdd = async () => {
        if (!product.name || !product.price || !product.quantity) {
            setError("Please fill in all required fields");
            return;
        }

        if (!imageFile && !editingProduct) {
            setError("Please select a product image");
            return;
        }

        setIsLoading(true);
        setError("");
        setUploadProgress(0);

        try {
            let imageUrl = editingProduct?.imageUrl || "";

            // Upload new image if selected
            if (imageFile) {
                setUploadProgress(30);
                const uploadResult = await uploadImageToCloudinary(imageFile);

                if (!uploadResult.success) {
                    throw new Error(uploadResult.error);
                }
                imageUrl = uploadResult.url;
            }

            setUploadProgress(70);

            const productData = {
                ...product,
                price: parseFloat(product.price),
                quantity: parseInt(product.quantity),
                imageUrl: imageUrl,
                farmerId: auth.currentUser.uid,
                farmerName: auth.currentUser.email,
                isAvailable: true,
                updatedAt: new Date()
            };

            if (editingProduct) {
                // Update existing product
                await updateDoc(doc(db, "products", editingProduct.id), productData);
                alert("Product updated successfully!");
            } else {
                // Add new product
                await addDoc(collection(db, "products"), {
                    ...productData,
                    createdAt: new Date()
                });
                alert("Product added successfully!");
            }

            setUploadProgress(100);

            // Reset form
            resetForm();
            fetchProducts();
            setActiveTab('products');
        } catch (error) {
            console.error("Error saving product:", error);
            setError("Error saving product: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Edit product
    const handleEdit = (productToEdit) => {
        setEditingProduct(productToEdit);
        setProduct({
            name: productToEdit.name,
            price: productToEdit.price.toString(),
            quantity: productToEdit.quantity.toString(),
            description: productToEdit.description || "",
            category: productToEdit.category || "vegetables"
        });
        setImagePreview(productToEdit.imageUrl || "");
        setActiveTab('add');
    };

    // Delete product
    const handleDelete = async () => {
        if (!productToDelete) return;

        try {
            await deleteDoc(doc(db, "products", productToDelete.id));
            alert("Product deleted successfully!");
            fetchProducts();
            setShowDeleteModal(false);
            setProductToDelete(null);
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Error deleting product: " + error.message);
        }
    };

    // Reset form
    const resetForm = () => {
        setProduct({
            name: "",
            price: "",
            quantity: "",
            description: "",
            category: "vegetables"
        });
        setImageFile(null);
        setImagePreview("");
        setUploadProgress(0);
        setEditingProduct(null);
        setError("");
    };

    // Toggle product availability
    const toggleAvailability = async (productId, currentStatus) => {
        try {
            await updateDoc(doc(db, "products", productId), {
                isAvailable: !currentStatus,
                updatedAt: new Date()
            });
            fetchProducts();
        } catch (error) {
            console.error("Error updating availability:", error);
            alert("Error updating product availability");
        }
    };

    return (
        <div className="min-vh-100 bg-pattern-1">
            <div className="container py-5">
                {/* Header */}
                <div className="text-center mb-5 fade-in">
                    <h1 className="display-4 fw-bold gradient-text mb-3">Farmer Dashboard</h1>
                    <p className="lead text-muted">Manage your products and grow your business</p>
                </div>

                {/* Navigation Tabs */}
                <div className="row justify-content-center mb-4">
                    <div className="col-md-6">
                        <div className="enhanced-card p-2">
                            <div className="row g-2">
                                <div className="col-6">
                                    <button
                                        className={`btn w-100 btn-animated ${activeTab === 'products' ? 'btn-primary-custom' : 'btn-outline-primary'}`}
                                        onClick={() => setActiveTab('products')}
                                    >
                                        <span className="me-2">📦</span>
                                        My Products ({products.length})
                                    </button>
                                </div>
                                <div className="col-6">
                                    <button
                                        className={`btn w-100 btn-animated ${activeTab === 'add' ? 'btn-primary-custom' : 'btn-outline-primary'}`}
                                        onClick={() => {
                                            setActiveTab('add');
                                            resetForm();
                                        }}
                                    >
                                        <span className="me-2">➕</span>
                                        {editingProduct ? 'Edit Product' : 'Add Product'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products List Tab */}
                {activeTab === 'products' && (
                    <div className="fade-in">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
                                <h4 className="text-muted">Loading your products...</h4>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="enhanced-card text-center py-5">
                                <div className="mb-4" style={{ fontSize: '4rem' }}>📦</div>
                                <h3 className="text-muted mb-3">No products yet</h3>
                                <p className="text-muted mb-4">Start by adding your first product to the marketplace</p>
                                <button
                                    className="btn btn-primary-custom btn-animated"
                                    onClick={() => setActiveTab('add')}
                                >
                                    <span className="me-2">➕</span>
                                    Add Your First Product
                                </button>
                            </div>
                        ) : (
                            <div className="row g-4">
                                {products.map((prod) => (
                                    <div key={prod.id} className="col-lg-4 col-md-6">
                                        <div className="enhanced-card product-card h-100">
                                            {/* Product Image */}
                                            <div className="product-image-container">
                                                {prod.imageUrl ? (
                                                    <img
                                                        src={prod.imageUrl}
                                                        alt={prod.name}
                                                        className="product-image"
                                                    />
                                                ) : (
                                                    <div className="d-flex align-items-center justify-content-center h-100 bg-pattern-2">
                                                        <span style={{ fontSize: '4rem' }}>📦</span>
                                                    </div>
                                                )}

                                                {/* Status Badge */}
                                                <span className={`badge badge-custom position-absolute top-0 end-0 m-3 ${prod.isAvailable ? 'badge-available' : 'badge-out-of-stock'
                                                    }`}>
                                                    {prod.isAvailable ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>

                                            <div className="card-body p-4">
                                                {/* Product Name */}
                                                <h5 className="card-title fw-bold mb-2">{prod.name}</h5>

                                                {/* Category */}
                                                <span className="badge bg-light text-dark mb-3 text-capitalize">
                                                    {prod.category}
                                                </span>

                                                {/* Price and Quantity */}
                                                <div className="row mb-3">
                                                    <div className="col-6">
                                                        <small className="text-muted d-block">Price</small>
                                                        <span className="fw-bold text-success">₹{prod.price}</span>
                                                    </div>
                                                    <div className="col-6">
                                                        <small className="text-muted d-block">Stock</small>
                                                        <span className={`fw-bold ${prod.quantity < 10 ? 'text-warning' : 'text-success'}`}>
                                                            {prod.quantity} units
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                {prod.description && (
                                                    <p className="text-muted small mb-3" style={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}>
                                                        {prod.description}
                                                    </p>
                                                )}

                                                {/* Action Buttons */}
                                                <div className="d-grid gap-2">
                                                    <div className="row g-2">
                                                        <div className="col-6">
                                                            <button
                                                                className="btn btn-secondary-custom btn-sm w-100"
                                                                onClick={() => handleEdit(prod)}
                                                            >
                                                                <span className="me-1">✏️</span>
                                                                Edit
                                                            </button>
                                                        </div>
                                                        <div className="col-6">
                                                            <button
                                                                className="btn btn-outline-danger btn-sm w-100"
                                                                onClick={() => {
                                                                    setProductToDelete(prod);
                                                                    setShowDeleteModal(true);
                                                                }}
                                                            >
                                                                <span className="me-1">🗑️</span>
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <button
                                                        className={`btn btn-animated ${prod.isAvailable ? 'btn-outline-warning' : 'btn-outline-success'
                                                            }`}
                                                        onClick={() => toggleAvailability(prod.id, prod.isAvailable)}
                                                    >
                                                        <span className="me-2">
                                                            {prod.isAvailable ? '⏸️' : '▶️'}
                                                        </span>
                                                        {prod.isAvailable ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                </div>

                                                {/* Created Date */}
                                                <div className="mt-3 pt-3 border-top">
                                                    <small className="text-muted">
                                                        Added: {prod.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Add/Edit Product Tab */}
                {activeTab === 'add' && (
                    <div className="row justify-content-center fade-in">
                        <div className="col-md-8 col-lg-6">
                            <div className="enhanced-card">
                                <div className="text-white text-center py-4"
                                    style={{
                                        background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                                        borderRadius: '20px 20px 0 0'
                                    }}>
                                    <h2 className="mb-2 fw-bold">
                                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                                    </h2>
                                    <p className="mb-0 opacity-75">
                                        {editingProduct ? 'Update your product details' : 'List your fresh produce for customers'}
                                    </p>
                                </div>

                                <div className="p-4">
                                    {/* Error Alert */}
                                    {error && (
                                        <div className="alert alert-danger d-flex align-items-center mb-4">
                                            <span className="me-2">⚠️</span>
                                            {error}
                                        </div>
                                    )}

                                    <form onSubmit={(e) => { e.preventDefault(); handleAdd(); }}>
                                        {/* Product Image Upload */}
                                        <div className="mb-4">
                                            <label htmlFor="productImage" className="form-label-custom">
                                                Product Image {!editingProduct && '*'}
                                            </label>
                                            <input
                                                id="productImage"
                                                type="file"
                                                className="form-control form-control-custom"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                required={!editingProduct}
                                            />
                                            <small className="text-muted">
                                                Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)
                                            </small>

                                            {/* Image Preview */}
                                            {imagePreview && (
                                                <div className="mt-3">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="img-thumbnail"
                                                        style={{ maxHeight: '200px', maxWidth: '100%' }}
                                                    />
                                                </div>
                                            )}

                                            {/* Upload Progress */}
                                            {uploadProgress > 0 && uploadProgress < 100 && (
                                                <div className="mt-3">
                                                    <div className="progress">
                                                        <div
                                                            className="progress-bar progress-bar-striped progress-bar-animated"
                                                            style={{ width: `${uploadProgress}%` }}
                                                        >
                                                            {uploadProgress}%
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Name */}
                                        <div className="mb-4">
                                            <label htmlFor="productName" className="form-label-custom">
                                                Product Name *
                                            </label>
                                            <input
                                                id="productName"
                                                type="text"
                                                className="form-control form-control-custom"
                                                placeholder="e.g., Fresh Tomatoes"
                                                value={product.name}
                                                onChange={e => setProduct({ ...product, name: e.target.value })}
                                                required
                                            />
                                        </div>

                                        {/* Category */}
                                        <div className="mb-4">
                                            <label htmlFor="productCategory" className="form-label-custom">
                                                Category
                                            </label>
                                            <select
                                                id="productCategory"
                                                className="form-select form-control-custom"
                                                value={product.category}
                                                onChange={e => setProduct({ ...product, category: e.target.value })}
                                            >
                                                <option value="vegetables">Vegetables</option>
                                                <option value="fruits">Fruits</option>
                                                <option value="grains">Grains</option>
                                                <option value="herbs">Herbs</option>
                                                <option value="dairy">Dairy</option>
                                            </select>
                                        </div>

                                        {/* Description */}
                                        <div className="mb-4">
                                            <label htmlFor="productDescription" className="form-label-custom">
                                                Description
                                            </label>
                                            <textarea
                                                id="productDescription"
                                                className="form-control form-control-custom"
                                                rows="3"
                                                placeholder="Describe your product..."
                                                value={product.description}
                                                onChange={e => setProduct({ ...product, description: e.target.value })}
                                            />
                                        </div>

                                        {/* Price and Quantity */}
                                        <div className="row mb-4">
                                            <div className="col-md-6">
                                                <label htmlFor="productPrice" className="form-label-custom">
                                                    Price per unit (₹) *
                                                </label>
                                                <input
                                                    id="productPrice"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    className="form-control form-control-custom"
                                                    placeholder="0.00"
                                                    value={product.price}
                                                    onChange={e => setProduct({ ...product, price: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="productQuantity" className="form-label-custom">
                                                    Quantity Available *
                                                </label>
                                                <input
                                                    id="productQuantity"
                                                    type="number"
                                                    min="1"
                                                    className="form-control form-control-custom"
                                                    placeholder="e.g., 50"
                                                    value={product.quantity}
                                                    onChange={e => setProduct({ ...product, quantity: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Submit Buttons */}
                                        <div className="row g-2">
                                            <div className="col-md-6">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary w-100 btn-animated"
                                                    onClick={() => {
                                                        resetForm();
                                                        setActiveTab('products');
                                                    }}
                                                    disabled={isLoading}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                            <div className="col-md-6">
                                                <button
                                                    type="submit"
                                                    className={`btn btn-primary-custom w-100 btn-animated ${isLoading ? 'disabled' : ''}`}
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                            {uploadProgress < 30 ? 'Uploading...' :
                                                                uploadProgress < 70 ? 'Saving...' : 'Almost Done...'}
                                                        </>
                                                    ) : (
                                                        editingProduct ? 'Update Product' : 'Add Product'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="enhanced-card modal-content border-0">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Confirm Delete</h5>
                            </div>
                            <div className="modal-body">
                                <p className="mb-3">Are you sure you want to delete this product?</p>
                                <div className="alert alert-warning">
                                    <strong>{productToDelete?.name}</strong><br />
                                    <small>This action cannot be undone.</small>
                                </div>
                            </div>
                            <div className="modal-footer border-0 pt-0">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-animated"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setProductToDelete(null);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger btn-animated"
                                    onClick={handleDelete}
                                >
                                    Delete Product
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
