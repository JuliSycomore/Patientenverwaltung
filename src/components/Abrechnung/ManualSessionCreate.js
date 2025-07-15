// Zeigt ein Modal (Dialogfenster) an, in dem ein:e Patient:in, 
// ein Datum und eine Sitzungsnummer ausgewählt werden können, 
// um eine neue manuelle Abrechnung/Sitzung zu starten.

import React, { useState } from 'react';

const BaseModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-[90] p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};

const ManualBillingSetupModal = ({ isOpen, onClose, patients, onStart }) => {
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
    const [sessionNumber, setSessionNumber] = useState(''); // NEU

    const handleStart = () => {
        if (!selectedPatientId || !sessionDate) {
            alert("Bitte wählen Sie einen Patienten und ein Datum aus.");
            return;
        }
        // NEU: Sitzungsnummer wird übergeben
        onStart(selectedPatientId, sessionDate, sessionNumber); 
        onClose();
    };

    React.useEffect(() => {
        if (!isOpen) {
            setSelectedPatientId('');
            setSessionDate(new Date().toISOString().split('T')[0]);
            setSessionNumber(''); // NEU: Zurücksetzen
        }
    }, [isOpen]);

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title="Sitzung manuell anlegen">
            <div className="space-y-4">
                <div>
                    <label htmlFor="patient-select" className="block text-sm font-medium text-gray-700">Patient/in</label>
                    <select
                        id="patient-select"
                        value={selectedPatientId}
                        onChange={(e) => setSelectedPatientId(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm"
                    >
                        <option value="" disabled>Bitte wählen...</option>
                        {patients.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.name}, {p.vorname} ({p.chiffre})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="session-date" className="block text-sm font-medium text-gray-700">Datum</label>
                        <input
                            type="date"
                            id="session-date"
                            value={sessionDate}
                            onChange={(e) => setSessionDate(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                     {/* NEU: Feld für Sitzungsnummer */}
                    <div>
                        <label htmlFor="session-number" className="block text-sm font-medium text-gray-700">Sitzungs-Nr.</label>
                        <input
                            type="number"
                            id="session-number"
                            value={sessionNumber}
                            onChange={(e) => setSessionNumber(e.target.value)}
                            placeholder="z.B. 5"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                </div>
            </div>
            <div className="flex justify-end mt-6">
                <button
                    onClick={handleStart}
                    disabled={!selectedPatientId || !sessionDate}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                >
                    Weiter zur Abrechnung
                </button>
            </div>
        </BaseModal>
    );
};

export default ManualBillingSetupModal;