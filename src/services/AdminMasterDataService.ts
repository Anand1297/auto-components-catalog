import { supabase } from "../lib/supabase";

export interface AdminCategory {
  id: string;
  name: string;
  type: "INTERIOR" | "EXTERIOR";
}

export interface AdminCompany {
  id: string;
  name: string;
}

export interface AdminCar {
  id: string;
  name: string;
}

export interface AdminModel {
  id: string;
  name: string;
  car_id: string;
}

class AdminMasterDataService {
  // ============================================================
  // CATEGORIES
  // ============================================================

  async getCategories(): Promise<AdminCategory[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, type")
      .order("name");

    if (error) {
      console.error(
        "Failed to fetch categories:",
        error,
      );

      throw new Error("Unable to load categories.");
    }

    return data ?? [];
  }

  async createCategory(
    name: string,
    type: "INTERIOR" | "EXTERIOR",
  ): Promise<AdminCategory> {
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: name.trim(),
        type,
      })
      .select("id, name, type")
      .single();

    if (error) {
      console.error(
        "Failed to create category:",
        error,
      );

      throw new Error(
        error.code === "23505"
          ? "Category already exists."
          : "Unable to create category.",
      );
    }

    return data;
  }

  // ============================================================
  // COMPANIES
  // ============================================================

  async getCompanies(): Promise<AdminCompany[]> {
    const { data, error } = await supabase
      .from("companies")
      .select("id, name")
      .order("name");

    if (error) {
      console.error(
        "Failed to fetch companies:",
        error,
      );

      throw new Error("Unable to load companies.");
    }

    return data ?? [];
  }

  async createCompany(
    name: string,
  ): Promise<AdminCompany> {
    const { data, error } = await supabase
      .from("companies")
      .insert({
        name: name.trim(),
      })
      .select("id, name")
      .single();

    if (error) {
      console.error(
        "Failed to create company:",
        error,
      );

      throw new Error(
        error.code === "23505"
          ? "Company already exists."
          : "Unable to create company.",
      );
    }

    return data;
  }

  // ============================================================
  // CARS
  // ============================================================

  async getCars(): Promise<AdminCar[]> {
    const { data, error } = await supabase
      .from("cars")
      .select("id, name")
      .order("name");

    if (error) {
      console.error(
        "Failed to fetch cars:",
        error,
      );

      throw new Error("Unable to load cars.");
    }

    return data ?? [];
  }

  async createCar(
    name: string,
  ): Promise<AdminCar> {
    const { data, error } = await supabase
      .from("cars")
      .insert({
        name: name.trim(),
      })
      .select("id, name")
      .single();

    if (error) {
      console.error(
        "Failed to create car:",
        error,
      );

      throw new Error(
        error.code === "23505"
          ? "Car already exists."
          : "Unable to create car.",
      );
    }

    return data;
  }

  // ============================================================
  // MODELS
  // ============================================================

  async getModels(): Promise<AdminModel[]> {
    const { data, error } = await supabase
      .from("models")
      .select("id, name, car_id")
      .order("name");

    if (error) {
      console.error(
        "Failed to fetch models:",
        error,
      );

      throw new Error("Unable to load models.");
    }

    return data ?? [];
  }

  async getModelsByCar(
    carId: string,
  ): Promise<AdminModel[]> {
    const { data, error } = await supabase
      .from("models")
      .select("id, name, car_id")
      .eq("car_id", carId)
      .order("name");

    if (error) {
      console.error(
        "Failed to fetch models by car:",
        error,
      );

      throw new Error(
        "Unable to load models.",
      );
    }

    return data ?? [];
  }

  async createModel(
    name: string,
    carId: string,
  ): Promise<AdminModel> {
    const { data, error } = await supabase
      .from("models")
      .insert({
        name: name.trim(),
        car_id: carId,
      })
      .select("id, name, car_id")
      .single();

    if (error) {
      console.error(
        "Failed to create model:",
        error,
      );

      throw new Error(
        error.code === "23505"
          ? "Model already exists for this car."
          : "Unable to create model.",
      );
    }

    return data;
  }
}

const adminMasterDataService =
  new AdminMasterDataService();

export default adminMasterDataService;