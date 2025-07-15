import React, { useState } from 'react';

// --- Daten aus deinen Markdown-Dateien ---
const cbtData = {
    'Methodische und prozessuale Grundlagen': ['Funktionale Verhaltens- und Problemanalyse', 'Psychoedukation & Aufbau einer therapeutischen Arbeitsbeziehung', 'Zieldefinition und Therapieplanung'],
    'Behaviorale Interventionen': {
        'Konfrontationsverfahren': ['Systematische Desensibilisierung', 'Reizüberflutung (Flooding)', 'Exposition mit Reaktionsverhinderung (ERP)', 'Interozeptive Exposition', 'Spiegelkonfrontation'],
        'Operante Verfahren': ['Positive und Negative Verstärkung', 'Differentielle Verstärkung', 'Shaping & Chaining', 'Löschung (Extinktion)', 'Response-Cost, Time-Out', 'Token-Systeme & Kontingenzverträge', 'Stimuluskontrolle'],
        'Motivations- und Aktivitätsfördernde Interventionen': ['Verhaltensaktivierung', 'Aktivitätenplanung und -protokollierung', 'Euthyme Therapie / Genusstraining', 'Motivational Interviewing'],
        'Entspannungs- & Selbstregulationsverfahren': ['Progressive Muskelrelaxation (PMR)', 'Autogenes Training (AT)', 'Angewandte Entspannung', 'Atemtechniken', 'Biofeedback'],
        'Training zur Gewohnheitsumkehr': ['Habit-Reversal-Training (HRT)'],
    },
    'Kognitive Interventionen': {
        'Kognitive Vorbereitung und Exploration': ['Selbstbeobachtungsprotokolle', 'Downward Arrow-Technik'],
        'Kognitive Umstrukturierungstechniken': ['Sokratischer Dialog', 'ABCDE-Modell', 'Überprüfung der Evidenz', 'Realitätstesten (Verhaltensexperimente)', 'Entkatastrophisieren', 'Kognitives Kontinuum', 'Umrahmung (Reframing)', 'Vorteile-Nachteile-Analyse', 'Einsatz von Bewältigungskarten', 'Einsatz von Grundüberzeugungs-Arbeitsblättern'],
    },
    'Kompetenz- & Bewältigungstrainings': {
        'Allgemeine Bewältigungsstrategien': ['Problemlösetraining', 'Stressimpfungstraining (SIT)', 'Selbstinstruktionstraining', 'Selbstmanagement-Therapie'],
        'Interpersonelle und emotionale Kompetenzen': ['Training sozialer Kompetenzen (GSK)', 'Assertivitätstraining', 'Kommunikationstraining', 'Training emotionaler Kompetenzen (TEK)'],
    },
    'Therapieabschluss und Transfersicherung': ['Erfolgsoptimierung und Transfer', 'Rückfallprophylaxe'],
};
const actData = {
    'Methodische und prozessuale Grundlagen': ['Prozessbasierte Fallkonzeptualisierung', 'Analyse der Kreativen Hoffnungslosigkeit', 'Psychoedukation zu psychischer Flexibilität', 'Herstellung einer experienziellen Arbeitsbeziehung', 'Werteorientierte Zieldefinition', 'Die "Zwei-Berge"-Metapher', 'Die "Press-Pause"-Metapher'],
    'Interventionen zur Förderung von Akzeptanz & Defusion': {
        'Akzeptanz / Bereitschaft': ['Metaphern zur Verdeutlichung der Kontrollkosten', 'Experienzielle Übungen', 'Systematische, werteorientierte Exposition', '"Drei-As"-Modell der Akzeptanz'],
        'Kognitive Defusion': ['Techniken zur Distanzierung & Beobachtung', 'Techniken zur Deliteralisierung', 'Metaphern & Visualisierungen'],
    },
    'Interventionen zur Förderung von Achtsamkeit & Selbst als Kontext': {
        'Kontakt mit dem gegenwärtigen Augenblick': ['Formale Achtsamkeitsübungen', 'Informelle Achtsamkeitsübungen', 'Training der Aufmerksamkeitssteuerung'],
        'Selbst als Kontext': ['Metaphern zur Etablierung einer stabilen Beobachterperspektive', 'Experienzielle Übungen', 'Training deiktischer Relationen'],
    },
    'Interventionen zur Werteklärung & zum engagierten Handeln': {
        'Werteklärung': ['Explorative & imaginative Übungen', 'Strukturierte Arbeitsmaterialien', 'Analyse der Werte-Verhaltens-Diskrepanz', 'Werte als motivierende Operationen nutzen', '"Flavoring and Savoring"-Übung'],
        'Engagiertes Handeln': ['Zielsetzung und Handlungsplanung', 'Analyse und Überwindung von Barrieren (HARD)', 'Verhaltensaktivierung und Verhaltensformung', 'Problemlösetraining', 'Der "Choice Point"', '"Surf the Urge"-Technik', 'Training interpersoneller Kompetenzen'],
    },
    'Therapieabschluss und Transfersicherung': ['Fokus auf den Prozess, nicht auf das Outcome', 'Aufbau sich selbst erhaltender, positiver Feedbackschleifen', 'Planung für Rückschläge', 'Generalisierung der gelernten Flexibilitätsprozesse', 'Förderung der "Fünf-aus-fünf"-Perspektive'],
};
const mctData = {
    'Grundlagen & Psychoedukation': ['Vermittlung des MCT-Modells', 'Erläuterung des Kognitiv-attentionalen Syndroms (CAS)'],
    'Kerninterventionen': ['Attention Training Technique (ATT)', 'Detached Mindfulness (Losgelöste Achtsamkeit)', 'Sorgen-/Grübelverschiebung', 'Situational Attentional Refocusing (SAR)'],
    'Modifikation metakognitiver Überzeugungen': ['Identifikation & Infragestellen positiver Überzeugungen', 'Identifikation & Infragestellen negativer Überzeugungen', 'Durchführung von metakognitiven Verhaltensexperimenten'],
};

const TreeItem = ({ label, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = React.Children.count(children) > 0;
    return (
        <li className={hasChildren ? 'tree-node' : 'tree-leaf'}>
            <span onClick={() => hasChildren && setIsOpen(!isOpen)} className="flex items-center p-1 rounded-md hover:bg-slate-100 cursor-pointer">
                {hasChildren && <span className="w-6 text-slate-500">{isOpen ? '▼' : '►'}</span>}
                <span className={hasChildren ? 'font-semibold' : 'ml-6'}>{label}</span>
            </span>
            {hasChildren && isOpen && <ul className="pl-6 border-l ml-3">{children}</ul>}
        </li>
    );
};

const TreeView = ({ data }) => {
    const renderTree = (node) => {
        return Object.entries(node).map(([key, value]) => (
            <TreeItem key={key} label={key}>
                {Array.isArray(value)
                    ? value.map((item, index) => <TreeItem key={index} label={item} />)
                    : typeof value === 'object'
                    ? renderTree(value)
                    : null
                }
            </TreeItem>
        ));
    };
    return <ul className="space-y-1">{renderTree(data)}</ul>;
};

const Behandlungsmethoden = () => {
    const [activeTab, setActiveTab] = useState('KVT');
    const tabs = {
        'KVT': { label: 'Kognitive Verhaltenstherapie (KVT)', data: cbtData },
        'ACT': { label: 'Akzeptanz- & Commitment-Therapie (ACT)', data: actData },
        'MCT': { label: 'Metakognitive Therapie (MCT)', data: mctData },
    };
    return (
        <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Behandlungsmethoden</h3>
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
                        {Object.keys(tabs).map(key => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === key ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                {tabs[key].label}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="p-6">
                    <TreeView data={tabs[activeTab].data} />
                </div>
            </div>
        </div>
    );
}

export default Behandlungsmethoden;
