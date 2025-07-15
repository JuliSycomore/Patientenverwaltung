import React from 'react';

// Wir verwenden die Icons, die bereits in App.js definiert sind
const HomeIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const UsersIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const FileTextIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const BookOpenIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
const LogOut = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;


// Definiert einen einzelnen Navigationslink
const NavLink = ({ icon, label, isActive, onClick }) => {
    const activeClass = isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white';
    return (
        <button onClick={onClick} className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeClass} transition-colors`}>
            {icon}
            <span className="ml-3">{label}</span>
        </button>
    );
};

const Sidebar = ({ mainView, setMainView, handleLogout }) => {
    return (
        <div className="flex flex-col w-64 bg-gray-800 text-white">
            <div className="flex items-center justify-center h-16 flex-shrink-0 px-4 bg-gray-900">
                <h1 className="text-xl font-semibold tracking-tight">Therapie-Dashboard</h1>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto p-4">
                <nav className="flex-1 space-y-4">
                    <div>
                        <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Ansichten</h3>
                        <div className="space-y-1">
                             <NavLink 
                                icon={<UsersIcon />}
                                label="Patientenübersicht"
                                isActive={mainView === 'patients'}
                                onClick={() => setMainView('patients')}
                            />
                             <NavLink 
                                icon={<FileTextIcon />}
                                label="Patientenakte"
                                isActive={mainView === 'patientenakte'}
                                onClick={() => { setMainView('patientenakte'); /* Optional: Patient abwählen */ }}
                            />
                        </div>
                    </div>
                    <div>
                         <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Werkzeuge</h3>
                        <div className="space-y-1">
                            <NavLink 
                                icon={<BookOpenIcon />}
                                label="EBM"
                                isActive={mainView === 'ebm'}
                                onClick={() => setMainView('ebm')}
                            />
                            <NavLink 
                                icon={<BookOpenIcon />}
                                label="ICD-11 Nachschlagewerk"
                                isActive={mainView === 'icd11'}
                                onClick={() => setMainView('icd11')}
                            />
                        </div>
                    </div>
                </nav>

                {/* Logout Button am Ende */}
                <div className="mt-auto flex-shrink-0">
                     <button 
                        onClick={handleLogout} 
                        className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-red-300 hover:bg-red-700 hover:text-white transition-colors"
                    >
                        <LogOut className="mr-3 h-5 w-5" /> Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;