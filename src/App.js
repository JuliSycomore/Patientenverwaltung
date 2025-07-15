import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, getDocs, setDoc, deleteDoc, onSnapshot, query, writeBatch, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// Components
import SCL90RComponent from './components/Wissen/psychodiagnostic/SCL90R.js';
import FEP2Component from './components/Wissen/psychodiagnostic/FEP2.js';
import BDI2Component from './components/Wissen/psychodiagnostic/BDI2.js';
import HSCL11Component from './components/Wissen/psychodiagnostic/HSCL11.js';
import GAD7Component from './components/Wissen/psychodiagnostic/GAD7.js';
import CoreOmComponent from './components/Wissen/psychodiagnostic/CoreOm.js';
import IIPCComponent from './components/Wissen/psychodiagnostic/IIP-C.js';
import ICD11ECTBrowser from './components/Wissen/ICD11ECTBrowser.js';
import EBMBrowser from './components/Abrechnung/EBMBrowser.js';
import BillingModal from './components/Abrechnung/SitzungsAbrechnung.js';
import AbrechnungsUebersicht from './components/Abrechnung/Abrechnung.js';
import DiagnostikZuordnung from './components/Diagnostik/DiagnostikZuordnung.js';
import ManualBillingSetupModal from './components/Abrechnung/ManualSessionCreate.js';
import AddBillingPeriodModal from './components/Abrechnung/AddBillingPeriodModal.js';
import Profile from './components/Patienten/Profile.js';
import Billing from './components/Abrechnung/OffeneSitzungenAbrechnung.js';
import PtvFormGenerator from './components/Wissen/formulare/PtvFormGenerator.js';
import Behandlungsmethoden from './components/Wissen/Behandlungsmethoden.js';
import EbmTemplates from './components/Abrechnung/EbmTemplates.js';
import DiagnostikHauptseite from './components/Diagnostik/DiagnostikHauptseite.js';
import ZentraleTestErfassungModal from './components/Diagnostik/ZentraleTestErfassungModal.js';
import AddTestTemplateModal from './components/Diagnostik/AddTestTemplateModal.js';
import AddOrEditTemplateModal from './components/Diagnostik/AddOrEditTemplateModal.js';
import Dashboard from './components/Patienten/Dashboard.js';


// --- ICONS ---
const UserPlus = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>);
const Edit3 = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>);
const Trash2 = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>);
const PlusCircleIcon = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>);
const XCircle = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>);
const Save = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>);
const AlertTriangle = ({ className = "w-12 h-12" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);
const FileJson2 = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" /><path d="M14 2v6h6" /><path d="M4 12h1.6a2 2 0 0 0 1.9-3.4L6 6" /><path d="M4 18h1.6a2 2 0 0 1 1.9 3.4L6 24" /><path d="M12 12h1.6a2 2 0 0 1 1.9-3.4L14 6" /><path d="M12 18h1.6a2 2 0 0 0 1.9 3.4L14 24" /></svg>);
const WandSparkles = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9.5 2.55 1.294 1.294a1 1 0 0 0 1.414 0L13.5 2.55" /><path d="M4.94 4.94 6.22 6.22a1 1 0 0 0 1.41 0l1.29-1.29" /><path d="M2.55 9.51 3.84 10.8a1 1 0 0 0 1.41 0l1.3-1.29" /><path d="m19.07 4.93-1.29 1.29a1 1 0 0 1-1.41 0l-1.29-1.29" /><path d="M21.45 9.51l-1.29 1.29a1 1 0 0 1-1.41 0l-1.3-1.29" /><path d="M14.5 12.94a1 1 0 0 0 0 1.41l1.29 1.29" /><path d="M10.8 17.78a1 1 0 0 0 0 1.41l1.29 1.29" /><path d="M17.78 10.8a1 1 0 0 0 0 1.41l1.29 1.29" /><path d="M12 10.5V4.5" /><path d="M12 10.5C7 11 4 15 4 20" /><path d="M12 10.5c5 .5 8 4.5 8 9.5" /></svg>);
const LogOut = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>);
const BookOpen = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>);
const Users = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>);
const FileText = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>);
const List = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" /><line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" /></svg>);
const CalendarIcon = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const PaperclipIcon = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.59a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>);
const SettingsIcon = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>);
const DollarSignIcon = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>);
const LayoutGridIcon = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>);
const LayersIcon = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>);
const ClipboardListIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" /></svg>
const BeakerIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4.5 3h15"/><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"/><path d="M6 14h12"/></svg>;
const HomeIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;


// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyDZ_qqqKW7WDCZ9botek2VBwXNMQO3JYwU",
    authDomain: "psychotherapie0512.firebaseapp.com",
    projectId: "psychotherapie0512",
    storageBucket: "psychotherapie0512.appspot.com",
    messagingSenderId: "131279046361",
    appId: "1:131279046361:web:e5dd2d18b206fb820b60c8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const firestoreAppId = 'default-patient-app-v5';

// --- KONSTANTEN ---
const homeworkFailureReasons = { "Motivational": ["Geringe Motivation", "Zweifel am Nutzen der Hausaufgabe", "Keine Einsicht in die Relevanz"], "Emotional": ["Angst vor Versagen", "Scham oder Schuldgefühle", "Vermeidung unangenehmer Gefühle"], "Kognitive": ["Negative automatische Gedanken", "Perfektionismus"], "Organisatorisch/Praktisch": ["Zeitmangel", "Vergessen", "Keine klaren Anweisungen oder Verständnisprobleme"], "Interaktion mit Therapeut": ["Widerstand gegen den Therapeuten", "Beziehungskonflikte", "Mangel an Vertrauen"], "Psychopathologisch": ["Konzentrationsprobleme", "Antriebslosigkeit", "Überwältigende Symptome"] };
const availableTests = [
    { id: 'scl90r', name: 'SCL-90-R - Symptom-Checklist-90-R', ebm: '35601', recommendation: 10 },
    { id: 'fep2', name: 'FEP-2 - Fragebogen zur Erfassung von Persönlichkeitsstörungen', ebm: '35601', recommendation: 12 },
    { id: 'bdi2', name: 'BDI-II - Beck-Depressions-Inventar II', ebm: '35600', recommendation: 2 },
    { id: 'hscl11', name: 'HSCL-11 - Hopkins Symptom Checklist-11', ebm: '35600', recommendation: 1 },
    { id: 'gad7', name: 'GAD-7 - Generalisierte Angststörung Skala', ebm: '35600', recommendation: 1 },
    { id: 'coreOm', name: 'CORE-OM - Clinical Outcomes in Routine Evaluation', ebm: '35601', recommendation: 8 },
    { id: 'iipc', name: 'IIP-C - Inventar Interpersonaler Probleme', ebm: '35601', recommendation: 15 },
];

const testCategories = [
  { name: 'Allgemeine Psychopathologie', tests: ['scl90r', 'hscl11', 'coreOm'] },
  { name: 'Depressionsdiagnostik', tests: ['bdi2'] },
  { name: 'Angstdiagnostik', tests: ['gad7'] },
  { name: 'Persönlichkeitsdiagnostik', tests: ['fep2'] },
  { name: 'Interpersonelle Probleme', tests: ['iipc'] }
];

const availableTherapeuticMethods = ["Kognitive Verhaltenstherapie (KVT)", "Schematherapie", "Acceptance and Commitment Therapy (ACT)", "Dialektisch-Behaviorale Therapie (DBT)", "Eye Movement Desensitization and Reprocessing (EMDR)", "Tiefenpsychologisch fundierte Psychotherapie", "Systemische Therapie"];
const initialPatientsData = [{ name: "Mustermann", geburtsdatum: "1998-04-04", chiffre: "M040498", therapeuticMethods: ["Kognitive Verhaltenstherapie (KVT)"], approvedHours: 60, krankenkasse: "TK", versichertennummer: "A123456789", diagnoses: ["[G] F00.0*: Demenz bei Alzheimer-Krankheit, mit frühem Beginn (Typ 2)", "[V] F01.1: Multiinfarkt-Demenz", "[A] F20.0: Paranoide Schizophrenie", "[ZN] F32.1: Mittelgradige depressive Episode", "F40.0: Agoraphobie"], sessions: [{ id: `sess_${Date.now()}`, date: "2025-05-20", structuredNotes: { sitzungsnummer: 1, thema: "Erste Sitzung", patientenbericht: "Exploration der Hauptbeschwerden." } }], hscl11Results: [], bdi2Results: [], fep2Results: [], scl90rResults: [], gad7Results: [], coreOmResults: [], iipcResults: [], billingPeriods: [], krankheitsanamnese: "Patient berichtet über seit ca. 2 Jahren zunehmende Vergesslichkeit und Orientierungsprobleme.", lebensgeschichte: "Geboren 1955, verheiratet, 2 Kinder, früher als Buchhalter tätig.", problemanalyseMakro: "Kognitive Defizite im Vordergrund, affektive Belastung durch erlebten Kontrollverlust.", therapieplan: "Supportive Gespräche, kognitives Training, Psychoedukation für Angehörige." },];
const DIAGNOSTIK_PUNKTE = { '35600': 34, '35601': 39, '35602': 56, };

// --- HILFSFUNKTIONEN & HOOKS ---

const getQuarter = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const month = d.getMonth();
    const year = d.getFullYear();
    const quarter = Math.floor(month / 3) + 1;
    return `${year}-Q${quarter}`;
};

const useQuarterlyDiagnostikAnalysis = (patient, availableTests) => {
    return useMemo(() => {
        if (!patient) return {};

        const testsByQuarter = {};

        availableTests.forEach(testDef => {
            const results = patient[`${testDef.id}Results`] || [];
            results.forEach(result => {
                if (result.status === 'completed') {
                    const quarterKey = getQuarter(result.date);
                    if (!quarterKey) return;

                    if (!testsByQuarter[quarterKey]) {
                        testsByQuarter[quarterKey] = [];
                    }
                    testsByQuarter[quarterKey].push({
                        ...testDef,
                        ...result
                    });
                }
            });
        });

        const analysis = {};
        const age = calculateAge(patient.geburtsdatum);
        const pointsLimit = age < 22 ? 1636 : 1092;

        for (const quarterKey in testsByQuarter) {
            const testsInQuarter = testsByQuarter[quarterKey];
            const pointsUsed = testsInQuarter.reduce((sum, test) => sum + (DIAGNOSTIK_PUNKTE[test.ebm] || 0), 0);
            
            analysis[quarterKey] = {
                pointsUsed,
                pointsLimit,
                tests: testsInQuarter,
            };
        }

        return analysis;
    }, [patient, availableTests]);
};

const Modal = ({ isOpen, onClose, title, children, size = "lg" }) => { if (!isOpen) return null; const sizeClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-2xl', '3xl': 'max-w-3xl', '4xl': 'max-w-4xl', '5xl': 'max-w-5xl' }; return (<div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4"><div className={`bg-white p-6 rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}><div className="flex justify-between items-center mb-4"><h2 className="text-xl font-semibold text-gray-800">{title}</h2><button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle className="w-7 h-7" /></button></div>{children}</div></div>); };
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => { if (!isOpen) return null; return (<Modal isOpen={isOpen} onClose={onClose} title={title} size="md"><div className="text-center"><AlertTriangle className="mx-auto mb-4 w-12 h-12 text-red-500" /><p className="text-gray-600 mb-6">{message}</p><div className="flex justify-center space-x-4"><button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none">Abbrechen</button><button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none">Bestätigen</button></div></div></Modal>); }; const PatientForm = ({ patient, onSave, onCancel }) => {
    const [formData, setFormData] = useState(
        patient || {
            name: '',
            vorname: '',
            chiffre: '',
            geburtsdatum: '',
            adresse: '',
            email: '',
            telefon: '',
            krankenkasse: '',
            versichertennummer: '',
            therapeuticMethods: [],
            approvedHours: 0,
            diagnoses: [],
            sessions: [],
            hscl11Results: [],
            bdi2Results: [],
            fep2Results: [],
            scl90rResults: [],
            gad7Results: [],
            coreOmResults: [],
            iipcResults: [],
            billingPeriods: [],
            krankheitsanamnese: "",
            lebensgeschichte: "",
            problemanalyseMakro: "",
            therapieplan: ""
        }
    );

    const [newMethod, setNewMethod] = useState("");

    useEffect(() => {
        if (patient) {
            setFormData({
                ...patient,
                geburtsdatum: patient.geburtsdatum || '',
                krankenkasse: patient.krankenkasse || '',
                versichertennummer: patient.versichertennummer || '',
                therapeuticMethods: patient.therapeuticMethods || [],
                hscl11Results: patient.hscl11Results || [],
                bdi2Results: patient.bdi2Results || [],
                fep2Results: patient.fep2Results || [],
                scl90rResults: patient.scl90rResults || [],
                gad7Results: patient.gad7Results || [],
                coreOmResults: patient.coreOmResults || [],
                iipcResults: patient.iipcResults || [],
                billingPeriods: patient.billingPeriods || [],
                krankheitsanamnese: patient.krankheitsanamnese || "",
                lebensgeschichte: patient.lebensgeschichte || "",
                problemanalyseMakro: patient.problemanalyseMakro || "",
                therapieplan: patient.therapieplan || ""
            });
        } else {
            setFormData({ name: '', vorname: '', chiffre: '', geburtsdatum: '', adresse: '', email: '', telefon: '', krankenkasse: '', versichertennummer: '', therapeuticMethods: [], approvedHours: 0, diagnoses: [], sessions: [], hscl11Results: [], bdi2Results: [], fep2Results: [], scl90rResults: [], gad7Results: [], coreOmResults: [], iipcResults: [], billingPeriods: [], krankheitsanamnese: "", lebensgeschichte: "", problemanalyseMakro: "", therapieplan: "" });
        }
    }, [patient]);

    useEffect(() => {
        const { name, geburtsdatum } = formData;
        if (name && geburtsdatum) {
            try {
                const firstLetter = name.charAt(0).toUpperCase();
                const [year, month, day] = geburtsdatum.split('-');
                if (year && month && day) { const yy = year.slice(-2); const newChiffre = `${firstLetter}${day}${month}${yy}`; setFormData(prev => ({ ...prev, chiffre: newChiffre })); }
            } catch (e) { console.error("Fehler bei der Chiffre-Generierung", e); setFormData(prev => ({ ...prev, chiffre: '' })); }
        } else { if (formData.chiffre !== '') { setFormData(prev => ({ ...prev, chiffre: '' })); } }
    }, [formData]);

    const handleChange = (e) => { const { name, value, type } = e.target; setFormData((prev) => ({ ...prev, [name]: type === 'number' ? parseInt(value, 10) || 0 : value })); };
    const handleAddMethod = () => { if (newMethod && !formData.therapeuticMethods.includes(newMethod)) { setFormData(prev => ({ ...prev, therapeuticMethods: [...prev.therapeuticMethods, newMethod] })); setNewMethod(""); } };
    const handleRemoveMethod = (methodToRemove) => { setFormData(prev => ({ ...prev, therapeuticMethods: prev.therapeuticMethods.filter(m => m !== methodToRemove) })); };
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

    const inputStd = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm";
    const btnPrimary = "px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 flex items-center";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor="vorname" className="block text-sm font-medium text-gray-700">Vorname</label><input type="text" name="vorname" id="vorname" value={formData.vorname} onChange={handleChange} required className={inputStd} /></div>
                <div><label htmlFor="name" className="block text-sm font-medium text-gray-700">Nachname</label><input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputStd} /></div>
                <div><label htmlFor="geburtsdatum" className="block text-sm font-medium text-gray-700">Geburtsdatum</label><input type="date" name="geburtsdatum" id="geburtsdatum" value={formData.geburtsdatum} onChange={handleChange} required className={inputStd} /></div>
                <div><label htmlFor="chiffre" className="block text-sm font-medium text-gray-700">Chiffre</label><input type="text" name="chiffre" id="chiffre" value={formData.chiffre} readOnly className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm" /></div>
            </div>
            <div><label htmlFor="adresse" className="block text-sm font-medium text-gray-700">Adresse</label><input type="text" name="adresse" id="adresse" value={formData.adresse} onChange={handleChange} className={inputStd} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor="email" className="block text-sm font-medium text-gray-700">E-Mail</label><input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className={inputStd} /></div>
                <div><label htmlFor="telefon" className="block text-sm font-medium text-gray-700">Telefon</label><input type="tel" name="telefon" id="telefon" value={formData.telefon} onChange={handleChange} className={inputStd} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor="krankenkasse" className="block text-sm font-medium text-gray-700">Krankenkasse</label><input type="text" name="krankenkasse" id="krankenkasse" value={formData.krankenkasse} onChange={handleChange} className={inputStd} /></div>
                <div><label htmlFor="versichertennummer" className="block text-sm font-medium text-gray-700">Versichertennummer</label><input type="text" name="versichertennummer" id="versichertennummer" value={formData.versichertennummer} onChange={handleChange} className={inputStd} /></div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Therapieverfahren</label>
                <div className="mt-1 flex flex-wrap gap-2">{(formData.therapeuticMethods || []).map(method => (<span key={method} className="flex items-center bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{method}<button type="button" onClick={() => handleRemoveMethod(method)} className="ml-1.5 text-teal-500 hover:text-teal-700"><XCircle className="h-3 w-3" /></button></span>))}</div>
                <div className="mt-2 flex items-center gap-2">
                    <select value={newMethod} onChange={(e) => setNewMethod(e.target.value)} className={inputStd}><option value="">Verfahren auswählen...</option>{availableTherapeuticMethods.filter(m => !(formData.therapeuticMethods || []).includes(m)).map(m => <option key={m} value={m}>{m}</option>)}</select>
                    <button type="button" onClick={handleAddMethod} className="bg-gray-200 p-2 rounded-md hover:bg-gray-300"><PlusCircleIcon className="h-5 w-5 text-gray-600" /></button>
                </div>
            </div>
            <div><label htmlFor="approvedHours" className="block text-sm font-medium text-gray-700">Genehmigte Stunden</label><input type="number" name="approvedHours" id="approvedHours" value={formData.approvedHours} onChange={handleChange} min="0" className={inputStd} /></div>
            <div className="flex justify-end space-x-3 pt-4"><button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Abbrechen</button><button type="submit" className={btnPrimary}><Save className="w-4 h-4 mr-2" /> Speichern</button></div>
        </form>
    );
};
async function generateGeminiText(prompt) { let chatHistory = [{ role: "user", parts: [{ text: prompt }] }]; const payload = { contents: chatHistory }; const GEMINI_API_KEY = "AIzaSyCWQFze_8cKDZ6W2DTqfqIcvhcsKWfuZLw"; const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`; try { const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!response.ok) { const errorData = await response.json(); console.error("Gemini API error details:", errorData); const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`; throw new Error(errorMessage); } const result = await response.json(); if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) { return result.candidates[0].content.parts[0].text; } else if (result.candidates && result.candidates.length > 0 && result.candidates[0].finishReason === "SAFETY") { console.warn("Gemini API response blocked due to safety reasons."); return "Die Antwort wurde aufgrund von Sicherheitsrichtlinien blockiert."; } else { console.error("Unexpected Gemini API response structure:", result); throw new Error("Unerwartete Antwortstruktur von der API."); } } catch (error) { console.error("Error calling Gemini API:", error); throw error; } }
const calculateAge = (birthdate) => { if (!birthdate) return 0; const birthDate = new Date(birthdate); const today = new Date(); let age = today.getFullYear() - birthDate.getFullYear(); const m = today.getMonth() - birthDate.getMonth(); if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; } return age; };

const PatientOverviewTab = ({ patient, nextAppointment, onUpdateHomeworkStatus, onUpdateQuickNote }) => {
    // *** KORREKTUR: Hook an den Anfang verschoben ***
    const openHomeworkSession = useMemo(() => {
        // Optional Chaining `?.` stellt sicher, dass kein Fehler auftritt, wenn `patient` null ist
        if (!patient?.sessions) return null;
        // Die Sitzungen sind bereits absteigend sortiert
        return patient.sessions.find(s => s.homeworkStatus && s.homeworkStatus.some(task => !task.done));
    }, [patient?.sessions]);

    // *** KORREKTUR: Bedingter Return NACH allen Hooks ***
    if (!patient) return null;
    
    const reasonCategoryColors = {
        Motivational: "bg-orange-100 text-orange-800",
        Emotional: "bg-blue-100 text-blue-800",
        Kognitive: "bg-purple-100 text-purple-800",
        "Organisatorisch/Praktisch": "bg-gray-200 text-gray-800",
        "Interaktion mit Therapeut": "bg-pink-100 text-pink-800",
        Psychopathologisch: "bg-red-100 text-red-800",
    };

    const getCategoryForReason = (reason) => {
        for (const category in homeworkFailureReasons) {
            if (homeworkFailureReasons[category].includes(reason)) {
                return category;
            }
        }
        return null;
    };

    return (
        <div className="space-y-6">
            <div className="col-span-1 md:col-span-2 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                {nextAppointment.isLoading && <p className="text-sm text-teal-700">Lade nächsten Termin...</p>}
                {nextAppointment.error && <p className="text-sm text-red-600">{nextAppointment.error}</p>}
                {nextAppointment.text && <p className="text-sm font-semibold text-teal-800">{nextAppointment.text}</p>}
            </div>

            <div>
                 <label htmlFor="quick-note" className="text-sm font-semibold text-gray-700">Kurznotiz</label>
                 <textarea
                    id="quick-note"
                    rows="3"
                    className="mt-1 block w-full text-sm p-2 rounded-md border-red-200 bg-red-50/50 focus:ring-red-500 focus:border-red-500 placeholder-red-400/70"
                    placeholder="Wichtige Gedanken, nächste Schritte, etc..."
                    defaultValue={patient.quickNote || ''}
                    onBlur={(e) => onUpdateQuickNote(e.target.value)}
                 />
            </div>

            <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Stammdaten</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3 text-sm">
                    <div><p className="font-semibold text-gray-500">Nachname</p><p>{patient.name}</p></div>
                    <div><p className="font-semibold text-gray-500">Vorname</p><p>{patient.vorname}</p></div>
                    <div><p className="font-semibold text-gray-500">Geburtsdatum</p><p>{new Date(patient.geburtsdatum).toLocaleDateString('de-DE')}</p></div>
                    <div><p className="font-semibold text-gray-500">Alter</p><p>{calculateAge(patient.geburtsdatum)}</p></div>
                    <div><p className="font-semibold text-gray-500">E-Mail</p><p>{patient.email || '-'}</p></div>
                    <div><p className="font-semibold text-gray-500">Telefon</p><p>{patient.telefon || '-'}</p></div>
                    <div className="col-span-2 md:col-span-3"><p className="font-semibold text-gray-500">Adresse</p><p>{patient.adresse || '-'}</p></div>
                </div>
            </div>
            <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Offene Hausaufgaben</h4>
                <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-3">
                    {openHomeworkSession ? (
                        openHomeworkSession.homeworkStatus.map((task, index) => (
                            <div key={index} className="flex items-start gap-4">
                                <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 mt-0.5" checked={task.done} onChange={(e) => onUpdateHomeworkStatus(openHomeworkSession.id, index, { done: e.target.checked })} />
                                <div className="flex-grow">
                                    <span className={` ${task.done ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{task.text}</span>
                                    {!task.done && (
                                        <div className="flex items-center gap-2 mt-1">
                                             <select className="text-xs border-gray-300 rounded-md shadow-sm focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50" value={task.reason || ''} onChange={(e) => onUpdateHomeworkStatus(openHomeworkSession.id, index, { reason: e.target.value })}>
                                                <option value="">Grund wählen...</option>
                                                {Object.entries(homeworkFailureReasons).map(([category, reasons]) => (
                                                    <optgroup label={category} key={category}>
                                                        {reasons.map(reason => <option key={reason} value={reason}>{reason}</option>)}
                                                    </optgroup>
                                                ))}
                                            </select>
                                            {task.reason && (
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${reasonCategoryColors[getCategoryForReason(task.reason)] || 'bg-gray-200'}`}>
                                                    {getCategoryForReason(task.reason)}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">Alle Hausaufgaben sind erledigt. Sehr gut!</p>
                    )}
                </div>
            </div>
        </div>
    );
};


function App() {
    // --- States ---
    const [mainView, setMainView] = useState('dashboard'); // *** GEÄNDERT: Startansicht ist jetzt das Dashboard ***
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [authError, setAuthError] = useState(null);
    const [appError, setAppError] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoginView, setIsLoginView] = useState(true);
    const [isAuthLoading, setIsAuthLoading] = useState(false);
    const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState(null);
    const [newDiagnosis, setNewDiagnosis] = useState('');
    const [newDiagnosisCode, setNewDiagnosisCode] = useState('');
    const [newDiagnosisSicherheit, setNewDiagnosisSicherheit] = useState('G');
    const [lookedUpDiagnosisName, setLookedUpDiagnosisName] = useState('');
    const [activeDetailTab, setActiveDetailTab] = useState('übersicht');
    const [activeDiagnostikSubTab, setActiveDiagnostikSubTab] = useState('overview');
    const [diagnosisInfo, setDiagnosisInfo] = useState({ code: '', name: '', beschreibung: '', inkl: [], exkl: [], hinweise: [], zusatz_info_code: '', sicherheit: '', isLoading: false, error: null, isOpen: false, source: '' });
    const [localIcd10Data, setLocalIcd10Data] = useState({});
    const [editableKrankheitsanamnese, setEditableKrankheitsanamnese] = useState("");
    const [editableLebensgeschichte, setEditableLebensgeschichte] = useState("");
    const [editableProblemanalyseMakro, setEditableProblemanalyseMakro] = useState("");
    const [editableTherapieplan, setEditableTherapieplan] = useState("");
    const [therapeutischeAssistenzOutput, setTherapeutischeAssistenzOutput] = useState("");
    const [isLoadingTherapeutischeAssistenz, setIsLoadingTherapeutischeAssistenz] = useState(false);
    const [assistenzError, setAssistenzError] = useState(null);
    const detailViewRef = useRef(null);
    const [improvementState, setImprovementState] = useState({ isOpen: false, isLoading: false, originalText: '', improvedText: '', sessionIndex: null, error: null });
    const [sortConfig] = useState({ key: 'name', direction: 'ascending' });
    const [nextAppointment, setNextAppointment] = useState({ isLoading: false, text: null, error: null });
    const [unbilledAppointments, setUnbilledAppointments] = useState([]);
    const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
    const [billingModalState, setBillingModalState] = useState({ isOpen: false, event: null, isEditing: false });
    const [ebmData, setEbmData] = useState([]);
    const [isManualBillingSetupOpen, setIsManualBillingSetupOpen] = useState(false);
    const [confirmDeleteState, setConfirmDeleteState] = useState({ isOpen: false, onConfirm: null, message: '', title: '' });
    const [profile, setProfile] = useState({});
    const [isUploading, setIsUploading] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [isCalendarLoading, setIsCalendarLoading] = useState(false);
    const [viewMode, setViewMode] = useState('stack');
    const [isAddBillingPeriodModalOpen, setIsAddBillingPeriodModalOpen] = useState(false);
    const [ebmTemplates, setEbmTemplates] = useState([]);
    const [isZentraleTestModalOpen, setIsZentraleTestModalOpen] = useState(false);
    const [currentTestToErfassen, setCurrentTestToErfassen] = useState(null);
    const [testToUpdate, setTestToUpdate] = useState(null);

    const [diagnostikTemplates, setDiagnostikTemplates] = useState([]);
    const [isAddTemplateModalOpen, setIsAddTemplateModalOpen] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState(null);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [isTemplateEditModalOpen, setTemplateEditModalOpen] = useState(false);


    const quarterlyDiagnostikAnalysis = useQuarterlyDiagnostikAnalysis(selectedPatient, availableTests);
    const sortedPatients = useMemo(() => { let sortablePatients = [...patients]; if (sortConfig !== null) { sortablePatients.sort((a, b) => { const valA = a[sortConfig.key] || ''; const valB = b[sortConfig.key] || ''; if (valA < valB) { return sortConfig.direction === 'ascending' ? -1 : 1; } if (valA > valB) { return sortConfig.direction === 'ascending' ? 1 : -1; } return 0; }); } return sortablePatients; }, [patients, sortConfig]);

    const handlePatientSelectPreview = (patient) => {
        if (selectedId === patient.id) {
            setSelectedId(null);
            setSelectedPatient(null);
        } else {
            setSelectedPatient(patient);
            setSelectedId(patient.id);
        }
    };

    const handlePatientDoubleClick = (patient) => {
        setSelectedPatient(patient);
    };

    const getHighestSessionNumber = (sessions) => { if (!sessions) return 0; const sessionNumbers = sessions.map(s => s.structuredNotes?.sitzungsnummer).filter(n => typeof n === 'number' && !isNaN(n)); return sessionNumbers.length > 0 ? Math.max(...sessionNumbers) : 0; };

    const handleStartManualBilling = (patientId, date, sessionNumber) => {
        const patient = patients.find(p => p.id === patientId); if (!patient) { setAppError("Patient für manuelle Abrechnung nicht gefunden."); return; }
        let finalSessionNumber; const manualNumber = Number(sessionNumber);
        if (sessionNumber && !isNaN(manualNumber) && manualNumber > 0) { finalSessionNumber = manualNumber; } else { finalSessionNumber = getHighestSessionNumber(patient.sessions) + 1; }
        const syntheticEvent = { id: `manual_${Date.now()}`, summary: `Manuelle Sitzung (${patient.chiffre})`, start: { dateTime: new Date(date).toISOString() }, sitzungsnummer: finalSessionNumber, isManual: true };
        handleStartBilling(syntheticEvent);
    };
    const fetchNextAppointment = useCallback(async (chiffre) => {
        if (!chiffre) return;
        setNextAppointment({ isLoading: true, text: null, error: null });
        try {
            const response = await fetch(`http://localhost:3001/api/calendar/nextevent?chiffre=${chiffre}`);
            if (response.status === 404) { setNextAppointment({ isLoading: false, text: 'Kein zukünftiger Termin gefunden.', error: null }); return; }
            if (!response.ok) { throw new Error('Kalender-API-Anfrage fehlgeschlagen.'); }
            const event = await response.json();
            const startDate = new Date(event.start); const endDate = new Date(event.end); const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }; const timeOptions = { hour: '2-digit', minute: '2-digit' };
            const formattedDate = startDate.toLocaleDateString('de-DE', dateOptions); const formattedStartTime = startDate.toLocaleTimeString('de-DE', timeOptions); const formattedEndTime = endDate.toLocaleTimeString('de-DE', timeOptions);
            setNextAppointment({ isLoading: false, text: `Nächster Termin: ${formattedDate} um ${formattedStartTime} bis ${formattedEndTime} Uhr`, error: null });
        } catch (error) { console.error('Fehler beim Abrufen des Termins:', error); setNextAppointment({ isLoading: false, text: null, error: 'Termin konnte nicht geladen werden.' }); }
    }, []);
    const getPatientsCollectionPath = useCallback(() => { if (!userId) return null; return `/artifacts/${firestoreAppId}/users/${userId}/patients`; }, [userId]);
    const getProfileDocPath = useCallback(() => { if (!userId) return null; return `/artifacts/${firestoreAppId}/users/${userId}/profile/main`; }, [userId]);
    const getEbmTemplatesCollectionPath = useCallback(() => { if (!userId) return null; return `/artifacts/${firestoreAppId}/users/${userId}/ebm_templates`; }, [userId]);
    const getDiagnostikTemplatesCollectionPath = useCallback(() => { if (!userId) return null; return `/artifacts/${firestoreAppId}/users/${userId}/diagnostik_templates`; }, [userId]);

    const findIcd10CodeLocal = useCallback((codeToFind) => { const upperCodeToFind = codeToFind.toUpperCase(); let found = localIcd10Data[upperCodeToFind]; if (found) return found; const baseCode = upperCodeToFind.replace(/(\.-[*]|\.\*|[*]|-)$/, ''); found = localIcd10Data[`${baseCode}.-*`] || localIcd10Data[`${baseCode}.*`] || localIcd10Data[baseCode]; if (found) return found; const possibleCategoryCode = Object.keys(localIcd10Data).find(key => key.startsWith(upperCodeToFind) && (localIcd10Data[key].code_kategorie || localIcd10Data[key].code)); if (possibleCategoryCode) return localIcd10Data[possibleCategoryCode]; return null; }, [localIcd10Data]);
    const handleStartBilling = (event) => {
        const chiffreMatch = event.summary?.match(/[A-Z][0-9]{6}/); const chiffre = chiffreMatch ? chiffreMatch[0] : null; const targetPatient = patients.find(p => p.chiffre === chiffre);
        let nextSessionNumber;
        if (event.sitzungsnummer) { nextSessionNumber = event.sitzungsnummer; } else { nextSessionNumber = 1; if (targetPatient) { const highestSession = getHighestSessionNumber(targetPatient.sessions); nextSessionNumber = highestSession + 1; } }
        const eventWithSessionNumber = { ...event, sitzungsnummer: nextSessionNumber };
        setBillingModalState({ isOpen: true, event: eventWithSessionNumber, isEditing: false });
    };
    const handleEditSession = (session) => { const event = { id: session.id, summary: `${session.structuredNotes?.thema || 'Sitzung'} (${selectedPatient.chiffre})`, start: { dateTime: session.date }, sitzungsnummer: session.structuredNotes?.sitzungsnummer, initialNotes: session.structuredNotes, initialEbm: session.ebmEntries, }; setBillingModalState({ isOpen: true, event, isEditing: true }); };
    const handleDeleteSession = async (sessionId) => {
        if (!selectedPatient) return;
        const performDelete = async () => {
            const updatedSessions = selectedPatient.sessions.filter(s => s.id !== sessionId);
            const patientRef = doc(db, getPatientsCollectionPath(), selectedPatient.id);
            try { await setDoc(patientRef, { sessions: updatedSessions }, { merge: true }); setConfirmDeleteState({ isOpen: false }); } catch (error) { console.error("Error deleting session: ", error); setAppError("Fehler beim Löschen der Sitzung."); }
        };
        setConfirmDeleteState({ isOpen: true, title: "Sitzung löschen?", message: "Möchten Sie diese Sitzung und alle zugehörigen Abrechnungsdaten wirklich löschen?", onConfirm: performDelete, });
    };
    const handleSaveBilling = async (billingData, isEditing) => {
        const { chiffre, eventId, eventStart, notes, ebmEntries, sessionId } = billingData;
        const targetPatient = patients.find(p => p.chiffre === chiffre); if (!targetPatient) { setAppError(`Patient mit Chiffre ${chiffre} nicht gefunden.`); return; }
        const patientRef = doc(db, getPatientsCollectionPath(), targetPatient.id);
        let updatedSessions;
        if (isEditing) {
            updatedSessions = targetPatient.sessions.map(session => { if (session.id === sessionId) { return { ...session, structuredNotes: notes, ebmEntries: ebmEntries }; } return session; });
        } else { const newSession = { id: `sess_${Date.now()}`, date: new Date(eventStart).toISOString(), structuredNotes: notes, ebmEntries: ebmEntries, eventId: eventId, homeworkStatus: (notes.hausaufgaben || []).filter(task => task.trim() !== '').map(taskText => ({ text: taskText, done: false, reason: '' })) }; updatedSessions = [...(targetPatient.sessions || []), newSession]; }
        updatedSessions.sort((a, b) => new Date(b.date) - new Date(a.date));
        try {
            await setDoc(patientRef, { sessions: updatedSessions }, { merge: true }); setBillingModalState({ isOpen: false, event: null, isEditing: false }); if (!isEditing) { setActiveDetailTab('abrechnung'); }
        } catch (err) { setAppError("Fehler beim Speichern der Abrechnung."); console.error("Error saving billing:", err); }
    };

    const handleSaveBillingPeriod = async (periodData) => {
        if (!selectedPatient) return;
        const patientRef = doc(db, getPatientsCollectionPath(), selectedPatient.id);

        const newPeriod = {
            id: `bp_${Date.now()}`,
            ...periodData
        };

        const updatedPatientData = {
            billingPeriods: [...(selectedPatient.billingPeriods || []), newPeriod]
        };

        const newPeriodDateStr = new Date(newPeriod.date).toISOString().split('T')[0];

        availableTests.forEach(testDef => {
            const resultKey = `${testDef.id}Results`;
            const testResults = selectedPatient[resultKey] || [];

            if (testResults.length > 0) {
                const updatedResults = testResults.map(res => {
                    const testDateStr = new Date(res.date).toISOString().split('T')[0];
                    if (testDateStr === newPeriodDateStr && !res.billingPeriodId) {
                        return { ...res, billingPeriodId: newPeriod.id };
                    }
                    return res;
                });
                updatedPatientData[resultKey] = updatedResults;
            }
        });

        try {
            await setDoc(patientRef, updatedPatientData, { merge: true });
            setIsAddBillingPeriodModalOpen(false);
        } catch (err) {
            setAppError(`Fehler beim Speichern des Abrechnungszeitraums: ${err.message}`);
        }
    };

    const handleDeleteBillingPeriod = async (periodId) => {
        if (!selectedPatient || !periodId) return;
        if (!window.confirm(`Möchten Sie diesen Abrechnungszeitraum wirklich löschen? Alle zugeordneten Tests werden wieder als "nicht zugeordnet" markiert.`)) { return; }
        const patientRef = doc(db, getPatientsCollectionPath(), selectedPatient.id);
        const updatedTestResults = {};
        availableTests.forEach(testDef => {
            const resultKey = `${testDef.id}Results`;
            if (selectedPatient[resultKey]) {
                updatedTestResults[resultKey] = selectedPatient[resultKey].map(res => {
                    if (res.billingPeriodId === periodId) {
                        return { ...res, billingPeriodId: null };
                    }
                    return res;
                });
            }
        });
        const updatedPeriods = selectedPatient.billingPeriods.filter(p => p.id !== periodId);
        const updatedPatient = { ...selectedPatient, billingPeriods: updatedPeriods, ...updatedTestResults };
        setSelectedPatient(updatedPatient);
        try { await setDoc(patientRef, { billingPeriods: updatedPeriods, ...updatedTestResults }, { merge: true });
        } catch (err) { setAppError("Fehler beim Löschen des Abrechnungszeitraums."); console.error(err); }
    };
    
    const handleAddPendingTest = async (test) => {
        if (!selectedPatient || !test) return;

        const patientRef = doc(db, getPatientsCollectionPath(), selectedPatient.id);
        const resultKey = `${test.id}Results`;
        
        const newTestResult = {
            date: new Date().toISOString(),
            status: 'pending',
            results: {},
            testInstanceId: `test_${test.id}_${Date.now()}`,
            testGrund: 'Einzeltestung',
            billingPeriodId: null
        };
        
        const updatedTestList = [...(selectedPatient[resultKey] || []), newTestResult];
        
        try {
            await updateDoc(patientRef, { [resultKey]: updatedTestList });
            alert(`Test "${test.name}" wurde zur Liste der ausstehenden Tests hinzugefügt.`);
        } catch (err) {
            setAppError(`Fehler beim Hinzufügen des Tests: ${err.message}`);
        }
    };

    const handleSaveCompletedTest = async (patientId, testData) => {
        const { testId, results, date } = testData;
        if (!patientId || !testId) return;
    
        const patientRef = doc(db, getPatientsCollectionPath(), patientId);
        const targetPatient = patients.find(p => p.id === patientId);
        if (!targetPatient) return;

        const resultKey = `${testId}Results`;
        const newTestResult = {
            date: date,
            results: results,
            status: 'completed',
            testGrund: 'Einzeltestung (Global)',
            testInstanceId: `test_${testId}_${Date.now()}`,
            billingPeriodId: null,
        };

        const updatedTestResultsList = [...(targetPatient[resultKey] || []), newTestResult];
        try {
            await updateDoc(patientRef, { [resultKey]: updatedTestResultsList });
            setIsZentraleTestModalOpen(false);
        } catch (err) {
            setAppError(`Fehler beim Speichern des Tests: ${err.message}`);
        }
    };


    const handleCompletePendingTest = (testToComplete) => {
        if (!testToComplete) return;
        setTestToUpdate(testToComplete);
        const testInfo = availableTests.find(t => t.id === testToComplete.testType);
        setCurrentTestToErfassen(testInfo);
        setIsZentraleTestModalOpen(true);
    };

    const handleUpdateTest = async (testInstanceId, testType, newResults, newDate) => {
        if (!selectedPatient) return;
        const patientRef = doc(db, getPatientsCollectionPath(), selectedPatient.id);
        const resultKey = `${testType}Results`;
        const updatedTestList = selectedPatient[resultKey].map(test => {
            if (test.testInstanceId === testInstanceId) {
                return { ...test, results: newResults, date: newDate, status: 'completed' };
            }
            return test;
        });
        try {
            await updateDoc(patientRef, { [resultKey]: updatedTestList });
            setIsZentraleTestModalOpen(false);
            setTestToUpdate(null);
        } catch (err) {
            setAppError(`Fehler beim Aktualisieren des Tests: ${err.message}`);
        }
    };
    
    const handleSaveTestTemplate = async (patientId, template) => {
        const { name, tests: testIds } = template;
        if (!patientId || !testIds || testIds.length === 0) return;
        const patientRef = doc(db, getPatientsCollectionPath(), patientId);
        const targetPatient = patients.find(p => p.id === patientId);
        if (!targetPatient) return;

        const updates = {};
        const timestamp = Date.now();
        const dateISO = new Date().toISOString();

        testIds.forEach((testId, index) => {
            const resultKey = `${testId}Results`;
            const testInstanceId = `test_${testId}_${timestamp + index}`;
            const newTestResult = {
                date: dateISO,
                status: 'pending',
                results: {},
                testInstanceId,
                testGrund: name,
                billingPeriodId: null
            };
            if (!updates[resultKey]) updates[resultKey] = [...(targetPatient[resultKey] || [])];
            updates[resultKey].push(newTestResult);
        });

        try {
            await updateDoc(patientRef, updates);
            alert(`Testvorlage "${name}" für Patient*in ${targetPatient.chiffre} hinzugefügt.`);
        } catch (err) {
            setAppError(`Fehler beim Speichern der Testvorlage: ${err.message}`);
        }
    };

    const handleUpdateTestGrund = async (testInstanceId, testType, newGrund) => {
        if (!selectedPatient) return;
        const patientRef = doc(db, getPatientsCollectionPath(), selectedPatient.id);
        const resultKey = `${testType}Results`;
        const updatedTestList = selectedPatient[resultKey].map(test => {
            if (test.testInstanceId === testInstanceId) {
                return { ...test, testGrund: newGrund };
            }
            return test;
        });
        try {
            await updateDoc(patientRef, { [resultKey]: updatedTestList });
        } catch (err) {
            setAppError(`Fehler beim Aktualisieren des Testgrunds: ${err.message}`);
        }
    };

    const handleDeleteTest = async (testInstanceId, testType) => {
        if (!selectedPatient || !testInstanceId || !testType) { return; }
        if (!window.confirm("Möchten Sie diesen Testeintrag wirklich endgültig löschen?")) return;
        
        const patientRef = doc(db, getPatientsCollectionPath(), selectedPatient.id);
        const resultKey = `${testType}Results`;
        
        const updatedTestResultsList = (selectedPatient[resultKey] || []).filter(r => r.testInstanceId !== testInstanceId);
        
        const updatedPatient = {
            ...selectedPatient,
            [resultKey]: updatedTestResultsList,
        };
        setSelectedPatient(updatedPatient);
        
        try { 
            await updateDoc(patientRef, { [resultKey]: updatedTestResultsList });
        } catch (err) { 
            setAppError("Fehler beim Löschen des Testergebnisses.");
            const originalPatient = patients.find(p => p.id === selectedPatient.id);
            if(originalPatient) setSelectedPatient(originalPatient);
        }
    };

    const handleSaveDiagnostikTemplate = async (templateData) => {
        const collectionPath = getDiagnostikTemplatesCollectionPath();
        if (!collectionPath) return;

        try {
             const dataToSave = {
                name: templateData.name,
                tests: templateData.tests,
            };
            if (templateData.id) {
                await setDoc(doc(db, collectionPath, templateData.id), dataToSave);
            } else {
                await addDoc(collection(db, collectionPath), dataToSave);
            }
        } catch (err) {
            console.error("Error saving diagnostik template:", err);
            setAppError(`Fehler beim Speichern der Diagnostik-Vorlage: ${err.message}`);
        }
    };

    const handleDeleteDiagnostikTemplate = async (templateId) => {
        const collectionPath = getDiagnostikTemplatesCollectionPath();
        if (!collectionPath) return;
        if (window.confirm("Möchten Sie diese Diagnostik-Vorlage wirklich löschen?")) {
            try {
                await deleteDoc(doc(db, collectionPath, templateId));
            } catch (err) {
                setAppError(`Fehler beim Löschen der Diagnostik-Vorlage: ${err.message}`);
            }
        }
    };


    const handleUpdateHomeworkStatus = async (sessionId, homeworkIndex, newStatus) => {
        if (!selectedPatient || !userId) return;
        const collectionPath = getPatientsCollectionPath();
        const patientRef = doc(db, collectionPath, selectedPatient.id);
        const updatedSessions = JSON.parse(JSON.stringify(selectedPatient.sessions));
        const sessionToUpdate = updatedSessions.find(s => s.id === sessionId);
        if (sessionToUpdate && sessionToUpdate.homeworkStatus && sessionToUpdate.homeworkStatus[homeworkIndex]) { Object.assign(sessionToUpdate.homeworkStatus[homeworkIndex], newStatus); }
        try { await setDoc(patientRef, { sessions: updatedSessions }, { merge: true }); } catch (err) { console.error("Error updating homework status:", err); setAppError("Fehler beim Aktualisieren des Hausaufgabenstatus."); }
    };
    
    const handleUpdateQuickNote = async (note) => {
        if (!selectedPatient || !userId) return;
        const patientRef = doc(db, getPatientsCollectionPath(), selectedPatient.id);
        try {
            await updateDoc(patientRef, { quickNote: note });
        } catch (err) {
            console.error("Error saving quick note:", err);
            setAppError("Fehler beim Speichern der Notiz.");
        }
    };

    const handleSaveEbmTemplate = async (templateData) => {
        if (!userId) { setAppError("Benutzer nicht authentifiziert."); return; }
        const collectionPath = getEbmTemplatesCollectionPath();
        if (!collectionPath) return;
        try {
            await addDoc(collection(db, collectionPath), templateData);
        } catch (err) {
            console.error("Error saving EBM template:", err);
            setAppError("Fehler beim Speichern der EBM-Vorlage.");
        }
    };
    const handleDeleteEbmTemplate = async (templateId) => {
        if (!userId) { setAppError("Benutzer nicht authentifiziert."); return; }
        const collectionPath = getEbmTemplatesCollectionPath();
        if (!collectionPath) return;
        if (!window.confirm("Möchten Sie diese Vorlage wirklich löschen?")) return;
        try {
            await deleteDoc(doc(db, collectionPath, templateId));
        } catch (err) {
            console.error("Error deleting EBM template:", err);
            setAppError("Fehler beim Löschen der EBM-Vorlage.");
        }
    };
    
    const handleOpenZentraleTestModal = (test) => {
        setCurrentTestToErfassen(test);
        setTestToUpdate(null);
        setIsZentraleTestModalOpen(true);
    };
    
    const handleOpenTemplateModal = (template) => {
        setCurrentTemplate(template);
        setIsAddTemplateModalOpen(true);
    };

    // --- useEffects ---
    useEffect(() => { const timer = setTimeout(() => { setIsInitialLoading(false); }, 1500); return () => clearTimeout(timer); }, []);
    useEffect(() => { if (mainView === 'kalender') { setIsCalendarLoading(true); const timer = setTimeout(() => { setIsCalendarLoading(false); }, 1500); return () => clearTimeout(timer); } }, [mainView]);
    useEffect(() => { if (ebmData.length === 0) { fetch('/ebm_data_full.json').then(res => res.json()).then(setEbmData).catch(err => console.error("Failed to load EBM data", err)); } }, [ebmData.length]);
    useEffect(() => {
        if (mainView === 'abrechnung') {
            setIsLoadingAppointments(true);
            fetch('http://localhost:3001/api/calendar/past-events')
                .then(res => { if (!res.ok) { return res.json().then(errorData => { throw new Error(errorData.message || `Serverfehler: ${res.status}`); }); } return res.json(); })
                .then(calendarEvents => {
                    if (!Array.isArray(calendarEvents)) { throw new Error("Unerwartetes Datenformat vom Server erhalten."); };
                    const billedEventIds = new Set();
                    patients.forEach(p => { (p.sessions || []).forEach(s => { if (s.eventId) billedEventIds.add(s.eventId); }); });
                    const unbilled = calendarEvents.filter(event => !billedEventIds.has(event.id) && event.summary?.match(/[A-Z][0-9]{6}/));
                    setUnbilledAppointments(unbilled);
                })
                .catch(err => { if (err.message && err.message.includes('Nicht bei Google authentifiziert')) { setAppError(`Kalender-Fehler: Sie müssen sich erneut bei Google authentifizieren. Rufen Sie dazu im Browser auf: http://localhost:3001/auth/google`); } else { setAppError(`Offene Abrechnungen konnten nicht geladen werden: ${err.message}`); } })
                .finally(() => setIsLoadingAppointments(false));
        }
    }, [mainView, patients]);
    useEffect(() => { if (selectedPatient) { fetchNextAppointment(selectedPatient.chiffre); } else { setNextAppointment({ isLoading: false, text: null, error: null }); } }, [selectedPatient, fetchNextAppointment]);
    useEffect(() => { fetch('/icd10f_data.json').then(response => { if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`); return response.json(); }).then(data => { const indexedData = {}; data.forEach(item => { if (item.code) { indexedData[item.code.toUpperCase()] = item; } }); setLocalIcd10Data(indexedData); }).catch(error => { console.error("Fehler beim Laden der lokalen ICD-10 Daten:", error); setAppError("Lokale ICD-10 Daten konnten nicht geladen werden. " + error.message); }); }, []);
    useEffect(() => { if (selectedPatient && !selectedId) { setEditableKrankheitsanamnese(selectedPatient.krankheitsanamnese || ""); setEditableLebensgeschichte(selectedPatient.lebensgeschichte || ""); setEditableProblemanalyseMakro(selectedPatient.problemanalyseMakro || ""); setEditableTherapieplan(selectedPatient.therapieplan || ""); if (detailViewRef.current) { setTimeout(() => { detailViewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100); } } else { setEditableKrankheitsanamnese(""); setEditableLebensgeschichte(""); setEditableProblemanalyseMakro(""); setEditableTherapieplan(""); } }, [selectedPatient, selectedId]);
    useEffect(() => { if (newDiagnosisCode.trim() !== '') { const found = findIcd10CodeLocal(newDiagnosisCode.trim().toUpperCase()); if (found && found.name) { setLookedUpDiagnosisName(found.name); } else { setLookedUpDiagnosisName(''); } } else { setLookedUpDiagnosisName(''); } }, [newDiagnosisCode, findIcd10CodeLocal]);
    useEffect(() => { const unsubscribe = onAuthStateChanged(auth, (user) => { if (user) { setUserId(user.uid); } else { setUserId(null); } setIsAuthReady(true); setIsLoading(false); }); return () => unsubscribe(); }, []);
    
    const seedInitialData = useCallback(async (collectionPath) => {
        if (!userId || !collectionPath) return;
        try {
            const patientsCollection = collection(db, collectionPath);
            const querySnapshot = await getDocs(patientsCollection);
            if (querySnapshot.empty) { const batch = writeBatch(db); initialPatientsData.forEach(patientData => { const newPatientRef = doc(patientsCollection); batch.set(newPatientRef, { ...patientData, hscl11Results: patientData.hscl11Results || [], bdi2Results: patientData.bdi2Results || [], fep2Results: patientData.fep2Results || [], scl90rResults: patientData.scl90rResults || [], gad7Results: patientData.gad7Results || [], coreOmResults: patientData.coreOmResults || [], iipcResults: patientData.iipcResults || [], diagnoses_icd11: patientData.diagnoses_icd11 || [], billingPeriods: patientData.billingPeriods || [], krankheitsanamnese: patientData.krankheitsanamnese || "", lebensgeschichte: patientData.lebensgeschichte || "", problemanalyseMakro: patientData.problemanalyseMakro || "", therapieplan: patientData.therapieplan || "" }); }); await batch.commit(); }
        } catch (err) { console.error("Error seeding initial data:", err); setAppError("Fehler beim Laden der initialen Daten."); }
    }, [userId]);

    useEffect(() => {
        if (!isAuthReady || !userId) { 
            setPatients([]); 
            setProfile({}); 
            setEbmTemplates([]);
            setDiagnostikTemplates([]);
            return; 
        }
        
        const unsubscribes = [];
        setIsLoading(true);

        const paths = [
            { path: getPatientsCollectionPath(), setter: setPatients, process: (docs) => docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (a.name || "").localeCompare(b.name || ""))},
            { path: getProfileDocPath(), setter: setProfile, isDoc: true },
            { path: getEbmTemplatesCollectionPath(), setter: setEbmTemplates, process: (docs) => docs.map(d => ({id: d.id, ...d.data()})) },
            { path: getDiagnostikTemplatesCollectionPath(), setter: setDiagnostikTemplates, process: (docs) => docs.map(d => ({id: d.id, ...d.data()})) }
        ];
        
        seedInitialData(getPatientsCollectionPath());

        paths.forEach(({ path, setter, process, isDoc }) => {
            if (path) {
                if (isDoc) {
                    unsubscribes.push(onSnapshot(doc(db, path), (docSnap) => {
                        setter(docSnap.exists() ? docSnap.data() : {});
                    }));
                } else {
                    unsubscribes.push(onSnapshot(query(collection(db, path)), (snapshot) => {
                        const data = process ? process(snapshot.docs) : snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                        setter(data);
                    }));
                }
            }
        });
        
        setIsLoading(false);
        return () => unsubscribes.forEach(unsub => unsub());
    }, [isAuthReady, userId, getDiagnostikTemplatesCollectionPath, getEbmTemplatesCollectionPath, getPatientsCollectionPath, getProfileDocPath, seedInitialData]);


    useEffect(() => {
        if (selectedPatient) {
            const currentPatientDataFromList = patients.find(p => p.id === selectedPatient.id);
            if (currentPatientDataFromList) {
                if (JSON.stringify(currentPatientDataFromList) !== JSON.stringify(selectedPatient)) {
                    setSelectedPatient(currentPatientDataFromList);
                }
            } else {
                setSelectedPatient(null);
                setSelectedId(null);
            }
        }
    }, [patients, selectedPatient]);

    useEffect(() => { const loadIcd10Data = async () => { try { const response = await fetch('/icd10f_data.json'); if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); } const data = await response.json(); const indexedData = {}; data.forEach(item => { if (item.code) { indexedData[item.code.toUpperCase()] = item; const baseCode = item.code.replace(/[*†]/, '').toUpperCase(); if (baseCode !== item.code.toUpperCase()) { indexedData[baseCode] = item; } } }); setLocalIcd10Data(indexedData); } catch (error) { console.error("Fehler beim Laden der lokalen ICD-10 Daten:", error); setAppError("Lokale ICD-10 Daten konnten nicht geladen werden. " + error.message); } }; loadIcd10Data(); }, []);

    const bdiCutoffs = [{ y1: 0, y2: 8, label: "Keine Depression", color: "rgba(75, 192, 192, 0.2)" }, { y1: 9, y2: 13, label: "Minimale Depression", color: "rgba(54, 162, 235, 0.2)" }, { y1: 14, y2: 19, label: "Leichte Depression", color: "rgba(255, 206, 86, 0.2)" }, { y1: 20, y2: 28, label: "Mittelschwere Depression", color: "rgba(255, 159, 64, 0.2)" }, { y1: 29, y2: 63, label: "Schwere Depression", color: "rgba(255, 99, 132, 0.2)" }];
    const bdiAxisTicks = [0, 8, 13, 19, 28, 63];

    const handleAuthAction = async (isRegistering) => { setIsAuthLoading(true); setAuthError(null); try { if (isRegistering) { await createUserWithEmailAndPassword(auth, email, password); } else { await signInWithEmailAndPassword(auth, email, password); } setEmail(""); setPassword(""); } catch (error) { console.error("Authentication error:", error); setAuthError(error.message); } finally { setIsAuthLoading(false); } };
    const handleLogout = async () => { try { await signOut(auth); setSelectedPatient(null); setPatients([]); } catch (error) { console.error("Error signing out: ", error); setAppError("Fehler beim Abmelden."); } };
    const handleSavePatient = async (patientData) => {
        if (!userId) { setAppError("Benutzer nicht authentifiziert."); return; }
        const collectionPath = getPatientsCollectionPath(); if (!collectionPath) return;
        const dataToSave = { 
            name: patientData.name || '', 
            vorname: patientData.vorname || '', 
            chiffre: patientData.chiffre || '', 
            geburtsdatum: patientData.geburtsdatum || '', 
            adresse: patientData.adresse || '', 
            email: patientData.email || '', 
            telefon: patientData.telefon || '', 
            krankenkasse: patientData.krankenkasse || '', 
            versichertennummer: patientData.versichertennummer || '', 
            approvedHours: patientData.approvedHours || 0, 
            therapeuticMethods: patientData.therapeuticMethods || [], 
            diagnoses: patientData.diagnoses || [], 
            diagnoses_icd11: patientData.diagnoses_icd11 || [], 
            sessions: patientData.sessions || [], 
            hscl11Results: patientData.hscl11Results || [], 
            bdi2Results: patientData.bdi2Results || [], 
            fep2Results: patientData.fep2Results || [], 
            scl90rResults: patientData.scl90rResults || [], 
            gad7Results: patientData.gad7Results || [],
            coreOmResults: patientData.coreOmResults || [],
            iipcResults: patientData.iipcResults || [],
            billingPeriods: patientData.billingPeriods || [], 
            krankheitsanamnese: patientData.krankheitsanamnese || "", 
            lebensgeschichte: patientData.lebensgeschichte || "", 
            problemanalyseMakro: patientData.problemanalyseMakro || "", 
            therapieplan: patientData.therapieplan || "" 
        };
        try { if (editingPatient && editingPatient.id) { const patientRef = doc(db, collectionPath, editingPatient.id); await setDoc(patientRef, dataToSave, { merge: true }); } else { await addDoc(collection(db, collectionPath), dataToSave); } setIsPatientModalOpen(false); setEditingPatient(null); } catch (err) { console.error("Error saving patient:", err); setAppError(`Fehler beim Speichern des Patienten: ${err.message}`); }
    };
    const handleAddDiagnosis = async () => {
        const codeToAdd = newDiagnosisCode.trim().toUpperCase(); if (!selectedPatient || !codeToAdd || !userId) { setAppError("Bitte füllen Sie alle erforderlichen Felder aus."); return; }
        const collectionPath = getPatientsCollectionPath(); if (!collectionPath) return;
        const sicherheitPrefix = newDiagnosisSicherheit ? `[${newDiagnosisSicherheit}] ` : "";
        const beschreibung = newDiagnosis.trim() ? `: ${newDiagnosis.trim()}` : (lookedUpDiagnosisName ? `: ${lookedUpDiagnosisName}` : "");
        const diagnosisString = `${sicherheitPrefix}${codeToAdd}${beschreibung}`;
        const updatedDiagnoses = [...(selectedPatient.diagnoses || []), diagnosisString];
        const patientRef = doc(db, collectionPath, selectedPatient.id);
        try {
            await setDoc(patientRef, { diagnoses: updatedDiagnoses }, { merge: true }); setNewDiagnosisCode(''); setNewDiagnosis(''); setLookedUpDiagnosisName(''); setNewDiagnosisSicherheit('G');
        } catch (err) { console.error("Error adding diagnosis:", err); setAppError("Fehler beim Hinzufügen der Diagnose."); }
    };
    const handleRemoveDiagnosis = async (diagnosisStringToRemove) => { if (!selectedPatient || !userId) return; const collectionPath = getPatientsCollectionPath(); if (!collectionPath) return; const updatedDiagnoses = selectedPatient.diagnoses.filter(d => d !== diagnosisStringToRemove); const patientRef = doc(db, collectionPath, selectedPatient.id); try { await setDoc(patientRef, { diagnoses: updatedDiagnoses }, { merge: true }); } catch (err) { console.error("Error removing diagnosis:", err); setAppError("Fehler beim Entfernen der Diagnose."); } };
    const handleKrankheitsmodellChange = async (fieldName, value) => { if (!selectedPatient || !userId) return; const collectionPath = getPatientsCollectionPath(); if (!collectionPath) return; const patientRef = doc(db, collectionPath, selectedPatient.id); try { await setDoc(patientRef, { [fieldName]: value }, { merge: true }); } catch (err) { console.error(`Error updating ${fieldName}:`, err); setAppError(`Fehler beim Speichern von ${fieldName}.`); } };
    const handleTherapeutischeAssistenzAnfordern = async () => {
        if (!selectedPatient) { setAssistenzError("Bitte wählen Sie zuerst einen Patienten aus."); return; }
        setIsLoadingTherapeutischeAssistenz(true); setTherapeutischeAssistenzOutput(""); setAssistenzError(null);
        const conductedHours = getHighestSessionNumber(selectedPatient.sessions);
        const patientenDatenText = `Hier sind die relevanten Patientendaten:\n**Krankheitsanamnese:**\n${selectedPatient.krankheitsanamnese || "Keine Angaben."}\n**Lebensgeschichte/Biografie:**\n${selectedPatient.lebensgeschichte || "Keine Angaben."}\n**Problemanalyse auf Makroebene:**\n${selectedPatient.problemanalyseMakro || "Keine Angaben."}\n**Therapieplanung (bisherig):**\n${selectedPatient.therapieplan || "Keine Angaben."}\n**Verlaufsdokumentation (Sitzungsnotizen):**\n${(selectedPatient.sessions || []).map((s, i) => `Sitzung ${s.structuredNotes?.sitzungsnummer || i + 1} (${new Date(s.date).toLocaleDateString('de-DE')}): ${s.structuredNotes?.patientenbericht || s.notes}`).join("\n\n") || "Keine Sitzungsnotizen vorhanden."}\n**Diagnosen:**\n${(selectedPatient.diagnoses || []).join(", ") || "Keine Diagnosen erfasst."}\n**Genehmigte Stunden:** ${selectedPatient.approvedHours}\n**Durchgeführte Stunden:** ${conductedHours}`;
        const systemPrompt = `Du bist ein interdisziplinäres Expertenteam, bestehend aus erfahrenen Verhaltenstherapeuten wie Jürgen Margraf, Dr. Stavemann, Aaron T. Beck, Judith Beck und Jonathan S. Abramowitz sowie aus leitenden Chefärzten und Psychiatern wie Prof. Dr. Mathias Berger. Das Team verfügt über exzellente Fachkompetenz in der evidenzbasierten psychotherapeutischen Praxis und legt besonderen Wert auf präzise medizinische Dokumentation sowie therapeutische Qualität. Darüber hinaus gehören auch international anerkannte Experten wie David H. Barlow, Stefan G. Hofmann und Steven Hayes zum Team. Du verfügst über tiefgehendes Wissen in Ansätzen der sogenannten „dritten Welle“ der Verhaltenstherapie, insbesondere in ACT, Schematherapie und DBT.\nDeine Aufgabe ist es, auf Grundlage folgender Elemente, welche du aus den bereitgestellten Patientendaten entnimmst:\n- Krankheitsanamnese, Lebensgeschichte/Biografie, Problemanalyse auf Makroebene, Therapieplanung (bisherig), Verlaufsdokumentation (Sitzungsnotizen)\neine strukturierte Rückmeldung zu geben mit dem Ziel:\n1. Wesentliche Schwerpunkte in der weiteren Therapieplanung zu identifizieren.\n2. Konkrete Interventionsideen zu formulieren, orientiert an den zugelassenen Stunden.\n3. Hinweise zu geben, worauf in der Strukturierung der Sitzungen geachtet werden sollte (z.B. Themenfokus, Symptomschwere, Therapiezielorientierung).\nBerücksichtige dabei:\n• Die begrenzte Anzahl genehmigter Stunden. • Dass Themen nicht zu häufig gewechselt werden sollen. • Die Konsistenz und Nachvollziehbarkeit im Verlauf.\nBitte plane deine Analyse gründlich und reflektiert. Handle in Etappen:\n1. Diagnostische Schwerpunkte benennen, 2. Therapieziele definieren, 3. Interventionsvorschläge machen, 4. Hinweise zur Dokumentation geben\nAtme einmal tief ein und aus und nehme dir Zeit für die Aufgabe. Mache bitte weiter, bis das Problem vollständig gelöst ist. Planen bitte ausführlich vor jeder Aktion.\nHier sind die Daten des aktuellen Falls:\n${patientenDatenText}\nBitte gib deine strukturierte Rückmeldung.`;
        try { const assistenz = await generateGeminiText(systemPrompt); setTherapeutischeAssistenzOutput(assistenz); } catch (e) { setAssistenzError(`Fehler bei der Anforderung der therapeutischen Assistenz: ${e.message}`); } finally { setIsLoadingTherapeutischeAssistenz(false); }
    };
    const showDiagnosisInfo = (diagnosisString) => { const sicherheitMatch = diagnosisString.match(/^\[([AVGZN]+)\]\s*/i); const sicherheit = sicherheitMatch ? sicherheitMatch[1].toUpperCase() : ''; const codeAndName = sicherheitMatch ? diagnosisString.substring(sicherheitMatch[0].length) : diagnosisString; const codeMatch = codeAndName.match(/^([A-Z][0-9]{1,2}(\.[0-9A-Z]{1,2})?[*†]?)/i); const code = codeMatch ? codeMatch[0].toUpperCase() : codeAndName.split(':')[0].trim().toUpperCase(); const localData = findIcd10CodeLocal(code); if (localData) { setDiagnosisInfo({ code: localData.code || code, name: localData.name || '', beschreibung: localData.beschreibung || localData.beschreibung_kategorie || '', inkl: localData.inkl || [], exkl: localData.exkl || [], hinweise: localData.hinweise || [], zusatz_info_code: localData.zusatz_info_code || '', sicherheit: sicherheit, isLoading: false, error: null, isOpen: true, source: 'local' }); } else { setDiagnosisInfo({ code: code, name: "Unbekannter ICD-10 Code", isLoading: false, error: `Für den ICD-10 Code "${code}" wurden keine Informationen in der lokalen Datenbank gefunden.`, isOpen: true, source: 'error' }); } };
    const fetchIcd11Details = async (diagnosis) => { if (!diagnosis || !diagnosis.uri) { setAppError("Keine gültige URI für die ICD-11 Diagnose vorhanden."); return; } const { code, title, uri } = diagnosis; setDiagnosisInfo({ code: code, name: title, isLoading: true, error: null, isOpen: true, source: 'api' }); try { const response = await fetch(`http://localhost:3001/api/icd11-info?uri=${encodeURIComponent(uri)}`); if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'API-Anfrage fehlgeschlagen'); } const fullData = await response.json(); setDiagnosisInfo({ code: fullData.code || code, name: fullData.title?.['@value'] || title, beschreibung: fullData.definition?.['@value'] || '', diagnosticCriteria: fullData.diagnosticCriteria, inclusions: fullData.inclusion, exclusions: fullData.exclusion, isLoading: false, error: null, isOpen: true, source: 'api_detail' }); } catch (error) { console.error('Fehler beim Abrufen der ICD-11 Details:', error); setDiagnosisInfo({ code: code, isLoading: false, error: `Konnte Informationen für ${code} nicht laden: ${error.message}`, isOpen: true, source: 'api' }); } };
    const handleAssignIcd11Diagnosis = async (patientId, icd11Entity) => { if (!patientId || !icd11Entity || !userId) return; const collectionPath = getPatientsCollectionPath(); if (!collectionPath) return; const patientRef = doc(db, collectionPath, patientId); const targetPatient = patients.find(p => p.id === patientId); if (!targetPatient) { setAppError("Ziel-Patient konnte nicht gefunden werden."); return; } const newDiagnosis = { code: icd11Entity.code, title: icd11Entity.selectedText, uri: icd11Entity.linearizationUri || icd11Entity.foundationUri, date: new Date().toISOString() }; const updatedDiagnoses = [...(targetPatient.diagnoses_icd11 || []), newDiagnosis]; try { await setDoc(patientRef, { diagnoses_icd11: updatedDiagnoses }, { merge: true }); } catch (err) { console.error("Error assigning ICD-11 diagnosis:", err); setAppError("Fehler beim Zuweisen der ICD-11 Diagnose."); } };
    const handleRemoveIcd11Diagnosis = async (diagnosisToRemove) => { if (!selectedPatient || !userId) return; const collectionPath = getPatientsCollectionPath(); if (!collectionPath) return; const updatedDiagnoses = selectedPatient.diagnoses_icd11.filter(d => d.date !== diagnosisToRemove.date); const patientRef = doc(db, collectionPath, selectedPatient.id); try { await setDoc(patientRef, { diagnoses_icd11: updatedDiagnoses }, { merge: true }); } catch (err) { console.error("Error removing ICD-11 diagnosis:", err); setAppError("Fehler beim Entfernen der ICD-11 Diagnose."); } };
    const handleAcceptImprovement = async () => { if (improvementState.sessionIndex === null || !selectedPatient || !userId) return; const collectionPath = getPatientsCollectionPath(); if (!collectionPath) return; const updatedSessions = JSON.parse(JSON.stringify(selectedPatient.sessions)); updatedSessions[improvementState.sessionIndex].notes = improvementState.improvedText; const patientRef = doc(db, collectionPath, selectedPatient.id); try { await setDoc(patientRef, { sessions: updatedSessions }, { merge: true }); setImprovementState({ isOpen: false, isLoading: false, originalText: '', improvedText: '', sessionIndex: null, error: null }); } catch (err) { console.error("Error updating session note:", err); setAppError("Fehler beim Aktualisieren der Sitzungsnotiz."); } };
    const handleSaveProfile = async (profileData) => { if (!userId) { setAppError("Benutzer nicht authentifiziert."); return; } const profileDocRef = doc(db, getProfileDocPath()); try { await setDoc(profileDocRef, profileData, { merge: true }); alert("Profil erfolgreich gespeichert!"); } catch (err) { console.error("Error saving profile:", err); setAppError(`Fehler beim Speichern des Profils: ${err.message}`); } };
    const handleUploadFile = async (file, path) => { if (!userId) throw new Error("Benutzer nicht authentifiziert."); setIsUploading(true); const storageRef = ref(storage, `users/${userId}/${path}/${file.name}`); try { const snapshot = await uploadBytes(storageRef, file); const downloadURL = await getDownloadURL(snapshot.ref); return downloadURL; } catch (error) { console.error("Upload failed", error); throw error; } finally { setIsUploading(false); } };

    const inputStd = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm";
    const btnPrimary = "bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm flex items-center justify-center transition-colors";
    const btnDanger = "bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-md flex items-center transition-colors";
    const btnInfo = "bg-sky-500 hover:bg-sky-600 text-white font-semibold py-1 px-2 text-xs rounded-md flex items-center transition-colors";
    const textareaStd = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm min-h-[150px]";

    const selectedIndex = useMemo(() => selectedId ? sortedPatients.findIndex(p => p.id === selectedId) : -1, [selectedId, sortedPatients]);
    const compactHeight = 160;
    const expandedHeight = 620;
    const overlap = 120;
    const visibleHeight = compactHeight - overlap;
    const totalHeight = (sortedPatients.length * visibleHeight) + overlap + (selectedIndex !== -1 ? (expandedHeight - compactHeight) : 0);

    const Sidebar = ({ currentView, setView }) => {
        const navItems = [
            { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon />, type: 'item' }, // *** NEU ***
            { id: 'profile', label: 'Profil', icon: <SettingsIcon />, type: 'item' },
            { id: 'kalender', label: 'Kalender', icon: <CalendarIcon />, type: 'item' },
            { type: 'heading', label: 'Patienten' },
            { id: 'patients', label: 'Patientenübersicht', icon: <Users />, type: 'item' },
            { type: 'heading', label: 'Verwaltung' },
            { id: 'abrechnung', label: 'Abrechnung', icon: <DollarSignIcon />, type: 'item' },
            { id: 'diagnostik', label: 'Diagnostik', icon: <BeakerIcon />, type: 'item' },
            { id: 'formulare', label: 'Formulare', icon: <PaperclipIcon />, type: 'item' },
            { type: 'heading', label: 'Nachschlagewerke' },
            { id: 'ebm', label: 'EBM', icon: <List />, type: 'item' },
            { id: 'ebm_templates', label: 'EBM Vorlagen', icon: <ClipboardListIcon />, type: 'item' },
            { id: 'icd11', label: 'ICD-11', icon: <BookOpen />, type: 'item' },
            { id: 'methoden', label: 'Behandlungsmethoden', icon: <LayersIcon />, type: 'item' },
        ];

        return (
            <aside className="w-64 bg-slate-100 border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200"><h1 className="text-xl font-bold text-teal-700 tracking-tight">Therapie-Dashboard</h1></div>
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item, index) =>
                        item.type === 'heading' ? (
                            <h3 key={`heading-${index}`} className="px-3 pt-4 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.label}</h3>
                        ) : (
                            <button key={item.id} onClick={() => { setView(item.id); setSelectedPatient(null); }} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === item.id ? 'bg-teal-100 text-teal-800' : 'text-slate-700 hover:bg-slate-200'}`}>
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                </nav>
                <div className="p-4 border-t border-slate-200"><p className="text-xs text-slate-500">UserID: {userId}</p></div>
            </aside>
        );
    };

    const PatientDetailHeader = ({ patient, onDeselect, onEdit }) => {
        const therapyStartDate = useMemo(() => { if (!patient || !patient.sessions) return "-"; const firstSession = patient.sessions.filter(s => s.structuredNotes?.sitzungsnummer === 1).sort((a, b) => new Date(a.date) - new Date(b.date))[0]; return firstSession ? new Date(firstSession.date).toLocaleDateString('de-DE') : '-'; }, [patient]);
        const conductedHours = useMemo(() => getHighestSessionNumber(patient?.sessions), [patient]);
        return (<>
            <div className="flex justify-between items-center mb-1">
                <h3 className="text-2xl font-semibold text-gray-800">{patient.vorname} {patient.name}</h3>
                <div className="flex items-center space-x-2">
                    <button onClick={onEdit} className="text-gray-500 hover:text-teal-600 p-1 rounded-full hover:bg-gray-100 transition-colors" title="Stammdaten bearbeiten">
                        <Edit3 />
                    </button>
                    <button onClick={onDeselect} className="text-gray-400 hover:text-gray-600"><XCircle /></button>
                </div>
            </div>
            <div className="mb-4 text-sm text-gray-500 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1"> <span><strong className="font-semibold">Kasse:</strong> {patient.krankenkasse || '-'}</span> <span><strong className="font-semibold">Vers.-Nr.:</strong> {patient.versichertennummer || '-'}</span> <span><strong className="font-semibold">Therapiebeginn:</strong> {therapyStartDate}</span> <span><strong className="font-semibold">Stunden:</strong> {conductedHours} / {patient.approvedHours}</span> </div>
        </>);
    };

    if (isInitialLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-100">
                <DotLottieReact
                    src="https://lottie.host/db9305b2-bb1c-47b1-9c19-d2d744a378b1/yrWh6LccRW.json"
                    loop
                    autoplay
                />
            </div>
        );
    }

    if (!isAuthReady) return <div className="flex justify-center items-center h-screen text-xl font-semibold text-gray-600 bg-slate-100">Authentifizierung wird initialisiert...</div>;
    if (!userId) { return (<div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4"> <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-gray-200"> <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">{isLoginView ? "Login Patientenverwaltung" : "Registrierung"}</h1> {authError && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{authError}</p>} <form onSubmit={(e) => { e.preventDefault(); handleAuthAction(!isLoginView); }} className="space-y-6"> <div><label htmlFor="email" className="block text-sm font-medium text-gray-700">E-Mail Adresse</label><input type="email" name="email" id="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputStd} /></div> <div><label htmlFor="password" className="block text-sm font-medium text-gray-700">Passwort</label><input type="password" name="password" id="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputStd} /></div> <button type="submit" disabled={isAuthLoading} className={`${btnPrimary} w-full py-2.5 text-base ${isAuthLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>{isAuthLoading ? (isLoginView ? "Anmelden..." : "Registrieren...") : (isLoginView ? "Anmelden" : "Registrieren")}</button> </form> <button onClick={() => { setIsLoginView(!isLoginView); setAuthError(null); }} className="mt-6 text-sm text-teal-600 hover:text-teal-500 text-center w-full">{isLoginView ? "Noch kein Konto? Jetzt registrieren." : "Bereits registriert? Zum Login."}</button> </div> </div>); }

    return (
        <div className="h-screen w-full bg-slate-50 font-sans flex overflow-hidden">
            <Sidebar currentView={mainView} setView={setMainView} />
            <div className="flex-1 flex flex-col">
                <header className="bg-white border-b border-slate-200"><div className="mx-auto px-6 py-3 flex justify-between items-center"><h2 className="text-xl font-semibold text-gray-800 capitalize">{mainView.replace(/_/g, ' ')}</h2><button onClick={handleLogout} className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-md text-sm flex items-center transition-colors"><LogOut className="mr-2 h-4 w-4" /> Logout</button></div></header>
                <main className="flex-1 overflow-y-auto p-6 relative">
                    <ConfirmationModal isOpen={confirmDeleteState.isOpen} onClose={() => setConfirmDeleteState({ isOpen: false })} onConfirm={confirmDeleteState.onConfirm} title={confirmDeleteState.title} message={confirmDeleteState.message} />
                    <Modal isOpen={isPatientModalOpen} onClose={() => setIsPatientModalOpen(false)} title={editingPatient ? "Patient bearbeiten" : "Neuen Patienten anlegen"}><PatientForm patient={editingPatient} onSave={handleSavePatient} onCancel={() => setIsPatientModalOpen(false)} /></Modal>
                    
                    {mainView === 'dashboard' && <Dashboard patients={patients} profile={profile} />}
                    {mainView === 'profile' && (<Profile initialProfile={profile} onSave={handleSaveProfile} onUploadFile={handleUploadFile} isUploading={isUploading} />)}
                    {mainView === 'abrechnung' && (<Billing unbilledAppointments={unbilledAppointments} isLoading={isLoadingAppointments} onStartBilling={handleStartBilling} onStartManualBilling={() => setIsManualBillingSetupOpen(true)} />)}
                    
                    {mainView === 'patients' && (
                        !selectedPatient ? (
                            <div>
                                <div className="mb-4 flex justify-between items-center">
                                    <h3 className="text-2xl font-semibold text-gray-800">Patientenübersicht</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1 bg-gray-200 p-1 rounded-lg">
                                            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow' : 'text-gray-500 hover:bg-white/50'}`} title="Rasteransicht"><LayoutGridIcon /></button>
                                            <button onClick={() => setViewMode('stack')} className={`p-1.5 rounded-md ${viewMode === 'stack' ? 'bg-white shadow' : 'text-gray-500 hover:bg-white/50'}`} title="Stapelansicht"><LayersIcon /></button>
                                        </div>
                                        <button onClick={() => { setEditingPatient(null); setIsPatientModalOpen(true); }} className={btnPrimary}>
                                            <UserPlus className="w-5 h-5 mr-2" /> Patient hinzufügen
                                        </button>
                                    </div>
                                </div>
                                {viewMode === 'grid' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {isLoading && <p className="col-span-full text-center py-10 text-gray-500">Lade Patienten...</p>}
                                        {!isLoading && sortedPatients.map((patient) => (
                                            <motion.div
                                                key={patient.id}
                                                layoutId={patient.id}
                                                onDoubleClick={() => handlePatientDoubleClick(patient)}
                                                className="bg-white rounded-lg shadow-md cursor-pointer hover:shadow-xl transition-shadow duration-300"
                                            >
                                                <div className="p-4 border-b-4 border-teal-500">
                                                    <h4 className="font-bold text-gray-800 truncate">{patient.name}, {patient.vorname}</h4>
                                                    <p className="text-sm text-gray-500 font-mono">{patient.chiffre}</p>
                                                </div>
                                                <div className="p-4 text-xs text-gray-600">
                                                    <p><strong>Diagnose:</strong> {(patient.diagnoses && patient.diagnoses[0]?.split(':')[0]) || 'N/A'}</p>
                                                    <p><strong>Stunden:</strong> {getHighestSessionNumber(patient.sessions)} / {patient.approvedHours || 'N/A'}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                                {viewMode === 'stack' && (
                                    <div className="w-full max-w-5xl mx-auto flex flex-col items-center pt-8 pb-8">
                                        {isLoading && <p className="text-center py-10 text-gray-500">Lade Patienten...</p>}
                                        <div className="w-full relative" style={{ height: `${totalHeight}px`, transition: 'height 0.4s ease-in-out' }}>
                                            <AnimatePresence>
                                                {sortedPatients.map((patient, index) => {
                                                    const isSelected = selectedId === patient.id;
                                                    const tabColors = ["bg-blue-100 text-blue-800 border-blue-200", "bg-orange-100 text-orange-800 border-orange-200", "bg-teal-100 text-teal-800 border-teal-200", "bg-purple-100 text-purple-800 border-purple-200", "bg-yellow-100 text-yellow-800 border-yellow-200"];
                                                    const tabColor = tabColors[index % tabColors.length];
                                                    let bottomPos = index * visibleHeight;
                                                    if (selectedIndex !== -1 && index > selectedIndex) {
                                                        bottomPos += expandedHeight - compactHeight;
                                                    }
                                                    return (
                                                        <motion.div
                                                            key={patient.id}
                                                            layoutId={patient.id}
                                                            className="absolute w-full cursor-pointer"
                                                            style={{ height: isSelected ? expandedHeight : compactHeight }}
                                                            animate={{ bottom: bottomPos, zIndex: isSelected ? 20 : sortedPatients.length - index }}
                                                            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                                                            onClick={() => handlePatientSelectPreview(patient)}
                                                            onDoubleClick={() => handlePatientDoubleClick(patient)}
                                                            whileHover={!isSelected ? { y: -10, scale: 1.02 } : {}}
                                                        >
                                                            <div className={`relative w-full h-full rounded-lg transition-shadow duration-300 ${isSelected ? 'shadow-2xl' : 'shadow-md hover:shadow-xl'}`}>
                                                                <div className={`absolute h-10 px-4 flex items-center font-medium rounded-t-lg border-t border-x transition-colors ${isSelected ? 'bg-white' : tabColor}`} style={{ left: `${5 + (index % 6) * 12}%`, top: '-1px' }}>
                                                                    {patient.name}
                                                                </div>
                                                                <div className="bg-white rounded-b-lg rounded-tr-lg border w-full h-full pt-10 overflow-hidden">
                                                                    {isSelected && selectedPatient ? (
                                                                        <div className="p-6 overflow-y-auto h-full">
                                                                            <PatientDetailHeader patient={selectedPatient} onDeselect={() => handlePatientSelectPreview(patient)} onEdit={() => { setEditingPatient(selectedPatient); setIsPatientModalOpen(true); }}/>
                                                                            <div className="border-t pt-4 mt-4">
                                                                                <PatientOverviewTab patient={selectedPatient} nextAppointment={nextAppointment} onUpdateHomeworkStatus={handleUpdateHomeworkStatus} onUpdateQuickNote={handleUpdateQuickNote} />
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="p-4 h-full">
                                                                            <h4 className="font-semibold text-lg text-gray-900 pt-2">{patient.vorname} {patient.name}</h4>
                                                                            <p className="text-gray-500 font-mono">{patient.chiffre}</p>
                                                                            <div className="mt-2 text-xs text-gray-600"><p>Sitzungen: {patient.sessions?.length || 0}</p></div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                             <div ref={detailViewRef} className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 h-full flex flex-col">
                                <PatientDetailHeader patient={selectedPatient} onDeselect={() => setSelectedPatient(null)} onEdit={() => { setEditingPatient(selectedPatient); setIsPatientModalOpen(true); }}/>
                                <div className="border-b border-gray-200 mb-6"><nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto" aria-label="Tabs">{['Übersicht', 'Diagnosen', 'Abrechnung', 'Krankheitsmodell', 'Diagnostik', 'Assistenz'].map(tab => (<button key={tab} onClick={() => setActiveDetailTab(tab.toLowerCase())} className={`capitalize whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeDetailTab === tab.toLowerCase() ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{tab}</button>))}</nav></div>

                                <div className="flex-grow overflow-y-auto pr-4 -mr-4">
                                    {activeDetailTab === 'übersicht' && ( <PatientOverviewTab patient={selectedPatient} nextAppointment={nextAppointment} onUpdateHomeworkStatus={handleUpdateHomeworkStatus} onUpdateQuickNote={handleUpdateQuickNote} /> )}
                                    {activeDetailTab === 'diagnosen' && (<div><div className="mb-6"><h4 className="text-xl font-semibold text-gray-700 mb-3">ICD-10 F-Diagnosen</h4><div className="mb-3 p-4 bg-gray-50 rounded-md border"><div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"><div><label htmlFor="newDiagnosisCode" className="block text-xs font-medium text-gray-700">Code (z.B. F32.2)</label><input type="text" id="newDiagnosisCode" value={newDiagnosisCode} onChange={(e) => setNewDiagnosisCode(e.target.value.toUpperCase())} placeholder="F-Code" className={`${inputStd} mt-1`} /></div><div><label htmlFor="newDiagnosisSicherheit" className="block text-xs font-medium text-gray-700">Sicherheit</label><select id="newDiagnosisSicherheit" value={newDiagnosisSicherheit} onChange={(e) => setNewDiagnosisSicherheit(e.target.value)} className={`${inputStd} mt-1`}><option value="G">G (Gesichert)</option><option value="V">V (Verdacht auf)</option><option value="A">A (Ausschluss)</option><option value="ZN">ZN (Zustand nach)</option></select></div><div className="md:col-span-1"><label htmlFor="newDiagnosisName" className="block text-xs font-medium text-gray-700">Manuelle Beschreibung (optional)</label><input type="text" id="newDiagnosisName" value={newDiagnosis} onChange={(e) => setNewDiagnosis(e.target.value)} placeholder="Eigene Beschreibung" className={`${inputStd} mt-1`} /></div><button onClick={handleAddDiagnosis} className={`${btnPrimary} bg-green-500 hover:bg-green-600 py-2 px-3 h-10 md:self-end`}><PlusCircleIcon className="w-5 h-5 mr-1" /> Hinzufügen</button></div>{lookedUpDiagnosisName && <p className="text-xs text-teal-600 mt-1">Gefunden: {lookedUpDiagnosisName}</p>}</div><ul className="space-y-1 mb-3">{(selectedPatient.diagnoses || []).map((diagString, index) => (<li key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded-md"><span className="text-sm text-gray-700">{diagString}</span><div className="flex items-center space-x-2"><button onClick={() => showDiagnosisInfo(diagString)} className={`${btnInfo} p-1`} title="Info zu dieser Diagnose abrufen"><FileJson2 className="w-4 h-4 mr-1" /> Info</button><button onClick={() => handleRemoveDiagnosis(diagString)} className={`${btnDanger} p-1 text-xs`}><Trash2 className="w-4 h-4" /></button></div></li>))}{(selectedPatient.diagnoses || []).length === 0 && <p className="text-sm text-gray-500">Keine Diagnosen erfasst.</p>}</ul></div><div className="mb-6"><h4 className="text-xl font-semibold text-gray-700 mb-3">ICD-11 Diagnosen</h4><ul className="space-y-1">{(selectedPatient.diagnoses_icd11 || []).map((diag, index) => (<li key={index} className="flex justify-between items-center bg-purple-50 p-2 rounded-md hover:bg-purple-100 cursor-pointer" onClick={() => fetchIcd11Details(diag)}><span className="text-sm text-purple-800"><strong className="font-mono">{diag.code}</strong> - {diag.title}</span><button onClick={(e) => { e.stopPropagation(); handleRemoveIcd11Diagnosis(diag); }} className="text-red-500 hover:text-red-700 p-1 text-xs" title="ICD-11 Diagnose entfernen"><Trash2 className="w-4 h-4" /></button></li>))}{(selectedPatient.diagnoses_icd11 || []).length === 0 && <p className="text-sm text-gray-500">Keine ICD-11 Diagnosen erfasst.</p>}</ul></div></div>)}
                                    {activeDetailTab === 'abrechnung' && ( <AbrechnungsUebersicht patient={selectedPatient} availableTests={availableTests} quarterlyAnalysis={quarterlyDiagnostikAnalysis} onEditSession={handleEditSession} onDeleteSession={handleDeleteSession} onAddBillingPeriod={() => setIsAddBillingPeriodModalOpen(true)} onDeleteBillingPeriod={handleDeleteBillingPeriod} /> )}
                                    {activeDetailTab === 'krankheitsmodell' && (<div className="space-y-6"><div><label htmlFor="krankheitsanamnese" className="block text-lg font-semibold text-gray-700 mb-1">Krankheitsanamnese</label><textarea id="krankheitsanamnese" name="krankheitsanamnese" rows="6" className={textareaStd} value={editableKrankheitsanamnese} onChange={(e) => setEditableKrankheitsanamnese(e.target.value)} onBlur={(e) => handleKrankheitsmodellChange('krankheitsanamnese', e.target.value)} placeholder="Hier die Krankheitsanamnese eintragen..."></textarea></div><div><label htmlFor="lebensgeschichte" className="block text-lg font-semibold text-gray-700 mb-1">Lebensgeschichte / Biographie</label><textarea id="lebensgeschichte" name="lebensgeschichte" rows="6" className={textareaStd} value={editableLebensgeschichte} onChange={(e) => setEditableLebensgeschichte(e.target.value)} onBlur={(e) => handleKrankheitsmodellChange('lebensgeschichte', e.target.value)} placeholder="Wichtige Aspekte der Lebensgeschichte..."></textarea></div><div><label htmlFor="problemanalyseMakro" className="block text-lg font-semibold text-gray-700 mb-1">Problemanalyse auf Makroebene</label><textarea id="problemanalyseMakro" name="problemanalyseMakro" rows="6" className={textareaStd} value={editableProblemanalyseMakro} onChange={(e) => setEditableProblemanalyseMakro(e.target.value)} onBlur={(e) => handleKrankheitsmodellChange('problemanalyseMakro', e.target.value)} placeholder="Analyse der übergeordneten Problembereiche..."></textarea></div><div><label htmlFor="therapieplan" className="block text-lg font-semibold text-gray-700 mb-1">Therapieplan</label><textarea id="therapieplan" name="therapieplan" rows="6" className={textareaStd} value={editableTherapieplan} onChange={(e) => setEditableTherapieplan(e.target.value)} onBlur={(e) => handleKrankheitsmodellChange('therapieplan', e.target.value)} placeholder="Therapieziele und -maßnahmen..."></textarea></div></div>)}
                                    {activeDetailTab === 'diagnostik' && (
                                        <div>
                                            <div className="border-b border-gray-200 mb-4">
                                                <nav className="-mb-px flex space-x-6" aria-label="Diagnostik Sub-Tabs">
                                                    <button onClick={() => setActiveDiagnostikSubTab('overview')} className={`whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm ${activeDiagnostikSubTab === 'overview' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Übersicht</button>
                                                    {availableTests.map(test => ((selectedPatient[`${test.id}Results`]?.filter(t => t.status !== 'pending').length > 0) &&
                                                        <button key={test.id} onClick={() => setActiveDiagnostikSubTab(test.id)} className={`whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm ${activeDiagnostikSubTab === test.id ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{test.id.toUpperCase()}</button>
                                                    ))}
                                                </nav>
                                            </div>
                                            {activeDiagnostikSubTab === 'overview' && ( <DiagnostikZuordnung patient={selectedPatient} availableTests={availableTests} testCategories={testCategories} diagnostikTemplates={diagnostikTemplates} onCompleteTest={handleCompletePendingTest} onDeleteTest={handleDeleteTest} onUpdateTestGrund={handleUpdateTestGrund} onAddNewTest={handleAddPendingTest}/> )}
                                            {activeDiagnostikSubTab === 'scl90r' && <SCL90RComponent patient={selectedPatient} onDeleteTest={handleDeleteTest} />}
                                            {activeDiagnostikSubTab === 'fep2' && <FEP2Component patient={selectedPatient} onDeleteTest={handleDeleteTest} />}
                                            {activeDiagnostikSubTab === 'bdi2' && <BDI2Component patient={selectedPatient} onDeleteTest={handleDeleteTest} bdiCutoffs={bdiCutoffs} bdiAxisTicks={bdiAxisTicks} />}
                                            {activeDiagnostikSubTab === 'hscl11' && <HSCL11Component patient={selectedPatient} onDeleteTest={handleDeleteTest} />}
                                            {activeDiagnostikSubTab === 'gad7' && <GAD7Component patient={selectedPatient} onDeleteTest={handleDeleteTest} />}
                                            {activeDiagnostikSubTab === 'coreOm' && <CoreOmComponent patient={selectedPatient} onDeleteTest={handleDeleteTest} />}
                                            {activeDiagnostikSubTab === 'iipc' && <IIPCComponent patient={selectedPatient} onDeleteTest={handleDeleteTest} />}
                                        </div>
                                    )}                                        {activeDetailTab === 'assistenz' && (<div><h3 className="text-xl font-semibold text-gray-700 mb-4">Therapeutische Assistenz</h3><button onClick={handleTherapeutischeAssistenzAnfordern} disabled={isLoadingTherapeutischeAssistenz} className={`${btnPrimary} bg-purple-600 hover:bg-purple-700 mb-4 flex items-center`}><WandSparkles className="mr-2 h-5 w-5" />{isLoadingTherapeutischeAssistenz ? "Analysiere Daten..." : "Expertenfeedback anfordern"}</button>{isLoadingTherapeutischeAssistenz && (<div className="text-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div><p className="mt-3 text-gray-600">Bitte warten, die KI analysiert die Patientendaten...</p></div>)}{assistenzError && (<div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert"><p className="font-bold">Fehler bei der Assistenz</p><p>{assistenzError}</p></div>)}{therapeutischeAssistenzOutput && !isLoadingTherapeutischeAssistenz && (<div className="mt-4 p-4 bg-gray-50 rounded-md border"><h4 className="text-lg font-semibold text-gray-800 mb-2">Vorschläge des Expertenteams:</h4><div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{therapeutischeAssistenzOutput}</div></div>)}</div>)}
                                </div>
                            </div>
                        )
                    )}
                    {mainView === 'kalender' && ( <div> <h3 className="text-2xl font-semibold text-gray-800 mb-4">Terminkalender</h3> <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 relative min-h-[600px]"> {isCalendarLoading && ( <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10"> <DotLottieReact src="https://lottie.host/5a99e4b7-42e6-47ae-9706-1e931f930492/HSS5faWD7S.lottie" loop autoplay style={{ width: 300, height: 300 }} /> <p className="text-gray-500 -mt-8">Kalender wird geladen...</p> </div> )} <iframe title="Google Calendar" src="https://calendar.google.com/calendar/embed?src=julisycomorepsy%40gmail.com&ctz=Europe%2FBerlin" style={{ border: 0 }} width="100%" height="600" frameBorder="0" scrolling="no" className={`transition-opacity duration-500 ${isCalendarLoading ? 'opacity-0' : 'opacity-100'}`} ></iframe> </div> </div> )}
                    {mainView === 'formulare' && ( <PtvFormGenerator patients={sortedPatients} therapistProfile={profile} /> )}
                    {mainView === 'ebm' && (<EBMBrowser />)}
                    {mainView === 'ebm_templates' && (<EbmTemplates templates={ebmTemplates} ebmData={ebmData} onSave={handleSaveEbmTemplate} onDelete={handleDeleteEbmTemplate} />)}

                    {mainView === 'diagnostik' && (
                        <DiagnostikHauptseite
                            availableTests={availableTests}
                            testCategories={testCategories}
                            diagnostikTemplates={diagnostikTemplates}
                            onAddTest={handleOpenZentraleTestModal}
                            onAddTemplate={handleOpenTemplateModal}
                            onAddTemplateDefinition={() => { setEditingTemplate(null); setTemplateEditModalOpen(true); }}
                            onEditTemplateDefinition={(template) => { setEditingTemplate(template); setTemplateEditModalOpen(true); }}
                            onDeleteTemplateDefinition={handleDeleteDiagnostikTemplate}
                        />
                    )}

                    {mainView === 'icd11' && (<ICD11ECTBrowser patients={patients} selectedPatient={selectedPatient} onAssignDiagnosis={handleAssignIcd11Diagnosis} />)}
                    {mainView === 'methoden' && (<Behandlungsmethoden />)}

                </main>
            </div>
            {/* MODALS AND GLOBAL ELEMENTS */}
            <Modal isOpen={diagnosisInfo.isOpen} onClose={() => setDiagnosisInfo(prev => ({ ...prev, isOpen: false }))} title={`Diagnose-Info: ${diagnosisInfo.code || ''}`} size="3xl">{diagnosisInfo.isLoading && (<p className="text-center py-4">Informationen werden geladen...</p>)}{diagnosisInfo.error && (<p className="text-red-600 bg-red-100 p-3 rounded-md">Fehler: {diagnosisInfo.error}</p>)}{!diagnosisInfo.isLoading && diagnosisInfo.source === 'local' && (<div className="text-sm text-gray-700 leading-relaxed p-2 space-y-3"><h3 className="text-lg font-semibold text-teal-700">{diagnosisInfo.name}<span className="text-gray-500 text-base ml-2">({diagnosisInfo.code})</span></h3>{diagnosisInfo.beschreibung && (<div><strong className="font-medium text-gray-800 block mb-1">Beschreibung:</strong><p className="whitespace-pre-wrap">{diagnosisInfo.beschreibung}</p></div>)}{diagnosisInfo.inkl?.length > 0 && (<div><strong className="font-medium text-gray-800 block mb-1">Inklusive:</strong><ul className="list-disc list-inside">{diagnosisInfo.inkl.map((item, idx) => (<li key={idx}>{item}</li>))}</ul></div>)}{diagnosisInfo.exkl?.length > 0 && (<div><strong className="font-medium text-gray-800 block mb-1">Exklusive:</strong><ul className="list-disc list-inside">{diagnosisInfo.exkl.map((item, idx) => (<li key={idx}>{item}</li>))}</ul></div>)}</div>)}{!diagnosisInfo.isLoading && diagnosisInfo.source === 'api_detail' && (<div className="text-sm text-gray-700 leading-relaxed p-2 space-y-4"><h3 className="text-lg font-semibold text-purple-700">{diagnosisInfo.name}<span className="text-gray-500 text-base ml-2 font-mono">({diagnosisInfo.code})</span></h3>{diagnosisInfo.beschreibung && (<div><strong className="font-medium text-gray-800 block mb-1">Beschreibung (Definition):</strong><p className="whitespace-pre-wrap bg-gray-50 p-2 rounded-md">{diagnosisInfo.beschreibung}</p></div>)}{diagnosisInfo.inclusions?.length > 0 && (<div><strong className="font-medium text-gray-800 block mb-1">Inklusive:</strong><ul className="list-disc list-inside pl-2 space-y-1">{diagnosisInfo.inclusions.map((item, idx) => (<li key={idx}>{item.label['@value']}</li>))}</ul></div>)}{diagnosisInfo.exclusions?.length > 0 && (<div><strong className="font-medium text-gray-800 block mb-1">Exklusive:</strong><ul className="list-disc list-inside pl-2 space-y-1">{diagnosisInfo.exclusions.map((item, idx) => (<li key={idx}>{item.label['@value']}{item.foundationReference && <span className="text-xs text-gray-400 ml-2">({item.foundationReference.split('/').pop()})</span>}</li>))}</ul></div>)}</div>)}</Modal>
            <Modal isOpen={improvementState.isOpen} onClose={() => setImprovementState({ ...improvementState, isOpen: false })} title="Sitzungsdokumentation verbessern" size="5xl">{improvementState.error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{improvementState.error}</p>}<div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><h4 className="font-semibold text-lg text-gray-700 mb-2">Original</h4><pre className="text-sm bg-gray-100 p-3 rounded-md whitespace-pre-wrap font-sans h-96 overflow-y-auto border">{improvementState.originalText}</pre></div><div><h4 className="font-semibold text-lg text-gray-700 mb-2">Vorschlag</h4><pre className="text-sm bg-gray-800 text-green-300 font-mono p-3 rounded-md whitespace-pre-wrap h-96 overflow-y-auto">{improvementState.improvedText}</pre></div></div><div className="flex justify-end space-x-4 mt-6"><button type="button" onClick={() => setImprovementState({ ...improvementState, isOpen: false })} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Abbrechen</button><button onClick={handleAcceptImprovement} className={`${btnPrimary} flex items-center`}><Save className="w-4 h-4 mr-2" /> Original ersetzen</button></div></Modal>
            {appError && (<div className="fixed bottom-4 right-4 p-4 max-w-sm text-sm text-red-700 bg-red-100 border border-red-400 rounded-md shadow-lg z-[100]">{appError}<button onClick={() => setAppError(null)} className="ml-4 mt-2 sm:mt-0 sm:ml-2 px-2 py-1 text-red-900 underline rounded-md hover:bg-red-200 text-xs">Ok</button></div>)}
            
            <ManualBillingSetupModal isOpen={isManualBillingSetupOpen} onClose={() => setIsManualBillingSetupOpen(false)} patients={sortedPatients} onStart={handleStartManualBilling} />
            <AddBillingPeriodModal isOpen={isAddBillingPeriodModalOpen} onClose={() => setIsAddBillingPeriodModalOpen(false)} onSave={handleSaveBillingPeriod} patient={selectedPatient} />

            <AddTestTemplateModal
                isOpen={isAddTemplateModalOpen}
                onClose={() => setIsAddTemplateModalOpen(false)}
                onSave={handleSaveTestTemplate}
                template={currentTemplate}
                patients={sortedPatients}
                availableTests={availableTests}
            />

            <AddOrEditTemplateModal
                isOpen={isTemplateEditModalOpen}
                onClose={() => setTemplateEditModalOpen(false)}
                onSave={handleSaveDiagnostikTemplate}
                availableTests={availableTests}
                editingTemplate={editingTemplate}
            />

            {billingModalState.isOpen && (
                <Modal isOpen={billingModalState.isOpen} onClose={() => setBillingModalState({ isOpen: false, event: null, isEditing: false })} title={billingModalState.isEditing ? "Sitzung bearbeiten" : `Termin abrechnen: ${billingModalState.event.summary}`} size="4xl" >
                    <BillingModal
                        event={billingModalState.event}
                        ebmData={ebmData}
                        onSave={(data) => handleSaveBilling(data, billingModalState.isEditing)}
                        onClose={() => setBillingModalState({ isOpen: false, event: null, isEditing: false })}
                        generateGeminiText={generateGeminiText}
                        isEditing={billingModalState.isEditing}
                        ebmTemplates={ebmTemplates}
                    />
                </Modal>
            )}

            <ZentraleTestErfassungModal
                isOpen={isZentraleTestModalOpen}
                onClose={() => { setIsZentraleTestModalOpen(false); setTestToUpdate(null); }}
                onSave={handleSaveCompletedTest}
                onUpdate={handleUpdateTest}
                testInfo={currentTestToErfassen}
                testToUpdate={testToUpdate}
                patients={sortedPatients}
                activePatient={selectedPatient}
            />
        </div>
    );
}

export default App;
