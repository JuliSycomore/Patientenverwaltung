import React, { useState, useEffect } from 'react';

// HILFSFUNKTION: Formatiert ein Datum zu TTMMJJ
const formatDateAsDDMMYY = (date) => {
    if (!date) return '';
    // Stellt sicher, dass das Datum korrekt als UTC behandelt wird, um Zeitzonenprobleme zu vermeiden
    const d = new Date(date + 'T00:00:00');
    const tag = String(d.getDate()).padStart(2, '0');
    const monat = String(d.getMonth() + 1).padStart(2, '0');
    const jahr = String(d.getFullYear()).slice(2);
    return `${tag}${monat}${jahr}`;
};

// HILFSFUNKTION: Formatiert ein Datum zu TT.MM.JJJJ (wird für das obere Ausstellungsdatum verwendet)
const formatDateAsGermanString = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('de-DE');
};


const Cross = ({ className }) => (
    <div className={className} style={{ fontWeight: 'bold', fontSize: '16pt', color: 'black', lineHeight: '1' }}>
        X
    </div>
);

const ToggleButton = ({ children, isActive, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${isActive
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
    >
        {children}
    </button>
);

const Ptv1Form = ({ patient, therapistProfile }) => {
    const [formData, setFormData] = useState({
        therapieform: 'Verhaltenstherapie',
        behandlungsart: '',
        antragstyp: '',
        versichertenstatus: '1',
        arztnr: '',
        // KORREKTUR: Nutzt jetzt die neue Hilfsfunktion für konsistentes Format
        ausstellungsdatum: formatDateAsGermanString(new Date()),
        sprechstunde: null,
        // Speichert das Datum im YYYY-MM-DD Format, das von <input type="date"> benötigt wird
        sprechstundeDatum1Raw: new Date().toISOString().split('T')[0],
        sprechstundeDatum2Raw: '',
        stationaer: null,
        vergangeneBehandlung: null,
    });

    useEffect(() => {
        if (therapistProfile) {
            setFormData(prev => ({
                ...prev,
                arztnr: therapistProfile.lanr || ''
            }));
        }
    }, [patient, therapistProfile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // KORREKTUR: Alle Datumsformate für die Anzeige werden jetzt konsistent mit formatDateAsDDMMYY formatiert
    const sprechstundeDatum1Formatted = formatDateAsDDMMYY(formData.sprechstundeDatum1Raw);
    const sprechstundeDatum2Formatted = formatDateAsDDMMYY(formData.sprechstundeDatum2Raw);
    const ausstellungsdatum2Formatted = formatDateAsDDMMYY(new Date().toISOString().split('T')[0]);


    const ptv1ImageUrl = '/Pictures/ptv1-background.png';

    if (!patient) {
        return <div className="text-center text-gray-500 p-8">Bitte wählen Sie oben einen Patienten aus.</div>;
    }

    return (
        <div className="ptv-form-container bg-white p-4">
            <div className="control-panel mb-4 p-4 border rounded-lg bg-gray-50 space-y-4">
                {/* ... Dein Kontrollpanel bleibt unverändert ... */}
                <div>
                    <p className="block text-sm font-medium text-gray-700 mb-2">Art der Behandlung</p>
                    <div className="flex space-x-2">
                        <ToggleButton isActive={formData.behandlungsart === 'einzel'} onClick={() => setFormData(p => ({ ...p, behandlungsart: 'einzel' }))}>Einzeltherapie</ToggleButton>
                        <ToggleButton isActive={formData.behandlungsart === 'gruppe'} onClick={() => setFormData(p => ({ ...p, behandlungsart: 'gruppe' }))}>Gruppentherapie</ToggleButton>
                        <ToggleButton isActive={formData.behandlungsart === 'kombination'} onClick={() => setFormData(p => ({ ...p, behandlungsart: 'kombination' }))}>Kombination</ToggleButton>
                    </div>
                </div>
                <div>
                    <p className="block text-sm font-medium text-gray-700 mb-2">Antragstyp</p>
                    <div className="flex space-x-2">
                        <ToggleButton isActive={formData.antragstyp === 'erst'} onClick={() => setFormData(p => ({ ...p, antragstyp: 'erst' }))}>Erstantrag</ToggleButton>
                        <ToggleButton isActive={formData.antragstyp === 'folge'} onClick={() => setFormData(p => ({ ...p, antragstyp: 'folge' }))}>Folgeantrag</ToggleButton>
                    </div>
                </div>

                {formData.antragstyp === 'erst' && (
                    <div className="space-y-4 border-t pt-4">
                        <div>
                            <p className="block text-sm font-medium text-gray-700 mb-1">Gab es eine psychotherapeutische Sprechstunde?</p>
                            <div className="flex space-x-2">
                                <ToggleButton isActive={formData.sprechstunde === true} onClick={() => setFormData(p => ({ ...p, sprechstunde: true }))}>Ja</ToggleButton>
                                <ToggleButton isActive={formData.sprechstunde === false} onClick={() => setFormData(p => ({ ...p, sprechstunde: false }))}>Nein</ToggleButton>
                            </div>
                            {formData.sprechstunde === true && (
                                <div className="mt-2 space-y-2">
                                    <label className="block text-sm text-gray-700">Datum der 1. Sprechstunde:</label>
                                    <input type="date" value={formData.sprechstundeDatum1Raw} onChange={(e) => setFormData(p => ({ ...p, sprechstundeDatum1Raw: e.target.value }))} className="border px-2 py-1 rounded-md" />
                                    <label className="block text-sm text-gray-700">Optionales 2. Datum:</label>
                                    <input type="date" value={formData.sprechstundeDatum2Raw} onChange={(e) => setFormData(p => ({ ...p, sprechstundeDatum2Raw: e.target.value }))} className="border px-2 py-1 rounded-md" />
                                </div>
                            )}
                            {formData.sprechstunde === false && (
                                <div className="mt-2">
                                    <p className="block text-sm font-medium text-gray-700 mb-1">Gab es eine stationäre oder rehabilitative Behandlung in den letzten 12 Monaten?</p>
                                    <div className="flex space-x-2">
                                        <ToggleButton isActive={formData.stationaer === true} onClick={() => setFormData(p => ({ ...p, stationaer: true }))}>Ja</ToggleButton>
                                        <ToggleButton isActive={formData.stationaer === false} onClick={() => setFormData(p => ({ ...p, stationaer: false }))}>Nein</ToggleButton>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="block text-sm font-medium text-gray-700 mb-1">Gab es in den letzten 2 Jahren eine ambulante psychotherapeutische Behandlung?</p>
                            <div className="flex space-x-2">
                                <ToggleButton isActive={formData.vergangeneBehandlung === true} onClick={() => setFormData(p => ({ ...p, vergangeneBehandlung: true }))}>Ja</ToggleButton>
                                <ToggleButton isActive={formData.vergangeneBehandlung === false} onClick={() => setFormData(p => ({ ...p, vergangeneBehandlung: false }))}>Nein</ToggleButton>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .ptv-wrapper { position: relative; width: 794px; height: 1123px; margin: auto; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                .ptv-background { width: 100%; height: 100%; }
                .ptv-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; font-family: 'Courier New', Courier, monospace; font-size: 10pt; }
                .ptv-field { position: absolute; background: transparent; border: none; padding: 0; margin: 0; font-size: 10pt; font-family: 'Courier New', Courier, monospace; resize: none; overflow: hidden; }
                
                /* Positionierung der Felder */
                .kasse-name { top: 52px; left: 55px; width: 150px; }
                .patient-name { top: 102px; left: 55px; width: 250px; }
                .patient-geburtsdatum { top: 112px; left: 255px; width: 80px; }
                .versicherungsanschrift{ top: 258px; left: 55px; width: 120px; }
                .versichertennr { top: 162px; left: 160px; width: 150px; }
                .versichertenstatus { top: 218px; left: 420px; width: 50px; }
                .bsnr { top: 189px; left: 55px; width: 100px; }
                .arztnr { top: 189px; left: 300px; width: 100px; }
                .ausstellungsdatum { top: 189px; left: 260px; width: 80px; }
                .ausstellungsdatum2 { top: 1027px; left: 448px; width: 120px; font-size: 18pt; letter-spacing: 0.15em; }
                
                /* KORREKTUR: Positionierung für Sprechstundendaten */
                .sprechstunde-datum1 { top: 673px; left: 246px; width: 120px; font-size: 18pt; letter-spacing: 0.15em; }
                .sprechstunde-datum2 { top: 673px; left: 429px; width: 120px; font-size: 18pt; letter-spacing: 0.15em; }

                /* Positionierung der Kreuze */
                .kreuz-vt { top: 543px; left: 100px; font-size: 16pt; }
                .kreuz-art-einzel { top: 452px; left: 400px; font-size: 16pt; }
                .kreuz-art-gruppe { top: 482px; left: 400px; font-size: 16pt; }
                .kreuz-art-kombi { top: 512px; left: 400px; font-size: 16pt; }
                .kreuz-antrag-erst { top: 604px; left: 100px; font-size: 16pt; }
                .kreuz-antrag-folge { top: 604px; left: 400px; font-size: 16pt; }
                .kreuz-sprechstunde-ja { top: 680px; left: 128px; font-size: 16pt; }
                .kreuz-sprechstunde-nein { top: 712px; left: 128px; font-size: 16pt; }
                .kreuz-vergangene-behandlung { top: 865px; left: 128px; font-size: 16pt; }
                .kreuz-vergangene-behandlung2 { top: 895px; left: 128px; font-size: 16pt; }

                @media print {
                    body * { visibility: hidden; }
                    .print-area, .print-area * { visibility: visible; }
                    .print-area { position: absolute; left: 0; top: 0; width: 100%; }
                    .ptv-wrapper { box-shadow: none; margin: 0; }
                    .ptv-field, .ptv-overlay div, .ptv-overlay input { color: black !important; }
                    .control-panel { display: none; }
                }
            `}</style>

            <div className="ptv-wrapper print-area">
                <img src={ptv1ImageUrl} alt="PTV1 Formular" className="ptv-background" />
                <div className="ptv-overlay">
                    {/* Therapeutendaten */}
                    <div className="ptv-field bsnr">{therapistProfile?.bsnr}</div>
                    <input className="ptv-field arztnr" name="arztnr" value={formData.arztnr} onChange={handleChange} />

                    {/* Patientendaten */}
                    <div className="ptv-field kasse-name">{patient.krankenkasse}</div>
                    <div className="ptv-field patient-name">{patient.vorname} {patient.name}</div>
                    <div className="ptv-field patient-geburtsdatum">{formatDateAsGermanString(patient.geburtsdatum)}</div>
                    <div className="ptv-field versicherungsanschrift">{patient.versicherungsanschrift || ''}</div>
                    <div className="ptv-field versichertennr">{patient.versichertennummer}</div>
                    <input className="ptv-field versichertenstatus" name="versichertenstatus" value={formData.versichertenstatus} onChange={handleChange} />
                    <div className="ptv-field ausstellungsdatum">{formData.ausstellungsdatum}</div>
                    <div className="ptv-field ausstellungsdatum2">{ausstellungsdatum2Formatted}</div>
                    
                    {/* KORREKTUR: Die Anzeige der Datumsfelder ist an die Auswahl gekoppelt und nutzt die korrekten CSS-Klassen */}
                    {formData.sprechstunde === true && (
                        <>
                            <div className="ptv-field sprechstunde-datum1">{sprechstundeDatum1Formatted}</div>
                            <div className="ptv-field sprechstunde-datum2">{sprechstundeDatum2Formatted}</div>
                        </>
                    )}

                    {/* Kreuze basierend auf State */}
                    {formData.therapieform === 'Verhaltenstherapie' && <Cross className="ptv-field kreuz-vt" />}
                    {formData.behandlungsart === 'einzel' && <Cross className="ptv-field kreuz-art-einzel" />}
                    {formData.behandlungsart === 'gruppe' && <Cross className="ptv-field kreuz-art-gruppe" />}
                    {formData.behandlungsart === 'kombination' && <Cross className="ptv-field kreuz-art-kombi" />}
                    {formData.antragstyp === 'erst' && <Cross className="ptv-field kreuz-antrag-erst" />}
                    {formData.antragstyp === 'folge' && <Cross className="ptv-field kreuz-antrag-folge" />}
                    {formData.sprechstunde === true && <Cross className="ptv-field kreuz-sprechstunde-ja" />}
                    {formData.sprechstunde === false && <Cross className="ptv-field kreuz-sprechstunde-nein" />}
                    {formData.vergangeneBehandlung === true && <Cross className="ptv-field kreuz-vergangene-behandlung" />}
                    {formData.vergangeneBehandlung === false && <Cross className="ptv-field kreuz-vergangene-behandlung2" />}
                </div>
            </div>
        </div>
    );
};

export default Ptv1Form;