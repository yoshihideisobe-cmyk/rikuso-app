export function TimelineSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 relative animate-pulse">
                    <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="h-5 w-20 bg-gray-200 rounded"></div>
                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    </div>
                    <div className="space-y-2 mb-4">
                        <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                        <div className="h-4 w-full bg-gray-200 rounded"></div>
                        <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-48 w-full bg-gray-200 rounded-lg"></div>
                </div>
            ))}
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="mb-6 animate-pulse">
            <div className="flex items-center mb-2">
                <div className="w-4 h-4 mr-1 bg-gray-200 rounded-full"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="bg-gray-50 border-l-4 border-gray-200 p-4 rounded-r shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div className="h-4 w-40 bg-gray-200 rounded"></div>
                            <div className="h-3 w-20 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-3 w-full bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function PointsSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 pb-20 p-4 animate-pulse">
            <div className="h-8 w-32 bg-gray-200 rounded mb-6"></div>

            {/* Profile Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gray-200"></div>
                <div className="space-y-2">
                    <div className="h-5 w-32 bg-gray-200 rounded"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
            </div>

            {/* Points Card */}
            <div className="bg-gray-200 rounded-xl p-6 shadow-md mb-8 h-32"></div>

            {/* Form Placeholder */}
            <div className="mb-8 h-40 bg-gray-200 rounded-xl"></div>

            {/* History */}
            <div>
                <div className="h-5 w-32 bg-gray-200 rounded mb-3"></div>
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 h-16"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function ListSkeleton() {
    return (
        <div className="space-y-3 animate-pulse">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 h-16 w-full"></div>
            ))}
        </div>
    );
}
