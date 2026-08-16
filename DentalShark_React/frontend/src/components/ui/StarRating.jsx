export default function StarRating({ rating = 0, reviewCount, size = 12 }) {
  const fullStars = Math.round(rating);

  return (
    <div className="pc-rating">
      <span style={{ fontSize: size, color: 'var(--gold)' }} aria-hidden="true">
        {'★'.repeat(fullStars)}
        {'☆'.repeat(Math.max(0, 5 - fullStars))}
      </span>
      <span className="pc-rating-num">{rating.toFixed(1)}</span>
      {reviewCount != null && <span className="pc-rating-cnt">({reviewCount})</span>}
    </div>
  );
}
