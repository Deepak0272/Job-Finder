import React from 'react';
import { Menu, Sparkles, Upload, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Navbar = ({ onOpenMobile, onOpenResumeModal }) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="hidden sm:inline-block text-xs font-semibold text-slate-500">
          Welcome to <span className="text-blue-600 font-bold">AI Job Finder</span>
        </span>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Upload Resume Button with AI sparkle */}
        <button
          onClick={onOpenResumeModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-sm transition hover:shadow"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-200" />
          <span className="hidden xs:inline">Upload Resume</span>
          <span className="xs:hidden">Resume</span>
        </button>

        {/* User profile avatar or login links */}
        {isAuthenticated ? (
          <Link
            to="/profile"
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="hidden md:inline text-xs font-bold text-slate-700">
              {user?.name?.split(' ')[0]}
            </span>
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-xs font-bold text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-xl transition"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl shadow-sm transition"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
