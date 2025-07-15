// Zeigt ein Modal an, um eine Test-Vorlage einem:r 
// Patient:in zuzuweisen. Listet die enthaltenen Tests auf und speichert die Auswahl.

import React, { useState, useEffect } from 'react';

const XCircle = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>);

const AddTestTemplateModal = ({ isOpen, onClose, onSave, template, patients, availableTests }) => {
    const [selectedPatientId, setSelectedPatientId] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSelectedPatientId('');
        }
    }, [isOpen]);

    if (!isOpen || !template) return null;

    const handleSaveTemplate = () => {
        if (!selectedPatientId) {
            alert("Bitte wählen Sie eine*n Patient*in aus.");
            return;
        }
        onSave(selectedPatientId, template); 
        onClose();
    };

    const testsInTemplate = template.tests.map(testId => 
        availableTests.find(t => t.id === testId)
    ).filter(Boolean); // Filter out any tests that might not be found

    const inputStyle = "block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 sm:text-sm";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-[99] p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Vorlage zuweisen: {template.name}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <XCircle className="w-7 h-7" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="patient-select-template" className="block text-sm font-medium text-gray-700">Patient*in</label>
                        <select id="patient-select-template" value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} className={inputStyle}>
                            <option value="" disabled>Bitte wählen...</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>{p.name}, {p.vorname} ({p.chiffre})</option>
                            ))}
                        </select>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="text-md font-medium text-gray-700">Folgende Tests werden hinzugefügt:</h4>
                        <ul className="list-disc list-inside mt-2 text-sm text-gray-600 space-y-1">
                            {testsInTemplate.map(test => (
                                <li key={test.id}>{test.name}</li>
                            ))}
                        </ul>
                         <p className="text-xs text-gray-500 mt-3">Hinweis: Diese Tests werden ohne spezifische Ergebnisse als "durchgeführt" markiert und können später manuell zugeordnet werden.</p>
                    </div>
                </div>
                 <div className="flex justify-end space-x-3 pt-6 mt-4 border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Abbrechen</button>
                    <button type="submit" onClick={handleSaveTemplate} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700">Vorlage für Patient*in speichern</button>
                </div>
            </div>
        </div>
    );
};

export default AddTestTemplateModal;