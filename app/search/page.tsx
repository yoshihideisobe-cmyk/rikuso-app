import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import LocationSearch from '@/components/delivery/LocationSearch';

export default async function SearchPage() {
    const session = await auth();

    if (!session) {
        redirect('/login');
    }

    return (
        <main className="min-h-screen bg-gray-50 pb-20 p-4">
            <h1 className="text-xl font-bold text-gray-800 mb-6 px-2">検索</h1>
            <div className="max-w-lg mx-auto space-y-6">
                <LocationSearch />
            </div>
        </main>
    );
}
