'use client';

import { useState } from 'react';
import { 
  User, 
  Settings, 
  ShoppingBag, 
  Heart, 
  CreditCard, 
  MapPin, 
  Bell, 
  HelpCircle,
  LogOut,
  Edit,
  Star,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { useRouter } from 'next/navigation';

const recentOrders = [
  {
    id: 'ORD001',
    date: '2024-01-15',
    status: 'Delivered',
    total: 75.50,
    items: 3,
  },
  {
    id: 'ORD002',
    date: '2024-01-10',
    status: 'Shipped',
    total: 42.30,
    items: 2,
  },
];

const achievements = [
  { title: 'Plant Parent', description: 'Bought 10+ plants', icon: '🌱' },
  { title: 'Green Thumb', description: 'Excellent reviews', icon: '👍' },
  { title: 'Loyal Customer', description: '6 months member', icon: '💚' },
];

export default function ProfilePage() {
  const router = useRouter();
  const [user] = useState({
    name: 'Anna Johnson',
    email: 'anna.johnson@email.com',
    phone: '+1 (555) 123-4567',
    memberSince: 'June 2023',
    totalOrders: 12,
    totalSpent: 485.20,
    favoriteCount: 8,
    loyaltyPoints: 240,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const menuItems = [
    { icon: ShoppingBag, label: 'Order History', badge: user.totalOrders },
    { icon: Heart, label: 'Favorites', badge: user.favoriteCount },
    { icon: CreditCard, label: 'Payment Methods' },
    { icon: MapPin, label: 'Addresses' },
    { icon: Bell, label: 'Notifications' },
    { icon: Settings, label: 'Account Settings' },
    { icon: HelpCircle, label: 'Help & Support' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Profile</h1>
          </div>
          <Button variant="ghost" size="icon">
            <Edit className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* User Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  AJ
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                <p className="text-sm text-muted-foreground">Member since {user.memberSince}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{user.totalOrders}</div>
                <div className="text-sm text-muted-foreground">Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{formatPrice(user.totalSpent)}</div>
                <div className="text-sm text-muted-foreground">Spent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{user.loyaltyPoints}</div>
                <div className="text-sm text-muted-foreground">Points</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loyalty Program */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Loyalty Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Current Points</span>
              <span className="font-bold">{user.loyaltyPoints}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${(user.loyaltyPoints % 500) / 5}%` }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground">
              {500 - (user.loyaltyPoints % 500)} points until next reward
            </p>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                  <Badge variant="outline">Earned</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">#{order.id}</div>
                    <div className="text-sm text-muted-foreground">{order.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatPrice(order.total)}</div>
                    <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Orders
            </Button>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card>
          <CardContent className="p-0">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <Badge variant="outline">{item.badge}</Badge>
                  )}
                  <span className="text-muted-foreground">›</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Logout */}
        <Button variant="outline" className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
