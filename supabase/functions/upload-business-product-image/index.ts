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

    const publicUrl =
      Deno.env.get("BUSINESS_R2_PUBLIC_URL");

    const accessKeyId =
      Deno.env.get("BUSINESS_R2_ACCESS_KEY_ID");

    const secretAccessKey =
      Deno.env.get("BUSINESS_R2_SECRET_ACCESS_KEY");

    if (
      !accountId ||
      !bucketName ||
      !publicUrl ||
      !accessKeyId ||
      !secretAccessKey
    ) {
      console.error("Missing R2 configuration", {
        accountId: !!accountId,
        bucketName: !!bucketName,
        publicUrl: !!publicUrl,
        accessKeyId: !!accessKeyId,
        secretAccessKey: !!secretAccessKey,
      });

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
    // READ MULTIPART FORM DATA
    // ---------------------------------------------------

    const formData =
      await req.formData();

    const file =
      formData.get("file");

    const businessSlug =
      formData.get("businessSlug");

    const productId =
      formData.get("productId");

    if (!(file instanceof File)) {
      return jsonResponse(
        { error: "Valid image file is required." },
        400,
      );
    }

    if (
      !businessSlug ||
      typeof businessSlug !== "string"
    ) {
      return jsonResponse(
        { error: "Business slug is required." },
        400,
      );
    }

    if (
      !productId ||
      typeof productId !== "string"
    ) {
      return jsonResponse(
        { error: "Product ID is required." },
        400,
      );
    }

    // ---------------------------------------------------
    // FILE VALIDATION
    // ---------------------------------------------------

    if (
      file.type &&
      !file.type.startsWith("image/")
    ) {
      return jsonResponse(
        {
          error:
            "Only image files can be uploaded.",
        },
        400,
      );
    }

    // 10 MB maximum
    const maxFileSize =
      10 * 1024 * 1024;

    if (file.size > maxFileSize) {
      return jsonResponse(
        {
          error:
            "Image size must be less than 10 MB.",
        },
        400,
      );
    }

    // ---------------------------------------------------
    // GENERATE SAFE EXTENSION
    // ---------------------------------------------------

    let extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase() || "";

    extension =
      extension.replace(
        /[^a-z0-9]/g,
        "",
      );

    // fallback from MIME type
    if (!extension) {
      switch (file.type) {
        case "image/png":
          extension = "png";
          break;

        case "image/webp":
          extension = "webp";
          break;

        case "image/gif":
          extension = "gif";
          break;

        default:
          extension = "jpg";
      }
    }

    // ---------------------------------------------------
    // R2 STORAGE KEY
    // ---------------------------------------------------

    const imageId =
      crypto.randomUUID();

    const storageKey =
      `${businessSlug}/products/${productId}/${imageId}.${extension}`;

    const endpoint =
      `https://${accountId}.r2.cloudflarestorage.com`;

    const uploadUrl =
      `${endpoint}/${bucketName}/${storageKey}`;

    // ---------------------------------------------------
    // AWS SIGNED R2 CLIENT
    // ---------------------------------------------------

    const aws =
      new AwsClient({
        accessKeyId,
        secretAccessKey,
        service: "s3",
        region: "auto",
      });

    // ---------------------------------------------------
    // UPLOAD TO R2
    // ---------------------------------------------------

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

          body: file,
        },
      );

    if (!uploadResponse.ok) {
      const errorText =
        await uploadResponse.text();

      console.error(
        "Business product R2 upload failed:",
        {
          status:
            uploadResponse.status,
          statusText:
            uploadResponse.statusText,
          response:
            errorText,
          bucketName,
          storageKey,
        },
      );

      throw new Error(
        `R2 upload failed (${uploadResponse.status}): ${errorText}`,
      );
    }

    // ---------------------------------------------------
    // CREATE PUBLIC IMAGE URL
    // ---------------------------------------------------

    const cleanPublicUrl =
      publicUrl.replace(/\/+$/, "");

    const imageUrl =
      `${cleanPublicUrl}/${storageKey}`;

    console.log(
      "Business product image uploaded:",
      {
        businessSlug,
        productId,
        storageKey,
      },
    );

    // IMPORTANT:
    // DB insert is handled by React/service layer.
    // This function only uploads the physical file.
    return jsonResponse({
      success: true,

      imageUrl,
      storageKey,

      fileName:
        file.name,

      contentType:
        file.type,

      size:
        file.size,
    });
  } catch (error) {
    console.error(
      "Upload business product image error:",
      error,
    );

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to upload product image.",
      },
      500,
    );
  }
});