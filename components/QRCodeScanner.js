import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function QRCodeScanner() {
  const [scanResult, setScanResult] = useState("");
  const [recentScans, setRecentScans] = useState([]);
  const [error, setError] = useState("");
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [detectionBox, setDetectionBox] = useState(null);
  const [mealType, setMealType] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const barcodeDetectorRef = useRef(null);
  const streamRef = useRef(null);
  const lastScanTimeRef = useRef(0);

  const handleValueChange = (value) => {
    setMealType(value);
    setError("");
    console.log(value);
  };

  const toggleCamera = async () => {
    if (!mealType) {
      setError("Please select a meal");
      return;
    }
    if (isCameraOn) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }
      setIsCameraOn(false);
      setScanResult("");
      setDetectionBox(null);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            zoom: { ideal: 1.0 },
          },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "");
          videoRef.current.play();
        }
        setIsCameraOn(true);
      } catch (err) {
        setError(`Camera access error: ${err.message}`);
      }
    }
  };

  const handleClaimMeal = async (participant) => {
    try {
      const response = await fetch('http://localhost:3000/api/meals/claimMeal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participant, mealType }),
      });
      const data = await response.json();
      if (response.ok) {
        setError("");
        toast.success(`${mealType} claimed successfully for ${participant.name}`);
      } else {
        setError(data.message || "Error claiming meal");
        toast.error(data.message || "Error claiming meal");
      }
    } catch (err) {
      setError("Error claiming meal");
      toast.error("Error claiming meal");
    }
  };

  useEffect(() => {
    let animationFrameId;
    const scanQRCode = () => {
      if (!videoRef.current || !canvasRef.current || !isCameraOn) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        try {
          if (!barcodeDetectorRef.current) {
            barcodeDetectorRef.current = new window.BarcodeDetector({
              formats: ["qr_code"],
            });
          }
          barcodeDetectorRef.current.detect(canvas).then(async (barcodes) => {
            if (barcodes.length > 0) {
              const barcode = barcodes[0];
              const newScan = barcode.rawValue;
              const currentTime = Date.now();
              if (currentTime - lastScanTimeRef.current > 2000) { // Debounce for 2 seconds
                lastScanTimeRef.current = currentTime;
                setDetectionBox(barcode.boundingBox);
                const response = await fetch(`http://localhost:3000/api/participants?id=${newScan}`);
                const data = await response.json();
                if (response.ok) {
                  if (data.mealClaimed) {
                    setError(`Meal already claimed for ${data.name}`);
                    toast.info(`Meal already claimed for ${data.name}`);
                  } else {
                    setScanResult(newScan);
                    setRecentScans((prev) => {
                      const newScans = [newScan, ...prev];
                      return [...new Set(newScans)];
                    });
                    setError("");
                    handleClaimMeal(data); // Claim the meal for the participant
                  }
                } else {
                  setError("No participant found");
                  toast.error("No participant found");
                  setScanResult(""); // Clear scan result if no participant found
                }
              }
            } else {
              setDetectionBox(null);
            }
          });
        } catch (err) {
          setError("QR scanning not supported");
          toast.error("QR scanning not supported");
        }
      }
      animationFrameId = requestAnimationFrame(scanQRCode);
    };
    if (isCameraOn) {
      scanQRCode();
    }
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isCameraOn]);

  return (
    <div className="w-full flex flex-col items-center p-4 bg-black">
      <ToastContainer />
      <div className="w-full max-w-md shadow-md rounded-lg overflow-hidden">
        <div className="p-4">
          <div
            className="relative w-full h-[250px] aspect-video rounded-3xl backdrop-blur-xl"
            style={{
              backgroundImage: 'url("/images/sih.png")',
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <video
              ref={videoRef}
              className="absolute top-0 left-0 w-full h-full object-cover rounded-3xl"
              playsInline
            />
            {detectionBox && (
              <div
                className="absolute border-red-500 border-[3px]"
                style={{
                  left: `${
                    (detectionBox.x / videoRef.current.videoWidth) * 100
                  }%`,
                  top: `${
                    (detectionBox.y / videoRef.current.videoHeight) * 100
                  }%`,
                  width: `${
                    (Math.min(detectionBox.width, detectionBox.height) /
                      videoRef.current.videoWidth) *
                    100
                  }%`,
                  height: `${
                    (Math.min(detectionBox.width, detectionBox.height) /
                      videoRef.current.videoHeight) *
                    100
                  }%`,
                  transform: "translate(-50%, -50%) translate(50%, 50%)",
                }}
              />
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <div className="mt-4 flex flex-row gap-6 items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="rounded-xl">
                  {mealType ? mealType : "Meal Type"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className=" bg-black text-white">
                <DropdownMenuRadioGroup
                  value={mealType}
                  onValueChange={handleValueChange}
                >
                  <DropdownMenuRadioItem value="Breakfast">
                    Breakfast
                  </DropdownMenuRadioItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioItem value="Lunch">
                    Lunch
                  </DropdownMenuRadioItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioItem value="Dinner">
                    Dinner
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={toggleCamera}
              className={`p-4 rounded-xl`}
              variant={isCameraOn ? "destructive" : "secondary"}
            >
              {isCameraOn ? "Stop Camera" : "Start Camera"}
            </Button>
          </div>
          {error && (
            <div className="text-red-500 text-center mt-4">{error}</div>
          )}
          {scanResult && (
            <div className="mt-4 p-3 bg-black rounded">
              <p className="font-semibold text-white">Latest Scan:</p>
              <div className="break-words text-white">
                <p className="mb-2">{scanResult}</p>
                <a
                  href={scanResult}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Open Link
                </a>
              </div>
            </div>
          )}
          {recentScans.length > 0 && (
            <div className="mt-4 p-3 bg-gray-100 rounded-2xl text-black">
              <p className="font-semibold mb-2">Recent Scans:</p>
              <div className="space-y-2">
                {recentScans.map((scan, index) => (
                  <div key={index} className="p-2 bg-white rounded shadow">
                    <p className="break-words text-sm">{scan}</p>
                    <a
                      href={scan}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Open Link
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}