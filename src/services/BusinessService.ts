import { supabase } from "../lib/supabase";

export interface ManagedBusiness {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  currency: string;
  is_active: boolean;
  created_at: string | null;
  role?: "OWNER" | "ADMIN";
}

export interface CreateBusinessRequest {
  name: string;
  slug: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  currency?: string;
}

class BusinessService {
  async getMyBusinesses(): Promise<ManagedBusiness[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not logged in.");

    const { data, error } = await supabase
      .from("business_users")
      .select(`role,is_active,businesses(id,name,slug,logo_url,phone,whatsapp,email,address,currency,is_active,created_at)`)
      .eq("user_id", user.id)
      .eq("is_active", true);
    if (error) throw error;

    return (data ?? []).map((row: any) => {
      const business = Array.isArray(row.businesses) ? row.businesses[0] : row.businesses;
      return business ? { ...business, role: row.role } : null;
    }).filter(Boolean) as ManagedBusiness[];
  }

  async getAllBusinesses(): Promise<ManagedBusiness[]> {
    const { data, error } = await supabase
      .from("businesses")
      .select("id,name,slug,logo_url,phone,whatsapp,email,address,currency,is_active,created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as ManagedBusiness[];
  }

  async createBusiness(request: CreateBusinessRequest): Promise<ManagedBusiness> {
    const { data, error } = await supabase.functions.invoke("create-business", { body: request });
    if (error) {
      let message = error.message;
      const context = (error as { context?: Response }).context;
      if (context) {
        try { const body = await context.clone().json(); message = body?.error || message; } catch { /* keep original */ }
      }
      throw new Error(message);
    }
    if (!data?.success || !data?.business) throw new Error(data?.error || "Unable to create business.");
    return { ...data.business, role: "OWNER" } as ManagedBusiness;
  }
}

export default new BusinessService();
