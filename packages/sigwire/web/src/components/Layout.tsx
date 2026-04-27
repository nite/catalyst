import { NavLink } from 'react-router-dom'

interface NavItem {
  to: string
  label: string
  icon: string
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Feed', icon: '📡' },
  { to: '/admin', label: 'Admin', icon: '✏️' },
  { to: '/about', label: 'About', icon: 'ℹ️' },
]

function SidebarLink({ to, label, icon }: NavItem) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-orange-500/10 text-orange-400'
            : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800',
        ].join(' ')
      }
    >
      <span className="text-base">{icon}</span>
      {label}
    </NavLink>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      {/* Sidebar — hidden on mobile */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-gray-800 p-4 gap-1">
        <div className="mb-6">
          <span className="text-orange-500 font-bold text-lg tracking-tight">SigWire</span>
        </div>
        {NAV_ITEMS.map((item) => (
          <SidebarLink key={item.to} {...item} />
        ))}
      </aside>

      {/* Content area */}
      <main className="flex-1 min-w-0 pb-16 md:pb-0">
        {children}
      </main>

      {/* Bottom nav — mobile only */}
      <nav className="fixed bottom-0 inset-x-0 md:hidden bg-gray-900 border-t border-gray-800 flex justify-around z-10">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              [
                'flex flex-col items-center gap-0.5 py-2 px-3 text-xs transition-colors',
                isActive ? 'text-orange-400' : 'text-gray-500',
              ].join(' ')
            }
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
