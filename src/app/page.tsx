"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type Language = "it" | "en" | "de";
type FormType = "post" | "pre" | "injury" | null;
type PreSection = "recovery" | "menstrual" | null;
type SymptomSeverity = 0 | 1 | 2 | null;
type UserProfile = {
  id: string;
  role: "athlete" | "staff" | "admin";
  team_id: string | null;
  athlete_id: string | null;
  login_id: string | null;
  active: boolean;
};


const translations = {
  it: {
    chooseLanguage: "Scegli la lingua",
    appTitle: "Player Monitoring",

    whatCompile: "Cosa vuoi compilare?",
    postTraining: "Post-allenamento",
    postTrainingDescription:
      "Inserisci la percezione dello sforzo della sessione",

    preTraining: "Pre-allenamento",
    preTrainingDescription:
      "Recupero, benessere e monitoraggio del ciclo",

    injuries: "Infortuni",
    injuriesDescription:
      "Segnala un problema fisico o un infortunio",

    backMenu: "← Torna al menu",
    backPre: "← Pre-allenamento",
    changeLanguage: "Cambia lingua",

    chooseQuestionnaire: "Seleziona il questionario da compilare",

    recovery: "Recupero",
    recoveryDescription: "Hooper Index e Total Quality Recovery",
    recoveryBuilding: "Questionario in costruzione",

    menstrualCycle: "Ciclo mestruale",
    menstrualDescription: "Monitoraggio dei sintomi mestruali",
    menstrualInstructions:
      "Indica l'intensità di ciascun sintomo riferita a oggi.",

    completion: "Completamento",

    absent: "Non presente",
    mildModerate: "Lieve / moderato",
    strong: "Forte",

    answerAll:
      "Rispondi a tutti i 18 sintomi per completare il questionario.",

    submit: "Invia",

    sending: "Invio in corso...",

    submitError: "Errore durante il salvataggio.",
    loginTitle: "Accedi al tuo account",
    loginButton: "Accedi",

    loginLoading: "Accesso...",

    loading: "Caricamento...",
    
    invalidCredentials: "ID o password non corretti.",

    postSubtitle: "Valuta lo sforzo percepito della sessione",
    wellnessQuestion: "Come ti senti oggi?",
    veryBad: "Molto male",
    veryGood: "Molto bene",

    rpeQuestion: "Quanto è stato intenso l'allenamento?",
    selectSlider: "Seleziona il valore utilizzando il cursore",
    noValue: "Nessun valore selezionato",

    injuryTitle: "Infortuni",
    injurySubtitle: "Segnalazione di problemi fisici e infortuni",
    injuryBuilding: "Questionario in costruzione",

    success: "Dati registrati correttamente!",
    menstrualTestSuccess:
      "Questionario completato. Nel prossimo passaggio collegheremo questi dati a Supabase.",

    categories: {
      gastrointestinal: "Sintomi fisici / gastrointestinali",
      musculoskeletal:
        "Dolori muscolo-scheletrici e sensazioni corporee",
      neurological: "Sintomi neurologici e cognitivi",
      psychological: "Sintomi psicologici / comportamentali",
    },
    
    tqrTitle: "Total Quality Recovery",
    tqrInstruction: "Seleziona il valore che descrive meglio il tuo livello di recupero",
    tqrNoValue: "Nessun valore selezionato",

    hooperTitle: "Hooper Index",
    hooperInstruction: "Valuta il tuo stato attuale per ciascuna dimensione",

    sleepQuality: "Qualità del sonno",
    fatigue: "Fatica",
    stress: "Stress",
    muscleSoreness: "Dolore muscolare",
    psychologicalWellbeing: "Benessere psicologico",

    low: "Basso",
    high: "Alto",

    healthTitle: "Problemi di salute",
    
    // OSTRC questionnaire italiano

    healthSubtitle: "Questionario settimanale - ultimi 7 giorni",

    q1Title: "Partecipazione",
    q1Question:
      "Negli ultimi 7 giorni, quanto hai potuto partecipare normalmente ad allenamenti e partite?",

    q1Options: [
      "Partecipazione completa senza problemi di salute",
      "Partecipazione completa, ma con un problema di salute",
      "Partecipazione ridotta a causa di un problema di salute",
      "Impossibile partecipare a causa di un problema di salute",
    ],

    q2Title: "Modifica dell'attività",
    q2Question:
      "Negli ultimi 7 giorni, quanto hai dovuto modificare o ridurre allenamenti o partite a causa del problema?",

    q3Title: "Performance",
    q3Question:
      "Negli ultimi 7 giorni, quanto il problema ha influenzato la tua performance?",

    q4Title: "Sintomi",
    q4Question:
      "Negli ultimi 7 giorni, quanto sono stati intensi i sintomi associati al problema?",

    severityOptions: [
      "Per niente",
      "Lievemente",
      "Moderatamente",
      "Molto",
    ],

    problemType: "Tipo di problema",
    injuryOption: "Infortunio",
    illnessOption: "Malattia",
    otherOption: "Altro problema di salute",

    anatomicalArea: "Area anatomica",
    anatomicalPlaceholder: "Es. ginocchio, caviglia, coscia",

    side: "Lato",
    right: "Destro",
    left: "Sinistro",
    bilateral: "Bilaterale",
    notApplicable: "Non applicabile",

    problemStatus: "Stato del problema",
    newProblem: "Nuovo",
    ongoingProblem: "In corso",
    recurrentProblem: "Ricorrente",

    timeLoss: "Giorni completamente persi",
    timeLossPlaceholder: "Es. 2",

    notes: "Note opzionali",
    notesPlaceholder: "Aggiungi eventuali informazioni utili",

    healthSubmit: "Invia questionario settimanale",
  },

  en: {
    chooseLanguage: "Choose language",
    appTitle: "Player Monitoring",

    whatCompile: "What would you like to complete?",
    postTraining: "Post-training",
    postTrainingDescription:
      "Enter your perceived exertion for the session",

    preTraining: "Pre-training",
    preTrainingDescription:
      "Recovery, wellness and menstrual cycle monitoring",

    injuries: "Injuries",
    injuriesDescription:
      "Report a physical problem or injury",

    backMenu: "← Back to menu",
    backPre: "← Pre-training",
    changeLanguage: "Change language",

    chooseQuestionnaire: "Select the questionnaire to complete",

    recovery: "Recovery",
    recoveryDescription: "Hooper Index and Total Quality Recovery",
    recoveryBuilding: "Questionnaire under development",

    menstrualCycle: "Menstrual cycle",
    menstrualDescription: "Menstrual symptom monitoring",
    menstrualInstructions:
      "Indicate the severity of each symptom today.",


    completion: "Completion",

    absent: "Not present",
    mildModerate: "Mild / moderate",
    strong: "Severe",

    answerAll:
      "Answer all 18 symptoms to complete the questionnaire.",

    submit: "Submit",

    sending: "Submitting...",

    submitError: "An error occurred while saving.",
    loginTitle: "Sign in to your account",
    loginButton: "Sign in",

    loginLoading: "Signing in...",

    loading: "Loading...",
    
    invalidCredentials: "Incorrect ID or password.",

    postSubtitle: "Rate the perceived exertion of the session",
    wellnessQuestion: "How do you feel today?",
    veryBad: "Very bad",
    veryGood: "Very good",

    rpeQuestion: "How intense was the training session?",
    selectSlider: "Select the value using the slider",
    noValue: "No value selected",

    injuryTitle: "Injuries",
    injurySubtitle: "Report physical problems and injuries",
    injuryBuilding: "Questionnaire under development",

    success: "Data saved successfully.",

    menstrualTestSuccess:
      "Questionnaire completed. In the next step these data will be connected to Supabase.",

    categories: {
      gastrointestinal: "Physical / gastrointestinal symptoms",
      musculoskeletal:
        "Musculoskeletal pain and bodily sensations",
      neurological: "Neurological and cognitive symptoms",
      psychological: "Psychological / behavioural symptoms",
    },
      
    tqrTitle: "Total Quality Recovery",
      tqrInstruction: "Select the value that best describes your current recovery level",
      tqrNoValue: "No value selected",

      hooperTitle: "Hooper Index",
      hooperInstruction: "Rate your current status for each dimension",

      sleepQuality: "Sleep quality",
      fatigue: "Fatigue",
      stress: "Stress",
      muscleSoreness: "Muscle soreness",
      psychologicalWellbeing: "Psychological wellbeing",

      low: "Low",
      high: "High",

      healthTitle: "Health problems",

      // OSTRC questionnaire english

      healthSubtitle: "Weekly questionnaire - past 7 days",

      q1Title: "Participation",
      q1Question:
        "During the past 7 days, to what extent were you able to participate normally in training and matches?",

      q1Options: [
        "Full participation without health problems",
        "Full participation, but with a health problem",
        "Reduced participation due to a health problem",
        "Unable to participate due to a health problem",
      ],

      q2Title: "Training modification",
      q2Question:
        "During the past 7 days, to what extent did you have to modify or reduce training or competition because of the problem?",

      q3Title: "Performance",
      q3Question:
        "During the past 7 days, to what extent did the problem affect your performance?",

      q4Title: "Symptoms",
      q4Question:
        "During the past 7 days, how severe were the symptoms associated with the problem?",

      severityOptions: [
        "Not at all",
        "Slightly",
        "Moderately",
        "Severely",
      ],

      problemType: "Type of problem",
      injuryOption: "Injury",
      illnessOption: "Illness",
      otherOption: "Other health problem",

      anatomicalArea: "Anatomical area",
      anatomicalPlaceholder: "e.g. knee, ankle, thigh",

      side: "Side",
      right: "Right",
      left: "Left",
      bilateral: "Bilateral",
      notApplicable: "Not applicable",

      problemStatus: "Problem status",
      newProblem: "New",
      ongoingProblem: "Ongoing",
      recurrentProblem: "Recurrent",

      timeLoss: "Days completely lost",
      timeLossPlaceholder: "e.g. 2",

      notes: "Optional notes",
      notesPlaceholder: "Add any useful information",

      healthSubmit: "Submit weekly questionnaire",

  },

  de: {
    chooseLanguage: "Sprache wählen",
    appTitle: "Player Monitoring",

    whatCompile: "Was möchtest du ausfüllen?",
    postTraining: "Nach dem Training",
    postTrainingDescription:
      "Gib deine wahrgenommene Belastung der Trainingseinheit an",

    preTraining: "Vor dem Training",
    preTrainingDescription:
      "Erholung, Wohlbefinden und Menstruationszyklus",

    injuries: "Verletzungen",
    injuriesDescription:
      "Melde körperliche Beschwerden oder Verletzungen",

    backMenu: "← Zurück zum Menü",
    backPre: "← Vor dem Training",
    changeLanguage: "Sprache ändern",

    chooseQuestionnaire: "Wähle den Fragebogen aus",

    recovery: "Erholung",
    recoveryDescription: "Hooper Index und Total Quality Recovery",
    recoveryBuilding: "Fragebogen in Entwicklung",

    menstrualCycle: "Menstruationszyklus",
    menstrualDescription: "Monitoring menstruationsbezogener Symptome",
    menstrualInstructions:
      "Gib die heutige Stärke jedes Symptoms an.",


    completion: "Fortschritt",

    absent: "Nicht vorhanden",
    mildModerate: "Leicht / mäßig",
    strong: "Stark",

    answerAll:
      "Beantworte alle 18 Symptome, um den Fragebogen abzuschließen.",

    submit: "Absenden",

    sending: "Wird gesendet...",

    submitError: "Fehler beim Speichern.",
    loginTitle: "Bei deinem Konto anmelden",
    loginButton: "Anmelden",

    loginLoading: "Anmeldung...",

    loading: "Wird geladen...",
    
    invalidCredentials: "ID oder Passwort ist falsch.",

    postSubtitle:
      "Bewerte die wahrgenommene Belastung der Trainingseinheit",
    wellnessQuestion: "Wie fühlst du dich heute?",
    veryBad: "Sehr schlecht",
    veryGood: "Sehr gut",

    rpeQuestion: "Wie intensiv war die Trainingseinheit?",
    selectSlider: "Wähle den Wert mit dem Schieberegler",
    noValue: "Kein Wert ausgewählt",

    injuryTitle: "Verletzungen",
    injurySubtitle:
      "Meldung körperlicher Beschwerden und Verletzungen",
    injuryBuilding: "Fragebogen in Entwicklung",

    success: "Daten erfolgreich gespeichert.",
    menstrualTestSuccess:
      "Fragebogen abgeschlossen. Im nächsten Schritt werden diese Daten mit Supabase verbunden.",

    categories: {
      gastrointestinal: "Körperliche / gastrointestinale Symptome",
      musculoskeletal:
        "Muskuloskelettale Schmerzen und Körperempfindungen",
      neurological: "Neurologische und kognitive Symptome",
      psychological: "Psychologische / verhaltensbezogene Symptome",
    },
    tqrTitle: "Total Quality Recovery",
    tqrInstruction: "Wähle den Wert, der deinen aktuellen Erholungszustand am besten beschreibt",
    tqrNoValue: "Kein Wert ausgewählt",

    hooperTitle: "Hooper Index",
    hooperInstruction: "Bewerte deinen aktuellen Zustand für jede Dimension",

    sleepQuality: "Schlafqualität",
    fatigue: "Müdigkeit",
    stress: "Stress",
    muscleSoreness: "Muskelschmerzen",
    psychologicalWellbeing: "Psychisches Wohlbefinden",

    low: "Niedrig",
    high: "Hoch",

     // OSTRC questionnaire german

    healthTitle: "Gesundheitsprobleme",
    healthSubtitle: "Wöchentlicher Fragebogen - letzte 7 Tage",

    q1Title: "Teilnahme",
    q1Question:
      "In welchem Ausmaß konntest du in den letzten 7 Tagen normal an Training und Spielen teilnehmen?",

    q1Options: [
      "Volle Teilnahme ohne Gesundheitsprobleme",
      "Volle Teilnahme, aber mit einem Gesundheitsproblem",
      "Reduzierte Teilnahme aufgrund eines Gesundheitsproblems",
      "Keine Teilnahme aufgrund eines Gesundheitsproblems möglich",
    ],

    q2Title: "Anpassung der Belastung",
    q2Question:
      "In welchem Ausmaß musstest du in den letzten 7 Tagen Training oder Wettkampf aufgrund des Problems verändern oder reduzieren?",

    q3Title: "Leistung",
    q3Question:
      "In welchem Ausmaß hat das Problem in den letzten 7 Tagen deine Leistung beeinflusst?",

    q4Title: "Symptome",
    q4Question:
      "Wie stark waren die mit dem Problem verbundenen Symptome in den letzten 7 Tagen?",

    severityOptions: [
      "Überhaupt nicht",
      "Leicht",
      "Mäßig",
      "Stark",
    ],

    problemType: "Art des Problems",
    injuryOption: "Verletzung",
    illnessOption: "Erkrankung",
    otherOption: "Anderes Gesundheitsproblem",

    anatomicalArea: "Körperregion",
    anatomicalPlaceholder: "z. B. Knie, Sprunggelenk, Oberschenkel",

    side: "Seite",
    right: "Rechts",
    left: "Links",
    bilateral: "Beidseitig",
    notApplicable: "Nicht zutreffend",

    problemStatus: "Status des Problems",
    newProblem: "Neu",
    ongoingProblem: "Andauernd",
    recurrentProblem: "Wiederkehrend",

    timeLoss: "Vollständig verpasste Tage",
    timeLossPlaceholder: "z. B. 2",

    notes: "Optionale Notizen",
    notesPlaceholder: "Weitere nützliche Informationen",

    healthSubmit: "Wöchentlichen Fragebogen absenden",
  },
};

const msiSymptoms = [
  {
    id: "stomach_cramps",
    category: "gastrointestinal",
    labels: {
      it: "Crampi allo stomaco",
      en: "Stomach cramps",
      de: "Magenkrämpfe",
    },
  },
  {
    id: "bloating",
    category: "gastrointestinal",
    labels: {
      it: "Gonfiore / aumento di gas",
      en: "Bloating / increased gas",
      de: "Blähungen / vermehrte Gasbildung",
    },
  },
  {
    id: "nausea",
    category: "gastrointestinal",
    labels: {
      it: "Nausea / vomito",
      en: "Nausea / sickness / vomiting",
      de: "Übelkeit / Erbrechen",
    },
  },
  {
    id: "constipation",
    category: "gastrointestinal",
    labels: {
      it: "Stitichezza",
      en: "Constipation",
      de: "Verstopfung",
    },
  },
  {
    id: "diarrhoea",
    category: "gastrointestinal",
    labels: {
      it: "Diarrea",
      en: "Diarrhoea",
      de: "Durchfall",
    },
  },

  {
    id: "breast_pain",
    category: "musculoskeletal",
    labels: {
      it: "Dolore o tensione al seno",
      en: "Breast pain / tenderness",
      de: "Brustschmerzen / Brustempfindlichkeit",
    },
  },
  {
    id: "lower_back_pain",
    category: "musculoskeletal",
    labels: {
      it: "Dolore lombare",
      en: "Lower back pain",
      de: "Schmerzen im unteren Rücken",
    },
  },
  {
    id: "joint_muscle_pain",
    category: "musculoskeletal",
    labels: {
      it: "Dolori articolari / crampi muscolari",
      en: "Joint pain / muscle cramps",
      de: "Gelenkschmerzen / Muskelkrämpfe",
    },
  },
  {
    id: "water_retention",
    category: "musculoskeletal",
    labels: {
      it: "Ritenzione idrica",
      en: "Water retention",
      de: "Wassereinlagerungen",
    },
  },
  {
    id: "temperature_fluctuations",
    category: "musculoskeletal",
    labels: {
      it: "Fluttuazioni della temperatura",
      en: "Temperature fluctuations",
      de: "Temperaturschwankungen",
    },
  },

  {
    id: "headache",
    category: "neurological",
    labels: {
      it: "Mal di testa / emicrania",
      en: "Headaches / migraines",
      de: "Kopfschmerzen / Migräne",
    },
  },
  {
    id: "dizziness",
    category: "neurological",
    labels: {
      it: "Vertigini / stordimento",
      en: "Dizziness / light-headedness",
      de: "Schwindel / Benommenheit",
    },
  },
  {
    id: "poor_concentration",
    category: "neurological",
    labels: {
      it: "Scarsa concentrazione / memoria",
      en: "Poor concentration / memory",
      de: "Konzentrations- / Gedächtnisprobleme",
    },
  },
  {
    id: "breathing_changes",
    category: "neurological",
    labels: {
      it: "Cambiamenti o difficoltà respiratorie",
      en: "Changes to / difficulties breathing",
      de: "Veränderungen / Schwierigkeiten beim Atmen",
    },
  },

  {
    id: "mood_changes",
    category: "psychological",
    labels: {
      it: "Cambiamenti d'umore / ansia",
      en: "Mood changes / anxiety",
      de: "Stimmungsschwankungen / Angst",
    },
  },
  {
    id: "fatigue",
    category: "psychological",
    labels: {
      it: "Stanchezza / fatica",
      en: "Tiredness / fatigue",
      de: "Müdigkeit / Erschöpfung",
    },
  },
  {
    id: "disrupted_sleep",
    category: "psychological",
    labels: {
      it: "Sonno disturbato",
      en: "Disrupted sleep",
      de: "Gestörter Schlaf",
    },
  },
  {
    id: "cravings",
    category: "psychological",
    labels: {
      it: "Voglie alimentari / aumento dell'appetito",
      en: "Cravings / increased appetite",
      de: "Heißhunger / gesteigerter Appetit",
    },
  },
] as const;

const categories = [
  "gastrointestinal",
  "musculoskeletal",
  "neurological",
  "psychological",
] as const;

function HooperItem({
  label,
  value,
  onChange,
  lowLabel,
  highLabel,
}: {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
  lowLabel: string;
  highLabel: string;
}) {
  return (
    <div className="mb-7">
      <p className="mb-3 font-medium text-gray-900">
        {label}
      </p>

      <div className="grid grid-cols-7 gap-1">
        {[1, 2, 3, 4, 5, 6, 7].map((number) => (
          <button
            key={number}
            type="button"
            onClick={() => onChange(number)}
            className={`rounded-lg border py-3 text-sm font-semibold ${
              value === number
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-300 bg-white text-gray-700"
            }`}
          >
            {number}
          </button>
        ))}
      </div>

      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

function HealthQuestion({
  title,
  question,
  options,
  value,
  onChange,
}: {
  title: string;
  question: string;
  options: readonly string[] | string[];
  value: number | null;
  onChange: (value: number) => void;
}) {
  return (
    <div className="mb-8">
      <h2 className="mb-2 text-lg font-bold text-gray-900">
        {title}
      </h2>

      <p className="mb-4 text-sm text-gray-600">
        {question}
      </p>

      <div className="grid grid-cols-2 gap-2">
        {options.map((option, index) => (
          <button
            key={option}
            type="button"
            onClick={() =>
              onChange(index)
            }
            className={`rounded-lg border px-3 py-3 text-sm font-semibold ${
              value === index
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-300 bg-white text-gray-700"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Home() {


  const [language, setLanguage] = useState<Language | null>(null);

  const [wellness, setWellness] = useState<number | null>(null);
  const [rpe, setRpe] = useState<number | null>(null);

  const [selectedForm, setSelectedForm] =
    useState<FormType>(null);

  const [selectedPreSection, setSelectedPreSection] =
    useState<PreSection>(null);

  const [msiResponses, setMsiResponses] = useState<
    Record<string, SymptomSeverity>
  >(
    Object.fromEntries(
      msiSymptoms.map((symptom) => [symptom.id, null])
    )
  );

  const [tqr, setTqr] = useState<number | null>(null);

  const [sleepQuality, setSleepQuality] =
    useState<number | null>(null);

  const [fatigue, setFatigue] =
    useState<number | null>(null);

  const [stress, setStress] =
    useState<number | null>(null);

  const [muscleSoreness, setMuscleSoreness] =
    useState<number | null>(null);

  const [
    psychologicalWellbeing,
    setPsychologicalWellbeing,
  ] = useState<number | null>(null);

  const [q1Participation, setQ1Participation] =
  useState<number | null>(null);

  const [q2Modification, setQ2Modification] =
    useState<number | null>(null);

  const [q3Performance, setQ3Performance] =
    useState<number | null>(null);

  const [q4Symptoms, setQ4Symptoms] =
    useState<number | null>(null);

  const [problemType, setProblemType] =
    useState<"injury" | "illness" | "other" | null>(null);

  const [anatomicalArea, setAnatomicalArea] = useState("");
  const [side, setSide] =
    useState<"right" | "left" | "bilateral" | "na" | null>(null);

  const [problemStatus, setProblemStatus] =
    useState<"new" | "ongoing" | "recurrent" | null>(null);

  const [timeLossDays, setTimeLossDays] = useState("");
  const [healthNotes, setHealthNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [postSuccess, setPostSuccess] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const [menstrualSuccess, setMenstrualSuccess] = useState(false);
  const [healthSuccess, setHealthSuccess] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [userProfile, setUserProfile] =
    useState<UserProfile | null>(null);

  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const t = translations[language ?? "it"];

  const currentLanguage = language ?? "it";

  const borgImage =
    currentLanguage === "it"
      ? "/images/borg-cr10_it.png"
      : "/images/borg-cr10_eng.png";

  const tqrImage =
    currentLanguage === "it"
      ? "/images/TQR_it.png"
      : "/images/TQR_eng.png";

    function calculateOstrcScore() {
    if (q1Participation === null) return null;

    if (q1Participation === 0) return 0;
    if (q1Participation === 3) return 100;

    if (
      q2Modification === null ||
      q3Performance === null ||
      q4Symptoms === null
    ) {
      return null;
    }

    const q1Scores = [0, 8, 17, 100];
    const standardScores = [0, 8, 17, 25];

    return (
      q1Scores[q1Participation] +
      standardScores[q2Modification] +
      standardScores[q3Performance] +
      standardScores[q4Symptoms]
    );
  }

  function isSubstantialProblem() {
    if (q1Participation === 3) return true;

    return (
      (q2Modification !== null && q2Modification >= 2) ||
      (q3Performance !== null && q3Performance >= 2)
    );
  }

function clearMessages() {
  setPostSuccess(false);
  setRecoverySuccess(false);
  setMenstrualSuccess(false);
  setHealthSuccess(false);
  setErrorMessage("");
}

  async function handleHealthSubmit() {
    if (q1Participation === null || isSubmitting || !userProfile?.athlete_id) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const score = calculateOstrcScore();

    if (score === null) {
      return;
    }
    try {
    const { error } = await supabase
      .from("health_monitoring")
      .insert({
        athlete_id: userProfile.athlete_id,

        q1_participation: q1Participation,
        q2_modification:
          q1Participation === 1 || q1Participation === 2
            ? q2Modification
            : null,

        q3_performance:
          q1Participation === 1 || q1Participation === 2
            ? q3Performance
            : null,

        q4_symptoms:
          q1Participation === 1 || q1Participation === 2
            ? q4Symptoms
            : null,

        ostrc_severity_score: score,
        substantial_problem: isSubstantialProblem(),

        problem_type:
          q1Participation === 0 ? null : problemType,

        anatomical_area:
          problemType === "injury" ? anatomicalArea : null,

        side:
          problemType === "injury" ? side : null,

        problem_status:
          q1Participation === 0 ? null : problemStatus,

        time_loss_days:
          q1Participation === 0 || timeLossDays === ""
            ? 0
            : Number(timeLossDays),

        notes:
          q1Participation === 0 || healthNotes.trim() === ""
            ? null
            : healthNotes.trim(),

        language,
      });

    if (error) {
      throw error;
    }

    setHealthSuccess(true);

    setQ1Participation(null);
    setQ2Modification(null);
    setQ3Performance(null);
    setQ4Symptoms(null);
    setProblemType(null);
    setAnatomicalArea("");
    setSide(null);
    setProblemStatus(null);
    setTimeLossDays("");
    setHealthNotes("");

    // setSelectedForm(null);

    } catch (error) {
  console.error("Supabase OSTRC error:", error);

  setErrorMessage(
    t.submitError
  );
} finally {
  setIsSubmitting(false);
  } 
}

  async function handleRecoverySubmit() {
    if (
      tqr === null ||
      sleepQuality === null ||
      fatigue === null ||
      stress === null ||
      muscleSoreness === null ||
      psychologicalWellbeing === null ||
      isSubmitting ||
      !userProfile?.athlete_id
    ) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const hooperTotal =
      sleepQuality +
      fatigue +
      stress +
      muscleSoreness +
      psychologicalWellbeing;
try {
    const { error } = await supabase
      .from("recovery_monitoring")
      .insert({
        athlete_id: userProfile.athlete_id,
        tqr,
        sleep_quality: sleepQuality,
        fatigue,
        stress,
        muscle_soreness: muscleSoreness,
        psychological_wellbeing: psychologicalWellbeing,
        hooper_total: hooperTotal,
        language,
      });
    
    if (error) {
        throw error;
    }

    setRecoverySuccess(true);
    setTqr(null);
    setSleepQuality(null);
    setFatigue(null);
    setStress(null);
    setMuscleSoreness(null);
    setPsychologicalWellbeing(null);

    setIsSubmitting(false);
  }  catch (error) {
    console.error(
      "Supabase error:",
      error
    );

    setErrorMessage(
      t.submitError
    );
  } finally {
    setIsSubmitting(false);
  }
}

 async function handleSubmit() {
  if (
    wellness === null ||
    rpe === null ||
    isSubmitting ||
    !userProfile?.athlete_id
  ) {
    return;
  }

  setIsSubmitting(true);
  setErrorMessage("");

  try {
    const { error } = await supabase
      .from("daily_monitoring")
      .insert({
        athlete_id: userProfile.athlete_id,
        wellness,
        rpe,
      });

    if (error) {
      throw error;
    }

    setPostSuccess(true);

    setWellness(null);
    setRpe(null);
  } catch (error) {
    console.error(
      "Supabase error:",
      error
    );

    setErrorMessage(
      t.submitError
    );
  } finally {
    setIsSubmitting(false);
  }
}

  function updateMsiResponse(
    symptomId: string,
    value: 0 | 1 | 2
  ) {
    setMsiResponses((previous) => ({
      ...previous,
      [symptomId]: value,
    }));
  }

  const msiAnswered = Object.values(msiResponses).filter(
    (value) => value !== null
  ).length;

  const msiComplete =
    msiAnswered === msiSymptoms.length;

  const symptomSeverityTotal = Object.values(
    msiResponses
  ).reduce<number>(
    (sum, value) => sum + (value ?? 0),
    0
  );

  function resetMsi() {
    setMsiResponses(
      Object.fromEntries(
        msiSymptoms.map((symptom) => [
          symptom.id,
          null,
        ])
      )
    );
  }

  async function handleMsiSubmit() {
  if (
    !msiComplete || 
    isSubmitting ||
    !userProfile?.athlete_id) {
    return;
  }

  setIsSubmitting(true);

  setErrorMessage("");
try {
  const { error } = await supabase
    .from("menstrual_monitoring")
    .insert({
      athlete_id: userProfile.athlete_id,

      stomach_cramps: msiResponses.stomach_cramps,
      bloating: msiResponses.bloating,
      nausea: msiResponses.nausea,
      constipation: msiResponses.constipation,
      diarrhoea: msiResponses.diarrhoea,

      breast_pain: msiResponses.breast_pain,
      lower_back_pain: msiResponses.lower_back_pain,
      joint_muscle_pain: msiResponses.joint_muscle_pain,
      water_retention: msiResponses.water_retention,
      temperature_fluctuations:
        msiResponses.temperature_fluctuations,

      headache: msiResponses.headache,
      dizziness: msiResponses.dizziness,
      poor_concentration:
        msiResponses.poor_concentration,
      breathing_changes:
        msiResponses.breathing_changes,

      mood_changes: msiResponses.mood_changes,
      fatigue: msiResponses.fatigue,
      disrupted_sleep:
        msiResponses.disrupted_sleep,
      cravings: msiResponses.cravings,

      symptom_severity_total:
        symptomSeverityTotal,

      language: language,
    });

  if (error) {
      throw error;
  }

  setMenstrualSuccess(true);
  resetMsi();
  // setSelectedPreSection(null);

  setIsSubmitting(false);
}  catch (error) {
    console.error(
      "Supabase error:",
      error
    );

    setErrorMessage(
      t.submitError
    );
  } finally {
    setIsSubmitting(false);
  }
}

  function goToMainMenu() {
    setSelectedForm(null);
    setSelectedPreSection(null);
    clearMessages();
  }


  async function handleLogout() {
      await supabase.auth.signOut();

      setUserProfile(null);
      setLoginId("");
      setLoginPassword("");
      setSelectedForm(null);
      setSelectedPreSection(null);
    }

   async function loadProfile(
        userId: string
      ): Promise<boolean> {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            "id, role, team_id, athlete_id, login_id, active"
          )
          .eq("id", userId)
          .single();

        if (error) {
          console.error(
            "Errore caricamento profilo:",
            error
          );

          setUserProfile(null);
          return false;
        }

        if (!data) {
          setUserProfile(null);
          return false;
        }

        if (!data.active) {
          setUserProfile(null);
          return false;
        }

        setUserProfile(data as UserProfile);

        return true;
      }


async function handleLogin() {
  if (!loginId.trim() || !loginPassword) {
    return;
  }

  setLoginLoading(true);
  setLoginError("");

  try {
    const response = await fetch("/api/athlete-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        loginId: loginId.trim(),
        password: loginPassword,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setLoginError(
        result.error ?? t.invalidCredentials
      );
      return;
    }

    const {
      data: sessionData,
      error: sessionError,
    } = await supabase.auth.setSession({
      access_token: result.access_token,
      refresh_token: result.refresh_token,
    });

    if (
      sessionError ||
      !sessionData.session?.user
    ) {
      console.error(
        "Errore impostazione sessione:",
        sessionError
      );

      setLoginError(
        "Errore durante l'accesso."
      );
      return;
    }

    const profileLoaded =
      await loadProfile(
        sessionData.session.user.id
      );

    if (!profileLoaded) {
      await supabase.auth.signOut();

      setLoginError(
        "Profilo atleta non disponibile."
      );
      return;
    }

    setLoginPassword("");
  } catch (error) {
    console.error(
      "Errore login:",
      error
    );

    setLoginError(
      "Errore durante l'accesso."
    );
  } finally {
    setLoginLoading(false);
  }
}


useEffect(() => {
    async function initializeAuth() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error(
            "Session error:",
            sessionError
          );
          setUserProfile(null);
          return;
        }

        // Nessuna sessione salvata:
        // mostriamo semplicemente il login.
        if (!session) {
          setUserProfile(null);
          return;
        }

        // Se una sessione esiste, verifichiamo
        // che l'utente sia ancora valido.
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error(
            "Auth validation error:",
            userError
          );

          setUserProfile(null);
          return;
        }

        await loadProfile(user.id);
      } catch (error) {
        console.error(
          "Initialization error:",
          error
        );

        setUserProfile(null);
      } finally {
        setAuthLoading(false);
      }
    }
  
  initializeAuth();
}, []);

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">
          {t.loading}
        </p>
      </main>
    );
  }

  if (!userProfile) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-8">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-md">

          <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
            Player Monitoring
          </h1>

          <p className="mb-8 text-center text-gray-600">
            {t.loginTitle}
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >

          <div className="mb-5">
            <label className="mb-2 block font-semibold text-gray-700">
              ID
            </label>

            <input
              type="text"
              value={loginId}
              onChange={(e) =>
                setLoginId(e.target.value)
              }
              placeholder="Es. Test01"
              autoCapitalize="none"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block font-semibold text-gray-700">
              Password
            </label>

            <input
              type="password"
              value={loginPassword}
              onChange={(e) =>
                setLoginPassword(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
            />
          </div>

          {loginError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">
              {loginError}
            </div>
          )}

          <button
            type="submit"
            disabled={
              !loginId.trim() ||
              !loginPassword ||
              loginLoading
            }
            className="w-full rounded-lg bg-black py-4 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {loginLoading
              ? t.loginLoading
              : t.loginButton}
          </button>
        </form>
        </div>
      </main>
    );
  }


  if (language === null) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-8">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-md">
          <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
            Player Monitoring
          </h1>

          <p className="mb-8 text-center text-gray-600">
            Scegli la lingua · Choose language · Sprache wählen
          </p>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setLanguage("it")}
              className="w-full rounded-xl border border-gray-200 p-4 text-left font-semibold text-gray-900 hover:bg-gray-50"
            >
              🇮🇹 Italiano
            </button>

            <button
              type="button"
              onClick={() => setLanguage("en")}
              className="w-full rounded-xl border border-gray-200 p-4 text-left font-semibold text-gray-900 hover:bg-gray-50"
            >
              🇬🇧 English
            </button>

            <button
              type="button"
              onClick={() => setLanguage("de")}
              className="w-full rounded-xl border border-gray-200 p-4 text-left font-semibold text-gray-900 hover:bg-gray-50"
            >
              🇩🇪 Deutsch
            </button>
          </div>
        </div>
      </main>
    );
  }

      if (userProfile.role !== "athlete") {
      return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-md">
            <h1 className="mb-3 text-2xl font-bold text-gray-900">
              Area atlete
            </h1>

            <p className="mb-6 text-gray-600">
              Questo account non è abilitato all&apos;accesso al portale atlete.
            </p>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-lg bg-black py-3 font-semibold text-white"
            >
              Logout
            </button>
          </div>
        </main>
      );
    }

  // MENU PRINCIPALE
  if (selectedForm === null) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-8">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-md">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t.appTitle}
              </h1>

              <p className="mt-1 text-gray-600">
                {t.whatCompile}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setLanguage(null)}
              className="text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              {t.changeLanguage}
            </button>
          </div>

          <div className="mb-6 flex items-center justify-between rounded-lg bg-gray-50 p-3">
            <div>
              <p className="text-xs text-gray-500">
                Utente
              </p>

              <p className="font-semibold text-gray-900">
                {userProfile.athlete_id}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {clearMessages(); setSelectedForm("post");}}
              className="w-full rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:bg-gray-50"
            >
              <div className="text-lg font-bold text-gray-900">
                🏃 {t.postTraining}
              </div>

              <div className="mt-1 text-sm text-gray-600">
                {t.postTrainingDescription}
              </div>
            </button>

            <button
              type="button"
              onClick={() => {clearMessages(); setSelectedForm("pre");}}
              className="w-full rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:bg-gray-50"
            >
              <div className="text-lg font-bold text-gray-900">
                🔋 {t.preTraining}
              </div>

              <div className="mt-1 text-sm text-gray-600">
                {t.preTrainingDescription}
              </div>
            </button>

            <button
              type="button"
              onClick={() => {clearMessages(); setSelectedForm("injury");}}
              className="w-full rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:bg-gray-50"
            >
              <div className="text-lg font-bold text-gray-900">
                🩹 {t.injuries}
              </div>

              <div className="mt-1 text-sm text-gray-600">
                {t.injuriesDescription}
              </div>
            </button>
          </div>
        </div>
      </main>
    );
  }

  // SOTTOMENU PRE-ALLENAMENTO
  if (
    selectedForm === "pre" &&
    selectedPreSection === null
  ) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-8">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-md">
          <button
            type="button"
            onClick={goToMainMenu}
            className="mb-6 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            {t.backMenu}
          </button>

          <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
            {t.preTraining}
          </h1>

          <p className="mb-8 text-center text-gray-600">
            {t.chooseQuestionnaire}
          </p>

          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {clearMessages(); setSelectedPreSection("recovery");}}
              className="w-full rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm hover:bg-gray-50"
            >
              <div className="text-lg font-bold text-gray-900">
                🔋 {t.recovery}
              </div>

              <div className="mt-1 text-sm text-gray-600">
                {t.recoveryDescription}
              </div>
            </button>

            <button
              type="button"
              onClick={() => {clearMessages(); setSelectedPreSection("menstrual");}}
              className="w-full rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm hover:bg-gray-50"
            >
              <div className="text-lg font-bold text-gray-900">
                ◯ {t.menstrualCycle}
              </div>

              <div className="mt-1 text-sm text-gray-600">
                {t.menstrualDescription}
              </div>
            </button>
          </div>
        </div>
      </main>
    );
  }

  // RECUPERO
if (
  selectedForm === "pre" &&
  selectedPreSection === "recovery"
) {
  const recoveryComplete =
    tqr !== null &&
    sleepQuality !== null &&
    fatigue !== null &&
    stress !== null &&
    muscleSoreness !== null &&
    psychologicalWellbeing !== null;

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-md">

        <button
          type="button"
          onClick={() => {clearMessages(); setSelectedPreSection(null);}}
          className="mb-6 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          {t.backPre}
        </button>

        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
          {t.recovery}
        </h1>

        <p className="mb-8 text-center text-gray-600">
          {t.recoveryDescription}
        </p>

    

        
        {/* TQR */}

        <div className="mb-10">
          <h2 className="mb-2 text-lg font-bold text-gray-900">
            {t.tqrTitle}
          </h2>

          <p className="mb-4 text-sm text-gray-600">
            {t.tqrInstruction}
          </p>

          <div className="mx-auto max-w-sm">
            <img
              src={tqrImage}
              alt="Total Quality Recovery Scale"
              className="block h-auto w-full select-none"
              draggable={false}
            />
          </div>

          <div className="mt-6">
            <div className="mb-4 text-center">
              {tqr !== null ? (
                <span className="text-4xl font-bold text-gray-900">
                  {tqr}
                </span>
              ) : (
                <span className="text-gray-500">
                  {t.tqrNoValue}
                </span>
              )}
            </div>

            <input
              type="range"
              min="6"
              max="20"
              step="1"
              value={tqr ?? 6}
              onChange={(e) =>
                setTqr(Number(e.target.value))
              }
              className="w-full cursor-pointer"
            />

            <div className="mt-2 flex justify-between text-sm text-gray-500">
              <span>6</span>
              <span>20</span>
            </div>
          </div>
        </div>

        {/* HOOPER INDEX */}

        <div className="border-t border-gray-200 pt-8">
          <h2 className="mb-2 text-lg font-bold text-gray-900">
            {t.hooperTitle}
          </h2>

          <p className="mb-6 text-sm text-gray-600">
            {t.hooperInstruction}
          </p>

          <HooperItem
            label={t.sleepQuality}
            value={sleepQuality}
            onChange={setSleepQuality}
            lowLabel={t.low}
            highLabel={t.high}
          />

          <HooperItem
            label={t.fatigue}
            value={fatigue}
            onChange={setFatigue}
            lowLabel={t.low}
            highLabel={t.high}
          />

          <HooperItem
            label={t.stress}
            value={stress}
            onChange={setStress}
            lowLabel={t.low}
            highLabel={t.high}
          />

          <HooperItem
            label={t.muscleSoreness}
            value={muscleSoreness}
            onChange={setMuscleSoreness}
            lowLabel={t.low}
            highLabel={t.high}
          />

          <HooperItem
            label={t.psychologicalWellbeing}
            value={psychologicalWellbeing}
            onChange={setPsychologicalWellbeing}
            lowLabel={t.low}
            highLabel={t.high}
          />
        </div>

        {/* INVIO */}

        <button
          type="button"
          onClick={handleRecoverySubmit}
          disabled={!recoveryComplete || isSubmitting}
          className="mt-4 w-full rounded-lg bg-black py-4 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSubmitting ? t.sending : t.submit}
        </button>

        {recoverySuccess && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-center text-green-800">
            {t.success}
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-800">
            {errorMessage}
          </div>
        )}

      </div>
    </main>
  );
}

  // CICLO MESTRUALE
  if (
    selectedForm === "pre" &&
    selectedPreSection === "menstrual"
  ) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-8">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-md">
          <button
            type="button"
            onClick={() => {clearMessages(); setSelectedPreSection(null);}}
            className="mb-6 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            {t.backPre}
          </button>

          <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
            {t.menstrualCycle}
          </h1>

          <p className="mb-6 text-center text-sm text-gray-600">
            {t.menstrualInstructions}
          </p>

          <div className="mb-8 rounded-xl bg-gray-50 p-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t.completion}</span>

              <span className="font-semibold">
                {msiAnswered} / 18
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-gray-800 transition-all"
                style={{
                  width: `${(msiAnswered / 18) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-8">
            {categories.map((category) => (
              <section key={category}>
                <h2 className="mb-3 text-lg font-bold text-gray-900">
                  {t.categories[category]}
                </h2>

                <div className="space-y-3">
                  {msiSymptoms
                    .filter(
                      (symptom) =>
                        symptom.category === category
                    )
                    .map((symptom) => {
                      const selectedValue =
                        msiResponses[symptom.id];

                      return (
                        <div
                          key={symptom.id}
                          className="rounded-xl border border-gray-200 p-4"
                        >
                          <p className="font-medium text-gray-900">
                            {symptom.labels[language]}
                          </p>

                          <div className="mt-4 grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => {clearMessages(); updateMsiResponse(symptom.id, 0);}}

                              className={`rounded-lg border px-2 py-3 text-sm font-semibold transition ${
                                selectedValue === 0
                                  ? "border-gray-900 bg-gray-900 text-white"
                                  : "border-gray-300 bg-white text-gray-700"
                              }`}
                            >
                              {t.absent}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                updateMsiResponse(
                                  symptom.id,
                                  1
                                )
                              }
                              className={`rounded-lg border px-2 py-3 text-sm font-semibold transition ${
                                selectedValue === 1
                                  ? "border-gray-900 bg-gray-900 text-white"
                                  : "border-gray-300 bg-white text-gray-700"
                              }`}
                            >
                              {t.mildModerate}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                updateMsiResponse(
                                  symptom.id,
                                  2
                                )
                              }
                              className={`rounded-lg border px-2 py-3 text-sm font-semibold transition ${
                                selectedValue === 2
                                  ? "border-gray-900 bg-gray-900 text-white"
                                  : "border-gray-300 bg-white text-gray-700"
                              }`}
                            >
                              {t.strong}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-8">
            {!msiComplete && (
              <p className="mb-3 text-center text-sm text-gray-500">
                {t.answerAll}
              </p>
            )}

            <button
              type="button"
              onClick={handleMsiSubmit}
              disabled={!msiComplete || isSubmitting}
              className="w-full rounded-lg bg-black py-4 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
            >
                {isSubmitting ? t.sending : t.submit}
            </button>

            {menstrualSuccess && (
              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-center text-green-800">
                {t.success}
              </div>
            )}

            {errorMessage && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-800">
                {errorMessage}
              </div>
            )}

          </div>
        </div>
      </main>
    );
  }

  // INFORTUNI
if (selectedForm === "injury") {
  const requiresFullQuestions =
    q1Participation === 1 ||
    q1Participation === 2;

  const hasHealthProblem =
    q1Participation !== null &&
    q1Participation !== 0;

  const coreQuestionsComplete =
    q1Participation === 0 ||
    q1Participation === 3 ||
    (
      requiresFullQuestions &&
      q2Modification !== null &&
      q3Performance !== null &&
      q4Symptoms !== null
    );

  const classificationComplete =
    !hasHealthProblem ||
    (
      problemType !== null &&
      problemStatus !== null &&
      (
        problemType !== "injury" ||
        (
          anatomicalArea.trim() !== "" &&
          side !== null
        )
      )
    );

  const healthFormComplete =
    coreQuestionsComplete &&
    classificationComplete;

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-md">

        <button
          type="button"
          onClick={goToMainMenu}
          className="mb-6 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          {t.backMenu}
        </button>

        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
          {t.healthTitle}
        </h1>

        <p className="mb-8 text-center text-gray-600">
          {t.healthSubtitle}
        </p>


        {/* Q1 */}

        <div className="mb-8">
          <h2 className="mb-2 text-lg font-bold text-gray-900">
            {t.q1Title}
          </h2>

          <p className="mb-4 text-sm text-gray-600">
            {t.q1Question}
          </p>

          <div className="space-y-2">
            {t.q1Options.map((option, index) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setQ1Participation(index);

                  if (index === 0 || index === 3) {
                    setQ2Modification(null);
                    setQ3Performance(null);
                    setQ4Symptoms(null);
                  }
                }}
                className={`w-full rounded-lg border p-3 text-left text-sm font-medium ${
                  q1Participation === index
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-300 bg-white text-gray-800"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Q2-Q4 SOLO SE SERVONO */}

        {requiresFullQuestions && (
          <>
            <HealthQuestion
              title={t.q2Title}
              question={t.q2Question}
              options={t.severityOptions}
              value={q2Modification}
              onChange={setQ2Modification}
            />

            <HealthQuestion
              title={t.q3Title}
              question={t.q3Question}
              options={t.severityOptions}
              value={q3Performance}
              onChange={setQ3Performance}
            />

            <HealthQuestion
              title={t.q4Title}
              question={t.q4Question}
              options={t.severityOptions}
              value={q4Symptoms}
              onChange={setQ4Symptoms}
            />
          </>
        )}

        {/* CLASSIFICAZIONE PROBLEMA */}

        {hasHealthProblem && (
          <div className="border-t border-gray-200 pt-8">

            <h2 className="mb-4 text-lg font-bold text-gray-900">
              {t.problemType}
            </h2>

            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  value: "injury",
                  label: t.injuryOption,
                },
                {
                  value: "illness",
                  label: t.illnessOption,
                },
                {
                  value: "other",
                  label: t.otherOption,
                },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() =>
                    setProblemType(
                      item.value as
                        | "injury"
                        | "illness"
                        | "other"
                    )
                  }
                  className={`rounded-lg border px-2 py-3 text-sm font-semibold ${
                    problemType === item.value
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-300 bg-white text-gray-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* SOLO PER INFORTUNIO */}

            {problemType === "injury" && (
              <div className="mt-6 space-y-6">

                <div>
                  <label className="mb-2 block font-medium text-gray-900">
                    {t.anatomicalArea}
                  </label>

                  <input
                    type="text"
                    value={anatomicalArea}
                    onChange={(e) =>
                      setAnatomicalArea(
                        e.target.value
                      )
                    }
                    placeholder={
                      t.anatomicalPlaceholder
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <p className="mb-3 font-medium text-gray-900">
                    {t.side}
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        value: "right",
                        label: t.right,
                      },
                      {
                        value: "left",
                        label: t.left,
                      },
                      {
                        value: "bilateral",
                        label: t.bilateral,
                      },
                      {
                        value: "na",
                        label: t.notApplicable,
                      },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() =>
                          setSide(
                            item.value as
                              | "right"
                              | "left"
                              | "bilateral"
                              | "na"
                          )
                        }
                        className={`rounded-lg border py-3 text-sm font-semibold ${
                          side === item.value
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-300 bg-white text-gray-700"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STATO DEL PROBLEMA */}

            <div className="mt-6">
              <p className="mb-3 font-medium text-gray-900">
                {t.problemStatus}
              </p>

              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    value: "new",
                    label: t.newProblem,
                  },
                  {
                    value: "ongoing",
                    label: t.ongoingProblem,
                  },
                  {
                    value: "recurrent",
                    label: t.recurrentProblem,
                  },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      setProblemStatus(
                        item.value as
                          | "new"
                          | "ongoing"
                          | "recurrent"
                      )
                    }
                    className={`rounded-lg border px-2 py-3 text-sm font-semibold ${
                      problemStatus === item.value
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-300 bg-white text-gray-700"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TIME LOSS */}

            <div className="mt-6">
              <label className="mb-2 block font-medium text-gray-900">
                {t.timeLoss}
              </label>

              <input
                type="number"
                min="0"
                max="7"
                value={timeLossDays}
                onChange={(e) =>
                  setTimeLossDays(
                    e.target.value
                  )
                }
                placeholder={
                  t.timeLossPlaceholder
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* NOTE */}

            <div className="mt-6">
              <label className="mb-2 block font-medium text-gray-900">
                {t.notes}
              </label>

              <textarea
                value={healthNotes}
                onChange={(e) =>
                  setHealthNotes(e.target.value)
                }
                placeholder={
                  t.notesPlaceholder
                }
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400"
              />
            </div>

          </div>
        )}

        <button
          type="button"
          onClick={handleHealthSubmit}
          disabled={!healthFormComplete || isSubmitting}
          className="mt-8 w-full rounded-lg bg-black py-4 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSubmitting ? t.sending : t.healthSubmit}
        </button>

        {healthSuccess && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-center text-green-800">
            {t.success}
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-800">
            {errorMessage}
          </div>
        )}

      </div>
    </main>
  );
}

  // POST-ALLENAMENTO
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-md">
        <button
          type="button"
          onClick={goToMainMenu}
          className="mb-6 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          {t.backMenu}
        </button>

        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
          {t.postTraining}
        </h1>

        <p className="mb-8 text-center text-gray-600">
          {t.postSubtitle}
        </p>

        <div className="mb-8">
          <p className="mb-3 font-semibold text-gray-700">
            {t.wellnessQuestion}
          </p>

          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setWellness(value)
                }
                className={`rounded-lg border py-3 font-semibold ${
                  wellness === value
                    ? "bg-black text-white"
                    : "bg-white text-black"
                }`}
              >
                {value}
              </button>
            ))}
          </div>

          <div className="mt-2 flex justify-between text-sm text-gray-500">
            <span>{t.veryBad}</span>
            <span>{t.veryGood}</span>
          </div>
        </div>

        <div className="mb-8">
          <p className="mb-3 font-semibold text-gray-700">
            {t.rpeQuestion}
          </p>

          <div className="mx-auto max-w-sm">
            <img
              src={borgImage}
              alt="Borg CR10 Scale"
              className="block h-auto w-full select-none"
              draggable={false}
            />
          </div>

          <div className="mt-6">
            <p className="mb-2 text-center text-sm text-gray-600">
              {t.selectSlider}
            </p>

            <div className="mb-4 text-center">
              {rpe !== null ? (
                <span className="text-4xl font-bold text-gray-900">
                  {rpe.toFixed(1)}
                </span>
              ) : (
                <span className="text-gray-500">
                  {t.noValue}
                </span>
              )}
            </div>

            <input
              type="range"
              min="0"
              max="11"
              step="0.5"
              value={rpe ?? 0}
              onChange={(e) =>
                setRpe(Number(e.target.value))
              }
              className="w-full cursor-pointer"
            />

            <div className="mt-2 flex justify-between text-sm text-gray-500">
              <span>0</span>
              <span>11</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            wellness === null ||
            rpe === null ||
            isSubmitting
          }
          className="w-full rounded-lg bg-black py-4 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSubmitting ? t.sending : t.submit}
        </button>

        {postSuccess && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-center text-green-800">
            {t.success}
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-800">
            {errorMessage}
          </div>
        )}

      </div>
    </main>
  );
}