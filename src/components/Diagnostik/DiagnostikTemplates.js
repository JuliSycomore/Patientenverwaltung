import React from 'react';

const PlusCircle = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>;
const Edit = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const Trash2 = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;

const DiagnostikTemplates = ({ templates, availableTests, onAdd, onEdit, onDelete }) => {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Test-Vorlagen verwalten</h2>
                <button
                    onClick={onAdd}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm flex items-center justify-center transition-colors"
                >
                    <PlusCircle className="mr-2" />
                    Neue Vorlage erstellen
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <ul className="divide-y divide-gray-200">
                    {templates.length > 0 ? templates.map(template => {
                        const testsInTemplate = template.tests.map(tId => availableTests.find(at => at.id === tId)?.name).filter(Boolean);
                        return (
                            <li key={template.id} className="p-4 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-gray-800 text-lg">{template.name}</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {testsInTemplate.join(' • ')}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => onEdit(template)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-colors" title="Vorlage bearbeiten">
                                            <Edit />
                                        </button>
                                        <button onClick={() => onDelete(template.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-md transition-colors" title="Vorlage löschen">
                                            <Trash2 />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        );
                    }) : (
                        <li className="p-6 text-center text-gray-500">
                            Noch keine Vorlagen erstellt.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default DiagnostikTemplates;