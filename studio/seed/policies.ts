import { body, h3, li, p } from './pt'

// Fictional Roam policy text, written so a future Context endpoint can quote whole paragraphs.
export type SeedPolicy = {
  slug: string
  title: string
  kind: 'cancellation' | 'booking' | 'pets' | 'damage' | 'checkIn' | 'guestRefund' | 'payment'
  summary: string
  body: ReturnType<typeof body>
}

export const policies: SeedPolicy[] = [
  {
    slug: 'cancellation-flexible',
    title: 'Flexible cancellation',
    kind: 'cancellation',
    summary: 'Free cancellation up to 24 hours before check-in.',
    body: body(
      h3('Free cancellation'),
      p(
        'Cancel up to 24 hours before check-in and Roam refunds the full amount you paid, including the nightly rate, the cleaning fee and the service fee.',
      ),
      h3('Cancelling later'),
      p(
        'If you cancel less than 24 hours before check-in, the first night and the service fee are not refunded. Every other night is refunded in full.',
      ),
      h3('Leaving early'),
      p(
        'If you check out early after your stay has started, nights you do not stay are refunded unless you leave on the day you arrive.',
      ),
    ),
  },
  {
    slug: 'cancellation-moderate',
    title: 'Moderate cancellation',
    kind: 'cancellation',
    summary: 'Free cancellation up to 5 days before check-in.',
    body: body(
      h3('Free cancellation'),
      p(
        'Cancel up to 5 days before check-in and Roam refunds the full amount you paid, including the cleaning fee and the service fee.',
      ),
      h3('Cancelling within 5 days'),
      p(
        'If you cancel less than 5 days before check-in, the first night and 50% of the remaining nights are not refunded. The cleaning fee is refunded if you have not yet checked in.',
      ),
      h3('Leaving early'),
      p(
        'If you check out early, 50% of the nights you do not stay are refunded. Nothing is refunded for the night you leave.',
      ),
    ),
  },
  {
    slug: 'cancellation-strict',
    title: 'Strict cancellation',
    kind: 'cancellation',
    summary: 'Full refund within 48 hours of booking, then 50% until 7 days before check-in.',
    body: body(
      h3('Full refund within 48 hours'),
      p(
        'Cancel within 48 hours of booking and receive a full refund, as long as check-in is at least 14 days away.',
      ),
      h3('Later cancellations'),
      li(
        'Cancel at least 7 days before check-in: 50% of the nightly rate is refunded, and the cleaning fee in full.',
      ),
      li('Cancel less than 7 days before check-in: no refund of the nightly rate.'),
      p('The service fee is refunded only when you cancel within the first 48 hours.'),
    ),
  },
  {
    slug: 'booking-and-payment',
    title: 'Booking & payment',
    kind: 'booking',
    summary: 'How booking, payment and fees work on Roam.',
    body: body(
      h3('Booking'),
      p(
        'A booking is confirmed once the host accepts it or, for Instant Book stays, as soon as payment is authorised. You will receive a confirmation email with your itinerary and the check-in instructions.',
      ),
      h3('Payment'),
      p(
        'All prices are shown in US dollars. Roam charges the full amount when you book. Stays of 28 nights or more can be paid in monthly instalments.',
      ),
      h3('Fees'),
      li('The nightly rate is set by the host.'),
      li('The cleaning fee is a one-time charge per stay.'),
      li('The Roam service fee is shown before you pay and is part of the total.'),
    ),
  },
  {
    slug: 'pets-policy',
    title: 'Pets',
    kind: 'pets',
    summary: 'Pets are welcome only where a stay says so.',
    body: body(
      h3('Where pets are allowed'),
      p(
        'Pets are allowed only at stays that list Pets allowed in their house rules. Each stay sets how many pets it welcomes and any pet fee, shown before you book.',
      ),
      h3('Assistance animals'),
      p(
        'Trained service animals and emotional support animals are welcome at every stay, regardless of the pet rules, and never carry a pet fee.',
      ),
      h3('Your responsibilities'),
      li('Keep pets off beds and furniture unless the host says otherwise.'),
      li('Never leave pets unattended in a way that disturbs neighbours.'),
      li('Clean up after your pets, indoors and out.'),
    ),
  },
  {
    slug: 'damage-and-security-deposit',
    title: 'Damage & security deposit',
    kind: 'damage',
    summary: 'How damage reports and security deposits are handled.',
    body: body(
      h3('Security deposits'),
      p(
        'Some stays place a refundable hold on your card at check-in. The amount is shown on the stay page before you book and is released within 7 days of check-out if there is no damage report.',
      ),
      h3('Damage reports'),
      p(
        'Hosts have 48 hours after check-out to report damage, with photos and a repair estimate. Roam reviews every report and may ask you for your side before charging anything.',
      ),
      h3('Accidents'),
      p(
        'Accidents happen. Tell the host as soon as you notice a problem, which helps resolve it quickly and fairly.',
      ),
    ),
  },
  {
    slug: 'check-in-and-check-out',
    title: 'Check-in & check-out',
    kind: 'checkIn',
    summary: 'Standard arrival and departure times and how instructions are shared.',
    body: body(
      h3('Times'),
      p(
        'Each stay lists its own check-in and check-out times in its house rules. Most stays use a 3:00 PM check-in and an 11:00 AM check-out, local time.',
      ),
      h3('Instructions'),
      p(
        'Your host shares the check-in instructions in the app 48 hours before you arrive, including the address, parking and how to get in.',
      ),
      h3('Early check-in and late check-out'),
      p(
        'Ask your host in the app. Hosts say yes when the stay is free before or after you, and may charge a small fee.',
      ),
    ),
  },
  {
    slug: 'guest-refund-policy',
    title: 'Guest refund policy',
    kind: 'guestRefund',
    summary: 'What Roam does when something is seriously wrong with your stay.',
    body: body(
      h3('When this applies'),
      p(
        'If the host cancels, you cannot get into the stay, or the stay is not as described, report it within 24 hours of check-in and Roam will help you right away.',
      ),
      h3('What Roam will do'),
      li('Find you a similar stay, or refund you for the nights you could not use.'),
      li('Refund you in full if the host cancels your booking.'),
      li('Refund part of your stay if a major amenity is missing and cannot be fixed.'),
      h3('What is not covered'),
      p(
        'Minor issues, changes of plan and problems you cause yourself are not covered by this policy.',
      ),
    ),
  },
]
