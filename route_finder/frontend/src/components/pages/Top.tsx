import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@/components/ui/icons/SearchIcon";
import SearchInput from "@/components/ui/SearchInput";
import axios from "axios";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { LocationPicker } from "../ui/LocationPicker";
import { Location } from "@/lib/SearchResponse";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { BOUNDING_BOX } from "@/lib/Constants";

function Top() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [startLocation, setStartLocation] = useState<Location | undefined>();
  const [endLocation, setEndLocation] = useState<Location | undefined>();

  const readyForSearch =
    query.length > 0 && startLocation != null && endLocation != null;
  const handleSearch = () => {
    const baseUrl =
      import.meta.env.MODE === "development" ? "http://127.0.0.1:5000" : "";
    setLoading(true);
    axios
      .get(`${baseUrl}/search`, {
        params: {
          q: query,
          s: `${startLocation?.latitude},${startLocation?.longitude}`,
          e: `${endLocation?.latitude},${endLocation?.longitude}`,
          delay: 5,
        },
      })
      .then((response) => {
        console.log(response.data);
        navigate("/result", { state: response.data });
      })
      .catch((error) => {
        console.log("axios error");
        console.error(error);
        toast({ title: "Failed to search", description: error.message });
      })
      .finally(() => {
        setLoading(false);
      });
  };
  return (
    <div>
      <LoadingSpinner loading={loading} />
      <div className="flex justify-center">
        <h1>Welcome to sanpo.ai</h1>
      </div>
      <div className="flex justify-center pt-2">
        <p>Plan your walking route and explore your surroundings.</p>
      </div>

      {/* Input area */}
      <div className="flex justify-center pt-8">
        <SearchInput
          placeholder="Explain your walking preference"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="flex justify-center">
        <div className="flex flex-col justify-center pt-4">
          <div className="flex-none w-lg">
            <LocationPicker
              startLocation={startLocation}
              endLocation={endLocation}
              onStartLocationChange={setStartLocation}
              onEndLocationChange={setEndLocation}
              southWestBound={BOUNDING_BOX.southWest}
              northEastBound={BOUNDING_BOX.northEast}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-center pt-4">
        {readyForSearch ? (
          <Button
            className="bg-blue-500 text-white rounded-lg px-4 py-2 ml-2"
            onClick={handleSearch}
          >
            Search
          </Button>
        ) : (
          <Button
            className="bg-blue-300 text-white rounded-lg px-4 py-2 ml-2"
            disabled
          >
            Search
          </Button>
        )}
      </div>
      {/* Example queries */}

      <div className="flex justify-center pt-16">
        <div className="text-3xl">Example queries:</div>
      </div>
      <div className="flex justify-center pt-8">
        <Carousel opts={{ align: "start" }} className="w-full max-w-lg">
          <CarouselContent>
            <CarouselItem className="lg:basis-1/2">
              <ExampleQueryItem query="Mostly shaded route to the nearest park" />
            </CarouselItem>
            <CarouselItem className="lg:basis-1/2">
              <ExampleQueryItem query="Mostly shaded route to the nearest park" />
            </CarouselItem>
            <CarouselItem className="lg:basis-1/2">
              <ExampleQueryItem query="Mostly shaded route to the nearest park" />
            </CarouselItem>
            <CarouselItem className="lg:basis-1/2">
              <ExampleQueryItem query="Mostly shaded route to the nearest park" />
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      {/* Example results */}
    </div>
  );
}

type QueryItemProps = {
  query: string;
};

function ExampleQueryItem({ query }: QueryItemProps) {
  return (
    <div className="flex items-center border p-2 rounded w-60 ">
      <SearchIcon className="h-4 w-4" />
      <div className="text-base pl-2 text-slate-600">{query}</div>
    </div>
  );
}

export default Top;
