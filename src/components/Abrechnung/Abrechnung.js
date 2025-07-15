import React, { useState, useMemo, useEffect } from 'react';

const EditIcon = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const CopyIcon = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;

const DIAGNOSTIK_PUNKTE = { '35600': 34, '35601': 39, '35602': 56 };

const fieldConfig = {
    sitzungsnummer: { label: 'Sitzungsnummer', order: 1 },
    thema: { label: 'Thema der Sitzung', order: 2 },
    patientenbericht: { label: 'Patientenbericht', order: 3 },
    psychotherapeutischesThemaInhalt: { label: 'Psychotherapeutisches Thema und Inhalt der Sitzung', order: 4 },
    therapeutischeInterventionen: { label: 'Therapeutische Interventionen', order: 5, isList: true },
    gesamteindruck: { label: 'Gesamteindruck', order: 6 },
    risikoabschaetzung: { label: 'Risikoabschätzung (Suizidalität)', order: 7 },
    hausaufgaben: { label: 'Hausaufgaben', order: 8, isList: true }
};

const AbrechnungsUebersicht = ({ patient, availableTests, onAddBillingPeriod, quarterlyAnalysis, onEditSession, onDeleteSession, onDeleteBillingPeriod }) => {
    const [selectedView, setSelectedView] = useState(null); // 'quarter-YYYY-Q-X' or 'session-ID'

    const sortedQuarterKeys = useMemo(() => {
        if (!quarterlyAnalysis) return [];
        return Object.keys(quarterlyAnalysis).sort((a, b) => {
            const [yearA, quarterA] = a.split('-Q');
            const [yearB, quarterB] = b.split('-Q');
            if (yearA !== yearB) return yearB - yearA;
            return quarterB - quarterA;
        });
    }, [quarterlyAnalysis]);

    useEffect(() => {
        if (sortedQuarterKeys.length > 0 && !selectedView) {
            setSelectedView(`quarter-${sortedQuarterKeys[0]}`);
        } else if (sortedQuarterKeys.length === 0 && !selectedView && therapySessions.length > 0) {
             setSelectedView(`session-${therapySessions[0].id}`);
        }
    }, [sortedQuarterKeys, selectedView]);

    const therapySessions = useMemo(() => {
        return (patient.sessions || [])
            .filter(s => s.structuredNotes && s.structuredNotes.sitzungsnummer)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [patient.sessions]);
    
    const { isAddDisabled, disabledReason } = useMemo(() => {
        if (!patient) return { isAddDisabled: true, disabledReason: '' };
        const nonProbatorikPeriods = patient.billingPeriods?.filter(p => p.type !== 'probatorik').length || 0;
        const isKZT = patient.approvedHours <= 24;
        const isLZT = patient.approvedHours > 24;
        if (isKZT && nonProbatorikPeriods >= 3) {
            return { isAddDisabled: true, disabledReason: "Maximal 3 Zeiträume (Verlauf/Abschluss) für KZT erreicht." };
        }
        if (isLZT && nonProbatorikPeriods >= 7) {
            return { isAddDisabled: true, disabledReason: "Maximal 7 Zeiträume (Verlauf/Abschluss) für LZT erreicht." };
        }
        return { isAddDisabled: false, disabledReason: '' };
    }, [patient]);


    const handleCopySession = (notes) => {
        const keysToCopy = Object.keys(notes).sort((a, b) => (fieldConfig[a]?.order || 99) - (fieldConfig[b]?.order || 99));

        const textToCopy = keysToCopy.map(key => {
            const value = notes[key];
            if (!value) return null;
            const label = fieldConfig[key]?.label || key;
            let formattedValue;
            if (Array.isArray(value)) {
                formattedValue = value.map(item => `- ${item}`).join('\n');
            } else {
                formattedValue = String(value);
            }
            return `${label}:\n${formattedValue}`;
        }).filter(Boolean).join('\n\n');

        navigator.clipboard.writeText(textToCopy).then(() => alert('Sitzungsdoku in die Zwischenablage kopiert!'))
            .catch(err => alert('Kopieren fehlgeschlagen.'));
    };

    const selectedQuarterKey = selectedView?.startsWith('quarter-') ? selectedView.substring(8) : null;
    const selectedSessionId = selectedView?.startsWith('session-') ? selectedView.substring(8) : null;
    const selectedQuarterDetails = quarterlyAnalysis ? quarterlyAnalysis[selectedQuarterKey] : null;
    const selectedTherapySession = therapySessions.find(s => s.id === selectedSessionId);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
                <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-2">Diagnostik nach Quartal</h4>
                    <div className="space-y-1 max-h-[25vh] overflow-y-auto pr-2">
                        {sortedQuarterKeys.length > 0 ? sortedQuarterKeys.map((key) => (
                            <div
                                key={key}
                                onClick={() => setSelectedView(`quarter-${key}`)}
                                className={`p-2 rounded-md cursor-pointer text-xs transition-colors flex justify-between items-center ${selectedQuarterKey === key ? 'bg-teal-600 text-white' : 'bg-gray-100 hover:bg-teal-50 text-gray-800'}`}
                            >
                                <p className="font-semibold">{key}</p>
                                <span className={`font-mono text-xs px-2 py-0.5 rounded-full ${selectedQuarterKey === key ? 'bg-white/20' : 'bg-gray-200'}`}>
                                    {quarterlyAnalysis[key].pointsUsed} / {quarterlyAnalysis[key].pointsLimit} P.
                                </span>
                            </div>
                        )) : <p className="text-xs text-gray-500 p-3 bg-gray-50 rounded-md">Keine Diagnostik-Daten vorhanden.</p>}
                    </div>
                </div>

                <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-2">Verwaltete Abrechnungszeiträume</h4>
                    <div className="space-y-1 max-h-[25vh] overflow-y-auto pr-2">
                         {(patient.billingPeriods || []).map((period) => (
                            <div key={period.id} className="p-2 rounded-md bg-gray-100 text-gray-800 text-xs flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{period.name}</p>
                                    <p className="text-gray-500">Datum: {new Date(period.date).toLocaleDateString('de-DE')}</p>
                                </div>
                                <button
                                    onClick={() => onDeleteBillingPeriod(period.id)}
                                    className="p-1.5 text-gray-400 hover:bg-red-100 hover:text-red-600 rounded-full"
                                    title="Diesen Zeitraum löschen"
                                >
                                    <TrashIcon className="w-4 h-4"/>
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={onAddBillingPeriod}
                        disabled={isAddDisabled}
                        title={disabledReason}
                        className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-md text-sm flex items-center justify-center transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Neuen Abrechnungszeitraum anlegen
                    </button>
                    {isAddDisabled && <p className="text-xs text-red-600 text-center mt-1">{disabledReason}</p>}
                </div>
                
                 <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-2">Therapiesitzungen</h4>
                     <div className="space-y-1 max-h-[25vh] overflow-y-auto pr-2">
                         {therapySessions.map(session => (
                             <div key={session.id} onClick={() => setSelectedView(`session-${session.id}`)}
                                 className={`p-2 rounded-md cursor-pointer text-xs transition-colors flex justify-between items-center ${selectedSessionId === session.id ? 'bg-teal-600 text-white' : 'bg-gray-100 hover:bg-teal-50 text-gray-800'}`}>
                                 <p className="font-semibold">Sitzung {session.structuredNotes.sitzungsnummer} - {new Date(session.date).toLocaleDateString('de-DE')}</p>
                                  <div className="flex items-center flex-shrink-0">
                                    <button onClick={(e) => { e.stopPropagation(); onEditSession(session); }} className="p-1 hover:bg-white/20 rounded-full"><EditIcon className="w-4 h-4"/></button>
                                    <button onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }} className="p-1 hover:bg-white/20 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                             </div>
                         ))}
                     </div>
                </div>
            </div>

            <div className="md:col-span-2">
                {selectedQuarterDetails ? (
                    <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
                        <h4 className="text-lg font-semibold text-gray-700">Details für Quartal: {selectedQuarterKey}</h4>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <h5 className="font-semibold text-blue-800 mb-2">Durchgeführte Tests in diesem Quartal</h5>
                            {(selectedQuarterDetails.tests && selectedQuarterDetails.tests.length > 0) ? (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-blue-200"><th className="py-1 text-left font-semibold">Test</th><th className="py-1 text-left font-semibold">Datum</th><th className="py-1 text-right font-semibold">Punkte</th></tr>
                                    </thead>
                                    <tbody>
                                        {selectedQuarterDetails.tests.map((test, i) => (
                                            <tr key={test.testInstanceId || i} className="border-b last:border-b-0 border-blue-100">
                                                <td className="py-2">{test.name}</td>
                                                <td className="py-2">{new Date(test.date).toLocaleDateString('de-DE')}</td>
                                                <td className="py-2 text-right font-mono">{DIAGNOSTIK_PUNKTE[test.ebm] || 0}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="font-bold border-t-2 border-blue-300"><td colSpan="2" className="pt-2 text-right">Gesamt verbraucht:</td><td className="pt-2 text-right font-mono">{selectedQuarterDetails.pointsUsed}</td></tr>
                                        <tr className="font-bold"><td colSpan="2" className="pt-1 text-right text-gray-600">Limit:</td><td className="pt-1 text-right font-mono text-gray-600">{selectedQuarterDetails.pointsLimit}</td></tr>
                                         <tr className="font-bold text-blue-800"><td colSpan="2" className="pt-1 text-right">Verbleibend:</td><td className="pt-1 text-right font-mono">{selectedQuarterDetails.pointsLimit - selectedQuarterDetails.pointsUsed}</td></tr>
                                    </tfoot>
                                </table>
                            ) : <p className="text-sm text-gray-500">In diesem Quartal wurden keine Tests durchgeführt.</p>}
                        </div>
                    </div>
                ) : selectedTherapySession ? (
                     <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
                         <div className="flex justify-between items-start">
                            <h4 className="text-lg font-semibold text-gray-700">Details für Sitzung {selectedTherapySession.structuredNotes.sitzungsnummer} vom {new Date(selectedTherapySession.date).toLocaleDateString('de-DE')}</h4>
                            <button
                                onClick={() => handleCopySession(selectedTherapySession.structuredNotes)}
                                className="p-2 text-gray-500 hover:bg-gray-100 hover:text-teal-600 rounded-full transition-colors"
                                title="Sitzungsdokumentation in die Zwischenablage kopieren"
                            >
                                <CopyIcon className="w-5 h-5" />
                            </button>
                         </div>
                         {(Object.keys(selectedTherapySession.structuredNotes || {}).sort((a, b) => (fieldConfig[a]?.order || 99) - (fieldConfig[b]?.order || 99))).map((key) => {
                             const value = selectedTherapySession.structuredNotes[key];
                             if (!value && value !== 0) return null;
                             const config = fieldConfig[key] || {};
                             const label = config.label || key.replace(/([A-Z])/g, ' $1').trim();
                             const isList = config.isList || false;
                             return (
                                 <div key={key}>
                                     <h6 className="font-semibold text-sm text-gray-600 capitalize">{label}</h6>
                                     {isList ? (
                                        <div className="text-sm text-gray-800 bg-gray-50 p-3 rounded-md mt-1">
                                             <ul className="list-disc list-inside space-y-1">
                                                 {Array.isArray(value) ? value.map((item, index) => <li key={index}>{item}</li>) : String(value).split('\n').map((item, index) => item.trim() && <li key={index}>{item.trim().replace(/^- /, '')}</li>)}
                                             </ul>
                                        </div>
                                     ) : (
                                         <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded-md mt-1 whitespace-pre-wrap">{String(value)}</p>
                                     )}
                                 </div>
                             );
                         })}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border">
                        <p className="text-gray-500">Wählen Sie links einen Eintrag aus, um die Details anzuzeigen.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AbrechnungsUebersicht;