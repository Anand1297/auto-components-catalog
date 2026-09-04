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

async function findUserByEmail(admin: ReturnType<typeof createClient>, email: string) {
  const perPage = 200;
  for (let page = 1; page <= 50; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const user = data.users.find((item) => item.email?.toLowerCase() === email);
    if (user) return user;
    if (data.users.length < perPage) return null;
  }
  throw new Error("Unable to search the complete authentication user list.");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return respond({ error: "Method not allowed." }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const authHeader = req.headers.get("Authorization");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      throw new Error("Supabase function configuration is missing.");
    }
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
    if (!rootUser) return respond({ error: "Only a root administrator can add business users." }, 403);

    const body = await req.json();
    const businessId = String(body?.businessId ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const role = String(body?.role ?? "ADMIN").trim().toUpperCase();
    const redirectTo = String(body?.redirectTo ?? "").trim() || undefined;

    if (!businessId) return respond({ error: "Business is required." }, 400);
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return respond({ error: "A valid email is required." }, 400);
    if (!['OWNER', 'ADMIN'].includes(role)) return respond({ error: "Role must be OWNER or ADMIN." }, 400);

    const { data: business, error: businessError } = await admin
      .from("businesses")
      .select("id,name,is_active")
      .eq("id", businessId)
      .maybeSingle();
    if (businessError) throw businessError;
    if (!business) return respond({ error: "Business not found." }, 404);
    if (!business.is_active) return respond({ error: "Cannot add users to an inactive business." }, 400);

    let authUser = await findUserByEmail(admin, email);
    let invited = false;
    let createdForInvite = false;

    if (!authUser) {
      const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
        email,
        redirectTo ? { redirectTo } : undefined,
      );
      if (inviteError) throw inviteError;
      if (!inviteData.user) throw new Error("Supabase did not return the invited user.");
      authUser = inviteData.user;
      invited = true;
      createdForInvite = true;
    }

    try {
      const { error: mappingError } = await admin
        .from("business_users")
        .upsert(
          {
            business_id: businessId,
            user_id: authUser.id,
            role,
            is_active: true,
          },
          { onConflict: "business_id,user_id" },
        );
      if (mappingError) throw mappingError;
    } catch (mappingError) {
      if (createdForInvite) {
        await admin.auth.admin.deleteUser(authUser.id).catch(() => undefined);
      }
      throw mappingError;
    }

    return respond({
      success: true,
      userId: authUser.id,
      email,
      role,
      invited,
      existingUser: !invited,
    });
  } catch (error) {
    console.error("Create business user error:", error);
    return respond({ error: error instanceof Error ? error.message : "Unable to add business user." }, 500);
  }
});
