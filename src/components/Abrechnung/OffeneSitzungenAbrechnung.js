// Zeigt eine Übersicht aller offenen (nicht abgerechneten) Termine/Sitzungen an 
// und bietet die Möglichkeit, eine neue manuelle Abrechnung zu starten.

import React from 'react';

// Icons
const PlusIcon = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);

const Billing = ({ unbilledAppointments, isLoading, onStartBilling, onStartManualBilling }) => {
    
    const btnPrimary = "bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm flex items-center justify-center transition-colors";

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-semibold text-gray-800">Offene Abrechnungen</h3>
                    <button
                        onClick={onStartManualBilling}
                        className={`${btnPrimary} text-sm`}
                    >
                        <PlusIcon className="mr-2" />
                        Sitzung manuell abrechnen
                    </button>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    {isLoading && <p className="text-sm text-gray-500">Lade offene Termine...</p>}
                    {!isLoading && unbilledAppointments.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">
                            Sehr gut! Es gibt keine offenen Abrechnungen aus dem Kalender.
                        </p>
                    )}
                    <ul className="space-y-2">
                        {unbilledAppointments.map(event => (
                            <li key={event.id}>
                                <button 
                                    onClick={() => onStartBilling(event)} 
                                    className="w-full text-left p-3 bg-yellow-100 hover:bg-yellow-200 rounded-md text-sm text-yellow-800 font-medium transition-colors"
                                >
                                    {new Date(event.start.dateTime).toLocaleDateString('de-DE')} - {event.summary}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Billing;
