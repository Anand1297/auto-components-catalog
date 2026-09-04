import { supabase } from "../lib/supabase";
import businessCatalogService from "./BusinessCatalogService";

class AdminAccessService {
  async hasAdminAccess(userId: string): Promise<boolean> {
    const business = await businessCatalogService.getBusiness();
    const { data, error } = await supabase
      .from("business_users")
      .select("id")
      .eq("business_id", business.id)
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw error;
    return Boolean(data);
  }
}

export default new AdminAccessService();
