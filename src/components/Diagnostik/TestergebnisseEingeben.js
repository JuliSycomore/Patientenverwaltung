// Zeigt ein Modal an, um für einen bestimmten Test die Ergebnisse einzugeben 
// (verschiedene Testformulare werden je nach Testtyp geladen).


import React from 'react';

// --- Imports ---
import { Bdi2EntryForm } from '../Wissen/psychodiagnostic/BDI2.js';
import { FEP2EntryForm } from '../Wissen/psychodiagnostic/FEP2.js';
import { HSCL11EntryForm } from '../Wissen/psychodiagnostic/HSCL11.js';
import { SCL90REntryForm } from '../Wissen/psychodiagnostic/SCL90R.js';
import { GAD7EntryForm } from '../Wissen/psychodiagnostic/GAD7.js';
import { CoreOmEntryForm } from '../Wissen/psychodiagnostic/CoreOm.js';
import { IIPCEntryForm } from '../Wissen/psychodiagnostic/IIP-C.js';

const XCircle = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>);

const Modal = ({ isOpen, onClose, title, children, size = "lg" }) => {
    if (!isOpen) return null;
    const sizeClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-2xl', '3xl': 'max-w-3xl', '4xl': 'max-w-4xl', '5xl': 'max-w-5xl', '6xl': 'max-w-6xl' };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-[99] p-4">
            <div className={`bg-white p-6 rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <XCircle className="w-7 h-7" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2">
                    {children}
                </div>
            </div>
        </div>
    );
};

const AddTestFlowModal = ({ isOpen, onClose, onSave, testInfo, patient }) => {

    if (!isOpen || !testInfo) return null;

    const handleResultsSave = (testData) => {
        onSave({
            testId: testInfo.id,
            ...testData,
        });
        onClose();
    };

    const renderTestEntryForm = () => {
        const patientAge = patient?.geburtsdatum ? (new Date().getFullYear() - new Date(patient.geburtsdatum).getFullYear()) : null;
        const patientGender = patient?.gender || '1'; // Annahme: 1=männlich, 2=weiblich

        switch (testInfo.id) {
            case 'bdi2':
                return <Bdi2EntryForm onSave={handleResultsSave} />;
            case 'fep2': 
                return <FEP2EntryForm onSave={handleResultsSave} />;
            case 'hscl11': 
                return <HSCL11EntryForm onSave={handleResultsSave} />;
            case 'gad7':
                return <GAD7EntryForm onSave={handleResultsSave} />;
            case 'coreOm':
                return <CoreOmEntryForm onSave={handleResultsSave} />;
            case 'iipc':
                return <IIPCEntryForm onSave={handleResultsSave} patientAge={patientAge} patientGender={patientGender} />;
            case 'scl90r': 
                return <SCL90REntryForm onSave={handleResultsSave} patientAge={patientAge} patientGender={patientGender} />;
            default:
                return (
                    <div>
                        <p>Kein Eingabeformular für diesen Testtyp gefunden: {testInfo.id}</p>
                        <div className="flex justify-end mt-4">
                             <button onClick={() => handleResultsSave({ results: { placeholder: true, score: 0 }, date: new Date().toISOString() })} className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                                Als durchgeführt markieren (ohne Ergebnis)
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Test eingeben: ${testInfo.name}`} size={testInfo.id === 'scl90r' || testInfo.id === 'iipc' ? '6xl' : '5xl'}>
            {renderTestEntryForm()}
        </Modal>
    );
};

export default AddTestFlowModal;
