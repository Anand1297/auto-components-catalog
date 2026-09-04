import { supabase } from "../lib/supabase";

class PlatformAccessService {
  async isRootAdmin(userId?: string): Promise<boolean> {
    const resolvedUserId = userId ?? (await supabase.auth.getUser()).data.user?.id;
    if (!resolvedUserId) return false;

    const { data, error } = await supabase
      .from("platform_users")
      .select("user_id")
      .eq("user_id", resolvedUserId)
      .eq("role", "ROOT_ADMIN")
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw error;
    return Boolean(data);
  }

  async getBusinessMembership(userId: string, businessId: string) {
    const { data, error } = await supabase
      .from("business_users")
      .select("id,role,is_active")
      .eq("user_id", userId)
      .eq("business_id", businessId)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw error;
    return data;
  }
}

export default new PlatformAccessService();
