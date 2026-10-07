import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);

function getArg(name) {
  const index = args.indexOf(`--${name}`);
  if (index === -1) return null;
  return args[index + 1] ?? null;
}

function normalizeClubName(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function generatePassword(length = 14) {
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const numbers = "23456789";
  const symbols = "!@#$%";
  const all = lower + upper + numbers + symbols;

  const required = [
    lower[crypto.randomInt(lower.length)],
    upper[crypto.randomInt(upper.length)],
    numbers[crypto.randomInt(numbers.length)],
    symbols[crypto.randomInt(symbols.length)],
  ];

  while (required.length < length) {
    required.push(
      all[crypto.randomInt(all.length)]
    );
  }

  for (let i = required.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [required[i], required[j]] = [
      required[j],
      required[i],
    ];
  }

  return required.join("");
}

function appendCredentialsToCsv({
  club,
  teamName,
  loginId,
  athleteId,
  temporaryPassword,
  userId,
  teamId,
}) {
  const outputDir = path.join(process.cwd(), "private");
  const outputFile = path.join(outputDir, "new-athletes.csv");

  fs.mkdirSync(outputDir, { recursive: true });

  const fileExists = fs.existsSync(outputFile);

  if (!fileExists) {
    fs.writeFileSync(
      outputFile,
      "created_at,club,team,login_id,athlete_id,password,auth_uuid,team_id\n",
      "utf8"
    );
  }

  const createdAt = new Date().toISOString();

  const row = [
    createdAt,
    club,
    teamName,
    loginId,
    athleteId,
    temporaryPassword,
    userId,
    teamId,
  ]
    .map((value) => `"${String(value).replaceAll('"', '""')}"`)
    .join(",");

  fs.appendFileSync(
    outputFile,
    `${row}\n`,
    "utf8"
  );
}

const clubArg = getArg("club");
const teamNameArg = getArg("team-name");

if (!clubArg || !teamNameArg) {
  console.error(`
Uso:

node --env-file=.env.local scripts/create-athlete.mjs --club trento --team-name U19
`);
  process.exit(1);
}

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  console.error(
    "Mancano NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY in .env.local"
  );

  process.exit(1);
}

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseSecretKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);

async function main() {
  const clubDisplay = clubArg.trim();
  const clubCode = normalizeClubName(clubArg);
  const teamName = teamNameArg.trim();

  if (!clubCode) {
    throw new Error("Nome club non valido.");
  }

  if (!teamName) {
    throw new Error("Nome team non valido.");
  }

  // ---------------------------------------
  // 1. CERCA IL TEAM
  // ---------------------------------------

  let teamId;

  const {
    data: existingTeam,
    error: teamSearchError,
  } = await supabaseAdmin
    .from("teams")
    .select("id, name, club, active")
    .ilike("club", clubDisplay)
    .ilike("name", teamName)
    .maybeSingle();

  if (teamSearchError) {
    throw new Error(
      `Errore ricerca team: ${teamSearchError.message}`
    );
  }

  if (existingTeam) {
    if (!existingTeam.active) {
      throw new Error(
        `Il team "${existingTeam.name}" esiste ma non è attivo.`
      );
    }

    teamId = existingTeam.id;

    console.log(
      `\nTeam esistente trovato: ${existingTeam.name}`
    );

    console.log(`Team ID: ${teamId}`);
  } else {
    // ---------------------------------------
    // 2. CREA IL TEAM SE NON ESISTE
    // ---------------------------------------

    const {
      data: newTeam,
      error: teamCreateError,
    } = await supabaseAdmin
      .from("teams")
      .insert({
        name: teamName,
        club: clubDisplay,
        active: true,
      })
      .select("id, name, club")
      .single();

    if (teamCreateError || !newTeam) {
      throw new Error(
        `Errore creazione team: ${
          teamCreateError?.message ??
          "team non creato"
        }`
      );
    }

    teamId = newTeam.id;

    console.log("\n✅ Nuovo team creato");
    console.log(`Club: ${newTeam.club}`);
    console.log(`Team: ${newTeam.name}`);
    console.log(`Team ID: ${teamId}`);
  }

  // ---------------------------------------
  // 3. TROVA IL PROSSIMO PROGRESSIVO
  // ---------------------------------------

  const prefix = `${clubCode}_`;

  const {
    data: existingProfiles,
    error: profilesError,
  } = await supabaseAdmin
    .from("profiles")
    .select("athlete_id")
    .like("athlete_id", `${prefix}%`);

  if (profilesError) {
    throw new Error(
      `Errore lettura profili: ${profilesError.message}`
    );
  }

  let highestNumber = 0;

  for (const profile of existingProfiles ?? []) {
    if (!profile.athlete_id) continue;

    const suffix =
      profile.athlete_id.slice(prefix.length);

    if (/^\d{3}$/.test(suffix)) {
      highestNumber = Math.max(
        highestNumber,
        Number(suffix)
      );
    }
  }

  const nextNumber = highestNumber + 1;

  if (nextNumber > 999) {
    throw new Error(
      `Progressivo massimo raggiunto per il club ${clubCode}.`
    );
  }

  const progressive =
    String(nextNumber).padStart(3, "0");

  const athleteId =
    `${clubCode}_${progressive}`;

  const loginId = athleteId;

  // ---------------------------------------
  // 4. EMAIL INTERNA E PASSWORD
  // ---------------------------------------

  const internalEmail =
    `${athleteId}@players.internal`;

  const temporaryPassword =
    generatePassword();

  // ---------------------------------------
  // 5. CONTROLLO DUPLICATI
  // ---------------------------------------

  const {
    data: duplicateProfile,
    error: duplicateError,
  } = await supabaseAdmin
    .from("profiles")
    .select("id, athlete_id, login_id")
    .or(
      `athlete_id.eq.${athleteId},login_id.eq.${loginId}`
    )
    .maybeSingle();

  if (duplicateError) {
    throw new Error(
      `Errore controllo duplicati: ${duplicateError.message}`
    );
  }

  if (duplicateProfile) {
    throw new Error(
      `Esiste già un profilo con codice ${athleteId}.`
    );
  }

  // ---------------------------------------
  // 6. CREA UTENTE AUTH
  // ---------------------------------------

  const {
    data: authData,
    error: authError,
  } =
    await supabaseAdmin.auth.admin.createUser({
      email: internalEmail,
      password: temporaryPassword,
      email_confirm: true,
    });

  if (authError || !authData.user) {
    throw new Error(
      `Errore creazione Auth: ${
        authError?.message ??
        "utente non creato"
      }`
    );
  }

  const userId = authData.user.id;

  // ---------------------------------------
  // 7. CREA PROFILO
  // ---------------------------------------

  try {
    const { error: insertError } =
      await supabaseAdmin
        .from("profiles")
        .insert({
          id: userId,
          role: "athlete",
          team_id: teamId,
          athlete_id: athleteId,
          login_id: loginId,
          active: true,
        });

    if (insertError) {
      throw insertError;
    }
  } catch (error) {
    console.error(
      "\nCreazione profilo fallita. Rollback utente Auth..."
    );

    const { error: deleteError } =
      await supabaseAdmin.auth.admin.deleteUser(
        userId
      );

    if (deleteError) {
      console.error(
        "ATTENZIONE: rollback Auth fallito:",
        deleteError.message
      );
    }

    throw error;
  }

  // ---------------------------------------
  // 7.1 SALVA CREDENZIALI SU CSV
  // ---------------------------------------

  appendCredentialsToCsv({
    club: clubDisplay,
    teamName,
    loginId,
    athleteId,
    temporaryPassword,
    userId,
    teamId,
  });

  // ---------------------------------------
  // 8. RISULTATO
  // ---------------------------------------

  console.log(
  "\nCredenziali salvate anche in private/new-athletes.csv");

  console.log(
    "\n✅ Atleta creata correttamente\n"
  );

  console.log(`Club: ${clubDisplay}`);
  console.log(`Team: ${teamName}`);
  console.log(`Team ID: ${teamId}`);

  console.log("\nCredenziali atleta");
  console.log(`Login ID: ${loginId}`);
  console.log(
    `Password temporanea: ${temporaryPassword}`
  );

  console.log("\nIdentificativi");
  console.log(`Athlete ID: ${athleteId}`);
  console.log(`Auth UUID: ${userId}`);

  console.log(
    "\nConserva la password solo per il tempo necessario a comunicarla all'atleta."
  );
}

main().catch((error) => {
  console.error(
    "\n❌ Creazione atleta fallita:"
  );

  console.error(
    error.message ?? error
  );

  process.exit(1);
});