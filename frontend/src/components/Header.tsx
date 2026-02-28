import React from 'react';

export const HrBrand: React.FC<{ variant?: 'header' | 'sidebar' }> = ({ variant = 'header' }) => (
  <div className={`hr-brand hr-brand-${variant}`}>
    <div className="hr-brand-mark" aria-hidden>
      <span className="hr-brand-mark-text">IT</span>
    </div>
    <div className="hr-brand-text">
      <div className="hr-brand-name">ITMS</div>
      <div className="hr-brand-tagline">HR Training System</div>
    </div>
  </div>
);

export const Header: React.FC = () => (
  <header className="app-header">
    <HrBrand variant="header" />
  </header>
);
