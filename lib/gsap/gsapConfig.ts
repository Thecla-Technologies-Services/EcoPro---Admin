import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";

// Only runs once, no repeated registration
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, CustomEase);

  // Register your custom easings globally
  CustomEase.create("dashboard.snap", "M0,0 C0.16,1.08 0.38,1 1,1");
  CustomEase.create("dashboard.smooth", "M0,0 C0.25,0.1 0.25,1 1,1");
}

export default gsap;