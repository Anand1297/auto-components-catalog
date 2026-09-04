import { AwsClient } from "https://esm.sh/aws4fetch@1.0.20";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return jsonResponse(
        { error: "Method not allowed." },
        405,
      );
    }

    // ---------------------------------------------------
    // R2 CONFIGURATION
    // ---------------------------------------------------

    const accountId =
      Deno.env.get("R2_ACCOUNT_ID");

    const bucketName =
      Deno.env.get("BUSINESS_R2_BUCKET_NAME");

    const accessKeyId =
      Deno.env.get("BUSINESS_R2_ACCESS_KEY_ID");

    const secretAccessKey =
      Deno.env.get("BUSINESS_R2_SECRET_ACCESS_KEY");

    if (
      !accountId ||
      !bucketName ||
      !accessKeyId ||
      !secretAccessKey
    ) {
      console.error(
        "Missing R2 configuration",
      );

      throw new Error(
        "Business R2 configuration is missing.",
      );
    }

    // ---------------------------------------------------
    // AUTH CHECK
    // ---------------------------------------------------

    const authHeader =
      req.headers.get("Authorization");

    if (!authHeader) {
      return jsonResponse(
        { error: "Unauthorized." },
        401,
      );
    }

    // ---------------------------------------------------
    // REQUEST BODY
    // ---------------------------------------------------

    const body =
      await req.json();

    const storageKey =
      body?.storageKey;

    if (
      !storageKey ||
      typeof storageKey !== "string"
    ) {
      return jsonResponse(
        {
          error:
            "Storage key is required.",
        },
        400,
      );
    }

    // ---------------------------------------------------
    // SECURITY / PATH VALIDATION
    // ---------------------------------------------------
    //
    // Expected:
    //
    // tarpan-auto/products/<product-id>/<image>.webp
    //
    // abc-furniture/products/<product-id>/<image>.webp
    //

    const pathParts =
      storageKey.split("/");

    if (
      pathParts.length < 4 ||
      pathParts[1] !== "products"
    ) {
      return jsonResponse(
        {
          error:
            "Invalid business product image storage key.",
        },
        400,
      );
    }

    const businessSlug =
      pathParts[0];

    const productId =
      pathParts[2];

    if (
      !businessSlug ||
      !productId
    ) {
      return jsonResponse(
        {
          error:
            "Invalid product image path.",
        },
        400,
      );
    }

    // Prevent suspicious traversal
    if (
      storageKey.includes("..") ||
      storageKey.startsWith("/")
    ) {
      return jsonResponse(
        {
          error:
            "Invalid storage key.",
        },
        400,
      );
    }

    // ---------------------------------------------------
    // R2 CLIENT
    // ---------------------------------------------------

    const endpoint =
      `https://${accountId}.r2.cloudflarestorage.com`;

    const deleteUrl =
      `${endpoint}/${bucketName}/${storageKey}`;

    const aws =
      new AwsClient({
        accessKeyId,
        secretAccessKey,
        service: "s3",
        region: "auto",
      });

    // ---------------------------------------------------
    // DELETE FROM R2
    // ---------------------------------------------------

    const deleteResponse =
      await aws.fetch(
        deleteUrl,
        {
          method: "DELETE",
        },
      );

    if (!deleteResponse.ok) {
      const errorText =
        await deleteResponse.text();

      console.error(
        "Business product R2 delete failed:",
        {
          status:
            deleteResponse.status,
          statusText:
            deleteResponse.statusText,
          response:
            errorText,
          bucketName,
          storageKey,
        },
      );

      throw new Error(
        `R2 delete failed (${deleteResponse.status}): ${errorText}`,
      );
    }

    console.log(
      "Business product image deleted:",
      {
        storageKey,
      },
    );

    // DB row deletion remains in React/service layer.
    return jsonResponse({
      success: true,
      storageKey,
    });
  } catch (error) {
    console.error(
      "Delete business product image error:",
      error,
    );

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete product image.",
      },
      500,
    );
  }
});