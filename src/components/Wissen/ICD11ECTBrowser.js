// src/components/ICD11ECTBrowser.js
import React, { useEffect, useRef, useState } from 'react';
import * as ECT from '@whoicd/icd11ect';
import '@whoicd/icd11ect/style.css';

const ICD11ECTBrowser = ({ patients, selectedPatient, onAssignDiagnosis }) => {
    const isInitialized = useRef(false);
    const [activeFilter, setActiveFilter] = useState(null);
    const [selectedIcd11Entity, setSelectedIcd11Entity] = useState(null);
    const [targetPatientId, setTargetPatientId] = useState('');

    useEffect(() => {
        if (selectedPatient) {
            setTargetPatientId(selectedPatient.id);
        }
    }, [selectedPatient]);

    useEffect(() => {
        if (isInitialized.current) return;
        isInitialized.current = true;

        const mySettings = {
            apiServerUrl: "https://id.who.int",
            apiSecured: true,
            language: "en",
            browserHierarchyAvailable: true,
            browserAdvancedSearchAvailable: true,
            includeDiagnosticCriteria: true,
            hierarchyResizable: true,
            height: "70vh",
            autoBind: false
        };

        const myCallbacks = {
            getNewTokenFunction: async () => {
                try {
                    const response = await fetch('http://localhost:3001/api/icd11-token');
                    if (!response.ok) return null;
                    const result = await response.json();
                    return result.token;
                } catch (e) {
                    console.error("Fehler bei der Token-Anfrage:", e);
                    return null;
                }
            },
            selectedEntityFunction: (selectedEntity) => {
                console.log("Ausgewählte Entität:", selectedEntity); // Zum Debuggen
                setSelectedIcd11Entity(selectedEntity);
            }
        };
        
        ECT.Handler.configure(mySettings, myCallbacks);
        setTimeout(() => { ECT.Handler.bind("1"); }, 100);
        
    }, []); 

    const handleFilterChange = (newFilter) => {
        if (isInitialized.current && ECT) {
            setActiveFilter(newFilter);
            ECT.Handler.overwriteConfiguration("1", { chaptersFilter: newFilter || "" });
        }
    };
    
    const handleAssignClick = () => {
        if (targetPatientId && selectedIcd11Entity) {
            onAssignDiagnosis(targetPatientId, selectedIcd11Entity);
            alert(`Diagnose "${selectedIcd11Entity.selectedText}" wurde dem Patienten zugewiesen.`);
            setSelectedIcd11Entity(null);
        }
    };

    const filterButtons = [
        { label: "Alle Kapitel", filter: null },
        { label: "Psychische Störungen (06)", filter: "06" },
        { label: "Neurolog. Störungen (08)", filter: "08" },
        { label: "Schlaf-Wach-Störungen (07)", filter: "07"},
    ];

    return (
        <div className="p-4 bg-white rounded-lg shadow-lg">
             <h2 className="text-2xl font-semibold text-gray-800 mb-4">ICD-11 Nachschlagewerk & Kodierung</h2>
            <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-sm font-semibold self-center text-gray-600">Schnellfilter:</span>
                {filterButtons.map(({label, filter}) => (
                     <button 
                        key={label}
                        onClick={() => handleFilterChange(filter)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${activeFilter === filter ? 'bg-indigo-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                     >
                        {label}
                     </button>
                ))}
            </div>
            
            <div className="ctw-eb-window" data-ctw-ino="1"></div>

            <div className="mt-4 p-4 border-t-2 border-indigo-200 bg-indigo-50 rounded-b-lg">
                <h3 className="font-semibold text-lg text-gray-800 mb-2">Auswahl zuweisen</h3>
                {selectedIcd11Entity ? (
                    <div className="p-2 bg-white rounded shadow-sm mb-3">
                        <p className="font-semibold text-sm">Ausgewählt:</p>
                        <p className="text-indigo-700 font-mono">{selectedIcd11Entity.code} - {selectedIcd11Entity.selectedText}</p>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 mb-3">Bitte wählen Sie eine Diagnose aus dem Browser oben aus.</p>
                )}

                <div className="flex items-center gap-4">
                    <select value={targetPatientId} onChange={(e) => setTargetPatientId(e.target.value)} className="mt-1 block w-full md:w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 px-3">
                        <option value="" disabled>Patient auswählen...</option>
                        {patients.map(p => ( <option key={p.id} value={p.id}>{p.name} ({p.chiffre})</option> ))}
                    </select>
                    <button onClick={handleAssignClick} disabled={!targetPatientId || !selectedIcd11Entity} className="bg-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                        Zuweisen
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ICD11ECTBrowser;
