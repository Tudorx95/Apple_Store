import { createContext, useContext, useState, useEffect } from 'react';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductLoaded, setIsProductLoaded] = useState(false);

  useEffect(() => {
    const loadProductFromStorage = () => {
      const savedProduct = localStorage.getItem("selectedProduct");
      if (savedProduct) {
        try {
          setSelectedProduct(JSON.parse(savedProduct));
        } catch (error) {
          console.error("Error parsing product from localStorage:", error);
        }
      }
      setIsProductLoaded(true);
    };
    loadProductFromStorage();
  }, []);

  useEffect(() => {
    if (isProductLoaded && selectedProduct) {
      localStorage.setItem("selectedProduct", JSON.stringify(selectedProduct));
    }
  }, [selectedProduct, isProductLoaded]);

  const clearSelectedProduct = () => {
    localStorage.removeItem("selectedProduct");
    setSelectedProduct(null);
  };

  return (
    <ProductContext.Provider value={{
      selectedProduct,
      setSelectedProduct,
      clearSelectedProduct,
      isProductLoaded
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => useContext(ProductContext);
