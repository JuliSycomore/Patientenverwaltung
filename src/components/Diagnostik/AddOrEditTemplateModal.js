import React, { useState, useEffect } from 'react';

const XCircle = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>);

const AddOrEditTemplateModal = ({ isOpen, onClose, onSave, availableTests, editingTemplate }) => {
    const [name, setName] = useState('');
    const [selectedTests, setSelectedTests] = useState([]);

    useEffect(() => {
        if (editingTemplate) {
            setName(editingTemplate.name || '');
            setSelectedTests(editingTemplate.tests || []);
        } else {
            setName('');
            setSelectedTests([]);
        }
    }, [editingTemplate, isOpen]);

    if (!isOpen) return null;

    const handleTestToggle = (testId) => {
        setSelectedTests(prev => 
            prev.includes(testId) ? prev.filter(id => id !== testId) : [...prev, testId]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            alert("Bitte geben Sie einen Namen für die Vorlage ein.");
            return;
        }
        
        // Erstelle das Speicherobjekt ohne die ID
        const saveData = {
            name: name.trim(),
            tests: selectedTests
        };

        // Füge die ID nur hinzu, wenn wir eine bestehende Vorlage bearbeiten
        if (editingTemplate?.id) {
            saveData.id = editingTemplate.id;
        }

        onSave(saveData);
        onClose();
    };


    const inputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-[99] p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-semibold text-gray-800">{editingTemplate ? 'Vorlage bearbeiten' : 'Neue Vorlage erstellen'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <XCircle className="w-7 h-7" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="template-name" className="block text-sm font-medium text-gray-700">Name der Vorlage</label>
                            <input type="text" id="template-name" value={name} onChange={(e) => setName(e.target.value)} required className={inputStyle} placeholder="z.B. Eingangsdiagnostik" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tests auswählen</label>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-gray-50 border rounded-md max-h-80 overflow-y-auto">
                                {availableTests.map(test => (
                                    <label key={test.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100">
                                        <input
                                            type="checkbox"
                                            checked={selectedTests.includes(test.id)}
                                            onChange={() => handleTestToggle(test.id)}
                                            className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                        />
                                        <span className="text-sm text-gray-800">{test.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-6 mt-4 border-t flex-shrink-0">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Abbrechen</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Vorlage speichern</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddOrEditTemplateModal;