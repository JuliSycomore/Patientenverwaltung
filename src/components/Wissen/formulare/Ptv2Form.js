import React, { useState } from 'react';

const Ptv2Form = ({ patient, therapistProfile, onGenerate }) => {
    const [formData, setFormData] = useState({
        ausstellungsdatum: new Date().toLocaleDateString('de-DE'),
        gutachtenDatum: '',
        anzahlEinheiten: '',
        ebmGop: '',
        letzteDiagnose: '',
        therapieform: 'VT',
        behandlungsart: 'Einzeltherapie',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const ptv2ImageUrl = '/Pictures/ptv2-background.png'; 

    if (!patient) {
        return <div className="text-center text-gray-500 p-8">Bitte wählen Sie oben einen Patienten aus, um das Formular zu laden.</div>;
    }

    return (
        <div className="ptv-form-container bg-white p-4">
            <style>{`
                .ptv-form-wrapper {
                    position: relative;
                    width: 794px;
                    height: 1123px;
                    margin: auto;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    page-break-after: always;
                }
                .ptv-background {
                    width: 100%;
                    height: 100%;
                }
                .ptv-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 10pt;
                }
                .ptv-field {
                    position: absolute;
                    background-color: transparent;
                    border: none;
                    padding: 0;
                    margin: 0;
                    resize: none;
                    overflow: hidden;
                }
                .patient-geburtsdatum { top: 85px; left: 460px; width: 100px; }
                .patient-chiffre { top: 60px; left: 90px; width: 150px; }
                .ausstellungsdatum { top: 120px; left: 460px; width: 100px; }
                .gutachten-datum { top: 150px; left: 460px; width: 100px; }
                .einheiten { top: 250px; left: 180px; width: 80px; }
                .ebm-gop { top: 250px; left: 290px; width: 100px; }
                .letzte-diagnose { top: 610px; left: 80px; width: 630px; height: 50px; }

                @media print {
                    body * { visibility: hidden; }
                    .print-area, .print-area * { visibility: visible; }
                    .print-area { position: absolute; left: 0; top: 0; width: 100%; }
                    .ptv-form-wrapper { box-shadow: none; margin: 0; }
                    textarea.ptv-field, input.ptv-field { color: black !important; }
                }
            `}</style>

            <div className="ptv-form-wrapper print-area">
                <img src={ptv2ImageUrl} alt="PTV2 Formular" className="ptv-background" />
                <div className="ptv-overlay">
                    <div className="ptv-field patient-chiffre">{patient.chiffre}</div>
                    <div className="ptv-field patient-geburtsdatum">{new Date(patient.geburtsdatum).toLocaleDateString('de-DE')}</div>
                    <div className="ptv-field ausstellungsdatum">{formData.ausstellungsdatum}</div>
                    <input className="ptv-field gutachten-datum" name="gutachtenDatum" value={formData.gutachtenDatum} onChange={handleChange} />
                    <input className="ptv-field einheiten" name="anzahlEinheiten" value={formData.anzahlEinheiten} onChange={handleChange} />
                    <input className="ptv-field ebm-gop" name="ebmGop" value={formData.ebmGop} onChange={handleChange} />
                    <textarea className="ptv-field letzte-diagnose" name="letzteDiagnose" value={formData.letzteDiagnose} onChange={handleChange} />
                </div>
            </div>
            <div className="flex justify-end mt-6">
                <button onClick={() => onGenerate({ ...formData, patientDaten: patient })} className="px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 font-semibold">
                    Formular generieren
                </button>
            </div>
        </div>
    );
};

export default Ptv2Form;