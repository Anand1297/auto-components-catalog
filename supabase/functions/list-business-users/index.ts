import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function respond(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return respond({ error: "Method not allowed." }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const authHeader = req.headers.get("Authorization");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) throw new Error("Supabase function configuration is missing.");
    if (!authHeader) return respond({ error: "Unauthorized." }, 401);

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: callerError } = await authClient.auth.getUser();
    if (callerError || !caller) return respond({ error: "Invalid user session." }, 401);

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      db: { schema: "business_catalog" },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: rootUser, error: rootError } = await admin
      .from("platform_users")
      .select("user_id")
      .eq("user_id", caller.id)
      .eq("role", "ROOT_ADMIN")
      .eq("is_active", true)
      .maybeSingle();
    if (rootError) throw rootError;
    if (!rootUser) return respond({ error: "Only a root administrator can view business users." }, 403);

    const body = await req.json();
    const businessId = String(body?.businessId ?? "").trim();
    if (!businessId) return respond({ error: "Business is required." }, 400);

    const { data: mappings, error: mappingError } = await admin
      .from("business_users")
      .select("id,user_id,role,is_active,created_at")
      .eq("business_id", businessId)
      .order("created_at", { ascending: true });
    if (mappingError) throw mappingError;

    const users = await Promise.all(
      (mappings ?? []).map(async (mapping) => {
        const { data, error } = await admin.auth.admin.getUserById(mapping.user_id);
        if (error) {
          console.error(`Unable to load auth user ${mapping.user_id}:`, error);
        }
        return {
          mappingId: mapping.id,
          userId: mapping.user_id,
          email: data?.user?.email ?? "",
          role: mapping.role,
          isActive: mapping.is_active,
          createdAt: mapping.created_at,
        };
      }),
    );

    return respond({ success: true, users });
  } catch (error) {
    console.error("List business users error:", error);
    return respond({ error: error instanceof Error ? error.message : "Unable to load business users." }, 500);
  }
});
