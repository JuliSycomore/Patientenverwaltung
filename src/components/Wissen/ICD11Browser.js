// src/components/ICD11Browser.js
import React, { useState, useEffect, useCallback } from 'react';

// Icons für die UI
const SearchIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const ChevronRightIcon = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 18 15 12 9 6"></polyline></svg>;
const ChevronDownIcon = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 12 15 18 9"></polyline></svg>;
const GlobeIcon = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;

// Rekursive Komponente für einen einzelnen Knoten im Baum
const TreeNode = ({ node, onToggle, onSelect, openNodes, selectedId }) => {
    const isOpen = openNodes[node.id];
    const isSelected = selectedId === node.id;

    const handleToggle = (e) => {
        e.stopPropagation();
        onToggle(node);
    };

    const handleSelect = () => {
        onSelect(node.id);
    };

    return (
        <div className="ml-4">
            <div 
                onClick={handleSelect}
                className={`flex items-center space-x-2 p-1.5 rounded-md cursor-pointer hover:bg-indigo-100 ${isSelected ? 'bg-indigo-200 font-semibold' : ''}`}
            >
                {node.hasChildren && (
                    <button onClick={handleToggle} className="p-0.5 rounded hover:bg-gray-300">
                        {isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
                    </button>
                )}
                {!node.hasChildren && <div className="w-5"></div>}
                <span className="flex-grow">{node.title} ({node.code})</span>
            </div>
            {isOpen && node.children && (
                <div className="border-l-2 border-gray-200 ml-2">
                    {node.children.map(child => (
                        <TreeNode 
                            key={child.id} 
                            node={child} 
                            onToggle={onToggle} 
                            onSelect={onSelect} 
                            openNodes={openNodes} 
                            selectedId={selectedId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


const ICD11Browser = () => {
    const [treeData, setTreeData] = useState([]);
    const [openNodes, setOpenNodes] = useState({});
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Initiales Laden der obersten Kapitel
    useEffect(() => {
        const fetchRoot = async () => {
            setIsLoading(true);
            try {
                // Hier rufen wir jetzt den /api/icd11-children/1334221352 Endpunkt auf, um die Hauptkapitel zu erhalten
                const response = await fetch('http://localhost:3001/api/icd11-children/1334221352'); // ID for "ICD-11 for MMS"
                if (!response.ok) throw new Error('Could not fetch root chapters.');
                const data = await response.json();
                setTreeData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRoot();
    }, []);

    const fetchEntityDetails = useCallback(async (id) => {
        if (!id) return;
        setIsLoading(true);
        setSelectedEntity(null);
        setSelectedId(id);
        try {
            const response = await fetch(`http://localhost:3001/api/icd11-info/${id}`);
            if (!response.ok) throw new Error('Details konnten nicht geladen werden.');
            const data = await response.json();
            setSelectedEntity(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleNodeToggle = useCallback(async (node) => {
        setOpenNodes(prev => ({ ...prev, [node.id]: !prev[node.id] }));

        // Wenn der Knoten geöffnet wird und noch keine Kinder geladen wurden
        if (!openNodes[node.id] && !node.children) {
            try {
                const response = await fetch(`http://localhost:3001/api/icd11-children/${node.id}`);
                if (!response.ok) throw new Error('Children could not be loaded.');
                const childrenData = await response.json();

                // Den Baum-State aktualisieren
                const updateTree = (nodes) => {
                    return nodes.map(n => {
                        if (n.id === node.id) {
                            return { ...n, children: childrenData };
                        }
                        if (n.children) {
                            return { ...n, children: updateTree(n.children) };
                        }
                        return n;
                    });
                };
                setTreeData(prev => updateTree(prev));
            } catch (err) {
                setError(err.message);
            }
        }
    }, [openNodes]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm) return;
        setIsSearching(true);
        setError(null);
        setSearchResults([]);
        try {
            const response = await fetch(`http://localhost:3001/api/icd11-search?q=${searchTerm}`);
            if (!response.ok) throw new Error('Suche fehlgeschlagen.');
            const data = await response.json();
            setSearchResults(data);
        } catch(err) {
            setError(err.message);
        } finally {
            setIsSearching(false);
        }
    };


    return (
        <div className="p-4 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">ICD-11 Nachschlagewerk</h2>
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Diagnose suchen (z.B. 'Depression')"
                    className="flex-grow mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <button type="submit" disabled={isSearching} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm flex items-center justify-center hover:bg-indigo-700 disabled:bg-indigo-300">
                    <SearchIcon />
                </button>
            </form>

            {error && <p className="text-red-500 bg-red-100 p-2 rounded-md mb-4">{error}</p>}
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6" style={{ minHeight: '60vh' }}>
                {/* Linke Spalte: Baum oder Suchergebnisse */}
                <div className="md:col-span-5 lg:col-span-4 bg-gray-50 p-3 rounded-md border max-h-[70vh] overflow-y-auto">
                    {isSearching && <p>Suche läuft...</p>}
                    {(searchResults.length > 0 || isSearching) ? (
                         <div>
                            <h3 className="font-semibold mb-2">Suchergebnisse</h3>
                            {searchResults.map(result => (
                                <div 
                                    key={result.id} 
                                    onClick={() => fetchEntityDetails(result.id)}
                                    className={`p-2 rounded-md cursor-pointer hover:bg-indigo-100 ${selectedId === result.id ? 'bg-indigo-200' : ''}`}
                                >
                                    <p className="font-medium text-sm">{result.title}</p>
                                    <p className="text-xs text-gray-500">{result.code}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div>
                            <h3 className="font-semibold mb-2">Kapitel durchsuchen</h3>
                            {isLoading && treeData.length === 0 && <p>Lade Baumstruktur...</p>}
                            {treeData.map(node => (
                                <TreeNode 
                                    key={node.id} 
                                    node={node} 
                                    onToggle={handleNodeToggle} 
                                    onSelect={fetchEntityDetails} 
                                    openNodes={openNodes}
                                    selectedId={selectedId}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Rechte Spalte: Detailansicht */}
                <div className="md:col-span-7 lg:col-span-8 p-3">
                    {isLoading && <p>Lade Details...</p>}
                    {!selectedEntity && !isLoading && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                           <GlobeIcon className="w-16 h-16 mb-4" />
                           <p>Bitte wählen Sie eine Diagnose aus dem Baum oder den Suchergebnissen aus, um Details anzuzeigen.</p>
                        </div>
                    )}
                    {selectedEntity && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-indigo-700">{selectedEntity.title?.['@value']}</h3>
                            <p className="text-sm font-mono bg-gray-100 p-2 rounded-md inline-block">Code: {selectedEntity.code}</p>
                            
                            {selectedEntity.definition && (
                                <div>
                                    <h4 className="font-semibold text-gray-800">Beschreibung</h4>
                                    <p className="mt-1 text-gray-600 whitespace-pre-wrap">{selectedEntity.definition['@value']}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ICD11Browser;

