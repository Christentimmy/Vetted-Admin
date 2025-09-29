import { useEffect, useMemo, useState } from 'react';
import { useDashboardLayout } from '../components/DashboardLayoutContext';
import { genderVerificationService, type GenderVerificationItem } from '../services/gender_verification';
import { Search, Image as ImageIcon, Check, X } from 'lucide-react';

const Gender = () => {
  const layout = useDashboardLayout();
  const [items, setItems] = useState<GenderVerificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  // Track processing per action using separate sets to avoid dual spinners
  const [processingAccept, setProcessingAccept] = useState<Set<string>>(new Set());
  const [processingReject, setProcessingReject] = useState<Set<string>>(new Set());
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await genderVerificationService.getAll();
        setItems(res.data || []);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch verifications');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(i =>
      i.user?.displayName?.toLowerCase().includes(q) ||
      i.user?.email?.toLowerCase().includes(q)
    );
  }, [items, search]);

  const renderTable = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Gender Verifications</h2>
        <div className="relative max-w-xs w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name or email..."
            className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-wine-500 focus:border-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      {actionError && (
        <div className="px-4 sm:px-6 py-2 text-sm text-red-600 dark:text-red-400 border-b border-gray-200 dark:border-gray-700">
          {actionError}
        </div>
      )}

      {isLoading ? (
        <div className="p-6">
          {Array(5).fill(0).map((_, idx) => (
            <div key={idx} className="animate-pulse h-10 bg-gray-100 dark:bg-gray-700 rounded mb-2" />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 text-red-600 dark:text-red-400">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">No verifications found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Media</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.user?.displayName || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.user?.email || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.media ? (
                      <a href={item.media} target="_blank" rel="noreferrer" className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:underline">
                        <ImageIcon className="w-3 h-3 mr-1" />
                        View
                      </a>
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    {item.status === 'pending' ? (
                    <div className="inline-flex items-center gap-2">
                      <button
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Approve"
                        disabled={processingAccept.has(item.id) || processingReject.has(item.id)}
                        onClick={async () => {
                          setActionError(null);
                          setProcessingAccept(prev => new Set(prev).add(item.id));
                          try {
                            await genderVerificationService.accept(item.id, item.user._id);
                            setItems(prev => prev.filter(v => v.id !== item.id));
                          } catch (e: any) {
                            setActionError(e?.message || 'Failed to approve');
                          } finally {
                            setProcessingAccept(prev => { const n = new Set(prev); n.delete(item.id); return n; });
                          }
                        }}
                      >
                        {processingAccept.has(item.id) ? (
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg>
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Reject"
                        disabled={processingAccept.has(item.id) || processingReject.has(item.id)}
                        onClick={async () => {
                          setActionError(null);
                          setProcessingReject(prev => new Set(prev).add(item.id));
                          try {
                            await genderVerificationService.reject(item.id, item.user._id);
                            setItems(prev => prev.filter(v => v.id !== item.id));
                          } catch (e: any) {
                            setActionError(e?.message || 'Failed to reject');
                          } finally {
                            setProcessingReject(prev => { const n = new Set(prev); n.delete(item.id); return n; });
                          }
                        }}
                      >
                        {processingReject.has(item.id) ? (
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg>
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  if (layout?.isInLayout) {
    return (
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Gender Verification</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Review users pending gender verification</p>
        </div>
        {renderTable()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Gender Verification</h1>
        </div>
        {renderTable()}
      </div>
    </div>
  );
};

export default Gender;
