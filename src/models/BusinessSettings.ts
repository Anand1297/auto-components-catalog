export interface BusinessSettings {
  id: string;

  business_name: string;

  phone: string | null;
  mobile: string | null;
  whatsapp: string | null;
  email: string | null;

  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;

  instagram_url: string | null;
  facebook_url: string | null;

  updated_at: string;
}