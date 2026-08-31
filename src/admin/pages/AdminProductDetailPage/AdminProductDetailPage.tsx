import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import supabaseProductService from "../../../services/SupabaseProductService";

import adminProductImageService, {
  type AdminProductImage,
} from "../../../services/AdminProductImageService";

import adminMasterDataService, {
  type AdminCar,
  type AdminCategory,
  type AdminCompany,
  type AdminModel,
} from "../../../services/AdminMasterDataService";

import type { Product } from "../../../models/Product";

import "./AdminProductDetailPage.css";

interface EditProductForm {
  productName: string;
  productCode: string;

  categoryType:
    | "INTERIOR"
    | "EXTERIOR"
    | "";

  categoryId: string;
  companyId: string;

  carId: string;
  modelId: string;

  car: string;
  model: string;

  color: string;
  mrp: string;
  packagingUnit: string;
}

const emptyForm: EditProductForm = {
  productName: "",
  productCode: "",

  categoryType: "",

  categoryId: "",
  companyId: "",

  carId: "",
  modelId: "",

  car: "",
  model: "",

  color: "",
  mrp: "",
  packagingUnit: "",
};

function AdminProductDetailPage() {
  const navigate = useNavigate();

  const { productId } = useParams<{
    productId: string;
  }>();

  const [product, setProduct] =
    useState<Product | null>(null);

  const [formData, setFormData] =
    useState<EditProductForm>(emptyForm);

  const [categories, setCategories] =
    useState<AdminCategory[]>([]);

  const [companies, setCompanies] =
    useState<AdminCompany[]>([]);

  const [cars, setCars] =
    useState<AdminCar[]>([]);

  const [models, setModels] =
    useState<AdminModel[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [editMode, setEditMode] =
    useState(false);

  const [error, setError] =
    useState("");

  const [productImages, setProductImages] =
    useState<AdminProductImage[]>([]);

  const [selectedImages, setSelectedImages] =
    useState<File[]>([]);

  const [imagePreviews, setImagePreviews] =
    useState<string[]>([]);

  const [uploadingImages, setUploadingImages] =
    useState(false);

  const [deletingImageId, setDeletingImageId] =
    useState<string | null>(null);

  const [reorderingImages, setReorderingImages] =
    useState(false);

  // ============================================================
  // LOAD PRODUCT + MASTER DATA
  // ============================================================

  useEffect(() => {
    if (!productId) {
      return;
    }

    let cancelled = false;

    const loadPage = async () => {
      try {
        const [
          productResult,
          categoryResult,
          companyResult,
          carResult,
          imageResult,
        ] = await Promise.all([
          supabaseProductService
            .getProductById(productId),

          adminMasterDataService
            .getCategories(),

          adminMasterDataService
            .getCompanies(),

          adminMasterDataService
            .getCars(),

          adminProductImageService
            .getProductImages(productId),
        ]);

        if (
          cancelled ||
          !productResult
        ) {
          return;
        }

        setProduct(productResult);
        setProductImages(imageResult);

        setCategories(categoryResult);
        setCompanies(companyResult);
        setCars(carResult);

        const category =
          categoryResult.find(
            (item) =>
              item.name ===
                productResult.categoryName &&
              item.type ===
                productResult.categoryType,
          );

        const company =
          companyResult.find(
            (item) =>
              item.name ===
              productResult.company,
          );

        const car =
          carResult.find(
            (item) =>
              item.name ===
              productResult.car,
          );

        let modelId = "";
        let loadedModels:
          AdminModel[] = [];

        if (car) {
          loadedModels =
            await adminMasterDataService
              .getModelsByCar(car.id);

          const model =
            loadedModels.find(
              (item) =>
                item.name ===
                productResult.model,
            );

          modelId =
            model?.id ?? "";
        }

        if (cancelled) {
          return;
        }

        setModels(loadedModels);

        setFormData({
          productName:
            productResult.productName,

          productCode:
            productResult.productCode,

          categoryType:
            productResult.categoryType,

          categoryId:
            category?.id ?? "",

          companyId:
            company?.id ?? "",

          carId:
            car?.id ?? "",

          modelId,

          car:
            productResult.car,

          model:
            productResult.model,

          color:
            productResult.color,

          mrp:
            String(productResult.mrp),

          packagingUnit:
            productResult.packagingUnit,
        });
      } catch (err) {
        console.error(
          "Failed to load product:",
          err,
        );

        if (!cancelled) {
          setError(
            "Unable to load product.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPage();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  // ============================================================
  // FIELD UPDATE
  // ============================================================

  const updateField = (
    field: keyof EditProductForm,
    value: string,
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  // ============================================================
  // CATEGORY CHANGE
  // ============================================================

  const handleCategoryTypeChange = (
    value:
      | "INTERIOR"
      | "EXTERIOR"
      | "",
  ) => {
    setFormData((current) => ({
      ...current,
      categoryType: value,
      categoryId: "",
    }));
  };

  // ============================================================
  // CAR CHANGE
  // ============================================================

  const handleCarChange = async (
    carId: string,
  ) => {
    const selectedCar =
      cars.find(
        (item) =>
          item.id === carId,
      );

    setFormData((current) => ({
      ...current,

      carId,

      car:
        selectedCar?.name ?? "",

      modelId: "",
      model: "",
    }));

    if (!carId) {
      setModels([]);
      return;
    }

    try {
      const result =
        await adminMasterDataService
          .getModelsByCar(carId);

      setModels(result);
    } catch (err) {
      console.error(
        "Failed to load models:",
        err,
      );

      setModels([]);
    }
  };

  // ============================================================
  // MODEL CHANGE
  // ============================================================

  const handleModelChange = (
    modelId: string,
  ) => {
    const selectedModel =
      models.find(
        (item) =>
          item.id === modelId,
      );

    setFormData((current) => ({
      ...current,

      modelId,

      model:
        selectedModel?.name ?? "",
    }));
  };

  // ============================================================
  // IMAGE SELECTION
  // ============================================================

  const handleImageSelection = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const files =
      Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    const validImages =
      files.filter((file) =>
        file.type.startsWith("image/"),
      );

    if (validImages.length !== files.length) {
      setError(
        "Only image files are allowed.",
      );
    } else {
      setError("");
    }

    const previews =
      validImages.map((file) =>
        URL.createObjectURL(file),
      );

    setSelectedImages((current) => [
      ...current,
      ...validImages,
    ]);

    setImagePreviews((current) => [
      ...current,
      ...previews,
    ]);

    event.target.value = "";
  };

  const removeSelectedImage = (
    index: number,
  ) => {
    URL.revokeObjectURL(
      imagePreviews[index],
    );

    setSelectedImages((current) =>
      current.filter(
        (_, currentIndex) =>
          currentIndex !== index,
      ),
    );

    setImagePreviews((current) =>
      current.filter(
        (_, currentIndex) =>
          currentIndex !== index,
      ),
    );
  };

  // ============================================================
  // UPLOAD IMAGES
  // ============================================================

  const handleUploadImages = async () => {
    if (
      !productId ||
      selectedImages.length === 0
    ) {
      return;
    }

    setUploadingImages(true);
    setError("");

    try {
      const uploaded =
        await adminProductImageService
          .uploadProductImages(
            productId,
            formData.productCode,
            selectedImages,
            productImages.length + 1,
          );

      setProductImages((current) => [
        ...current,
        ...uploaded,
      ]);

      imagePreviews.forEach((preview) =>
        URL.revokeObjectURL(preview),
      );

      setSelectedImages([]);
      setImagePreviews([]);

      const refreshed =
        await supabaseProductService
          .getProductById(productId);

      if (refreshed) {
        setProduct(refreshed);
      }
    } catch (err) {
      console.error(
        "Image upload failed:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload images.",
      );
    } finally {
      setUploadingImages(false);
    }
  };

  // ============================================================
  // DELETE IMAGE
  // ============================================================

  const handleDeleteImage = async (
    image: AdminProductImage,
  ) => {
    const confirmed =
      window.confirm(
        "Delete this product image?",
      );

    if (!confirmed) {
      return;
    }

    setDeletingImageId(image.id);
    setError("");

    try {
      await adminProductImageService
        .deleteProductImage(image);

      const remainingImages =
        productImages.filter(
          (item) =>
            item.id !== image.id,
        );

      await adminProductImageService
        .updateSortOrder(
          remainingImages,
        );

      const normalizedImages =
        remainingImages.map(
          (item, index) => ({
            ...item,
            sortOrder: index + 1,
          }),
        );

      setProductImages(
        normalizedImages,
      );

      if (productId) {
        const refreshed =
          await supabaseProductService
            .getProductById(productId);

        if (refreshed) {
          setProduct(refreshed);
        }
      }
    } catch (err) {
      console.error(
        "Image delete failed:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete image.",
      );
    } finally {
      setDeletingImageId(null);
    }
  };

  // ============================================================
  // REORDER IMAGES
  // ============================================================

  const moveImage = async (
    index: number,
    direction: "left" | "right",
  ) => {
    const targetIndex =
      direction === "left"
        ? index - 1
        : index + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= productImages.length
    ) {
      return;
    }

    const reordered = [
      ...productImages,
    ];

    [
      reordered[index],
      reordered[targetIndex],
    ] = [
      reordered[targetIndex],
      reordered[index],
    ];

    const normalized =
      reordered.map(
        (image, currentIndex) => ({
          ...image,
          sortOrder:
            currentIndex + 1,
        }),
      );

    setProductImages(normalized);
    setReorderingImages(true);
    setError("");

    try {
      await adminProductImageService
        .updateSortOrder(normalized);

      if (productId) {
        const refreshed =
          await supabaseProductService
            .getProductById(productId);

        if (refreshed) {
          setProduct(refreshed);
        }
      }
    } catch (err) {
      console.error(
        "Image reorder failed:",
        err,
      );

      setError(
        "Unable to change image order.",
      );

      if (productId) {
        try {
          const images =
            await adminProductImageService
              .getProductImages(productId);

          setProductImages(images);
        } catch (reloadError) {
          console.error(
            "Failed to reload image order:",
            reloadError,
          );
        }
      }
    } finally {
      setReorderingImages(false);
    }
  };

  // ============================================================
  // SAVE
  // ============================================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!productId) {
      return;
    }

    setError("");

    if (!formData.productName.trim()) {
      setError(
        "Product name is required.",
      );

      return;
    }

    if (!formData.productCode.trim()) {
      setError(
        "Product code is required.",
      );

      return;
    }

    if (!formData.categoryId) {
      setError(
        "Category is required.",
      );

      return;
    }

    if (!formData.companyId) {
      setError(
        "Company is required.",
      );

      return;
    }

    if (!formData.car.trim()) {
      setError(
        "Car is required.",
      );

      return;
    }

    const mrp =
      Number(formData.mrp);

    if (
      Number.isNaN(mrp) ||
      mrp <= 0
    ) {
      setError(
        "MRP must be a valid positive number.",
      );

      return;
    }

    setSaving(true);

    try {
      await supabaseProductService
        .updateProduct(
          productId,
          {
            categoryId:
              formData.categoryId,

            companyId:
              formData.companyId,

            car:
              formData.car,

            model:
              formData.model,

            color:
              formData.color,

            mrp,

            productName:
              formData.productName,

            productCode:
              formData.productCode,

            packagingUnit:
              formData.packagingUnit,
          },
        );

      const updatedProduct =
        await supabaseProductService
          .getProductById(
            productId,
          );

      if (updatedProduct) {
        setProduct(
          updatedProduct,
        );
      }

      setEditMode(false);
    } catch (err) {
      console.error(
        "Failed to update product:",
        err,
      );

      setError(
        "Unable to update product.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  // ============================================================
// DELETE PRODUCT + ALL R2 IMAGES
// ============================================================

const handleDelete = async () => {
  if (!productId) {
    return;
  }

  const confirmed =
    window.confirm(
      "Are you sure you want to delete this product? All product images will also be permanently deleted.",
    );

  if (!confirmed) {
    return;
  }

  setDeleting(true);
  setError("");

  try {
    await supabaseProductService
      .deleteProductCompletely(
        productId,
      );

    navigate("/admin/products");
  } catch (err) {
    console.error(
      "Failed to delete product:",
      err,
    );

    setError(
      err instanceof Error
        ? err.message
        : "Unable to delete product.",
    );

    setDeleting(false);
  }
};
  // ============================================================
  // DERIVED CATEGORY LIST
  // ============================================================

  const availableCategories =
    categories.filter(
      (category) =>
        !formData.categoryType ||
        category.type ===
          formData.categoryType,
    );

  // ============================================================
  // LOADING / NOT FOUND
  // ============================================================

  if (loading) {
    return (
      <div className="admin-product-detail-page__state">
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="admin-product-detail-page__state">
        Product not found.
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="admin-product-detail-page">

      <div className="admin-product-detail-page__header">
        <div>
          <h1>
            {product.productName}
          </h1>

          <p>
            {product.productCode}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/admin/products",
            )
          }
        >
          ← Back
        </button>
      </div>

      {/* PRODUCT IMAGE MANAGER */}

      <section className="admin-product-detail-page__image-section">
        <div className="admin-product-detail-page__image-header">
          <div>
            <h2>Product Images</h2>
            <p>
              The first image is used as the primary product image.
            </p>
          </div>

          {editMode && (
            <label className="admin-product-detail-page__image-picker">
              + Add Images

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelection}
              />
            </label>
          )}
        </div>

        {productImages.length === 0 &&
          imagePreviews.length === 0 && (
            <div className="admin-product-detail-page__no-images">
              No product images
            </div>
          )}

        <div className="admin-product-detail-page__image-grid">
          {productImages.map(
            (image, index) => (
              <div
                key={image.id}
                className="admin-product-detail-page__image-card"
              >
                <img
                  src={image.imageUrl}
                  alt={`${product.productName} ${index + 1}`}
                />

                <div className="admin-product-detail-page__image-position">
                  {index === 0
                    ? "Primary"
                    : `#${index + 1}`}
                </div>

                {editMode && (
                  <div className="admin-product-detail-page__image-controls">
                    <button
                      type="button"
                      disabled={
                        index === 0 ||
                        reorderingImages
                      }
                      onClick={() =>
                        moveImage(
                          index,
                          "left",
                        )
                      }
                      title="Move left"
                    >
                      ←
                    </button>

                    <button
                      type="button"
                      disabled={
                        index ===
                          productImages.length - 1 ||
                        reorderingImages
                      }
                      onClick={() =>
                        moveImage(
                          index,
                          "right",
                        )
                      }
                      title="Move right"
                    >
                      →
                    </button>

                    <button
                      type="button"
                      className="admin-product-detail-page__image-delete"
                      disabled={
                        deletingImageId === image.id
                      }
                      onClick={() =>
                        handleDeleteImage(image)
                      }
                    >
                      {deletingImageId === image.id
                        ? "..."
                        : "Delete"}
                    </button>
                  </div>
                )}
              </div>
            ),
          )}

          {imagePreviews.map(
            (preview, index) => (
              <div
                key={preview}
                className="admin-product-detail-page__image-card admin-product-detail-page__image-card--pending"
              >
                <img
                  src={preview}
                  alt="New product"
                />

                <div className="admin-product-detail-page__image-position">
                  New
                </div>

                <button
                  type="button"
                  className="admin-product-detail-page__pending-remove"
                  onClick={() =>
                    removeSelectedImage(index)
                  }
                  aria-label="Remove selected image"
                >
                  ×
                </button>
              </div>
            ),
          )}
        </div>

        {editMode &&
          selectedImages.length > 0 && (
            <div className="admin-product-detail-page__upload-actions">
              <span>
                {selectedImages.length} new{" "}
                {selectedImages.length === 1
                  ? "image"
                  : "images"}{" "}
                selected
              </span>

              <button
                type="button"
                disabled={uploadingImages}
                onClick={handleUploadImages}
                className="admin-product-detail-page__edit-button"
              >
                {uploadingImages
                  ? "Uploading..."
                  : "Upload Images"}
              </button>
            </div>
          )}
      </section>

      {!editMode ? (
        <>
          {/* VIEW MODE */}

          <section className="admin-product-detail-page__card">

            <div className="admin-product-detail-page__details">

              <div>
                <span>Product Name</span>
                <strong>
                  {product.productName}
                </strong>
              </div>

              <div>
                <span>Product Code</span>
                <strong>
                  {product.productCode}
                </strong>
              </div>

              <div>
                <span>Category</span>
                <strong>
                  {product.categoryName}
                </strong>
              </div>

              <div>
                <span>Type</span>
                <strong>
                  {product.categoryType}
                </strong>
              </div>

              <div>
                <span>Company</span>
                <strong>
                  {product.company || "—"}
                </strong>
              </div>

              <div>
                <span>Car</span>
                <strong>
                  {product.car}
                </strong>
              </div>

              <div>
                <span>Model</span>
                <strong>
                  {product.model || "—"}
                </strong>
              </div>

              <div>
                <span>Color</span>
                <strong>
                  {product.color || "—"}
                </strong>
              </div>

              <div>
                <span>Packaging</span>
                <strong>
                  {
                    product.packagingUnit ||
                    "—"
                  }
                </strong>
              </div>

              <div>
                <span>MRP</span>
                <strong>
                  ₹
                  {product.mrp.toLocaleString(
                    "en-IN",
                  )}
                </strong>
              </div>

            </div>

          </section>

          <div className="admin-product-detail-page__actions">

            <button
              type="button"
              className="admin-product-detail-page__edit-button"
              onClick={() =>
                setEditMode(true)
              }
            >
              Edit Product
            </button>

            <button
              type="button"
              className="admin-product-detail-page__delete-button"
              onClick={
                handleDelete
              }
              disabled={deleting}
            >
              {deleting
                ? "Deleting..."
                : "Delete Product"}
            </button>

          </div>
        </>
      ) : (
        /* EDIT MODE */

        <form
          className="admin-product-detail-page__card"
          onSubmit={handleSubmit}
        >

          <div className="admin-product-detail-page__form-grid">

            <div>
              <label>
                Product Name
              </label>

              <input
                value={
                  formData.productName
                }
                onChange={(event) =>
                  updateField(
                    "productName",
                    event.target.value,
                  )
                }
              />
            </div>

            <div>
              <label>
                Product Code
              </label>

              <input
                value={
                  formData.productCode
                }
                onChange={(event) =>
                  updateField(
                    "productCode",
                    event.target.value
                      .toUpperCase(),
                  )
                }
              />
            </div>

            <div>
              <label>
                Category Type
              </label>

              <select
                value={
                  formData.categoryType
                }
                onChange={(event) =>
                  handleCategoryTypeChange(
                    event.target
                      .value as
                      | "INTERIOR"
                      | "EXTERIOR"
                      | "",
                  )
                }
              >
                <option value="">
                  Select type
                </option>

                <option value="INTERIOR">
                  Interior
                </option>

                <option value="EXTERIOR">
                  Exterior
                </option>
              </select>
            </div>

            <div>
              <label>
                Category
              </label>

              <select
                value={
                  formData.categoryId
                }
                onChange={(event) =>
                  updateField(
                    "categoryId",
                    event.target.value,
                  )
                }
              >
                <option value="">
                  Select category
                </option>

                {availableCategories.map(
                  (category) => (
                    <option
                      key={
                        category.id
                      }
                      value={
                        category.id
                      }
                    >
                      {
                        category.name
                      }
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label>
                Company
              </label>

              <select
                value={
                  formData.companyId
                }
                onChange={(event) =>
                  updateField(
                    "companyId",
                    event.target.value,
                  )
                }
              >
                <option value="">
                  Select company
                </option>

                {companies.map(
                  (company) => (
                    <option
                      key={
                        company.id
                      }
                      value={
                        company.id
                      }
                    >
                      {company.name}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label>Car</label>

              <select
                value={
                  formData.carId
                }
                onChange={(event) =>
                  handleCarChange(
                    event.target.value,
                  )
                }
              >
                <option value="">
                  Select car
                </option>

                {cars.map(
                  (car) => (
                    <option
                      key={car.id}
                      value={car.id}
                    >
                      {car.name}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label>Model</label>

              <select
                value={
                  formData.modelId
                }
                onChange={(event) =>
                  handleModelChange(
                    event.target.value,
                  )
                }
                disabled={
                  !formData.carId
                }
              >
                <option value="">
                  Select model
                </option>

                {models.map(
                  (model) => (
                    <option
                      key={model.id}
                      value={
                        model.id
                      }
                    >
                      {model.name}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label>Color</label>

              <input
                value={
                  formData.color
                }
                onChange={(event) =>
                  updateField(
                    "color",
                    event.target.value,
                  )
                }
              />
            </div>

            <div>
              <label>
                Packaging Unit
              </label>

              <input
                value={
                  formData.packagingUnit
                }
                onChange={(event) =>
                  updateField(
                    "packagingUnit",
                    event.target.value,
                  )
                }
              />
            </div>

            <div>
              <label>MRP</label>

              <input
                type="number"
                value={
                  formData.mrp
                }
                onChange={(event) =>
                  updateField(
                    "mrp",
                    event.target.value,
                  )
                }
              />
            </div>

          </div>

          {error && (
            <div className="admin-product-detail-page__error">
              {error}
            </div>
          )}

          <div className="admin-product-detail-page__actions">

            <button
              type="button"
              onClick={() =>
                setEditMode(false)
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="admin-product-detail-page__edit-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </form>
      )}
    </div>
  );
}

export default AdminProductDetailPage;