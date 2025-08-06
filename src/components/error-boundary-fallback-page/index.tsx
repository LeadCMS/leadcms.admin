export function ErrorBoundaryFallbackPage({ error }: { error: Error }) {
  return (
    <div>
      <span>Something went wrong</span>
      <br />
      {`${error}`}
    </div>
  );
}
