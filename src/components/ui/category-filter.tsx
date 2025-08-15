'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  showSeeAll?: boolean;
  onSeeAll?: () => void;
}

export function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategoryChange,
  showSeeAll = true,
  onSeeAll
}: CategoryFilterProps) {
  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-gray-900">Category</h3>
        {showSeeAll && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onSeeAll}
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            See All
          </Button>
        )}
      </div>
      
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(category)}
              className={`
                rounded-full px-4 py-2 font-medium whitespace-nowrap
                ${selectedCategory === category 
                  ? 'bg-emerald-800 text-white hover:bg-emerald-700' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              {category}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}
