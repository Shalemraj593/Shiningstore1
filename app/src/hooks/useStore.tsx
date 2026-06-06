import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { products as allProducts } from '@/data/products';
import type { Product } from '@/data/products';

interface CartItem extends Product {
  quantity: number;
}

interface StoreContextType {
  cart: CartItem[];
  wishlist: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: number) => boolean;
  cartTotal: number;
  cartCount: number;
  wishlistCount: number;
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  isSearchOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  setIsWishlistOpen: (open: boolean) => void;
  setIsSearchOpen: (open: boolean) => void;
  setIsAuthOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Product[];
  currency: 'USD' | 'INR';
  changeCurrency: (cur: 'USD' | 'INR') => void;
  formatPrice: (priceInINR: number) => string;
  isAuthOpen: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useLocalStorage<CartItem[]>('shining-cart', []);
  const [wishlist, setWishlist] = useLocalStorage<Product[]>('shining-wishlist', []);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'INR'>(() => {
    return (localStorage.getItem('shiningstore_currency') as 'USD' | 'INR') || 'USD';
  });

  const changeCurrency = useCallback((cur: 'USD' | 'INR') => {
    setCurrency(cur);
    localStorage.setItem('shiningstore_currency', cur);
  }, []);

  const formatPrice = useCallback((priceInINR: number) => {
    if (currency === 'USD') {
      const priceUSD = priceInINR / 83.5;
      return '$' + priceUSD.toFixed(2);
    }
    return '₹' + priceInINR.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  }, [currency]);

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, [setCart]);

  const removeFromCart = useCallback((productId: number) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }, [setCart]);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, [setCart]);

  const toggleWishlist = useCallback((product: Product) => {
    setWishlist((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  }, [setWishlist]);

  const isInWishlist = useCallback(
    (productId: number) => wishlist.some((item) => item.id === productId),
    [wishlist]
  );

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const searchResults = useMemo(() => {
    if (searchQuery.trim().length === 0) return [];
    const query = searchQuery.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleWishlist,
        isInWishlist,
        cartTotal,
        cartCount,
        wishlistCount,
        isCartOpen,
        isWishlistOpen,
        isSearchOpen,
        setIsCartOpen,
        setIsWishlistOpen,
        setIsSearchOpen,
        setIsAuthOpen,
        searchQuery,
        setSearchQuery,
        searchResults,
        currency,
        changeCurrency,
        formatPrice,
        isAuthOpen,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
