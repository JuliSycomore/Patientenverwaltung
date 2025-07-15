


import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DiagnostikTimelineChart from './DiagnostikTimelineChart';

const PlusCircle = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>;
const AlertCircle = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const TagIcon = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path><path d="M7 7h.01"></path></svg>;
const Trash2 = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>;

const DiagnostikZuordnung = ({ patient, availableTests, testCategories, diagnostikTemplates, onCompleteTest, onDeleteTest, onUpdateTestGrund, onAddNewTest }) => {
    const [editingTag, setEditingTag] = useState(null);

    const allTests = useMemo(() => {
        let tests = [];
        availableTests.forEach(testDef => {
            const results = patient[`${testDef.id}Results`] || [];
            results.forEach(result => {
                const instanceId = result.testInstanceId || `test_${testDef.id}_${new Date(result.date).getTime()}`;
                tests.push({ ...testDef, ...result, testInstanceId: instanceId, testType: testDef.id });
            });
        });
        return tests.sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [patient, availableTests]);

    const pendingTests = useMemo(() => allTests.filter(t => t.status === 'pending'), [allTests]);
    const completedTests = useMemo(() => allTests.filter(t => t.status !== 'pending'), [allTests]);

    const chartData = useMemo(() => {
        if (!completedTests || completedTests.length === 0) return [];
        const groupedByDate = completedTests.reduce((acc, test) => {
            const date = new Date(test.date).toLocaleDateString('de-DE');
            if (!acc[date]) acc[date] = [];
            acc[date].push(test);
            return acc;
        }, {});

        return Object.entries(groupedByDate).map(([date, tests]) => ({
            date, count: tests.length, tests
        })).sort((a,b) => new Date(a.date.split('.').reverse().join('-')) - new Date(b.date.split('.').reverse().join('-')));
    }, [completedTests]);
    
    const handleTagChange = (test, newGrund) => {
        onUpdateTestGrund(test.testInstanceId, test.testType, newGrund);
        setEditingTag(null);
    }
    
    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Diagnostik-Verlauf</h3>
                <DiagnostikTimelineChart chartData={chartData} testCategories={testCategories} />
            </div>

            {pendingTests.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Ausstehende Tests</h3>
                    <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-xl space-y-3">
                         <div className="flex items-center text-yellow-800">
                             <AlertCircle className="mr-2"/>
                             <p className="text-sm font-semibold">Bitte tragen Sie die Ergebnisse für die folgenden Tests nach.</p>
                         </div>
                        {pendingTests.map(test => (
                            <div key={test.testInstanceId} className="bg-white p-3 rounded-lg border shadow-sm flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-800">{test.name}</p>
                                    <p className="text-sm text-gray-500">
                                        Hinzugefügt am: {new Date(test.date).toLocaleDateString('de-DE')}
                                        {test.testGrund && ` (${test.testGrund})`}
                                    </p>
                                </div>
                                <button onClick={() => onCompleteTest(test)} className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-1 px-3 rounded-md">
                                    Ergebnisse eintragen
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Protokoll aller abgeschlossenen Tests</h3>
                 <div className="space-y-2">
                    {completedTests.length > 0 ? (
                        completedTests.map(test => (
                            <div key={test.testInstanceId} className="bg-white p-3 rounded-lg border shadow-sm flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-800">{test.name}</p>
                                    <p className="text-sm text-gray-500">
                                        Durchgeführt am: {new Date(test.date).toLocaleDateString('de-DE')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                     {editingTag === test.testInstanceId ? (
                                        <select 
                                            value={test.testGrund || ''}
                                            onChange={(e) => handleTagChange(test, e.target.value)}
                                            onBlur={() => setEditingTag(null)}
                                            className="text-xs border-gray-300 rounded-md shadow-sm"
                                            autoFocus
                                        >
                                            <option value="">Kein Grund</option>
                                            <option value="Einzeltestung">Einzeltestung</option>
                                            {diagnostikTemplates.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                        </select>
                                     ) : (
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{test.testGrund || 'Kein Grund'}</span>
                                     )}
                                     <button onClick={() => setEditingTag(editingTag === test.testInstanceId ? null : test.testInstanceId)} className="text-gray-400 hover:text-blue-600 p-1.5 rounded-full hover:bg-blue-100" title="Grund/Tag bearbeiten">
                                         <TagIcon />
                                     </button>
                                     <button onClick={() => onDeleteTest(test.testInstanceId, test.testType)} className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-100" title="Diesen Test löschen">
                                         <Trash2 className="w-4 h-4" />
                                     </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">Noch keine Tests für diesen Patienten abgeschlossen.</p>
                    )}
                </div>
            </div>
            
            <div className="pt-6 border-t mt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Neuen Test für diesen Patienten hinzufügen</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {availableTests.map(test => (
                        <div key={test.id} className="bg-white p-3 rounded-lg border flex justify-between items-center shadow-sm">
                            <div>
                                <p className="font-semibold text-gray-800">{test.name}</p>
                                <p className="text-xs text-gray-500">EBM: {test.ebm}</p>
                            </div>
                            <button
                                onClick={() => onAddNewTest(test)}
                                className="text-teal-600 hover:text-teal-800 p-2 rounded-full hover:bg-teal-50 transition-colors"
                                title={`Test "${test.name}" hinzufügen`}
                            >
                                <PlusCircle className="w-6 h-6" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default DiagnostikZuordnung;