import Link from "next/link";
import FollowButton from "@/components/social/follow-button";

// Phase-1: use mock users (no network)
async function getUsers() {
  return {
    items: [
      { id: 1, name: "Ken", email: "ken@example.com", avatarUrl: "https://i.pravatar.cc/100?img=12" },
      { id: 2, name: "Mei", email: "mei@example.com", avatarUrl: "https://i.pravatar.cc/100?img=32" },
      { id: 3, name: "Yuno", email: "yuno@example.com", avatarUrl: "https://i.pravatar.cc/100?img=22" },
    ],
  };
}

export default async function SocialPage() {
  const data = await getUsers();
  const users: any[] = Array.isArray(data) ? data : data?.items || [];

  return (
    <div className="container mx-auto px-4 py-10">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Community</h1>
          <p className="text-sm md:text-base text-muted-foreground">Find and follow other readers.</p>
        </div>
      </header>

      <section className="mt-6 rounded-lg border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">People</h2>
            {users.length > 0 ? (
              <p className="text-sm text-muted-foreground">{users.length} user(s) found.</p>
            ) : (
              <p className="text-sm text-muted-foreground">No users to show yet.</p>
            )}
          </div>
        </div>

        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.length > 0 ? (
            users.map((u: any, i: number) => {
              const id = u.id ?? u.userId ?? i;
              const name = u.name || u.username || "Anonymous";
              const email = u.email || "";
              const avatar = u.avatarUrl || u.image || null;
              return (
                <li key={String(id)} className="flex items-center justify-between gap-4 rounded-md border bg-background p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-muted">
                      {avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatar} alt={name} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{name}</p>
                      {email ? <p className="mt-1 text-xs text-muted-foreground">{email}</p> : null}
                    </div>
                  </div>
                  <FollowButton userId={String(id)} />
                </li>
              );
            })
          ) : (
            <li className="rounded-md border bg-muted/40 p-6 text-sm text-muted-foreground">No users available.</li>
          )}
        </ul>
      </section>
    </div>
  );
}