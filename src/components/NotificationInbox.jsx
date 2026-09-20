import React from 'react';
import { 
  X, 
  Bell, 
  Smartphone, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  Clock 
} from 'lucide-react';

export default function NotificationInbox({ isOpen, onClose, notifications, familyIdNumber }) {
  if (!isOpen) return null;

  const relevantNotifications = (notifications || []).filter(
    n => !familyIdNumber || n.familyIdNumber === familyIdNumber
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-300 w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-xs">
        {/* Header */}
        <div className="bg-[#0f2b5c] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm">
              Official Government SMS & Dispatch Inbox
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Dispatches */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-[#f8fafc]">
          {relevantNotifications.length === 0 ? (
            <div className="text-center py-8 text-slate-500 space-y-1">
              <Smartphone className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="font-semibold">No SMS notifications received yet.</p>
              <p className="text-[11px]">
                When a Taluka Officer verifies or acts on your application, simulated SMS alerts will appear here.
              </p>
            </div>
          ) : (
            relevantNotifications.map(item => (
              <div 
                key={item.id}
                className={`p-3.5 rounded-lg border bg-white shadow-xs space-y-1.5 ${
                  item.type === 'APPROVAL'
                    ? 'border-green-300 border-l-4 border-l-green-600'
                    : 'border-red-300 border-l-4 border-l-red-600'
                }`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold flex items-center gap-1 text-slate-800">
                    <Smartphone className="w-3.5 h-3.5 text-blue-800" />
                    SMS from GJ-GOVT • Ref: {item.familyIdNumber}
                  </span>
                  <span className="text-slate-500 font-mono">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {item.message}
                </p>

                <div className="pt-1 flex flex-wrap justify-between items-center gap-2 text-[10px] text-slate-500 border-t border-slate-100 mt-1">
                  <span className="font-mono text-blue-900 font-semibold flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-green-600" />
                    Delivered to: +91 {item.mobileNumber || "9825143210"}
                  </span>
                  <span className="font-bold text-green-700">✓ Delivered via State NIC Gateway</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#0f2b5c] text-white font-bold rounded hover:bg-[#091c3d]"
          >
            Close Inbox
          </button>
        </div>
      </div>
    </div>
  );
}
