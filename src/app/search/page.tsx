'use client';

import { useState, useEffect } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const recentSearches = [
  'Jade Plant',
  'Indoor plants',
  'Succulents',
  'Low light plants',
];

const trendingSearches = [
  'Monstera',
  'Snake plant',
  'Peace lily',
  'Pothos',
  'Fiddle leaf fig',
];

const searchSuggestions = [
  { category: 'Plants', items: ['Jade Plant', 'Snake Plant', 'Monstera Deliciosa'] },
  { category: 'Categories', items: ['Indoor Plants', 'Outdoor Plants', 'Succulents'] },
  { category: 'Care', items: ['Low Light', 'Pet Friendly', 'Air Purifying'] },
];

const allPlants = [
  {
    id: '1',
    name: 'Jade Plant',
    price: 30.00,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
    category: 'Indoor',
    tags: ['succulent', 'low maintenance', 'indoor'],
  },
  {
    id: '2',
    name: 'Snake Plant',
    price: 25.00,
    image: 'https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=400&h=400&fit=crop',
    category: 'Indoor',
    tags: ['low light', 'air purifying', 'indoor'],
  },
  {
    id: '3',
    name: 'Monstera Deliciosa',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=400&h=400&fit=crop',
    category: 'Indoor',
    tags: ['tropical', 'climbing', 'indoor'],
  },
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = allPlants.filter(plant =>
        plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plant.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setSearchResults(results);
      setShowSuggestions(false);
    } else {
      setSearchResults([]);
      setShowSuggestions(true);
    }
  }, [searchQuery]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Search */}
      <header className="sticky top-0 z-50 w-full bg-background border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search plants, categories, care tips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="px-4 py-4 pb-20">
        {showSuggestions ? (
          /* Search Suggestions */
          <div className="space-y-6">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">Recent</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => handleSuggestionClick(search)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">Trending</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => handleSuggestionClick(search)}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Search Categories */}
            <div className="space-y-4">
              {searchSuggestions.map((category, index) => (
                <div key={index}>
                  <h3 className="font-medium mb-3">{category.category}</h3>
                  <div className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleSuggestionClick(item)}
                      >
                        <span>{item}</span>
                        <Search className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Search Results */
          <div>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
              </p>
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or browse our categories
                </p>
                <Button variant="outline">Browse Categories</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {searchResults.map((plant) => (
                  <Card key={plant.id} className="group overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative aspect-square bg-muted overflow-hidden">
                        <img
                          src={plant.image}
                          alt={plant.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm mb-1 line-clamp-2">{plant.name}</h3>
                        <Badge variant="outline" className="mb-2 text-xs">
                          {plant.category}
                        </Badge>
                        <div className="font-bold text-primary">{formatPrice(plant.price)}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Search Filters */}
            {searchResults.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-3">Refine your search</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="cursor-pointer">
                    Under $30
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer">
                    Indoor Only
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer">
                    Low Maintenance
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer">
                    Pet Friendly
                  </Badge>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
