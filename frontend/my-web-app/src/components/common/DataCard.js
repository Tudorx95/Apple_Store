import React from 'react';
import '../../assets/css/DataCard.css';

const DataCard = ({ title, description, imageUrl }) => {
  return (
    <div className="data-card">
      {imageUrl && <img src={imageUrl} alt={title} className="card-image" />}
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
        <button className="card-button">View Details</button>
      </div>
    </div>
  );
};

export default DataCard;