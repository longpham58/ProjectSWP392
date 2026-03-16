import React from 'react';

type HrBrandProps = {
  variant?: 'header' | 'sidebar';
};

export const HrBrand: React.FC<HrBrandProps> = ({ variant = 'header' }) => {
  return (
    <div className={`hr-brand hr-brand--${variant}`}>
      <span className="hr-brand-text">ITMSHR Portal</span>
    </div>
  );
};

export const Header: React.FC = () => {
  return (
    <header className="hr-header">
      <div className="hr-header-inner">
        <HrBrand variant="header" />
      </div>
    </header>
  );
};

