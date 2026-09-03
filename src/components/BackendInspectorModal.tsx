import React, { useState, useEffect } from 'react';
import { X, Database, Terminal, FileCode, RefreshCw, Copy, Check, Download, Server, HardDrive, ShieldCheck, AlertOctagon } from 'lucide-react';

interface BackendInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetDatabase: () => Promise<void>;
}

export const BackendInspectorModal: React.FC<BackendInspectorModalProps> = ({
  isOpen,
  onClose,
  onResetDatabase,
}) => {
  const [activeTab, setActiveTab] = useState<'raw' | 'logs' | 'metrics'>('raw');
  const [backendData, setBackendData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const fetchRawBackend = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/backend/raw');
      if (res.ok) {
        const json = await res.json();
        setBackendData(json);
      }
    } catch (err) {
      console.error('Failed to fetch raw backend state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRawBackend();
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = () => {
    if (backendData?.rawDatabase) {
      navigator.clipboard.writeText(JSON.stringify(backendData.rawDatabase, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadJson = () => {
    if (!backendData?.rawDatabase) return;
    const blob = new Blob([JSON.stringify(backendData.rawDatabase, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-backend-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to restore the initial preset (6,400 SAR budget and 10 serial logs)?')) {
      setIsResetting(true);
      try {
        await onResetDatabase();
        await fetchRawBackend();
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#202124]/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white text-[#202124] w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-xl border border-[#dadce0] flex flex-col overflow-hidden font-sans">
        {/* Header */}
        <div className="px-6 py-4.5 bg-white border-b border-[#f1f3f4] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#e8f0fe] border border-[#d2e3fc] text-[#1a73e8] flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-[#202124] text-lg google-font-heading">
                  Backend Database & Server Inspector
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]">
                  Express.js Port 3000
                </span>
              </div>
              <p className="text-xs text-[#5f6368]">
                Live inspection of data stored in backend file system (<code className="text-[#1a73e8] font-mono">data/db.json</code>)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchRawBackend}
              title="Refresh backend data"
              className="p-2 text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] rounded-full transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#1a73e8]' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-3 bg-[#f8fafd] border-b border-[#f1f3f4] text-xs">
          <div className="p-3 bg-white rounded-2xl border border-[#dadce0]">
            <span className="text-[#5f6368] block text-[11px] font-medium">Storage File</span>
            <span className="text-[#1a73e8] font-mono font-medium truncate block">
              {backendData?.databasePath ? 'data/db.json' : 'Loading...'}
            </span>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-[#dadce0]">
            <span className="text-[#5f6368] block text-[11px] font-medium">Total Serial Logs</span>
            <span className="text-[#202124] font-semibold font-mono">
              {backendData?.totalExpenses ?? '...'} Entries
            </span>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-[#dadce0]">
            <span className="text-[#5f6368] block text-[11px] font-medium">Database File Size</span>
            <span className="text-[#202124] font-semibold font-mono">
              {backendData?.databaseSizeBytes ? `${(backendData.databaseSizeBytes / 1024).toFixed(2)} KB` : '0 KB'}
            </span>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-[#dadce0]">
            <span className="text-[#5f6368] block text-[11px] font-medium">Server Uptime</span>
            <span className="text-[#1a73e8] font-mono font-medium">
              {backendData?.serverMetrics ? `${backendData.serverMetrics.uptimeSeconds}s active` : 'Active'}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[#f1f3f4] bg-[#f8fafd] flex-shrink-0">
          <div className="flex items-center gap-2 bg-[#f1f3f4] p-1 rounded-full border border-[#dadce0]">
            <button
              onClick={() => setActiveTab('raw')}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === 'raw'
                  ? 'bg-white text-[#1a73e8] shadow-2xs font-semibold'
                  : 'text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Raw JSON Database</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === 'logs'
                  ? 'bg-white text-[#1a73e8] shadow-2xs font-semibold'
                  : 'text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>
                Backend Audit Trail ({backendData?.rawDatabase?.auditLogs?.length || 0})
              </span>
            </button>

            <button
              onClick={() => setActiveTab('metrics')}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === 'metrics'
                  ? 'bg-white text-[#1a73e8] shadow-2xs font-semibold'
                  : 'text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>API & Diagnostics</span>
            </button>
          </div>

          {activeTab === 'raw' && (
            <div className="flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#f1f3f4] border border-[#dadce0] text-xs font-medium text-[#202124] transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#137333]" /> : <Copy className="w-3.5 h-3.5 text-[#5f6368]" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>

              <button
                onClick={downloadJson}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#f1f3f4] border border-[#dadce0] text-xs font-medium text-[#202124] transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#5f6368]" />
                <span>Download .json</span>
              </button>
            </div>
          )}
        </div>

        {/* Content View */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs">
          {activeTab === 'raw' && (
            <div className="bg-[#f8fafd] p-4 rounded-2xl border border-[#dadce0] overflow-x-auto text-[#1a73e8] leading-relaxed max-h-[50vh]">
              {loading ? (
                <div className="py-8 text-center text-[#5f6368]">Connecting to Express backend...</div>
              ) : (
                <pre className="text-xs font-mono text-[#202124]">{JSON.stringify(backendData?.rawDatabase, null, 2)}</pre>
              )}
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-2">
              <div className="text-xs text-[#5f6368] mb-3 font-sans">
                Real-time server-side mutation audit log. Every expense added, bulk upload, or budget edit is recorded with timestamp and count.
              </div>

              <div className="bg-[#f8fafd] p-3 rounded-2xl border border-[#dadce0] divide-y divide-[#e8eaed] max-h-[50vh] overflow-y-auto">
                {backendData?.rawDatabase?.auditLogs?.map((log: any) => (
                  <div key={log.id} className="py-2.5 first:pt-0 last:pb-0 font-sans">
                    <div className="flex items-center justify-between text-[11px] text-[#5f6368] mb-1">
                      <span className="inline-flex items-center gap-1 font-mono text-[#1a73e8] font-bold">
                        <ShieldCheck className="w-3 h-3 text-[#1a73e8]" />
                        [{log.action}]
                      </span>
                      <span className="font-mono text-[#70757a]">
                        {new Date(log.timestamp).toLocaleTimeString()} • {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-[#202124] font-medium">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-4 font-sans text-xs">
              <div className="bg-white p-4 rounded-2xl border border-[#dadce0]">
                <h4 className="font-medium text-[#202124] text-sm mb-3 flex items-center gap-2 google-font-heading">
                  <Server className="w-4 h-4 text-[#1a73e8]" />
                  Live REST API Endpoints
                </h4>
                <div className="space-y-2 font-mono text-[#202124]">
                  <div className="flex items-center justify-between p-3 bg-[#f8fafd] rounded-xl border border-[#dadce0]">
                    <span className="text-[#1a73e8] font-bold">GET /api/data</span>
                    <span className="text-[#5f6368] text-xs font-sans">Returns categories, budget summary & all expenses</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#f8fafd] rounded-xl border border-[#dadce0]">
                    <span className="text-[#1a73e8] font-bold">POST /api/expenses</span>
                    <span className="text-[#5f6368] text-xs font-sans">Record single daily log expense with consecutive S.No</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#f8fafd] rounded-xl border border-[#dadce0]">
                    <span className="text-[#1a73e8] font-bold">POST /api/expenses/bulk</span>
                    <span className="text-[#5f6368] text-xs font-sans">Bulk insert 10 to 15 items in one atomic transaction</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#f8fafd] rounded-xl border border-[#dadce0]">
                    <span className="text-[#1a73e8] font-bold">GET /api/backend/raw</span>
                    <span className="text-[#5f6368] text-xs font-sans">Full file system dump, server metrics & audit stream</span>
                  </div>
                </div>
              </div>

              {/* Reset action */}
              <div className="p-4 rounded-2xl bg-[#fce8e6] border border-[#fad2cf] flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-[#c5221f] text-xs flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4 text-[#c5221f]" />
                    Reset Backend to Initial User Specification
                  </h4>
                  <p className="text-[11px] text-[#c5221f]/80 mt-0.5">
                    Restores 6,400 SAR budget (Grocery 600, Food 600, Rent 2250, etc.) and initial 10 serial expenses.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isResetting}
                  className="px-4 py-2 rounded-full bg-[#d93025] hover:bg-[#c5221f] text-white font-medium text-xs shadow-xs transition-colors"
                >
                  {isResetting ? 'Resetting...' : 'Reset Backend'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-[#f1f3f4] flex items-center justify-between flex-shrink-0 text-xs text-[#5f6368]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1e8e3e]"></span>
            <span>Express Server Active • Persistent File Storage</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-white hover:bg-[#f1f3f4] border border-[#dadce0] text-[#202124] font-medium transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
