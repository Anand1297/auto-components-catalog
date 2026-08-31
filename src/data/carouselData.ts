export interface CarouselItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export const carouselData: CarouselItem[] = [
  {
    id: "banner-1",
    title: "Premium Car Accessories",
    description: "Discover premium accessories for your car.",
    imageUrl:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7",
  },
  {
    id: "banner-2",
    title: "Upgrade Your Drive",
    description: "Explore our latest interior and exterior products.",
    imageUrl:
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
  },
  {
    id: "banner-3",
    title: "Built for Your Car",
    description: "Quality accessories designed for modern vehicles.",
    imageUrl:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2",
  },
];