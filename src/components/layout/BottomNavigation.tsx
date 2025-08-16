'use client';

import { Home, Search, ShoppingCart, Heart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter, usePathname } from 'next/navigation';

interface BottomNavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  cartItemCount?: number;
  favoriteCount?: number;
}

const navItems = [
  { id: 'home', icon: Home, label: 'Home', path: '/' },
  { id: 'search', icon: Search, label: 'Search', path: '/search' },
  { id: 'cart', icon: ShoppingCart, label: 'Cart', path: '/cart' },
  { id: 'favorites', icon: Heart, label: 'Favorites', path: '/favorites' },
  { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
];

export function BottomNavigation({ 
  cartItemCount = 0,
  favoriteCount = 0
}: Omit<BottomNavigationProps, 'activeTab' | 'onTabChange'>) {
  const router = useRouter();
  const pathname = usePathname();
  
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
  
  const isActiveTab = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t px-4 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveTab(item.path);
          const badgeCount = getBadgeCount(item.id);
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => router.push(item.path)}
              className={`
                relative flex flex-col items-center gap-1 h-auto py-2 px-3
                ${isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
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
                  isActive ? 'text-primary' : 'text-muted-foreground'
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
