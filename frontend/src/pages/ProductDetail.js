import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CartContext } from "../contexts/CartContext";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${id}/`)
      .then(res => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    navigate("/cart");
  };

  if (loading) return <div className="mt-10 text-center">Loading product...</div>;
  if (error) return <div className="mt-10 text-center text-red-600">{error}</div>;
  if (!product) return null;

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white shadow rounded p-6 flex flex-col sm:flex-row">
      <img
        src={product.image_url}
        alt={product.name}
        className="w-64 h-64 object-contain bg-gray-100 rounded mb-4 sm:mb-0 sm:mr-8"
      />
      <div className="flex-1 flex flex-col">
        <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
        <div className="mb-4 text-gray-600">{product.description}</div>
        <div className="text-xl font-bold mb-2">₹{product.price}</div>
        <div className="mb-2">Stock: {product.inventory_count}</div>
        <div className="flex items-center mb-4">
          <label className="mr-2">Quantity:</label>
          <input
            type="number"
            className="border rounded w-16 p-1"
            min={1}
            max={product.inventory_count}
            value={quantity}
            onChange={e =>
              setQuantity(
                Math.max(
                  1,
                  Math.min(product.inventory_count, Number(e.target.value))
                )
              )
            }
          />
        </div>
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={handleAddToCart}
          disabled={product.inventory_count < 1}
        >
          {product.inventory_count < 1 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

export default ProductDetail;
