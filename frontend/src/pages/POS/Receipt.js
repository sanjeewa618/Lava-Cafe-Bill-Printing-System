import React, { forwardRef } from 'react';

const Receipt = forwardRef(({ order, cashier, balance, cashReceived }, ref) => {
  if (!order) return <div ref={ref} />;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatCurrency = (val) => Number(val || 0).toFixed(2);

  const orderTypeLabel = { dine_in: 'Dine In', take_away: 'Take Away', delivery: 'Delivery' };

  const styles = {
    page: {
      fontFamily: "'Courier New', Courier, monospace",
      fontSize: '13px',
      width: '100mm',
      padding: '12px',
      color: '#000',
      backgroundColor: '#fff',
      margin: '0 auto',
    },
    center: { textAlign: 'center' },
    bold: { fontWeight: 'bold' },
    line: { borderTop: '2px dashed #000', margin: '8px 0' },
    row: { display: 'flex', justifyContent: 'space-between', marginBottom: '2px' },
    bigTitle: { fontSize: '24px', fontWeight: 'bold', letterSpacing: '4px' },
    subtitle: { fontSize: '12px', letterSpacing: '2px' },
    totalRow: { display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px', marginTop: '4px' },
    tableRow: { display: 'flex', marginBottom: '4px' },
    itemName: { flex: 2, paddingRight: '4px' },
    itemQty: { flex: 0.6, textAlign: 'center' },
    itemTotal: { flex: 1, textAlign: 'right' },
    thankYou: { textAlign: 'center', marginTop: '12px', fontSize: '13px' },
  };

  return (
    <div ref={ref} style={styles.page}>
      {/* Header */}
      <div style={styles.center}>
        <div style={{ fontSize: '32px', marginBottom: '4px' }}>🌋</div>
        <div style={{ ...styles.bigTitle, ...styles.bold }}>LAVA CAFE</div>
        <div style={styles.subtitle}>FOOD & JUICE BAR</div>
        <div style={{ fontSize: '12px', marginTop: '5px' }}>No 25, Main Street, Negombo</div>
        <div style={{ fontSize: '12px' }}>Tel: 071-XXXXXXX</div>
      </div>

      <div style={styles.line} />

      {/* Invoice Info */}
      <div style={styles.row}><span>Invoice:</span><span style={styles.bold}>{order.invoice_no}</span></div>
      <div style={styles.row}><span>Date:</span><span>{formatDate(order.created_at)}</span></div>
      <div style={styles.row}><span>Time:</span><span>{formatTime(order.created_at)}</span></div>
      <div style={styles.row}><span>Cashier:</span><span>{order.cashier_name}</span></div>
      <div style={styles.row}><span>Order Type:</span><span>{orderTypeLabel[order.order_type]}</span></div>
      {order.table_no && <div style={styles.row}><span>Table:</span><span>{order.table_no}</span></div>}

      <div style={styles.line} />

      {/* Items Header */}
      <div style={{ ...styles.tableRow, fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>
        <span style={styles.itemName}>Item</span>
        <span style={styles.itemQty}>Qty</span>
        <span style={styles.itemTotal}>Total</span>
      </div>
      <div style={{ borderTop: '2px solid #000', marginBottom: '6px' }} />

      {/* Items */}
      {(order.items || []).map((item, i) => (
        <div key={i} style={{ ...styles.tableRow, fontSize: '13px' }}>
          <span style={styles.itemName}>{item.product_name}</span>
          <span style={styles.itemQty}>{item.qty}</span>
          <span style={styles.itemTotal}>{formatCurrency(item.total)}</span>
        </div>
      ))}

      <div style={styles.line} />

      {/* Totals */}
      <div style={styles.row}><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
      {parseFloat(order.discount) > 0 && (
        <div style={styles.row}><span>Discount</span><span>{formatCurrency(order.discount)}</span></div>
      )}
      {parseFloat(order.tax) > 0 && (
        <div style={styles.row}><span>Tax</span><span>{formatCurrency(order.tax)}</span></div>
      )}

      <div style={{ borderTop: '2px solid #000', margin: '6px 0' }} />

      <div style={styles.totalRow}>
        <span>GRAND TOTAL</span>
        <span>Rs. {formatCurrency(order.grand_total)}</span>
      </div>

      <div style={{ ...styles.line, margin: '8px 0' }} />

      <div style={styles.row}><span>Cash</span><span>{formatCurrency(order.cash_received)}</span></div>
      <div style={{ ...styles.row, fontWeight: 'bold', fontSize: '14px' }}><span>Balance</span><span>{formatCurrency(order.balance)}</span></div>

      <div style={styles.line} />

      {/* Footer */}
      <div style={styles.thankYou}>
        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>** Thank You! **</div>
        <div style={{ fontSize: '12px' }}>Visit Again</div>
        <div style={{ marginTop: '6px', fontSize: '10px' }}>Powered by Lava Cafe POS</div>
        <div style={{ fontSize: '10px', marginTop: '4px' }}>━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';
export default Receipt;
