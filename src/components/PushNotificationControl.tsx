"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";


function urlBase64ToArrayBuffer(
  base64String: string
): ArrayBuffer {

  const padding =
    "=".repeat(
      (4 - (base64String.length % 4)) % 4
    );

  const base64 =
    (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const rawData =
    window.atob(base64);

  const outputArray =
    new Uint8Array(rawData.length);

  for (
    let i = 0;
    i < rawData.length;
    i++
  ) {
    outputArray[i] =
      rawData.charCodeAt(i);
  }

  return outputArray.buffer;
}


export default function PushNotificationControl() {

  const [
    supported,
    setSupported,
  ] = useState(true);

  const [
    enabled,
    setEnabled,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");


  useEffect(() => {

    async function checkPushStatus() {

      const isSupported =
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;

      setSupported(isSupported);

      if (!isSupported) {
        return;
      }

      try {

        const registration =
          await navigator.serviceWorker.ready;

        const subscription =
          await registration
            .pushManager
            .getSubscription();

        setEnabled(
          subscription !== null &&
          Notification.permission ===
            "granted"
        );

      } catch (error) {

        console.error(
          "Errore controllo notifiche:",
          error
        );

      }
    }

    checkPushStatus();

  }, []);


  async function enableNotifications() {

    if (loading) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {

      const vapidPublicKey =
        process.env
          .NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        throw new Error(
          "Chiave VAPID pubblica non configurata."
        );
      }


      const permission =
        await Notification
          .requestPermission();

      if (permission !== "granted") {

        setMessage(
          "Le notifiche non sono state autorizzate."
        );

        return;
      }


      const registration =
        await navigator
          .serviceWorker
          .ready;


      let subscription =
        await registration
          .pushManager
          .getSubscription();


      if (!subscription) {

        subscription =
          await registration
            .pushManager
            .subscribe({
              userVisibleOnly: true,

              applicationServerKey:
                urlBase64ToArrayBuffer(
                  vapidPublicKey
                ),
            });
      }


      const subscriptionJson =
        subscription.toJSON();


      const p256dh =
        subscriptionJson
          .keys?.p256dh;

      const authKey =
        subscriptionJson
          .keys?.auth;


      if (!p256dh || !authKey) {

        throw new Error(
          "Chiavi della subscription non disponibili."
        );
      }


      const {
        error,
      } = await supabase
        .from("push_subscriptions")
        .upsert(
          {
            endpoint:
              subscription.endpoint,

            p256dh,

            auth_key:
              authKey,

            expiration_time:
              subscription
                .expirationTime,

            enabled: true,

            user_agent:
              navigator.userAgent,

            last_seen_at:
              new Date()
                .toISOString(),

            updated_at:
              new Date()
                .toISOString(),
          },
          {
            onConflict: "endpoint",
          }
        );


      if (error) {
        throw error;
      }


      setEnabled(true);

      setMessage(
        "Notifiche attivate correttamente."
      );

    } catch (error) {

      console.error(
        "Errore attivazione notifiche:",
        error
      );

      setMessage(
        "Non è stato possibile attivare le notifiche."
      );

    } finally {

      setLoading(false);
    }
  }

  
  if (!supported) {

    return (
      <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
        Le notifiche push non sono disponibili
        su questo dispositivo o browser.
      </div>
    );
  }


  return (

    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

      <div className="flex items-start gap-3">

        <div className="text-2xl">
          🔔
        </div>

        <div className="flex-1">

          <div className="font-semibold text-gray-900">
            Notifiche
          </div>

          <p className="mt-1 text-sm text-gray-600">
            Ricevi un promemoria quando hai
            un questionario da completare.
          </p>


        {enabled ? (

        <div className="mt-3">

            <div className="text-sm font-medium text-green-700">
            Notifiche attive
            </div>

        ) : (

            <button
              type="button"
              onClick={
                enableNotifications
              }
              disabled={loading}
              className="mt-3 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:bg-gray-300"
            >
              {loading
                ? "Attivazione..."
                : "Attiva notifiche"}
            </button>

          )}


          {message && (

            <div className="mt-3 text-sm text-gray-600">
              {message}
            </div>

          )}

        </div>

      </div>

    </div>

  );
}