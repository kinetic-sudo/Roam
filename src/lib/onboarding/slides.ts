export type OnboardingSlide = {
  location: string;
  /** Unsplash CDN URL (remote). */
  imageUrl: string;
  title: string;
  body: string;
};

export const onboardingSlides: OnboardingSlide[] = [
  {
    location: "Whistler, BC",
    imageUrl:
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
    title: "Find a stay that fits your story",
    body: "From mountain cabins to oceanfront villas, roam helps you find unforgettable stays for every kind of trip.",
  },
  {
    location: "Malibu, CA",
    imageUrl:
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80",
    title: "Search in your own words",
    body: "Describe the vibe, budget, and must-haves in one sentence. Roam ranks stays that match what you asked for.",
  },
  {
    location: "Brooklyn, NY",
    imageUrl:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    title: "Answers straight from the stay",
    body: "Ask about check-in, pets, or cancellation and see the listing's own rules and Roam policies—word for word.",
  },
];
