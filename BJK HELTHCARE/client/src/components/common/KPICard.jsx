import React from 'react';

export const KPICard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'teal',
  onClick,
  isLoading = false
}) => {
  const colorMap = {
    teal: {
      bg: 'bg-emerald-50',
      iconBg: 'bg-emerald-500/10 text-bjk-teal',
      border: 'hover:border-bjk-teal/40'
    },
    purple: {
      bg: 'bg-purple-50',
      iconBg: 'bg-bjk-purple/10 text-bjk-purple',
      border: 'hover:border-bjk-purple/40'
    },
    orange: {
      bg: 'bg-orange-50',
      iconBg: 'bg-bjk-orange/10 text-bjk-orange',
      border: 'hover:border-bjk-orange/40'
    },
    cyan: {
      bg: 'bg-cyan-50',
      iconBg: 'bg-bjk-cyan/10 text-bjk-cyan',
      border: 'hover:border-bjk-cyan/40'
    },
    rose: {
      bg: 'bg-rose-50',
      iconBg: 'bg-rose-500/10 text-rose-500',
      border: 'hover:border-rose-500/40'
    }
  };

  const scheme = colorMap[color] || colorMap.teal;

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm animate-pulse">
        <div className="flex justify-between items-center mb-3">
          <div className="h-3 w-24 bg-slate-200 rounded"></div>
          <div className="h-8 w-8 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="h-7 w-16 bg-slate-200 rounded mb-2"></div>
        <div className="h-2 w-32 bg-slate-100 rounded"></div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm transition-all duration-200 bjk-card-glow ${scheme.border} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${scheme.iconBg}`}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {value !== undefined && value !== null ? value : '--'}
        </span>
        {trend && (
          <span
            className={`text-xs font-semibold ${
              trend.isPositive ? 'text-emerald-600' : 'text-rose-500'
            }`}
          >
            {trend.isPositive ? '+' : ''}{trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-400 font-medium truncate">{subtitle}</p>
      )}
    </div>
  );
};
