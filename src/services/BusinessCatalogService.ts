import { supabase } from "../lib/supabase";
import type { Banner, Business, SiteConfig } from "../models/Catalog";

class BusinessCatalogService {
  private activeBusinessSlug: string | null = null;
  private businessPromise: Promise<Business> | null = null;

  setActiveBusinessSlug(slug: string) {
    if (this.activeBusinessSlug !== slug) {
      this.activeBusinessSlug = slug;
      this.businessPromise = null;
    }
  }

  clearActiveBusiness() {
    this.activeBusinessSlug = null;
    this.businessPromise = null;
  }

  getBusinessSlug() {
    return this.activeBusinessSlug;
  }

  getCatalogBasePath() {
    if (!this.activeBusinessSlug) throw new Error("No active business selected.");
    return `/catalog/${this.activeBusinessSlug}`;
  }

  getAdminBasePath() {
    if (!this.activeBusinessSlug) throw new Error("No active business selected.");
    return `/admin/business/${this.activeBusinessSlug}`;
  }

  async getBusinessBySlug(slug: string): Promise<Business> {
    const { data, error } = await supabase
      .from("businesses")
      .select("id,name,slug,logo_url,phone,whatsapp,email,address,currency")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      logoUrl: data.logo_url,
      phone: data.phone,
      whatsapp: data.whatsapp,
      email: data.email,
      address: data.address,
      currency: data.currency,
    };
  }

  async getBusiness(): Promise<Business> {
    if (!this.activeBusinessSlug) {
      throw new Error("No active business selected. Open a business catalog or admin workspace first.");
    }
    if (!this.businessPromise) {
      this.businessPromise = this.getBusinessBySlug(this.activeBusinessSlug);
    }
    return this.businessPromise;
  }

  async getSiteConfig(): Promise<SiteConfig | null> {
    const business = await this.getBusiness();
    const { data, error } = await supabase.from("site_config").select("*").eq("business_id", business.id).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      businessId: data.business_id,
      catalogTitle: data.catalog_title ?? business.name,
      catalogSubtitle: data.catalog_subtitle ?? "",
      latestSectionTitle: data.latest_section_title ?? "Latest Products",
      featuredSectionTitle: data.featured_section_title ?? "Featured Products",
      categoriesSectionTitle: data.categories_section_title ?? "Categories",
      brandsSectionTitle: data.brands_section_title ?? "Brands",
      showCarousel: data.show_carousel ?? true,
      showLatest: data.show_latest ?? true,
      showFeatured: data.show_featured ?? true,
      showCategories: data.show_categories ?? true,
      showBrands: data.show_brands ?? true,
      showTestimonials: data.show_testimonials ?? true,
      productsPerSection: data.products_per_section ?? 8,
      primaryColor: data.primary_color,
      secondaryColor: data.secondary_color,
      footerText: data.footer_text ?? business.name,
    };
  }

  async getBanners(): Promise<Banner[]> {
    const business = await this.getBusiness();
    const { data, error } = await supabase.from("banners").select("id,title,subtitle,image_url,link,sort_order").eq("business_id", business.id).eq("is_active", true).order("sort_order");
    if (error) throw error;
    return (data ?? []).map((row) => ({ id: row.id, title: row.title ?? "", subtitle: row.subtitle ?? "", imageUrl: row.image_url ?? "", link: row.link, sortOrder: row.sort_order ?? 0 }));
  }
}

export default new BusinessCatalogService();
