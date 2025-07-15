import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';

const Trash2 = ({ className = "w-4 h-4" }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>);

export const Bdi2EntryForm = ({ onSave }) => {
    const [score, setScore] = useState(0);
    const [useCustomDate, setUseCustomDate] = useState(false);
    const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSave = () => {
        if (score < 0 || score > 63) {
            alert("Bitte geben Sie einen gültigen BDI-II Wert zwischen 0 und 63 ein.");
            return;
        }
        onSave({
            results: { score: score },
            date: new Date(testDate).toISOString(),
        });
    };
    
    const inputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm";

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="bdi-score" className="block text-sm font-medium text-gray-700">BDI-II Summenwert</label>
                <input type="number" id="bdi-score" value={score} onChange={(e) => setScore(parseInt(e.target.value, 10) || 0)} className={inputStyle} min="0" max="63" />
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
            <div className="flex justify-end pt-4">
                <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700">Testergebnis speichern</button>
            </div>
        </div>
    );
};

const CustomBdiLabel = (props) => { const { x, y, width, text } = props; if (typeof x !== 'number' || isNaN(x) || typeof y !== 'number' || isNaN(y) || typeof width !== 'number' || isNaN(width) || width <= 0) { return null; } const labelX = x + width / 2; return (<text x={labelX} y={y} fill="#666" textAnchor="middle" dy={-4} fontSize="10">{text}</text>); };

const BDI2Component = ({ patient, onDeleteTest, bdiCutoffs, bdiAxisTicks }) => {
    const btnDanger = "bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-md flex items-center";
    
    const completedResults = (patient.bdi2Results || []).filter(r => r.status !== 'pending');
    
    const chartData = completedResults.map(r => ({
        ...r,
        score: r.results?.score, 
        date: new Date(r.date).toLocaleDateString('de-DE')
    })).sort((a,b) => new Date(a.date.split('.').reverse().join('-')) - new Date(b.date.split('.').reverse().join('-')));

    return (
        <div>
            <h4 className="text-xl font-semibold text-gray-700 mb-4">BDI-II Ergebnisse</h4>
            
            <div className="mb-6">
                <h5 className="text-md font-semibold text-gray-600 mb-2">Protokollierte Ergebnisse:</h5>
                <ul className="space-y-2">
                    {completedResults.map((result, index) => (
                        <li key={result.testInstanceId || index} className="flex justify-between items-center bg-white border p-3 rounded-md shadow-sm">
                            <div>
                                <span className="font-medium">{new Date(result.date).toLocaleDateString('de-DE')}</span>: 
                                <span className="text-gray-700 ml-2"> Score {result.results?.score}</span>
                            </div>
                            <button onClick={() => onDeleteTest(result.testInstanceId, 'bdi2')} className={`${btnDanger} p-1 text-xs`}><Trash2 /></button>
                        </li>
                    ))}
                    {completedResults.length === 0 && <p className="text-sm text-gray-500">Keine abgeschlossenen BDI-II Ergebnisse erfasst.</p>}
                </ul>
            </div>

            {chartData.length > 0 && (
                <div>
                    <h5 className="text-md font-semibold text-gray-600 mb-3">Verlaufsgraph BDI-II</h5>
                    <div className="bg-white p-4 rounded-lg shadow" style={{ height: '400px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis domain={[0, 63]} ticks={bdiAxisTicks} allowDataOverflow={true}/>
                                <Tooltip />
                                <Legend verticalAlign="top" height={36}/>
                                {bdiCutoffs.map(cutoff => (
                                    <ReferenceArea key={cutoff.label} y1={cutoff.y1} y2={cutoff.y2} fill={cutoff.color} strokeOpacity={0.3} label={<CustomBdiLabel text={cutoff.label} y={cutoff.y2 - (cutoff.y2-cutoff.y1)/2} />}/>
                                ))}
                                <Line type="monotone" dataKey="score" name="BDI-II Score" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BDI2Component;