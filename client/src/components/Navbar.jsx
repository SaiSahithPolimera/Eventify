import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { AmountIcon, BrowseIcon, GraphIcon } from "./Icons";

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        setShowDropdown(false);
        navigate("/login");
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="bg-white shadow-sm border-b border-rose-100 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div
                        onClick={() => navigate("/dashboard")}
                        className="cursor-pointer hover:opacity-80 transition-opacity duration-200 group"
                    >
                        <h1 className="text-3xl font-serif text-rose-500 mb-0 group-hover:text-rose-600 transition-colors">
                            Eventify
                        </h1>
                        <p className="text-rose-400 text-xs leading-tight">
                            Discover & manage events
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition-all duration-200 cursor-pointer group"
                                title={user?.name || "User"}
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 text-white font-bold text-sm flex items-center justify-center border-2 border-rose-500 group-hover:border-rose-700 group-hover:shadow-md transition-all duration-200 cursor-pointer">
                                    {getInitials(user?.name)}
                                </div>

                                <div className="hidden sm:block text-left min-w-[140px]">
                                    <p className="text-sm font-semibold text-slate-900 truncate max-w-[120px]">
                                        {user?.name || "User"}
                                    </p>

                                </div>

                                <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>

                            </button>

                            {showDropdown && (
                                <div className="absolute right-0 mt-3 w-64 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">

                                    <div className="py-2">
                                        <button
                                            onClick={() => {
                                                navigate("/dashboard");
                                                setShowDropdown(false);
                                            }}
                                            className="w-full text-left px-5 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-150 flex items-center gap-3 cursor-pointer group"
                                        >
                                           <BrowseIcon/>
                                            <div className="flex-1">
                                                <p className="font-semibold">Browse Events</p>
                                                <p className="text-xs text-slate-500 group-hover:text-slate-600">
                                                    Discover new events
                                                </p>
                                            </div>
                                        </button>

                                        {user?.role === "organizer" && (
                                            <button
                                                onClick={() => {
                                                    navigate("/my-events");
                                                    setShowDropdown(false);
                                                }}
                                                className="w-full text-left px-5 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-150 flex items-center gap-3 cursor-pointer group border-t border-slate-100"
                                            >
                                                <AmountIcon/>
                                                
                                                <div className="flex-1">
                                                    <p className="font-semibold">My Events</p>
                                                    <p className="text-xs text-slate-500 group-hover:text-slate-600">
                                                        Manage your events
                                                    </p>
                                                </div>
                                               <GraphIcon/>
                                            </button>
                                        )}

                                        {user?.role === "organizer" && (
                                            <button
                                                onClick={() => {
                                                    navigate("/admin");
                                                    setShowDropdown(false);
                                                }}
                                                className="w-full text-left px-5 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-150 flex items-center gap-3 cursor-pointer group"
                                            >
                                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                                <div className="flex-1">
                                                    <p className="font-semibold">Admin Dashboard</p>
                                                    <p className="text-xs text-slate-500 group-hover:text-slate-600">
                                                        Track RSVPs & sales
                                                    </p>
                                                </div>
                                                <svg className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        )}

                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-5 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-150 flex items-center gap-3 cursor-pointer group border-t border-slate-100 mt-1"
                                        >
                                            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            <div className="flex-1">
                                                <p className="font-semibold">Logout</p>
                                            </div>
                                            <svg className="w-4 h-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;