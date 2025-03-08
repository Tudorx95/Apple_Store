import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../assets/css/ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    sortBy: 'name',
    sortOrder: 'asc',
    showOutOfStock: false,
    cpu: [],
    gpu: [],
    material: [],
    screenSize: [],
    promotion: false,
    model: []
  });

  // Access current location
  const location = useLocation();

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const pageType = location.pathname.split('/')[1];
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/products/${pageType}`);
        const data = await response.json();
      
        if (!Array.isArray(data)) {
          throw new Error("Fetched data is not an array");
        }
        
        setProducts(data);
        setFilteredProducts(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch products');
        setLoading(false);
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
  }, [location]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];

     // Get the model query from the URL
     const searchParams = new URLSearchParams(location.search);
     const modelSearch = searchParams.get('model');
 
     // If a model is provided, filter the products
     if (modelSearch) {
       result = result.filter(product =>
         product.model.toLowerCase().includes(modelSearch.toLowerCase())
       );
     }

    // Filter by model
    if (filters.model.length > 0) {
      result = result.filter(product => filters.model.includes(product.model));
    }
    
    // Filter by in-stock status
    if (!filters.showOutOfStock) {
      result = result.filter(product => product.in_stock);
    }

    // Filter by CPU
    if (filters.cpu.length > 0) {
      result = result.filter(product => filters.cpu.includes(product.CPU));
    }

    // Filter by GPU
    if (filters.gpu.length > 0) {
      result = result.filter(product => filters.gpu.includes(product.GPU));
    }

    // Filter by material
    if (filters.material.length > 0) {
      result = result.filter(product => filters.material.includes(product.material));
    }

    // Filter by screen size (from display_specs)
    if (filters.screenSize.length > 0) {
      result = result.filter(product => {
        const displaySize = product.display_specs.match(/\d+(\.\d+)?/); // Extract number from display_specs
        return displaySize && filters.screenSize.includes(displaySize[0]);
      });
    }

    // Filter by promotion display
    if (filters.promotion) {
      result = result.filter(product => product.promotion_display);
    }

    // Sort results
    result.sort((a, b) => {
      if (filters.sortBy === 'name') {
        return filters.sortOrder === 'asc' 
          ? a.model.localeCompare(b.model) 
          : b.model.localeCompare(a.model);
      } else if (filters.sortBy === 'price') {
        return filters.sortOrder === 'asc' 
        ? parseFloat(a.price) - parseFloat(b.price)
        : parseFloat(b.price) - parseFloat(a.price);
      } else if (filters.sortBy === 'date') {
        return filters.sortOrder === 'asc' 
          ? new Date(a.production_date) - new Date(b.production_date) 
          : new Date(b.production_date) - new Date(a.production_date);
      }
      return 0;
    });

    setFilteredProducts(result);
  }, [filters, products]);

  // Extract unique values for filter options
  const getUniqueValues = (field) => {
    if (!Array.isArray(products)) return [];

  if (field === 'screenSize') {
    const sizes = products
      .map(product => {
        const match = product.display_specs?.match(/\d+(\.\d+)?/); 
        return match ? match[0] : null;
      })
      .filter(Boolean);
    return [...new Set(sizes)];
  }
  
  const values = products.map(product => product[field]).filter(Boolean);
  return [...new Set(values)];
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {

      if (typeof prev[filterType] === "boolean") {
        // Handle boolean filters
        return { ...prev, [filterType]: value };
      } // else handler the list/array items
      else if (Array.isArray(prev[filterType])) {

      let updatedArray = [...prev[filterType]];
  
      if (updatedArray.includes(value)) {
        updatedArray = updatedArray.filter(item => item !== value);
      } else {
        updatedArray.push(value);
      }
  
      return { ...prev, [filterType]: updatedArray };
    }
    else {
      return { ...prev, [filterType]: value };
    }
    });
  };
  

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="macbook-page">
      <div className="product-sidebar">
        <h3>Filters</h3>

        <div className="filter-section">
          <h4>Model</h4>
          {getUniqueValues('model').map(model => (
            <label key={model} className="filter-option">
              <input 
                type="checkbox" 
                checked={filters.model.includes(model)}
                onChange={() => handleFilterChange('model', model)}
              />
              {model}
            </label>
          ))}
        </div>

        <div className="filter-section">
          <h4>CPU</h4>
          {getUniqueValues('CPU').map(cpu => (
            <label key={cpu} className="filter-option">
              <input 
                type="checkbox" 
                checked={filters.cpu.includes(cpu)}
                onChange={() => handleFilterChange('cpu', cpu)}
              />
              {cpu}
            </label>
          ))}
        </div>

        <div className="filter-section">
          <h4>GPU</h4>
          {getUniqueValues('GPU').map(gpu => (
            <label key={gpu} className="filter-option">
              <input 
                type="checkbox" 
                checked={filters.gpu.includes(gpu)}
                onChange={() => handleFilterChange('gpu', gpu)}
              />
              {gpu}
            </label>
          ))}
        </div>

        <div className="filter-section">
          <h4>Material</h4>
          {getUniqueValues('material').map(material => (
            <label key={material} className="filter-option">
              <input 
                type="checkbox" 
                checked={filters.material.includes(material)}
                onChange={() => handleFilterChange('material', material)}
              />
              {material}
            </label>
          ))}
        </div>

        <div className="filter-section">
          <h4>Screen Size</h4>
          {getUniqueValues('screenSize').map(size => (
            <label key={size} className="filter-option">
              <input 
                type="checkbox" 
                checked={filters.screenSize.includes(size)}
                onChange={() => handleFilterChange('screenSize', size)}
              />
              {size}"
            </label>
          ))}
        </div>

        <div className="filter-section">
          <h4>Display</h4>
          <label className="filter-option">
            <input 
              type="checkbox" 
              checked={filters.promotion}
              onChange={() => handleFilterChange('promotion', !filters.promotion)}
            />
            ProMotion Display
          </label>
        </div>

        <button 
          className="clear-filters-btn"
          onClick={() => setFilters({
            sortBy: 'name',
            sortOrder: 'asc',
            showOutOfStock: false,
            cpu: [],
            gpu: [],
            material: [],
            screenSize: [],
            promotion: false,
            model: []
          })}
        >
        Clear Filters
      </button>
      </div>

      <div className="product-content">
        <h1>MacBook</h1>
        
        <div className="filter-controls">
          <div className="sort-controls">
            <label>
              Sort by:
              <select 
                value={filters.sortBy} 
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="date">Production Date</option>
              </select>
            </label>
            
            <label>
              Order:
              <select 
                value={filters.sortOrder} 
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </label>
          </div>
          
          <label className="stock-filter">
            <input 
              type="checkbox" 
              checked={filters.showOutOfStock}
              onChange={() => handleFilterChange('showOutOfStock', !filters.showOutOfStock)}
            />
            Show out of stock products
          </label>
        </div>
        
        <div className="product-grid">
          {filteredProducts.length === 0 ? (
            <p className="no-products">No products match your filters.</p>
          ) : (
            filteredProducts.map(product => (
              <div 
                key={product.ID} 
                className={`product-card ${!product.in_stock ? 'out-of-stock' : ''}`}
              >
                <div className="product-image">
                <img src={`/images/${product.image_url}`} alt={product.model} />
                  {!product.in_stock && <span className="out-of-stock-label">Out of Stock</span>}
                </div>
                <div className="product-info">
                  <h3>{product.model}</h3>
                  <p className="product-color">Color: {product.color}</p>
                  <p className="product-specs">
                    {product.specs.CPU} • {product.specs.GPU} • {product.capacity}
                  </p>
                  <p className="product-price">${Number(product.price).toFixed(2)}</p>
                  <button className="details-button">Details</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;