export interface BusinessMetrics {
  rating: number
  distance: number
  price: number
  availability: boolean
  verified: boolean
  featured: boolean
}

export interface Business extends BusinessMetrics {
  id: string
  name: string
  category: string
  subCategory: string
  imageUrl: string
  
  // Canvas position and physics
  x: number
  y: number
  vx: number
  vy: number
  size: number
  
  // UI state
  isSelected: boolean
  isHovered: boolean
}

export interface CloudConfig {
  width: number
  height: number
  animationSpeed: number
  clusteringEnabled: boolean
  damping: number
  repulsionForce: number
  attractionForce: number
}

export interface SearchFilters {
  category: string
  subCategory: string
  maxDistance: number
  minRating: number
  maxPrice: number
  verifiedOnly: boolean
  featuredOnly: boolean
} 