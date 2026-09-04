import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function respond(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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

    const authClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user) return respond({ error: "Invalid user session." }, 401);

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      db: { schema: "business_catalog" },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: rootUser, error: rootError } = await admin
      .from("platform_users")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("role", "ROOT_ADMIN")
      .eq("is_active", true)
      .maybeSingle();
    if (rootError) throw rootError;
    if (!rootUser) return respond({ error: "Only a root administrator can create businesses." }, 403);

    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const slug = String(body?.slug ?? "").trim().toLowerCase();
    const phone = String(body?.phone ?? "").trim() || null;
    const whatsapp = String(body?.whatsapp ?? "").trim() || null;
    const email = String(body?.email ?? "").trim() || null;
    const address = String(body?.address ?? "").trim() || null;
    const currency = String(body?.currency ?? "INR").trim().toUpperCase() || "INR";

    if (!name) return respond({ error: "Business name is required." }, 400);
    if (!slug) return respond({ error: "Business slug is required." }, 400);
    if (!/^[a-z0-9-]+$/.test(slug)) return respond({ error: "Slug can contain only lowercase letters, numbers and hyphens." }, 400);

    const { data: duplicate, error: duplicateError } = await admin.from("businesses").select("id").eq("slug", slug).maybeSingle();
    if (duplicateError) throw duplicateError;
    if (duplicate) return respond({ error: "This business slug is already in use." }, 409);

    const { data: business, error: businessError } = await admin.from("businesses").insert({
      name, slug, phone, whatsapp, email, address, currency, is_active: true,
    }).select("*").single();
    if (businessError) throw businessError;

    try {
      const { error: ownerError } = await admin.from("business_users").insert({ business_id: business.id, user_id: user.id, role: "OWNER", is_active: true });
      if (ownerError) throw ownerError;
      const { error: configError } = await admin.from("site_config").insert({
        business_id: business.id,
        catalog_title: name,
        catalog_subtitle: `Welcome to ${name}`,
        latest_section_title: "Latest Products",
        featured_section_title: "Featured Products",
        categories_section_title: "Categories",
        brands_section_title: "Brands",
        show_carousel: true,
        show_latest: true,
        show_featured: true,
        show_categories: true,
        show_brands: true,
        show_testimonials: true,
        products_per_section: 8,
        footer_text: name,
      });
      if (configError) throw configError;
    } catch (setupError) {
      await admin.from("businesses").delete().eq("id", business.id);
      throw setupError;
    }

    return respond({ success: true, business });
  } catch (error) {
    console.error("Create business error:", error);
    return respond({ error: error instanceof Error ? error.message : "Unable to create business." }, 500);
  }
});
