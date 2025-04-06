// src/models/Product.js
import React from 'react';
import { Link } from 'react-router-dom';

const Product = ({ name, imageUrl, link }) => {
  return (
    <Link to={link} className="carousel-item">
      <img src={`/images/${imageUrl}`} alt={name} />
      <span className="product-text">{name}</span>
    </Link>
  );
};

export default Product;