import type { Product } from "@/lib/store";
import type { ProductRecord } from "@/app/utils/api";

export const FALLBACK_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400";

function normalizeProductImageLink(rawLink: string | null): string | null {
  if (!rawLink) {
    return null;
  }

  const link = rawLink.trim();
  if (!link) {
    return null;
  }

  if (link.startsWith("//")) {
    return `https:${link}`;
  }

  // Google Drive share link -> direct render link
  const driveMatch = link.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  if (driveMatch?.[1]) {
    return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  }

  // Dropbox share link -> raw download link
  if (link.includes("dropbox.com")) {
    return link.replace("www.dropbox.com", "dl.dropboxusercontent.com").replace("?dl=0", "").replace("&dl=0", "");
  }

  return link;
}

export function mapApiProductToStoreProduct(item: ProductRecord): Product {
  const normalizedImage = normalizeProductImageLink(item.product_img_link);

  return {
    id: item.product_id,
    name: item.name,
    price: Number(item.price || 0),
    image: normalizedImage || FALLBACK_PRODUCT_IMAGE,
    category: item.category,
    shopId: item.shop_id,
    shopName: item.shop_owner,
    description: item.description || "",
    soldCount: Number(item.sold_count || 0),
    createdAt: new Date(item.created_at),
    tags: item.tags || [],
    rating: 4.5,
    properties: {
      colors: item.colors || [],
      sizes: item.sizes || [],
      materials: item.materials || [],
    },
    originalPrice: Number(item.price || 0),
    shopRating: 4.5,
    reviews: 0,
    comments: [],
  };
}
