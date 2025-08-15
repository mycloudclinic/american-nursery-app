'use client';

import { useState } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const favoriteItems = [
  {
    id: '1',
    name: 'Jade Plant',
    price: 30.00,
    originalPrice: 35.00,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
    category: 'Indoor',
    isInStock: true,
    rating: 4.5,
  },
  {
    id: '3',
    name: 'Monstera Deliciosa',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=400&h=400&fit=crop',
    category: 'Indoor',
    isInStock: true,
    rating: 4.9,
  },
  {
    id: '5',
    name: 'Fiddle Leaf Fig',
    price: 65.00,
    image: 'https://images.unsplash.com/photo-1463151251737-5c8f5ac90b1b?w=400&h=400&fit=crop',
    category: 'Indoor',
    isInStock: false,
    rating: 4.7,
  },
];

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState(favoriteItems);

  const removeFavorite = (id: string) => {
    setFavorites(favorites.filter(item => item.id !== id));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <Heart className="h-24 w-24 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
        <p className="text-muted-foreground text-center mb-6">
          Start adding plants to your favorites to see them here!
        </p>
        <Button>Browse Plants</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">My Favorites</h1>
          <Badge variant="outline">{favorites.length} plants</Badge>
        </div>
      </header>

      <div className="px-4 py-4 pb-20">
        {/* Quick Actions */}
        <div className="flex gap-2 mb-6">
          <Button variant="outline" size="sm">
            Add All to Cart
          </Button>
          <Button variant="outline" size="sm">
            Clear All
          </Button>
        </div>

        {/* Favorites Grid */}
        <div className="grid grid-cols-2 gap-4">
          {favorites.map((plant) => (
            <Card key={plant.id} className="group overflow-hidden">
              <CardContent className="p-0">
                {/* Image Container */}
                <div className="relative aspect-square bg-muted overflow-hidden">
                  <img
                    src={plant.image}
                    alt={plant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Favorite Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background rounded-full shadow-sm"
                    onClick={() => removeFavorite(plant.id)}
                  >
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  </Button>

                  {/* Sale badge */}
                  {plant.originalPrice && plant.originalPrice > plant.price && (
                    <Badge variant="destructive" className="absolute top-2 left-2">
                      Sale
                    </Badge>
                  )}

                  {/* Stock status */}
                  {!plant.isInStock && (
                    <Badge variant="secondary" className="absolute bottom-2 left-2">
                      Out of Stock
                    </Badge>
                  )}

                  {/* Add to Cart Button */}
                  <Button
                    size="icon"
                    className="absolute bottom-2 right-2 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    disabled={!plant.isInStock}
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    {plant.category}
                  </p>
                  
                  <h3 className="font-semibold mb-2 line-clamp-2">
                    {plant.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-xs ${
                            i < Math.floor(plant.rating) ? 'text-yellow-400' : 'text-gray-200'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {plant.rating}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary text-lg">
                      {formatPrice(plant.price)}
                    </span>
                    {plant.originalPrice && plant.originalPrice > plant.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(plant.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recently Viewed */}
        <div className="mt-8">
          <h3 className="font-semibold mb-4">You might also like</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Add similar recommended plants here */}
          </div>
        </div>
      </div>
    </div>
  );
}
