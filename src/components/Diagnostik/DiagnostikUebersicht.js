import React, { useMemo, useState } from 'react';

const PlusCircle = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>;
const ChevronRight = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 18 15 12 9 6"></polyline></svg>;
const CheckCircle = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;


const ProgressBar = ({ value, max, colorClass = 'bg-blue-500' }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
            <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
        </div>
    );
};

const DiagnostikUebersicht = ({ patient, availableTests, onAddTest, onShowTestDetails, onAssignTestToPeriod, diagnostikAnalysis }) => {
    const [draggedTest, setDraggedTest] = useState(null);
    const [dropHighlight, setDropHighlight] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const unassignedTests = useMemo(() => {
        const tests = [];
        availableTests.forEach(testDef => {
            const results = patient[`${testDef.id}Results`] || [];
            results.forEach(result => {
                if (result.billingPeriodId === null || result.billingPeriodId === undefined) {
                    tests.push({
                        ...testDef,
                        ...result,
                        testType: testDef.id
                    });
                }
            });
        });
        return tests.sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [patient, availableTests]);

    const conductedTests = useMemo(() => {
        return availableTests.map(test => {
            const results = patient[`${test.id}Results`] || [];
            return { ...test, count: results.length, results };
        }).filter(test => test.count > 0);
    }, [patient, availableTests]);

    // Drag & Drop Handlers
    const handleDragStart = (e, test) => {
        setDraggedTest(test);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', JSON.stringify(test));
    };

    const handleDragOver = (e, periodId) => {
        e.preventDefault();
        setDropHighlight(periodId);
    };

    const handleDragLeave = () => {
        setDropHighlight(null);
    };

    const handleDrop = (e, periodId) => {
        e.preventDefault();
        const droppedTest = JSON.parse(e.dataTransfer.getData('text/plain'));
        if (droppedTest) {
            onAssignTestToPeriod(droppedTest.testInstanceId, droppedTest.testType, periodId);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        }
        setDraggedTest(null);
        setDropHighlight(null);
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Testdiagnostik Zuordnung</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white rounded-lg shadow-sm border">
                    <div className="space-y-3">
                        <h4 className="font-semibold text-gray-700">Abrechnungszeiträume</h4>
                        {(patient?.billingPeriods || []).map(period => {
                            const analysis = diagnostikAnalysis[period.id] || { pointsUsed: 0, pointsLimit: 0 };
                            return (
                                <div
                                    key={period.id}
                                    onDragOver={(e) => handleDragOver(e, period.id)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, period.id)}
                                    className={`p-3 rounded-lg border-2 transition-all ${dropHighlight === period.id ? 'border-indigo-500 bg-indigo-50' : 'border-dashed border-gray-300 bg-gray-50'}`}
                                >
                                    <p className="font-semibold text-gray-800">{period.name}</p>
                                    <p className="text-xs text-gray-500">Datum: {new Date(period.date).toLocaleDateString('de-DE')}</p>
                                    <ProgressBar value={analysis.pointsUsed} max={analysis.pointsLimit} />
                                    <p className="text-xs text-gray-600 mt-1">{analysis.pointsUsed} / {analysis.pointsLimit} Punkte</p>
                                </div>
                            );
                        })}
                         <div
                            onDragOver={(e) => handleDragOver(e, 'frei')}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, 'frei')}
                            className={`p-3 text-center rounded-lg border-2 transition-all ${dropHighlight === 'frei' ? 'border-green-500 bg-green-50' : 'border-dashed border-gray-300 bg-gray-100'}`}
                        >
                            <p className="font-semibold text-gray-700">Abrechnungsfrei</p>
                            <p className="text-xs text-gray-500">Tests hier ablegen, die nicht abgerechnet werden sollen.</p>
                        </div>
                    </div>

                    <div 
                        className="bg-gray-50 p-3 rounded-lg border min-h-[200px]"
                        onDragOver={(e) => handleDragOver(e, null)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, null)}
                    >
                        <h4 className="font-semibold text-gray-700 mb-2">Nicht zugeordnete Tests</h4>
                        {unassignedTests.length > 0 ? (
                            <div className="space-y-2">
                                {unassignedTests.map(test => (
                                    <div
                                        key={test.testInstanceId}
                                        draggable="true"
                                        onDragStart={(e) => handleDragStart(e, test)}
                                        className="p-2 bg-white rounded-md border shadow-sm cursor-grab active:cursor-grabbing"
                                    >
                                        <p className="font-semibold text-sm text-gray-800">{test.name}</p>
                                        <p className="text-xs text-gray-500">Vom: {new Date(test.date).toLocaleDateString('de-DE')}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center pt-8">Alle Tests sind zugeordnet.</p>
                        )}
                    </div>
                </div>
                 {showSuccess && (
                    <div className="fixed bottom-4 right-4 flex items-center p-3 bg-green-100 text-green-800 rounded-lg shadow-lg z-50">
                        <CheckCircle className="mr-2" /> Test wurde erfolgreich zugeordnet.
                    </div>
                )}
            </div>

            <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Durchgeführte Testdiagnostik (Alle)</h4>
                {conductedTests.length > 0 ? (
                    <div className="space-y-3">
                        {conductedTests.map(test => (
                            <div key={test.id} className="bg-white p-3 rounded-md border shadow-sm flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-800">{test.name}</p>
                                    <p className="text-sm text-gray-500">{test.count} mal durchgeführt</p>
                                </div>
                                <button onClick={() => onShowTestDetails(test.id)} className="text-teal-600 hover:text-teal-800 font-semibold text-sm flex items-center">Details <ChevronRight /></button>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md">Noch keine Tests für diesen Patienten durchgeführt.</p>}
            </div>

            <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Neuen Test hinzufügen</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableTests.map(test => (
                        <div key={test.id} className="bg-white p-3 rounded-md border flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-gray-800">{test.name}</p>
                                <p className="text-xs text-gray-500">EBM: {test.ebm}</p>
                            </div>
                            <button onClick={() => onAddTest(test)} className="text-teal-600 hover:text-teal-800 p-2 rounded-full"><PlusCircle /></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DiagnostikUebersicht;
