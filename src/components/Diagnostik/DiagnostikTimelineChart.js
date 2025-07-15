import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';

// Custom Tooltip for the chart to show details on hover
const CustomTooltip = ({ active, payload, label, testCategories }) => {
    if (active && payload && payload.length) {
        const testsOnDate = payload[0].payload.tests;

        const categoriesOnDate = [...new Set(testsOnDate.map(t => {
             const category = testCategories.find(cat => cat.tests.includes(t.id));
             return category ? category.name : 'Unkategorisiert';
        }))];

        const testGruende = [...new Set(testsOnDate.map(t => t.testGrund).filter(Boolean))];

        return (
            <div className="bg-white p-3 border rounded-md shadow-lg max-w-xs text-left">
                <p className="font-bold text-gray-800">{`Datum: ${label}`}</p>
                <p className="text-sm text-gray-600 font-semibold">{`Anzahl Tests: ${payload[0].value}`}</p>
                <div className="mt-2 pt-2 border-t">
                     {testGruende.length > 0 && (
                        <>
                            <p className="text-xs font-semibold text-gray-700">Grund/Vorlage:</p>
                            <p className="text-xs text-gray-500 mb-2">{testGruende.join(', ')}</p>
                        </>
                     )}
                     <p className="text-xs font-semibold text-gray-700">Kategorien:</p>
                     <p className="text-xs text-gray-500 mb-2">{categoriesOnDate.join(', ')}</p>
                     <p className="text-xs font-semibold text-gray-700">Durchgeführte Tests:</p>
                     <ul className="list-disc list-inside text-xs text-gray-500">
                        {testsOnDate.map(t => <li key={t.testInstanceId}>{t.name}</li>)}
                     </ul>
                </div>
            </div>
        );
    }
    return null;
};


const DiagnostikTimelineChart = ({ chartData, testCategories }) => {
    if (!chartData || chartData.length === 0) {
        return (
            <div className="p-4 text-center text-sm text-gray-500 bg-gray-50 rounded-lg border">
                Für die Visualisierung sind noch keine Testdaten vorhanden.
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border" style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="2 2" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false}>
                        <Label value="Anzahl Tests" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#666' }} />
                    </YAxis>
                    <Tooltip content={<CustomTooltip testCategories={testCategories} />} cursor={{ fill: 'rgba(239, 246, 255, 0.6)' }} />
                    <Bar dataKey="count" name="Anzahl Tests" fill="#4f46e5" barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DiagnostikTimelineChart;