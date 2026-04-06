'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, Menu, X, LogOut, User, Bell, History, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { isLoggedIn, username, logout } = useAuth();
  const router = useRouter();

  const handleNavigation = (path: string) => {
    setTimeout(() => {
      router.push(path);
    }, 0);
  };

  const handleLogout = () => {
    logout();
    setTimeout(() => {
      router.push('/');
    }, 0);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      {/* Top Navigation Bar */}
      <div className="bg-primary text-primary-foreground py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-sm">
          <span className="hidden md:block">Welcome to ShopHub - Your Ultimate Shopping Destination!</span>
          <div className="flex gap-4">
            <button className="hover:opacity-90 transition-opacity">Support</button>
            <button className="hover:opacity-90 transition-opacity">Sell</button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-gradient-to-br from-primary to-secondary rounded-lg p-2">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">ShopHub</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Your One-Stop Shop</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden md:flex">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search products, brands, and more..."
                className="pl-4 pr-10 bg-muted text-foreground placeholder:text-muted-foreground border-muted"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3 relative">
            {isLoggedIn ? (
              <>
                {/* Cart Button */}
                <button
                  onClick={() => handleNavigation('/cart')}
                  className="hidden sm:flex items-center justify-center p-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-all"
                  title="Shopping Cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                </button>

                {/* Notification Icon */}
                <button
                  className="hidden sm:flex items-center justify-center p-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-all relative"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Profile Dropdown Button */}
                <div className="hidden sm:block relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center justify-center p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all"
                    title={`Profile (${username})`}
                  >
                    <User className="w-5 h-5" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-border rounded-lg shadow-lg py-2 z-50">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm text-muted-foreground">Signed in as</p>
                        <p className="font-semibold text-foreground">{username}</p>
                      </div>

                      {/* Profile Option */}
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleNavigation('/profile');
                        }}
                        className="w-full text-left px-4 py-2 text-foreground hover:bg-muted transition-colors text-sm flex items-center gap-3"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </button>

                      {/* Order History Option */}
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleNavigation('/orders');
                        }}
                        className="w-full text-left px-4 py-2 text-foreground hover:bg-muted transition-colors text-sm flex items-center gap-3"
                      >
                        <History className="w-4 h-4" />
                        Order History
                      </button>

                      {/* Total Spend Option */}
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleNavigation('/orders');
                        }}
                        className="w-full text-left px-4 py-2 text-foreground hover:bg-muted transition-colors text-sm flex items-center gap-3"
                      >
                        <DollarSign className="w-4 h-4" />
                        Total Spend
                      </button>

                      {/* Sign Out Option */}
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-sm flex items-center gap-3 border-t border-border"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Button
                  onClick={() => handleNavigation('/login')}
                  variant="ghost"
                  className="hidden sm:flex text-foreground hover:bg-secondary hover:text-secondary-foreground"
                >
                  Login
                </Button>
                <Button
                  onClick={() => handleNavigation('/register')}
                  className="hidden sm:flex bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Register
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-foreground hover:bg-muted"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search products..."
              className="pl-4 pr-10 bg-muted text-foreground placeholder:text-muted-foreground border-muted w-full"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 flex flex-col gap-2">
            {isLoggedIn ? (
              <>
                <Button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleNavigation('/profile');
                  }}
                  variant="outline"
                  className="w-full text-foreground border-border hover:bg-muted"
                >
                  Profile
                </Button>
                <Button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleNavigation('/cart');
                  }}
                  variant="outline"
                  className="w-full text-foreground border-border hover:bg-muted"
                >
                  Shopping Cart
                </Button>
                <Button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleNavigation('/orders');
                  }}
                  variant="outline"
                  className="w-full text-foreground border-border hover:bg-muted"
                >
                  Order History
                </Button>
                <Button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleNavigation('/orders');
                  }}
                  variant="outline"
                  className="w-full text-foreground border-border hover:bg-muted"
                >
                  Total Spend
                </Button>
                <Button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full bg-red-500 hover:bg-red-600 text-white"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleNavigation('/login');
                  }}
                  variant="outline"
                  className="w-full text-foreground border-border hover:bg-muted"
                >
                  Login
                </Button>
                <Button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleNavigation('/register');
                  }}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Register
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
