import React from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  variant?: 'blue' | 'green' | 'amber' | 'red' | 'gray';
  className?: string;
}

const variantClasses = {
  blue: 'ui-stat-icon--blue',
  green: 'ui-stat-icon--green',
  amber: 'ui-stat-icon--amber',
  red: 'ui-stat-icon--red',
  gray: 'ui-stat-icon--gray',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  variant = 'gray',
  className = '',
}) => (
  <div className={`ui-stat-card ${className}`}>
    {icon != null && (
      <div className={`ui-stat-icon ${variantClasses[variant]}`}>{icon}</div>
    )}
    <div className="ui-stat-meta">
      <div className="ui-stat-value">{value}</div>
      <div className="ui-stat-label">{title}</div>
    </div>
  </div>
);
