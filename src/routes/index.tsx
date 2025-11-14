import { imFeelingLucky, searchVideo } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createFileRoute,
  Link,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import z from "zod";
import { useEffect, useRef, useState } from "react";

const searchSchema = z.object({
  searchText: z.string().catch(""),
  feelingLucky: z.boolean().catch(false),
});

export const Route = createFileRoute("/")({
  component: App,
  validateSearch: searchSchema,
  loaderDeps: ({ search: { searchText, feelingLucky } }) => ({
    searchText,
    feelingLucky,
  }),
  loader: async ({ deps: { searchText, feelingLucky } }) => {
    if (feelingLucky) {
      return await imFeelingLucky();
    }
    if (searchText.length > 0) {
      return await searchVideo({ data: { searchText: searchText } });
    }
  },
});

function App() {
  return (
    <main className="flex text-center px-4 py-12 items-center gap-8 flex-col min-h-screen">
      <h1 className="text-5xl font-bold">Kurtlar Vadisi Database 🐺</h1>

      <div className="flex items-center justify-center gap-8 flex-col max-w-2/3">
        <SearchInput />

        <Link to="/" search={{ searchText: "", feelingLucky: true }}>
          <Button>Kendimi Şanslı Hissediyorum</Button>
        </Link>

        <Videos />
      </div>
    </main>
  );
}

function Videos() {
  const videos = Route.useLoaderData();

  return (
    <div className="flex flex-wrap gap-16 items-center justify-center">
      {videos?.map((video) => (
        <div key={video.id} className="flex flex-col gap-1">
          <div className="sm:w-96 w-64 h-64 bg-gray-200 rounded-md">
            <iframe
              className="w-full h-full rounded-md"
              src={`https://www.youtube.com/embed/${video.videoId}?start=${parseInt(video.start)}`}
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className="flex w-full items-center justify-between flex-wrap gap-4 text-start">
            <div className="font-semibold">{video.text}</div>
            <a
              target="_blank"
              href={`https://www.youtube.com/watch?v=${video.videoId}&start=${parseInt(video.start)}`}
            >
              Video Linki
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchInput() {
  const { searchText } = useSearch({ from: Route.fullPath });

  const [input, setInput] = useState(searchText);
  const navigate = useNavigate();

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      navigate({
        to: "/",
        search: { searchText: input, feelingLucky: false },
      });
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [input]);

  return (
    <Input
      value={input}
      onChange={(e) => setInput(e.currentTarget.value)}
      placeholder="Replik arat..."
      className="w-72"
    />
  );
}
