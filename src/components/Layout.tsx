import { Link, Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function Layout() {
  const { user, signOut, profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  return (
    <>
      <header className="card" style={{ borderRadius: 0, border: 'none', background: 'var(--bg)', borderBottom: '1px solid var(--border)', margin: 0, padding: '1rem 1.5rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" className="text-xl font-bold" style={{ color: 'var(--accent)', fontWeight: 700 }}>
            Scull.cc-Auth
          </Link>
          <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {user ? (
              <>
                <NavLink to="/dashboard" style={{ color: 'var(--text-secondary)' }}>Dashboard</NavLink>
                {isAdmin && (
                  <NavLink to="/admin" style={{ color: 'var(--text-secondary)' }}>Admin</NavLink>
                )}
                <button onClick={signOut} className="btn btn-secondary btn-sm">Logout</button>
              </>
            ) : (
              <>
                <NavLink to="/login" style={{ color: 'var(--text-secondary)' }}>Login</NavLink>
                <NavLink to="/register" style={{ color: 'var(--text-secondary)' }}>Register</NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <Outlet />
    </>
  )
}
