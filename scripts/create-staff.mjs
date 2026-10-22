import { createClient } from "@supabase/supabase-js";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import {
  randomInt,
  randomUUID,
} from "node:crypto";

import {
  existsSync,
  mkdirSync,
  appendFileSync,
} from "node:fs";

import path from "node:path";


/* ==========================================================
   CONFIGURAZIONE
========================================================== */

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY;


if (!supabaseUrl || !supabaseSecretKey) {

  console.error(
    "\n❌ Variabili Supabase mancanti."
  );

  console.error(
    "Controlla NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SECRET_KEY in .env.local.\n"
  );

  process.exit(1);
}


/* ==========================================================
   CLIENT ADMIN SUPABASE
========================================================== */

const supabase = createClient(
  supabaseUrl,
  supabaseSecretKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);


/* ==========================================================
   TERMINALE
========================================================== */

const rl = createInterface({
  input,
  output,
});


/* ==========================================================
   PASSWORD
========================================================== */

function randomCharacter(
  characters
) {

  return characters[
    randomInt(
      0,
      characters.length
    )
  ];
}


function shuffleString(
  value
) {

  const characters =
    value.split("");


  for (
    let i =
      characters.length - 1;

    i > 0;

    i--
  ) {

    const j =
      randomInt(
        0,
        i + 1
      );

    [
      characters[i],
      characters[j],
    ] = [
      characters[j],
      characters[i],
    ];
  }


  return characters.join("");
}


function generatePassword(
  length = 16
) {

  /*
    Evitiamo caratteri facilmente
    confondibili:

    l / I / 1
    O / 0
  */

  const lowercase =
    "abcdefghijkmnopqrstuvwxyz";

  const uppercase =
    "ABCDEFGHJKLMNPQRSTUVWXYZ";

  const numbers =
    "23456789";

  const symbols =
    "!@#$%";


  const all =
    lowercase +
    uppercase +
    numbers +
    symbols;


  /*
    Garantiamo almeno:
    - una minuscola
    - una maiuscola
    - un numero
    - un simbolo
  */

  let password = "";

  password +=
    randomCharacter(
      lowercase
    );

  password +=
    randomCharacter(
      uppercase
    );

  password +=
    randomCharacter(
      numbers
    );

  password +=
    randomCharacter(
      symbols
    );


  while (
    password.length < length
  ) {

    password +=
      randomCharacter(
        all
      );
  }


  return shuffleString(
    password
  );
}


/* ==========================================================
   CSV
========================================================== */

function csvEscape(
  value
) {

  const stringValue =
    String(
      value ?? ""
    );

  return `"${stringValue.replaceAll(
    '"',
    '""'
  )}"`;
}


function saveCredentials({
  loginId,
  password,
  teamName,
  club,
  userId,
}) {

  const privateDirectory =
    path.join(
      process.cwd(),
      "private"
    );


  if (
    !existsSync(
      privateDirectory
    )
  ) {

    mkdirSync(
      privateDirectory,
      {
        recursive: true,
      }
    );
  }


  const csvPath =
    path.join(
      privateDirectory,
      "new-staff.csv"
    );


  const fileExists =
    existsSync(
      csvPath
    );


  if (!fileExists) {

    appendFileSync(
      csvPath,

      [
        "login_id",
        "password",
        "team",
        "club",
        "user_id",
        "created_at",
      ].join(",") + "\n",

      "utf8"
    );
  }


  const row = [
    csvEscape(loginId),
    csvEscape(password),
    csvEscape(teamName),
    csvEscape(club),
    csvEscape(userId),
    csvEscape(
      new Date().toISOString()
    ),
  ].join(",");


  appendFileSync(
    csvPath,
    row + "\n",
    "utf8"
  );


  return csvPath;
}


/* ==========================================================
   MAIN
========================================================== */

async function main() {

  console.log(
    "\n======================================"
  );

  console.log(
    " CREAZIONE ACCOUNT STAFF"
  );

  console.log(
    "======================================\n"
  );


  /* ========================================================
     1. CARICA SQUADRE ATTIVE
  ======================================================== */

  const {
    data: teams,
    error: teamsError,
  } = await supabase
    .from("teams")
    .select(`
      id,
      name,
      club
    `)
    .eq(
      "active",
      true
    )
    .order(
      "club"
    )
    .order(
      "name"
    );


  if (teamsError) {

    throw new Error(
      `Errore caricamento squadre: ${teamsError.message}`
    );
  }


  if (
    !teams ||
    teams.length === 0
  ) {

    throw new Error(
      "Non ci sono squadre attive nel database."
    );
  }


  console.log(
    "Squadre disponibili:\n"
  );


  teams.forEach(
    (
      team,
      index
    ) => {

      const club =
        team.club
          ? `${team.club} - `
          : "";

      console.log(
        `${index + 1}. ${club}${team.name}`
      );
    }
  );


  /* ========================================================
     2. SELEZIONE SQUADRA
  ======================================================== */

  console.log("");


  const teamInput =
    await rl.question(
      "Numero della squadra: "
    );


  const teamIndex =
    Number(
      teamInput
    ) - 1;


  if (
    !Number.isInteger(
      teamIndex
    ) ||
    teamIndex < 0 ||
    teamIndex >=
      teams.length
  ) {

    throw new Error(
      "Selezione squadra non valida."
    );
  }


  const selectedTeam =
    teams[
      teamIndex
    ];


  /* ========================================================
     3. LOGIN ID
  ======================================================== */

  const loginId =
    (
      await rl.question(
        "Login staff: "
      )
    )
      .trim()
      .toLowerCase();


  if (!loginId) {

    throw new Error(
      "Il login staff non può essere vuoto."
    );
  }


  /*
    Evitiamo spazi nel login.
  */

  if (
    /\s/.test(
      loginId
    )
  ) {

    throw new Error(
      "Il login staff non può contenere spazi."
    );
  }


  /*
    Controllo duplicato login_id.
  */

  const {
    data: existingProfile,
    error: existingProfileError,
  } = await supabase
    .from("profiles")
    .select(`
      id,
      login_id,
      role
    `)
    .eq(
      "login_id",
      loginId
    )
    .maybeSingle();


  if (
    existingProfileError
  ) {

    throw new Error(
      `Errore controllo login: ${existingProfileError.message}`
    );
  }


  if (
    existingProfile
  ) {

    throw new Error(
      `Il login "${loginId}" esiste già. Nessun account è stato creato.`
    );
  }


  /* ========================================================
     4. GENERA PASSWORD
  ======================================================== */

  const password =
    generatePassword(
      16
    );


  /* ========================================================
     5. RIEPILOGO
  ======================================================== */

  console.log(
    "\n--------------------------------------"
  );

  console.log(
    "Riepilogo:"
  );

  console.log(
    `Login:   ${loginId}`
  );

  console.log(
    "Ruolo:   staff"
  );

  console.log(
    `Squadra: ${
      selectedTeam.club
        ? `${selectedTeam.club} - `
        : ""
    }${selectedTeam.name}`
  );

  console.log(
    "Password: verrà generata automaticamente"
  );

  console.log(
    "--------------------------------------\n"
  );


  const confirmation =
    (
      await rl.question(
        "Confermi la creazione? (s/n): "
      )
    )
      .trim()
      .toLowerCase();


  if (
    confirmation !== "s" &&
    confirmation !== "si" &&
    confirmation !== "sì"
  ) {

    console.log(
      "\nOperazione annullata."
    );

    return;
  }


  /* ========================================================
     6. CREA UTENTE AUTH
  ======================================================== */

  /*
    Email tecnica interna.
    Non viene usata dallo staff
    per effettuare il login.
  */

  const internalEmail =
    `staff-${randomUUID()}@staff.internal`;


  console.log(
    "\nCreazione utente Auth..."
  );


  const {
    data: authData,
    error: authError,
  } =
    await supabase
      .auth
      .admin
      .createUser({
        email:
          internalEmail,

        password,

        email_confirm:
          true,

        user_metadata: {
          role:
            "staff",

          login_id:
            loginId,
        },
      });


  if (
    authError ||
    !authData.user
  ) {

    throw new Error(
      `Errore creazione Auth: ${
        authError?.message ??
        "utente non creato"
      }`
    );
  }


  const userId =
    authData.user.id;


  /* ========================================================
     7. CREA PROFILO
  ======================================================== */

  console.log(
    "Creazione profilo staff..."
  );


  const {
    error: profileError,
  } = await supabase
    .from(
      "profiles"
    )
    .insert({
      id:
        userId,

      role:
        "staff",

      team_id:
        selectedTeam.id,

      athlete_id:
        null,

      login_id:
        loginId,

      active:
        true,
    });


  if (
    profileError
  ) {

    /*
      Rollback:
      se profiles fallisce,
      eliminiamo l'utente Auth.
    */

    console.error(
      "\n⚠️ Profilo non creato."
    );

    console.log(
      "Rollback utente Auth..."
    );


    const {
      error: deleteError,
    } =
      await supabase
        .auth
        .admin
        .deleteUser(
          userId
        );


    if (
      deleteError
    ) {

      console.error(
        "⚠️ Rollback Auth non riuscito:",
        deleteError.message
      );
    }


    throw new Error(
      `Errore creazione profilo: ${profileError.message}`
    );
  }


  /* ========================================================
     8. SALVA CREDENZIALI
  ======================================================== */

  let credentialsPath =
    null;


  try {

    credentialsPath =
      saveCredentials({
        loginId,

        password,

        teamName:
          selectedTeam.name,

        club:
          selectedTeam.club ??
          "",

        userId,
      });

  } catch (
    csvError
  ) {

    /*
      L'account è già stato creato.
      Non facciamo rollback solo
      perché il CSV non è stato scritto.
    */

    console.error(
      "\n⚠️ Account creato, ma non è stato possibile salvare il CSV:"
    );

    console.error(
      csvError instanceof Error
        ? csvError.message
        : csvError
    );
  }


  /* ========================================================
     9. RISULTATO
  ======================================================== */

  console.log(
    "\n======================================"
  );

  console.log(
    " ✅ ACCOUNT STAFF CREATO"
  );

  console.log(
    "======================================\n"
  );


  console.log(
    `Login:    ${loginId}`
  );

  console.log(
    `Password: ${password}`
  );

  console.log(
    `Squadra:  ${selectedTeam.name}`
  );

  console.log(
    `User ID:  ${userId}`
  );


  if (
    credentialsPath
  ) {

    console.log(
      `\nCredenziali salvate in:`
    );

    console.log(
      credentialsPath
    );
  }


  console.log(
    "\nConserva le credenziali in un luogo sicuro."
  );

  console.log("");
}


/* ==========================================================
   AVVIO
========================================================== */

try {

  await main();

} catch (
  error
) {

  console.error(
    "\n❌ ERRORE:"
  );

  console.error(
    error instanceof Error
      ? error.message
      : error
  );

  process.exitCode =
    1;

} finally {

  rl.close();
}