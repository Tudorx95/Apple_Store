const React = require('react');
const { Html } = require('@react-email/components');

const Email = ({ url }) => {
  return React.createElement(
    Html,
    null,
    React.createElement('body', null, 
      React.createElement('h1', null, 'Password Reset Request'),
      React.createElement('p', null, 'Click the link below to reset your password:'),
      React.createElement('a', { href: url }, url)
    )
  );
};

module.exports = { Email };
