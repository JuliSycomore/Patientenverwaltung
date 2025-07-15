import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';

const Trash2 = ({ className = "w-4 h-4" }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>);

const CORE_QUESTIONS = [
    "habe ich mich schrecklich allein und isoliert gefühlt.", "habe ich mich angespannt, unruhig oder nervös gefühlt.", "hatte ich das Gefühl, dass jemand da ist, an den ich mich wenden kann, wenn ich Unterstützung brauche.",
    "war ich zufrieden mit mir.", "habe ich mich völlig energielos gefühlt und konnte mich für nichts begeistern.", "bin ich anderen gegenüber körperlich gewalttätig geworden.",
    "hatte ich das Gefühl, mit Schwierigkeiten umgehen zu können.", "hatte ich Beschwerden, Schmerzen oder andere körperliche Probleme.", "habe ich daran gedacht, mich selbst zu verletzen.",
    "war es mir zu viel, mit anderen zu reden.", "haben mich Anspannung und Angst davon abgehalten, wichtige Dinge zu tun.", "war ich zufrieden mit den Dingen, die ich getan habe.",
    "war ich durch unerwünschte Gedanken und Gefühle beunruhigt.", "war mir zum Weinen zumute.", "habe ich Panik und Schrecken empfunden.",
    "habe ich geplant, mein Leben zu beenden.", "habe ich mich von meinen Problemen überwältigt gefühlt.", "hatte ich Schwierigkeiten, einzuschlafen oder durchzuschlafen.",
    "habe ich Wärme und Zuneigung für jemanden empfunden.", "konnte ich meine Probleme nicht beiseite schieben.", "war ich in der Lage, die meisten Dinge zu erledigen.",
    "habe ich jemanden bedroht oder eingeschüchtert.", "habe ich mich verzweifelt oder hoffnungslos gefühlt.", "dachte ich, es wäre besser, wenn ich tot wäre.",
    "habe ich mich von anderen kritisiert gefühlt.", "dachte ich, dass ich keine Freunde habe.", "habe ich mich unglücklich gefühlt.",
    "haben mich ungewollte Bilder und Erinnerungen gestört.", "war ich in der Gegenwart anderer schnell gereizt.", "habe ich gedacht, dass ich an meinen Problemen und Schwierigkeiten selbst schuld bin.",
    "war ich zuversichtlich im Hinblick auf meine Zukunft.", "habe ich erreicht, was ich wollte.", "habe ich mich von anderen erniedrigt oder beschämt gefühlt.",
    "habe ich mich selbst verletzt oder meine Gesundheit großen Gefahren ausgesetzt."
];

const CORE_REVERSE_SCORED_ITEMS = [3, 4, 7, 12, 19, 21, 31, 32];
const ANSWER_OPTIONS = ["überhaupt nicht", "nur gelegentlich", "manchmal", "oft", "meistens oder immer"];
const ANSWER_POINTS = [0, 1, 2, 3, 4];

export const CoreOmEntryForm = ({ onSave }) => {
    const [itemScores, setItemScores] = useState(Array(34).fill(null));
    const [useCustomDate, setUseCustomDate] = useState(false);
    const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);

    const handleScoreChange = (itemIndex, score) => {
        const newItemScores = [...itemScores];
        newItemScores[itemIndex] = score;
        setItemScores(newItemScores);
    };

    const handleSave = () => {
        const answeredCount = itemScores.filter(s => s !== null).length;
        if (answeredCount < 31) {
            alert(`Bitte beantworten Sie mindestens 31 der 34 Fragen. Sie haben bisher ${answeredCount} beantwortet.`);
            return;
        }

        const processedScores = itemScores.map((score, index) => {
            if (score === null) return null;
            const itemNumber = index + 1;
            return CORE_REVERSE_SCORED_ITEMS.includes(itemNumber) ? 4 - score : score;
        });

        const totalScore = processedScores.reduce((sum, score) => sum + (score || 0), 0);
        const meanScore = totalScore / answeredCount;
        const clinicalScore = meanScore * 10;

        const results = {
            itemScores,
            totalScore,
            meanScore: parseFloat(meanScore.toFixed(2)),
            clinicalScore: parseFloat(clinicalScore.toFixed(2)),
        };
        
        onSave({ results, date: new Date(testDate).toISOString() });
    };

    const inputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm";

    return (
        <div className="space-y-6">
            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Während der letzten Woche...</th>
                            {ANSWER_OPTIONS.map((option, index) => (
                                <th key={index} scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{option}<br/>({ANSWER_POINTS[index]})</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {CORE_QUESTIONS.map((question, qIndex) => (
                            <tr key={qIndex} className={qIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900">...{question}</td>
                                {ANSWER_POINTS.map(pointValue => (
                                    <td key={pointValue} className="px-4 py-4 whitespace-nowrap text-center">
                                        <input
                                            type="radio"
                                            name={`core-item-${qIndex}`}
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
                 <div className="space-y-2 p-3 bg-gray-50 rounded-md border">
                    <div className="flex items-center">
                        <input type="checkbox" id="custom-date-toggle-core" checked={useCustomDate} onChange={(e) => setUseCustomDate(e.target.checked)} className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"/>
                        <label htmlFor="custom-date-toggle-core" className="ml-2 block text-sm text-gray-900">Anderes Testdatum verwenden</label>
                    </div>
                    {useCustomDate && (
                        <div>
                            <label htmlFor="test-date-core" className="block text-xs font-medium text-gray-600 mb-1">Benutzerdefiniertes Testdatum</label>
                            <input type="date" id="test-date-core" value={testDate} onChange={(e) => setTestDate(e.target.value)} className={inputStyle}/>
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

const CoreOmComponent = ({ patient, onDeleteTest }) => {
    const btnDanger = "bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-md flex items-center";
    
    const cutoffs = [
        { level: 'Healthy', y1: 0, y2: 9.9, color: 'rgba(74, 222, 128, 0.1)' },
        { level: 'Mild', y1: 10, y2: 14.9, color: 'rgba(250, 204, 21, 0.1)' },
        { level: 'Moderate', y1: 15, y2: 19.9, color: 'rgba(251, 146, 60, 0.15)' },
        { level: 'Mod-Severe', y1: 20, y2: 24.9, color: 'rgba(239, 68, 68, 0.15)' },
        { level: 'Severe', y1: 25, y2: 40, color: 'rgba(239, 68, 68, 0.25)' }
    ];

    const completedResults = (patient.coreOmResults || []).filter(r => r.status !== 'pending');
    
    const chartData = completedResults.map(r => ({
        date: new Date(r.date).toLocaleDateString('de-DE'),
        'Klinischer Score': r.results?.clinicalScore,
    })).sort((a,b) => new Date(a.date.split('.').reverse().join('-')) - new Date(b.date.split('.').reverse().join('-')));
    
    return (
        <div>
            <h4 className="text-xl font-semibold text-gray-700 mb-4">CORE-OM Ergebnisse</h4>
            
            <div className="mb-6">
                <h5 className="text-md font-semibold text-gray-600 mb-2">Protokollierte Ergebnisse:</h5>
                <ul className="space-y-2">
                    {completedResults.map((result, index) => (
                        <li key={result.testInstanceId || index} className="flex justify-between items-center bg-white border p-3 rounded-md shadow-sm">
                            <div>
                                <span className="font-medium">{new Date(result.date).toLocaleDateString('de-DE')}</span>: 
                                <span className="text-gray-700 ml-2"> Klinischer Score: <strong>{result.results?.clinicalScore}</strong></span>
                            </div>
                            <button onClick={() => onDeleteTest(result.testInstanceId, 'coreOm')} className={`${btnDanger} p-1 text-xs`}><Trash2 /></button>
                        </li>
                    ))}
                    {completedResults.length === 0 && <p className="text-sm text-gray-500">Keine abgeschlossenen CORE-OM Ergebnisse erfasst.</p>}
                </ul>
            </div>

            {chartData.length > 0 && (
                <div>
                    <h5 className="text-md font-semibold text-gray-600 mb-3">Verlaufsgraph CORE-OM (Klinischer Score)</h5>
                    <div className="bg-white p-4 rounded-lg shadow" style={{ height: '400px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis domain={[0, 40]} ticks={[0, 10, 15, 20, 25, 40]} />
                                <Tooltip />
                                <Legend verticalAlign="top" height={36}/>
                                {cutoffs.map(c => (
                                    <ReferenceArea key={c.level} y1={c.y1} y2={c.y2} fill={c.color} strokeOpacity={0.3} label={{ value: c.level, position: 'insideTopLeft', fill: '#6b7280', fontSize: 12, dx: 10, dy: 10 }} />
                                ))}
                                <Line type="monotone" dataKey="Klinischer Score" stroke="#4f46e5" strokeWidth={2} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoreOmComponent;