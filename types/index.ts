export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  imageUrl?: string;
  imageUrls?: string[];
  mainImageUrl: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: string;
  userId: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string | null;
  createdAt: string;
  updatedAt?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  favoriteId?: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}