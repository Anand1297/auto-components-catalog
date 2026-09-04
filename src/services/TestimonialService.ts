import { supabase } from "../lib/supabase";
import businessCatalogService from "./BusinessCatalogService";
import type { CreateTestimonialInput, Testimonial } from "../models/Testimonial";

class TestimonialService {
  async getTestimonials(): Promise<Testimonial[]> {
    const business = await businessCatalogService.getBusiness();
    const { data, error } = await supabase.from("testimonials").select("id,customer_name,message,created_at").eq("business_id", business.id).eq("is_active", true).order("sort_order").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => ({ id: row.id, customer_name: row.customer_name, company_name: business.name, message: row.message, created_at: row.created_at }));
  }

  async addTestimonial(input: CreateTestimonialInput): Promise<Testimonial> {
    const business = await businessCatalogService.getBusiness();
    const { data, error } = await supabase.from("testimonials").insert({ business_id: business.id, customer_name: input.customer_name.trim(), message: input.message.trim(), is_active: true }).select("id,customer_name,message,created_at").single();
    if (error) throw error;
    return { id: data.id, customer_name: data.customer_name, company_name: input.company_name || business.name, message: data.message, created_at: data.created_at };
  }

  async deleteTestimonial(id: string): Promise<void> {
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) throw error;
  }
}

export default new TestimonialService();
