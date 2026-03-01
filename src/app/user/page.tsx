import React from "react";

export const metadata = {
  title: "Organize | Eventimist",
  description: "A page to organize your events with Eventimist",
};

export default function OrganizePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold">Organize Events</h1>
      <p className="mt-2 text-lg text-gray-600">
        Use this page to manage and organize your upcoming events.
      </p>
      {/* TODO: add your event organizing components here */}
    </main>
  );
}