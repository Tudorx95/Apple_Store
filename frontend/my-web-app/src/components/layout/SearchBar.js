import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/SearchBar.css";
import searchIcon from "../../assets/searchLoop.png";
import closeIcon from "../../assets/close_icon.png"; // Add your close button image

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [models, setModels] = useState([]); // State to store product models
  const [isLoading, setIsLoading] = useState(false);
  const [noResults, setNoResults] = useState(false); // State for no results message
  const [filteredModels, setFilteredModels] = useState([]); 
  const navigate = useNavigate();

  // Toggles the search bar open/closed
  const toggleSearch = () => setIsOpen(!isOpen);

  // Fetch product models from the backend
  const fetchProductModels = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/products/models"); // Adjust this URL based on your API
      const data = await response.json();
      setModels(data); // Assuming the data is an array of product models
    } catch (error) {
      console.error("Error fetching models:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handles search logic
  const handleSearch = (e) => {
    e.preventDefault(); // Prevents the default form submission

    const searchQuery = searchTerm.trim().toLowerCase();

    if (!searchQuery) return; // Ignore empty search

    // Look for a matching product model in the fetched models
    const matchedProduct = models.find((product) =>
      product.model.toLowerCase().includes(searchQuery)
    );

    if (matchedProduct) {    
      setNoResults(false); 
      navigate(`/${matchedProduct.device_type}?model=${matchedProduct.model}`);
    } else {
      setNoResults(true); 
    }
  };


  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (query.length >= 3) { // Start searching after 3 characters
      fetchProductModels();
      setNoResults(false);

      // Filter models based on the search term
      const filtered = models.filter((product) =>
        product.model.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredModels(filtered); // Update the filtered models
    } else {
      setFilteredModels([]); // Clear the filtered models if the search term is empty or too short
    }
  };

  const handleSuggestionClick = (model) => {
    setSearchTerm(""); // Set searchTerm to the selected model
    setFilteredModels([]); // Clear suggestions
    setNoResults(false); // Hide "No results found" message
    navigate(`/${model.device_type}?model=${model.model}`); // Navigate to the matched product
  };

   // Close the search bar when ESC is pressed
   useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false); // Close the search bar
      }
    };

    // Add the event listener for ESC key
    document.addEventListener("keydown", handleEscape);

    // Cleanup the event listener when the component is unmounted
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="search-bar-container">
      {isOpen ? (
        <div className="search-overlay">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              className="search-input"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleInputChange}
              autoFocus
            />
           
          </form>
          <button className="search-btn" onClick={handleSearch}>Search</button>
          <button className="close-btn" onClick={toggleSearch}>
            <img src={closeIcon} alt="Close" />
          </button>

          {filteredModels.length > 0 && (
            <div className="suggestions-list">
              {filteredModels.map((product) => (
                <div
                  key={product.ID}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(product)} // Set the search term to the clicked model
                >
                  {product.model}
                </div>
              ))}
            </div>
          )}

          {/* Add the No Results Message here */}
          {noResults && (
            <div className="no-results-message">
              No results found
            </div>
          )}
        </div>
      ) : (
        <button className="search-icon-btn" onClick={toggleSearch}>
          <img src={searchIcon} alt="Search" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
