'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { PromotionalBanner } from '@/components/ui/promotional-banner';
import { CategoryFilter } from '@/components/ui/category-filter';
import { ProductCard } from '@/components/ui/product-card';
import { BottomNavigation } from '@/components/layout/BottomNavigation';

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
  {
    id: '5',
    name: 'Fiddle Leaf Fig',
    price: 65.00,
    image: 'https://images.unsplash.com/photo-1463151251737-5c8f5ac90b1b?w=400&h=400&fit=crop',
    category: 'Indoor',
    isInStock: false,
  },
  {
    id: '6',
    name: 'Succulent Mix',
    price: 15.00,
    originalPrice: 20.00,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
    category: 'Outdoor',
    isInStock: true,
  },
];

const categories = ['All', 'Indoor', 'Outdoor', 'Cactus'];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('home');
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const filteredPlants = selectedCategory === 'All' 
    ? samplePlants 
    : samplePlants.filter(plant => plant.category === selectedCategory);

  const handleAddToCart = async (plantId: string) => {
    setCartItems(prev => [...prev, plantId]);
    // Here you would typically call your API
    console.log('Added to cart:', plantId);
  };

  const handleToggleFavorite = (plantId: string) => {
    setFavorites(prev => 
      prev.includes(plantId) 
        ? prev.filter(id => id !== plantId)
        : [...prev, plantId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <Header 
        userName="Anna" 
        cartItemCount={cartItems.length}
      />

      {/* Promotional Banner */}
      <PromotionalBanner 
        discount="30% OFF"
        title="Most Popular Plant"
        subtitle="Check out the collections for the most popular plants to place in your space."
        backgroundColor="bg-emerald-800"
        image="🌿"
      />

      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        showSeeAll={true}
        onSeeAll={() => console.log('See all categories')}
      />

      {/* Products Grid */}
      <div className="px-4 pb-8">
        <div className="grid grid-cols-2 gap-4">
          {filteredPlants.map((plant) => (
            <ProductCard
              key={plant.id}
              id={plant.id}
              name={plant.name}
              price={plant.price}
              originalPrice={plant.originalPrice}
              image={plant.image}
              category={plant.category}
              isInStock={plant.isInStock}
              onAddToCart={handleAddToCart}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={favorites.includes(plant.id)}
            />
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        cartItemCount={cartItems.length}
        favoriteCount={favorites.length}
      />
    </div>
  );
}
