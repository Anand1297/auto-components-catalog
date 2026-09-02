import { supabase } from "../lib/supabase";
import type {
  CreateTestimonialInput,
  Testimonial,
} from "../models/Testimonial";

class TestimonialService {
  async getTestimonials(): Promise<Testimonial[]> {
    const { data, error } = await supabase
      .from("testimonials")
      .select("id, customer_name, company_name, message, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load testimonials:", error);
      throw error;
    }

    return (data ?? []) as Testimonial[];
  }

  async addTestimonial(
    testimonial: CreateTestimonialInput,
  ): Promise<Testimonial> {
    const { data, error } = await supabase
      .from("testimonials")
      .insert({
        customer_name: testimonial.customer_name.trim(),
        company_name: testimonial.company_name.trim(),
        message: testimonial.message.trim(),
      })
      .select("id, customer_name, company_name, message, created_at")
      .single();

    if (error) {
      console.error("Failed to add testimonial:", error);
      throw error;
    }

    return data as Testimonial;
  }

  async deleteTestimonial(id: string): Promise<void> {
    const { error } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete testimonial:", error);
      throw error;
    }
  }
}

const testimonialService = new TestimonialService();

export default testimonialService;
