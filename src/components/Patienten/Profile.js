import React, { useState, useEffect } from 'react';

// Icons
const SaveIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>;
const UploadIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;


const Profile = ({ initialProfile, onSave, onUploadFile, isUploading }) => {
    const [profile, setProfile] = useState(initialProfile || {});

    useEffect(() => {
        setProfile(initialProfile || {});
    }, [initialProfile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (e) => {
        const { name, files } = e.target;
        if (files.length === 0) return;
        const file = files[0];
        try {
            const downloadURL = await onUploadFile(file, `profile/${name}`);
            setProfile(prev => ({ ...prev, [name]: downloadURL }));
        } catch (error) {
            console.error(`Error uploading ${name}:`, error);
            // Optionally: show an error message to the user
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(profile);
    };

    const inputStd = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm";
    const btnPrimary = "px-6 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 flex items-center justify-center shadow-sm";

    return (
        <div className="w-full max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Profil & Praxiseinstellungen</h2>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md border border-gray-200 space-y-8">
                
                {/* Persönliche Angaben */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Persönliche Angaben</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-sm font-medium text-gray-700">Titel</label><input type="text" name="title" value={profile.title || ''} onChange={handleChange} className={inputStd} placeholder="z.B. Dr. med." /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Berufsbezeichnung</label><input type="text" name="jobTitle" value={profile.jobTitle || ''} onChange={handleChange} className={inputStd} placeholder="z.B. Psychologischer Psychotherapeut" /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Vorname</label><input type="text" name="firstName" value={profile.firstName || ''} onChange={handleChange} className={inputStd} /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Nachname</label><input type="text" name="lastName" value={profile.lastName || ''} onChange={handleChange} className={inputStd} /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Approbationsdatum</label><input type="date" name="approbationDate" value={profile.approbationDate || ''} onChange={handleChange} className={inputStd} /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Fachkundenachweis</label><input type="text" name="specialization" value={profile.specialization || ''} onChange={handleChange} className={inputStd} placeholder="z.B. Verhaltenstherapie" /></div>
                        <div><label className="block text-sm font-medium text-gray-700">E-Mail-Adresse</label><input type="email" name="email" value={profile.email || ''} onChange={handleChange} className={inputStd} /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Telefonnummer (Praxis)</label><input type="tel" name="phone" value={profile.phone || ''} onChange={handleChange} className={inputStd} /></div>
                    </div>
                </div>

                {/* Praxisbezogene Daten */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Praxisbezogene Daten</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-sm font-medium text-gray-700">Name der Praxis</label><input type="text" name="practiceName" value={profile.practiceName || ''} onChange={handleChange} className={inputStd} /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Betriebsstättennummer (BSNR)</label><input type="text" name="bsnr" value={profile.bsnr || ''} onChange={handleChange} className={inputStd} /></div>
                        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">Adresse der Praxis</label><input type="text" name="practiceAddress" value={profile.practiceAddress || ''} onChange={handleChange} className={inputStd} placeholder="Straße, PLZ, Ort" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
                        {/* Logo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Logo der Praxis</label>
                            <div className="mt-2 flex items-center gap-4">
                                <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center border">
                                    {profile.logoUrl ? <img src={profile.logoUrl} alt="Praxis-Logo" className="h-full w-full object-contain rounded-md" /> : <span className="text-xs text-gray-500">Vorschau</span>}
                                </div>
                                <label htmlFor="logo-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 flex items-center">
                                    <UploadIcon className="w-4 h-4 mr-2" /> Datei auswählen
                                    <input id="logo-upload" name="logoUrl" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg" />
                                </label>
                            </div>
                        </div>
                        {/* Signature Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Unterschrift</label>
                             <div className="mt-2 flex items-center gap-4">
                                <div className="w-36 h-24 bg-gray-100 rounded-md flex items-center justify-center border p-2">
                                    {profile.signatureUrl ? <img src={profile.signatureUrl} alt="Unterschrift" className="h-full w-full object-contain" /> : <span className="text-xs text-gray-500">Vorschau</span>}
                                </div>
                                <label htmlFor="signature-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 flex items-center">
                                    <UploadIcon className="w-4 h-4 mr-2" /> Datei auswählen
                                    <input id="signature-upload" name="signatureUrl" type="file" className="sr-only" onChange={handleFileChange} accept="image/png" />
                                </label>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Tipp: PNG mit transparentem Hintergrund verwenden.</p>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={isUploading} className={`${btnPrimary} disabled:bg-gray-400`}>
                        {isUploading ? 'Lädt hoch...' : <><SaveIcon className="mr-2" /> Änderungen speichern</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;
