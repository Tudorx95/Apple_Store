// src/components/layout/WelcomeMessage.js

import React, { useState, useEffect } from 'react';

const WelcomeMessage = () => {
  const welcome_text = "Welcome to Apple Store";
  const [message, setMessage] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // set the new message to be printed (1 ch bonus)
    const displayText = () => {
      if (index < welcome_text.length) {
        setMessage((prev) => prev + welcome_text[index]);
        setIndex(index + 1);
      }
    };

    const interval = setInterval(displayText, 80); // Adjust the interval here

    return () => clearInterval(interval); // Clean up on component unmount
  }, [index, welcome_text]);

  return (
    <div className="welcome-message">
      <h1>{message}</h1>
    </div>
  );
};

export default WelcomeMessage;
