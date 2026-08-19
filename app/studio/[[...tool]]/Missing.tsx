/**
 * What /studio says before there is a Sanity project to point it at.
 *
 * Deliberately a real page rather than a 404: the person most likely to hit
 * this is whoever is halfway through the setup, and "not found" would tell them
 * the route is broken when the truth is that one environment variable is empty.
 */
export default function Missing() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[46rem] flex-col justify-center gap-6 px-6 py-24 text-charcoal">
      <p className="font-label text-gold-ink">Studio</p>
      <h1 className="font-serif text-4xl leading-tight text-emerald md:text-5xl">
        Not connected yet
      </h1>
      <p className="max-w-[52ch] text-charcoal/75">
        The admin panel needs a Sanity project before it can open. Until then the
        site runs on the photographs committed in <code>constants/content.ts</code>,
        which is why nothing else is broken.
      </p>
      <ol className="ml-0 flex list-none flex-col gap-4 border-t border-emerald/15 pt-8 text-charcoal/75">
        {[
          "Create a free project at sanity.io — sign in with Google or GitHub, no card needed.",
          "Open Settings → API and copy the Project ID.",
          "Copy .env.example to .env.local and paste it into NEXT_PUBLIC_SANITY_PROJECT_ID.",
          "Restart the dev server, or redeploy, and reload this page.",
        ].map((step, i) => (
          <li key={step} className="flex gap-4">
            <span className="font-label shrink-0 text-gold-ink">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </main>
  );
}
