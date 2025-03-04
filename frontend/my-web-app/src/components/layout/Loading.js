// src/components/layout/Loading.js
import React from 'react';
import '../../assets/css/Loading.css'; 
import loadingImage from '../../assets/applePrivacy.gif'

const Loading = () => {
  return (
    <div className="loading-container">
      <img src={loadingImage} alt="Loading..." className="loading-image" />
    </div>
  );
}

export default Loading;
