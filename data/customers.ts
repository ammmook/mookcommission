/**
 * Queue-position wording shared by the customer hero.
 *
 * The mock customer list is gone: the admin side reads `queue_entries` through
 * `lib/supabase/queues.ts`, and the customer side gets `queues_ahead` straight
 * from the `queue_public` view via `get_queue_detail()`. Only the phrasing
 * lives here now, so the Thai and English strings stay in one place.
 */

/**
 * Headline under the queue number. The count comes from the database's
 * `queues_ahead` — active, unfinished queues with a lower number — rather than
 * being recomputed from a queue number difference, which would count cancelled
 * and completed work.
 */
export function queuesAheadLabel(ahead: number): { th: string; en: string } {
  if (ahead <= 0) {
    return { th: "ถึงคิวของคุณแล้ว", en: "it's your turn" };
  }
  return { th: `เหลืออีก ${ahead} คิว`, en: `${ahead} queues ahead of you` };
}
