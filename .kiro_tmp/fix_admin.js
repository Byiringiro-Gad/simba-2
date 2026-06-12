const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'src', 'app', 'admin', 'page.tsx');
let content = fs.readFileSync(file, 'utf8');

// Fix 1: lastRefresh - null initial state to prevent hydration mismatch
content = content.replace(
  'const [lastRefresh, setLastRefresh] = useState(new Date());',
  'const [lastRefresh, setLastRefresh] = useState<Date | null>(null);'
);

// Fix 2: safe access on lastRefresh (two instances of the corrupted middot character)
// Find the line with lastRefresh.toLocaleTimeString() and fix it
content = content.replace(
  /`Last updated: \$\{lastRefresh\.toLocaleTimeString\(\)\}[^`]*`/,
  '`Last updated: ${lastRefresh ? lastRefresh.toLocaleTimeString() : "--"} - Auto-refreshes every 30s`'
);

// Fix 3: Add desktop header bar before the mobile header comment
const mobileHeaderComment = '        {/* Mobile header */}';
const desktopHeader = `        {/* Desktop top header bar */}
        <header className="hidden lg:flex sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 h-14 items-center justify-between flex-shrink-0">
          <div>
            <h1 className="font-black text-gray-900 dark:text-white text-base">
              {activeView === 'orders' ? 'Orders' : activeView === 'products' ? 'Products' : activeView === 'branches' ? 'Branches' : activeView === 'promos' ? 'Promo Codes' : activeView === 'users' ? 'Users' : 'Settings'}
            </h1>
            <p className="text-xs text-gray-400 leading-none mt-0.5">
              {activeView === 'orders' && 'Manage all orders across all branches'}
              {activeView === 'products' && \`\${prodStats.inStock} in stock — \${prodStats.outOfStock} out of stock\`}
              {activeView === 'branches' && \`\${branchStats.length} active branches\`}
              {activeView === 'promos' && \`\${promos.filter(p => p.active).length} active codes\`}
              {activeView === 'users' && \`\${users.length} registered users\`}
              {activeView === 'settings' && 'Site configuration and feature flags'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeView === 'products' && (
              <button onClick={() => { setEditProduct(null); setIsNewProduct(true); setShowProductModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-brand-dark text-white rounded-xl text-sm font-black hover:bg-gray-800 transition-colors">
                <Plus className="w-4 h-4" /> Add Product
              </button>
            )}
            <button onClick={() => { loadOrders(); loadProducts(); loadPromos(); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </header>

`;

if (!content.includes('Desktop top header bar')) {
  content = content.replace(mobileHeaderComment, desktopHeader + mobileHeaderComment);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Done. Lines:', content.split('\n').length);
