// Switch.jsx
import React, { useState } from 'react';

const Switch = ({ onChange, defaultChecked = false }) => {
  const [checked, setChecked] = useState(defaultChecked);

  const handleToggle = () => {
    const newChecked = !checked;
    setChecked(newChecked);
    if (onChange) {
      onChange(newChecked);
    }
  };

  return (
    <div 
      onClick={handleToggle}
      style={{
        width: '50px',
        height: '24px',
        backgroundColor: checked ? '#4CAF50' : '#ccc',
        borderRadius: '12px',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
      }}
    >
      <div
        style={{
          width: '20px',
          height: '20px',
          backgroundColor: 'white',
          borderRadius: '50%',
          position: 'absolute',
          top: '2px',
          left: checked ? '28px' : '2px',
          transition: 'left 0.3s',
        }}
      />
    </div>
  );
};

export default Switch;