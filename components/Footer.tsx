
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-100 py-3 px-6 flex flex-col md:flex-row items-center justify-between text-[11px] font-bold text-slate-400 no-print">
      <div className="flex items-center gap-1">
        <span>© جميع حقوق النشر والطبع محفوظة لمستشفى الرازي 2026</span>
        <span className="text-medical-blue">© Copyright.</span>
      </div>
      
      <div className="mt-2 md:mt-0">
        تطوير 
        <a 
          href="https://alzozos.youware.app" 
          target="_blank" 
          rel="noopener noreferrer"
          className="mx-1 text-medical-darkBlue hover:text-medical-blue transition-colors underline decoration-dotted"
        >
          Alzoz OS
        </a>
      </div>
    </footer>
  );
};

export default Footer;
