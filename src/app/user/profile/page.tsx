// app/user/profile/page.tsx

export default function ProfilePage() {
  const upcomingEvents = [
    {
      id: 1,
      title: "AI Meetup 2026",
      date: "30 May 2026",
      venue: "Hinjawadi, Pune",
      image:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
    },
    {
      id: 2,
      title: "Startup Networking Night",
      date: "12 June 2026",
      venue: "Koregaon Park, Pune",
      image:
        "https://images.unsplash.com/photo-1511578314322-379afb476865",
    },
  ];

  const bookmarkedEvents = [
    {
      id: 3,
      title: "Music Festival",
      date: "18 June 2026",
      venue: "Mumbai",
      image:
        "https://images.unsplash.com/photo-1505373877841-8d25f7d46678",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="relative h-60 w-full">
        <img
          src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30"
          alt="cover"
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/60" />

        <div className="absolute bottom-[-50px] left-8 flex items-end gap-5">
          <img
            src="https://i.pravatar.cc/200"
            alt="profile"
            className="h-28 w-28 rounded-full border-4 border-zinc-950 object-cover"
          />

          <div className="mb-3">
            <h1 className="text-3xl font-bold">Vibhor Arya</h1>
            <p className="text-zinc-300">vibhor@example.com</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-10">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-2xl bg-zinc-900 p-6 border border-zinc-800">
            <p className="text-zinc-400">RSVP Events</p>
            <h2 className="mt-2 text-4xl font-bold">12</h2>
          </div>

          <div className="rounded-2xl bg-zinc-900 p-6 border border-zinc-800">
            <p className="text-zinc-400">Saved Events</p>
            <h2 className="mt-2 text-4xl font-bold">7</h2>
          </div>

          <div className="rounded-2xl bg-zinc-900 p-6 border border-zinc-800">
            <p className="text-zinc-400">Attended</p>
            <h2 className="mt-2 text-4xl font-bold">24</h2>
          </div>
        </div>

        {/* Upcoming Events */}
        <section className="mt-14">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Upcoming Events</h2>

            <button className="rounded-xl bg-white px-4 py-2 text-black font-medium hover:opacity-90">
              View All
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 transition hover:scale-[1.02]"
              >
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-52 w-full object-cover"
                />

                <div className="p-5">
                  <h3 className="text-xl font-semibold">{event.title}</h3>

                  <p className="mt-2 text-zinc-400">{event.date}</p>

                  <p className="text-zinc-500">{event.venue}</p>

                  <div className="mt-5 flex gap-3">
                    <button className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black">
                      View Event
                    </button>

                    <button className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
                      Remove RSVP
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bookmarked Events */}
        <section className="mt-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Saved Events</h2>

            <button className="rounded-xl bg-white px-4 py-2 text-black font-medium hover:opacity-90">
              View All
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {bookmarkedEvents.map((event) => (
              <div
                key={event.id}
                className="overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 transition hover:scale-[1.02]"
              >
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-52 w-full object-cover"
                />

                <div className="p-5">
                  <h3 className="text-xl font-semibold">{event.title}</h3>

                  <p className="mt-2 text-zinc-400">{event.date}</p>

                  <p className="text-zinc-500">{event.venue}</p>

                  <div className="mt-5 flex gap-3">
                    <button className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black">
                      View Event
                    </button>

                    <button className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}