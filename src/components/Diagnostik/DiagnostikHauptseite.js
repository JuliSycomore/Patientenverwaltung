import React, { useState } from 'react';
import ZentraleDiagnostik from './ZentraleDiagnostik';
import DiagnostikTemplates from './DiagnostikTemplates';

const DiagnostikHauptseite = (props) => {
    const [activeTab, setActiveTab] = useState('erfassen');

    const tabStyle = "whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm";
    const activeTabStyle = "border-teal-500 text-teal-600";
    const inactiveTabStyle = "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300";

    return (
        <div className="max-w-6xl mx-auto">
             <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('erfassen')}
                        className={`${tabStyle} ${activeTab === 'erfassen' ? activeTabStyle : inactiveTabStyle}`}
                    >
                        Test erfassen / Vorlage zuweisen
                    </button>
                    <button
                        onClick={() => setActiveTab('verwalten')}
                        className={`${tabStyle} ${activeTab === 'verwalten' ? activeTabStyle : inactiveTabStyle}`}
                    >
                        Vorlagen verwalten
                    </button>
                </nav>
            </div>
            
            <div>
                {activeTab === 'erfassen' && (
                    <ZentraleDiagnostik 
                        availableTests={props.availableTests}
                        testCategories={props.testCategories}
                        diagnostikTemplates={props.diagnostikTemplates}
                        onAddTest={props.onAddTest}
                        onAddTemplate={props.onAddTemplate}
                    />
                )}
                {activeTab === 'verwalten' && (
                     <DiagnostikTemplates 
                        templates={props.diagnostikTemplates} 
                        availableTests={props.availableTests} 
                        onAdd={props.onAddTemplateDefinition} 
                        onEdit={props.onEditTemplateDefinition} 
                        onDelete={props.onDeleteTemplateDefinition}
                    />
                )}
            </div>
        </div>
    );
};

export default DiagnostikHauptseite;