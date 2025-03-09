import { createContext, useContext, useState, useEffect } from 'react';
import { encryptData, decryptData } from '../components/common/Cryptography';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductLoaded, setIsProductLoaded] = useState(false); // Track if product is loaded after decryption

  useEffect(() => {
    const loadProductFromStorage = async () => {
      const savedProduct = sessionStorage.getItem("selectedProduct");
      if (savedProduct) {
        const { encryptedData, iv } = JSON.parse(savedProduct);
        try {
          const decryptedProduct = await decryptData(encryptedData, iv);  // Decrypt product data
          setSelectedProduct(decryptedProduct);
          setIsProductLoaded(true);
        } catch (error) {
          console.error("Error decrypting product:", error);
          setIsProductLoaded(true); // Avoid being stuck loading if decryption fails
        }
      } else {
        setIsProductLoaded(true); // No product to load, set as loaded
      }
    };

    loadProductFromStorage();
  }, []);

  // Save product to sessionStorage when selectedProduct changes
  useEffect(() => {
    const storeProduct = async () => {
      if (selectedProduct) {
        const { encryptedData, iv } = await encryptData(selectedProduct); // Encrypt product data
        sessionStorage.setItem("selectedProduct", JSON.stringify({ encryptedData, iv }));
      }
    };
    if (isProductLoaded && selectedProduct) {
      storeProduct();
    }
  }, [selectedProduct, isProductLoaded]);

  const clearSelectedProduct = () => {
    sessionStorage.removeItem("selectedProduct");
    setSelectedProduct(null);
  };

  return (
    <ProductContext.Provider value={{
      selectedProduct,
      setSelectedProduct,
      clearSelectedProduct,
      isProductLoaded // Passing loading state as well
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => useContext(ProductContext);
