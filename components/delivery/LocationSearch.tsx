'use client';

import { useState } from 'react';
import { Search, ExternalLink, Loader2, MapPin, FileText, Phone } from 'lucide-react';

type Location = {
    _id: string;
    sheet_name: string;
    company: string;
    address: string;
    tel: string;
    url: string;
};

export default function LocationSearch() {
    const [query, setQuery] = useState('');
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setSearched(true);
        if (!query.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/locations/search?q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setLocations(data);
            } else {
                setLocations([]);
            }
        } catch (e) {
            console.error(e);
            setLocations([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <MapPin className="w-5 h-5 mr-1 text-orange-600" />
                拠点検索 (Google Drive)
            </h3>

            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                <div className="relative flex-1">
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="住所、会社名、電話番号などで検索"
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                <button
                    type="submit"
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                    disabled={loading}
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "検索"}
                </button>
            </form>

            <div className="space-y-2">
                {searched && locations.length === 0 && !loading && (
                    <p className="text-center text-gray-500 text-sm py-4">
                        見つかりませんでした。
                    </p>
                )}

                {locations.map((loc) => (
                    <a
                        key={loc._id}
                        href={loc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block border border-gray-100 rounded-lg p-3 hover:bg-orange-50 hover:shadow-md transition-all group relative"
                    >
                        <div className="flex items-start">
                            <div className="bg-green-100 p-2 rounded-lg mr-3">
                                <FileText className="w-6 h-6 text-green-700" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-800 flex items-center text-base mb-1">
                                    {loc.sheet_name}
                                </h4>
                                {loc.company && (
                                    <p className="text-sm font-medium text-gray-700 mb-0.5">{loc.company}</p>
                                )}
                                {loc.address && (
                                    <p className="text-xs text-gray-500 flex items-center mt-1">
                                        <MapPin className="w-3 h-3 mr-1 inline" /> {loc.address}
                                    </p>
                                )}
                                {loc.tel && (
                                    <p className="text-xs text-gray-500 flex items-center mt-0.5">
                                        <Phone className="w-3 h-3 mr-1 inline" /> {loc.tel}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center justify-center p-2">
                                <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
