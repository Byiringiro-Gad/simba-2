const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'admin', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Find the end of the file — specifically the last closing of ProductModal AnimatePresence
const marker = "onClose={() => { setShowProductModal(false); setEditProduct(null); setIsNewProduct(false); }}";
const markerIdx = content.lastIndexOf(marker);
if (markerIdx === -1) { console.error('marker not found'); process.exit(1); }

// Find end of that AnimatePresence block — look for the closing </AnimatePresence> after marker
const closeAP = content.indexOf('</AnimatePresence>', markerIdx);
if (closeAP === -1) { console.error('closing AnimatePresence not found'); process.exit(1); }
const insertAt = closeAP + '</AnimatePresence>'.length;

console.log('Inserting staff modal at position', insertAt);

const staffModal = `

      {/* Staff modal */}
      <AnimatePresence>
        {showStaffModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={() => setShowStaffModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 bg-brand-dark">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-gray-900" />
                    </div>
                    <p className="font-black text-white">{editStaff ? 'Edit Staff Account' : 'Add Staff Account'}</p>
                  </div>
                  <button onClick={() => setShowStaffModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {staffFormError && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-700 dark:text-red-400 font-medium">{staffFormError}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Full Name</label>
                    <input value={staffForm.name} onChange={e => setStaffForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Jean Pierre Habimana"
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium outline-none focus:border-brand transition-colors dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Username *</label>
                    <input value={staffForm.username} onChange={e => setStaffForm(f => ({ ...f, username: e.target.value }))}
                      placeholder="e.g. manager_remera"
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium outline-none focus:border-brand transition-colors dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                      {editStaff ? 'New Password (leave blank to keep current)' : 'Password *'}
                    </label>
                    <input type="password" value={staffForm.password} onChange={e => setStaffForm(f => ({ ...f, password: e.target.value }))}
                      placeholder={editStaff ? 'Leave blank to keep existing' : 'Min 6 characters'}
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium outline-none focus:border-brand transition-colors dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Branch *</label>
                    <select value={staffForm.branchId}
                      onChange={e => {
                        const b = BRANCHES_LIST.find(b => b.id === e.target.value);
                        setStaffForm(f => ({ ...f, branchId: e.target.value, branchName: b?.name ?? e.target.value }));
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium outline-none focus:border-brand transition-colors dark:text-white">
                      {BRANCHES_LIST.map(b => <option key={b.id} value={b.id}>{b.name.replace('Simba Supermarket ', '')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Role *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['staff', 'manager'] as const).map(r => (
                        <button key={r} type="button" onClick={() => setStaffForm(f => ({ ...f, role: r }))}
                          className={clsx('py-2.5 rounded-xl border-2 text-sm font-black transition-all',
                            staffForm.role === r
                              ? r === 'manager' ? 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                                                : 'border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                              : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                          )}>
                          {r === 'manager' ? 'Manager' : 'Staff'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-6 flex gap-3">
                  <button onClick={() => setShowStaffModal(false)}
                    className="flex-1 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-black text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSaveStaff} disabled={savingStaff}
                    className="flex-1 py-3 rounded-2xl bg-brand-dark text-white font-black text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {savingStaff
                      ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                      : <><CheckCircle2 className="w-4 h-4" /> {editStaff ? 'Save Changes' : 'Create Account'}</>
                    }
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>`;

content = content.slice(0, insertAt) + staffModal + content.slice(insertAt);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Staff modal inserted successfully');
