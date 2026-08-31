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

    const publicUrl =
      Deno.env.get("R2_PUBLIC_URL");

    const accessKeyId =
      Deno.env.get("R2_ACCESS_KEY_ID");

    const secretAccessKey =
      Deno.env.get("R2_SECRET_ACCESS_KEY");

    if (
      !accountId ||
      !bucketName ||
      !publicUrl ||
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

    const formData =
      await req.formData();

    const file =
      formData.get("file");

    const productCode =
      formData.get("productCode");

    if (!(file instanceof File)) {
      return new Response(
        JSON.stringify({
          error: "Image file is required.",
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

    if (
      !productCode ||
      typeof productCode !== "string"
    ) {
      return new Response(
        JSON.stringify({
          error: "Product code is required.",
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

    if (!file.type.startsWith("image/")) {
      return new Response(
        JSON.stringify({
          error: "Only image files are allowed.",
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

    const cleanProductCode =
      productCode
        .trim()
        .toUpperCase();

    const safeFileName =
      file.name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(
          /[^a-z0-9._-]/g,
          "",
        );

    const timestamp =
      Date.now();

    const imageKey =
      `products/${cleanProductCode}/${timestamp}_${safeFileName}`;

    const endpoint =
      `https://${accountId}.r2.cloudflarestorage.com`;

    const aws = new AwsClient({
      accessKeyId,
      secretAccessKey,
      service: "s3",
      region: "auto",
    });

    const uploadUrl =
      `${endpoint}/${bucketName}/${imageKey}`;

    const arrayBuffer =
      await file.arrayBuffer();

    const uploadResponse =
      await aws.fetch(
        uploadUrl,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              file.type ||
              "application/octet-stream",
          },

          body: arrayBuffer,
        },
      );

    if (!uploadResponse.ok) {
      const responseText =
        await uploadResponse.text();

      console.error(
        "R2 upload failed:",
        uploadResponse.status,
        responseText,
      );

      throw new Error(
        "Unable to upload image to R2.",
      );
    }

    const imageUrl =
      `${publicUrl.replace(/\/$/, "")}/${imageKey}`;

    return new Response(
      JSON.stringify({
        imageKey,
        imageUrl,
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
      "Upload product image error:",
      error,
    );

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Unable to upload image.",
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