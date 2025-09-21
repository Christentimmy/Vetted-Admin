import { useState, useEffect } from 'react';
import { X, Receipt, CheckCircle, Clock, XCircle, AlertCircle, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscriptionService, type Invoice } from '../services/subscription';

interface InvoiceHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

const InvoiceHistoryDialog = ({ isOpen, onClose, userId, userName }: InvoiceHistoryDialogProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusIcons = {
    paid: <CheckCircle className="w-4 h-4 text-green-500" />,
    pending: <Clock className="w-4 h-4 text-yellow-500" />,
    failed: <XCircle className="w-4 h-4 text-red-500" />,
    cancelled: <AlertCircle className="w-4 h-4 text-gray-500" />
  };

  const statusColors = {
    paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100); // Assuming amount is in cents
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchInvoiceHistory = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const result = await subscriptionService.getUserInvoiceHistory(userId);
      setInvoices(result.data);
    } catch (err) {
      setError('Failed to load invoice history');
      console.error('Error fetching invoice history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      fetchInvoiceHistory();
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-4xl transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 text-left shadow-xl transition-all"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-wine-100 dark:bg-wine-900/30 rounded-lg">
                  <Receipt className="w-6 h-6 text-wine-600 dark:text-wine-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Invoice History
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {userName}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-wine-600"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading invoice history...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
                    <button
                      onClick={fetchInvoiceHistory}
                      className="text-sm text-wine-600 hover:text-wine-700 dark:text-wine-400 dark:hover:text-wine-300"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              ) : invoices.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No invoices found</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center">
                        <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Total Invoices</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {invoices.length}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Paid</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {invoices.filter(inv => inv.status === 'paid').length}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-wine-50 dark:bg-wine-900/20 rounded-lg p-4">
                      <div className="flex items-center">
                        <DollarSign className="w-5 h-5 text-wine-500 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(invoices.reduce((sum, inv) => sum + inv.amount, 0))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Invoice Table */}
                  <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Invoice ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {invoices.map((invoice) => (
                            <motion.tr
                              key={invoice.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-mono text-gray-900 dark:text-white">
                                  {invoice.id}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatCurrency(invoice.amount)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[invoice.status]}`}>
                                  {statusIcons[invoice.status]}
                                  <span className="ml-1 capitalize">{invoice.status}</span>
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(invoice.created)}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default InvoiceHistoryDialog;
