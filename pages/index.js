import React, { useEffect, useState } from "react";
import QRCodeScanner from "@/components/QRCodeScanner";
import Head from "next/head";
import SearchParticipant from "./../components/SearchParticipant";
import Image from "next/image";
import Demographics from "@/components/Demographics";

export default function Home() {
  const [activeView, setActiveView] = useState("scan");
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log(
            "Service Worker registered with scope:",
            registration.scope
          );
        })
        .catch((error) => {
          console.log("Service Worker registration failed:", error);
        });
    }
  }, []);

  useEffect(() => {
    let deferredPrompt;
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      deferredPrompt = e;
      const installButton = document.getElementById("install-button");
      if (installButton) {
        installButton.style.display = "block";
        installButton.addEventListener("click", () => {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === "accepted") {
              console.log("User accepted the install prompt");
            } else {
              console.log("User dismissed the install prompt");
            }
            deferredPrompt = null;
          });
        });
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  return (
    <>
      <Head>
        <title>QR Code Scanner</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <div className="flex flex-col bg-black min-h-dvh mb-12">
        {activeView === "scan" && (
          <>
            <div className="flex flex-col justify-center items-center bg-black">
              <div className="flex items-center justify-center p-2">
                <Image
                  src="/images/ajce.png"
                  alt="ajcelogo"
                  width={60}
                  height={60}
                />
              </div>
              <h2 className="text-xl font-bold text-slate-300 text-left">
                Scan food Coupon
              </h2>
            </div>
            <SearchParticipant />
            <QRCodeScanner />
          </>
        )}
        {activeView === "details" && <Demographics />}
      </div>
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white flex justify-around p-4">
        <button
          className={`flex-1 text-center ${
            activeView === "scan" ? "font-bold" : ""
          }`}
          onClick={() => setActiveView("scan")}
        >
          Scan
        </button>
        <button
          className={`flex-1 text-center ${
            activeView === "details" ? "font-bold" : ""
          }`}
          onClick={() => setActiveView("details")}
        >
          Details
        </button>
      </nav>
      <button
        id="install-button"
        style={{ display: "none" }}
        className="fixed bottom-16 right-4 bg-blue-500 text-white p-2 rounded"
      >
        Install App
      </button>
    </>
  );
}
