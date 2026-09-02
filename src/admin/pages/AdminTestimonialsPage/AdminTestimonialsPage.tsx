import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import testimonialService from "../../../services/TestimonialService";
import type { Testimonial } from "../../../models/Testimonial";

import "./AdminTestimonialsPage.css";

type TestimonialForm = {
  customer_name: string;
  company_name: string;
  message: string;
};

const emptyForm: TestimonialForm = {
  customer_name: "",
  company_name: "",
  message: "",
};

function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] =
    useState<Testimonial[]>([]);

  const [form, setForm] =
    useState<TestimonialForm>(emptyForm);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const loadTestimonials = async () => {
    try {
      setErrorMessage("");

      const data =
        await testimonialService.getTestimonials();

      setTestimonials(data);
    } catch (error) {
      console.error(
        "Failed to load testimonials:",
        error,
      );

      setErrorMessage(
        "Failed to load testimonials.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTestimonials();
  }, []);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event: FormEvent,
  ) => {
    event.preventDefault();

    if (
      !form.customer_name.trim() ||
      !form.company_name.trim() ||
      !form.message.trim()
    ) {
      setErrorMessage(
        "Customer name, company name and testimonial are required.",
      );
      return;
    }

    try {
      setSaving(true);
      setSuccessMessage("");
      setErrorMessage("");

      const created =
        await testimonialService.addTestimonial(form);

      setTestimonials((current) => [
        created,
        ...current,
      ]);

      setForm(emptyForm);
      setSuccessMessage(
        "Testimonial added successfully.",
      );
    } catch (error) {
      console.error(
        "Failed to add testimonial:",
        error,
      );

      setErrorMessage(
        "Failed to add testimonial.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    testimonial: Testimonial,
  ) => {
    const shouldDelete = window.confirm(
      `Delete testimonial from ${testimonial.customer_name}?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingId(testimonial.id);
      setSuccessMessage("");
      setErrorMessage("");

      await testimonialService.deleteTestimonial(
        testimonial.id,
      );

      setTestimonials((current) =>
        current.filter(
          (item) => item.id !== testimonial.id,
        ),
      );

      setSuccessMessage(
        "Testimonial deleted successfully.",
      );
    } catch (error) {
      console.error(
        "Failed to delete testimonial:",
        error,
      );

      setErrorMessage(
        "Failed to delete testimonial.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-testimonials">
      <div className="admin-testimonials__header">
        <div>
          <h1>Testimonials</h1>
          <p>
            Add and remove testimonials shown on the
            customer website.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="admin-testimonials__message admin-testimonials__message--success">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="admin-testimonials__message admin-testimonials__message--error">
          {errorMessage}
        </div>
      )}

      <div className="admin-testimonials__layout">
        <form
          className="admin-testimonials__form"
          onSubmit={handleSubmit}
        >
          <div className="admin-testimonials__form-header">
            <h2>Add Testimonial</h2>
            <p>
              New testimonials appear immediately on the
              customer home page.
            </p>
          </div>

          <label className="admin-testimonials__field">
            <span>Customer Name</span>
            <input
              type="text"
              name="customer_name"
              value={form.customer_name}
              onChange={handleChange}
              placeholder="e.g. Rahul Sharma"
              maxLength={100}
              disabled={saving}
            />
          </label>

          <label className="admin-testimonials__field">
            <span>Company Name</span>
            <input
              type="text"
              name="company_name"
              value={form.company_name}
              onChange={handleChange}
              placeholder="e.g. ABC Motors"
              maxLength={120}
              disabled={saving}
            />
          </label>

          <label className="admin-testimonials__field">
            <span>Testimonial</span>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Write the customer testimonial..."
              rows={5}
              maxLength={500}
              disabled={saving}
            />
            <small>{form.message.length}/500</small>
          </label>

          <button
            className="admin-testimonials__add-button"
            type="submit"
            disabled={saving}
          >
            {saving ? "Adding..." : "Add Testimonial"}
          </button>
        </form>

        <section className="admin-testimonials__list-section">
          <div className="admin-testimonials__list-header">
            <div>
              <h2>Current Testimonials</h2>
              <p>
                {testimonials.length} testimonial
                {testimonials.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="admin-testimonials__empty">
              Loading testimonials...
            </div>
          ) : testimonials.length === 0 ? (
            <div className="admin-testimonials__empty">
              No testimonials yet. Add the first one using
              the form.
            </div>
          ) : (
            <div className="admin-testimonials__list">
              {testimonials.map((testimonial) => (
                <article
                  key={testimonial.id}
                  className="admin-testimonials__card"
                >
                  <div className="admin-testimonials__card-content">
                    <p className="admin-testimonials__quote">
                      “{testimonial.message}”
                    </p>

                    <div className="admin-testimonials__customer">
                      <strong>
                        {testimonial.customer_name}
                      </strong>
                      <span>
                        {testimonial.company_name}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="admin-testimonials__delete-button"
                    onClick={() =>
                      void handleDelete(testimonial)
                    }
                    disabled={
                      deletingId === testimonial.id
                    }
                  >
                    {deletingId === testimonial.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminTestimonialsPage;
