import QRCodeScanner from "@/components/QRCodeScanner";
import Head from "next/head";
import SearchParticipant from "./../components/SearchParticipant";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Head>
        <title>QR Code Scanner</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="flex flex-col bg-black min-h-dvh">
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
      </div>
    </>
  );
}
