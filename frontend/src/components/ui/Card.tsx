import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, title, className = '' }) => (
  <div className={`ui-card ${className}`}>
    {title != null && <h3 className="ui-card-title">{title}</h3>}
    {children}
  </div>
);
