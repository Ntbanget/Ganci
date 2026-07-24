export default function Home() {
  return (
    <div className="min-h-screen bg-cream-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4 text-black">
          Gantungan Kunci AR
        </h1>
        <p className="mb-6 text-gray-700">
          Aplikasi photobooth AR untuk membuat gantungan kunci custom
        </p>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test AR</h2>
          <p className="text-gray-600 mb-4">
            Buka halaman test AR di bawah untuk mencoba fitur AR:
          </p>
          <a
            href="/test-ar.html"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Test AR (test-ar.html)
          </a>
          <p className="mt-4 text-sm text-gray-500">
            Halaman ini menggunakan MindAR dengan importmap untuk loading yang benar
          </p>
        </div>
      </div>
    </div>
  );
}
