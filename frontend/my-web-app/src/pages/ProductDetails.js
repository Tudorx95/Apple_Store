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
  const [configurations, setConfigurations] = useState({
    colors: [],
    capacities: [],
    cpus: [],
    gpus: [],
    unifiedmemories: []
  });
  const [selectedConfig, setSelectedConfig] = useState({
    color: '',
    capacity: '',
    cpu: '',
    gpu: '',
    unified_memories: ''
  });

  useEffect(() => {
    if (selectedProduct) {
      setIsProductLoaded(true);
      fetchAdditionalImages(selectedProduct.ID, selectedProduct.device_type);
      fetchConfigurations(selectedProduct.ID, selectedProduct.device_type);
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

  const fetchConfigurations = async (modelID, device_type) => {
    try {
      const response = await fetch(`/products/${device_type}/${modelID}`);
      if (response.ok) {
        const data = await response.json();
        setConfigurations(data);
        setSelectedConfig({
          color: data.colors[0] || '',
          capacity: data.capacities[0] || '',
          cpu: data.cpus[0] || '',
          gpu: data.gpus[0] || '',
          unified_memories: data.unifiedmemories[0] || ''
        });
      } else {
        console.error('Failed to fetch configurations:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching configurations:', error);
    }
  };

  const handleConfigChange = (e) => {
    setSelectedConfig({ ...selectedConfig, [e.target.name]: e.target.value });
  };

  const handleAddToCart = () => {
    alert(`${selectedProduct.model} (${selectedConfig.color}, ${selectedConfig.capacity}, ${selectedConfig.cpu}, ${selectedConfig.gpu}, ${selectedConfig.unified_memories}) added to cart!`);
  };

  if (!isProductLoaded) {
    return <div className="error">Product not found. Please navigate from the product list.</div>;
  }

  const openEnlargedImage = (img) => {
    setEnlargedImage(img);
    setIsImageEnlarged(true);
  };

  const closeEnlargedImage = () => {
    setIsImageEnlarged(false);
    setEnlargedImage(null);
  };


  return (
    <div className="product-details-container">
      <div className="product-details-content">
        <div className="product-main-image">
          <img src={`/images/${selectedProduct.image_url}`} alt={selectedProduct.model} />
        </div>

        <div className="product-details-info">
          <h1 className="product-title">{selectedProduct.model}</h1>
          
          <label>Color:</label>
          <select className='custom-select' name="color" value={selectedConfig.color} onChange={handleConfigChange}>
            {configurations.colors.map((color, index) => (
              <option key={index} value={color}>{color}</option>
            ))}
          </select>
          
          <label>Memory/Storage:</label>
          <select className='custom-select' name="capacity" value={selectedConfig.capacity} onChange={handleConfigChange}>
            {configurations.capacities.map((capacity, index) => (
              <option key={index} value={capacity}>{capacity}</option>
            ))}
          </select>
          
          <label>CPU:</label>
          <select className='custom-select' name="cpu" value={selectedConfig.cpu} onChange={handleConfigChange}>
            {configurations.cpus.map((cpu, index) => (
              <option key={index} value={cpu}>{cpu}</option>
            ))}
          </select>
          
          {configurations.gpus.length > 0 && (
            <>
              <label>GPU:</label>
              <select className='custom-select' name="gpu" value={selectedConfig.gpu} onChange={handleConfigChange}>
                {configurations.gpus.map((gpu, index) => (
                  <option key={index} value={gpu}>{gpu}</option>
                ))}
              </select>
            </>
          )}

          {configurations.unifiedmemories && configurations.unifiedmemories.length > 0 && (
            <>
              <label>Unified Memory:</label>
              <select className='custom-select' name="unified_memories" value={selectedConfig.unified_memories} onChange={handleConfigChange}>
                {configurations.unifiedmemories.map((unified_memories, index) => (
                  <option key={index} value={unified_memories}>{unified_memories}</option>
                ))}
              </select>
            </>
          )}
          
          <p className="product-price-main">${Number(selectedProduct.price).toFixed(2)}</p>
          <p className="product-description">{selectedProduct.description}</p>
          <button className="add-to-cart-button" onClick={handleAddToCart}>Add to Cart</button>
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
        <button className="sticky-add-to-cart" onClick={handleAddToCart}>Add to Cart</button>
      </div>
    </div>
  );
};

export default ProductDetails;
