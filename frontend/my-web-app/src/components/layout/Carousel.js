import React, { useState, useEffect } from 'react';
import Product from '../../models/Product';
import '../../assets/css/Carousel.css';

const Carousel = () => {
    //console.log(process.env.REACT_APP_BACKEND_URL); // Should log http://localhost:8080
  const [products,setProducts]= useState([]);

  useEffect(() => {
    // Fetch product data from the backend
    const fetchProducts = async () => {
      try {
        console.log(`${process.env.REACT_APP_BACKEND_URL}`);
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/device-promo`); // Adjust URL if needed
        if (response.ok) {
          const data = await response.json();
          setProducts(data); // Store the fetched data in state
        } else {
          console.error('Failed to fetch products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array to fetch data once when the component mounts

//   const products = [
//     { id:1, name: 'Macbook', imageUrl: '/images/macbook-pro.jpg', link: '/macbook' },
//     { id:2, name: 'iPad', imageUrl: '/images/ipadairM2.jpg', link: '/ipad' },
//     { id:3, name: 'iPhone', imageUrl: '/images/iphone16pro.jpg', link: '/iphone' },
//     // Add more products as needed
//   ];

  return (
    <div className="carousel">
     {products.map((product) => (
        <Product
          key={product.id}
          name={product.name}
          imageUrl={product.imageUrl}
          link={product.link}
        />
      ))}
    </div>
  );
};

export default Carousel;
