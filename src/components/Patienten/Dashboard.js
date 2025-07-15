import React, { useMemo, useState, useEffect, useRef } from 'react';
import { 
    AreaChart, Area, BarChart, Bar, ResponsiveContainer, 
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

// --- ICONS ---
const DollarSignIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const TrendingUpIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>;
const ClockIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const CalendarDaysIcon = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>

// --- SUB-KOMPONENTEN ---
const StatCard = ({ title, value, icon, subtext, colorClass }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-100 flex flex-col justify-between">
        <div className="flex justify-between items-start">
            <h3 className="text-md font-medium text-gray-600">{title}</h3>
            <div className={`p-2 rounded-md ${colorClass}`}>{icon}</div>
        </div>
        <div>
            <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
            <p className="text-sm text-gray-400">{subtext}</p>
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-200 rounded-md shadow-sm">
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-sm text-blue-600">{`Umsatz: €${(payload[0].value || 0).toFixed(2)}`}</p>
                <p className="text-sm text-rose-600">{`Sitzungen: ${payload[1].value || 0}`}</p>
            </div>
        );
    }
    return null;
};

const PatientProgressList = ({ patients }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-gray-100 mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Patientenfortschritt</h2>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {patients.map(p => {
                    const conducted = Math.max(0, ...(p.sessions || []).map(s => s.structuredNotes?.sitzungsnummer || 0));
                    const approved = p.approvedHours || 0;
                    const percentage = approved > 0 ? (conducted / approved) * 100 : 0;
                    return (
                        <div key={p.id}>
                            <div className="flex justify-between mb-1 text-sm">
                                <span className="font-medium text-gray-700">{p.chiffre} ({p.name})</span>
                                <span className="text-gray-500">{conducted} / {approved} Stunden</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- HAUPTKOMPONENTE ---
const Dashboard = ({ patients, profile }) => {
    const [chartType, setChartType] = useState('area');
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const pickerRef = useRef(null);

    const defaultDateRange = {
        from: new Date(new Date().getFullYear(), 0, 1),
        to: new Date(new Date().getFullYear(), 11, 31)
    };
    const [dateRange, setDateRange] = useState(defaultDateRange);

    useEffect(() => {
        function handleClickOutside(event) {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setIsPickerOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [pickerRef]);
    
    // NEU: Styling für den DayPicker, um Text lesbar zu machen
    const pickerStyles = {
        caption: { color: '#111827' },
        day: { color: '#111827' },
        head_cell: { color: '#4b5563', fontWeight: '600' },
        nav_button: { color: '#111827' }
    };

    const dashboardData = useMemo(() => {
        const punktwert = profile.punktwert || 0.116;
        
        const filteredSessions = patients.flatMap(p => 
            (p.sessions || []).filter(s => {
                const sessionDate = new Date(s.date);
                return sessionDate >= dateRange.from && sessionDate <= dateRange.to;
            }).map(s => ({ ...s, patientChiffre: p.chiffre }))
        );

        const totalRevenue = filteredSessions.reduce((sum, s) => {
            const revenue = (s.ebmEntries || []).reduce((revSum, entry) => revSum + (entry.punkte || 0), 0) * punktwert;
            return sum + revenue;
        }, 0);
        const totalSessionsInPeriod = filteredSessions.length;

        const monthlyData = Array.from({ length: 12 }, (_, i) => ({
            name: format(new Date(0, i), 'MMM', { locale: de }),
            Umsatz: 0,
            Sitzungen: 0
        }));

        filteredSessions.forEach(s => {
            const monthIndex = new Date(s.date).getMonth();
            const revenue = (s.ebmEntries || []).reduce((sum, entry) => sum + (entry.punkte || 0), 0) * punktwert;
            monthlyData[monthIndex].Umsatz += revenue;
            monthlyData[monthIndex].Sitzungen += 1;
        });
        
        const totalConductedSessionsOverall = patients.reduce((sum, p) => sum + Math.max(0, ...(p.sessions || []).map(s => s.structuredNotes?.sitzungsnummer || 0)), 0);
        const YEAR_GOAL = 600;
        const annualGoalData = [
            { name: 'Erreicht', value: totalConductedSessionsOverall },
            { name: 'Offen', value: Math.max(0, YEAR_GOAL - totalConductedSessionsOverall) }
        ];

        return { totalRevenue, totalSessionsInPeriod, chartData: monthlyData, annualGoalData };
    }, [patients, profile, dateRange]);

    const PIE_COLORS = ['#3b82f6', '#e5e7eb'];
    const getGreeting = () => "Willkommen zurück";

    return (
        <div className="p-4 md:p-6 lg:p-8 bg-slate-50 min-h-full font-sans">
            <div className="relative">
                {/* NEU: Header mit mehr Padding unten */}
                <header className="bg-blue-600 text-white p-6 rounded-xl -mx-4 -mt-4 md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8 mb-6 pb-24">
                    <h1 className="text-3xl font-bold">{getGreeting()}, {profile.vorname || 'Therapeut/in'}! 👋</h1>
                    <p className="text-blue-200 mt-1">Dein Überblick für den ausgewählten Zeitraum.</p>
                    <div className="mt-4 relative" ref={pickerRef}>
                        <button 
                            onClick={() => setIsPickerOpen(!isPickerOpen)}
                            className="flex items-center bg-white/20 hover:bg-white/30 text-white text-sm font-medium py-1.5 px-3 rounded-md"
                        >
                            <CalendarDaysIcon className="mr-2 h-4 w-4"/>
                            {`${format(dateRange.from, 'd. MMM yyyy', { locale: de })} - ${format(dateRange.to, 'd. MMM yyyy', { locale: de })}`}
                        </button>
                        {isPickerOpen && (
                            <div className="absolute top-full mt-2 z-20 bg-white rounded-md shadow-lg p-2">
                               <DayPicker
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={(range) => {
                                        if(range?.from && range?.to) {
                                            setDateRange(range);
                                            setIsPickerOpen(false);
                                        }
                                    }}
                                    locale={de}
                                    numberOfMonths={2}
                                    styles={pickerStyles} // NEU: Styles für Lesbarkeit
                               />
                            </div>
                        )}
                    </div>
                </header>

                {/* NEU: Kacheln mit negativem Margin, um sie in den Header zu schieben */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 -mt-20 relative z-10">
                     <StatCard 
                        title="Umsatz im Zeitraum" 
                        value={`€ ${dashboardData.totalRevenue.toFixed(2)}`}
                        icon={<TrendingUpIcon className="text-green-600"/>} colorClass="bg-green-100"
                    />
                    <StatCard 
                        title="Sitzungen im Zeitraum" 
                        value={dashboardData.totalSessionsInPeriod}
                        icon={<ClockIcon className="text-blue-600"/>} colorClass="bg-blue-100"
                    />
                     <StatCard 
                        title="Durchschnitt / Sitzung" 
                        value={`€ ${(dashboardData.totalRevenue / (dashboardData.totalSessionsInPeriod || 1)).toFixed(2)}`}
                        icon={<DollarSignIcon className="text-indigo-600"/>} colorClass="bg-indigo-100"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border-2 border-gray-100">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-700">Monatliche Analyse</h2>
                        <div className="flex border border-gray-200 rounded-md">
                            <button onClick={() => setChartType('area')} className={`px-3 py-1 text-sm rounded-l-md ${chartType === 'area' ? 'bg-gray-200 font-semibold' : 'bg-white'}`}>Fläche</button>
                            <button onClick={() => setChartType('bar')} className={`px-3 py-1 text-sm rounded-r-md border-l ${chartType === 'bar' ? 'bg-gray-200 font-semibold' : 'bg-white'}`}>Balken</button>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                         {chartType === 'area' ? (
                            <AreaChart data={dashboardData.chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                <XAxis dataKey="name" tick={{ fontSize: 12 }}/>
                                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" tick={{ fontSize: 12 }} tickFormatter={(value) => `€${value}`}/>
                                <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" tick={{ fontSize: 12 }}/>
                                <Tooltip content={<CustomTooltip />}/>
                                <Area yAxisId="left" type="monotone" dataKey="Umsatz" stroke="#3b82f6" fill="#bfdbfe" />
                                <Area yAxisId="right" type="monotone" dataKey="Sitzungen" stroke="#f43f5e" fill="#ffe4e6" />
                            </AreaChart>
                        ) : (
                            <BarChart data={dashboardData.chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                <XAxis dataKey="name" tick={{ fontSize: 12 }}/>
                                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" tick={{ fontSize: 12 }} tickFormatter={(value) => `€${value}`}/>
                                <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" tick={{ fontSize: 12 }}/>
                                <Tooltip content={<CustomTooltip />}/>
                                <Bar yAxisId="left" dataKey="Umsatz" fill="#3b82f6" />
                                <Bar yAxisId="right" dataKey="Sitzungen" fill="#f43f5e" />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Jahresziel (600 Stunden)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={dashboardData.annualGoalData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={2} dataKey="value">
                                {dashboardData.annualGoalData.map((_, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke={PIE_COLORS[index % PIE_COLORS.length]}/>)}
                            </Pie>
                            <Tooltip formatter={(value, name) => [`${value} Stunden`, name]}/>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <PatientProgressList patients={patients} />
        </div>
    );
};

export default Dashboard;