import React, { useState, useEffect, useMemo, useRef } from 'react';

// Icons
const SaveIcon = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>;
const PlusIcon = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TrashIcon = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const WandSparkles = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9.5 2.55 1.294 1.294a1 1 0 0 0 1.414 0L13.5 2.55"/><path d="M4.94 4.94 6.22 6.22a1 1 0 0 0 1.41 0l1.29-1.29"/><path d="M2.55 9.51 3.84 10.8a1 1 0 0 0 1.41 0l1.3-1.29"/><path d="m19.07 4.93-1.29 1.29a1 1 0 0 1-1.41 0l-1.29-1.29"/><path d="M21.45 9.51l-1.29 1.29a1 1 0 0 1-1.41 0l-1.3-1.29"/><path d="M14.5 12.94a1 1 0 0 0 0 1.41l1.29 1.29"/><path d="M10.8 17.78a1 1 0 0 0 0 1.41l1.29 1.29"/><path d="M17.78 10.8a1 1 0 0 0 0 1.41l1.29 1.29"/><path d="M12 10.5V4.5"/><path d="M12 10.5C7 11 4 15 4 20"/><path d="M12 10.5c5 .5 8 4.5 8 9.5"/></svg>);

// Helper component for auto-resizing textareas
const AutosizeTextarea = (props) => {
    const textareaRef = useRef(null);
    const { className, ...rest } = props;

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [props.value]);

    return (
        <textarea
            ref={textareaRef}
            rows={1}
            className={`${className} resize-none overflow-hidden`}
            {...rest}
        />
    );
};

const ParsingLoader = () => (
    <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col justify-center items-center z-20 rounded-lg">
        <svg className="animate-spin h-8 w-8 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-3 text-gray-700 font-semibold">Text wird zugeordnet...</p>
    </div>
);

const PasteTextModal = ({ isOpen, onClose, onSave, isParsing }) => {
    const [text, setText] = useState('');
    if (!isOpen) return null;
    const handleSave = () => { onSave(text); onClose(); };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60]">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
                <h3 className="text-lg font-semibold mb-4">Sitzungsdoku einfügen</h3>
                <textarea className="w-full h-64 p-2 border rounded-md" value={text} onChange={(e) => setText(e.target.value)} placeholder="Fügen Sie hier den kompletten Text Ihrer Sitzungsdokumentation ein..." />
                <div className="flex justify-end space-x-3 mt-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-md">Abbrechen</button>
                    <button onClick={handleSave} disabled={isParsing || !text} className="px-4 py-2 text-sm text-white bg-teal-600 rounded-md disabled:bg-gray-400">{isParsing ? 'Analysiere...' : 'Text zuordnen'}</button>
                </div>
            </div>
        </div>
    );
};

const riskTextStandard = 'Auf Nachfrage wurden suizidale Gedanken, Impulse sowie Handlungsabsichten glaubhaft und eindeutig verneint. Die Absprachefähigkeit des Patienten ist gegeben. Es besteht kein Anhalt für eine akute Eigen- oder Fremdgefährdung.';
const initialNotesState = {
    thema: '',
    sitzungsnummer: '',
    patientenbericht: '',
    psychotherapeutischesThemaInhalt: '',
    therapeutischeInterventionen: [''],
    gesamteindruck: '',
    risikoabschaetzung: riskTextStandard,
    hausaufgaben: ['']
};

const autoParseDoku = (text) => {
    const fieldConfig = {
        sitzungsnummer: ["Sitzungsnummer"],
        thema: ["Thema der Sitzung", "Thema"],
        patientenbericht: ["Patientenbericht", "Kurzer Patientenbericht"],
        psychotherapeutischesThemaInhalt: ["Psychotherapeutisches Thema und Inhalt der Sitzung", "Psychotherapeutisches Thema und Inhalt"],
        therapeutischeInterventionen: ["Therapeutische Interventionen", "Durchgeführten psychotherapeutischen Interventionen"],
        gesamteindruck: ["Gesamteindruck"],
        risikoabschaetzung: ["Risikoabschätzung (Suizidalität)", "Risikoabschätzung"],
        hausaufgaben: ["Hausaufgaben"]
    };

    const allHeadings = Object.values(fieldConfig).flat();
    const headingRegex = new RegExp(`^\\s*(${allHeadings.join('|')}):?`, 'i');

    const parsedNotes = {};
    const lines = text.split('\n');
    let currentKey = null;
    let currentContent = [];

    lines.forEach(line => {
        const match = line.match(headingRegex);
        
        if (match) {
            if (currentKey) {
                parsedNotes[currentKey] = currentContent.join('\n').trim();
            }
            
            const matchedHeading = match[1];
            currentKey = Object.keys(fieldConfig).find(key => 
                fieldConfig[key].some(h => h.toLowerCase() === matchedHeading.toLowerCase())
            );

            currentContent = [line.substring(match[0].length).trim()];
        } else {
            if (currentKey) {
                currentContent.push(line);
            }
        }
    });

    if (currentKey) {
        parsedNotes[currentKey] = currentContent.join('\n').trim();
    }
    
    ['therapeutischeInterventionen', 'hausaufgaben'].forEach(key => {
        if (parsedNotes[key] && typeof parsedNotes[key] === 'string') {
            const content = parsedNotes[key];
            const lines = content.split('\n').filter(line => line.trim() !== '');
            
            const listItems = lines.reduce((acc, line) => {
                const trimmedLine = line.trim();
                if (/^[-*•]/.test(trimmedLine) || /^\d+\.\s/.test(trimmedLine)) {
                    acc.push(trimmedLine.replace(/^[-*•\d.]+\s*/, ''));
                } else if (acc.length > 0) {
                    acc[acc.length - 1] += ' ' + trimmedLine;
                } else {
                    acc.push(trimmedLine);
                }
                return acc;
            }, []);

            parsedNotes[key] = listItems.length > 0 ? listItems : [''];
        }
    });

    return parsedNotes;
};


const BillingModal = ({ event, ebmData, onSave, onClose, generateGeminiText, isEditing, ebmTemplates }) => {
    const [step, setStep] = useState(1);
    const [ebmEntries, setEbmEntries] = useState([]);
    const [ebmSearch, setEbmSearch] = useState('');
    const [selectedEbm, setSelectedEbm] = useState(null);
    const [anzahl, setAnzahl] = useState(1);
    const [faktor, setFaktor] = useState(1);
    const [isParsing, setIsParsing] = useState(false);
    const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
    const [isSessionNumberFromCalendar, setIsSessionNumberFromCalendar] = useState(false);
    const [notes, setNotes] = useState(initialNotesState);
    const [isSuicidal, setIsSuicidal] = useState(false);

    useEffect(() => {
        if (event) {
            if (isEditing) {
                const existingNotes = event.initialNotes || {};
                
                if (typeof existingNotes.therapeutischeInterventionen === 'string') {
                    existingNotes.therapeutischeInterventionen = existingNotes.therapeutischeInterventionen.split(/[-–\n]/).map(s => s.trim()).filter(Boolean);
                }
                if (!Array.isArray(existingNotes.therapeutischeInterventionen) || existingNotes.therapeutischeInterventionen.length === 0) {
                    existingNotes.therapeutischeInterventionen = [''];
                }

                if (typeof existingNotes.hausaufgaben === 'string') {
                    existingNotes.hausaufgaben = existingNotes.hausaufgaben.split(/[-–\n1-9.]+/).map(s => s.trim()).filter(Boolean);
                }
                if (!Array.isArray(existingNotes.hausaufgaben) || existingNotes.hausaufgaben.length === 0) {
                    existingNotes.hausaufgaben = [''];
                }

                setNotes({ ...initialNotesState, ...existingNotes });
                setEbmEntries(event.initialEbm || []);
                if (event.initialNotes?.risikoabschaetzung !== riskTextStandard) setIsSuicidal(true);
                setIsSessionNumberFromCalendar(false);
            } else {
                let sessionNumberFromSummary = '';
                const tNumberMatch = event.summary?.match(/\sT(\d+)/i);
                
                if (tNumberMatch && tNumberMatch[1]) {
                    sessionNumberFromSummary = tNumberMatch[1];
                    setIsSessionNumberFromCalendar(true);
                } else {
                    const genericMatch = event.summary?.match(/[T|S|Sitzung|Therapie]\s*(\d+)/i);
                    if (genericMatch && genericMatch[1]) {
                        sessionNumberFromSummary = genericMatch[1];
                        setIsSessionNumberFromCalendar(true);
                    } else {
                        setIsSessionNumberFromCalendar(false);
                    }
                }
                const initialSessionNumber = sessionNumberFromSummary || event.sitzungsnummer || '';
                setNotes(prev => ({ ...initialNotesState, sitzungsnummer: initialSessionNumber, thema: `Sitzung ${initialSessionNumber}` }));
                setEbmEntries([]);
                setIsSuicidal(false);
            }
        }
    }, [event, isEditing]);

    useEffect(() => { 
     if (!isParsing) setNotes(prev => ({ ...prev, risikoabschaetzung: isSuicidal ? prev.risikoabschaetzung : riskTextStandard })); 
    }, [isSuicidal, isParsing]);
    
    const handleAutoAssign = (text) => {
        setIsParsing(true);
        try {
            setTimeout(() => {
                const parsedData = autoParseDoku(text);
                
                if (Object.keys(parsedData).length === 0) {
                    alert("Die automatische Zuordnung ist fehlgeschlagen. Bitte überprüfen Sie, ob der Text sinnvolle Überschriften enthält.");
                    setIsParsing(false);
                    return;
                }

                if (parsedData.risikoabschaetzung && parsedData.risikoabschaetzung.toLowerCase() !== riskTextStandard.toLowerCase()) {
                    setIsSuicidal(true);
                } else {
                    setIsSuicidal(false);
                    parsedData.risikoabschaetzung = riskTextStandard;
                }
                
                setNotes(prevNotes => ({
                    ...prevNotes,
                    ...parsedData
                }));
                
                setIsParsing(false);
                alert("Felder wurden erfolgreich zugeordnet!");

            }, 500);
            
        } catch (error) {
            console.error("Fehler bei der automatischen Zuordnung:", error);
            alert("Ein unerwarteter Fehler ist aufgetreten. Bitte füllen Sie die Felder manuell aus.");
            setIsParsing(false);
        }
    };

    const handleNoteChange = (e) => setNotes(prev => ({ ...prev, [e.target.name]: e.target.value }));
    
    const handleInterventionChange = (e, index) => {
        const newInterventions = [...notes.therapeutischeInterventionen];
        newInterventions[index] = e.target.value;
        setNotes(prev => ({ ...prev, therapeutischeInterventionen: newInterventions }));
    };
    const handleAddIntervention = () => {
        setNotes(prev => ({ ...prev, therapeutischeInterventionen: [...prev.therapeutischeInterventionen, ''] }));
    };
    const handleDeleteIntervention = (index) => {
        if (notes.therapeutischeInterventionen.length > 1) {
            const newInterventions = notes.therapeutischeInterventionen.filter((_, i) => i !== index);
            setNotes(prev => ({ ...prev, therapeutischeInterventionen: newInterventions }));
        }
    };

    const handleHomeworkChange = (e, index) => { const newHomeworks = [...notes.hausaufgaben]; newHomeworks[index] = e.target.value; setNotes(prev => ({ ...prev, hausaufgaben: newHomeworks })); };
    const handleAddHomework = () => setNotes(prev => ({ ...prev, hausaufgaben: [...prev.hausaufgaben, ''] }));
    const handleDeleteHomework = (index) => { if (notes.hausaufgaben.length > 1) { const newHomeworks = notes.hausaufgaben.filter((_, i) => i !== index); setNotes(prev => ({ ...prev, hausaufgaben: newHomeworks })); } };

    const searchResults = useMemo(() => { if (!ebmSearch) return []; return ebmData.filter(item => item.Nummer.startsWith(ebmSearch) || item.Titel.toLowerCase().includes(ebmSearch.toLowerCase())).slice(0, 5); }, [ebmSearch, ebmData]);
    const handleSelectEbm = (item) => { setSelectedEbm(item); setEbmSearch(`${item.Nummer} - ${item.Titel}`); };
    const handleAddEbmEntry = () => { if (selectedEbm) { setEbmEntries(p => [...p, { ...selectedEbm, anzahl, faktor, id: `ebm_${Date.now()}` }]); setSelectedEbm(null); setEbmSearch(''); setAnzahl(1); setFaktor(1); } };
    const handleDeleteEbmEntry = (index) => setEbmEntries(p => p.filter((_, i) => i !== index));
    const totalPoints = ebmEntries.reduce((sum, entry) => sum + ((parseInt(entry.Punkte, 10) || 0) * entry.anzahl * entry.faktor), 0);
    
    const applyTemplate = (template) => {
        const itemsToAdd = template.items.map(templateItem => {
            const fullEbmData = ebmData.find(e => e.Nummer === templateItem.nummer);
            if (!fullEbmData) return null;
            const anzahlFromTemplate = templateItem.anzahl || 1;
            const faktorFromTemplate = templateItem.faktor || 1;
            return { ...fullEbmData, anzahl: anzahlFromTemplate, faktor: faktorFromTemplate, id: `ebm_${Date.now()}_${Math.random()}` };
        }).filter(Boolean);
        const newEntries = itemsToAdd.filter(item => !ebmEntries.some(existing => existing.Nummer === item.Nummer));
        setEbmEntries(prev => [...prev, ...newEntries]);
    };

    const handleSave = () => {
        const m = event.summary.match(/[A-Z][0-9]{6}/);
        const finalNotes = { ...notes, sitzungsnummer: Number(notes.sitzungsnummer) };
        onSave({ sessionId: event.id, eventId: event.id, eventStart: event.start.dateTime || event.start.date, chiffre: m ? m[0] : null, ebmEntries: ebmEntries.map(e => ({ nummer: e.Nummer, anzahl: e.anzahl, faktor: e.faktor })), notes: finalNotes }, isEditing);
    };

    const inputStyle = "block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm";
    const textareaStyle = `${inputStyle} min-h-[40px]`;
    const accentButton = "bg-teal-600 text-white font-semibold py-2 px-3 text-sm rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 flex items-center justify-center";

    return (
        <>
            <PasteTextModal isOpen={isPasteModalOpen} onClose={() => setIsPasteModalOpen(false)} onSave={handleAutoAssign} isParsing={isParsing} />
            <div className="p-1">
                <div className="flex justify-center items-center space-x-4 mb-6">
                    <div className={`flex items-center ${step >= 1 ? 'text-teal-600' : 'text-gray-400'}`}><div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${step >= 1 ? 'bg-teal-600 border-teal-700 text-white' : 'bg-gray-200 border-gray-300'}`}>1</div><span className="ml-2 font-semibold">Leistungen</span></div>
                    <div className={`h-0.5 w-16 ${step >= 2 ? 'bg-teal-500' : 'bg-gray-200'}`}></div>
                    <div className={`flex items-center ${step >= 2 ? 'text-teal-600' : 'text-gray-400'}`}><div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${step >= 2 ? 'bg-teal-600 border-teal-700 text-white' : 'bg-gray-200 border-gray-300'}`}>2</div><span className="ml-2 font-semibold">Dokumentation</span></div>
                </div>

                {step === 1 && (
                    <div className="animate-fade-in space-y-4">
                        <div className="p-4 border rounded-lg bg-white">
                            <h3 className="font-semibold text-lg text-gray-800 mb-3">Leistung hinzufügen</h3>
                            {ebmTemplates && ebmTemplates.length > 0 && (
                                <div className="mb-4 pb-4 border-b">
                                    <h4 className="font-semibold text-sm text-gray-600 mb-2">Vorlagen anwenden</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {ebmTemplates.map(template => (
                                            <button key={template.id} onClick={() => applyTemplate(template)} className="bg-sky-100 text-sky-800 text-xs font-semibold px-2.5 py-1 rounded-full hover:bg-sky-200 transition-colors">{template.name}</button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="relative"><input type="text" placeholder="EBM-Ziffer oder Titel suchen..." value={ebmSearch} onChange={e => { setEbmSearch(e.target.value); setSelectedEbm(null); }} className={inputStyle} />{searchResults.length > 0 && ebmSearch && !selectedEbm && (<ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-48 overflow-y-auto">{searchResults.map(item => <li key={item.Nummer} onClick={() => handleSelectEbm(item)} className="px-3 py-2 cursor-pointer hover:bg-teal-50">{item.Nummer} - {item.Titel}</li>)}</ul>)}</div>
                            <div className="grid grid-cols-3 gap-3 mt-3">
                                <div><label className="text-xs font-medium text-gray-600">Anzahl</label><input type="number" value={anzahl} onChange={e => setAnzahl(Math.max(1, parseInt(e.target.value, 10) || 1))} min="1" className={`${inputStyle} text-center`} /></div>
                                <div><label className="text-xs font-medium text-gray-600">Faktor</label><input type="number" step="0.1" value={faktor} onChange={e => setFaktor(parseFloat(e.target.value) || 1)} min="1" className={`${inputStyle} text-center`} /></div>
                                <div className="self-end"><button onClick={handleAddEbmEntry} disabled={!selectedEbm} className="w-full bg-gray-700 text-white p-2 rounded-md hover:bg-gray-800 disabled:bg-gray-300 flex items-center justify-center"><PlusIcon className="w-4 h-4 mr-1"/> Hinzufügen</button></div>
                            </div>
                        </div>
                        <div className="p-4 border rounded-lg bg-white mt-4">
                            <h3 className="font-semibold text-lg text-gray-800 mb-3">Abzurechnende Leistungen</h3>
                            <div className="space-y-2">{ebmEntries.map((entry, index) => (<div key={entry.id || index} className="flex justify-between items-center bg-gray-50 p-2 rounded-md"><div><p className="font-semibold">{entry.Nummer || entry.nummer} <span className="text-gray-600 font-normal">({entry.Titel})</span></p><p className="text-xs text-gray-500">Anzahl: {entry.anzahl}, Faktor: {entry.faktor}</p></div><div className="flex items-center"><span className="mr-4 font-mono text-gray-800">{(parseInt(entry.Punkte, 10) * entry.anzahl * entry.faktor).toFixed(0)} Pkt.</span><button onClick={() => handleDeleteEbmEntry(index)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon /></button></div></div>))}{ebmEntries.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Noch keine Leistungen hinzugefügt.</p>}<div className="text-right font-bold text-xl mt-4 pt-4 border-t">Gesamt: {totalPoints.toFixed(0)} Punkte</div></div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="relative">
                        {isParsing && <ParsingLoader />}
                        <div className="animate-fade-in space-y-4">
                            <div className="flex justify-end"><button onClick={() => setIsPasteModalOpen(true)} className="bg-gray-700 text-white py-1.5 px-3 text-xs rounded-md hover:bg-gray-800 flex items-center font-semibold"><WandSparkles className="w-4 h-4 mr-1.5" />Doku einfügen & zuordnen</button></div>
                            <div className="p-4 border rounded-lg bg-white space-y-3">
                                <h3 className="font-semibold text-lg text-gray-800">Strukturierte Dokumentation</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-2"><label className="text-sm font-medium text-gray-600">Thema der Sitzung</label><input name="thema" value={notes.thema} onChange={handleNoteChange} className={inputStyle} /></div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Sitzungs-Nr.</label>
                                        <input type="number" name="sitzungsnummer" value={notes.sitzungsnummer} onChange={handleNoteChange} className={inputStyle} />
                                        {isSessionNumberFromCalendar && <p className="text-xs text-gray-500 mt-1">Aus Kalender übernommen.</p>}
                                    </div>
                                </div>
                                <div><label className="text-sm font-medium text-gray-600">Patientenbericht</label><AutosizeTextarea name="patientenbericht" value={notes.patientenbericht} onChange={handleNoteChange} className={textareaStyle} /></div>
                                <div><label className="text-sm font-medium text-gray-600">Psychotherapeutisches Thema und Inhalt der Sitzung</label><AutosizeTextarea name="psychotherapeutischesThemaInhalt" value={notes.psychotherapeutischesThemaInhalt} onChange={handleNoteChange} className={textareaStyle} /></div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 mb-1 block">Therapeutische Interventionen</label>
                                    <div className="space-y-2">
                                        {(notes.therapeutischeInterventionen || ['']).map((intervention, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <AutosizeTextarea name={`intervention-${index}`} value={intervention} onChange={(e) => handleInterventionChange(e, index)} className={inputStyle} placeholder={`Intervention ${index + 1}`}/>
                                                {notes.therapeutischeInterventionen.length > 1 && (
                                                    <button type="button" onClick={() => handleDeleteIntervention(index)} className="p-1 text-gray-400 hover:text-red-500 rounded-full flex-shrink-0">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" onClick={handleAddIntervention} className="mt-2 flex items-center text-sm text-teal-600 hover:text-teal-800 font-semibold">
                                        <PlusIcon className="w-4 h-4 mr-1" />Intervention hinzufügen
                                    </button>
                                </div>
                                <div><label className="text-sm font-medium text-gray-600">Gesamteindruck</label><AutosizeTextarea name="gesamteindruck" value={notes.gesamteindruck} onChange={handleNoteChange} className={textareaStyle} /></div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Risikoabschätzung (Suizidalität)</label>
                                    <div className="flex items-center space-x-4 mt-1 mb-2">
                                        <label className="flex items-center"><input type="radio" checked={!isSuicidal} onChange={() => setIsSuicidal(false)} className="h-4 w-4 text-teal-600 focus:ring-teal-500"/> <span className="ml-2 text-sm">Nein</span></label>
                                        <label className="flex items-center"><input type="radio" checked={isSuicidal} onChange={() => setIsSuicidal(true)} className="h-4 w-4 text-teal-600 focus:ring-teal-500"/> <span className="ml-2 text-sm">Ja, Interventionsbedarf</span></label>
                                    </div>
                                    <AutosizeTextarea name="risikoabschaetzung" value={notes.risikoabschaetzung} onChange={handleNoteChange} disabled={!isSuicidal} className={`${textareaStyle} ${!isSuicidal ? 'bg-gray-100' : ''}`} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 mb-1 block">Hausaufgaben</label>
                                    <div className="space-y-2">{(notes.hausaufgaben || ['']).map((task, index) => (<div key={index} className="flex items-center space-x-2"><AutosizeTextarea name={`hausaufgabe-${index}`} value={task} onChange={(e) => handleHomeworkChange(e, index)} className={inputStyle} placeholder={`Aufgabe ${index + 1}`}/>{notes.hausaufgaben.length > 1 && (<button type="button" onClick={() => handleDeleteHomework(index)} className="p-1 text-gray-400 hover:text-red-500 rounded-full flex-shrink-0"><TrashIcon className="w-4 h-4" /></button>)}</div>))}</div>
                                    <button type="button" onClick={handleAddHomework} className="mt-2 flex items-center text-sm text-teal-600 hover:text-teal-800 font-semibold"><PlusIcon className="w-4 h-4 mr-1" />Aufgabe hinzufügen</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="flex justify-between pt-6 mt-6 border-t">
                    <button onClick={() => step > 1 ? setStep(step - 1) : onClose()} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">{step === 1 ? 'Abbrechen' : 'Zurück'}</button>
                    {step === 1 && <button onClick={() => setStep(2)} className={accentButton}>Weiter</button>}
                    {step === 2 && <button onClick={handleSave} className={`${accentButton} bg-green-600 hover:bg-green-700`}><SaveIcon className="w-4 h-4 mr-2"/> Abrechnung speichern</button>}
                </div>
            </div>
        </>
    );
};

export default BillingModal;
