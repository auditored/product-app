import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';

function Button({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

function List({ onProductSelect }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redux state'i kullan
  const { totalQuantity } = useSelector(state => state.cart);

  useEffect(() => {
    fetch('https://fakestoreapi.com/products')
      .then(response => response.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64">Loading products...</div>;

  return (
    <div className="container mx-auto px-4 py-8">


      <h3 className="text-3xl font-bold text-center mb-8">Products</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col"
          >
            <div className="w-full h-64 bg-gray-100 flex items-center justify-center p-4">
              <img
                src={product.image}
                alt={product.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <h4 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2 flex-1">
                {product.title}
              </h4>

              <p className="text-xs text-gray-500 mb-2 capitalize">
                {product.category}
              </p>

              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-gray-900">
                  ${product.price}
                </span>
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-1">⭐</span>
                  <span className="text-sm text-gray-600">
                    {product.rating?.rate || 'N/A'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onProductSelect(product.id)}
                className="w-full bg-gray-800 text-white py-2 px-4 rounded hover:bg-amber-600 transition-colors duration-300"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Detail({ productId, onBackToList }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  // Redux hooks
  const dispatch = useDispatch();
  const { items, totalQuantity, totalPrice } = useSelector(state => state.cart);

  // Mevcut üründen kaç tane sepette var kontrol et
  const currentProductInCart = items.find(item => item.id === productId);
  const quantityInCart = currentProductInCart ? currentProductInCart.quantity : 0;

  useEffect(() => {
    if (productId) {
      fetch(`https://fakestoreapi.com/products/${productId}`)
        .then(response => response.json())
        .then(data => {
          setProduct(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [productId]);

  const addToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      // Host'tan cart action'ını import et
      const { addToCart } = await import('host_app/cartActions');

      // Redux store'a ekle
      dispatch(addToCart({
        id: product.id,
        name: product.title,
        price: product.price,
        image: product.image
      }));

    } catch (error) {
      console.error('Error adding to cart:', error);
      // Fallback: localStorage'a kaydet
      const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const updatedCart = [...storedCart, {
        id: product.id,
        name: product.title,
        price: product.price,
        image: product.image
      }];
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    } finally {
      setAddingToCart(false);
    }
  };

  const removeFromCart = async () => {
    if (!product) return;

    try {
      const { removeFromCart } = await import('host_app/cartActions');
      dispatch(removeFromCart(product.id));
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading product details...</div>;
  if (!product) return <div className="text-center text-red-500">Product not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={onBackToList}
        className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
      >
        ← Back to Products
      </button>



      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 bg-gray-100 flex items-center justify-center p-8">
            <img
              src={product.image}
              alt={product.title}
              className="max-w-full max-h-96 object-contain"
            />
          </div>

          <div className="md:w-1/2 p-8">
            <div className="mb-4">
              <span className="inline-block bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm capitalize">
                {product.category}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {product.title}
            </h1>

            <p className="text-gray-600 mb-6 leading-relaxed">
              {product.description}
            </p>

            <div className="flex items-center mb-6">
              <span className="text-3xl font-bold text-gray-900 mr-4">
                ${product.price}
              </span>
              {product.rating && (
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-1">⭐</span>
                  <span className="text-gray-600">
                    {product.rating.rate} ({product.rating.count} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Cart Actions */}
            <div className="flex gap-4">
              <Button
                onClick={addToCart}
                className="flex-1 md:flex-none"
                disabled={addingToCart}
              >
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </Button>

              {quantityInCart > 0 && (
                <button
                  onClick={removeFromCart}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Remove from Cart
                </button>
              )}
            </div>

            {quantityInCart > 0 && (
              <p className="mt-3 text-sm text-green-600">
                ✓ {quantityInCart} of this item in your cart
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductApp() {
  const [currentView, setCurrentView] = useState('list');
  const [selectedProductId, setSelectedProductId] = useState(null);

  const handleProductSelect = (productId) => {
    setSelectedProductId(productId);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedProductId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'list' ? (
        <List onProductSelect={handleProductSelect} />
      ) : (
        <Detail
          productId={selectedProductId}
          onBackToList={handleBackToList}
        />
      )}
    </div>
  );
}