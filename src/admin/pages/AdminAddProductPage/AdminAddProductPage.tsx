import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../../lib/supabase";
import r2ImageService from "../../../services/R2ImageService";

import "./AdminAddProductPage.css";

interface ProductFormData {
  productName: string;
  productCode: string;

  categoryType:
    | "INTERIOR"
    | "EXTERIOR"
    | "";

  categoryId: string;
  categoryName: string;

  companyId: string;
  companyName: string;

  car: string;
  model: string;

  color: string;
  mrp: string;
  packagingUnit: string;
}

interface CategoryOption {
  id: string;
  name: string;
  type: "INTERIOR" | "EXTERIOR";
}

interface CompanyOption {
  id: string;
  name: string;
}

const initialFormData: ProductFormData = {
  productName: "",
  productCode: "",

  categoryType: "",
  categoryId: "",
  categoryName: "",

  companyId: "",
  companyName: "",

  car: "",
  model: "",

  color: "",
  mrp: "",
  packagingUnit: "",
};

function AdminAddProductPage() {
  const navigate = useNavigate();

  // ============================================================
  // FORM STATE
  // ============================================================

  const [formData, setFormData] =
    useState<ProductFormData>(
      initialFormData,
    );

  const [categories, setCategories] =
    useState<CategoryOption[]>([]);

  const [companies, setCompanies] =
    useState<CompanyOption[]>([]);

  const [cars, setCars] =
    useState<string[]>([]);

  const [models, setModels] =
    useState<string[]>([]);

  // ============================================================
  // IMAGE STATE
  // ============================================================

  const [selectedImages, setSelectedImages] =
    useState<File[]>([]);

  const [imagePreviews, setImagePreviews] =
    useState<string[]>([]);

  // ============================================================
  // PAGE STATE
  // ============================================================

  const [loadingOptions, setLoadingOptions] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploadingImages, setUploadingImages] =
    useState(false);

  const [error, setError] =
    useState("");

  // ============================================================
  // ADD NEW MODES
  // ============================================================

  const [
    newCategoryMode,
    setNewCategoryMode,
  ] = useState(false);

  const [
    newCompanyMode,
    setNewCompanyMode,
  ] = useState(false);

  const [
    newCarMode,
    setNewCarMode,
  ] = useState(false);

  const [
    newModelMode,
    setNewModelMode,
  ] = useState(false);

  // ============================================================
  // LOAD DROPDOWN OPTIONS
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const loadOptions = async () => {
      try {
        setLoadingOptions(true);

        const [
          categoryResult,
          companyResult,
          productResult,
        ] = await Promise.all([
          supabase
            .from("categories")
            .select("id,name,type")
            .order("name"),

          supabase
            .from("companies")
            .select("id,name")
            .order("name"),

          supabase
            .from("products")
            .select("car,model"),
        ]);

        if (cancelled) {
          return;
        }

        if (categoryResult.error) {
          console.error(
            "Failed to load categories:",
            categoryResult.error,
          );

          throw new Error(
            "Failed to load categories.",
          );
        }

        if (companyResult.error) {
          console.error(
            "Failed to load companies:",
            companyResult.error,
          );

          throw new Error(
            "Failed to load companies.",
          );
        }

        if (productResult.error) {
          console.error(
            "Failed to load cars/models:",
            productResult.error,
          );

          throw new Error(
            "Failed to load car/model options.",
          );
        }

        setCategories(
          (categoryResult.data ??
            []) as CategoryOption[],
        );

        setCompanies(
          (companyResult.data ??
            []) as CompanyOption[],
        );

        const uniqueCars =
          Array.from(
            new Set(
              (productResult.data ?? [])
                .map(
                  (product) =>
                    product.car,
                )
                .filter(
                  (
                    value,
                  ): value is string =>
                    Boolean(value),
                ),
            ),
          ).sort();

        const uniqueModels =
          Array.from(
            new Set(
              (productResult.data ?? [])
                .map(
                  (product) =>
                    product.model,
                )
                .filter(
                  (
                    value,
                  ): value is string =>
                    Boolean(value),
                ),
            ),
          ).sort();

        setCars(uniqueCars);
        setModels(uniqueModels);
      } catch (err) {
        console.error(
          "Failed to load form options:",
          err,
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load form options.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingOptions(false);
        }
      }
    };

    loadOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================================
  // CLEAN IMAGE PREVIEWS WHEN PAGE UNMOUNTS
  // ============================================================

  useEffect(() => {
    return () => {
      imagePreviews.forEach(
        (preview) => {
          URL.revokeObjectURL(
            preview,
          );
        },
      );
    };
  }, [imagePreviews]);

  // ============================================================
  // FIELD UPDATE
  // ============================================================

  const updateField = (
    field: keyof ProductFormData,
    value: string,
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  // ============================================================
  // CATEGORY TYPE
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
      categoryName: "",
    }));

    setNewCategoryMode(false);
  };

  // ============================================================
  // CATEGORY
  // ============================================================

  const handleCategoryChange = (
    value: string,
  ) => {
    if (value === "__new__") {
      setNewCategoryMode(true);

      setFormData((current) => ({
        ...current,

        categoryId: "",
        categoryName: "",
      }));

      return;
    }

    setNewCategoryMode(false);

    const category =
      categories.find(
        (item) =>
          item.id === value,
      );

    setFormData((current) => ({
      ...current,

      categoryId:
        category?.id ?? "",

      categoryName:
        category?.name ?? "",
    }));
  };

  // ============================================================
  // COMPANY
  // ============================================================

  const handleCompanyChange = (
    value: string,
  ) => {
    if (value === "__new__") {
      setNewCompanyMode(true);

      setFormData((current) => ({
        ...current,

        companyId: "",
        companyName: "",
      }));

      return;
    }

    setNewCompanyMode(false);

    const company =
      companies.find(
        (item) =>
          item.id === value,
      );

    setFormData((current) => ({
      ...current,

      companyId:
        company?.id ?? "",

      companyName:
        company?.name ?? "",
    }));
  };

  // ============================================================
  // CAR
  // ============================================================

  const handleCarChange = (
    value: string,
  ) => {
    if (value === "__new__") {
      setNewCarMode(true);

      setFormData((current) => ({
        ...current,

        car: "",
      }));

      return;
    }

    setNewCarMode(false);

    updateField(
      "car",
      value,
    );
  };

  // ============================================================
  // MODEL
  // ============================================================

  const handleModelChange = (
    value: string,
  ) => {
    if (value === "__new__") {
      setNewModelMode(true);

      setFormData((current) => ({
        ...current,

        model: "",
      }));

      return;
    }

    setNewModelMode(false);

    updateField(
      "model",
      value,
    );
  };

  // ============================================================
  // IMAGE SELECTION
  // ============================================================

  const handleImageSelection = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const files =
      Array.from(
        event.target.files ?? [],
      );

    if (files.length === 0) {
      return;
    }

    const validImages =
      files.filter((file) =>
        file.type.startsWith(
          "image/",
        ),
      );

    if (
      validImages.length !==
      files.length
    ) {
      setError(
        "Only image files are allowed.",
      );
    }

    const newPreviews =
      validImages.map((file) =>
        URL.createObjectURL(file),
      );

    setSelectedImages(
      (current) => [
        ...current,
        ...validImages,
      ],
    );

    setImagePreviews(
      (current) => [
        ...current,
        ...newPreviews,
      ],
    );

    /*
     * Allows selecting the same file again
     * after removing it.
     */
    event.target.value = "";
  };

  // ============================================================
  // REMOVE SELECTED IMAGE
  // ============================================================

  const removeImage = (
    index: number,
  ) => {
    setSelectedImages(
      (current) =>
        current.filter(
          (_, currentIndex) =>
            currentIndex !==
            index,
        ),
    );

    setImagePreviews(
      (current) => {
        const preview =
          current[index];

        if (preview) {
          URL.revokeObjectURL(
            preview,
          );
        }

        return current.filter(
          (_, currentIndex) =>
            currentIndex !==
            index,
        );
      },
    );
  };

  // ============================================================
  // CREATE CATEGORY
  // ============================================================

  const createCategory =
    async (): Promise<
      string | null
    > => {
      if (
        !formData.categoryName.trim() ||
        !formData.categoryType
      ) {
        setError(
          "Category name and category type are required.",
        );

        return null;
      }

      const {
        data,
        error: categoryError,
      } = await supabase
        .from("categories")
        .insert({
          name:
            formData.categoryName.trim(),

          type:
            formData.categoryType,
        })
        .select(
          "id,name,type",
        )
        .single();

      if (categoryError) {
        console.error(
          "Failed to create category:",
          categoryError,
        );

        setError(
          categoryError.message ||
            "Failed to create category.",
        );

        return null;
      }

      const newCategory =
        data as CategoryOption;

      setCategories(
        (current) =>
          [
            ...current,
            newCategory,
          ].sort(
            (a, b) =>
              a.name.localeCompare(
                b.name,
              ),
          ),
      );

      setFormData(
        (current) => ({
          ...current,

          categoryId:
            newCategory.id,

          categoryName:
            newCategory.name,
        }),
      );

      setNewCategoryMode(false);

      return newCategory.id;
    };

  // ============================================================
  // CREATE COMPANY
  // ============================================================

  const createCompany =
    async (): Promise<
      string | null
    > => {
      if (
        !formData.companyName.trim()
      ) {
        setError(
          "Company name is required.",
        );

        return null;
      }

      const {
        data,
        error: companyError,
      } = await supabase
        .from("companies")
        .insert({
          name:
            formData.companyName.trim(),
        })
        .select(
          "id,name",
        )
        .single();

      if (companyError) {
        console.error(
          "Failed to create company:",
          companyError,
        );

        setError(
          companyError.message ||
            "Failed to create company.",
        );

        return null;
      }

      const newCompany =
        data as CompanyOption;

      setCompanies(
        (current) =>
          [
            ...current,
            newCompany,
          ].sort(
            (a, b) =>
              a.name.localeCompare(
                b.name,
              ),
          ),
      );

      setFormData(
        (current) => ({
          ...current,

          companyId:
            newCompany.id,

          companyName:
            newCompany.name,
        }),
      );

      setNewCompanyMode(false);

      return newCompany.id;
    };

  // ============================================================
  // VALIDATION
  // ============================================================

  const validate =
    (): boolean => {
      if (
        !formData.productName.trim()
      ) {
        setError(
          "Product name is required.",
        );

        return false;
      }

      if (
        !formData.productCode.trim()
      ) {
        setError(
          "Product code is required.",
        );

        return false;
      }

      if (
        !formData.categoryType
      ) {
        setError(
          "Category type is required.",
        );

        return false;
      }

      if (
        !formData.categoryName.trim()
      ) {
        setError(
          "Category is required.",
        );

        return false;
      }

      if (
        !formData.companyName.trim()
      ) {
        setError(
          "Company is required.",
        );

        return false;
      }

      if (
        !formData.car.trim()
      ) {
        setError(
          "Car is required.",
        );

        return false;
      }

      if (
        !formData.mrp.trim()
      ) {
        setError(
          "MRP is required.",
        );

        return false;
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

        return false;
      }

      return true;
    };

  // ============================================================
  // UPLOAD IMAGES TO R2 + SAVE METADATA
  // ============================================================

  const uploadProductImages =
    async (
      productId: string,
      productCode: string,
    ) => {
      if (
        selectedImages.length === 0
      ) {
        return;
      }

      setUploadingImages(true);

      try {
        for (
          let index = 0;
          index <
          selectedImages.length;
          index += 1
        ) {
          const file =
            selectedImages[index];

          const uploadedImage =
            await r2ImageService
              .uploadProductImage(
                file,
                productCode,
              );

          const {
            error:
              imageInsertError,
          } = await supabase
            .from(
              "product_images",
            )
            .insert({
              product_id:
                productId,

              image_key:
                uploadedImage.imageKey,

              image_url:
                uploadedImage.imageUrl,

              sort_order:
                index + 1,
            });

          if (
            imageInsertError
          ) {
            console.error(
              "Failed to save image metadata:",
              imageInsertError,
            );

            throw new Error(
              "Image uploaded to R2, but image information could not be saved.",
            );
          }
        }
      } finally {
        setUploadingImages(
          false,
        );
      }
    };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit =
    async (
      event: FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      setError("");

      if (!validate()) {
        return;
      }

      setSaving(true);

      try {
        let categoryId =
          formData.categoryId;

        let companyId =
          formData.companyId;

        // ------------------------------------------------------
        // CREATE CATEGORY IF REQUIRED
        // ------------------------------------------------------

        if (
          newCategoryMode
        ) {
          const createdCategoryId =
            await createCategory();

          if (
            !createdCategoryId
          ) {
            return;
          }

          categoryId =
            createdCategoryId;
        }

        // ------------------------------------------------------
        // CREATE COMPANY IF REQUIRED
        // ------------------------------------------------------

        if (
          newCompanyMode
        ) {
          const createdCompanyId =
            await createCompany();

          if (
            !createdCompanyId
          ) {
            return;
          }

          companyId =
            createdCompanyId;
        }

        if (!categoryId) {
          setError(
            "Please select or create a category.",
          );

          return;
        }

        if (!companyId) {
          setError(
            "Please select or create a company.",
          );

          return;
        }

        // ------------------------------------------------------
        // CREATE PRODUCT
        // ------------------------------------------------------

        const {
          data: createdProduct,
          error: insertError,
        } = await supabase
          .from("products")
          .insert({
            category_id:
              categoryId,

            company_id:
              companyId,

            car:
              formData.car.trim(),

            mrp:
              Number(
                formData.mrp,
              ),

            color:
              formData.color.trim() ||
              null,

            model:
              formData.model.trim() ||
              null,

            product_name:
              formData.productName.trim(),

            product_code:
              formData.productCode
                .trim()
                .toUpperCase(),

            packaging_unit:
              formData.packagingUnit.trim() ||
              null,
          })
          .select(
            "id,product_code",
          )
          .single();

        if (insertError) {
          console.error(
            "Failed to create product:",
            insertError,
          );

          setError(
            insertError.message ||
              "Failed to create product.",
          );

          return;
        }

        // ------------------------------------------------------
        // UPLOAD IMAGES
        // ------------------------------------------------------

        if (
          selectedImages.length >
          0
        ) {
          await uploadProductImages(
            createdProduct.id,
            createdProduct.product_code,
          );
        }

        // ------------------------------------------------------
        // SUCCESS
        // ------------------------------------------------------

        alert(
          "Product created successfully.",
        );

        navigate(
          "/admin/products",
        );
      } catch (err) {
        console.error(
          "Product creation failed:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to create product.",
        );
      } finally {
        setSaving(false);
        setUploadingImages(
          false,
        );
      }
    };

  // ============================================================
  // CANCEL
  // ============================================================

  const handleCancel = () => {
    navigate(
      "/admin/products",
    );
  };

  // ============================================================
  // FILTER CATEGORIES
  // ============================================================

  const availableCategories =
    categories.filter(
      (category) =>
        !formData.categoryType ||
        category.type ===
          formData.categoryType,
    );

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="admin-add-product-page">

      {/* HEADER */}

      <div className="admin-add-product-page__header">
        <div>
          <h1>Add Product</h1>

          <p>
            Add a new automotive
            accessory to the catalog.
          </p>
        </div>

        <button
          type="button"
          className="admin-add-product-page__back-button"
          onClick={handleCancel}
          disabled={saving}
        >
          ← Back to Products
        </button>
      </div>

      <form
        className="admin-add-product-page__form"
        onSubmit={handleSubmit}
      >

        {/* ==================================================== */}
        {/* PRODUCT INFORMATION */}
        {/* ==================================================== */}

        <section className="admin-add-product-page__section">

          <div className="admin-add-product-page__section-header">
            <h2>
              Product Information
            </h2>

            <p>
              Basic information about
              the product.
            </p>
          </div>

          <div className="admin-add-product-page__grid">

            <div className="admin-add-product-page__field admin-add-product-page__field--full">

              <label htmlFor="productName">
                Product Name
              </label>

              <input
                id="productName"
                type="text"
                placeholder="e.g. Premium 7D Floor Mat"
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

            <div className="admin-add-product-page__field">

              <label htmlFor="productCode">
                Product Code
              </label>

              <input
                id="productCode"
                type="text"
                placeholder="e.g. FM-001"
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

              <span className="admin-add-product-page__hint">
                Used for the product
                image folder in R2.
              </span>

            </div>

          </div>

        </section>

        {/* ==================================================== */}
        {/* CATEGORY */}
        {/* ==================================================== */}

        <section className="admin-add-product-page__section">

          <div className="admin-add-product-page__section-header">
            <h2>Category</h2>

            <p>
              Select an existing
              category or create a new
              one.
            </p>
          </div>

          <div className="admin-add-product-page__grid">

            <div className="admin-add-product-page__field">

              <label htmlFor="categoryType">
                Category Type
              </label>

              <select
                id="categoryType"
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
                disabled={
                  loadingOptions ||
                  saving
                }
              >
                <option value="">
                  Select category type
                </option>

                <option value="INTERIOR">
                  Interior
                </option>

                <option value="EXTERIOR">
                  Exterior
                </option>
              </select>

            </div>

            <div className="admin-add-product-page__field">

              <label htmlFor="category">
                Category
              </label>

              {!newCategoryMode ? (
                <select
                  id="category"
                  value={
                    formData.categoryId
                  }
                  onChange={(event) =>
                    handleCategoryChange(
                      event.target.value,
                    )
                  }
                  disabled={
                    !formData.categoryType ||
                    loadingOptions ||
                    saving
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

                  <option value="__new__">
                    + Add New Category
                  </option>
                </select>
              ) : (
                <div className="admin-add-product-page__inline-add">

                  <input
                    type="text"
                    placeholder="Enter new category"
                    value={
                      formData.categoryName
                    }
                    onChange={(event) =>
                      updateField(
                        "categoryName",
                        event.target.value,
                      )
                    }
                  />

                  <button
                    type="button"
                    onClick={
                      createCategory
                    }
                  >
                    Add
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewCategoryMode(
                        false,
                      );

                      updateField(
                        "categoryName",
                        "",
                      );
                    }}
                  >
                    Cancel
                  </button>

                </div>
              )}

            </div>

          </div>

        </section>

        {/* ==================================================== */}
        {/* COMPANY */}
        {/* ==================================================== */}

        <section className="admin-add-product-page__section">

          <div className="admin-add-product-page__section-header">

            <h2>Company</h2>

            <p>
              Select an existing
              company or add a new
              company.
            </p>

          </div>

          <div className="admin-add-product-page__grid">

            <div className="admin-add-product-page__field">

              <label htmlFor="company">
                Company
              </label>

              {!newCompanyMode ? (
                <select
                  id="company"
                  value={
                    formData.companyId
                  }
                  onChange={(event) =>
                    handleCompanyChange(
                      event.target.value,
                    )
                  }
                  disabled={
                    loadingOptions ||
                    saving
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
                        {
                          company.name
                        }
                      </option>
                    ),
                  )}

                  <option value="__new__">
                    + Add New Company
                  </option>
                </select>
              ) : (
                <div className="admin-add-product-page__inline-add">

                  <input
                    type="text"
                    placeholder="Enter new company"
                    value={
                      formData.companyName
                    }
                    onChange={(event) =>
                      updateField(
                        "companyName",
                        event.target.value,
                      )
                    }
                  />

                  <button
                    type="button"
                    onClick={
                      createCompany
                    }
                  >
                    Add
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewCompanyMode(
                        false,
                      );

                      updateField(
                        "companyName",
                        "",
                      );
                    }}
                  >
                    Cancel
                  </button>

                </div>
              )}

            </div>

          </div>

        </section>

        {/* ==================================================== */}
        {/* VEHICLE */}
        {/* ==================================================== */}

        <section className="admin-add-product-page__section">

          <div className="admin-add-product-page__section-header">

            <h2>
              Vehicle Information
            </h2>

            <p>
              Vehicle compatibility and
              product details.
            </p>

          </div>

          <div className="admin-add-product-page__grid">

            {/* CAR */}

            <div className="admin-add-product-page__field">

              <label htmlFor="car">
                Car
              </label>

              {!newCarMode ? (
                <select
                  id="car"
                  value={
                    formData.car
                  }
                  onChange={(event) =>
                    handleCarChange(
                      event.target.value,
                    )
                  }
                  disabled={
                    loadingOptions ||
                    saving
                  }
                >
                  <option value="">
                    Select car
                  </option>

                  {cars.map(
                    (car) => (
                      <option
                        key={car}
                        value={car}
                      >
                        {car}
                      </option>
                    ),
                  )}

                  <option value="__new__">
                    + Add New Car
                  </option>
                </select>
              ) : (
                <div className="admin-add-product-page__inline-add">

                  <input
                    type="text"
                    placeholder="e.g. Toyota Fortuner"
                    value={
                      formData.car
                    }
                    onChange={(event) =>
                      updateField(
                        "car",
                        event.target.value,
                      )
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setNewCarMode(
                        false,
                      )
                    }
                  >
                    Done
                  </button>

                </div>
              )}

            </div>

            {/* MODEL */}

            <div className="admin-add-product-page__field">

              <label htmlFor="model">
                Model
              </label>

              {!newModelMode ? (
                <select
                  id="model"
                  value={
                    formData.model
                  }
                  onChange={(event) =>
                    handleModelChange(
                      event.target.value,
                    )
                  }
                  disabled={
                    loadingOptions ||
                    saving
                  }
                >
                  <option value="">
                    Select model
                  </option>

                  {models.map(
                    (model) => (
                      <option
                        key={model}
                        value={model}
                      >
                        {model}
                      </option>
                    ),
                  )}

                  <option value="__new__">
                    + Add New Model
                  </option>
                </select>
              ) : (
                <div className="admin-add-product-page__inline-add">

                  <input
                    type="text"
                    placeholder="e.g. Premium"
                    value={
                      formData.model
                    }
                    onChange={(event) =>
                      updateField(
                        "model",
                        event.target.value,
                      )
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setNewModelMode(
                        false,
                      )
                    }
                  >
                    Done
                  </button>

                </div>
              )}

            </div>

            {/* COLOR */}

            <div className="admin-add-product-page__field">

              <label htmlFor="color">
                Color
              </label>

              <input
                id="color"
                type="text"
                placeholder="e.g. Black"
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

            {/* PACKAGING */}

            <div className="admin-add-product-page__field">

              <label htmlFor="packagingUnit">
                Packaging Unit
              </label>

              <input
                id="packagingUnit"
                type="text"
                placeholder="e.g. 1 Set"
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

          </div>

        </section>

        {/* ==================================================== */}
        {/* PRODUCT IMAGES */}
        {/* ==================================================== */}

        <section className="admin-add-product-page__section">

          <div className="admin-add-product-page__section-header">

            <h2>
              Product Images
            </h2>

            <p>
              Select one or more product
              images. They will be
              uploaded to Cloudflare R2
              after the product is
              created.
            </p>

          </div>

          <div className="admin-add-product-page__image-upload">

            <label
              htmlFor="productImages"
              className="admin-add-product-page__image-picker"
            >
              + Choose Images
            </label>

            <input
              id="productImages"
              type="file"
              accept="image/*"
              multiple
              onChange={
                handleImageSelection
              }
              className="admin-add-product-page__image-input"
              disabled={saving}
            />

            {selectedImages.length >
              0 && (
              <p className="admin-add-product-page__image-count">
                {
                  selectedImages.length
                }{" "}
                image
                {selectedImages.length ===
                1
                  ? ""
                  : "s"}{" "}
                selected
              </p>
            )}

            {imagePreviews.length >
              0 && (
              <div className="admin-add-product-page__image-grid">

                {imagePreviews.map(
                  (
                    preview,
                    index,
                  ) => (
                    <div
                      key={`${preview}-${index}`}
                      className="admin-add-product-page__image-card"
                    >

                      <img
                        src={preview}
                        alt={`Product preview ${
                          index + 1
                        }`}
                      />

                      <span className="admin-add-product-page__image-order">
                        {index + 1}
                      </span>

                      <button
                        type="button"
                        className="admin-add-product-page__image-remove"
                        onClick={() =>
                          removeImage(
                            index,
                          )
                        }
                        aria-label={`Remove image ${
                          index + 1
                        }`}
                        disabled={
                          saving
                        }
                      >
                        ×
                      </button>

                    </div>
                  ),
                )}

              </div>
            )}

          </div>

        </section>

        {/* ==================================================== */}
        {/* PRICING */}
        {/* ==================================================== */}

        <section className="admin-add-product-page__section">

          <div className="admin-add-product-page__section-header">

            <h2>Pricing</h2>

            <p>
              Product selling
              information.
            </p>

          </div>

          <div className="admin-add-product-page__grid">

            <div className="admin-add-product-page__field">

              <label htmlFor="mrp">
                MRP
              </label>

              <div className="admin-add-product-page__price-input">

                <span>₹</span>

                <input
                  id="mrp"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="4999"
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

          </div>

        </section>

        {/* ERROR */}

        {error && (
          <div className="admin-add-product-page__error">
            {error}
          </div>
        )}

        {/* ACTIONS */}

        <div className="admin-add-product-page__actions">

          <button
            type="button"
            className="admin-add-product-page__cancel-button"
            onClick={
              handleCancel
            }
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="admin-add-product-page__save-button"
            disabled={
              saving ||
              loadingOptions
            }
          >
            {uploadingImages
              ? "Uploading Images..."
              : saving
                ? "Saving..."
                : "Save Product"}
          </button>

        </div>

      </form>

    </div>
  );
}

export default AdminAddProductPage;