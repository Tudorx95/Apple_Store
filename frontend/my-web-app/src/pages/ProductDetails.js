import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../assets/css/ProductDetails.css';
import { useProduct } from '../models/ProductContext';

const ProductDetails = () => {
  const { productId } = useParams();
  const { selectedProduct, setSelectedProduct } = useProduct();
  const [isProductLoaded, setIsProductLoaded] = useState(false);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMoreImages, setShowMoreImages] = useState(false);
  const [isImageEnlarged, setIsImageEnlarged] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(null);

  useEffect(() => {
    if (selectedProduct) {
      setIsProductLoaded(true);
      fetchAdditionalImages(selectedProduct.ID, selectedProduct.device_type);
    }
  }, [selectedProduct]);

  const fetchAdditionalImages = async (productId, device_type) => {
    try {
      const response = await fetch(`/products/images/${device_type}/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setAdditionalImages(data);
      } else {
        console.error('Failed to fetch images:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching additional images:', error);
    }
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === additionalImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleAddToCart = () => {
    alert(`${selectedProduct.model} added to cart!`);
  };

  const openEnlargedImage = (img) => {
    setEnlargedImage(img);
    setIsImageEnlarged(true);
  };

  const closeEnlargedImage = () => {
    setIsImageEnlarged(false);
    setEnlargedImage(null);
  };

  if (!isProductLoaded) {
    return <div className="error">Product not found. Please navigate from the product list.</div>;
  }

  return (
    <div className="product-details-container">
      <div className="product-details-content">
        <div className="product-main-image">
          <img
            src={`/images/${selectedProduct.image_url}`}
            alt={selectedProduct.model}
          />
        </div>

        <div className="product-details-info">
          <h1 className="product-title">{selectedProduct.model}</h1>
          <p className="product-color">Color: {selectedProduct.color}</p>
          <p className="product-capacity">Capacity: {selectedProduct.capacity}</p>
          <p className="product-cpu">CPU: {selectedProduct.CPU}</p>
          {selectedProduct.GPU && (
            <p className="product-gpu">GPU: {selectedProduct.GPU}</p>
          )}
          <p className="product-price-main">${Number(selectedProduct.price).toFixed(2)}</p>
          <p className="product-description">{selectedProduct.description}</p>
          <button className="add-to-cart-button" onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>
      </div>

      <div className="additional-images-section">
        <h2>Product Gallery</h2>
        <div className="current-additional-image">
          {additionalImages.length > 0 && (
            <img
              src={additionalImages[0]}
              alt={`${selectedProduct.model} view 1`}
              onClick={() => openEnlargedImage(additionalImages[0])}
            />
          )}
        </div>
        {additionalImages.length > 1 && (
          <button className="view-more-images" onClick={() => setShowMoreImages(!showMoreImages)}>
            {showMoreImages ? 'Hide Images' : 'View More Images'}
          </button>
        )}

        {showMoreImages && (
          <div className="additional-images-gallery">
            {additionalImages.map((img, index) => (
              <div
                key={index}
                className={`gallery-image ${currentImageIndex === index ? 'active' : ''}`}
                onClick={() => openEnlargedImage(img)}
              >
                <img src={img} alt={`${selectedProduct.model} view ${index + 1}`} />
              </div>
            ))}
          </div>
        )}
      </div>

      {isImageEnlarged && (
        <div className="image-enlarged-overlay" onClick={closeEnlargedImage}>
          <div className="enlarged-image-container">
            <img src={enlargedImage} alt="Enlarged view" />
          </div>
        </div>
      )}

      <div className="sticky-bottom-nav">
        <div className="sticky-price">${Number(selectedProduct.price).toFixed(2)}</div>
        <button className="sticky-add-to-cart" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;
