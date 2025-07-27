import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function OrderHistoryPage() {
  const { jwt } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!jwt) {
      navigate("/login");
      return;
    }
    fetch("/api/orders/history/", {
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch orders");
        return res.json();
      })
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [jwt, navigate]);

  if (loading) return <div className="mt-10 text-center">Loading order history...</div>;
  if (orders.length === 0) return <div className="mt-10 text-center">No previous orders yet.</div>;

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white rounded shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Order History</h2>
      {orders.map(order => (
        <div key={order.id} className="mb-6 border-b pb-4">
          <div className="font-bold">Order #{order.id} - {order.status}</div>
          <div className="text-gray-500 text-sm mb-2">{new Date(order.created_at).toLocaleString()}</div>
          <ul className="mb-2">
            {order.items.map(item => (
              <li key={item.id} className="text-gray-700">
                {item.product} × {item.quantity} — ₹{item.unit_price}
              </li>
            ))}
          </ul>
          <div className="font-semibold">Total: ₹{order.total_amount}</div>
        </div>
      ))}
    </div>
  );
}

export default OrderHistoryPage;
