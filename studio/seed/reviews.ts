import { stays } from './stays'

// 3 "recent reviews" per stay (90 in total). `seedKey` is the content key the seed looks reviews up by.
export const reviews = stays.flatMap((s) =>
  s.reviews.map(([guest, rating, month, text], i) => ({
    seedKey: `${s.slug}#${i + 1}`,
    staySlug: s.slug,
    guestName: guest,
    rating,
    stayedAt: `${month}-01`,
    text,
  })),
)
