import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// --- Helper Components & Icons ---
const Trash2 = ({ className = "w-4 h-4" }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>);

// --- IIP-C Constants and Logic ---
const IIP_QUESTIONS_PART1 = [
    "anderen Menschen zu vertrauen", "anderen gegenüber „Nein“ zu sagen", "mich Gruppen anzuschließen", "bestimmte Dinge für mich zu behalten", "andere wissen zu lassen, was ich will",
    "jemandem zu sagen, dass er mich nicht weiter belästigen soll", "mich fremden Menschen vorzustellen", "andere mit anstehenden Problemen zu konfrontieren", "mich gegenüber jemand anderem zu behaupten",
    "andere wissen zu lassen, dass ich wütend bin", "eine langfristige Verpflichtung gegenüber anderen einzugehen", "jemandem gegenüber die „Chef-Rolle“ einzunehmen",
    "anderen gegenüber aggressiv zu sein, wenn die Lage es erfordert", "mit anderen etwas zu unternehmen", "anderen Menschen meine Zuneigung zu zeigen", "mit anderen zurechtzukommen",
    "die Ansichten eines anderen zu verstehen", "meine Gefühle anderen gegenüber frei heraus zu äußern", "wenn nötig, standfest zu sein", "ein Gefühl von Liebe für jemanden zu empfinden",
    "anderen Grenzen zu setzen", "jemand anderen in seinen Lebenszielen zu unterstützen", "mich anderen nahe zu fühlen", "mich wirklich um die Probleme anderer zu kümmern",
    "mich mit jemand anderem zu streiten", "alleine zu sein", "jemandem ein Geschenk zu machen", "mir auch gegenüber den Menschen Ärger zu gestatten, die ich mag",
    "die Bedürfnisse eines anderen über meine eigenen zu stellen", "mich aus den Angelegenheiten anderer herauszuhalten", "Anweisungen von Personen entgegenzunehmen, die mir vorgesetzt sind",
    "mich über das Glück eines anderen Menschen zu freuen", "andere zu bitten, mit mir etwas zu unternehmen", "mich über andere zu ärgern", "mich zu öffnen und meine Gefühle jemand anderem mitzuteilen",
    "jemand anderem zu verzeihen, nachdem ich ärgerlich war", "mein eigenes Wohlergehen nicht aus dem Auge zu verlieren, wenn jemand anderes in Not ist",
    "fest und bestimmt zu bleiben, ohne mich darum zu kümmern, ob ich die Gefühle anderer verletze", "selbstbewusst zu sein, wenn ich mit anderen zusammen bin"
];

const IIP_QUESTIONS_PART2 = [
    "Ich streite mich zu viel mit anderen", "Ich fühle mich zu sehr für die Lösung der Probleme anderer verantwortlich", "Ich lasse mich zu leicht von anderen überreden",
    "Ich öffne mich anderen zu sehr", "Ich bin zu unabhängig", "Ich bin gegenüber anderen zu aggressiv", "Ich bemühe mich zu sehr, anderen zu gefallen",
    "Ich spiele zu oft den Clown", "Ich lege zu viel Wert darauf, beachtet zu werden", "Ich vertraue anderen zu leicht", "Ich bin zu sehr darauf aus, andere zu kontrollieren",
    "Ich stelle zu oft die Bedürfnisse anderer über meine eigenen", "Ich versuche zu sehr, andere zu verändern", "Ich bin zu leichtgläubig", "Ich bin anderen gegenüber zu großzügig",
    "Ich habe vor anderen zu viel Angst", "Ich bin anderen gegenüber zu misstrauisch", "Ich beinflusse andere zu sehr, um zu bekommen, was ich will",
    "Ich erzähle anderen zu oft persönliche Dinge", "Ich streite zu oft mit anderen", "Ich halte mir andere zu sehr auf Distanz", "Ich lasse mich von anderen zu sehr ausnutzen",
    "Ich bin vor anderen Menschen zu verlegen", "Die Not eines anderen Menschen berührt mich zu sehr", "Ich möchte mich zu sehr an anderen rächen"
];

const IIP_SCALES = { PA: { name: 'Dominant / Kontrollierend', items: [17, 31, 44, 45, 50, 52, 57, 59], description: 'Personen mit hohen Werten berichten über Probleme, andere zu sehr ändern, beeinflussen oder kontrollieren zu wollen; sie betonen ihre Unabhängigkeit zu sehr und berichten Schwierigkeiten, sich unterzuordnen.' }, BC: { name: 'Streitsüchtig / Misstrauisch', items: [1, 22, 24, 29, 32, 40, 56, 64], description: 'Personen mit hohen Werten berichten über Probleme, anderen zu vertrauen bzw. zu misstrauisch zu sein; sie beschreiben sich als mißgünstig und auf Rache aus.' }, DE: { name: 'Abweisend / Kalt', items: [11, 15, 16, 20, 23, 27, 36, 60], description: 'Personen mit hohen Werten berichten über Schwierigkeiten, Nähe herzustellen, Zuneigung oder Liebe zu empfinden oder langfristige Verpflichtungen einzugehen; sie halten andere zu sehr auf Distanz.' }, FG: { name: 'Introvertiert / Sozial vermeidend', items: [3, 7, 14, 18, 33, 35, 55, 62], description: 'Personen mit hohen Werten berichten über Probleme, Kontakte zu knüpfen, auf andere zuzugehen oder ihre Gefühle zu zeigen. Sie beschreiben Angst und Scheu vor anderen Menschen.' }, HI: { name: 'Selbstunsicher / Unterwürfig', items: [5, 6, 8, 9, 12, 13, 19, 39], description: 'Personen mit hohen Werten berichten über Probleme, eigene Bedürfnisse zu zeigen, sich abzugrenzen, standfest zu sein oder andere mit Problemen zu konfrontieren; sie sehen sich als wenig selbstbewusst.' }, JK: { name: 'Ausnutzbar / Nachgiebig', items: [2, 10, 25, 34, 38, 42, 53, 61], description: 'Personen mit hohen Werten berichten über Schwierigkeiten, „Nein“ zu sagen oder Ärger zu zeigen; sie beschreiben sich als leichtgläubig und lassen sich leicht überreden oder ausnutzen.' }, LM: { name: 'Fürsorglich / Intrusiv', items: [21, 28, 37, 46, 49, 51, 54, 63], description: 'Personen mit hohen Werten berichten, dass sie ihre eigenen Interessen vernachlässigen, sich zu sehr von den Problemen anderer leiten lassen und Schwierigkeiten haben, anderen Grenzen zu setzen.' }, NO: { name: 'Expressiv / Aufdringlich', items: [4, 26, 30, 41, 43, 47, 48, 58], description: 'Personen mit hohen Werten berichten über Schwierigkeiten, Dinge für sich zu behalten; sie fühlen sich zu verantwortlich für andere und legen zu viel Wert auf Beachtung.' }, };
const ANSWER_OPTIONS = ["nicht", "wenig", "mittelmäßig", "ziemlich", "sehr"];
const ANSWER_POINTS = [0, 1, 2, 3, 4];
const STANINE_NORMS = { male: { '17-24': { PA: [-10.7, -7.8, -5.8, -4.2, -2.5, -0.8, 2.2, 4.7], BC: [-8.7, -6.4, -4.8, -2.9, -0.9, 0.6, 2.2, 3.2], DE: [-6.5, -5.4, -4.1, -2.8, -1.1, 0.4, 1.6, 4.1], FG: [-6, -4.5, -2.4, -0.2, 1.5, 4, 7, 10.1], HI: [-6, -3.6, -0.6, 1.4, 3.1, 4.9, 7, 9.1], JK: [-3, -1.7, 0.1, 1.8, 3.3, 4.9, 7.1, 9.4], LM: [-3, -1.8, -0.6, 0.5, 2.6, 4.3, 5.8, 8.2], NO: [-7.4, -6, -3.9, -1.7, 0.4, 2.6, 5.4, 8.7], IIPges: [3.3, 6.6, 8.9, 10.7, 12, 13.8, 15.6, 17.5] }, '25-34': { PA: [-11.5, -9, -7.4, -5.8, -3.5, -1.6, 0.5, 2.3], BC: [-9.5, -7.8, -5.8, -3.9, -2.3, -0.6, 1.4, 3.6], DE: [-9.6, -6.5, -4.9, -3.1, -0.9, 1, 1.9, 3.6], FG: [-6.5, -3.9, -2.6, -0.3, 2.1, 5.2, 7.6, 9.9], HI: [-3, -1.1, 1, 2.5, 5.1, 7.6, 9.8, 11.3], JK: [-3.6, -2.1, -0.3, 1.5, 3.5, 5.9, 6.6, 9.4], LM: [-4.6, -2, -0.1, 1.5, 3.3, 5.2, 7.1, 9.5], NO: [-10, -6.6, -4.5, -1.5, 0.3, 2.6, 4.9, 7.6], IIPges: [6, 7.1, 9.4, 11.5, 13.5, 15.6, 17.6, 20] }, '35-49': { PA: [-10.4, -8.4, -6, -4.4, -2.4, -0.9, 1.3, 4.8], BC: [-9.4, -6.9, -5.4, -3.6, -2, -0.3, 1.3, 5.3], DE: [-8.4, -6.9, -5.4, -3.4, -1.5, -0.3, 1.5, 3.2], FG: [-8, -3.7, -2.3, -0.4, 0.9, 2.4, 5.1, 7.6], HI: [-4.7, -2.4, -0.1, 1.9, 4.4, 6.7, 8.6, 10.6], JK: [-2.3, -1.2, 0.5, 2.5, 3.5, 6.6, 8.6, 10.8], LM: [-2.7, -1.5, -0.1, 1.5, 3.3, 4.5, 5.9, 9.5], NO: [-7.9, -5.8, -4, -3, -0.3, 1.4, 3.1, 6.5], IIPges: [3.4, 5.6, 6.9, 10.7, 13.2, 15.1, 16.3, 17.8] }, '50+': { PA: [-8.1, -7, -5.3, -3.6, -1.9, -0.5, 1.6, 3.8], BC: [-8, -6, -4, -2.6, -1.1, 0.3, 1.5, 3.1], DE: [-7, -4.8, -2.9, -1.1, 0.6, 2.4, 4.3, 6], FG: [-6, -4, -2.6, -0.8, 1, 2.5, 4.9, 8.8], HI: [-6.1, -4.3, -2.8, -0.5, 1, 3.5, 5.6, 9.8], JK: [-4.6, -1.9, 0.1, 2.6, 3.9, 5.5, 7.8, 10.6], LM: [-2.8, -1.3, 0.4, 1.8, 3.3, 4.5, 5.9, 9.5], NO: [-7.5, -6, -4, -2.5, -0.9, 1.3, 3, 5.1], IIPges: [2.8, 4.4, 6.4, 8.3, 10.4, 12.1, 13.8, 15.6] } }, female: { '17-24': { PA: [-11.2, -8.3, -6.2, -3.4, -2.4, -0.1, 1.9, 3.6], BC: [-8.3, -6.2, -4.7, -2.9, -0.8, 0.8, 3, 4.9], DE: [-8.3, -6.4, -4, -2.1, -0.3, 1.9, 3.6, 5.9], FG: [-6.4, -4.8, -2.6, -0.2, 1.9, 4, 7.6, 9.4], HI: [-5.7, -3.4, -1.4, 0.3, 2.8, 5.4, 7.2, 10.8], JK: [-4.5, -2.2, -0.5, 1, 2.9, 4.9, 6.6, 8.7], LM: [-5.2, -2.1, -0.6, 0.6, 2, 3.9, 5.9, 8.5], NO: [-8.8, -6, -3.7, -1.8, 0.5, 2.6, 6.3, 10.5], IIPges: [4.6, 6.3, 8.8, 11.2, 12.8, 15.1, 17.1, 19.6] }, '25-34': { PA: [-11, -8.4, -5.9, -3.9, -1.9, -0.8, 2.1, 4.9], BC: [-8.5, -6, -4, -2.1, -0.5, 1, 2.8, 4.4], DE: [-7.4, -5.3, -3.6, -1.9, -0.4, 1.4, 3.5, 5.1], FG: [-5.3, -2.9, -1.9, -0.5, 1.8, 3.6, 5.4, 8.3], HI: [-4.8, -2.6, -1.4, 0.4, 2.7, 5, 7.5, 9.9], JK: [-4.4, -2.7, -0.6, 1.1, 3.1, 4.8, 6.6, 10], LM: [-3.7, -2.1, -0.6, 0.9, 2.8, 4.4, 6.4, 8.6], NO: [-8.4, -5.9, -4.4, -2.4, 0, 2, 4.3, 6.5], IIPges: [3.7, 5.2, 8, 10.1, 12.3, 14.9, 17.3, 20.1] }, '35-49': { PA: [-10.3, -8.7, -7.3, -6.1, -3.8, -2, -0.6, 0.9], BC: [-11.1, -8.2, -6.5, -4.8, -3.1, -0.8, 0.9, 2.9], DE: [-9.9, -7.7, -5.1, -2.9, -1.1, 0.4, 2.9, 5.7], FG: [-7, -3.4, -2.3, 0, 2.4, 4.4, 7.4, 10.1], HI: [-2.8, -0.8, 0.7, 3, 5.9, 7.5, 9.9, 12.5], JK: [-4.4, -1, 1, 3, 4.4, 6, 8.2, 10.6], LM: [-2.9, -1.2, 0.4, 2.1, 4.1, 5.8, 7.3, 10.4], NO: [-8.5, -7, -4.9, -3.1, -1.2, 0.7, 2.2, 6.2], IIPges: [3.4, 5.8, 8.3, 11.3, 13.6, 16.1, 17.7, 19.1] }, '50+': { PA: [-10.3, -7.5, -6.4, -5.1, -2.6, -1.5, 0.2, 3.1], BC: [-9.8, -7.2, -5.6, -3.7, -2.4, -0.8, 0.5, 2], DE: [-8.2, -5.5, -4.1, -1.9, -0.7, 0.9, 2.5, 5.3], FG: [-7.1, -6.2, -3.5, -0.4, 1.4, 3.6, 6.4, 8.3], HI: [-3.2, -1.2, -0.5, 1.5, 3.8, 5.9, 8.3, 12], JK: [-4.5, -0.9, 1.3, 3.1, 4.4, 6.2, 8.3, 9.4], LM: [-3.3, -0.9, 0.2, 2.3, 3.8, 5, 6.7, 11], NO: [-7.5, -6, -3.7, -2.5, -0.5, 1.5, 2.8, 4.5], IIPges: [4.1, 5.5, 7.5, 9.6, 11.5, 14.1, 16.5, 18.3] } } };
const getAgeGroup = (age) => { if (!age || age < 17) return '17-24'; if (age <= 24) return '17-24'; if (age <= 34) return '25-34'; if (age <= 49) return '35-49'; return '50+'; };
const calculateStanine = (value, thresholds) => { if (value < thresholds[0]) return 1; for (let i = 0; i < thresholds.length; i++) { if (value <= thresholds[i]) return i + 2; } return 9; };

export const IIPCEntryForm = ({ onSave, patientAge, patientGender }) => {
    const [itemScores, setItemScores] = useState(Array(64).fill(null));
    const [useCustomDate, setUseCustomDate] = useState(false);
    const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);

    const handleScoreChange = (itemIndex, score) => {
        const newItemScores = [...itemScores];
        newItemScores[itemIndex] = score;
        setItemScores(newItemScores);
    };

    // NEU: Keyboard-Eingabe-Logik
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (['0', '1', '2', '3', '4'].includes(event.key)) {
                event.preventDefault();
                const score = parseInt(event.key, 10);
                const nextEmptyIndex = itemScores.findIndex(s => s === null);
                
                if (nextEmptyIndex !== -1) {
                    handleScoreChange(nextEmptyIndex, score);
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [itemScores]);

    const handleSave = () => {
        const answeredCount = itemScores.filter(s => s !== null).length;
        if (answeredCount < 61) {
            alert(`Bitte beantworten Sie mindestens 61 der 64 Fragen. Sie haben bisher ${answeredCount} beantwortet.`);
            return;
        }

        const scaleSums = {};
        for (const scale in IIP_SCALES) {
            scaleSums[scale] = IIP_SCALES[scale].items.reduce((sum, itemNum) => sum + (itemScores[itemNum - 1] || 0), 0);
        }

        const totalGes = Object.values(scaleSums).reduce((sum, scaleSum) => sum + scaleSum, 0);
        const meanGes = totalGes / 64;

        const ipsatizedScores = {};
        const stanineScores = {};
        const rawScores = {};

        const genderKey = patientGender === '1' ? 'male' : 'female';
        const ageGroupKey = getAgeGroup(patientAge);
        const norms = STANINE_NORMS[genderKey][ageGroupKey];

        for (const scale in IIP_SCALES) {
            ipsatizedScores[scale] = scaleSums[scale] - (meanGes * 8);
            stanineScores[scale] = calculateStanine(ipsatizedScores[scale], norms[scale]);
            rawScores[scale] = parseFloat((scaleSums[scale] / IIP_SCALES[scale].items.length).toFixed(2));
        }
        
        const totalMeanScore = parseFloat((Object.values(rawScores).reduce((a, b) => a + b, 0) / 8).toFixed(2));
        const totalStanine = calculateStanine(totalMeanScore, norms.IIPges);

        const results = {
            itemScores,
            rawScores,
            stanineScores,
            totalMeanScore,
            totalStanine
        };
        
        onSave({ results, date: new Date(testDate).toISOString() });
    };

    const inputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm";

    const renderTable = (questions, startIndex, title) => (
        <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">{title}</h3>
            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aussage</th>
                            {ANSWER_OPTIONS.map((option, index) => (
                                <th key={index} scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{option}<br/>({ANSWER_POINTS[index]})</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {questions.map((question, qIndex) => {
                            const itemIndex = startIndex + qIndex;
                            return (
                                <tr key={itemIndex} className={itemIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900">{itemIndex + 1}. {question}</td>
                                    {ANSWER_POINTS.map(pointValue => (
                                        <td key={pointValue} className="px-4 py-4 whitespace-nowrap text-center">
                                            <input
                                                type="radio"
                                                name={`iipc-item-${itemIndex}`}
                                                checked={itemScores[itemIndex] === pointValue}
                                                onChange={() => handleScoreChange(itemIndex, pointValue)}
                                                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                                            />
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {renderTable(IIP_QUESTIONS_PART1, 0, "Teil I: Es fällt mir schwer...")}
            {renderTable(IIP_QUESTIONS_PART2, 39, "Teil II: Ich tue ... zu sehr")}
            <div className="flex justify-between items-center pt-4 border-t">
                 <div className="space-y-2 p-3 bg-gray-50 rounded-md border">
                    <div className="flex items-center">
                        <input type="checkbox" id="custom-date-toggle-iipc" checked={useCustomDate} onChange={(e) => setUseCustomDate(e.target.checked)} className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"/>
                        <label htmlFor="custom-date-toggle-iipc" className="ml-2 block text-sm text-gray-900">Anderes Testdatum verwenden</label>
                    </div>
                    {useCustomDate && (
                        <div>
                            <label htmlFor="test-date-iipc" className="block text-xs font-medium text-gray-600 mb-1">Benutzerdefiniertes Testdatum</label>
                            <input type="date" id="test-date-iipc" value={testDate} onChange={(e) => setTestDate(e.target.value)} className={inputStyle}/>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex justify-end">
                <button onClick={handleSave} className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700">Ergebnisse speichern</button>
            </div>
        </div>
    );
};

const IIPC_Component = ({ patient, onDeleteResult }) => {
    const btnDanger = "bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-md flex items-center";
    const [selectedResult, setSelectedResult] = useState(patient.iipcResults?.length > 0 ? patient.iipcResults[patient.iipcResults.length - 1] : null);

    const getStanineColorClasses = (stanine) => {
        if (stanine <= 3) return 'bg-blue-100 border-blue-300';
        if (stanine >= 4 && stanine <= 6) return 'bg-green-100 border-green-300';
        if (stanine >= 7) return 'bg-red-100 border-red-300';
        return 'bg-gray-100 border-gray-300';
    };
    
    const getStanineTextColor = (stanine) => {
        if (stanine <= 3) return 'text-blue-800';
        if (stanine >= 4 && stanine <= 6) return 'text-green-800';
        if (stanine >= 7) return 'text-red-800';
        return 'text-gray-800';
    }

    const radarData = selectedResult ? Object.keys(IIP_SCALES).map(key => ({
        subject: key,
        score: selectedResult.results?.stanineScores?.[key] || 0,
        fullMark: 9
    })) : [];

    return (
        <div>
            <h4 className="text-xl font-semibold text-gray-700 mb-4">IIP-C Ergebnisse</h4>
            
            <div className="mb-6">
                <h5 className="text-md font-semibold text-gray-600 mb-2">Protokollierte Ergebnisse:</h5>
                <ul className="space-y-2">
                    {(patient.iipcResults || []).map((result, index) => (
                        <li key={result.testInstanceId || index} className={`flex justify-between items-center border p-3 rounded-md shadow-sm cursor-pointer ${selectedResult?.date === result.date ? 'bg-indigo-100 border-indigo-300' : 'bg-white'}`} onClick={() => setSelectedResult(result)}>
                            <div>
                                <span className="font-medium">{new Date(result.date).toLocaleDateString('de-DE')}</span>: 
                                <span className="text-gray-700 ml-2"> IIP Gesamt (Mittelwert): <strong>{result.results?.totalMeanScore}</strong></span>
                                <span className="text-gray-700 ml-2"> (Stanine: <strong>{result.results?.totalStanine}</strong>)</span>
                            </div>
                            {/* KORREKTUR: Übergibt die eindeutige testInstanceId anstelle des Datums */}
                            <button onClick={(e) => { e.stopPropagation(); onDeleteResult('iipc', result.testInstanceId); }} className={`${btnDanger} p-1 text-xs`}><Trash2 /></button>
                        </li>
                    ))}
                    {(patient.iipcResults || []).length === 0 && <p className="text-sm text-gray-500">Keine IIP-C Ergebnisse erfasst.</p>}
                </ul>
            </div>

            {selectedResult && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h5 className="text-md font-semibold text-gray-600 mb-3">Interpersonales Profil (Stanine-Werte vom {new Date(selectedResult.date).toLocaleDateString('de-DE')})</h5>
                        <div className="bg-white p-4 rounded-lg shadow" style={{ height: '400px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" />
                                    <PolarRadiusAxis angle={30} domain={[1, 9]} tickCount={9} />
                                    <Radar name="Profil" dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
                                    <Tooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div>
                        <h5 className="text-md font-semibold text-gray-600 mb-3">Interpretation der Skalenwerte</h5>
                        <div className="space-y-2">
                            {Object.keys(IIP_SCALES).map(key => {
                                const stanineValue = selectedResult.results?.stanineScores?.[key];
                                const colorClasses = getStanineColorClasses(stanineValue);
                                const textColor = getStanineTextColor(stanineValue);
                                return (
                                    <div key={key} className={`p-3 rounded-md border ${colorClasses}`}>
                                        <div className="flex justify-between items-baseline">
                                            <p className={`font-bold ${textColor}`}>{IIP_SCALES[key].name} ({key})</p>
                                            <p className="text-sm">
                                                <span className="font-semibold">Rohwert:</span> {selectedResult.results?.rawScores?.[key]} | <span className="font-semibold">Stanine:</span> <span className={`font-bold text-lg ${textColor}`}>{stanineValue}</span>
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">{IIP_SCALES[key].description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IIPC_Component;