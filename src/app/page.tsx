'use client';

import { useState } from 'react';
import { Search, ShoppingCart, Menu, Bell, Heart, Plus, Home, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';

// Sample plant data
const samplePlants = [
  {
    id: '1',
    name: 'Jade Plant',
    price: 30.00,
    originalPrice: 35.00,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
    category: 'Indoor',
    isInStock: true,
  },
  {
    id: '2',
    name: 'Cactus Collection',
    price: 20.00,
    image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&h=400&fit=crop',
    category: 'Cactus',
    isInStock: true,
  },
  {
    id: '3',
    name: 'Monstera Deliciosa',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=400&h=400&fit=crop',
    category: 'Indoor',
    isInStock: true,
  },
  {
    id: '4',
    name: 'Snake Plant',
    price: 25.00,
    image: 'https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=400&h=400&fit=crop',
    category: 'Indoor',
    isInStock: true,
  },
];

const categories = ['All', 'Indoor', 'Outdoor', 'Cactus'];

export default function HomePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const filteredPlants = selectedCategory === 'All' 
    ? samplePlants 
    : samplePlants.filter(plant => plant.category === selectedCategory);

  const handleAddToCart = (plantId: string) => {
    setCartItems(prev => [...prev, plantId]);
  };

  const handleToggleFavorite = (plantId: string) => {
    setFavorites(prev => 
      prev.includes(plantId) 
        ? prev.filter(id => id !== plantId)
        : [...prev, plantId]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left section - User profile */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" alt="Anna" />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                A
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">Welcome</p>
              <p className="font-semibold">Anna</p>
            </div>
          </div>

          {/* Right section - Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push('/search')}>
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative" onClick={() => router.push('/cart')}>
              <ShoppingCart className="h-5 w-5" />
              {cartItems.length > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                >
                  {cartItems.length}
                </Badge>
              )}
            </Button>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Promotional Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-primary m-4 p-6">
        <div className="relative z-10 flex justify-between items-center">
          <div className="flex-1">
            <Badge variant="secondary" className="bg-white/20 text-white mb-3">
              30% OFF
            </Badge>
            <h2 className="text-white font-bold text-xl mb-2">Most Popular Plant</h2>
            <p className="text-white/90 text-sm leading-relaxed mb-4 max-w-[200px]">
              Check out the collections for the most popular plants to place in your space.
            </p>
            <Button 
              variant="secondary" 
              size="sm" 
              className="rounded-full"
              onClick={() => router.push('/products')}
            >
              Shop Now
            </Button>
          </div>
          
          {/* Plant illustration */}
          <div className="flex-shrink-0 ml-4">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
              <div className="text-4xl">🌿</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Category</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary"
            onClick={() => router.push('/products')}
          >
            See All
          </Button>
        </div>
        
        <div className="flex gap-3 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="rounded-full px-4 py-2 font-medium whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 pb-8">
        <div className="grid grid-cols-2 gap-4">
          {filteredPlants.map((plant) => (
            <Card key={plant.id} className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300">
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
                    onClick={() => handleToggleFavorite(plant.id)}
                  >
                    <Heart 
                      className={`h-4 w-4 ${favorites.includes(plant.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
                    />
                  </Button>

                  {/* Sale badge */}
                  {plant.originalPrice && plant.originalPrice > plant.price && (
                    <Badge 
                      variant="destructive" 
                      className="absolute top-2 left-2"
                    >
                      Sale
                    </Badge>
                  )}

                  {/* Add to Cart Button */}
                  <Button
                    size="icon"
                    onClick={() => handleAddToCart(plant.id)}
                    className="absolute bottom-2 right-2 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <Plus className="h-4 w-4" />
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
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t px-4 py-2">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2 px-3">
            <Home className="h-5 w-5 fill-current text-primary" />
            <span className="text-xs font-medium text-primary">Home</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center gap-1 h-auto py-2 px-3"
            onClick={() => router.push('/search')}
          >
            <Search className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Search</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center gap-1 h-auto py-2 px-3 relative"
            onClick={() => router.push('/cart')}
          >
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Cart</span>
            {cartItems.length > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
              >
                {cartItems.length}
              </Badge>
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center gap-1 h-auto py-2 px-3 relative"
            onClick={() => router.push('/favorites')}
          >
            <Heart className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Favorites</span>
            {favorites.length > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
              >
                {favorites.length}
              </Badge>
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center gap-1 h-auto py-2 px-3"
            onClick={() => router.push('/profile')}
          >
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Profile</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}
