'use client';

import { useState } from 'react';
import { Search, ShoppingCart, Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  userName?: string;
  userImage?: string;
  cartItemCount?: number;
}

export function Header({ userName = "Anna", userImage, cartItemCount = 0 }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left section - User profile */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userImage} alt={userName} />
            <AvatarFallback className="bg-emerald-100 text-emerald-800 font-semibold">
              {userName?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-gray-600">Welcome</p>
            <p className="font-semibold text-gray-900">{userName}</p>
          </div>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-2">
          {/* Search button */}
          <Button variant="ghost" size="icon" className="rounded-full">
            <Search className="h-5 w-5" />
          </Button>
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
          </Button>
          
          {/* Cart */}
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
              >
                {cartItemCount}
              </Badge>
            )}
          </Button>
          
          {/* Menu */}
          <Button variant="ghost" size="icon" className="rounded-full">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
