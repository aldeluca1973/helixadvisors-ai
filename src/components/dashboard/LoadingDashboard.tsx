import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function LoadingDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Loading */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-700 rounded animate-skeleton"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-600 rounded animate-skeleton"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Loading */}
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-700 rounded w-1/3 animate-skeleton"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded animate-skeleton"></div>
            <div className="h-4 bg-gray-700 rounded w-4/5 animate-skeleton"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4 animate-skeleton"></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Ideas Loading */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-700 rounded w-1/4 animate-skeleton"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-4 border border-gray-700 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="h-5 bg-gray-700 rounded w-2/3 animate-skeleton"></div>
                      <div className="h-6 bg-gray-700 rounded w-16 animate-skeleton"></div>
                    </div>
                    <div className="h-4 bg-gray-700 rounded w-full mb-3 animate-skeleton"></div>
                    <div className="flex space-x-2">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="h-5 bg-gray-700 rounded w-16 animate-skeleton"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Special Mentions Loading */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-700 rounded w-2/3 animate-skeleton"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 border border-gray-700 rounded-lg">
                    <div className="h-5 bg-gray-700 rounded w-3/4 mb-2 animate-skeleton"></div>
                    <div className="h-4 bg-gray-700 rounded w-full mb-2 animate-skeleton"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2 animate-skeleton"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}