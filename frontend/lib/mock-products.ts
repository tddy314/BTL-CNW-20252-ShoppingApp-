export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  category: string;
  tags: string[];
  shopName: string;
  shopId: number;
  shopAvatar: string;
  shopRating: number;
  rating: number;
  reviews: number;
  sold: number;
  image: string;
  images?: string[];
  description: string;
  properties: {
    colors?: string[];
    sizes?: string[];
    materials?: string[];
  };
  discount?: number;
  isNew?: boolean;
  isTrending?: boolean;
}

const createProduct = (
  id: number,
  name: string,
  price: number,
  originalPrice: number,
  category: string,
  shopName: string,
  shopId: number,
  sold: number,
  rating: number,
  reviews: number,
  image: string,
  description: string,
  properties: Product['properties'] = {},
  options?: Partial<Product>
): Product => ({
  id,
  name,
  price,
  originalPrice,
  category,
  tags: options?.tags || [category.toLowerCase(), name.split(' ')[0].toLowerCase()],
  shopName,
  shopId,
  shopAvatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&id=${shopId}`,
  shopRating: 4.5 + (shopId % 5) * 0.05,
  rating,
  reviews,
  sold,
  image,
  description,
  properties,
  discount: Math.round(((originalPrice - price) / originalPrice) * 100),
  ...options,
});

export const mockProducts: Product[] = [
  createProduct(
    1,
    "Classic White T-Shirt",
    12.99,
    24.99,
    "Men's Fashion",
    "Fashion Hub",
    1,
    1250,
    4.5,
    234,
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
    "Premium quality 100% cotton white t-shirt, perfect for everyday wear. Features a comfortable fit and breathable fabric. Available in multiple sizes.",
    {
      colors: ["White", "Black", "Gray", "Navy"],
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    },
    { isTrending: true }
  ),
  createProduct(
    2,
    "Women's Summer Dress",
    34.99,
    59.99,
    "Women's Fashion",
    "Style Corner",
    2,
    892,
    4.7,
    512,
    "https://images.unsplash.com/photo-1595777707802-21b287373cba?w=300&h=300&fit=crop",
    "Beautiful summer dress made from lightweight breathable fabric. Perfect for hot weather with a flattering cut. Features adjustable straps.",
    {
      colors: ["Blue", "Pink", "Yellow", "White"],
      sizes: ["XS", "S", "M", "L", "XL"],
      materials: ["Cotton", "Blend"],
    }
  ),
  createProduct(
    3,
    "Running Shoes",
    89.99,
    129.99,
    "Shoes",
    "Sports Pro",
    3,
    567,
    4.8,
    678,
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop",
    "Professional running shoes with advanced cushioning technology. Designed for maximum comfort and performance. Suitable for all types of running.",
    {
      colors: ["Black", "White", "Red", "Blue"],
      sizes: ["6", "7", "8", "9", "10", "11", "12", "13"],
    },
    { isTrending: true }
  ),
  createProduct(
    4,
    "Organic Coffee Beans",
    15.99,
    19.99,
    "Food & Beverage",
    "Coffee Corner",
    4,
    2340,
    4.6,
    145,
    "https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=300&h=300&fit=crop",
    "Premium organic coffee beans sourced from farms. Rich flavor with a smooth finish. Perfect for espresso or drip coffee.",
    {
      sizes: ["250g", "500g", "1kg"],
    },
    { isNew: true }
  ),
  createProduct(
    5,
    "Wireless Headphones",
    49.99,
    99.99,
    "Electronics",
    "Tech Store",
    5,
    1834,
    4.4,
    892,
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
    "High-quality wireless headphones with noise cancellation. 30-hour battery life and comfortable padding. Connects via Bluetooth 5.0.",
    {
      colors: ["Black", "Silver", "Gold"],
    },
    { isTrending: true }
  ),
  createProduct(
    6,
    "Bestselling Novel",
    14.99,
    24.99,
    "Books & Media",
    "Book Haven",
    6,
    5621,
    4.9,
    2340,
    "https://images.unsplash.com/photo-1507842160343-583f20270319?w=300&h=300&fit=crop",
    "Award-winning novel that topped bestseller lists. Engaging storyline with memorable characters. Perfect for fiction lovers.",
    {},
    { isNew: true }
  ),
  createProduct(
    7,
    "Leather Handbag",
    59.99,
    119.99,
    "Women's Fashion",
    "Luxury Bags",
    7,
    412,
    4.7,
    456,
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&h=300&fit=crop",
    "Elegant leather handbag made from premium quality material. Spacious interior with multiple compartments. Perfect for everyday or professional use.",
    {
      colors: ["Black", "Brown", "Tan", "Red"],
    }
  ),
  createProduct(
    8,
    "Men's Casual Jeans",
    44.99,
    89.99,
    "Men's Fashion",
    "Denim Kings",
    8,
    1523,
    4.5,
    734,
    "https://images.unsplash.com/photo-1542272604-787c62d465d1?w=300&h=300&fit=crop",
    "Classic denim jeans with a modern fit. Durable material that gets better with wear. Versatile style for any occasion.",
    {
      colors: ["Dark Blue", "Light Blue", "Black"],
      sizes: ["28", "30", "32", "34", "36", "38", "40"],
    },
    { isTrending: true }
  ),
  createProduct(
    9,
    "Yoga Mat Premium",
    29.99,
    59.99,
    "Home & Living",
    "Wellness Store",
    9,
    823,
    4.6,
    321,
    "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=300&h=300&fit=crop",
    "Non-slip yoga mat with excellent cushioning. Eco-friendly material that's durable and easy to clean. Ideal for yoga and fitness.",
    {
      colors: ["Purple", "Pink", "Blue", "Green"],
    }
  ),
  createProduct(
    10,
    "Smartphone Case",
    12.99,
    24.99,
    "Electronics",
    "Tech Accessories",
    10,
    4521,
    4.3,
    1203,
    "https://images.unsplash.com/photo-1586253408306-f5b1e7b9e8e0?w=300&h=300&fit=crop",
    "Protective smartphone case with impact resistance. Slim design that doesn't add bulk. Available for most phone models.",
    {
      colors: ["Black", "Clear", "Blue", "Red"],
    }
  ),
  createProduct(
    11,
    "Canvas Shoes",
    32.99,
    64.99,
    "Shoes",
    "Shoe Palace",
    11,
    745,
    4.5,
    567,
    "https://images.unsplash.com/photo-1579671156573-0409e85ffd95?w=300&h=300&fit=crop",
    "Casual canvas shoes perfect for everyday wear. Lightweight and comfortable with excellent ventilation.",
    {
      colors: ["White", "Black", "Navy", "Gray"],
      sizes: ["5", "6", "7", "8", "9", "10", "11", "12"],
    }
  ),
  createProduct(
    12,
    "Dark Chocolate Pack",
    8.99,
    12.99,
    "Food & Beverage",
    "Sweet Treats",
    12,
    3245,
    4.8,
    892,
    "https://images.unsplash.com/photo-1599810694-b5ac4dd87352?w=300&h=300&fit=crop",
    "Premium dark chocolate pack with 72% cocoa. Rich taste and smooth texture. Perfect gift or personal treat.",
    {
      sizes: ["100g", "200g"],
    },
    { isNew: true }
  ),
];

export const categories = [
  "All Categories",
  "Men's Fashion",
  "Women's Fashion",
  "Shoes",
  "Electronics",
  "Home & Living",
  "Books & Media",
  "Food & Beverage",
];

export const sortOptions = [
  { label: "Relevance", value: "relevance" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest", value: "newest" },
  { label: "Popularity", value: "popularity" },
];
