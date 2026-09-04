import { supabase } from "../lib/supabase";
import businessCatalogService from "./BusinessCatalogService";
import type { BusinessSettings } from "../models/BusinessSettings";

class BusinessSettingsService {
  async getBusinessSettings(): Promise<BusinessSettings | null> {
    const business = await businessCatalogService.getBusiness();
    const { data: config, error } = await supabase.from("site_config").select("instagram_url,facebook_url,updated_at").eq("business_id", business.id).maybeSingle();
    if (error) throw error;
    return {
      id: business.id,
      business_name: business.name,
      phone: business.phone,
      mobile: business.phone,
      whatsapp: business.whatsapp,
      email: business.email,
      address: business.address,
      city: null,
      state: null,
      pincode: null,
      instagram_url: config?.instagram_url ?? null,
      facebook_url: config?.facebook_url ?? null,
      updated_at: config?.updated_at ?? "",
    };
  }

  async updateBusinessSettings(id: string, settings: Partial<BusinessSettings>): Promise<BusinessSettings> {
    const addressParts = [settings.address, settings.city, settings.state, settings.pincode].filter(Boolean);
    const { error: businessError } = await supabase.from("businesses").update({
      name: settings.business_name,
      phone: settings.phone || settings.mobile || null,
      whatsapp: settings.whatsapp || null,
      email: settings.email || null,
      address: addressParts.join(", ") || null,
    }).eq("id", id);
    if (businessError) throw businessError;

    const { error: configError } = await supabase.from("site_config").update({ instagram_url: settings.instagram_url || null, facebook_url: settings.facebook_url || null }).eq("business_id", id);
    if (configError) throw configError;
    businessCatalogService["businessPromise"] = null as never;
    return (await this.getBusinessSettings()) as BusinessSettings;
  }
}

export default new BusinessSettingsService();
