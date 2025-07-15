import React, { useState } from 'react';

// Icons
const PlusCircle = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>;
const ChevronDown = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 12 15 18 9"></polyline></svg>;
const ClipboardPlus = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M9 14h6" /><path d="M12 11v6" /></svg>;


const ZentraleDiagnostik = ({ availableTests, testCategories, diagnostikTemplates, onAddTest, onAddTemplate }) => {
    const [openCategory, setOpenCategory] = useState(null);

    const toggleCategory = (categoryName) => {
        setOpenCategory(openCategory === categoryName ? null : categoryName);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            <div>
                 <h2 className="text-2xl font-semibold text-gray-800 mb-4">Test-Vorlagen</h2>
                 <p className="text-sm text-gray-600 mb-4">Fügen Sie eine vordefinierte Gruppe von Tests schnell für eine*n Patient*in hinzu.</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {diagnostikTemplates.map(template => (
                        <button 
                            key={template.id}
                            onClick={() => onAddTemplate(template)}
                            className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between text-left hover:shadow-md hover:border-teal-400 transition-all duration-200 group"
                        >
                            <div className="flex items-center">
                                <ClipboardPlus className="w-8 h-8 text-teal-500 mr-4" />
                                <div>
                                    <p className="font-bold text-gray-800">{template.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">{template.tests.length} Tests</p>
                                </div>
                            </div>
                            <PlusCircle className="w-7 h-7 text-gray-400 group-hover:text-teal-600 transition-colors" />
                        </button>
                    ))}
                 </div>
            </div>
            <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Einzelne Tests für einen Patienten erfassen</h2>
                <div className="space-y-3">
                    {testCategories.map(category => {
                        const testsInCategory = category.tests.map(testId => 
                            availableTests.find(t => t.id === testId)
                        ).filter(Boolean);

                        return (
                            <div key={category.name} className="bg-white rounded-xl border border-gray-200 shadow-sm">
                                <button
                                    onClick={() => toggleCategory(category.name)}
                                    className="w-full flex justify-between items-center p-5 text-left"
                                >
                                    <h3 className="text-lg font-bold text-gray-800">{category.name}</h3>
                                    <ChevronDown className={`transition-transform transform ${openCategory === category.name ? 'rotate-180' : ''}`} />
                                </button>
                                {openCategory === category.name && (
                                    <div className="p-5 border-t border-gray-100">
                                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                            {testsInCategory.map(test => (
                                                <div key={test.id} className="bg-gray-50 p-4 rounded-lg border flex justify-between items-center">
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{test.name}</p>
                                                        <p className="text-sm text-gray-500 mt-1">EBM: {test.ebm}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => onAddTest(test)} 
                                                        className="text-teal-500 hover:text-teal-700 hover:bg-teal-50 p-2 rounded-full transition-colors"
                                                        title={`Test "${test.name}" hinzufügen`}
                                                    >
                                                        <PlusCircle className="w-6 h-6" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ZentraleDiagnostik;