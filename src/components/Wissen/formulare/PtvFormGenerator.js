import React, { useState, useMemo } from 'react';
import Ptv1Form from './Ptv1Form';
import Ptv2Form from './Ptv2Form';

// --- Icons ---
const FileTextIcon = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>);
const XCircle = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>);
const PrinterIcon = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>);

const PtvFormGenerator = ({ patients, therapistProfile }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState('');

    const selectedPatient = useMemo(() => 
        patients.find(p => p.id === selectedPatientId),
        [selectedPatientId, patients]
    );

    const handleOpenModal = (templateId) => {
        setSelectedTemplateId(templateId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPatientId('');
        setSelectedTemplateId('');
    };

    const handlePrint = () => {
        window.print();
    };

    const formTemplates = [
        { id: 'ptv1', name: 'PTV 1 - Antrag des Versicherten', description: 'Patientenbezogene Angaben zur Kostenerstattung.' },
        { id: 'ptv2', name: 'PTV 2 - Ergänzungsblatt für die KZT/LZT', description: 'Angaben des Therapeuten zum Antrag.' },
    ];

    const CurrentFormComponent = {
        ptv1: Ptv1Form,
        ptv2: Ptv2Form,
    }[selectedTemplateId];

    return (
        <div className="w-full max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Formular-Vorlagen</h3>
            <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                <div className="space-y-3">
                    {formTemplates.map(template => (
                        <div key={template.id} className="p-4 border rounded-lg flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center">
                                <FileTextIcon className="text-teal-500 mr-4" />
                                <div>
                                    <p className="font-semibold text-gray-800">{template.name}</p>
                                    <p className="text-sm text-gray-500">{template.description}</p>
                                </div>
                            </div>
                            <button onClick={() => handleOpenModal(template.id)} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700">
                                Ausfüllen & Drucken
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                    <div className="bg-gray-100 rounded-lg shadow-xl w-full max-w-5xl h-[95vh] flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b bg-white rounded-t-lg">
                            <h2 className="text-xl font-semibold text-gray-800">Formular Generator</h2>
                            <div className="flex items-center gap-4">
                                <button onClick={handlePrint} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                                    <PrinterIcon className="mr-2" /> Drucken
                                </button>
                                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600"><XCircle /></button>
                            </div>
                        </div>
                        <div className="p-4 bg-white border-b">
                            <label htmlFor="patient-select" className="block text-sm font-medium text-gray-700">Patient auswählen</label>
                            <select
                                id="patient-select"
                                value={selectedPatientId}
                                onChange={(e) => setSelectedPatientId(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
                            >
                                <option value="">-- Bitte wählen --</option>
                                {patients.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}, {p.vorname} ({p.chiffre})</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {CurrentFormComponent && <CurrentFormComponent patient={selectedPatient} therapistProfile={therapistProfile} />}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PtvFormGenerator;