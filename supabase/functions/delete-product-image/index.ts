import { AwsClient } from "https://esm.sh/aws4fetch@1.0.20";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (!req.headers.get("Authorization")) return json({ error: "Unauthorized" }, 401);
    const { storageKey } = await req.json();
    if (typeof storageKey !== "string" || !storageKey.includes("/products/")) return json({ error: "Invalid product image key." }, 400);
    const accountId = Deno.env.get("R2_ACCOUNT_ID"); const bucketName = Deno.env.get("R2_BUCKET_NAME"); const accessKeyId = Deno.env.get("R2_ACCESS_KEY_ID"); const secretAccessKey = Deno.env.get("R2_SECRET_ACCESS_KEY");
    if (!accountId || !bucketName || !accessKeyId || !secretAccessKey) throw new Error("R2 configuration is missing.");
    const aws = new AwsClient({ accessKeyId, secretAccessKey, service: "s3", region: "auto" });
    const encoded = storageKey.split("/").map(encodeURIComponent).join("/");
    const response = await aws.fetch(`https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${encoded}`, { method: "DELETE" });
    if (!response.ok) throw new Error(`R2 delete failed (${response.status}).`);
    return json({ success: true, storageKey });
  } catch (error) { return json({ error: error instanceof Error ? error.message : "Unable to delete image." }, 500); }
});
