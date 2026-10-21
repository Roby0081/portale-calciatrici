self.addEventListener("push", (event) => {

  const defaultData = {
    title: "Performa F",
    body: "Hai un questionario da completare.",
    url: "/",
  };

  let data = defaultData;

  if (event.data) {
    try {
      data = {
        ...defaultData,
        ...event.data.json(),
      };
    } catch {
      data = {
        ...defaultData,
        body: event.data.text(),
      };
    }
  }

  const options = {
    body: data.body,

    icon: "/icons/icon-192.png",

    badge: "/icons/icon-192.png",

    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title,
      options
    )
  );
});


self.addEventListener(
  "notificationclick",
  (event) => {

    event.notification.close();

    const targetUrl =
      event.notification.data?.url || "/";

    event.waitUntil(

      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then((clientList) => {

          for (const client of clientList) {

            if (
              client.url.includes(targetUrl) &&
              "focus" in client
            ) {
              return client.focus();
            }
          }

          if (clients.openWindow) {
            return clients.openWindow(
              targetUrl
            );
          }

        })

    );
  }
);