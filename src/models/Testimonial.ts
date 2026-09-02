export interface Testimonial {
  id: string;
  customer_name: string;
  company_name: string;
  message: string;
  created_at: string;
}

export interface CreateTestimonialInput {
  customer_name: string;
  company_name: string;
  message: string;
}
