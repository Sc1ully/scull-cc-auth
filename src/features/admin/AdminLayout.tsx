import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  KeySquare,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function AdminLayout() {
  const { signOut, profile } = useAuth()
  const location = useLocation()

  const navItems = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/keys', label: 'Key Inventory', icon: KeySquare },
    { to: '/admin/lootlabs', label: 'LootLabs', icon: Settings },
  ]

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      <aside
        style={{
          width: 'var(--sidebar-width)',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
          padding: '1.5rem 0',
          position: 'sticky',
          top: '64px',
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
        }}
      >
        <div style={{ padding: '0 1rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Admin Panel
          </h2>
          {profile && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              {profile.username}
            </p>
          )}
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0 0.5rem' }}>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.7rem 1rem',
                margin: '0 0.5rem',
                borderRadius: 'var(--radius)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                color: location.pathname === to ? 'var(--accent)' : 'var(--text-secondary)',
                backgroundColor:
                  location.pathname === to ? 'var(--accent-bg)' : 'transparent',
                border:
                  location.pathname === to ? '1px solid var(--accent-border)' : '1px solid transparent',
                transition: 'var(--transition)',
              }}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
          <button
            onClick={signOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.7rem 1rem',
              margin: '0 0.5rem',
              borderRadius: 'var(--radius)',
              border: '1px solid transparent',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: '2rem 1.5rem' }}>
        <Outlet />
      </main>
    </div>
  )
}
