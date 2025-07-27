import React, { useContext } from "react";
import { CartContext } from "../contexts/CartContext";
import { AuthContext } from "../contexts/AuthContext";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe("pk_test_51RncV5QSfKki0XFKSs4jDCOZ0TIGcCew8QhbnGvr0MQCP0h7EtwpV94FjgHN9bUVgjMH4GANvsqgo7EvbJy8zoUM00H47tJoGP");

function CheckoutPage() {
  const { cart, clearCart } = useContext(CartContext);
  const { jwt } = useContext(AuthContext);

  const handleCheckout = async () => {
    try {
      const res = await fetch("/api/create-checkout-session/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ cart }),
      });

      const data = await res.json();

      if (data.id) {
        const stripe = await stripePromise;
        stripe.redirectToCheckout({ sessionId: data.id });
      } else {
        alert("Checkout failed.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (cart.length === 0) return <div className="text-center mt-10">Cart is empty.</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow mt-6">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>
      <ul>
        {cart.map(item => (
          <li className="border-b py-2" key={item.product.id}>
            {item.product.name} × {item.quantity} — ₹{(item.product.price * item.quantity).toFixed(2)}
          </li>
        ))}
      </ul>
      <button
        className="bg-green-600 text-white mt-6 px-4 py-2 rounded"
        onClick={handleCheckout}
      >
        Pay Now
      </button>
    </div>
  );
}

export default CheckoutPage;
