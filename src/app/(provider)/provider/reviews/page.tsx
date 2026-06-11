import { currentProvider } from "@/lib/session";
import { providerReviews, providerRating } from "@/server/selectors";
import { PReviews } from "@/components/provider/PReviews";

export default async function ProviderReviewsPage() {
  const p = (await currentProvider())!;
  const [list, rating] = await Promise.all([
    providerReviews(p.id),
    providerRating(p.id),
  ]);
  return (
    <PReviews
      list={list.map((r: any) => ({
        id: r.id,
        name: r.name,
        serviceName: r.serviceName,
        date: r.date,
        rating: r.rating,
        text: r.text,
        replied: r.replied,
      }))}
      rating={rating}
    />
  );
}
