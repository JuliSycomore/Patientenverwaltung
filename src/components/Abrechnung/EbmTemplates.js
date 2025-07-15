import React, { useState, useMemo } from 'react';

// Icons
const PlusIcon = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TrashIcon = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const SaveIcon = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>;

const EbmTemplates = ({ templates, ebmData, onSave, onDelete }) => {
    const [newTemplateName, setNewTemplateName] = useState('');
    const [currentItems, setCurrentItems] = useState([]);
    const [ebmSearch, setEbmSearch] = useState('');
    const [selectedEbm, setSelectedEbm] = useState(null);
    const [anzahl, setAnzahl] = useState(1);
    const [faktor, setFaktor] = useState(1.0);

    const inputStyle = "block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm";

    const searchResults = useMemo(() => {
        if (!ebmSearch) return [];
        return ebmData.filter(item =>
            item.Nummer.startsWith(ebmSearch) ||
            item.Titel.toLowerCase().includes(ebmSearch.toLowerCase())
        ).slice(0, 10);
    }, [ebmSearch, ebmData]);

    const handleSelectEbm = (item) => {
        setSelectedEbm(item);
        setEbmSearch(`${item.Nummer} - ${item.Titel}`);
    };

    const handleAddItem = () => {
        if (selectedEbm && !currentItems.some(item => item.Nummer === selectedEbm.Nummer)) {
            setCurrentItems(prev => [...prev, { ...selectedEbm, anzahl, faktor }]);
        }
        setSelectedEbm(null);
        setEbmSearch('');
        setAnzahl(1);
        setFaktor(1.0);
    };
    
    const handleRemoveItem = (nummer) => {
        setCurrentItems(prev => prev.filter(item => item.Nummer !== nummer));
    };

    const handleSaveTemplate = () => {
        if (!newTemplateName || currentItems.length === 0) {
            alert("Bitte geben Sie einen Namen für die Vorlage an und fügen Sie mindestens eine Ziffer hinzu.");
            return;
        }
        const templatePayload = {
            name: newTemplateName,
            items: currentItems.map(item => ({ 
                nummer: item.Nummer, 
                titel: item.Titel,
                anzahl: item.anzahl,
                faktor: item.faktor
            }))
        };
        onSave(templatePayload);
        setNewTemplateName('');
        setCurrentItems([]);
    };


    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-gray-800">EBM-Vorlagen verwalten</h2>
            
            <div className="p-6 border rounded-lg bg-white shadow-sm">
                <h3 className="font-semibold text-xl text-gray-800 mb-4">Neue Vorlage erstellen</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-600">Name der Vorlage</label>
                        <input 
                            type="text" 
                            value={newTemplateName}
                            onChange={e => setNewTemplateName(e.target.value)}
                            placeholder="z.B. 'Standard KZT Sitzung'"
                            className={inputStyle}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">EBM-Ziffern hinzufügen</label>
                        <div className="relative mb-2">
                            <input 
                                type="text" 
                                placeholder="EBM-Ziffer oder Titel suchen..." 
                                value={ebmSearch} 
                                onChange={e => { setEbmSearch(e.target.value); setSelectedEbm(null); }} 
                                className={inputStyle} 
                            />
                            {searchResults.length > 0 && ebmSearch && !selectedEbm && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                                    {searchResults.map(item => (
                                        <li key={item.Nummer} onClick={() => handleSelectEbm(item)} className="px-3 py-2 cursor-pointer hover:bg-teal-50">
                                            {item.Nummer} - {item.Titel}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="text-xs font-medium text-gray-600">Anzahl</label>
                                <input type="number" value={anzahl} onChange={e => setAnzahl(Math.max(1, parseInt(e.target.value, 10) || 1))} min="1" className={`${inputStyle} text-center`} />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Faktor</label>
                                <input type="number" step="0.1" value={faktor} onChange={e => setFaktor(parseFloat(e.target.value) || 1)} min="1" className={`${inputStyle} text-center`} />
                            </div>
                            <div className="self-end">
                                <button onClick={handleAddItem} disabled={!selectedEbm} className="w-full bg-gray-700 text-white p-2 rounded-md hover:bg-gray-800 disabled:bg-gray-300 flex items-center justify-center">
                                    <PlusIcon className="w-4 h-4 mr-2"/> Hinzufügen
                                </button>
                            </div>
                        </div>
                    </div>

                    {currentItems.length > 0 && (
                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Ziffern in dieser Vorlage:</h4>
                            <div className="space-y-2">
                                {currentItems.map(item => (
                                    <div key={item.Nummer} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                                        <div>
                                            <p>{item.Nummer} - {item.Titel}</p>
                                            <p className="text-xs text-gray-500">Anzahl: {item.anzahl}, Faktor: {item.faktor}</p>
                                        </div>
                                        <button onClick={() => handleRemoveItem(item.Nummer)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="text-right">
                        <button onClick={handleSaveTemplate} disabled={!newTemplateName || currentItems.length === 0} className="bg-teal-600 text-white font-semibold py-2 px-4 text-sm rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 flex items-center justify-center disabled:bg-gray-400">
                            <SaveIcon className="w-4 h-4 mr-2"/> Vorlage speichern
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 border rounded-lg bg-white shadow-sm">
                <h3 className="font-semibold text-xl text-gray-800 mb-4">Gespeicherte Vorlagen</h3>
                <div className="space-y-3">
                    {templates.length > 0 ? templates.map(template => (
                        <div key={template.id} className="p-3 border rounded-md">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold text-gray-700">{template.name}</p>
                                <button onClick={() => onDelete(template.id)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon /></button>
                            </div>
                            <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                                {template.items.map(item => (
                                    <li key={item.nummer}>{item.nummer} - {item.titel} (Anzahl: {item.anzahl}, Faktor: {item.faktor})</li>
                                ))}
                            </ul>
                        </div>
                    )) : <p className="text-gray-500">Noch keine Vorlagen gespeichert.</p>}
                </div>
            </div>
        </div>
    );
};

export default EbmTemplates;
