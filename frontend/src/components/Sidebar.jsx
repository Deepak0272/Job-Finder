import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Briefcase,
  Sparkles,
  Bookmark,
  CheckSquare,
  User,
  ShieldCheck,
  Compass,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) => {
  const { user, isAdmin, logout } = useAuth();

  const navItems = [
    { name: 'Discover Jobs', to: '/jobs', icon: Compass },
    { name: 'AI Matches', to: '/ai-recommendations', icon: Sparkles, badge: 'AI' },
    { name: 'Saved Jobs', to: '/saved-jobs', icon: Bookmark },
    { name: 'Application Tracker', to: '/applications', icon: CheckSquare },
    { name: 'My Profile & Skills', to: '/profile', icon: User },
  ];

  if (isAdmin) {
    navItems.push({
      name: 'Admin Dashboard',
      to: '/admin',
      icon: ShieldCheck,
      badge: 'Admin',
    });
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white border-r border-slate-200/90 transition-all duration-300 flex flex-col justify-between ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        <div>
          {/* Logo & Header */}
          <div className="h-16 border-b border-slate-100 flex items-center justify-between px-4">
            <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20 flex-shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="font-extrabold text-slate-900 text-base leading-tight tracking-tight flex items-center gap-1.5">
                    AI Job Finder
                  </span>
                  <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest">
                    Career Assistant
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop collapse toggle */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                  title={isCollapsed ? item.name : ''}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between">
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                            item.badge === 'AI'
                              ? 'bg-blue-600 text-white'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer User Info */}
        <div className="p-3 border-t border-slate-100">
          <div
            className={`flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100 ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Guest Seeker'}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || 'user@jobfinder.ai'}</p>
              </div>
            )}
            {!isCollapsed && (
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
