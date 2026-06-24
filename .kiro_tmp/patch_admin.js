const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'admin', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Find the position of activeView === 'settings' occurrence
const settingsIdx = content.indexOf("activeView === 'settings'");
if (settingsIdx === -1) {
  console.error('Could not find settings view');
  process.exit(1);
}

// Find the comment line just before it (going backwards to find the opening of the block)
// We need to insert staff view before the settings view block
// Find the "{activeView === 'settings'" line start
const lineStart = content.lastIndexOf('\n', settingsIdx) + 1;

// Find the comment line before settings view (go back one more line)
const commentLineEnd = lineStart - 1; // the \n before the settings line
const commentLineStart = content.lastIndexOf('\n', commentLineEnd - 1) + 1;
const commentLine = content.slice(commentLineStart, commentLineEnd);
console.log('Comment line:', JSON.stringify(commentLine));

const staffViewBlock = `
          {/* STAFF VIEW */}
          {activeView === 'staff' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-gray-900 dark:text-white">Branch Staff</p>
                  <p className="text-sm text-gray-400 mt-0.5">Manage manager and staff accounts for all branches</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={loadStaff}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-brand transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                  </button>
                  <button onClick={openNewStaff}
                    className="flex items-center gap-1.5 px-4 py-2 bg-brand-dark text-white rounded-xl text-xs font-black hover:bg-gray-800 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Add Staff
                  </button>
                </div>
              </div>

              {staffLoading ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-16 flex justify-center">
                  <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                </div>
              ) : staffError ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-red-200 dark:border-red-800 p-12 text-center">
                  <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                  <p className="font-black text-gray-900 dark:text-white mb-1">Failed to load staff</p>
                  <p className="text-sm text-red-500 mb-4">{staffError}</p>
                  <button onClick={loadStaff}
                    className="px-5 py-2 bg-brand-dark text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors inline-flex items-center gap-2 mx-auto">
                    <RefreshCw className="w-4 h-4" /> Try Again
                  </button>
                </div>
              ) : staffList.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-16 text-center">
                  <UserCheck className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                  <p className="font-black text-gray-900 dark:text-white mb-1">No staff accounts yet</p>
                  <p className="text-sm text-gray-400 mb-4">Staff are seeded automatically on first branch login, or add them manually here.</p>
                  <button onClick={openNewStaff}
                    className="px-5 py-2 bg-brand-dark text-white rounded-xl font-black text-sm hover:bg-gray-800 transition-colors inline-flex items-center gap-2 mx-auto">
                    <Plus className="w-4 h-4" /> Add First Staff Member
                  </button>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="hidden sm:grid grid-cols-[1fr_180px_120px_90px_100px] gap-4 px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    {['Name / Username', 'Branch', 'Role', 'Created', ''].map((h, i) => (
                      <p key={i} className="text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</p>
                    ))}
                  </div>
                  <div className="divide-y divide-gray-50 dark:divide-gray-800">
                    {staffList.map((s, i) => (
                      <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                        className="grid grid-cols-1 sm:grid-cols-[1fr_180px_120px_90px_100px] gap-3 sm:gap-4 px-5 py-3.5 hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0',
                            s.role === 'manager' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                          )}>
                            {s.name?.charAt(0)?.toUpperCase() ?? '?'}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900 dark:text-white">{s.name}</p>
                            <p className="text-xs text-gray-400 font-mono">@{s.username}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{s.branch_name?.replace('Simba Supermarket ', '')}</p>
                        </div>
                        <div className="flex items-center">
                          <span className={clsx('px-2 py-0.5 rounded-full text-xs font-black',
                            s.role === 'manager'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          )}>
                            {s.role === 'manager' ? 'Manager' : 'Staff'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <p className="text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEditStaff(s)}
                            className="p-1.5 text-gray-400 hover:text-brand-dark hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteStaff(s.id, s.name)} disabled={deletingStaffId === s.id}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-40">
                            {deletingStaffId === s.id
                              ? <div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                              : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

`;

// Insert just before the settings block line
content = content.slice(0, lineStart) + staffViewBlock + content.slice(lineStart);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Staff view inserted successfully at position', lineStart);
