import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import categoryService, {
  type CategoryInput,
} from "../../../services/CategoryService";

import categoryImageService from "../../../services/CategoryImageService";

import type {
  Category,
  CategoryType,
} from "../../../models/Category";

import "./AdminCategoriesPage.css";

const emptyForm: CategoryInput = {
  name: "",
  type: "INTERIOR",
  imageUrl: "",
  imageKey: null,
};

function AdminCategoriesPage() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [formData, setFormData] =
    useState<CategoryInput>(
      emptyForm,
    );

  const [
    editingCategoryId,
    setEditingCategoryId,
  ] = useState<string | null>(
    null,
  );

  const [
    originalImageKey,
    setOriginalImageKey,
  ] = useState<string | null>(
    null,
  );

  const [
    selectedImageFile,
    setSelectedImageFile,
  ] = useState<File | null>(
    null,
  );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const localPreviewUrl =
    useMemo(() => {
      if (!selectedImageFile) {
        return null;
      }

      return URL.createObjectURL(
        selectedImageFile,
      );
    }, [selectedImageFile]);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(
          localPreviewUrl,
        );
      }
    };
  }, [localPreviewUrl]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const result =
        await categoryService
          .getCategories();

      setCategories(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load categories.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingCategoryId(null);
    setOriginalImageKey(null);
    setSelectedImageFile(null);
  };

  const handleEdit = (
  category: Category,
) => {
  setEditingCategoryId(
    category.id,
  );

  setOriginalImageKey(
    category.imageKey ?? null,
  );

  setSelectedImageFile(
    null,
  );

  setFormData({
    name: category.name,
    type: category.categoryType,
    imageUrl:
      category.image ===
      "/categories/default.png"
        ? ""
        : category.image,
    imageKey:
      category.imageKey ?? null,
  });

  setError("");
  setSuccess("");

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

  const handleImageFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0] ??
      null;

    if (!file) {
      setSelectedImageFile(null);
      return;
    }

    if (
      !file.type.startsWith(
        "image/",
      )
    ) {
      setError(
        "Please select an image file.",
      );

      event.target.value = "";
      return;
    }

    const maxFileSize =
      5 * 1024 * 1024;

    if (file.size > maxFileSize) {
      setError(
        "Category image must be 5 MB or smaller.",
      );

      event.target.value = "";
      return;
    }

    setError("");
    setSelectedImageFile(file);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const name =
      formData.name.trim();

    if (!name) {
      setError(
        "Category name is required.",
      );
      return;
    }

    let uploadedImageKey:
      | string
      | null = null;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      let finalImageUrl =
        formData.imageUrl?.trim() ||
        "";

      let finalImageKey =
        formData.imageKey ?? null;

      /*
       * Local file takes priority over a
       * manually entered image URL.
       */
      if (selectedImageFile) {
        const uploaded =
          await categoryImageService
            .uploadCategoryImage(
              selectedImageFile,
              name,
            );

        uploadedImageKey =
          uploaded.imageKey;

        finalImageUrl =
          uploaded.imageUrl;

        finalImageKey =
          uploaded.imageKey;
      } else if (
        finalImageUrl &&
        originalImageKey &&
        finalImageUrl !==
          formData.imageUrl
      ) {
        finalImageKey = null;
      }

      let savedCategory:
        Category;

      if (editingCategoryId) {
        savedCategory =
          await categoryService
            .updateCategory(
              editingCategoryId,
              {
                name,
                type:
                  formData.type,
                imageUrl:
                  finalImageUrl,
                imageKey:
                  finalImageKey,
              },
            );

        /*
         * Delete the previous R2 image
         * only after the DB update succeeds.
         */
        if (
          originalImageKey &&
          originalImageKey !==
            savedCategory.imageKey
        ) {
          try {
            await categoryImageService
              .deleteCategoryImage(
                originalImageKey,
              );
          } catch (deleteError) {
            console.warn(
              "Category updated, but old R2 image could not be removed:",
              deleteError,
            );
          }
        }

        setSuccess(
          "Category updated successfully.",
        );
      } else {
        savedCategory =
          await categoryService
            .createCategory({
              name,
              type:
                formData.type,
              imageUrl:
                finalImageUrl,
              imageKey:
                finalImageKey,
            });

        setSuccess(
          "Category added successfully.",
        );
      }

      resetForm();
      await loadCategories();
    } catch (err) {
      /*
       * If upload succeeded but the DB save
       * failed, remove the newly uploaded file.
       */
      if (uploadedImageKey) {
        try {
          await categoryImageService
            .deleteCategoryImage(
              uploadedImageKey,
            );
        } catch {
          // Do not hide the original save error.
        }
      }

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save category.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    category: Category,
  ) => {
    const shouldDelete =
      window.confirm(
        `Delete "${category.name}"?`,
      );

    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingId(category.id);
      setError("");
      setSuccess("");

      /*
       * Delete DB row first. If products
       * still reference the category,
       * the image remains untouched.
       */
      await categoryService
        .deleteCategory(
          category.id,
        );

      if (category.imageKey) {
        try {
          await categoryImageService
            .deleteCategoryImage(
              category.imageKey,
            );
        } catch (deleteError) {
          console.warn(
            "Category deleted, but its R2 image could not be removed:",
            deleteError,
          );
        }
      }

      if (
        editingCategoryId ===
        category.id
      ) {
        resetForm();
      }

      setCategories(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              category.id,
          ),
      );

      setSuccess(
        "Category deleted successfully.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete category.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const previewImage =
    localPreviewUrl ||
    formData.imageUrl?.trim() ||
    "";

  return (
    <main className="admin-categories-page">
      <div className="admin-categories-page__header">
        <div>
          <h1>Categories</h1>
          <p>
            Add categories, change
            Interior/Exterior type and
            manage category images.
          </p>
        </div>
      </div>

      <section className="admin-categories-form-card">
        <div className="admin-categories-form-card__header">
          <h2>
            {editingCategoryId
              ? "Edit Category"
              : "Add Category"}
          </h2>

          {editingCategoryId && (
            <button
              type="button"
              className="admin-categories__cancel"
              onClick={resetForm}
              disabled={saving}
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form
          className="admin-categories-form"
          onSubmit={handleSubmit}
        >
          <label>
            <span>Category Name</span>

            <input
              value={formData.name}
              onChange={(event) =>
                setFormData(
                  (current) => ({
                    ...current,
                    name:
                      event.target.value,
                  }),
                )
              }
              placeholder="e.g. Seat Covers"
              disabled={saving}
              required
            />
          </label>

          <label>
            <span>Category Type</span>

            <select
              value={formData.type}
              onChange={(event) =>
                setFormData(
                  (current) => ({
                    ...current,
                    type:
                      event.target
                        .value as CategoryType,
                  }),
                )
              }
              disabled={saving}
            >
              <option value="INTERIOR">
                Interior
              </option>

              <option value="EXTERIOR">
                Exterior
              </option>
            </select>
          </label>

          <div className="admin-categories-form__image-panel">
            <label>
              <span>
                Category Image URL
                <small>
                  {" "}optional
                </small>
              </span>

              <input
                type="url"
                value={
                  formData.imageUrl ??
                  ""
                }
                onChange={(event) =>
                  setFormData(
                    (current) => ({
                      ...current,
                      imageUrl:
                        event.target.value,
                      /*
                       * A manually entered URL
                       * is not an R2-managed key.
                       */
                      imageKey:
                        event.target.value !==
                        current.imageUrl
                          ? null
                          : current.imageKey,
                    }),
                  )
                }
                placeholder="https://..."
                disabled={
                  saving ||
                  Boolean(
                    selectedImageFile,
                  )
                }
              />
            </label>

            <div className="admin-categories-form__or">
              OR
            </div>

            <label className="admin-categories-form__file">
              <span>
                Upload From Device
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={
                  handleImageFileChange
                }
                disabled={saving}
              />

              <small>
                JPG, PNG, WEBP etc.
                Maximum 5 MB.
              </small>
            </label>

            {selectedImageFile && (
              <div className="admin-categories-form__selected-file">
                <span>
                  {
                    selectedImageFile.name
                  }
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedImageFile(
                      null,
                    )
                  }
                  disabled={saving}
                >
                  Remove
                </button>
              </div>
            )}

            {previewImage && (
              <div className="admin-categories-form__preview">
                <img
                  src={previewImage}
                  alt="Category preview"
                />

                <span>
                  Image Preview
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="admin-categories__save"
            disabled={saving}
          >
            {saving
              ? selectedImageFile
                ? "Uploading & Saving..."
                : "Saving..."
              : editingCategoryId
                ? "Update Category"
                : "Add Category"}
          </button>
        </form>
      </section>

      {error && (
        <div
          className="admin-categories__message admin-categories__message--error"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div className="admin-categories__message admin-categories__message--success">
          {success}
        </div>
      )}

      <section className="admin-categories-list">
        <div className="admin-categories-list__header">
          <h2>
            Existing Categories
          </h2>

          <span>
            {categories.length}
          </span>
        </div>

        {loading ? (
          <p>Loading categories...</p>
        ) : categories.length === 0 ? (
          <p>
            No categories available.
          </p>
        ) : (
          <div className="admin-categories-grid">
            {categories.map(
              (category) => (
                <article
                  key={category.id}
                  className="admin-category-card"
                >
                  <div className="admin-category-card__image">
                    <img
                      src={category.image}
                      alt={category.name}
                    />
                  </div>

                  <div className="admin-category-card__body">
                    <div>
                      <span
                        className={`admin-category-card__type admin-category-card__type--${category.categoryType.toLowerCase()}`}
                      >
                        {
                          category.categoryType
                        }
                      </span>

                      <h3>
                        {category.name}
                      </h3>
                    </div>

                    <div className="admin-category-card__actions">
                      <button
                        type="button"
                        className="admin-category-card__edit"
                        onClick={() =>
                          handleEdit(
                            category,
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="admin-category-card__delete"
                        onClick={() =>
                          void handleDelete(
                            category,
                          )
                        }
                        disabled={
                          deletingId ===
                          category.id
                        }
                      >
                        {deletingId ===
                        category.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminCategoriesPage;
