import Head from "next/head";
import Timetable from "../components/Timetable";
import { Kanit } from "next/font/google";

const kanit = Kanit({ subsets: ["latin"], weight: ["400"] });

export default function Home() {
  return (
    <>
      <Head>
        <title>Weekly Class Timetable</title>
        <meta name="description" content="University weekly class schedule" />
      </Head>
      <main
        className={`container mx-auto p-4 bg-neutral-800 ${kanit.className}`}
      >
        <h1 className="text-2xl mb-4">Weekly Class Timetable</h1>
        <Timetable />
      </main>
    </>
  );
}
