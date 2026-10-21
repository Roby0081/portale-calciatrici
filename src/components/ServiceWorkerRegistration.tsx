"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {

useEffect(() => {

  console.log(
    "ServiceWorkerRegistration component caricato"
  );

  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator)
  ) {
    console.log(
      "Service Worker non supportato"
    );

    return;
  }

  async function registerServiceWorker() {

    try {

      console.log(
        "Avvio registrazione Service Worker..."
      );

      const registration =
        await navigator.serviceWorker.register(
          "/sw.js"
        );

      console.log(
        "Service Worker registrato:",
        registration.scope
      );

    } catch (error) {

      console.error(
        "Errore registrazione Service Worker:",
        error
      );

    }
  }

  registerServiceWorker();

}, []);

  return null;
}