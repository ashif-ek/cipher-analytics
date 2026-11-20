import React from 'react';

const Card = ({ children, className = '', hover = false }) => {
  return (
    <div className={`bg-white rounded-md border border-slate-200/90 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] ${hover ? 'transition-all duration-150 hover:border-slate-300 hover:shadow-[0_2px_8px_-2px_rgba(15,23,42,0.08)]' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
