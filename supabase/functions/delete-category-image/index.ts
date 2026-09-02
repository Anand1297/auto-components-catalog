import { AwsClient } from "https://esm.sh/aws4fetch@1.0.20";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const accountId =
      Deno.env.get("R2_ACCOUNT_ID");

    const bucketName =
      Deno.env.get("R2_BUCKET_NAME");

    const accessKeyId =
      Deno.env.get("R2_ACCESS_KEY_ID");

    const secretAccessKey =
      Deno.env.get("R2_SECRET_ACCESS_KEY");

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
          error: "Image key is required.",
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
     * This function can only delete
     * category images.
     */
    if (
      !imageKey.startsWith(
        "categories/",
      )
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid category image key.",
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

    const endpoint =
      `https://${accountId}.r2.cloudflarestorage.com`;

    const aws = new AwsClient({
      accessKeyId,
      secretAccessKey,
      service: "s3",
      region: "auto",
    });

    const deleteUrl =
      `${endpoint}/${bucketName}/${imageKey}`;

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
        "R2 category delete failed:",
        deleteResponse.status,
        responseText,
      );

      throw new Error(
        "Unable to delete category image from R2.",
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
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
      "Delete category image error:",
      error,
    );

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete category image.",
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
