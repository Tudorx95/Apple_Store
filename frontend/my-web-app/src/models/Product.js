import React from 'react';
import { Link } from 'react-router-dom';

const Product = ({ name, imageUrl, link }) => {
  return (
    <div className="carousel-item">
      <Link to={link}>
        <img src={`/images/${imageUrl}`} alt={name} />
      </Link>
      <div className='product-text'>
        <span>Explore</span>
      </div>
    </div>
  );
};

export default Product;
