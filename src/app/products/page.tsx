'use client';

import { useState } from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const allPlants = [
  {
    id: '1',
    name: 'Jade Plant',
    price: 30.00,
    originalPrice: 35.00,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
    category: 'Indoor',
    isInStock: true,
    rating: 4.5,
    reviews: 23,
  },
  {
    id: '2',
    name: 'Cactus Collection',
    price: 20.00,
    image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&h=400&fit=crop',
    category: 'Cactus',
    isInStock: true,
    rating: 4.8,
    reviews: 45,
  },
  {
    id: '3',
    name: 'Monstera Deliciosa',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=400&h=400&fit=crop',
    category: 'Indoor',
    isInStock: true,
    rating: 4.9,
    reviews: 67,
  },
  {
    id: '4',
    name: 'Snake Plant',
    price: 25.00,
    image: 'https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=400&h=400&fit=crop',
    category: 'Indoor',
    isInStock: true,
    rating: 4.6,
    reviews: 34,
  },
  {
    id: '5',
    name: 'Fiddle Leaf Fig',
    price: 65.00,
    image: 'https://images.unsplash.com/photo-1463151251737-5c8f5ac90b1b?w=400&h=400&fit=crop',
    category: 'Indoor',
    isInStock: false,
    rating: 4.7,
    reviews: 56,
  },
  {
    id: '6',
    name: 'Succulent Mix',
    price: 15.00,
    originalPrice: 20.00,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
    category: 'Outdoor',
    isInStock: true,
    rating: 4.4,
    reviews: 89,
  },
];

const categories = ['All', 'Indoor', 'Outdoor', 'Cactus', 'Succulents', 'Trees'];
const priceRanges = [
  { label: 'Under $20', min: 0, max: 20 },
  { label: '$20 - $50', min: 20, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: 'Over $100', min: 100, max: 9999 },
];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const filteredPlants = allPlants.filter(plant => {
    const matchesSearch = plant.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || plant.category === selectedCategory;
    const matchesPrice = !selectedPriceRange || 
      (plant.price >= selectedPriceRange.min && plant.price <= selectedPriceRange.max);
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Plants</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search plants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="px-4 pb-4 space-y-4">
          {/* Categories */}
          <div>
            <h3 className="font-medium mb-2">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="font-medium mb-2">Price Range</h3>
            <div className="flex flex-wrap gap-2">
              {priceRanges.map((range, index) => (
                <Button
                  key={index}
                  variant={selectedPriceRange === range ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPriceRange(selectedPriceRange === range ? null : range)}
                  className="rounded-full"
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="px-4 pb-4">
        <p className="text-sm text-muted-foreground">
          {filteredPlants.length} plants found
        </p>
      </div>

      {/* Products Grid/List */}
      <div className="px-4 pb-20">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredPlants.map((plant) => (
              <Card key={plant.id} className="group overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-square bg-muted overflow-hidden">
                    <img
                      src={plant.image}
                      alt={plant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {plant.originalPrice && (
                      <Badge variant="destructive" className="absolute top-2 left-2">
                        Sale
                      </Badge>
                    )}
                    {!plant.isInStock && (
                      <Badge variant="secondary" className="absolute top-2 right-2">
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm mb-1 line-clamp-2">{plant.name}</h3>
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
                      <span className="text-xs text-muted-foreground">({plant.reviews})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">{formatPrice(plant.price)}</span>
                      {plant.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(plant.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPlants.map((plant) => (
              <Card key={plant.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    <div className="w-24 h-24 bg-muted overflow-hidden">
                      <img
                        src={plant.image}
                        alt={plant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{plant.name}</h3>
                        <div className="text-right">
                          <span className="font-bold text-primary">{formatPrice(plant.price)}</span>
                          {plant.originalPrice && (
                            <div className="text-xs text-muted-foreground line-through">
                              {formatPrice(plant.originalPrice)}
                            </div>
                          )}
                        </div>
                      </div>
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
                        <span className="text-xs text-muted-foreground">({plant.reviews})</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="text-xs">
                          {plant.category}
                        </Badge>
                        {!plant.isInStock && (
                          <Badge variant="secondary" className="text-xs">
                            Out of Stock
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
