import React, { useContext } from "react";
import { CartContext } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";

function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-6">
      <h2 className="text-2xl mb-4 font-bold">Your Cart</h2>
      {cart.length === 0 ? (
        <div>Your cart is empty.</div>
      ) : (
        <div>
          <ul>
            {cart.map(item => (
              <li className="flex items-center py-2 border-b" key={item.product.id}>
                <img src={item.product.image_url} alt={item.product.name} className="h-12 w-12 object-contain mr-3" />
                <div className="flex-1">{item.product.name}</div>
                <input
                  className="w-16 text-right border rounded mx-2"
                  type="number"
                  value={item.quantity}
                  min="1"
                  onChange={e => updateQuantity(item.product.id, parseInt(e.target.value, 10))}
                />
                <div>₹{(item.product.price * item.quantity).toFixed(2)}</div>
                <button
                  className="ml-2 text-red-500"
                  onClick={() => removeFromCart(item.product.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="font-bold mt-4">Total: ₹{total.toFixed(2)}</div>
          <div className="mt-4 flex">
            <button className="bg-gray-300 px-4 py-2 rounded mr-2" onClick={clearCart}>
              Clear Cart
            </button>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={() => navigate("/checkout")}
            >
              Go to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
