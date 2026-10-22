// Sample content. Photos are free-to-use Unsplash placeholders (replaceable).
// /download?w=1200 redirects to the image file; swap to images.unsplash.com/photo-…?w=1200&q=80
// URLs if you prefer the CDN form (copy the image address from each photo page).
const photo = (id: string) =>
  `https://unsplash.com/photos/${id}/download?force=true&w=1200`;

export type Slide = {
  id: string;
  title: string;
  body: string;
  image: string;
  location: string;
};

export const SLIDES: Slide[] = [
  {
    id: "find",
    title: "Find a stay that fits your story",
    body: "From mountain cabins to oceanfront villas, roam helps you find unforgettable stays for every kind of trip.",
    image: photo("7ZTSZhPegaE"), // sunset over a lake and mountains, BC (Davey Gravy)
    location: "Whistler, BC",
  },
  {
    id: "ask",
    title: "Just say what you're after",
    body: "Describe your trip in one sentence, like a quiet cabin with a hot tub, and roam ranks the stays that fit.",
    image: photo("36p0ByDskVk"), // mountain cabins at sunset (Johannes Kopf)
    location: "Alpine cabins", // TODO: real place once confirmed
  },
  {
    id: "answers",
    title: "Answers straight from the stay",
    body: "Ask about check-in, pets or cancellations and see the stay's own rules, word for word, with their source.",
    image: photo("0CGST4j1X0g"), // cabin on a lake dock (Tim-Oliver Metz)
    location: "Lakeside cabin", // TODO: real place once confirmed
  },
];
