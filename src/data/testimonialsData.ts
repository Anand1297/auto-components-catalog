export interface Testimonial {
  id: string;
  customerName: string;
  companyName: string;
  message: string;
}

export const testimonialsData: Testimonial[] = [
  {
    id: "testimonial-1",
    customerName: "Rahul Sharma",
    companyName: "ABC Motors",
    message:
      "The product quality is excellent and the catalog makes it very easy to find the right accessories.",
  },
  {
    id: "testimonial-2",
    customerName: "Amit Patel",
    companyName: "Patel Auto",
    message:
      "A great range of interior and exterior accessories with good product information.",
  },
  {
    id: "testimonial-3",
    customerName: "Vikas Mehta",
    companyName: "Mehta Automobiles",
    message:
      "The products are reliable and the ordering experience has been very smooth.",
  },
  {
    id: "testimonial-4",
    customerName: "Suresh Kumar",
    companyName: "Kumar Car Accessories",
    message:
      "Good variety of products and easy compatibility information for different cars.",
  },
];