import { supabase } from "../lib/supabase";
import businessCatalogService from "./BusinessCatalogService";
import type { CatalogAttribute } from "../models/Catalog";

class AttributeService {
  async getFilterableAttributes(): Promise<CatalogAttribute[]> {
    const business = await businessCatalogService.getBusiness();
    const { data, error } = await supabase
      .from("attributes")
      .select(`id,name,slug,data_type,is_filterable,is_required,sort_order,attribute_options(id,value,slug,sort_order,is_active)`)
      .eq("business_id", business.id)
      .eq("is_active", true)
      .eq("is_filterable", true)
      .order("sort_order");
    if (error) throw error;
    return (data ?? []).map((row: any) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      dataType: row.data_type,
      isFilterable: row.is_filterable,
      isRequired: row.is_required,
      sortOrder: row.sort_order ?? 0,
      options: (row.attribute_options ?? [])
        .filter((o: any) => o.is_active !== false)
        .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((o: any) => ({ id: o.id, value: o.value, slug: o.slug })),
    }));
  }
}

export default new AttributeService();
