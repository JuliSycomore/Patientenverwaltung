import React, { useState, useEffect } from 'react';

const XCircle = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>);

// Helper function to calculate age
const calculateAge = (birthdate) => {
    if (!birthdate) return 0;
    const birthDate = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const AddBillingPeriodModal = ({ isOpen, onClose, onSave, patient }) => {
    const [periodData, setPeriodData] = useState({
        name: '',
        date: new Date().toISOString().split('T')[0], // Nur noch ein Datum
        pointsLimit: 1092,
        type: 'probatorik'
    });

    // Automatically set points limit based on patient age when modal opens
    useEffect(() => {
        if (isOpen && patient) {
            const age = calculateAge(patient.geburtsdatum);
            const defaultPoints = age < 22 ? 1636 : 1092;
            setPeriodData(prev => ({ ...prev, pointsLimit: defaultPoints }));
        }
    }, [isOpen, patient]);


    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setPeriodData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value, 10) : value
        }));
    };

const handleSubmit = (e) => {
    e.preventDefault();
    // Add this validation block
    if (!periodData.name || !periodData.date || isNaN(new Date(periodData.date))) {
        alert("Bitte füllen Sie alle Felder korrekt aus. Das Datum scheint ungültig zu sein.");
        return;
    }
    onSave(periodData);
};

    const inputStd = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-[99] p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Abrechnungszeitraum anlegen</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <XCircle className="w-7 h-7" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Bezeichnung</label>
                        <input type="text" name="name" id="name" value={periodData.name} onChange={handleChange} required className={inputStd} placeholder="z.B. Probatorik, 1. KZT-Abschnitt"/>
                    </div>
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Datum</label>
                        <input type="date" name="date" id="date" value={periodData.date} onChange={handleChange} required className={inputStd} />
                    </div>
                     <div>
                        <label htmlFor="pointsLimit" className="block text-sm font-medium text-gray-700">Punkte-Kontingent (automatisch vorgeschlagen)</label>
                        <input type="number" name="pointsLimit" id="pointsLimit" value={periodData.pointsLimit} onChange={handleChange} required className={inputStd} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Art des Zeitraums</label>
                        <select name="type" value={periodData.type} onChange={handleChange} className={inputStd}>
                            <option value="probatorik">Probatorik</option>
                            <option value="verlauf">Verlauf (KZT/LZT)</option>
                            <option value="abschluss">Abschluss</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Abbrechen</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Speichern</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddBillingPeriodModal;
