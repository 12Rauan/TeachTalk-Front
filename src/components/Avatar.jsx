// Avatar.jsx
import React from 'react';

const Avatar = ({ src, alt, size = 40 }) => {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        objectFit: 'cover',
      }}
    />
  );
};

export default Avatar;