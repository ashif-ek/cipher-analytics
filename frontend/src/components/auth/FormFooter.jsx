import React from 'react';
import { Link } from 'react-router-dom';

const FormFooter = ({ secondaryAction, secondaryText, links = [], onLinkClick }) => {
  return (
    <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col items-center space-y-6">
      <p className="text-sm font-medium text-slate-500">
        {secondaryText}{' '}
        <Link 
          to={secondaryAction.to} 
          className="text-slate-900 font-semibold hover:underline decoration-2 underline-offset-4"
        >
          {secondaryAction.text}
        </Link>
      </p>
      
      {links.length > 0 && (
        <div className="flex items-center space-x-6">
          {links.map((link) => (
            <button 
              key={link.text}
              onClick={() => link.to === '#' && onLinkClick ? onLinkClick(link.text, link.type) : null}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
            >
              {link.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormFooter;
