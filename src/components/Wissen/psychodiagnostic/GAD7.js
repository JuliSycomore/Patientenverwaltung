import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';

const Trash2 = ({ className = "w-4 h-4" }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>);

const GAD7_QUESTIONS = [
    "Gefühle der Nervosität, Ängstlichkeit oder Anspannung",
    "Unfähigkeit, Sorgen zu stoppen oder zu kontrollieren",
    "Übermäßige Sorgen bezüglich verschiedener Angelegenheiten",
    "Schwierigkeiten, sich zu entspannen",
    "So rastlos sein, dass das Stillsitzen schwer fällt",
    "Schnelle Verärgerung oder Gereiztheit",
    "Angstgefühle, als könnte etwas Schreckliches passieren"
];

const GAD7_ANSWER_OPTIONS = ["Nie", "An manchen Tagen", "An mehr als der Hälfte der Tage", "Beinahe jeden Tag"];
const GAD7_ANSWER_POINTS = [0, 1, 2, 3];

export const GAD7EntryForm = ({ onSave }) => {
    const [itemScores, setItemScores] = useState(Array(7).fill(null));
    const [useCustomDate, setUseCustomDate] = useState(false);
    const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);

    const handleScoreChange = (itemIndex, score) => {
        const newItemScores = [...itemScores];
        newItemScores[itemIndex] = score;
        setItemScores(newItemScores);
    };

    // NEU: Keyboard-Eingabe-Logik
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (['0', '1', '2', '3'].includes(event.key)) {
                event.preventDefault();
                const score = parseInt(event.key, 10);
                const nextEmptyIndex = itemScores.findIndex(s => s === null);
                
                if (nextEmptyIndex !== -1) {
                    handleScoreChange(nextEmptyIndex, score);
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [itemScores]); // Wichtig: Abhängigkeit von itemScores, damit immer der aktuelle Stand verwendet wird
    
    const handleSave = () => {
        if (itemScores.some(score => score === null)) {
            alert("Bitte beantworten Sie alle 7 Fragen.");
            return;
        }
        const totalScore = itemScores.reduce((sum, score) => sum + score, 0);
        onSave({ 
            results: { itemScores, totalScore },
            date: new Date(testDate).toISOString()
        });
    };

    const totalScore = itemScores.reduce((sum, score) => sum + (typeof score === 'number' ? score : 0), 0);
    const inputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm";

    return (
        <div className="space-y-6">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frage</th>
                            {GAD7_ANSWER_OPTIONS.map((option, index) => (
                                <th key={index} scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{option} ({GAD7_ANSWER_POINTS[index]})</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {GAD7_QUESTIONS.map((question, qIndex) => (
                            <tr key={qIndex} className={qIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{qIndex+1}. {question}</td>
                                {GAD7_ANSWER_POINTS.map(pointValue => (
                                    <td key={pointValue} className="px-6 py-4 whitespace-nowrap text-center">
                                        <input
                                            type="radio"
                                            name={`gad7-item-${qIndex}`}
                                            checked={itemScores[qIndex] === pointValue}
                                            onChange={() => handleScoreChange(qIndex, pointValue)}
                                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
                 <div className="text-right">
                    <p className="text-md font-semibold text-gray-700">Gesamtpunktzahl: <span className="text-xl font-bold text-teal-600">{totalScore}</span></p>
                </div>
                 <div className="space-y-2 p-3 bg-gray-50 rounded-md border">
                    <div className="flex items-center">
                        <input type="checkbox" id="custom-date-toggle-gad7" checked={useCustomDate} onChange={(e) => setUseCustomDate(e.target.checked)} className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"/>
                        <label htmlFor="custom-date-toggle-gad7" className="ml-2 block text-sm text-gray-900">Anderes Testdatum verwenden</label>
                    </div>
                    {useCustomDate && (
                        <div>
                            <label htmlFor="test-date-gad7" className="block text-xs font-medium text-gray-600 mb-1">Benutzerdefiniertes Testdatum</label>
                            <input type="date" id="test-date-gad7" value={testDate} onChange={(e) => setTestDate(e.target.value)} className={inputStyle}/>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end">
                <button onClick={handleSave} className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700">Ergebnisse speichern</button>
            </div>
        </div>
    );
};

const GAD7Component = ({ patient, onDeleteResult }) => {
    const btnDanger = "bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-md flex items-center";
    
    const cutoffs = [
        { level: 'Minimal', y1: 0, y2: 4, color: 'rgba(74, 222, 128, 0.1)' },
        { level: 'Mild', y1: 5, y2: 9, color: 'rgba(250, 204, 21, 0.1)' },
        { level: 'Moderate', y1: 10, y2: 14, color: 'rgba(251, 146, 60, 0.15)' },
        { level: 'Severe', y1: 15, y2: 21, color: 'rgba(239, 68, 68, 0.15)' }
    ];

    const chartData = (patient.gad7Results || []).map(r => ({
        date: new Date(r.date).toLocaleDateString('de-DE'),
        Score: r.results?.totalScore
    })).sort((a,b) => new Date(a.date.split('.').reverse().join('-')) - new Date(b.date.split('.').reverse().join('-')));
    
    return (
        <div>
            <h4 className="text-xl font-semibold text-gray-700 mb-4">GAD-7 Ergebnisse</h4>
            
            <div className="mb-6">
                <h5 className="text-md font-semibold text-gray-600 mb-2">Protokollierte Ergebnisse:</h5>
                <ul className="space-y-2">
                    {(patient.gad7Results || []).map((result, index) => (
                        <li key={result.testInstanceId || index} className="flex justify-between items-center bg-white border p-3 rounded-md shadow-sm">
                            <div>
                                <span className="font-medium">{new Date(result.date).toLocaleDateString('de-DE')}</span>: 
                                <span className="text-gray-700 ml-2"> Gesamtpunktzahl: <strong>{result.results?.totalScore}</strong></span>
                            </div>
                            {/* KORREKTUR: Übergibt die eindeutige testInstanceId anstelle des Datums */}
                            <button onClick={() => onDeleteResult('gad7', result.testInstanceId)} className={`${btnDanger} p-1 text-xs`}><Trash2 /></button>
                        </li>
                    ))}
                    {(patient.gad7Results || []).length === 0 && <p className="text-sm text-gray-500">Keine GAD-7 Ergebnisse erfasst.</p>}
                </ul>
            </div>

            {(patient.gad7Results || []).length > 0 && (
                <div>
                    <h5 className="text-md font-semibold text-gray-600 mb-3">Verlaufsgraph GAD-7</h5>
                    <div className="bg-white p-4 rounded-lg shadow" style={{ height: '400px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis domain={[0, 21]} ticks={[0, 4, 9, 14, 21]} />
                                <Tooltip />
                                <Legend verticalAlign="top" height={36}/>
                                {cutoffs.map(c => (
                                    <ReferenceArea key={c.level} y1={c.y1} y2={c.y2} fill={c.color} strokeOpacity={0.3} label={{ value: c.level, position: 'insideTopLeft', fill: '#6b7280', fontSize: 12, dx: 10, dy: 10 }} />
                                ))}
                                <Line type="monotone" dataKey="Score" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GAD7Component;