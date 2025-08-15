'use client';

import { Home, Search, ShoppingCart, Heart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BottomNavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  cartItemCount?: number;
  favoriteCount?: number;
}

const navItems = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'cart', icon: ShoppingCart, label: 'Cart' },
  { id: 'favorites', icon: Heart, label: 'Favorites' },
  { id: 'profile', icon: User, label: 'Profile' },
];

export function BottomNavigation({ 
  activeTab = 'home', 
  onTabChange,
  cartItemCount = 0,
  favoriteCount = 0
}: BottomNavigationProps) {
  const getBadgeCount = (itemId: string) => {
    switch (itemId) {
      case 'cart':
        return cartItemCount;
      case 'favorites':
        return favoriteCount;
      default:
        return 0;
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-2 safe-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const badgeCount = getBadgeCount(item.id);
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onTabChange?.(item.id)}
              className={`
                relative flex flex-col items-center gap-1 h-auto py-2 px-3
                ${isActive 
                  ? 'text-emerald-800' 
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              <div className="relative">
                <Icon 
                  className={`h-5 w-5 ${isActive ? 'fill-current' : ''}`} 
                />
                {badgeCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center"
                  >
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </Badge>
                )}
              </div>
              <span 
                className={`text-xs font-medium ${
                  isActive ? 'text-emerald-800' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
