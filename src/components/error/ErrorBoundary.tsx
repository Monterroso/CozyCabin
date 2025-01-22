import { useRouteError } from 'react-router-dom'

export function ErrorBoundary() {
  const error = useRouteError()
  console.error(error)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-lodge-brown">Oops!</h1>
          <p className="mt-2 text-lg text-twilight-gray">
            Something went wrong. Please try again later.
          </p>
          {error instanceof Error && (
            <pre className="mt-4 p-4 bg-gray-100 rounded-lg text-sm text-left overflow-auto">
              {error.message}
            </pre>
          )}
          <button
            onClick={() => window.location.href = '/'}
            className="mt-6 px-4 py-2 bg-lodge-brown text-cabin-cream rounded-md hover:bg-lodge-brown/90"
          >
            Return Home
          </button>
        </div>
      </div>
    </div>
  )
} 