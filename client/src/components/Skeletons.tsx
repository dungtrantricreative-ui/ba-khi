export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function HomeSkeleton() {
  return (
    <main aria-busy="true" aria-label="Đang tải nội dung">
      <section className="hero hero--skeleton">
        <div className="hero__inner grid-skeleton">
          <Skeleton className="skeleton-pill" />
          <Skeleton className="skeleton-title" />
          <Skeleton className="skeleton-line" />
          <Skeleton className="skeleton-line skeleton-line--short" />
          <div className="skeleton-actions"><Skeleton className="skeleton-button" /><Skeleton className="skeleton-button skeleton-button--ghost" /></div>
        </div>
      </section>
      <div className="rail-stack">
        {[0, 1].map(row => (
          <section key={row} className="rail">
            <Skeleton className="skeleton-heading" />
            <div className="skeleton-cards">{Array.from({ length: 7 }, (_, index) => <Skeleton key={index} className="skeleton-card" />)}</div>
          </section>
        ))}
      </div>
    </main>
  );
}

export function CardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="skeleton-cards" aria-busy="true">
      {Array.from({ length: count }, (_, index) => <Skeleton key={index} className="skeleton-card" />)}
    </div>
  );
}
