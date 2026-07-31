import { LoginForm } from "@/components/auth/login-form";

type PageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const nextPath =
    params.next && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/dashboard";

  return (
    <main className="mx-auto flex min-h-full w-full max-w-[1040px] flex-1 flex-col items-center justify-center gap-8 px-6 py-12">
      <header className="flex flex-col items-center gap-3 text-center">
        <div className="font-display flex items-center gap-2 text-[26px] font-extrabold tracking-wide">
          <span
            aria-hidden
            className="inline-block h-3.5 w-3.5 rotate-45 rounded-[4px] bg-green"
          />
          QuestPad
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Sign in
        </h1>
        <p className="max-w-md text-fg-dim">
          Sign in with a demo account. Your role (parent or child) comes from
          those credentials.
        </p>
      </header>
      <LoginForm nextPath={nextPath} />
    </main>
  );
}
