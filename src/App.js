import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import FarmerDashboard from "./components/FarmerDashboard";
import CustomerDashboard from "./components/CustomerDashboard";
import AuthPage from "./components/AuthPage";
import Navbar from "./components/Navbar";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import ProfilePage from "./components/ProfilePage";
import OrderHistory from "./components/OrderHistory";
import { CartProvider } from "./context/CartContext";
import './styles/custom.css';
import { addSampleUsers, addSampleProducts } from './utils/addSampleData';

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const fetchUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const profile = userDoc.data();
        setUserProfile(profile);
        setRole(profile.role);
        return profile;
      } else {
        if (user?.email.includes("farmer")) {
          setRole("farmer");
        } else {
          setRole("customer");
        }
        return null;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      if (user?.email.includes("farmer")) {
        setRole("farmer");
      } else {
        setRole("customer");
      }
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (u) {
        await fetchUserProfile(u.uid);
      } else {
        setRole("");
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCartClick = () => {
    setShowCart(true);
  };

  const handleProfileClick = () => {
    setShowProfile(true);
  };

  const handleOrderHistoryClick = () => {
    setShowOrderHistory(true);
  };

  const handleProfileUpdate = async () => {
    if (user) {
      await fetchUserProfile(user.uid);
    }
  };

  const handleOrderComplete = () => {
    setOrderSuccess(true);
    setTimeout(() => setOrderSuccess(false), 5000);
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 loading-container">
        <div className="text-center text-white fade-in">
          <div className="spinner-border mb-4" style={{ width: '4rem', height: '4rem' }}></div>
          <h2 className="fw-bold gradient-text mb-2">FarmConnect</h2>
          <p className="lead">Loading your marketplace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <CartProvider>
      <div className="min-vh-100 bg-pattern-1">
        {/* Enhanced Navbar */}
        <Navbar
          user={user}
          userProfile={userProfile}
          role={role}
          onCartClick={handleCartClick}
          onProfileClick={handleProfileClick}
          onOrderHistoryClick={handleOrderHistoryClick}
        />

        {/* Development Tools (Only for farmers) */}
        {user && role === "farmer" && (
          <div className="container mt-3">
            <div className="alert alert-warning">
              <h6>Development Tools</h6>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-warning btn-sm"
                  onClick={addSampleUsers}
                >
                  Add Sample Users
                </button>
                <button
                  className="btn btn-info btn-sm"
                  onClick={addSampleProducts}
                >
                  Add Sample Products
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Success Notification */}
        {orderSuccess && (
          <div className="container mt-3">
            <div className="alert alert-success d-flex align-items-center slide-up">
              <span className="me-2" style={{ fontSize: '1.5rem' }}>🎉</span>
              <div>
                <strong>Order placed successfully!</strong><br />
                <small>You will receive a confirmation email shortly.</small>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="fade-in">
          {role === "farmer" ? (
            <FarmerDashboard />
          ) : (
            <CustomerDashboard
              onCartClick={handleCartClick}
              orderSuccess={orderSuccess}
            />
          )}
        </main>

        {/* Profile Modal */}
        <ProfilePage
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          userProfile={userProfile}
          onProfileUpdate={handleProfileUpdate}
        />

        {/* Order History Modal (Only for customers) */}
        {role === "customer" && (
          <OrderHistory
            isOpen={showOrderHistory}
            onClose={() => setShowOrderHistory(false)}
          />
        )}

        {/* Cart Modal (Only for customers) */}
        {role === "customer" && (
          <Cart
            isOpen={showCart}
            onClose={() => setShowCart(false)}
            onCheckout={() => {
              setShowCart(false);
              setShowCheckout(true);
            }}
          />
        )}

        {/* Checkout Modal (Only for customers) */}
        {role === "customer" && (
          <Checkout
            isOpen={showCheckout}
            onClose={() => setShowCheckout(false)}
            onOrderComplete={handleOrderComplete}
          />
        )}
      </div>
    </CartProvider>
  );
}

export default App;
