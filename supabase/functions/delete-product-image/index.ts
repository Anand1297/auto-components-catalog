import { AwsClient } from "https://esm.sh/aws4fetch@1.0.20";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // ============================================================
  // CORS
  // ============================================================

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    // ============================================================
    // AUTH CHECK
    // ============================================================

    const authHeader =
      req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        },
      );
    }

    // ============================================================
    // ENVIRONMENT VARIABLES
    // ============================================================

    const accountId =
      Deno.env.get("R2_ACCOUNT_ID");

    const bucketName =
      Deno.env.get("R2_BUCKET_NAME");

    const accessKeyId =
      Deno.env.get("R2_ACCESS_KEY_ID");

    const secretAccessKey =
      Deno.env.get(
        "R2_SECRET_ACCESS_KEY",
      );

    if (
      !accountId ||
      !bucketName ||
      !accessKeyId ||
      !secretAccessKey
    ) {
      throw new Error(
        "R2 configuration is missing.",
      );
    }

    // ============================================================
    // REQUEST BODY
    // ============================================================

    const body =
      await req.json();

    const imageKey =
      body?.imageKey;

    if (
      !imageKey ||
      typeof imageKey !== "string"
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Image key is required.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        },
      );
    }

    /*
     * Important safety check.
     *
     * Our product images should only exist
     * under products/.
     */
    if (
      !imageKey.startsWith(
        "products/",
      )
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid product image key.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        },
      );
    }

    // ============================================================
    // R2 CLIENT
    // ============================================================

    const aws =
      new AwsClient({
        accessKeyId,
        secretAccessKey,
        service: "s3",
        region: "auto",
      });

    const endpoint =
      `https://${accountId}.r2.cloudflarestorage.com`;

    /*
     * Encode individual path segments while
     * preserving the / separators.
     */
    const encodedImageKey =
      imageKey
        .split("/")
        .map(encodeURIComponent)
        .join("/");

    const deleteUrl =
      `${endpoint}/${bucketName}/${encodedImageKey}`;

    // ============================================================
    // DELETE FROM R2
    // ============================================================

    const deleteResponse =
      await aws.fetch(
        deleteUrl,
        {
          method: "DELETE",
        },
      );

    if (!deleteResponse.ok) {
      const responseText =
        await deleteResponse.text();

      console.error(
        "R2 delete failed:",
        deleteResponse.status,
        responseText,
      );

      throw new Error(
        "Unable to delete image from R2.",
      );
    }

    // ============================================================
    // SUCCESS
    // ============================================================

    return new Response(
      JSON.stringify({
        success: true,
        imageKey,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      },
    );
  } catch (error) {
    console.error(
      "Delete product image error:",
      error,
    );

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete image.",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      },
    );
  }
});