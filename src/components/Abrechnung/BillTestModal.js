// Zeigt ein Modal an, um einen Test nachträglich einer Abrechnung/Sitzung 
// zuzuordnen oder eine neue Abrechnung für einen Test zu erstellen. 
// Es können Multiplikator, Datum und Phase gewählt werden.


import React, { useState, useEffect, useMemo } from 'react';

const BillTestModal = ({ isOpen, onClose, onSave, testToBill, patientSessions }) => {
    const [billingData, setBillingData] = useState({
        sessionId: 'new',
        multiplier: testToBill?.recommendation || 1,
        date: new Date().toISOString().split('T')[0],
        phase: 'Probatorik',
    });

    useEffect(() => {
        if (isOpen && testToBill) {
            setBillingData({
                sessionId: 'new',
                multiplier: testToBill.recommendation || 1,
                date: new Date().toISOString().split('T')[0],
                phase: 'Probatorik',
            });
        }
    }, [isOpen, testToBill]);

    const existingSessions = useMemo(() => {
        if (!patientSessions) return [];
        return patientSessions
            .filter(s => s.structuredNotes && !s.structuredNotes.thema?.startsWith('Testdiagnostik:'))
            .sort((a,b) => new Date(b.date) - new Date(a.date));
    }, [patientSessions]);

    if (!isOpen || !testToBill) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBillingData(prev => ({...prev, [name]: value}));
    };

    const handleSave = () => {
        onSave(testToBill, billingData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-[99] p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h3 className="text-lg font-semibold mb-4">Test nachträglich abrechnen: {testToBill.name}</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Abrechnungszuordnung</label>
                        <select 
                            name="sessionId"
                            value={billingData.sessionId}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        >
                            <option value="new">Neue Abrechnung für diesen Test erstellen</option>
                            {existingSessions.map(session => (
                                <option key={session.eventId || session.date} value={session.eventId || session.date}>
                                   Sitzung vom {new Date(session.date).toLocaleDateString('de-DE')} - {session.structuredNotes?.thema || 'Sitzung'}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Multiplikator (x 5 Minuten)</label>
                        <input type="number" name="multiplier" value={billingData.multiplier} onChange={handleChange} min="1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>

                    {billingData.sessionId === 'new' && (
                        <div className="space-y-4 mt-4 p-4 border-t">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Datum für Abrechnung</label>
                                <input type="date" name="date" value={billingData.date} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Testung während:</label>
                                <div className="mt-2 flex flex-col space-y-2">
                                     <label className="flex items-center"><input type="radio" name="phase" value="Probatorik" checked={billingData.phase === 'Probatorik'} onChange={handleChange} /> <span className="ml-2">Probatorik</span></label>
                                     <label className="flex items-center"><input type="radio" name="phase" value="Schluss" checked={billingData.phase === 'Schluss'} onChange={handleChange} /> <span className="ml-2">Schluss (im Rahmen des Antrags)</span></label>
                                     <label className="flex items-center"><input type="radio" name="phase" value="Kurzzeittherapie" checked={billingData.phase === 'Kurzzeittherapie'} onChange={handleChange} /> <span className="ml-2">Kurzzeittherapie</span></label>
                                     <label className="flex items-center"><input type="radio" name="phase" value="Langzeittherapie" checked={billingData.phase === 'Langzeittherapie'} onChange={handleChange} /> <span className="ml-2">Langzeittherapie</span></label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-md">Abbrechen</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700">Speichern & Abrechnen</button>
                </div>
            </div>
        </div>
    );
};

export default BillTestModal;