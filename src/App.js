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
import { CartProvider } from "./context/CartContext";
import './styles/custom.css';

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (u) {
        try {
          const userDoc = await getDoc(doc(db, "users", u.uid));
          if (userDoc.exists()) {
            const profile = userDoc.data();
            setUserProfile(profile);
            setRole(profile.role);
          } else {
            if (u.email.includes("farmer")) {
              setRole("farmer");
            } else {
              setRole("customer");
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          if (u.email.includes("farmer")) {
            setRole("farmer");
          } else {
            setRole("customer");
          }
        }
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
    // Handle profile click - could open profile modal or navigate to profile page
    alert("Profile management coming soon!");
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
        />

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
