'use client';

import { useState } from 'react';
import { Heart, Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category?: string;
  isInStock?: boolean;
  onAddToCart?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  category,
  isInStock = true,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false
}: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!onAddToCart || !isInStock) return;
    
    setIsLoading(true);
    try {
      await onAddToCart(id);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Card className="group relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300">
      <CardContent className="p-0">
        {/* Image Container */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 bg-white/80 hover:bg-white rounded-full shadow-sm"
            onClick={() => onToggleFavorite?.(id)}
          >
            <Heart 
              className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
            />
          </Button>

          {/* Stock status */}
          {!isInStock && (
            <Badge 
              variant="secondary" 
              className="absolute top-2 left-2 bg-gray-800 text-white"
            >
              Out of Stock
            </Badge>
          )}

          {/* Sale badge */}
          {originalPrice && originalPrice > price && (
            <Badge 
              variant="destructive" 
              className="absolute top-2 left-2 bg-red-500"
            >
              Sale
            </Badge>
          )}

          {/* Add to Cart Button */}
          <Button
            size="icon"
            onClick={handleAddToCart}
            disabled={!isInStock || isLoading}
            className="absolute bottom-2 right-2 h-8 w-8 bg-emerald-800 hover:bg-emerald-700 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Plus className="h-4 w-4 text-white" />
            )}
          </Button>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {category && (
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {category}
            </p>
          )}
          
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {name}
          </h3>
          
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-800 text-lg">
              {formatPrice(price)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
