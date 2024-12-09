import "@/styles/global.css";

export default function App({ Component, pageProps }) {
  return (
    <div className="antialiased touch-manipulation">
      <Component {...pageProps} />
    </div>
  );
}
