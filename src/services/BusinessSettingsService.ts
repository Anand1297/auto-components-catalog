import {supabase} from "../lib/supabase";

import type { BusinessSettings } from "../models/BusinessSettings";

class BusinessSettingsService {

  async getBusinessSettings(): Promise<BusinessSettings | null> {
    const { data, error } = await supabase
      .from("business_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(
        "Failed to load business settings:",
        error,
      );

      throw error;
    }

    return data as BusinessSettings | null;
  }


  async updateBusinessSettings(
    id: string,
    settings: Partial<BusinessSettings>,
  ): Promise<BusinessSettings> {

    const {
      id: _id,
      updated_at: _updatedAt,
      ...updateData
    } = settings;

    const { data, error } = await supabase
      .from("business_settings")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(
        "Failed to update business settings:",
        error,
      );

      throw error;
    }

    return data as BusinessSettings;
  }
}

const businessSettingsService =
  new BusinessSettingsService();

export default businessSettingsService;