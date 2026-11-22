import React from 'react';

export const CategoryPill = ({ category, isSelected, onClick }) => {
  return (
    <button
      onClick={() => onClick(category.slug)}
      className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 border ${
        isSelected
          ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/20'
          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
      }`}
    >
      {category.image && (
        <img
          src={category.image}
          alt={category.name}
          className="w-5 h-5 rounded-full object-cover shrink-0"
        />
      )}
      <span>{category.name}</span>
      {category.productCount !== undefined && (
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
            isSelected ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {category.productCount}
        </span>
      )}
    </button>
  );
};
