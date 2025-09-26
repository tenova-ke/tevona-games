export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-5xl font-bold text-blue-600">Tevona Games 🎮</h1>
      <p className="mt-4 text-lg text-gray-700">
        Multiplayer Werewolf, Chat, and More
      </p>
      <button className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">
        Start Playing
      </button>
    </main>
  );
}
