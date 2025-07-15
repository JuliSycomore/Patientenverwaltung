import React, { useState, useEffect } from 'react';

// Import der Test-Formulare...
import { Bdi2EntryForm } from '../Wissen/psychodiagnostic/BDI2.js';
import { FEP2EntryForm } from '../Wissen/psychodiagnostic/FEP2.js';
import { HSCL11EntryForm } from '../Wissen/psychodiagnostic/HSCL11.js';
import { SCL90REntryForm } from '../Wissen/psychodiagnostic/SCL90R.js';
import { GAD7EntryForm } from '../Wissen/psychodiagnostic/GAD7.js';
import { CoreOmEntryForm } from '../Wissen/psychodiagnostic/CoreOm.js';
import { IIPCEntryForm } from '../Wissen/psychodiagnostic/IIP-C.js';

// Icon...
const XCircle = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>);

const ZentraleTestErfassungModal = ({ isOpen, onClose, onSave, testInfo, patients, testToUpdate, onUpdate, activePatient }) => {
    const [selectedPatientId, setSelectedPatientId] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (testToUpdate) {
                // Bestehende Logik für die Bearbeitung eines Tests
                const patientId = patients.find(p => p[testToUpdate.testType + 'Results']?.some(t => t.testInstanceId === testToUpdate.testInstanceId))?.id;
                setSelectedPatientId(patientId || '');
            } else if (activePatient) {
                // NEU: Wenn ein aktiver Patient übergeben wird (aus der Akte)
                setSelectedPatientId(activePatient.id);
            } else {
                // Fallback: Modal wird von der Hauptseite geöffnet
                setSelectedPatientId('');
            }
        }
    }, [isOpen, testToUpdate, activePatient, patients]);

    if (!isOpen || !testInfo) return null;

    const handleFormSave = (formDataFromChild) => {
        if (testToUpdate) {
            onUpdate(testToUpdate.testInstanceId, testToUpdate.testType, formDataFromChild.results, formDataFromChild.date);
        } else {
            if (!selectedPatientId) {
                alert("Bitte wählen Sie zuerst eine*n Patient*in aus.");
                return;
            }
            const testData = {
                testId: testInfo.id,
                results: formDataFromChild.results,
                date: formDataFromChild.date,
            };
            onSave(selectedPatientId, testData);
        }
        onClose();
    };

    const renderTestEntryForm = () => {
        const selectedPatient = patients.find(p => p.id === selectedPatientId);
        const patientAge = selectedPatient?.geburtsdatum ? new Date().getFullYear() - new Date(selectedPatient.geburtsdatum).getFullYear() : null;
        const patientGender = selectedPatient?.gender || '1';
        
        switch (testInfo.id) {
            case 'hscl11': return <HSCL11EntryForm onSave={handleFormSave} />;
            case 'bdi2': return <Bdi2EntryForm onSave={handleFormSave} />;
            case 'gad7': return <GAD7EntryForm onSave={handleFormSave} />;
            case 'coreOm': return <CoreOmEntryForm onSave={handleFormSave} />;
            case 'iipc': return <IIPCEntryForm onSave={handleFormSave} patientAge={patientAge} patientGender={patientGender} />;
            case 'fep2': return <FEP2EntryForm onSave={handleFormSave} />;
            case 'scl90r': return <SCL90REntryForm onSave={handleFormSave} patientAge={patientAge} patientGender={patientGender} />;
            default:
                return (
                    <div className="text-center p-4 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600">Für diesen Test ist kein spezifisches Eingabeformular vorhanden.</p>
                    </div>
                );
        }
    };

    const inputStyle = "block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed";
    
    const modalWidth = testInfo.id === 'iipc' || testInfo.id === 'scl90r' ? 'max-w-6xl' : 'max-w-5xl';
    const title = testToUpdate ? `Test vervollständigen: ${testInfo.name}` : `Neuen Test erfassen: ${testInfo.name}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-[99] p-4">
            <div className={`bg-white p-6 rounded-lg shadow-xl w-full ${modalWidth} max-h-[90vh] flex flex-col`}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <XCircle className="w-7 h-7" />
                    </button>
                </div>
                <div className="space-y-6 overflow-y-auto pr-2">
                    {/* Patientenauswahl wird nur angezeigt, wenn sie nicht durch `activePatient` gesperrt ist. */}
                     <div className="flex-shrink-0">
                        <label htmlFor="patient-select" className="block text-sm font-medium text-gray-700">Patient*in</label>
                        <select id="patient-select" value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} className={inputStyle} disabled={!!testToUpdate || !!activePatient}>
                            <option value="" disabled>Bitte wählen...</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>{p.name}, {p.vorname} ({p.chiffre})</option>
                            ))}
                        </select>
                    </div>
                    
                    {selectedPatientId ? (
                        <div className="border-t pt-4">
                            {renderTestEntryForm()}
                        </div>
                    ) : (
                         <div className="text-center p-8 border-t">
                            <p className="text-gray-500">Bitte wählen Sie einen Patienten aus, um mit der Eingabe zu beginnen.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ZentraleTestErfassungModal;