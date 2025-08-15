'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface PromotionalBannerProps {
  title?: string;
  subtitle?: string;
  discount?: string;
  image?: string;
  backgroundColor?: string;
}

export function PromotionalBanner({ 
  title = "Most Popular Plant",
  subtitle = "Check out the collections for the most popular plants to place in your space.",
  discount = "30% OFF",
  image = "🌱",
  backgroundColor = "bg-emerald-800"
}: PromotionalBannerProps) {
  return (
    <div className={`relative overflow-hidden rounded-3xl ${backgroundColor} p-6 mx-4 my-4`}>
      {/* Content */}
      <div className="relative z-10 flex justify-between items-center">
        <div className="flex-1">
          <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 mb-3">
            <span className="text-white font-semibold text-sm">{discount}</span>
          </div>
          <h2 className="text-white font-bold text-xl mb-2">{title}</h2>
          <p className="text-white/90 text-sm leading-relaxed mb-4 max-w-[200px]">
            {subtitle}
          </p>
          <Button 
            variant="secondary" 
            size="sm" 
            className="bg-white text-emerald-800 hover:bg-white/90 rounded-full font-semibold"
          >
            Shop Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        {/* Plant illustration */}
        <div className="flex-shrink-0 ml-4">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
            <div className="text-4xl">{image}</div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8"></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-4 -translate-x-4"></div>
    </div>
  );
}
