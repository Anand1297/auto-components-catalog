import { AwsClient } from "https://esm.sh/aws4fetch@1.0.20";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (!req.headers.get("Authorization")) return json({ error: "Unauthorized" }, 401);
    const accountId = Deno.env.get("R2_ACCOUNT_ID");
    const bucketName = Deno.env.get("R2_BUCKET_NAME");
    const publicUrl = Deno.env.get("R2_PUBLIC_URL");
    const accessKeyId = Deno.env.get("R2_ACCESS_KEY_ID");
    const secretAccessKey = Deno.env.get("R2_SECRET_ACCESS_KEY");
    if (!accountId || !bucketName || !publicUrl || !accessKeyId || !secretAccessKey) throw new Error("R2 configuration is missing.");

    const form = await req.formData();
    const file = form.get("file");
    const businessSlug = form.get("businessSlug");
    const productId = form.get("productId");
    if (!(file instanceof File) || !file.type.startsWith("image/")) return json({ error: "Valid image file is required." }, 400);
    if (typeof businessSlug !== "string" || typeof productId !== "string") return json({ error: "Business slug and product ID are required." }, 400);

    const safeBusiness = businessSlug.toLowerCase().replace(/[^a-z0-9-]/g, "");
    const safeProduct = productId.toLowerCase().replace(/[^a-z0-9-]/g, "");
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const storageKey = `${safeBusiness}/products/${safeProduct}/${crypto.randomUUID()}.${ext}`;
    const aws = new AwsClient({ accessKeyId, secretAccessKey, service: "s3", region: "auto" });
    const endpoint = `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${storageKey}`;
    const response = await aws.fetch(endpoint, { method: "PUT", headers: { "Content-Type": file.type }, body: await file.arrayBuffer() });
    if (!response.ok) throw new Error(`R2 upload failed (${response.status}).`);
    return json({ storageKey, imageUrl: `${publicUrl.replace(/\/$/, "")}/${storageKey}` });
  } catch (error) {
    console.error(error);
    return json({ error: error instanceof Error ? error.message : "Unable to upload image." }, 500);
  }
});
