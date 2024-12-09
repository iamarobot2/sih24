import "@/styles/global.css";
import"@/utils/chartSetup"

export default function App({ Component, pageProps }) {
  return (
    <div className="antialiased touch-manipulation">
      <Component {...pageProps} />
    </div>
  );
}
