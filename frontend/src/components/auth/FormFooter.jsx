import { useAuth } from './AuthLayout';

const FormFooter = ({ secondaryAction, secondaryText, links = [] }) => {
  const { openLegal } = useAuth();

  return (
    <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col items-center space-y-4">
      <p className="text-xs font-medium text-slate-500">
        {secondaryText}{' '}
        <Link 
          to={secondaryAction.to} 
          className="text-slate-900 font-bold hover:underline decoration-1 underline-offset-4"
        >
          {secondaryAction.text}
        </Link>
      </p>
      
      {links.length > 0 && (
        <div className="flex items-center space-x-6">
          {links.map((link) => (
            <button 
              key={link.text}
              type="button"
              onClick={() => link.to === '#' ? openLegal(link.text, link.type) : null}
              className="text-[9px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-[0.15em]"
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
