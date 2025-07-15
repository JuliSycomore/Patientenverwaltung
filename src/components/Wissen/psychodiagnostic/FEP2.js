import React, { useState, useRef } from 'react';

const Trash2 = ({ className = "w-4 h-4" }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>);

const FEP2_ITEMS_TO_REVERSE = [1, 2, 5, 9, 14, 15, 19, 21, 22, 27, 29, 30, 39]; 
const FEP2_SKALEN_DEFINITION = { WOHLBEFINDEN: { items: [1, 5, 9, 14, 22, 30, 39], minItemsRequired: 7 }, BESCHWERDEN: { items: [4, 6, 7, 8, 10, 12, 23, 24, 31, 34, 38], minItemsRequired: 10 }, BESCHWERDEN_ANGST: { items: [4, 8, 12, 23], minItemsRequired: 4 }, BESCHWERDEN_DEPRESSIVITAET: { items: [7, 10, 24, 31, 34, 38], minItemsRequired: 5 }, INTERPERSONALE_BEZIEHUNG: { items: [11, 13, 16, 18, 20, 25, 26, 28, 32, 33, 36, 40], minItemsRequired: 11 }, INTERPERSONALE_INTROVERTIERT_SCHEU: { items: [28, 36, 40], minItemsRequired: 3 }, INTERPERSONALE_AUSNUTZBAR_NACHGIEBIG: { items: [13, 20, 26], minItemsRequired: 3 }, INTERPERSONALE_KONKURRIEREND_UNTERSTUETZEND: { items: [11, 16, 33], minItemsRequired: 3 }, INTERPERSONALE_SELBSTUNSICHER_ZURUECKHALTEND: { items: [18, 25, 32], minItemsRequired: 3 }, KONGRUENZ: { items: [2, 3, 15, 17, 19, 21, 27, 29, 35, 37], minItemsRequired: 8 }, };
const calculateFep2Scores = (itemScoresRaw) => { const itemScores = itemScoresRaw.map((score, index) => { const itemNum = index + 1; if (FEP2_ITEMS_TO_REVERSE.includes(itemNum) && score > 0 && score <=5) { return 6 - score; } return score; }); const answeredItemsCount = itemScores.filter(score => score > 0 && score <= 5).length; const calculatedScales = {}; if (answeredItemsCount >= 32) { const sum = itemScores.reduce((acc, score) => acc + (score > 0 && score <=5 ? score : 0), 0); calculatedScales.gesamtbelastung = answeredItemsCount > 0 ? parseFloat((sum / answeredItemsCount).toFixed(2)) : null; } else { calculatedScales.gesamtbelastung = null; } for (const skalaName in FEP2_SKALEN_DEFINITION) { const def = FEP2_SKALEN_DEFINITION[skalaName]; let sum = 0; let count = 0; def.items.forEach(itemNum => { const score = itemScores[itemNum - 1]; if (score > 0 && score <= 5) { sum += score; count++; } }); if (count >= def.minItemsRequired) { calculatedScales[skalaName.toLowerCase()] = parseFloat((sum / count).toFixed(2)); } else { calculatedScales[skalaName.toLowerCase()] = null; } } return calculatedScales; };

export const FEP2EntryForm = ({ onSave }) => {
    const [itemScores, setItemScores] = useState(Array(40).fill(''));
    const inputRefs = useRef([]);
    const [useCustomDate, setUseCustomDate] = useState(false);
    const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);

    const handleItemChange = (index, value) => {
        if (!/^[1-5]?$/.test(value)) return;
        const newScores = [...itemScores];
        newScores[index] = value;
        setItemScores(newScores);
        if (value.length === 1 && index < 39 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    };
    
    const handleSave = () => {
        const parsedScores = itemScores.map(s => parseInt(s, 10) || 0);
        const answeredCount = parsedScores.filter(s => s >= 1 && s <= 5).length;
        if (answeredCount < 32) {
            alert("Bitte beantworten Sie mindestens 80% (32) der FEP-2 Items.");
            return;
        }
        const calculatedScales = calculateFep2Scores(parsedScores);
        
        onSave({ 
            results: { itemScores: parsedScores, calculatedScales },
            date: new Date(testDate).toISOString()
        });
    };

    const inputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm";

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-3">
                {itemScores.map((score, index) => ( 
                    <div key={index}>
                        <label htmlFor={`fepItem${index+1}`} className="block text-xs font-medium text-gray-600">Item {index+1}</label>
                        <input 
                            ref={el => inputRefs.current[index] = el}
                            type="number" 
                            id={`fepItem${index+1}`} 
                            value={score} 
                            onChange={(e) => handleItemChange(index, e.target.value)} 
                            placeholder="1-5" 
                            className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-center"
                        />
                    </div>
                ))}
            </div>

            <div className="space-y-2 p-3 bg-gray-50 rounded-md border">
                <div className="flex items-center">
                    <input type="checkbox" id="custom-date-toggle" checked={useCustomDate} onChange={(e) => setUseCustomDate(e.target.checked)} className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"/>
                    <label htmlFor="custom-date-toggle" className="ml-2 block text-sm text-gray-900">Anderes Testdatum verwenden</label>
                </div>
                {useCustomDate && (
                    <div>
                        <label htmlFor="test-date" className="block text-xs font-medium text-gray-600 mb-1">Benutzerdefiniertes Testdatum</label>
                        <input type="date" id="test-date" value={testDate} onChange={(e) => setTestDate(e.target.value)} className={inputStyle}/>
                    </div>
                )}
            </div>

            <div className="flex justify-end">
                <button onClick={handleSave} className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700">Ergebnisse speichern</button>
            </div>
        </div>
    );
};

const FEP2Component = ({ patient, onDeleteTest }) => {
    const btnDanger = "bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-md flex items-center";
    const completedResults = (patient.fep2Results || []).filter(r => r.status !== 'pending');

    return (
        <div>
            <h4 className="text-xl font-semibold text-gray-700 mb-4">FEP-2 Ergebnisse</h4>
            
            <div className="space-y-4">
                <h5 className="text-md font-semibold text-gray-600 mb-2">Protokollierte Ergebnisse:</h5>
                {completedResults.length === 0 && <p className="text-sm text-gray-500">Keine abgeschlossenen FEP-2 Ergebnisse erfasst.</p>}
                {completedResults.map((result, index) => (
                    <div key={result.testInstanceId || index} className="bg-white border p-4 rounded-md shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                            <p className="font-medium text-indigo-600">Datum: {new Date(result.date).toLocaleDateString('de-DE')}</p>
                            <button onClick={() => onDeleteTest(result.testInstanceId, 'fep2')} className={`${btnDanger} p-1 text-xs`}><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            {result.results?.calculatedScales && Object.entries(result.results.calculatedScales).map(([key, value]) => ( 
                                <div key={key} className="flex justify-between">
                                    <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                                    <span className="font-medium text-gray-800">
                                        {value === null ? 'N/A' : value} 
                                        {key === 'gesamtbelastung' && value !== null && (value > 2.49 ? <span className="ml-1 text-red-500">(Belastet)</span> : <span className="ml-1 text-green-500">(Unbelastet)</span>)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div> 
    );
};

export default FEP2Component;