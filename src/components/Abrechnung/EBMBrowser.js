import React, { useState, useEffect, useMemo } from 'react';

const SearchIcon = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);

// Der aktuelle Punktwert (Stand 2024: 12,3934 Cent)
const EBM_PUNKTWERT_EURO = 0.123934;

// Neue, thematisch gegliederte Kategorien
const EBM_CATEGORIES = {
    'vor_antragstellung': {
        title: 'Vor Antragstellung',
        ziffern: [
            '23210', '23211', '23212', '23214', '23215', '23216', '23218', // Grundpauschalen
            '35151', // Sprechstunde
            '35152', // Akutbehandlung
            '35150', // Probatorische Sitzung (Einzel)
            '35163', '35164', '35165', '35166', '35167', '35168', '35169', // Probatorik (Gruppe)
            '35140', // Biographische Anamnese
            '35141', '35142', // Zuschläge zur Anamnese
            '35130', '35131', // Bericht an den Gutachter
            '23220', // Psychotherapeutisches Gespräch
            '35100', // Diff.-diagn. Klärung
            '35110', // Verbale Intervention
        ],
    },
    'einzeltherapie': {
        title: 'Einzeltherapie',
        prefixes: ['354'], // Deckt KZT 1, KZT 2 und LZT für alle Verfahren ab
    },
    'gruppentherapie': {
        title: 'Gruppentherapie',
        prefixes: ['355', '3517'], // Deckt alle Gruppentherapien und Grundversorgung ab
    },
    'testverfahren': {
        title: 'Testverfahren',
        prefixes: ['356'],
    },
    'uebende_verfahren': {
        title: 'Übende Verfahren',
        ziffern: ['35111', '35112', '35113', '35120'], // Autogenes Training, Jacobson, Hypnose
    },
    'orga_zuschlaege': {
        title: 'Organisation & Zuschläge',
        prefixes: ['01', '40', '3559', '2322'], // Orga, Porto, KZT-Zuschläge, TSS-Zuschläge
        ziffern: ['35571', '35572', '35573'], // Weitere Zuschläge
    }
};


const EBMBrowser = () => {
    const [ebmData, setEbmData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('vor_antragstellung');

    useEffect(() => {
        fetch('/ebm_data_full.json') 
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                const dataWithEuro = data.map(item => ({
                    ...item,
                    euro: (parseFloat(item.Punkte) * EBM_PUNKTWERT_EURO).toFixed(2)
                }));
                setEbmData(dataWithEuro);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Fehler beim Laden der EBM-Daten:", error);
                setIsLoading(false);
            });
    }, []);

    const categorizedData = useMemo(() => {
        const categories = {};
        Object.keys(EBM_CATEGORIES).forEach(key => {
            categories[key] = [];
        });

        ebmData.forEach(item => {
            for (const key in EBM_CATEGORIES) {
                const category = EBM_CATEGORIES[key];
                const matchesPrefix = category.prefixes?.some(prefix => item.Nummer.startsWith(prefix));
                const matchesZiffer = category.ziffern?.includes(item.Nummer);
                if (matchesPrefix || matchesZiffer) {
                    categories[key].push(item);
                    return; // Ziffer nur einer Kategorie zuordnen
                }
            }
        });
        
        // Sortiere jede Kategorie nach Ziffernnummer
        for (const key in categories) {
            categories[key].sort((a, b) => a.Nummer.localeCompare(b.Nummer));
        }

        return categories;
    }, [ebmData]);

    const filteredData = useMemo(() => {
        let dataToFilter = categorizedData[activeCategory] || [];
        
        const lowercasedFilter = searchTerm.toLowerCase();
        if (!lowercasedFilter) {
            return dataToFilter;
        }
        return dataToFilter.filter(item => 
            item.Nummer.includes(lowercasedFilter) ||
            item.Titel.toLowerCase().includes(lowercasedFilter) ||
            (item.Leistung && item.Leistung.toLowerCase().includes(lowercasedFilter))
        );
    }, [searchTerm, activeCategory, categorizedData]);

    if (isLoading) {
        return <div className="text-center p-10">Lade EBM-Daten...</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-xl">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">EBM-Ziffern Browser</h2>
            
            <div className="mb-6 border-b border-gray-200">
                 <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {Object.keys(EBM_CATEGORIES).map(key => (
                        <button
                            key={key}
                            onClick={() => setActiveCategory(key)}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeCategory === key 
                                ? 'border-teal-500 text-teal-600' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {EBM_CATEGORIES[key].title}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="relative mb-6">
                <input 
                    type="text"
                    placeholder={`Suche in "${EBM_CATEGORIES[activeCategory].title}"...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="overflow-x-auto max-h-[60vh]">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                        <tr>
                            <th scope="col" className="px-4 py-3 w-[10%]">Ziffer</th>
                            <th scope="col" className="px-4 py-3 w-[50%]">Titel</th>
                            <th scope="col" className="px-4 py-3 w-[15%] text-right">Punkte</th>
                            <th scope="col" className="px-4 py-3 w-[15%] text-right">Betrag (€)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map(item => (
                            <tr key={item.Nummer} className="bg-white border-b hover:bg-teal-50">
                                <td className="px-4 py-4 font-mono font-bold text-teal-700">{item.Nummer}</td>
                                <td className="px-4 py-4 font-semibold text-gray-800">{item.Titel}</td>
                                <td className="px-4 py-4 font-mono text-right">{item.Punkte}</td>
                                <td className="px-4 py-4 font-mono text-right font-semibold">{item.euro}</td>
                            </tr>
                        ))}
                         {filteredData.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center py-10 text-gray-500">
                                    {searchTerm 
                                        ? `Keine Ergebnisse für "${searchTerm}" in dieser Kategorie.`
                                        : "In dieser Kategorie sind keine Ziffern vorhanden."
                                    }
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EBMBrowser;
