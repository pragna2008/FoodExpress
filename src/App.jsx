import React, { useEffect, useMemo, useState } from "react";
import {
  Utensils, Search, ShoppingBag, User, LogOut, Menu as MenuIcon,
  Plus, Minus, Trash2, Package, LayoutDashboard, ChefHat, Clock,
  CheckCircle, X, ArrowRight, ShieldCheck, Truck
} from "lucide-react";

const INITIAL_FOODS = [
  { id: 1, name: "Chicken Biryani", category: "Biryani", price: 220, rating: 4.8, description: "Aromatic basmati rice with tender chicken and traditional spices.", image: "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=700" },
  { id: 2, name: "Margherita Pizza", category: "Pizza", price: 249, rating: 4.7, description: "Classic cheese pizza with fresh basil and tomato.", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700" },
  { id: 3, name: "Classic Burger", category: "Burgers", price: 149, rating: 4.6, description: "Juicy veggie patty, lettuce, cheese and house sauce.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700" },
  { id: 4, name: "Creamy Pasta", category: "Pasta", price: 189, rating: 4.5, description: "Creamy white sauce pasta tossed with herbs.", image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=700" },
  { id: 5, name: "Paneer Biryani", category: "Biryani", price: 199, rating: 4.7, description: "Fragrant basmati rice layered with spicy paneer.", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=700" },
  { id: 6, name: "Farmhouse Pizza", category: "Pizza", price: 299, rating: 4.8, description: "Loaded with capsicum, onion, tomato and cheese.", image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=700" },
  { id: 7, name: "Chocolate Cake", category: "Desserts", price: 129, rating: 4.9, description: "Rich chocolate cake for your sweet cravings.", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=700" },
  { id: 8, name: "Cold Coffee", category: "Drinks", price: 99, rating: 4.4, description: "Chilled creamy coffee topped with a little foam.", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=700" }
];
const CATEGORIES = ["All", "Biryani", "Pizza", "Burgers", "Pasta", "Desserts", "Drinks"];
const money = n => `₹${Number(n).toFixed(0)}`;
const read = (key, fallback) => {
  try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; }
  catch { return fallback; }
};

export default function App() {
  const [foods, setFoods] = useState(() => read("fe_foods", INITIAL_FOODS));
  const [users, setUsers] = useState(() => read("fe_users", []));
  const [orders, setOrders] = useState(() => read("fe_orders", []));
  const [currentUser, setCurrentUser] = useState(() => read("fe_session", null));
  const [page, setPage] = useState("home");
  const [authMode, setAuthMode] = useState("login");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState({});
  const [notice, setNotice] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [foodForm, setFoodForm] = useState({ name: "", category: "Biryani", price: "", description: "", image: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => localStorage.setItem("fe_foods", JSON.stringify(foods)), [foods]);
  useEffect(() => localStorage.setItem("fe_users", JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem("fe_orders", JSON.stringify(orders)), [orders]);
  useEffect(() => {
    if (currentUser) localStorage.setItem("fe_session", JSON.stringify(currentUser));
    else localStorage.removeItem("fe_session");
  }, [currentUser]);

  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const food = foods.find(f => f.id === Number(id));
    return food ? { ...food, qty } : null;
  }).filter(Boolean);
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const visibleFoods = useMemo(() => foods.filter(food =>
    (category === "All" || food.category === category) &&
    `${food.name} ${food.category}`.toLowerCase().includes(search.toLowerCase())
  ), [foods, category, search]);

  const flash = message => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  };
  const go = target => { setPage(target); setMobileOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const addToCart = id => {
    if (!currentUser) { setAuthMode("login"); go("auth"); flash("Please login to add food to your cart."); return; }
    if (currentUser.role === "admin") { flash("Please use a customer account to place orders."); return; }
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    flash("Added to your cart!");
  };
  const changeQty = (id, amount) => setCart(prev => {
    const next = { ...prev, [id]: (prev[id] || 0) + amount };
    if (next[id] <= 0) delete next[id];
    return next;
  });

  const handleAuth = event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim().toLowerCase();
    const password = String(data.get("password") || "");
    if (authMode === "signup") {
      if (users.some(user => user.email === email) || email === "admin@foodexpress.com") { flash("An account with this email already exists."); return; }
      const user = { id: Date.now(), name, email, password, role: "user" };
      const nextUsers = [...users, user];
      setUsers(nextUsers); setCurrentUser(user); go("home"); flash("Account created successfully!");
    } else {
      if (email === "admin@foodexpress.com" && password === "admin123") {
        setCurrentUser({ name: "Administrator", email, role: "admin" }); go("admin"); flash("Welcome, Admin!"); return;
      }
      const user = users.find(item => item.email === email && item.password === password);
      if (!user) { flash("Invalid email or password. Please try again."); return; }
      setCurrentUser(user); go("home"); flash(`Welcome back, ${user.name}!`);
    }
  };

  const placeOrder = () => {
    if (!cartItems.length) return;
    const order = {
      id: `FE${Date.now().toString().slice(-7)}`,
      userId: currentUser.id, customer: currentUser.name, email: currentUser.email,
      items: cartItems.map(({ id, name, price, qty }) => ({ id, name, price, qty })),
      total, status: "Order Received", date: new Date().toLocaleString()
    };
    setOrders(prev => [order, ...prev]); setCart({}); go("orders"); flash("Your order has been placed!");
  };
  const saveFood = event => {
    event.preventDefault();
    const item = { ...foodForm, price: Number(foodForm.price), rating: 4.5, id: editingId || Date.now(), image: foodForm.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700" };
    if (!item.name || !item.price || item.price <= 0) { flash("Enter a valid food name and price."); return; }
    setFoods(prev => editingId ? prev.map(food => food.id === editingId ? item : food) : [item, ...prev]);
    setFoodForm({ name: "", category: "Biryani", price: "", description: "", image: "" });
    setEditingId(null); flash(editingId ? "Food item updated." : "Food item added.");
  };
  const editFood = food => { setFoodForm({ name: food.name, category: food.category, price: food.price, description: food.description, image: food.image }); setEditingId(food.id); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const updateStatus = (id, status) => { setOrders(prev => prev.map(order => order.id === id ? { ...order, status } : order)); flash("Order status updated."); };
  const logout = () => { setCurrentUser(null); setCart({}); go("home"); flash("You have been logged out."); };

  const Header = () => <header className="header">
    <button className="brand" onClick={() => go("home")}><span className="brand-icon"><Utensils size={21}/></span>Food<span>Express</span></button>
    <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu"><MenuIcon/></button>
    <nav className={mobileOpen ? "nav open" : "nav"}>
      <button className={page === "home" ? "nav-link active" : "nav-link"} onClick={() => go("home")}>Home</button>
      <button className="nav-link" onClick={() => { go("home"); setTimeout(() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" }), 100); }}>Menu</button>
      {currentUser && currentUser.role === "user" && <button className="nav-link" onClick={() => go("orders")}>My Orders</button>}
      {currentUser?.role === "admin" && <button className="nav-link" onClick={() => go("admin")}>Admin Panel</button>}
    </nav>
    <div className="header-actions">
      {currentUser?.role !== "admin" && <button className="cart-button" onClick={() => go("cart")}><ShoppingBag size={17}/> Cart <b>{cartCount}</b></button>}
      {currentUser ? <div className="account"><span className="avatar"><User size={16}/></span><span className="account-name">{currentUser.name}</span><button className="icon-button" title="Logout" onClick={logout}><LogOut size={17}/></button></div>
        : <><button className="login-button" onClick={() => { setAuthMode("login"); go("auth"); }}>Log in</button><button className="signup-button" onClick={() => { setAuthMode("signup"); go("auth"); }}>Sign up</button></>}
    </div>
  </header>;

  const Footer = () => <footer className="footer"><div className="footer-main"><div><div className="brand footer-brand"><span className="brand-icon"><Utensils size={20}/></span>Food<span>Express</span></div><p>Good food, good mood. Your favourite meals delivered fresh to your doorstep.</p></div><div><h4>Explore</h4><button onClick={() => go("home")}>Home</button><button onClick={() => go("home")}>Our menu</button><button onClick={() => go("orders")}>Track order</button></div><div><h4>Contact</h4><p>support@foodexpress.com</p><p>Mon–Sun · 9 AM–10 PM</p></div></div><div className="footer-bottom">© 2026 FoodExpress. Made with ♥ for food lovers.</div></footer>;

  return <div className="app-shell">
    <Header/>
    {notice && <div className="toast"><CheckCircle size={17}/>{notice}<button onClick={() => setNotice("")}><X size={15}/></button></div>}

    {page === "home" && <>
      <main>
        <section className="hero">
          <div className="hero-overlay"></div>
          <div className="hero-content"><span className="eyebrow"><span className="eyebrow-dot"></span> FRESH • FAST • DELICIOUS</span><h1>Your cravings,<br/><em>delivered.</em></h1><p>Discover the best food from your favourite local restaurants. Freshly prepared and delivered right to your door.</p><button className="primary-button hero-button" onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}>Explore menu <ArrowRight size={18}/></button><div className="hero-stats"><div><b>30 min</b><small>Average delivery</small></div><div><b>4.8 ★</b><small>Customer rating</small></div><div><b>100%</b><small>Fresh & tasty</small></div></div></div>
          <div className="hero-badge"><span>🍕</span><div><b>Hungry?</b><small>We've got you.</small></div></div>
        </section>

        <section className="benefits"><div><span className="benefit-icon">🚀</span><div><b>Quick delivery</b><small>At your doorstep in no time</small></div></div><div><span className="benefit-icon">🥬</span><div><b>Fresh ingredients</b><small>Quality you can taste</small></div></div><div><span className="benefit-icon">💳</span><div><b>Easy ordering</b><small>Simple and secure checkout</small></div></div></section>

        <section className="section menu-section" id="menu">
          <div className="section-heading"><div><span className="eyebrow orange">WHAT ARE YOU CRAVING?</span><h2>Explore our menu</h2><p>Find something delicious for every mood.</p></div><div className="search-box"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search dishes..."/>{search && <button onClick={() => setSearch("")}>×</button>}</div></div>
          <div className="categories">{CATEGORIES.map((item, index) => <button key={item} className={category === item ? "category active" : "category"} onClick={() => setCategory(item)}><span>{["🍽️","🍛","🍕","🍔","🍝","🍰","🥤"][index]}</span>{item}</button>)}</div>
          <div className="food-grid">{visibleFoods.map(food => <article className="food-card" key={food.id}><div className="food-image-wrap"><img src={food.image} alt={food.name} onError={e => { e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700"; }}/><span className="food-rating">★ {food.rating}</span></div><div className="food-info"><div className="food-title-row"><h3>{food.name}</h3><b>{money(food.price)}</b></div><span className="food-category">{food.category}</span><p>{food.description}</p><button className="add-button" onClick={() => addToCart(food.id)}><Plus size={16}/> Add to cart</button></div></article>)}</div>
          {visibleFoods.length === 0 && <div className="empty-state"><span>🍽️</span><h3>No dishes found</h3><p>Try another search or category.</p><button className="text-button" onClick={() => { setSearch(""); setCategory("All"); }}>Clear filters</button></div>}
        </section>
        <section className="promo"><div><span className="eyebrow">GOOD FOOD IS ALWAYS A GOOD IDEA</span><h2>Make today a little<br/>more delicious.</h2><p>Your next favourite meal is just a few clicks away.</p><button className="primary-button" onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}>Order something tasty <ArrowRight size={17}/></button></div><div className="promo-emoji">🍜</div></section>
      </main><Footer/>
    </>}

    {page === "auth" && <main className="auth-page"><div className="auth-visual"><span className="eyebrow">WELCOME TO FOODEXPRESS</span><h1>Great food.<br/><em>Great moments.</em></h1><p>Discover delicious meals from local favourites and get them delivered fresh.</p><div className="auth-food">🍔 🍕 🍜</div></div><div className="auth-card"><div className="auth-card-icon"><Utensils/></div><h2>{authMode === "login" ? "Welcome back!" : "Create your account"}</h2><p>{authMode === "login" ? "Enter your details to continue." : "Sign up and find your new favourite meal."}</p><form onSubmit={handleAuth}>{authMode === "signup" && <label>Full name<input name="name" placeholder="Your name" required minLength="2"/></label>}<label>Email address<input name="email" type="email" placeholder="you@example.com" required/></label><label>Password<input name="password" type="password" placeholder="Enter password" required minLength="6"/></label><button className="primary-button auth-submit" type="submit">{authMode === "login" ? "Log in" : "Create account"} <ArrowRight size={17}/></button></form><div className="auth-switch">{authMode === "login" ? "Don't have an account?" : "Already have an account?"} <button onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}>{authMode === "login" ? "Sign up" : "Log in"}</button></div><div className="admin-hint"><ShieldCheck size={15}/><span>Admin demo: <b>admin@foodexpress.com</b> / <b>admin123</b></span></div></div></main>}

    {page === "cart" && <main className="page-wrap"><div className="page-title"><span className="eyebrow orange">YOUR SELECTION</span><h1>Your cart</h1><p>Review your delicious picks before checkout.</p></div>{!cartItems.length ? <div className="empty-state panel"><span>🛍️</span><h2>Your cart is empty</h2><p>Looks like you haven't added anything yet.</p><button className="primary-button" onClick={() => go("home")}>Explore menu <ArrowRight size={17}/></button></div> : <div className="cart-layout"><div className="cart-list">{cartItems.map(item => <div className="cart-row" key={item.id}><img src={item.image} alt={item.name}/><div className="cart-item-info"><h3>{item.name}</h3><small>{item.category}</small><b>{money(item.price)}</b></div><div className="quantity"><button onClick={() => changeQty(item.id, -1)}><Minus size={14}/></button><b>{item.qty}</b><button onClick={() => changeQty(item.id, 1)}><Plus size={14}/></button></div><button className="remove-button" onClick={() => setCart(prev => { const n = {...prev}; delete n[item.id]; return n; })}><Trash2 size={17}/></button></div>)}</div><aside className="summary-card"><h3>Order summary</h3><div><span>Subtotal</span><b>{money(total)}</b></div><div><span>Delivery fee</span><b>{money(30)}</b></div><div><span>Taxes</span><b>{money(Math.round(total * .05))}</b></div><div className="summary-total"><span>Total</span><b>{money(total + 30 + Math.round(total * .05))}</b></div><button className="primary-button full-button" onClick={placeOrder}>Place order <ArrowRight size={17}/></button><small className="secure-note"><ShieldCheck size={14}/> Demo checkout · No payment collected</small></aside></div>}</main>}

    {page === "orders" && <main className="page-wrap"><div className="page-title"><span className="eyebrow orange">FRESH FROM OUR KITCHEN</span><h1>My orders</h1><p>All your delicious moments, in one place.</p></div>{orders.filter(order => order.userId === currentUser?.id).length === 0 ? <div className="empty-state panel"><span>📦</span><h2>No orders yet</h2><p>Your next favourite meal is waiting.</p><button className="primary-button" onClick={() => go("home")}>Browse food</button></div> : <div className="order-list">{orders.filter(order => order.userId === currentUser?.id).map(order => <article className="order-card" key={order.id}><div className="order-top"><div><span className="order-id">ORDER #{order.id}</span><h3>{order.date}</h3></div><span className="status-pill">{order.status}</span></div><div className="order-items">{order.items.map(item => <span key={item.id}>{item.name} × {item.qty}</span>)}</div><div className="order-bottom"><span><Package size={16}/> {order.items.reduce((s, i) => s + i.qty, 0)} items</span><b>{money(order.total)}</b></div></article>)}</div>}</main>}

    {page === "admin" && currentUser?.role === "admin" && <main className="page-wrap admin-page"><div className="page-title"><span className="eyebrow orange">CONTROL CENTRE</span><h1>Admin dashboard</h1><p>Manage your menu and keep orders moving.</p></div><div className="admin-stats"><div><span><ChefHat/></span><small>Menu items</small><b>{foods.length}</b></div><div><span><Package/></span><small>Total orders</small><b>{orders.length}</b></div><div><span><Clock/></span><small>Active orders</small><b>{orders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled").length}</b></div></div><div className="admin-grid"><section className="admin-panel"><div className="panel-heading"><div><h2>{editingId ? "Edit food item" : "Add a food item"}</h2><p>Keep your menu fresh and updated.</p></div><span className="panel-icon"><Plus/></span></div><form className="food-form" onSubmit={saveFood}><label>Food name<input value={foodForm.name} onChange={e => setFoodForm({...foodForm, name: e.target.value})} placeholder="e.g. Veg Fried Rice" required/></label><div className="form-two"><label>Category<select value={foodForm.category} onChange={e => setFoodForm({...foodForm, category: e.target.value})}>{CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}</select></label><label>Price (₹)<input type="number" min="1" value={foodForm.price} onChange={e => setFoodForm({...foodForm, price: e.target.value})} placeholder="199" required/></label></div><label>Description<textarea value={foodForm.description} onChange={e => setFoodForm({...foodForm, description: e.target.value})} placeholder="Describe the dish..." rows="3"/></label><label>Image URL <span className="optional">(optional)</span><input value={foodForm.image} onChange={e => setFoodForm({...foodForm, image: e.target.value})} placeholder="https://..."/></label><div className="form-actions"><button className="primary-button" type="submit">{editingId ? "Save changes" : "Add food"} <Plus size={16}/></button>{editingId && <button type="button" className="cancel-button" onClick={() => {setEditingId(null); setFoodForm({name:"",category:"Biryani",price:"",description:"",image:""});}}>Cancel</button>}</div></form></section><section className="admin-panel"><div className="panel-heading"><div><h2>Menu inventory</h2><p>{foods.length} items available to customers.</p></div><span className="panel-icon"><Utensils/></span></div><div className="inventory-list">{foods.map(food => <div className="inventory-row" key={food.id}><img src={food.image} alt={food.name}/><div><b>{food.name}</b><small>{food.category} · {money(food.price)}</small></div><button className="icon-button" title="Edit" onClick={() => editFood(food)}>✎</button><button className="icon-button danger" title="Delete" onClick={() => {setFoods(prev => prev.filter(f => f.id !== food.id)); flash("Food item deleted.");}}> <Trash2 size={16}/></button></div>)}</div></section></div><section className="admin-panel orders-admin"><div className="panel-heading"><div><h2>Customer orders</h2><p>Update each order as it moves through the kitchen.</p></div><span className="panel-icon"><Truck/></span></div>{orders.length === 0 ? <p className="muted">No customer orders yet.</p> : <div className="admin-orders">{orders.map(order => <div className="admin-order-row" key={order.id}><div><b>#{order.id} · {order.customer}</b><small>{order.items.map(i => `${i.name} × ${i.qty}`).join(", ")}</small></div><b>{money(order.total)}</b><select value={order.status} onChange={e => updateStatus(order.id, e.target.value)}><option>Order Received</option><option>Preparing</option><option>Out for Delivery</option><option>Delivered</option><option>Cancelled</option></select></div>)}</div>}</section></main>}

    {page === "admin" && currentUser?.role !== "admin" && <main className="page-wrap"><div className="empty-state panel"><span>🔒</span><h2>Admin access only</h2><p>Please login with the administrator account.</p><button className="primary-button" onClick={() => {setAuthMode("login"); go("auth");}}>Admin login</button></div></main>}
    <div className="mobile-bottom-space"></div>
  </div>;
}