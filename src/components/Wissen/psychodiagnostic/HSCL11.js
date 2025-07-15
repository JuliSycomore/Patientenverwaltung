import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Trash2 = ({ className = "w-4 h-4" }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>);

export const HSCL11EntryForm = ({ onSave }) => {
    const [angst, setAngst] = useState('');
    const [depression, setDepression] = useState('');
    const [useCustomDate, setUseCustomDate] = useState(false);
    const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSave = () => {
        const angstScore = parseInt(angst, 10);
        const depressionScore = parseInt(depression, 10);

        if (isNaN(angstScore) || angstScore < 0 || angstScore > 20 || isNaN(depressionScore) || depressionScore < 0 || depressionScore > 24) {
            alert("Ungültige HSCL-Werte. Angst (0-20), Depression (0-24).");
            return;
        }

        onSave({ 
            results: { angst: angstScore, depression: depressionScore, cumulative: angstScore + depressionScore },
            date: new Date(testDate).toISOString()
        });
    };

    const inputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm";

    return(
        <div className="space-y-4">
            <div>
                <label htmlFor="hsclAngst" className="block text-sm font-medium text-gray-700">Angst (0-20)</label>
                <input type="number" id="hsclAngst" value={angst} onChange={(e) => setAngst(e.target.value)} min="0" max="20" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
                <label htmlFor="hsclDepression" className="block text-sm font-medium text-gray-700">Depression (0-24)</label>
                <input type="number" id="hsclDepression" value={depression} onChange={(e) => setDepression(e.target.value)} min="0" max="24" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
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

const HSCL11Component = ({ patient, onDeleteTest }) => {
    const btnDanger = "bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-md flex items-center";

    const completedResults = (patient.hscl11Results || []).filter(r => r.status !== 'pending');

    const chartData = completedResults.map(r => ({
        date: new Date(r.date).toLocaleDateString('de-DE'),
        angst: r.results?.angst,
        depression: r.results?.depression,
        cumulative: r.results?.cumulative,
    })).sort((a,b) => new Date(a.date.split('.').reverse().join('-')) - new Date(b.date.split('.').reverse().join('-')));

    return (
        <div>
            <h4 className="text-xl font-semibold text-gray-700 mb-4">HSCL-11 Ergebnisse</h4>
            
            <div className="mb-6">
                <h5 className="text-md font-semibold text-gray-600 mb-2">Protokollierte Ergebnisse:</h5>
                <ul className="space-y-2">
                    {completedResults.map((result, index) => (
                        <li key={result.testInstanceId || index} className="flex justify-between items-center bg-white border p-3 rounded-md shadow-sm">
                            <div>
                                <span className="font-medium">{new Date(result.date).toLocaleDateString('de-DE')}</span>: 
                                <span className="text-sm text-gray-600 ml-2">Angst: {result.results?.angst}</span>, 
                                <span className="text-sm text-gray-600 ml-2">Depression: {result.results?.depression}</span>, 
                                <span className="text-sm text-gray-600 ml-2">Gesamt: {result.results?.cumulative}</span>
                            </div>
                            <button onClick={() => onDeleteTest(result.testInstanceId, 'hscl11')} className={`${btnDanger} p-1 text-xs`}><Trash2 /></button>
                        </li>
                    ))}
                    {completedResults.length === 0 && <p className="text-sm text-gray-500">Keine abgeschlossenen HSCL-11 Ergebnisse erfasst.</p>}
                </ul>
            </div>

            {chartData.length > 0 && (
                <div>
                    <h5 className="text-md font-semibold text-gray-600 mb-3">Verlaufsgraph HSCL-11</h5>
                    <div className="bg-white p-4 rounded-lg shadow" style={{ height: '400px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis domain={[0, 44]} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="angst" name="Angst" stroke="#8884d8" activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="depression" name="Depression" stroke="#82ca9d" />
                                <Line type="monotone" dataKey="cumulative" name="Gesamt" stroke="#ffc658" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HSCL11Component;