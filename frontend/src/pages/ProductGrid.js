import React, { useEffect, useState, useContext } from "react";
import { CartContext } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";

function ProductGrid() {
  const [products, setProducts] = useState([]);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/products/")
      .then(res => res.json())
      .then(setProducts)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map(prod => (
          <div key={prod.id} className="bg-white shadow rounded p-4 flex flex-col">
            <img
              src={prod.image_url}
              alt={prod.name}
              className="w-full h-48 object-contain bg-gray-100 mb-2"
              onClick={() => navigate(`/product/${prod.id}`)}
              style={{ cursor: "pointer" }}
            />
            <h2 className="font-semibold">{prod.name}</h2>
            <p className="text-gray-500 mb-1">{prod.description.slice(0, 50)}...</p>
            <div className="font-bold mb-2">₹{prod.price}</div>
            <button
              className="bg-blue-600 text-white py-1 rounded mt-auto hover:bg-blue-700"
              onClick={() => addToCart(prod, 1)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductGrid;
