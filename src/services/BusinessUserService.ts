import { supabase } from "../lib/supabase";

export type BusinessUserRole = "OWNER" | "ADMIN";

export interface BusinessUserItem {
  mappingId: string;
  userId: string;
  email: string;
  role: BusinessUserRole;
  isActive: boolean;
  createdAt: string | null;
}

export interface AddBusinessUserRequest {
  businessId: string;
  email: string;
  role: BusinessUserRole;
  redirectTo?: string;
}

class BusinessUserService {
  async listBusinessUsers(businessId: string): Promise<BusinessUserItem[]> {
    const { data, error } = await supabase.functions.invoke("list-business-users", {
      body: { businessId },
    });

    if (error) {
      let message = error.message;
      const context = (error as { context?: Response }).context;
      if (context) {
        try {
          const body = await context.clone().json();
          message = body?.error || message;
        } catch {
          // Keep the original function error.
        }
      }
      throw new Error(message);
    }

    if (!data?.success) throw new Error(data?.error || "Unable to load business users.");
    return (data.users ?? []) as BusinessUserItem[];
  }

  async addBusinessUser(request: AddBusinessUserRequest) {
    const { data, error } = await supabase.functions.invoke("create-business-user", {
      body: request,
    });

    if (error) {
      let message = error.message;
      const context = (error as { context?: Response }).context;
      if (context) {
        try {
          const body = await context.clone().json();
          message = body?.error || message;
        } catch {
          // Keep the original function error.
        }
      }
      throw new Error(message);
    }

    if (!data?.success) throw new Error(data?.error || "Unable to add business user.");
    return data as {
      success: true;
      userId: string;
      email: string;
      role: BusinessUserRole;
      invited: boolean;
      existingUser: boolean;
    };
  }
}

export default new BusinessUserService();
