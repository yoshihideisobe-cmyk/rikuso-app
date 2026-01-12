'use client';

import { searchDeliverySites } from '@/app/actions';
import { useState } from 'react';
import { Search, MapPin, FileEdit, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Type for Site
type Site = {
    _id: string;
    siteCode: string;
    name: string;
    address: string;
    notes?: string;
};

export default function SiteSearch() {
    const [query, setQuery] = useState('');
    const [sites, setSites] = useState<Site[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setSearched(true);
        if (!query.trim()) return;

        setLoading(true);
        const results = await searchDeliverySites(query);
        setSites(results as any);
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <MapPin className="w-5 h-5 mr-1 text-blue-600" />
                納車先検索
            </h3>

            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                <div className="relative flex-1">
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="名称、住所、備考から検索..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={loading}
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "検索"}
                </button>
            </form>

            <div className="space-y-2">
                {searched && sites.length === 0 && !loading && (
                    <p className="text-center text-gray-500 text-sm py-4">
                        見つかりませんでした。
                    </p>
                )}

                {sites.map((site) => (
                    <div key={site._id} className="border border-gray-100 rounded-lg p-3 hover:bg-blue-50 transition-colors group">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-gray-800">{site.name}</h4>
                                <p className="text-xs text-gray-500 mt-0.5">{site.address}</p>
                            </div>
                            <Link href={`/sites/${site._id}`} className="text-gray-300 hover:text-blue-600">
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                        {site.notes && (
                            <p className="text-xs text-orange-600 mt-2 bg-orange-50 p-2 rounded">
                                ⚠ {site.notes}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
