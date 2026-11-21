import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthLayout';

const FormFooter = ({ secondaryAction, secondaryText, links = [] }) => {
  const { openLegal } = useAuth();

  return (
    <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center space-y-3.5">
      {secondaryText && secondaryAction && (
        <p className="text-xs text-slate-600">
          {secondaryText}{' '}
          <Link 
            to={secondaryAction.to} 
            className="text-slate-900 font-semibold hover:underline underline-offset-4 decoration-slate-400"
          >
            {secondaryAction.text}
          </Link>
        </p>
      )}
      
      {links.length > 0 && (
        <div className="flex items-center space-x-5 text-[11px] font-mono text-slate-400">
          {links.map((link) => (
            <button 
              key={link.text}
              type="button"
              onClick={() => link.to === '#' ? openLegal(link.text, link.type) : null}
              className="hover:text-slate-700 transition-colors cursor-pointer"
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
