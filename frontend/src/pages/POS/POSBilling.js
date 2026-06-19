import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useColorMode } from '../../context/ThemeContext';
import Receipt from './Receipt';

// ─── Theme tokens ─────────────────────────────────────────────────────
const AMBER      = '#FFC107';
const AMBER_DARK = '#FF8F00';
const AMBER_BG   = (op = 0.12) => `rgba(255,193,7,${op})`;
const ERROR_CLR  = '#F44336';
const SUCCESS_CLR= '#4CAF50';
const DEFAULT_IMG= 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';

function getTokens(mode) {
  const dark = mode === 'dark';
  return {
    rootBg:       dark ? '#0A0A0A'              : '#F4F5F7',
    panelBg:      dark ? '#1A1A1A'              : '#FFFFFF',
    cardBg:       dark ? '#222222'              : '#FFFFFF',
    inputBg:      dark ? 'rgba(255,255,255,0.05)' : '#F4F5F7',
    border:       dark ? 'rgba(255,193,7,0.15)' : 'rgba(0,0,0,0.08)',
    borderPlain:  dark ? 'rgba(255,255,255,0.06)': '#E5E7EB',
    textMain:     dark ? '#FFFFFF'              : '#1A1A2E',
    textSec:      dark ? '#B0B0B0'              : '#555555',
    textDim:      dark ? '#555555'              : '#999999',
    catActiveBg:  dark ? AMBER_BG(0.13)         : AMBER_BG(0.1),
    catHoverBorder: dark ? 'rgba(255,193,7,0.4)' : 'rgba(255,193,7,0.5)',
    prodHoverShadow: dark ? '0 8px 24px rgba(255,193,7,0.15)' : '0 8px 20px rgba(255,193,7,0.25)',
    overlayBg:    dark ? 'rgba(0,0,0,0.65)'    : 'rgba(0,0,0,0.45)',
    dialogBg:     dark ? '#1E1E1E'              : '#FFFFFF',
    dialogBorder: dark ? 'rgba(255,193,7,0.15)' : 'rgba(0,0,0,0.08)',
    summaryBorder: dark ? 'rgba(255,193,7,0.15)' : 'rgba(0,0,0,0.08)',
    orderTabBg:   dark ? 'rgba(255,255,255,0.04)' : '#F4F5F7',
    orderTabActiveBg: dark ? AMBER_BG(0.15)    : AMBER_BG(0.12),
    orderTabActiveBorder: dark ? 'rgba(255,193,7,0.35)' : 'rgba(255,193,7,0.5)',
    payActiveBg:  dark ? AMBER_BG(0.15)        : AMBER_BG(0.1),
    payInactiveBg: dark ? 'rgba(255,255,255,0.03)' : '#F4F5F7',
    payInactiveBorder: dark ? 'rgba(255,255,255,0.06)' : '#E5E7EB',
    cartItemBorder: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)',
    infoBoxBg:    dark ? 'rgba(255,255,255,0.04)' : '#F4F5F7',
    scrollThumb:  dark ? 'rgba(255,193,7,0.2)' : 'rgba(0,0,0,0.15)',
    panelShadow:  dark ? 'none' : '0 10px 40px rgba(0,0,0,0.08)',
    cardShadow:   dark ? '0 4px 12px rgba(0,0,0,0.4)' : '0 10px 25px rgba(0,0,0,0.05)',
  };
}

// ─── Category SVG Icons ───────────────────────────────────────────────
const CAT_SVGS = {
  all: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/>
    </svg>
  ),
  beverage: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
      <line x1="6" y1="2" x2="6" y2="4"/>
      <line x1="10" y1="2" x2="10" y2="4"/>
      <line x1="14" y1="2" x2="14" y2="4"/>
    </svg>
  ),
  dessert: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a9 9 0 0 0-9 9M21 11a9 9 0 0 0-9-9v9Z"/>
      <path d="M3 11h18M5 11v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"/>
      <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
    </svg>
  ),
  food: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v4M21 2v20M17 2v2c0 2.2 1.8 4 4 4M21 11H17v11"/>
    </svg>
  ),
  juice: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12l-2 18H8L6 3Z"/>
      <line x1="6" y1="8" x2="18" y2="8"/>
      <line x1="15" y1="3" x2="19" y2="1"/>
      <circle cx="12" cy="14" r="2"/>
    </svg>
  ),
  snack: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3"/>
      <path d="M12 3v18M3 12h18"/>
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor"/>
      <circle cx="16.5" cy="7.5" r="1.5" fill="currentColor"/>
      <circle cx="7.5" cy="16.5" r="1.5" fill="currentColor"/>
      <circle cx="16.5" cy="16.5" r="1.5" fill="currentColor"/>
    </svg>
  ),
  default: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  ),
};

function getCatSVG(cat) {
  const lower = (cat?.name || '').toLowerCase();
  if (lower.includes('juice'))     return CAT_SVGS.juice;
  if (lower.includes('drink') || lower.includes('beverage') || lower.includes('coffee') || lower.includes('tea')) return CAT_SVGS.beverage;
  if (lower.includes('dessert') || lower.includes('sweet') || lower.includes('cake') || lower.includes('brownie'))  return CAT_SVGS.dessert;
  if (lower.includes('snack') || lower.includes('fries') || lower.includes('biscuit'))     return CAT_SVGS.snack;
  if (lower.includes('food') || lower.includes('burger') || lower.includes('pizza') || lower.includes('meal') || lower.includes('chicken'))      return CAT_SVGS.food;
  return CAT_SVGS.default;
}

// Payment SVGs
const PAY_SVGS = {
  cash: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2"/>
      <circle cx="12" cy="12" r="2.5"/>
      <path d="M6 12h.01M18 12h.01"/>
    </svg>
  ),
  card: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
      <line x1="6" y1="15" x2="10" y2="15" strokeWidth="2.5"/>
    </svg>
  ),
  qr: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <path d="M14 14h2v2h-2zM18 14h3v2h-3zM14 18h2v3h-2zM20 19h1v2h-1z"/>
    </svg>
  ),
};

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'qr',   label: 'QR Code' },
];

const ORDER_TYPES = [
  { value: 'dine_in',   label: 'Dine In'   },
  { value: 'take_away', label: 'Take Away' },
  { value: 'delivery',  label: 'Delivery'  },
];

// ─── Component ────────────────────────────────────────────────────────
export default function POSBilling() {
  const { user }   = useAuth();
  const { mode }   = useColorMode();
  const T          = getTokens(mode);
  const receiptRef = useRef(null);

  const [products,       setProducts]       = useState([]);
  const [categories,     setCategories]     = useState([]);
  const [tables,         setTables]         = useState([]);
  const [cart,           setCart]           = useState([]);
  const [search,         setSearch]         = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [orderType,      setOrderType]      = useState('dine_in');
  const [selectedTable,  setSelectedTable]  = useState('');
  const [discount,       setDiscount]       = useState('');
  const [loading,        setLoading]        = useState(false);
  const [productLoading, setProductLoading] = useState(true);
  const [paymentDialog,  setPaymentDialog]  = useState(false);
  const [cashReceived,   setCashReceived]   = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);
  const [successMsg,     setSuccessMsg]     = useState('');
  const [error,          setError]          = useState('');
  const [paymentMethod,  setPaymentMethod]  = useState('cash');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [pr, cr, tr] = await Promise.all([
        api.get('/products?available=true'),
        api.get('/products/categories'),
        api.get('/orders/tables'),
      ]);
      setProducts(pr.data.products || []);
      setCategories(cr.data.categories || []);
      setTables(tr.data.tables || []);
    } catch (err) { 
      console.error('POS load data error: ', err);
      setError('Failed to load data.'); 
    }
    finally  { setProductLoading(false); }
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = activeCategory === 'all' || p.category_id === parseInt(activeCategory);
    return matchSearch && matchCat;
  });

  // Always add +1 on click (never toggle)
  const addToCart = (product) => {
    setCart(prev => {
      const ex = prev.find(i => i.product_id === product.id);
      if (ex) return prev.map(i => i.product_id === product.id
        ? { ...i, qty: i.qty + 1, total: (i.qty + 1) * i.unit_price } : i);
      return [...prev, {
        product_id:   product.id,
        product_name: product.name,
        image_url:    product.image_url || DEFAULT_IMG,
        unit_price:   parseFloat(product.price),
        qty: 1,
        total: parseFloat(product.price),
      }];
    });
  };

  const updateQty = (productId, delta) => {
    setCart(prev => prev
      .map(i => i.product_id === productId
        ? { ...i, qty: Math.max(0, i.qty + delta), total: Math.max(0, i.qty + delta) * i.unit_price }
        : i)
      .filter(i => i.qty > 0)
    );
  };

  const clearCart = () => {
    setCart([]); setDiscount(''); setCashReceived('');
    setSelectedTable(''); setOrderType('dine_in'); setCompletedOrder(null);
  };

  const subtotal    = cart.reduce((s, i) => s + i.total, 0);
  const discountAmt = parseFloat(discount) || 0;
  const grandTotal  = Math.max(0, subtotal - discountAmt);
  const balance     = (parseFloat(cashReceived) || 0) - grandTotal;

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `Receipt-${completedOrder?.invoice_no || 'draft'}`,
  });

  const handlePlaceOrder = () => {
    if (cart.length === 0)                         { setError('Add items to cart first.');    return; }
    if (orderType === 'dine_in' && !selectedTable) { setError('Select a table for dine-in.'); return; }
    setError(''); setCashReceived(''); setPaymentDialog(true);
  };

  const handleProcessPayment = async () => {
    if (!cashReceived || parseFloat(cashReceived) < grandTotal) {
      setError('Cash received must be ≥ Grand Total.'); return;
    }
    setLoading(true); setError('');
    try {
      const tbl = tables.find(t => t.id === parseInt(selectedTable));
      const res = await api.post('/orders', {
        items: cart, order_type: orderType,
        table_id: selectedTable || null, table_no: tbl?.table_no || null,
        subtotal, discount: discountAmt, tax: 0,
        grand_total: grandTotal,
        cash_received: parseFloat(cashReceived), balance,
      });
      setCompletedOrder(res.data.order);
      setSuccessMsg(`✅ Order ${res.data.order.invoice_no} placed!`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save order.');
    } finally { setLoading(false); }
  };

  const getCatCount = (id) =>
    id === 'all' ? products.length : products.filter(p => p.category_id === parseInt(id)).length;

  const selTable = tables.find(t => t.id === parseInt(selectedTable));

  // ─── Inline styles (theme-aware) ───────────────────────────────────
  const css = {
    root: {
      display: 'flex', height: 'calc(100vh - 64px)',
      fontFamily: "'Outfit', 'Inter', sans-serif",
      overflow: 'hidden', background: T.rootBg,
    },
    left: {
      flex: 1, display: 'flex', flexDirection: 'column',
      overflow: 'hidden', background: T.panelBg,
      borderRight: `1px solid ${T.border}`,
      boxShadow: T.panelShadow,
      margin: '12px 0 12px 12px',
      borderRadius: 20,
      zIndex: 1,
    },
    // search
    searchBar: {
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '16px 24px', borderBottom: `1px solid ${T.border}`,
      background: T.panelBg,
      borderTopLeftRadius: 20,
    },
    searchWrap: {
      flex: 1, display: 'flex', alignItems: 'center', gap: 10,
      background: T.inputBg, border: `1px solid ${T.border}`,
      borderRadius: 12, padding: '10px 16px',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
    },
    searchInput: {
      border: 'none', outline: 'none', background: 'transparent',
      fontSize: 15, color: T.textMain, width: '100%', fontFamily: 'inherit',
    },

    // category strip
    catStrip: {
      display: 'flex', gap: 12, padding: '16px 24px',
      overflowX: 'auto', borderBottom: `1px solid ${T.border}`,
      scrollbarWidth: 'none', background: T.panelBg,
    },
    catCard: (active) => ({
      minWidth: 95, textAlign: 'center', cursor: 'pointer',
      padding: '14px 12px 10px', borderRadius: 16, flexShrink: 0,
      background: active ? T.catActiveBg : T.inputBg,
      border: active ? `2px solid ${AMBER}` : `2px solid transparent`,
      color: active ? AMBER : T.textSec,
      boxShadow: active ? `0 8px 20px ${AMBER_BG(0.2)}` : 'none',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    }),
    catName: (active) => ({
      display: 'block', fontSize: 11, fontWeight: 700,
      color: active ? AMBER : T.textSec, marginTop: 6, lineHeight: 1.2,
    }),
    catCount: { display: 'block', fontSize: 10, color: T.textDim, marginTop: 2 },

    // products grid
    grid: {
      flex: 1, overflowY: 'auto', padding: '20px 24px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
      gap: 18, alignContent: 'start',
    },

    // product card
    prodCard: (inCart) => ({
      background: inCart ? (mode === 'dark' ? 'rgba(255,193,7,0.07)' : AMBER_BG(0.06)) : T.cardBg,
      border: inCart ? `2px solid ${AMBER}` : `1px solid ${T.borderPlain}`,
      borderRadius: 18, overflow: 'hidden', cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: inCart ? `0 8px 24px ${AMBER_BG(0.25)}` : T.cardShadow,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 280,
    }),
    prodImgWrap: {
      width: '100%', height: 150, overflow: 'hidden',
      background: T.inputBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    prodImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
    prodBody: { padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' },
    prodName: {
      fontSize: 14, fontWeight: 800, color: T.textMain,
      lineHeight: 1.4, marginBottom: 6,
      fontFamily: "'Outfit', sans-serif",
    },
    prodPrice: { fontSize: 15, fontWeight: 900, color: '#FFB300', marginBottom: 12 },

    // qty row on card (when in cart)
    cardQtyRow: {
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 6,
    },
    cardQtyBtn: (type) => ({
      width: 30, height: 30, borderRadius: '50%', border: 'none',
      background: type === 'remove' ? 'rgba(244,67,54,0.12)' : AMBER_BG(0.15),
      color: type === 'remove' ? ERROR_CLR : AMBER,
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 18, fontWeight: 700, fontFamily: 'inherit', transition: 'all 0.15s',
      flexShrink: 0,
    }),
    addCartBtn: {
      width: '100%',
      background: 'rgba(255,193,7,0.12)',
      border: `1px solid rgba(255,193,7,0.25)`,
      borderRadius: 14,
      color: '#FFB300',
      fontWeight: 800,
      fontSize: 13,
      padding: '9px 0',
      cursor: 'pointer',
      fontFamily: 'inherit',
      transition: 'all 0.2s ease',
    },
    lowStock: {
      position: 'absolute', top: 8, left: 8,
      background: ERROR_CLR, color: '#fff',
      fontSize: 9, fontWeight: 800,
      padding: '2px 7px', borderRadius: 5,
    },

    // ── RIGHT ──
    right: {
      width: 380, minWidth: 340,
      display: 'flex', flexDirection: 'column',
      background: T.panelBg, overflow: 'hidden',
      margin: '12px 12px 12px 0',
      borderRadius: 20,
      boxShadow: T.panelShadow,
    },
    rightHeader: {
      padding: '20px 24px 16px',
      borderBottom: `1px solid ${T.border}`,
      background: T.panelBg,
    },
    titleRow: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontSize: 20, fontWeight: 900, color: AMBER,
      letterSpacing: '-0.02em',
    },
    titleSub: { fontSize: 13, color: T.textSec, marginTop: 4, fontWeight: 500 },
    orderTabs: {
      display: 'flex', gap: 6, marginTop: 16,
      background: T.orderTabBg, borderRadius: 12, padding: 5,
    },
    orderTab: (active) => ({
      flex: 1, background: active ? T.orderTabActiveBg : 'transparent',
      border: active ? `1px solid ${T.orderTabActiveBorder}` : '1px solid transparent',
      borderRadius: 10, color: active ? AMBER : T.textSec,
      fontWeight: active ? 800 : 500, fontSize: 12,
      padding: '9px 4px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
      boxShadow: active ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
    }),
    tableSelect: {
      width: '100%', border: `1px solid ${T.border}`,
      borderRadius: 12, padding: '10px 14px',
      fontSize: 14, color: T.textMain, background: T.inputBg,
      outline: 'none', fontFamily: 'inherit', marginTop: 12,
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)',
    },

    // cart list
    cartList: {
      flex: 1, overflowY: 'auto', padding: '12px 24px',
      display: 'flex', flexDirection: 'column',
    },
    cartItem: {
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '20px 0', borderBottom: `1px solid ${T.cartItemBorder}`,
    },
    cartImg: {
      width: 58, height: 58, borderRadius: 12, objectFit: 'cover',
      flexShrink: 0, border: `1px solid ${T.border}`, background: T.inputBg,
      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
    },
    cartInfo: { flex: 1, minWidth: 0 },
    cartItemName: {
      fontSize: 14, fontWeight: 700, color: T.textMain,
      lineHeight: 1.3, marginBottom: 5,
      display: '-webkit-box', WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical', overflow: 'hidden',
    },
    cartItemRow: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    },
    cartPriceLabel: { fontSize: 12, color: T.textSec },
    cartQtyBadge: {
      background: AMBER_BG(0.12), color: AMBER,
      fontWeight: 800, fontSize: 11,
      padding: '2px 8px', borderRadius: 20, marginLeft: 6,
    },
    // qty controls inside cart
    cartQtyRow: {
      display: 'flex', alignItems: 'center', gap: 8, marginTop: 6,
    },
    cartQtyBtn: (type) => ({
      width: 26, height: 26, borderRadius: '50%', border: 'none',
      background: type === 'remove' ? 'rgba(244,67,54,0.12)' : AMBER_BG(0.15),
      color: type === 'remove' ? ERROR_CLR : AMBER,
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 16, fontWeight: 700, fontFamily: 'inherit', flexShrink: 0,
      transition: 'all 0.15s',
    }),
    cartQtyNum: {
      fontSize: 14, fontWeight: 800, color: T.textMain,
      minWidth: 22, textAlign: 'center',
    },
    cartItemTotal: { fontSize: 14, fontWeight: 900, color: AMBER, marginLeft: 'auto' },

    emptyCart: {
      textAlign: 'center', padding: '60px 0', color: T.textDim,
    },

    // summary
    summaryBox: {
      padding: '10px 24px 0', borderTop: `1px solid ${T.summaryBorder}`,
      background: T.panelBg,
    },
    discLabel: {
      fontSize: 10, fontWeight: 800, color: T.textDim,
      display: 'block', marginBottom: 4,
      textTransform: 'uppercase', letterSpacing: 1,
    },
    discInput: {
      width: '100%', border: `1px solid ${T.border}`,
      borderRadius: 10, padding: '6px 12px',
      fontSize: 13, color: T.textMain, background: T.inputBg,
      outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)',
    },
    sumRow: {
      display: 'flex', justifyContent: 'space-between',
      fontSize: 13, color: T.textSec, marginTop: 6,
      fontWeight: 500,
    },
    sumTotalRow: {
      display: 'flex', justifyContent: 'space-between',
      fontSize: 16, fontWeight: 900, color: T.textMain,
      padding: '8px 0 6px',
      borderTop: `2px dashed ${T.border}`, marginTop: 6,
    },

    // payment
    paySection: { padding: '6px 24px 8px' },
    payLabel: {
      fontSize: 10, fontWeight: 800, color: T.textDim,
      textTransform: 'uppercase', letterSpacing: 1.2,
      marginBottom: 6, display: 'block',
    },
    payMethods: { display: 'flex', gap: 8 },
    payBtn: (active) => ({
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 4, padding: '8px 4px',
      background: active ? T.payActiveBg : T.payInactiveBg,
      border: active ? `2px solid ${AMBER}` : `2px solid ${T.payInactiveBorder}`,
      borderRadius: 12, cursor: 'pointer',
      color: active ? AMBER : T.textSec,
      fontSize: 10, fontWeight: 800, fontFamily: 'inherit', transition: 'all 0.2s',
      boxShadow: active ? `0 4px 12px ${AMBER_BG(0.15)}` : 'none',
    }),

    // place order
    placeSection: { padding: '4px 24px 12px' },
    placeBtn: (disabled) => ({
      width: '100%',
      background: disabled ? (mode === 'dark' ? 'rgba(255,193,7,0.18)' : 'rgba(255,193,7,0.3)') : 'linear-gradient(135deg, #FFC107 0%, #FF8F00 100%)',
      color: disabled ? 'rgba(0,0,0,0.35)' : '#000',
      border: 'none', borderRadius: 12,
      fontSize: 14, fontWeight: 900, padding: '12px 0',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'inherit', letterSpacing: 0.5,
      boxShadow: disabled ? 'none' : '0 6px 18px rgba(255,193,7,0.3)',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      textTransform: 'uppercase',
    }),

    // alerts
    topAlert: (type) => ({
      padding: '10px 20px',
      background: type === 'error' ? 'rgba(244,67,54,0.08)' : 'rgba(76,175,80,0.08)',
      borderBottom: `1px solid ${type === 'error' ? 'rgba(244,67,54,0.18)' : 'rgba(76,175,80,0.18)'}`,
      color: type === 'error' ? '#EF5350' : '#66BB6A',
      fontSize: 13, fontWeight: 600,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }),

    // dialog
    overlay: {
      position: 'fixed', inset: 0, background: T.overlayBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1200, backdropFilter: 'blur(4px)',
    },
    dialog: {
      background: T.dialogBg,
      border: `1px solid ${T.dialogBorder}`,
      borderRadius: 20, padding: '28px 28px 24px',
      width: 400, maxWidth: '96vw',
      boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
    },
    dialogTitle: { fontSize: 20, fontWeight: 800, color: AMBER, marginBottom: 4 },
    dialogSub: { fontSize: 13, color: T.textSec, marginBottom: 18 },
    dialogInfoBox: {
      background: T.infoBoxBg,
      border: `1px solid ${T.border}`,
      borderRadius: 12, padding: '14px 16px', marginBottom: 16,
    },
    dialogRow: {
      display: 'flex', justifyContent: 'space-between',
      fontSize: 13.5, color: T.textSec, marginBottom: 8,
    },
    dialogTotalRow: {
      display: 'flex', justifyContent: 'space-between',
      fontSize: 16, fontWeight: 800, color: AMBER,
      paddingTop: 10,
      borderTop: `1px dashed ${T.border}`, marginTop: 4,
    },
    cashInput: {
      width: '100%', border: `2px solid ${T.border}`,
      borderRadius: 12, padding: '12px 14px',
      fontSize: 16, fontWeight: 700, color: T.textMain,
      background: T.inputBg, outline: 'none', fontFamily: 'inherit',
      boxSizing: 'border-box', marginBottom: 12, transition: 'border 0.2s',
    },
    balanceBox: {
      background: AMBER_BG(0.12),
      border: `1px solid rgba(255,193,7,0.3)`,
      borderRadius: 12, padding: '12px 16px',
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: 16,
    },
    inlineErr: {
      background: 'rgba(244,67,54,0.08)',
      border: '1px solid rgba(244,67,54,0.2)',
      borderRadius: 10, padding: '9px 12px',
      color: '#EF5350', fontSize: 13, marginBottom: 12,
    },
    dialogBtnRow: { display: 'flex', gap: 10, marginTop: 4 },
    cancelBtn: {
      flex: 1, background: T.inputBg, border: `1px solid ${T.border}`,
      borderRadius: 12, padding: '12px 0',
      fontSize: 14, fontWeight: 700, color: T.textSec,
      cursor: 'pointer', fontFamily: 'inherit',
    },
    confirmBtn: (disabled) => ({
      flex: 2,
      background: disabled ? 'rgba(255,193,7,0.2)' : 'linear-gradient(135deg, #FFC107 0%, #FF8F00 100%)',
      border: 'none', borderRadius: 12, padding: '12px 0',
      fontSize: 14, fontWeight: 800, color: disabled ? 'rgba(0,0,0,0.3)' : '#000',
      cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
      boxShadow: disabled ? 'none' : '0 4px 14px rgba(255,193,7,0.25)',
    }),
    successIcon: {
      width: 64, height: 64, borderRadius: '50%',
      background: AMBER_BG(0.12), border: `2px solid rgba(255,193,7,0.3)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 16px', fontSize: 30,
    },
    printBtn: {
      width: '100%',
      background: 'linear-gradient(135deg, #FFC107 0%, #FF8F00 100%)',
      border: 'none', borderRadius: 12, padding: '13px 0',
      fontSize: 15, fontWeight: 800, color: '#000',
      cursor: 'pointer', fontFamily: 'inherit',
      boxShadow: '0 4px 14px rgba(255,193,7,0.3)', marginBottom: 8,
    },
    newOrderBtn: {
      width: '100%', background: T.inputBg, border: `1px solid ${T.border}`,
      borderRadius: 12, padding: '11px 0', fontSize: 14,
      fontWeight: 700, color: T.textSec, cursor: 'pointer', fontFamily: 'inherit',
    },
  };

  // ─── JSX ─────────────────────────────────────────────────────────────
  return (
    <div style={css.root}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .pos-cat:hover { border-color: rgba(255,193,7,0.5) !important; color: ${AMBER} !important; }
        .pos-prod:hover { transform: translateY(-3px); box-shadow: ${T.prodHoverShadow} !important; border-color: rgba(255,193,7,0.4) !important; }
        .pos-addbtn:hover { background: rgba(255,193,7,0.22) !important; }
        .pos-qbtn:hover { opacity: 0.8; transform: scale(1.1); }
        .pos-pay:hover { border-color: rgba(255,193,7,0.4) !important; color: ${AMBER} !important; }
        .pos-place:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,193,7,0.4) !important; }
        select option { background: ${T.panelBg}; color: ${T.textMain}; }
        *::-webkit-scrollbar { width: 5px; height: 5px; }
        *::-webkit-scrollbar-thumb { background: ${T.scrollThumb}; border-radius: 5px; }
        *::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      {/* ══ LEFT ══════════════════════════════════════════════════════ */}
      <div style={css.left}>

        {/* Alerts */}
        {successMsg && (
          <div style={css.topAlert('success')}>
            <span>{successMsg}</span>
            <button style={{ background:'none', border:'none', cursor:'pointer', color:'#66BB6A', fontSize:16 }} onClick={() => setSuccessMsg('')}>✕</button>
          </div>
        )}
        {error && !paymentDialog && (
          <div style={css.topAlert('error')}>
            <span>{error}</span>
            <button style={{ background:'none', border:'none', cursor:'pointer', color:'#EF5350', fontSize:16 }} onClick={() => setError('')}>✕</button>
          </div>
        )}

        {/* Search */}
        <div style={css.searchBar}>
          <div style={css.searchWrap}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={T.textDim} strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input id="pos-search" style={css.searchInput}
              placeholder="Search Product here..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Categories */}
        <div style={css.catStrip}>
          <div className="pos-cat" style={css.catCard(activeCategory === 'all')} onClick={() => setActiveCategory('all')}>
            {CAT_SVGS.all}
            <span style={css.catName(activeCategory === 'all')}>All</span>
            <span style={css.catCount}>{getCatCount('all')} Items</span>
          </div>
          {categories.map(cat => (
            <div key={cat.id} className="pos-cat"
              style={css.catCard(activeCategory === String(cat.id))}
              onClick={() => setActiveCategory(String(cat.id))}>
              {getCatSVG(cat)}
              <span style={css.catName(activeCategory === String(cat.id))}>{cat.name}</span>
              <span style={css.catCount}>{getCatCount(cat.id)} Items</span>
            </div>
          ))}
        </div>

        {/* Products */}
        {productLoading ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flex:1 }}>
            <div style={{ width:36, height:36, border:`3px solid ${AMBER_BG(0.15)}`, borderTop:`3px solid ${AMBER}`, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
          </div>
        ) : (
          <div style={css.grid}>
            {filtered.length === 0 && (
              <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'48px 0', color: T.textDim }}>
                <div style={{ fontSize:38, marginBottom:8, opacity:0.4 }}>🔍</div>
                <div style={{ fontSize:14, fontWeight:600, color: T.textSec }}>No products found</div>
              </div>
            )}
            {filtered.map(product => {
              const inCart = cart.find(i => i.product_id === product.id);
              return (
                <div
                  key={product.id}
                  id={`product-${product.id}`}
                  className={`pos-prod`}
                  style={css.prodCard(!!inCart)}
                  onClick={() => addToCart(product)}
                >
                  {product.stock <= product.min_stock && (
                    <div style={css.lowStock}>Low Stock</div>
                  )}
                  {/* Image */}
                  <div style={css.prodImgWrap}>
                    <img src={product.image_url || DEFAULT_IMG} alt={product.name}
                      style={css.prodImg} onError={e => { e.target.src = DEFAULT_IMG; }} />
                  </div>
                  {/* Info */}
                  <div style={css.prodBody}>
                    <div style={css.prodName}>{product.name}</div>
                    <div style={css.prodPrice}>Rs. {Number(product.price).toLocaleString()}</div>

                    {/* Always render the Add to Cart button/qty row at the bottom of the card, and style it nicely */}
                    <div style={{ marginTop: 'auto' }}>
                      {inCart ? (
                        /* qty controls on card */
                        <div style={css.cardQtyRow} onClick={e => e.stopPropagation()}>
                          <button className="pos-qbtn" style={css.cardQtyBtn('remove')}
                            onClick={e => { e.stopPropagation(); updateQty(product.id, -1); }}>−</button>
                          <span style={{ fontWeight:800, fontSize:14, color: T.textMain }}>{inCart.qty}</span>
                          <button className="pos-qbtn" style={css.cardQtyBtn('add')}
                            onClick={e => { e.stopPropagation(); updateQty(product.id, 1); }}>+</button>
                        </div>
                      ) : (
                        /* Add to Cart button */
                        <button className="pos-addbtn" style={css.addCartBtn}
                          onClick={e => { e.stopPropagation(); addToCart(product); }}>
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══ RIGHT ═════════════════════════════════════════════════════ */}
      <div style={css.right}>

        {/* Header */}
        <div style={css.rightHeader}>
          <div style={css.titleRow}>
            <span>
              {orderType === 'dine_in' && selTable ? selTable.table_no
                : orderType === 'take_away' ? 'Take Away'
                : orderType === 'delivery'  ? 'Delivery'
                : 'New Order'}
            </span>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={T.textDim} strokeWidth="2" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
          <div style={css.titleSub}>{user?.name || 'Cashier'}</div>

          {/* Order Type Tabs */}
          <div style={css.orderTabs}>
            {ORDER_TYPES.map(ot => (
              <button key={ot.value} style={css.orderTab(orderType === ot.value)}
                onClick={() => setOrderType(ot.value)}>{ot.label}</button>
            ))}
          </div>

          {/* Table selector */}
          {orderType === 'dine_in' && (
            <select id="table-select" style={css.tableSelect}
              value={selectedTable} onChange={e => setSelectedTable(e.target.value)}>
              <option value="">— Select Table —</option>
              {tables.map(t => (
                <option key={t.id} value={t.id}>{t.table_no} (Cap: {t.capacity})</option>
              ))}
            </select>
          )}
        </div>

        {/* Cart */}
        <div style={css.cartList}>
          {cart.length === 0 ? (
            <div style={css.emptyCart}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" style={{ marginBottom:10, color:T.textDim }}>
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <div style={{ fontSize:14, fontWeight:700, color:T.textSec }}>Cart is empty</div>
              <div style={{ fontSize:12, color:T.textDim, marginTop:4 }}>Click products to add them</div>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product_id} style={css.cartItem}>
                <img src={item.image_url || DEFAULT_IMG} alt={item.product_name}
                  style={css.cartImg} onError={e => { e.target.src = DEFAULT_IMG; }} />
                <div style={css.cartInfo}>
                  <div style={css.cartItemName}>{item.product_name}</div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    {/* qty controls inside cart */}
                    <div style={css.cartQtyRow}>
                      <button className="pos-qbtn" style={css.cartQtyBtn('remove')}
                        onClick={() => updateQty(item.product_id, -1)}>−</button>
                      <span style={css.cartQtyNum}>{item.qty}</span>
                      <button className="pos-qbtn" style={css.cartQtyBtn('add')}
                        onClick={() => updateQty(item.product_id, 1)}>+</button>
                    </div>
                    <span style={css.cartItemTotal}>Rs. {item.total.toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize:11, color:T.textDim, marginTop:2 }}>
                    Rs. {item.unit_price.toLocaleString()} each
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        <div style={css.summaryBox}>
          <label style={css.discLabel}>Discount (Rs.)</label>
          <input id="discount-input" type="number" min="0" style={css.discInput}
            placeholder="0" value={discount} onChange={e => setDiscount(e.target.value)} />
          <div style={css.sumRow}>
            <span>Sub Total</span>
            <span style={{ fontWeight:700, color:T.textMain }}>Rs. {subtotal.toLocaleString()}</span>
          </div>
          {discountAmt > 0 && (
            <div style={css.sumRow}>
              <span>Discount</span>
              <span style={{ fontWeight:700, color:ERROR_CLR }}>- Rs. {discountAmt.toLocaleString()}</span>
            </div>
          )}
          <div style={css.sumTotalRow}>
            <span>Total Amount</span>
            <span style={{ color:AMBER }}>Rs. {grandTotal.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div style={css.paySection}>
          <span style={css.payLabel}>Payment Method</span>
          <div style={css.payMethods}>
            {PAYMENT_METHODS.map(pm => (
              <button key={pm.value} className="pos-pay"
                style={css.payBtn(paymentMethod === pm.value)}
                onClick={() => setPaymentMethod(pm.value)}>
                {PAY_SVGS[pm.value]}
                <span style={{ fontSize:9.5, lineHeight:1.2 }}>{pm.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Place Order */}
        <div style={css.placeSection}>
          <button id="pos-place-order-btn" className="pos-place"
            style={css.placeBtn(cart.length === 0)}
            onClick={handlePlaceOrder} disabled={cart.length === 0}>
            Place Order
          </button>
        </div>
      </div>

      {/* ══ PAYMENT DIALOG ════════════════════════════════════════════ */}
      {paymentDialog && (
        <div style={css.overlay} onClick={e => { if (e.target === e.currentTarget) { setPaymentDialog(false); setError(''); } }}>
          <div style={css.dialog}>
            {completedOrder ? (
              <>
                <div style={{ textAlign:'center' }}>
                  <div style={css.successIcon}>🎉</div>
                  <div style={{ ...css.dialogTitle, textAlign:'center' }}>Order Placed!</div>
                  <div style={{ ...css.dialogSub, textAlign:'center' }}>Invoice: {completedOrder.invoice_no}</div>
                </div>
                <div style={css.dialogInfoBox}>
                  <div style={css.dialogRow}>
                    <span>Bill Amount</span>
                    <span style={{ fontWeight:700, color:T.textMain }}>Rs. {Number(completedOrder.grand_total).toLocaleString()}</span>
                  </div>
                  <div style={css.dialogRow}>
                    <span>Cash Received</span>
                    <span style={{ fontWeight:700, color:T.textMain }}>Rs. {Number(completedOrder.cash_received).toLocaleString()}</span>
                  </div>
                  <div style={{ borderTop:`1px dashed ${T.border}`, margin:'8px 0' }} />
                  <div style={{ display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:16, color:AMBER }}>
                    <span>Balance to Return</span>
                    <span>Rs. {Number(completedOrder.balance).toLocaleString()}</span>
                  </div>
                </div>
                <button id="success-print-btn" style={css.printBtn} onClick={handlePrint}>🖨️ Print Receipt</button>
                <button id="success-close-btn" style={css.newOrderBtn} onClick={() => { setPaymentDialog(false); clearCart(); }}>Start New Order</button>
              </>
            ) : (
              <>
                <div style={css.dialogTitle}>💳 Process Payment</div>
                <div style={css.dialogSub}>Enter the cash received from customer</div>
                {error && <div style={css.inlineErr}>{error}</div>}
                <div style={css.dialogInfoBox}>
                  <div style={css.dialogRow}>
                    <span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  {discountAmt > 0 && (
                    <div style={css.dialogRow}>
                      <span>Discount</span>
                      <span style={{ color:ERROR_CLR }}>- Rs. {discountAmt.toLocaleString()}</span>
                    </div>
                  )}
                  <div style={css.dialogTotalRow}>
                    <span>Grand Total</span>
                    <span>Rs. {grandTotal.toLocaleString()}</span>
                  </div>
                </div>
                <input id="payment-cash-input" type="number" min="0"
                  style={css.cashInput}
                  placeholder={`Min: Rs. ${grandTotal.toLocaleString()}`}
                  value={cashReceived} onChange={e => setCashReceived(e.target.value)}
                  autoFocus
                  onFocus={e => { e.currentTarget.style.borderColor = AMBER; }}
                  onBlur={e => { e.currentTarget.style.borderColor = T.border; }}
                />
                {cashReceived && parseFloat(cashReceived) >= grandTotal && (
                  <div style={css.balanceBox}>
                    <span style={{ fontWeight:700, color:AMBER }}>Balance to Return</span>
                    <span style={{ fontWeight:800, fontSize:18, color:AMBER }}>Rs. {balance.toLocaleString()}</span>
                  </div>
                )}
                <div style={css.dialogBtnRow}>
                  <button style={css.cancelBtn} onClick={() => { setPaymentDialog(false); setError(''); }}>Cancel</button>
                  <button id="payment-confirm-btn" style={css.confirmBtn(loading)}
                    onClick={handleProcessPayment} disabled={loading}>
                    {loading ? 'Processing...' : 'Confirm & Save'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hidden Receipt */}
      <div style={{ display:'none' }}>
        <Receipt ref={receiptRef} order={completedOrder}
          cashier={user?.name} balance={balance} cashReceived={cashReceived} />
      </div>
    </div>
  );
}
