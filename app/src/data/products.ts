export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  badge?: string;
  isNew?: boolean;
}

export const products: Product[] = [
  {
    id: 9183210471636,
    name: "Floral Print Summer Dress",
    price: 1238,
    originalPrice: 1769,
    image: "images/prod-dress.jpg",
    category: "Fashion",
    badge: "New",
    isNew: true,
  },
  {
    id: 9179799650516,
    name: "Wireless Noise-Cancelling Headphones",
    price: 1560,
    originalPrice: 2229,
    image: "images/prod-headphones.jpg",
    category: "Electronics",
    badge: "Sale",
  },
  {
    id: 9176287412436,
    name: "Automatic Pet Feeder",
    price: 2799,
    originalPrice: 3999,
    image: "images/prod-petfeeder.jpg",
    category: "Pets",
    isNew: true,
  },
  {
    id: 9183171346644,
    name: "Knitted Cardigan Coat",
    price: 1213,
    originalPrice: 1733,
    image: "images/prod-cardigan.jpg",
    category: "Fashion",
  },
  {
    id: 9176766054612,
    name: "Stiletto Heel Sandals",
    price: 1560,
    originalPrice: 2229,
    image: "images/prod-sandals.jpg",
    category: "Shoes",
    badge: "New",
    isNew: true,
  },
  {
    id: 9176686985428,
    name: "3-in-1 Wireless Charger",
    price: 1670,
    originalPrice: 2385,
    image: "images/prod-charger.jpg",
    category: "Electronics",
  },
  {
    id: 9176335745236,
    name: "Round Plush Pet Bed",
    price: 1567,
    originalPrice: 2238,
    image: "images/prod-petbed.jpg",
    category: "Pets",
  },
  {
    id: 9176673779924,
    name: "Silicone Phone Case Set",
    price: 403,
    originalPrice: 575,
    image: "images/prod-phonecase.jpg",
    category: "Accessories",
    badge: "Sale",
  },
];

export interface Category {
  id: number;
  name: string;
  image: string;
}

export const categories: Category[] = [
  { id: 1, name: "Fashion", image: "images/cat-fashion.jpg" },
  { id: 2, name: "Shoes", image: "images/cat-shoes.jpg" },
  { id: 3, name: "Electronics", image: "images/cat-electronics.jpg" },
  { id: 4, name: "Pet Essentials", image: "images/cat-pets.jpg" },
  { id: 5, name: "Accessories", image: "images/cat-accessories.jpg" },
];

export interface Testimonial {
  id: number;
  quote: string;
  name: string;
  initials: string;
  role: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "Absolutely love the quality! The dresses fit perfectly and the fabric is premium. My go-to store for every occasion.",
    name: "Sarah M.",
    initials: "S",
    role: "Verified Buyer",
  },
  {
    id: 2,
    quote: "Fast shipping and incredible customer service. The knitted coat is even better in person. Will definitely order again!",
    name: "Emily R.",
    initials: "E",
    role: "Verified Buyer",
  },
  {
    id: 3,
    quote: "The activewear collection is amazing — so comfortable and stylish. I get compliments every time I wear them.",
    name: "Jessica K.",
    initials: "J",
    role: "Verified Buyer",
  },
];

export const ringImages = [
  "images/ring-fashion-1.jpg",
  "images/ring-fashion-2.jpg",
  "images/ring-shoes-1.jpg",
  "images/ring-pets-1.jpg",
  "images/ring-electronics-1.jpg",
  "images/ring-accessories-1.jpg",
  "images/ring-fashion-3.jpg",
];

export const navCategories = [
  "New Arrivals",
  "Fashion",
  "Shoes",
  "Electronics",
  "Pets",
  "Accessories",
];
