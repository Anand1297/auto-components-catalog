import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import businessSettingsService from "../../../../src/services/BusinessSettingsService";

import type { BusinessSettings } from "../../../../src/models/BusinessSettings";

import "./BusinessSettingsPage.css";

type BusinessSettingsForm = {
  business_name: string;

  phone: string;
  mobile: string;
  whatsapp: string;
  email: string;

  address: string;
  city: string;
  state: string;
  pincode: string;

  instagram_url: string;
  facebook_url: string;
};


const emptyForm: BusinessSettingsForm = {
  business_name: "",

  phone: "",
  mobile: "",
  whatsapp: "",
  email: "",

  address: "",
  city: "",
  state: "",
  pincode: "",

  instagram_url: "",
  facebook_url: "",
};


function BusinessSettingsPage() {

  const [settingsId, setSettingsId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<BusinessSettingsForm>(
      emptyForm,
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");


  useEffect(() => {

    let cancelled = false;

    const loadSettings = async () => {

      try {

        const settings =
          await businessSettingsService.getBusinessSettings();

        if (
          cancelled ||
          !settings
        ) {
          return;
        }

        setSettingsId(
          settings.id,
        );

        setForm({
          business_name:
            settings.business_name ?? "",

          phone:
            settings.phone ?? "",

          mobile:
            settings.mobile ?? "",

          whatsapp:
            settings.whatsapp ?? "",

          email:
            settings.email ?? "",

          address:
            settings.address ?? "",

          city:
            settings.city ?? "",

          state:
            settings.state ?? "",

          pincode:
            settings.pincode ?? "",

          instagram_url:
            settings.instagram_url ?? "",

          facebook_url:
            settings.facebook_url ?? "",
        });

      } catch (error) {

        console.error(
          "Failed to load business settings:",
          error,
        );

        if (!cancelled) {
          setErrorMessage(
            "Failed to load business settings.",
          );
        }

      } finally {

        if (!cancelled) {
          setLoading(false);
        }

      }

    };

    void loadSettings();

    return () => {
      cancelled = true;
    };

  }, []);


  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement
    >,
  ) => {

    const {
      name,
      value,
    } = event.target;

    setForm(
      (current) => ({
        ...current,
        [name]: value,
      }),
    );

  };


  const handleSubmit = async (
    event: FormEvent,
  ) => {

    event.preventDefault();

    if (!settingsId) {
      setErrorMessage(
        "Business settings record not found.",
      );

      return;
    }

    try {

      setSaving(true);

      setMessage("");
      setErrorMessage("");

      const updated =
        await businessSettingsService.updateBusinessSettings(
          settingsId,
          {
            ...form,
          } as Partial<BusinessSettings>,
        );

      setMessage(
        "Business settings updated successfully.",
      );

      console.log(
        "Updated settings:",
        updated,
      );

    } catch (error) {

      console.error(
        "Failed to update settings:",
        error,
      );

      setErrorMessage(
        "Failed to update business settings.",
      );

    } finally {

      setSaving(false);

    }

  };


  if (loading) {
    return (
      <div className="business-settings">
        Loading settings...
      </div>
    );
  }


  return (
    <div className="business-settings">

      <div className="business-settings__header">

        <div>
          <h1>
            Business Settings
          </h1>

          <p>
            Manage contact and business
            information displayed on the
            customer website.
          </p>
        </div>

      </div>


      <form
        className="business-settings__form"
        onSubmit={
          handleSubmit
        }
      >

        <div className="business-settings__card">

          <h2>
            Business Information
          </h2>


          <div className="business-settings__grid">

            <label>
              Business Name

              <input
                name="business_name"
                value={
                  form.business_name
                }
                onChange={
                  handleChange
                }
                required
              />
            </label>


            <label>
              Phone

              <input
                name="phone"
                value={form.phone}
                onChange={
                  handleChange
                }
              />
            </label>


            <label>
              Mobile

              <input
                name="mobile"
                value={
                  form.mobile
                }
                onChange={
                  handleChange
                }
              />
            </label>


            <label>
              WhatsApp

              <input
                name="whatsapp"
                value={
                  form.whatsapp
                }
                onChange={
                  handleChange
                }
              />
            </label>


            <label>
              Email

              <input
                type="email"
                name="email"
                value={
                  form.email
                }
                onChange={
                  handleChange
                }
              />
            </label>


            <label>
              Pincode

              <input
                name="pincode"
                value={
                  form.pincode
                }
                onChange={
                  handleChange
                }
              />
            </label>

          </div>

        </div>


        <div className="business-settings__card">

          <h2>
            Address
          </h2>

          <div className="business-settings__grid">

            <label className="business-settings__full">

              Address

              <textarea
                name="address"
                value={
                  form.address
                }
                onChange={
                  handleChange
                }
                rows={3}
              />

            </label>


            <label>
              City

              <input
                name="city"
                value={
                  form.city
                }
                onChange={
                  handleChange
                }
              />
            </label>


            <label>
              State

              <input
                name="state"
                value={
                  form.state
                }
                onChange={
                  handleChange
                }
              />
            </label>

          </div>

        </div>


        <div className="business-settings__card">

          <h2>
            Social Media
          </h2>

          <div className="business-settings__grid">

            <label>
              Instagram URL

              <input
                type="url"
                name="instagram_url"
                value={
                  form.instagram_url
                }
                onChange={
                  handleChange
                }
              />
            </label>


            <label>
              Facebook URL

              <input
                type="url"
                name="facebook_url"
                value={
                  form.facebook_url
                }
                onChange={
                  handleChange
                }
              />
            </label>

          </div>

        </div>


        {message && (
          <p className="business-settings__success">
            {message}
          </p>
        )}


        {errorMessage && (
          <p className="business-settings__error">
            {errorMessage}
          </p>
        )}


        <div className="business-settings__actions">

          <button
            type="submit"
            disabled={
              saving
            }
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>

        </div>

      </form>

    </div>
  );
}


export default BusinessSettingsPage;