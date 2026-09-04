export interface Business {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  currency: string;
}

export interface SiteConfig {
  businessId: string;
  catalogTitle: string;
  catalogSubtitle: string;
  latestSectionTitle: string;
  featuredSectionTitle: string;
  categoriesSectionTitle: string;
  brandsSectionTitle: string;
  showCarousel: boolean;
  showLatest: boolean;
  showFeatured: boolean;
  showCategories: boolean;
  showBrands: boolean;
  showTestimonials: boolean;
  productsPerSection: number;
  primaryColor: string | null;
  secondaryColor: string | null;
  footerText: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  link: string | null;
  sortOrder: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

export interface AttributeOption {
  id: string;
  value: string;
  slug: string;
}

export interface CatalogAttribute {
  id: string;
  name: string;
  slug: string;
  dataType: "OPTION" | "TEXT" | "NUMBER" | "BOOLEAN";
  isFilterable: boolean;
  isRequired: boolean;
  sortOrder: number;
  options: AttributeOption[];
}
