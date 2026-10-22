"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type StaffProfile = {
  id: string;
  role: "staff" | "admin";
  team_id: string | null;
  login_id: string | null;
  active: boolean;
};

type Team = {
  id: string;
  name: string;
  club: string | null;
};

type ObjectiveCode =
  | "activation"
  | "technical_tactical"
  | "endurance"
  | "speed_endurance"
  | "strength_field"
  | "strength_gym"
  | "speed"
  | "agility"
  | "cooldown_stretching"
  | "other";

type SessionObjective = {
  id: string;
  objective_code: ObjectiveCode;
  duration_min: number;
  other_label: string | null;
};

type TrainingSession = {
  id: string;
  session_date: string;
  start_time: string | null;
  duration_min: number;
  session_type: string;
  notes: string | null;
  status: string;
  created_at: string;

  training_session_objectives:
    SessionObjective[];
};

type UnlinkedPostTraining = {
  id: number;
  athlete_id: string;
  wellness: number;
  rpe: number;
  created_at: string;
};

type TrainingSessionSummary = {
  session_id: string;
  response_count: number;
  mean_rpe: number | null;
  mean_srpe: number | null;
};

type TrainingSessionParticipant = {
  user_id: string;
  athlete_id: string;
  override_duration_min: number | null;
  effective_duration_min: number;
  attendance_status:
    | "unknown"
    | "present"
    | "absent";
};

const objectiveOptions: {
  code: ObjectiveCode;
  label: string;
}[] = [
  {
    code: "activation",
    label: "Attivazione",
  },
  {
    code: "technical_tactical",
    label: "Tecnico-tattico",
  },
  {
    code: "endurance",
    label: "Resistenza",
  },
  {
    code: "speed_endurance",
    label: "Resistenza alla velocità",
  },
  {
    code: "strength_field",
    label: "Forza in campo",
  },
  {
    code: "strength_gym",
    label: "Forza in palestra",
  },
  {
    code: "speed",
    label: "Velocità",
  },
  {
    code: "agility",
    label: "Agility",
  },
  {
    code: "cooldown_stretching",
    label: "Defaticamento / stretching",
  },
  {
    code: "other",
    label: "Altro",
  },
];

const sessionTypeOptions = [
  {
    value: "training",
    label: "Allenamento",
  },
  {
    value: "gym",
    label: "Palestra",
  },
  {
    value: "recovery",
    label: "Recupero",
  },
  {
    value: "friendly",
    label: "Amichevole",
  },
  {
    value: "other",
    label: "Altro",
  },
];

function getTodayLocal() {
  const now = new Date();

  const localDate = new Date(
    now.getTime() -
      now.getTimezoneOffset() * 60000
  );

  return localDate
    .toISOString()
    .slice(0, 10);
}

export default function StaffPage() {

  // ==========================================================
  // AUTH
  // ==========================================================

  const [
  unlinkedPosts,
  setUnlinkedPosts,
] = useState<UnlinkedPostTraining[]>([]);

const [
  unlinkedPostsLoading,
  setUnlinkedPostsLoading,
] = useState(false);

const [
  associationSelections,
  setAssociationSelections,
] = useState<Record<string, string>>({});

const [
  associatingPostId,
  setAssociatingPostId,
] = useState<number | null>(null);

const [
  associationError,
  setAssociationError,
] = useState("");

const [
  associationSuccess,
  setAssociationSuccess,
] = useState("");

  const [
    authLoading,
    setAuthLoading,
  ] = useState(true);

  const [
    staffProfile,
    setStaffProfile,
  ] =
    useState<StaffProfile | null>(
      null
    );

  const [team, setTeam] =
    useState<Team | null>(null);

  const [loginId, setLoginId] =
    useState("");

  const [
    loginPassword,
    setLoginPassword,
  ] = useState("");

  const [
    loginError,
    setLoginError,
  ] = useState("");

  const [
    loginLoading,
    setLoginLoading,
  ] = useState(false);

  const [
  sessionSummaries,
  setSessionSummaries,
  ] = useState<Record<string, TrainingSessionSummary>>({});   

  // ==========================================================
  // SESSION FORM
  // ==========================================================

  const [
    sessionDate,
    setSessionDate,
  ] = useState(getTodayLocal());

  const [
    startTime,
    setStartTime,
  ] = useState("");

  const [
    durationMin,
    setDurationMin,
  ] = useState("");

  const [
    sessionType,
    setSessionType,
  ] = useState("training");

  const [
    sessionNotes,
    setSessionNotes,
  ] = useState("");

  /*
    La chiave è l'obiettivo.
    Il valore è la durata in minuti.
  */
  const [
    selectedObjectives,
    setSelectedObjectives,
  ] = useState<
    Partial<Record<ObjectiveCode, string>>
  >({});

  const [
    otherObjectiveLabel,
    setOtherObjectiveLabel,
  ] = useState("");

  const [
    savingSession,
    setSavingSession,
  ] = useState(false);

  const [
    editingSessionId,
    setEditingSessionId,
  ] = useState<string | null>(null);

  const [
    sessionSuccess,
    setSessionSuccess,
  ] = useState("");

  const [
    sessionError,
    setSessionError,
  ] = useState("");


  // ==========================================================
  // EXISTING SESSIONS
  // ==========================================================

  const [
    sessions,
    setSessions,
  ] = useState<TrainingSession[]>([]);

  const [
    sessionsLoading,
    setSessionsLoading,
  ] = useState(false);

  // ==========================================================
  // INDIVIDUAL SESSION DURATION OVERRIDES
  // ==========================================================

    const [
      participantSessionId,
      setParticipantSessionId,  
    ] = useState<string | null>(null);

    const [
      sessionParticipants,
      setSessionParticipants,
    ] = useState<TrainingSessionParticipant[]>([]);

    const [
      participantDurationInputs,
      setParticipantDurationInputs,
    ] = useState<Record<string, string>>({});

    const [
      participantsLoading,
      setParticipantsLoading,
    ] = useState(false);

    const [
      participantSavingUserId,
      setParticipantSavingUserId,
    ] = useState<string | null>(null);

    const [
      participantsError,
      setParticipantsError,
    ] = useState("");


  // ==========================================================
  // PROFILE
  // ==========================================================

  async function loadStaffProfile(
    userId: string
  ): Promise<boolean> {

    const {
      data: profile,
      error,
    } = await supabase
      .from("profiles")
      .select(
        "id, role, team_id, login_id, active"
      )
      .eq("id", userId)
      .single();

    if (
      error ||
      !profile ||
      !profile.active ||
      !["staff", "admin"].includes(
        profile.role
      )
    ) {

      console.error(
        "Errore profilo staff:",
        error
      );

      setStaffProfile(null);
      setTeam(null);

      return false;
    }

    setStaffProfile(
      profile as StaffProfile
    );

    if (profile.team_id) {

      const {
        data: teamData,
        error: teamError,
      } = await supabase
        .from("teams")
        .select(
          "id, name, club"
        )
        .eq(
          "id",
          profile.team_id
        )
        .single();

      if (teamError) {

        console.error(
          "Errore caricamento team:",
          teamError
        );

        setTeam(null);

      } else {

        setTeam(
          teamData as Team
        );
      }

    } else {

      setTeam(null);
    }

    return true;
  }


  // ==========================================================
  // LOGIN
  // ==========================================================

  async function handleLogin() {

    if (
      !loginId.trim() ||
      !loginPassword
    ) {
      return;
    }

    setLoginLoading(true);
    setLoginError("");

    try {

      const response =
        await fetch(
          "/api/staff-login",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              loginId:
                loginId.trim(),

              password:
                loginPassword,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {

        setLoginError(
          result.error ??
            "ID o password non corretti."
        );

        return;
      }

      const {
        data: sessionData,
        error: sessionError,
      } =
        await supabase.auth.setSession({
          access_token:
            result.access_token,

          refresh_token:
            result.refresh_token,
        });

      if (
        sessionError ||
        !sessionData.session?.user
      ) {

        console.error(
          "Errore sessione staff:",
          sessionError
        );

        setLoginError(
          "Errore durante l'accesso."
        );

        return;
      }

      const loaded =
        await loadStaffProfile(
          sessionData.session.user.id
        );

      if (!loaded) {

        await supabase.auth.signOut();

        setLoginError(
          "Account non abilitato all'area staff."
        );

        return;
      }

      setLoginPassword("");

    } catch (error) {

      console.error(
        "Errore login staff:",
        error
      );

      setLoginError(
        "Errore durante l'accesso."
      );

    } finally {

      setLoginLoading(false);
    }
  }


  // ==========================================================
  // LOGOUT
  // ==========================================================

  async function handleLogout() {

    await supabase.auth.signOut();

    setStaffProfile(null);
    setTeam(null);

    setLoginId("");
    setLoginPassword("");

    setSessions([]);
  }


  // ==========================================================
  // LOAD SESSIONS
  // ==========================================================

  async function loadSessions() {

    if (!staffProfile?.team_id) {
      return;
    }

    setSessionsLoading(true);

    const {
      data,
      error,
    } = await supabase
      .from("training_sessions")
      .select(`
        id,
        session_date,
        start_time,
        duration_min,
        session_type,
        notes,
        status,
        created_at,
        training_session_objectives (
          id,
          objective_code,
          duration_min,
          other_label
        )
      `)
      .eq(
        "team_id",
        staffProfile.team_id
      )
      .order(
        "session_date",
        { ascending: false }
      )
      .order(
        "start_time",
        { ascending: false }
      )
      .limit(30);

    if (error) {

      console.error(
        "Errore caricamento sedute:",
        error
      );

      setSessions([]);

    } else {

      setSessions(
        (data ?? []) as TrainingSession[]
      );
    }

    setSessionsLoading(false);
  }

  async function loadSessionSummaries() {

    if (!staffProfile?.team_id) {
      return;
    }

    const {
      data,
      error,
    } = await supabase.rpc(
      "get_training_session_summaries"
    );

    if (error) {

      console.error(
        "Errore caricamento riepilogo sedute:",
        error
      );

      setSessionSummaries({});
      return;
    }

    const summaries: Record<
      string,
      TrainingSessionSummary
    > = {};

    for (const item of data ?? []) {

      summaries[item.session_id] = {
        session_id: item.session_id,
        response_count: Number(
          item.response_count ?? 0
        ),
        mean_rpe:
          item.mean_rpe === null
            ? null
            : Number(item.mean_rpe),
        mean_srpe:
          item.mean_srpe === null
            ? null
            : Number(item.mean_srpe),
      };
    }

    setSessionSummaries(summaries);
  } 

  async function openParticipantDurations(
    session: TrainingSession
  ) {

    if (
      participantSessionId === session.id
    ) {
      setParticipantSessionId(null);
      setSessionParticipants([]);
      setParticipantDurationInputs({});
      setParticipantsError("");
      return;
    }

    setParticipantSessionId(session.id);
    setParticipantsLoading(true);
    setParticipantsError("");

    try {

      const {
        data,
        error,
      } = await supabase.rpc(
        "get_training_session_participants",
        {
          p_session_id: session.id,
        }
      );

      if (error) {
        throw error;
      }

      const rows =
        (data ?? []).map(
          (item: {
            user_id: string;
            athlete_id: string;
            override_duration_min: number | null;
            effective_duration_min: number;
            attendance_status:
              | "unknown"
              | "present"
              | "absent";
          }) => ({
            user_id:
              item.user_id,

            athlete_id:
              item.athlete_id,

            override_duration_min:
              item.override_duration_min === null
                ? null
                : Number(
                    item.override_duration_min
                  ),

            effective_duration_min:
              Number(
                item.effective_duration_min
              ),

            attendance_status:
              item.attendance_status,
          })
        ) as TrainingSessionParticipant[];


      setSessionParticipants(rows);


      const initialInputs:
        Record<string, string> = {};

      for (const participant of rows) {

        initialInputs[
          participant.user_id
        ] = String(
          participant.effective_duration_min
        );
      }

      setParticipantDurationInputs(
        initialInputs
      );

    } catch (error) {

      console.error(
        "Errore caricamento durate individuali:",
        error
      );

      setSessionParticipants([]);

      setParticipantsError(
        "Impossibile caricare le durate individuali."
      );

    } finally {

      setParticipantsLoading(false);
    }
  }

  async function saveParticipantDuration(
    session: TrainingSession,
    participant: TrainingSessionParticipant
  ) {

    if (participantSavingUserId) {
      return;
    }

    const rawValue =
      participantDurationInputs[
        participant.user_id
      ] ?? "";


    /*
      Campo vuoto = usa durata standard.
    */

    const enteredDuration =
      rawValue.trim() === ""
        ? session.duration_min
        : Number(rawValue);


    if (
      !Number.isInteger(enteredDuration) ||
      enteredDuration < 0 ||
      enteredDuration > 600
    ) {

      setParticipantsError(
        "La durata deve essere un numero intero compreso tra 0 e 600 minuti."
      );

      return;
    }


    /*
      Se coincide con la durata standard,
      salviamo NULL: non serve un override.
    */

    const overrideDuration =
      enteredDuration ===
      session.duration_min
        ? null
        : enteredDuration;


    setParticipantSavingUserId(
      participant.user_id
    );

    setParticipantsError("");


    try {

      const {
        error,
      } = await supabase.rpc(
        "set_training_session_participant",
        {
          p_session_id:
            session.id,

          p_user_id:
            participant.user_id,

          p_duration_min:
            overrideDuration,

          p_attendance_status:
            participant.attendance_status ??
            "unknown",
        }
      );


      if (error) {
        throw error;
      }


      setSessionParticipants(
        (previous) =>
          previous.map((item) =>
            item.user_id ===
            participant.user_id
              ? {
                  ...item,

                  override_duration_min:
                    overrideDuration,

                  effective_duration_min:
                    enteredDuration,
                }
              : item
          )
      );


      /*
        Aggiorna immediatamente anche
        sRPE medio della seduta.
      */

      await loadSessionSummaries();

    } catch (error) {

      console.error(
        "Errore salvataggio durata individuale:",
        error
      );

      setParticipantsError(
        "Errore durante il salvataggio della durata."
      );

    } finally {

      setParticipantSavingUserId(
        null
      );
    }
  }

  async function loadUnlinkedPosts() {

  if (!staffProfile?.team_id) {
    return;
  }

  setUnlinkedPostsLoading(true);

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_unlinked_post_training"
  );

  if (error) {

    console.error(
      "Errore caricamento post-allenamento non associati:",
      error
    );

    setUnlinkedPosts([]);

  } else {

    const rows = (data ?? []) as Array<{
      monitoring_id: number | string;
      athlete_id: string;
      completed_at: string;
      wellness: number;
      rpe: number | string;
    }>;

    setUnlinkedPosts(
      rows.map((item) => ({
        id: Number(
          item.monitoring_id
        ),
        athlete_id:
          item.athlete_id,
        wellness: Number(
          item.wellness
        ),
        rpe: Number(
          item.rpe
        ),
        created_at:
          item.completed_at,
      }))
    );
  }

  setUnlinkedPostsLoading(false);
}


  // ==========================================================
  // OBJECTIVES
  // ==========================================================

  function toggleObjective(
    code: ObjectiveCode
  ) {

    setSelectedObjectives(
      (previous) => {

        const next = {
          ...previous,
        };

        if (
          Object.prototype.hasOwnProperty.call(
            next,
            code
          )
        ) {

          delete next[code];

          if (code === "other") {
            setOtherObjectiveLabel("");
          }

        } else {

          next[code] = "";
        }

        return next;
      }
    );
  }


  function updateObjectiveDuration(
    code: ObjectiveCode,
    value: string
  ) {

    setSelectedObjectives(
      (previous) => ({
        ...previous,
        [code]: value,
      })
    );
  }


  const selectedObjectiveEntries =
    Object.entries(
      selectedObjectives
    );

  const objectivesMinutesTotal =
    selectedObjectiveEntries.reduce(
      (sum, [, value]) =>
        sum +
        (Number(value) || 0),
      0
    );


  const objectivesComplete =
    selectedObjectiveEntries.length > 0 &&
    selectedObjectiveEntries.every(
      ([, value]) =>
        Number(value) > 0
    ) &&
    (
      selectedObjectives.other ===
        undefined ||
      otherObjectiveLabel.trim() !== ""
    );


  const formComplete =
    sessionDate !== "" &&
    Number(durationMin) > 0 &&
    objectivesComplete;

  // ==========================================================
  // MODIFY SESSION
  // ==========================================================

function resetSessionForm() {
  setSessionDate(getTodayLocal());
  setStartTime("");
  setDurationMin("");
  setSessionType("training");
  setSessionNotes("");
  setSelectedObjectives({});
  setOtherObjectiveLabel("");
  setEditingSessionId(null);

  setSessionError("");
}


function startEditSession(
  session: TrainingSession
) {
  setEditingSessionId(
    session.id
  );

  setSessionDate(
    session.session_date
  );

  setStartTime(
    session.start_time
      ? session.start_time.slice(0, 5)
      : ""
  );

  setDurationMin(
    String(session.duration_min)
  );

  setSessionType(
    session.session_type
  );

  setSessionNotes(
    session.notes ?? ""
  );


  const objectives:
    Partial<
      Record<
        ObjectiveCode,
        string
      >
    > = {};

  session.training_session_objectives.forEach(
    (objective) => {
      objectives[
        objective.objective_code
      ] = String(
        objective.duration_min
      );
    }
  );

  setSelectedObjectives(
    objectives
  );


  const otherObjective =
    session.training_session_objectives.find(
      (objective) =>
        objective.objective_code ===
        "other"
    );

  setOtherObjectiveLabel(
    otherObjective?.other_label ??
      ""
  );


  setSessionSuccess("");
  setSessionError("");


  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}


function cancelEditSession() {
  resetSessionForm();

  setSessionSuccess("");
  setSessionError("");
}

async function handleAssociatePost(
    monitoringId: number
  ) {

    const sessionId =
      associationSelections[
        String(monitoringId)
      ];

    if (
      !sessionId ||
      associatingPostId
    ) {
      return;
    }

    setAssociatingPostId(
      monitoringId
    );

    setAssociationError("");
    setAssociationSuccess("");

    try {

      const {
        error,
      } = await supabase.rpc(
        "set_post_training_session",
        {
          p_monitoring_id:
            monitoringId,

          p_session_id:
            sessionId,
        }
      );

      if (error) {
        throw error;
      }


      // Rimuove subito dalla lista
      // il record appena associato.
      setUnlinkedPosts(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !==
              monitoringId
          )
      );


      // Elimina la selezione
      setAssociationSelections(
        (previous) => {

          const next = {
            ...previous,
          };

          delete next[
            String(monitoringId)
          ];

          return next;
        }
      );


      setAssociationSuccess(
        "Post-allenamento associato correttamente."
      );
      
await loadSessionSummaries();
      
    } catch (error) {

      console.error(
        "Errore associazione post-allenamento:",
        error
      );

      setAssociationError(
        "Errore durante l'associazione alla seduta."
      );

    } finally {

      setAssociatingPostId(
        null
      );
    }
}

  // ==========================================================
  // CREATE SESSION
  // ==========================================================

async function handleCreateSession() {

  if (
    !staffProfile?.team_id ||
    !formComplete ||
    savingSession
  ) {
    return;
  }

  setSavingSession(true);

  setSessionError("");
  setSessionSuccess("");


  const objectives =
    selectedObjectiveEntries.map(
      ([code, duration]) => ({
        objective_code: code,

        duration_min:
          Number(duration),

        other_label:
          code === "other"
            ? otherObjectiveLabel.trim()
            : null,
      })
    );


  try {

    if (editingSessionId) {

      // ==========================================
      // MODIFICA SEDUTA ESISTENTE
      // ==========================================

      const {
        error,
      } = await supabase.rpc(
        "update_training_session",
        {
          p_session_id:
            editingSessionId,

          p_session_date:
            sessionDate,

          p_start_time:
            startTime || null,

          p_duration_min:
            Number(durationMin),

          p_session_type:
            sessionType,

          p_notes:
            sessionNotes.trim(),

          p_objectives:
            objectives,
        }
      );


      if (error) {
        throw error;
      }


      setSessionSuccess(
        "Seduta modificata correttamente."
      );

    } else {

      // ==========================================
      // NUOVA SEDUTA
      // ==========================================

      const {
        error,
      } = await supabase.rpc(
        "create_training_session",
        {
          p_session_date:
            sessionDate,

          p_start_time:
            startTime || null,

          p_duration_min:
            Number(durationMin),

          p_session_type:
            sessionType,

          p_notes:
            sessionNotes.trim(),

          p_objectives:
            objectives,
        }
      );


      if (error) {
        throw error;
      }


      setSessionSuccess(
        "Seduta salvata correttamente."
      );
    }


    // Reset del form
    setSessionDate(
      getTodayLocal()
    );

    setStartTime("");
    setDurationMin("");

    setSessionType(
      "training"
    );

    setSessionNotes("");

    setSelectedObjectives(
      {}
    );

    setOtherObjectiveLabel(
      ""
    );

    setEditingSessionId(
      null
    );


    // Aggiorna elenco sedute
    await loadSessions();


  } catch (error) {

    console.error(
      "Errore salvataggio seduta:",
      error
    );

    setSessionError(
      editingSessionId
        ? "Errore durante la modifica della seduta."
        : "Errore durante il salvataggio della seduta."
    );

  } finally {

    setSavingSession(false);
  }
}


  // ==========================================================
  // HELPERS
  // ==========================================================

  function getObjectiveLabel(
    code: ObjectiveCode
  ) {

    return (
      objectiveOptions.find(
        (item) =>
          item.code === code
      )?.label ?? code
    );
  }


  function getSessionTypeLabel(
    value: string
  ) {

    return (
      sessionTypeOptions.find(
        (item) =>
          item.value === value
      )?.label ?? value
    );
  }


  // ==========================================================
  // INITIAL AUTH
  // ==========================================================

  useEffect(() => {

    async function initializeAuth() {

      try {

        const {
          data: { session },
        } =
          await supabase.auth.getSession();

        if (!session) {
          return;
        }

        const {
          data: { user },
          error,
        } =
          await supabase.auth.getUser();

        if (
          error ||
          !user
        ) {
          return;
        }

        await loadStaffProfile(
          user.id
        );

      } catch (error) {

        console.error(
          "Errore inizializzazione staff:",
          error
        );

      } finally {

        setAuthLoading(false);
      }
    }

    initializeAuth();

  }, []);


  // ==========================================================
  // LOAD SESSIONS WHEN PROFILE IS READY
  // ==========================================================

  useEffect(() => {

    if (
      staffProfile?.team_id
    ) {
      loadSessions();
      loadUnlinkedPosts();
      loadSessionSummaries();
    }

  }, [staffProfile?.team_id]);


  // ==========================================================
  // LOADING
  // ==========================================================

  if (authLoading) {

    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">

        <p className="text-gray-600">
          Caricamento...
        </p>

      </main>
    );
  }


  // ==========================================================
  // LOGIN SCREEN
  // ==========================================================

  if (!staffProfile) {

    return (
      <main className="min-h-screen bg-gray-100 px-4 py-8">

        <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-md">

          <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
            Staff Portal
          </h1>

          <p className="mb-8 text-center text-gray-600">
            Accedi al tuo account staff
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
                  setLoginId(
                    e.target.value
                  )
                }
                autoCapitalize="none"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
              />

            </div>

            <div className="mb-6">

              <label className="mb-2 block font-semibold text-gray-700">
                Password
              </label>

              <input
                type="password"
                value={
                  loginPassword
                }
                onChange={(e) =>
                  setLoginPassword(
                    e.target.value
                  )
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
                ? "Accesso..."
                : "Accedi"}
            </button>

          </form>

        </div>

      </main>
    );
  }


  // ==========================================================
  // STAFF PORTAL
  // ==========================================================

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">

      <div className="mx-auto max-w-3xl">

        {/* HEADER */}

        <div className="mb-6 rounded-2xl bg-white p-6 shadow-md">

          <div className="flex items-start justify-between gap-4">

            <div>

              <h1 className="text-2xl font-bold text-gray-900">
                Staff Portal
              </h1>

              {team ? (

                <p className="mt-2 text-gray-600">
                  {team.club
                    ? `${team.club} · `
                    : ""}
                  {team.name}
                </p>

              ) : (

                <p className="mt-2 text-gray-600">
                  Accesso amministratore
                </p>

              )}

            </div>

            <button
              type="button"
              onClick={
                handleLogout
              }
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>

          </div>

        </div>


        {/* FORM */}

        {staffProfile.team_id ? (

          <div className="mb-6 rounded-2xl bg-white p-6 shadow-md">

            <h2 className="mb-1 text-xl font-bold text-gray-900">
              {editingSessionId
                ? "Modifica seduta"
                : "Nuova seduta"}
            </h2>

            <p className="mb-6 text-sm text-gray-600">
              {editingSessionId
                ? "Modifica le caratteristiche e gli obiettivi della seduta."
                : "Registra le caratteristiche e gli obiettivi della seduta."}
            </p>

            {/* DATA + ORARIO */}

            <div className="mb-5 grid gap-4 sm:grid-cols-2">

              <div>

                <label className="mb-2 block font-medium text-gray-900">
                  Data
                </label>

                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) =>
                    setSessionDate(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
                />

              </div>


              <div>

                <label className="mb-2 block font-medium text-gray-900">
                  Ora di inizio
                </label>

                <input
                  type="time"
                  value={startTime}
                  onChange={(e) =>
                    setStartTime(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
                />

              </div>

            </div>


            {/* DURATA + TIPO */}

            <div className="mb-6 grid gap-4 sm:grid-cols-2">

              <div>

                <label className="mb-2 block font-medium text-gray-900">
                  Durata totale (min)
                </label>

                <input
                  type="number"
                  min="1"
                  max="600"
                  value={durationMin}
                  onChange={(e) =>
                    setDurationMin(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
                />

              </div>


              <div>

                <label className="mb-2 block font-medium text-gray-900">
                  Tipo di seduta
                </label>

                <select
                  value={sessionType}
                  onChange={(e) =>
                    setSessionType(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900"
                >

                  {sessionTypeOptions.map(
                    (item) => (

                      <option
                        key={
                          item.value
                        }
                        value={
                          item.value
                        }
                      >
                        {item.label}
                      </option>

                    )
                  )}

                </select>

              </div>

            </div>


            {/* OBJECTIVES */}

            <div className="mb-6">

              <h3 className="mb-1 font-bold text-gray-900">
                Obiettivi della seduta
              </h3>

              <p className="mb-4 text-sm text-gray-600">
                Seleziona gli obiettivi sviluppati e indica i minuti dedicati.
              </p>


              <div className="space-y-3">

                {objectiveOptions.map(
                  (objective) => {

                    const selected =
                      selectedObjectives[
                        objective.code
                      ] !== undefined;

                    return (

                      <div
                        key={
                          objective.code
                        }
                        className="rounded-xl border border-gray-200 p-4"
                      >

                        <div className="flex items-center gap-3">

                          <input
                            type="checkbox"
                            checked={
                              selected
                            }
                            onChange={() =>
                              toggleObjective(
                                objective.code
                              )
                            }
                            className="h-5 w-5"
                          />

                          <span className="flex-1 font-medium text-gray-900">
                            {objective.label}
                          </span>

                          {selected && (

                            <div className="flex items-center justify-between gap-2 sm:justify-start">

                              <input
                                type="number"
                                min="1"
                                max="600"
                                placeholder="min"
                                value={
                                  selectedObjectives[
                                    objective.code
                                  ] ?? ""
                                }
                                onChange={(e) =>
                                  updateObjectiveDuration(
                                    objective.code,
                                    e.target.value
                                  )
                                }
                                className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                              />

                              <span className="text-sm text-gray-500">
                                min
                              </span>

                            </div>

                          )}

                        </div>


                        {selected &&
                          objective.code ===
                            "other" && (

                          <input
                            type="text"
                            value={
                              otherObjectiveLabel
                            }
                            onChange={(e) =>
                              setOtherObjectiveLabel(
                                e.target.value
                              )
                            }
                            placeholder="Descrivi l'obiettivo"
                            className="mt-3 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
                          />

                        )}

                      </div>

                    );
                  }
                )}

              </div>


              {selectedObjectiveEntries.length >
                0 && (

                <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">

                  Minuti associati agli obiettivi:{" "}

                  <strong>
                    {objectivesMinutesTotal}
                  </strong>

                  {durationMin &&
                    Number(durationMin) >
                      0 && (

                    <>
                      {" "}
                      / durata seduta{" "}
                      <strong>
                        {durationMin}
                      </strong>
                    </>

                  )}

                  <p className="mt-1 text-xs text-gray-500">
                    Gli obiettivi possono sovrapporsi: la loro somma non deve necessariamente coincidere con la durata totale.
                  </p>

                </div>

              )}

            </div>


            {/* NOTES */}

            <div className="mb-6">

              <label className="mb-2 block font-medium text-gray-900">
                Note opzionali
              </label>

              <textarea
                value={sessionNotes}
                onChange={(e) =>
                  setSessionNotes(
                    e.target.value
                  )
                }
                rows={4}
                placeholder="Aggiungi eventuali informazioni utili sulla seduta"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
              />

            </div>


            {/* SAVE */}

            <button
              type="button"
              onClick={
                handleCreateSession
              }
              disabled={
                !formComplete ||
                savingSession
              }
              className="w-full rounded-lg bg-black py-4 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {savingSession
                ? "Salvataggio..."
                : editingSessionId
                ? "Salva modifiche"
                : "Salva seduta"}
            </button>


                              {editingSessionId && (
                                <button
                                  type="button"
                                  onClick={
                                    cancelEditSession
                                  }
                                  disabled={
                                    savingSession
                                  }
                                  className="mt-3 w-full rounded-lg border border-gray-300 bg-white py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Annulla modifica
                                </button>
                              )}


            {sessionSuccess && (

              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-center text-green-800">
                {sessionSuccess}
              </div>

            )}


            {sessionError && (

              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-800">
                {sessionError}
              </div>

            )}

          </div>

        ) : (

          <div className="mb-6 rounded-2xl bg-white p-6 shadow-md">

            <p className="text-gray-600">
              La creazione delle sedute richiede un account staff associato a una squadra.
            </p>

          </div>

        )}

  {/* ==========================================================
      POST-ALLENAMENTO DA ASSOCIARE
  ========================================================== */}

  {staffProfile.team_id && (


      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

        <div className="mb-5">

          <h2 className="text-xl font-bold text-gray-900">
            Post-allenamento da associare
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Questionari compilati dalle atlete che non sono ancora
            associati a una seduta di allenamento.
          </p>

        </div>

        {associationError && (

          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {associationError}
          </div>

        )}

        {associationSuccess && (

          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {associationSuccess}
          </div>

        )}

        {unlinkedPostsLoading ? (

          <div className="py-6 text-center text-sm text-gray-500">
            Caricamento...
          </div>

        ) : unlinkedPosts.length === 0 ? (

          <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
            Non ci sono post-allenamento da associare.
          </div>

        ) : (

          <div className="space-y-4">

            {unlinkedPosts.map((post) => {

              const selectedSessionId =
                associationSelections[
                  String(post.id)
                ] ?? "";

              const availableSessions =
                sessions.filter(
                  (session) =>
                    session.status === "open" ||
                    session.status === "closed"
                );

              return (

                <div
                  key={post.id}
                  className="w-full min-w-0 overflow-hidden rounded-xl border border-gray-200 p-4"
                >

                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">

                    <div>

                      <div className="font-semibold text-gray-900">
                        {post.athlete_id}
                      </div>

                      <div className="mt-1 text-sm text-gray-500">

                        {new Date(
                          post.created_at
                        ).toLocaleString(
                          "it-IT",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}

                      </div>

                    </div>

                    <div className="flex gap-4">

                      <div className="text-center">

                        <div className="text-xs text-gray-500">
                          RPE
                        </div>

                        <div className="text-lg font-bold text-gray-900">
                          {post.rpe}
                        </div>

                      </div>

                      <div className="text-center">

                        <div className="text-xs text-gray-500">
                          Wellness
                        </div>

                        <div className="text-lg font-bold text-gray-900">
                          {post.wellness}
                        </div>

                      </div>

                    </div>

                  </div>


                  <label className="mb-2 block text-sm font-medium text-gray-800">
                    Seduta di riferimento
                  </label>


                  <select
                    value={selectedSessionId}
                    onChange={(event) => {

                      setAssociationSelections(
                        (previous) => ({
                          ...previous,

                          [String(post.id)]:
                            event.target.value,
                        })
                      );

                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900"
                  >

                    <option value="">
                      Seleziona una seduta
                    </option>


                    {availableSessions.map(
                      (session) => (

                        <option
                          key={session.id}
                          value={session.id}
                        >

                          {session.session_date}

                          {session.start_time
                            ? ` · ${session.start_time.slice(
                                0,
                                5
                              )}`
                            : ""}

                          {" · "}

                          {getSessionTypeLabel(
                            session.session_type
                          )}

                          {" · "}

                          {session.duration_min} min
                        </option>
                      )
                    )}

                  </select>

                  {availableSessions.length === 0 && (

                    <div className="mt-2 text-sm text-amber-700">
                      Non ci sono sedute disponibili per
                      l'associazione.
                    </div>

                  )}

                  <button
                    type="button"
                    disabled={
                      !selectedSessionId ||
                      associatingPostId !== null
                    }
                    onClick={() =>
                      handleAssociatePost(
                        post.id
                      )
                    }
                    className="mt-3 w-full rounded-lg bg-gray-900 px-4 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >

                    {associatingPostId ===
                    post.id
                      ? "Associazione..."
                      : "Associa alla seduta"}

                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
  )}

        {/* RECENT SESSIONS */}

        {staffProfile.team_id && (

          <div className="rounded-2xl bg-white p-6 shadow-md">

            <h2 className="mb-5 text-xl font-bold text-gray-900">
              Ultime sedute
            </h2>


            {sessionsLoading ? (

              <p className="text-gray-600">
                Caricamento...
              </p>

            ) : sessions.length === 0 ? (

              <p className="text-gray-600">
                Nessuna seduta registrata.
              </p>

            ) : (

              <div className="space-y-4">

                {sessions.map(
                  (session) => (

                    <div
                      key={
                        session.id
                      }
                     className="w-full min-w-0 overflow-hidden rounded-xl border border-gray-200 p-4"
                    >

                      <div className="flex flex-wrap items-start justify-between gap-3">

                        <div>

                          <div className="font-bold text-gray-900">

                            {
                              session.session_date
                            }

                            {session.start_time &&
                              ` · ${session.start_time.slice(
                                0,
                                5
                              )}`}

                          </div>

                          <div className="mt-1 text-sm text-gray-600">

                            {
                              session.duration_min
                            }{" "}
                            min ·{" "}

                            {getSessionTypeLabel(
                              session.session_type
                            )}

                          </div>

                        </div>

                      <div className="flex items-center justify-between gap-2 sm:justify-start">

                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                          {session.status}
                        </span>
</div>

</div>

    {/* RIEPILOGO POST-ALLENAMENTO */}

                            {(() => {

                            const summary =
                              sessionSummaries[session.id];

                            const responseCount =
                              summary?.response_count ?? 0;

                            return (

                              <div className="mt-4 rounded-xl bg-gray-50 p-4">

                                <div className="mb-3 text-sm font-semibold text-gray-900">
                                  Post-allenamento
                                </div>


                                {responseCount === 0 ? (

                                  <div className="text-sm text-gray-500">
                                    Nessuna risposta
                                  </div>

                                ) : (

                                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                                    <div>

                                      <div className="text-xs text-gray-500">
                                        Risposte
                                      </div>

                                      <div className="mt-1 font-bold text-gray-900">
                                        {responseCount}
                                      </div>

                                    </div>


                                    <div>

                                      <div className="text-xs text-gray-500">
                                        RPE medio
                                      </div>

                                      <div className="mt-1 font-bold text-gray-900">
                                        {summary?.mean_rpe ?? "—"}
                                      </div>

                                    </div>


                                    <div>

                                      <div className="text-xs text-gray-500">
                                        sRPE medio
                                      </div>

                                      <div className="mt-1 font-bold text-gray-900">
                                        {summary?.mean_srpe ?? "—"}
                                        {summary?.mean_srpe !== null &&
                                          summary?.mean_srpe !== undefined
                                          ? " AU"
                                          : ""}
                                      </div>

                                    </div>

                                  </div>

                                )}

                              </div>

                            );

                          })()}

  <div className="mt-4">

  <button
    type="button"
    onClick={() =>
      openParticipantDurations(
        session
      )
    }
    className="w-full max-w-full whitespace-normal rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-semibold text-gray-800 sm:w-auto"
  >
    {participantSessionId ===
    session.id
      ? "Chiudi durate individuali"
      : "Durate individuali"}
  </button>


  {participantSessionId ===
    session.id && (

    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">

      <div className="mb-1 font-semibold text-gray-900">
        Durate individuali
      </div>

      <div className="mb-4 text-sm text-gray-600">
        Durata standard della seduta:{" "}
        <strong>
          {session.duration_min} min
        </strong>
      </div>


      {participantsError && (

        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {participantsError}
        </div>

      )}


      {participantsLoading ? (

        <div className="text-sm text-gray-600">
          Caricamento...
        </div>

      ) : (

        <div className="space-y-3">

          {sessionParticipants.map(
            (participant) => {

              const isOverride =
                participant
                  .override_duration_min !==
                null;

              return (

                <div
                  key={
                    participant.user_id
                  }
                  className="rounded-lg bg-white p-3"
                >

                  <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <div className="font-medium text-gray-900">
                        {
                          participant.athlete_id
                        }
                      </div>

                      <div className="text-xs text-gray-500">
                        {isOverride
                          ? "Durata personalizzata"
                          : "Durata standard"}
                      </div>

                    </div>


                    <div className="flex items-center justify-between gap-2 sm:justify-start">

                      <input
                        type="number"
                        min="0"
                        max="600"
                        step="1"
                        value={
                          participantDurationInputs[
                            participant.user_id
                          ] ?? ""
                        }
                        onChange={(event) =>
                          setParticipantDurationInputs(
                            (previous) => ({
                              ...previous,

                              [participant.user_id]:
                                event.target.value,
                            })
                          )
                        }
                        className="w-20 rounded-lg border border-gray-300 px-2 py-2 text-center text-gray-900"
                      />

                      <span className="text-sm text-gray-600">
                        min
                      </span>

                    </div>

                  </div>


                  <button
                    type="button"
                    disabled={
                      participantSavingUserId !==
                      null
                    }
                    onClick={() =>
                      saveParticipantDuration(
                        session,
                        participant
                      )
                    }
                    className="w-full max-w-full whitespace-normal rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-semibold text-gray-800 sm:w-auto"
                  >

                    {participantSavingUserId ===
                    participant.user_id
                      ? "Salvataggio..."
                      : "Salva durata"}

                  </button>

                </div>

              );
            }
          )}

        </div>

      )}

    </div>

  )}

</div>


                        <button
                          type="button"
                          onClick={() =>
                            startEditSession(
                              session
                            )
                          }
                          className="w-full max-w-full whitespace-normal break-words rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-semibold text-gray-800 sm:w-auto"
                        >
                          Modifica
                        </button>

                      <div className="mt-4 flex flex-wrap gap-2">

                        {session.training_session_objectives.map(
                          (
                            objective
                          ) => (

                            <span
                              key={
                                objective.id
                              }
                              className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                            >

                              {objective.objective_code ===
                                "other"
                                ? objective.other_label ??
                                  "Altro"
                                : getObjectiveLabel(
                                    objective.objective_code
                                  )}

                              {" · "}

                              {
                                objective.duration_min
                              }{" "}
                              min

                            </span>

                          )
                        )}

                      </div>


                      {session.notes && (

                        <p className="mt-4 text-sm text-gray-600">
                          {session.notes}
                        </p>

                      )}

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        )}

      </div>

    </main>
  );
}