import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api, uploadImage } from "../api/client";
import { LocationPicker } from "../components/LocationPicker";
import { WORLD_CENTER } from "../lib/mapConfig";

const inputClass =
  "rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

export function AddRestaurant() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [avgPrice, setAvgPrice] = useState("");
  const [position, setPosition] = useState<[number, number]>(WORLD_CENTER);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      let coverImage: string | undefined;
      if (coverFile) {
        coverImage = await uploadImage(coverFile);
      }
      const { data } = await api.post("/restaurants", {
        name,
        description: description || undefined,
        cuisine,
        address,
        city,
        priceRange: avgPrice ? Number(avgPrice) : undefined,
        lat: position[0],
        lng: position[1],
        coverImage,
      });
      toast.success("Restaurant added!");
      navigate(`/restaurants/${data.restaurant.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "Could not add restaurant");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-neutral-900">Add a restaurant or shop</h1>
        <p className="mt-1 text-sm text-neutral-500">Help tourists and locals discover somewhere great.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
            Name
            <input
              required
              placeholder="e.g. Cantina do Porto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
            Cuisine
            <input
              required
              placeholder="e.g. Portuguese"
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
            Street address
            <input
              required
              placeholder="e.g. Rua da Alfândega 12"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
            City
            <input
              required
              placeholder="e.g. Lisbon"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
          Description <span className="font-normal text-neutral-400">(optional)</span>
          <textarea
            placeholder="What makes this place worth visiting?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={inputClass}
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
            Average price per person <span className="font-normal text-neutral-400">(optional)</span>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-neutral-400">$</span>
              <input
                type="number"
                min={1}
                step={1}
                placeholder="20"
                value={avgPrice}
                onChange={(e) => setAvgPrice(e.target.value)}
                className={`${inputClass} w-full pl-7`}
              />
            </div>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
            Cover photo <span className="font-normal text-neutral-400">(optional)</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
              className="mt-0.5 text-sm text-neutral-500 file:mr-3 file:rounded-full file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-neutral-700 hover:file:bg-neutral-200"
            />
          </label>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-neutral-700">
            Location{" "}
            <span className="font-normal text-neutral-400">
              — click the map ({position[0].toFixed(4)}, {position[1].toFixed(4)})
            </span>
          </p>
          <div className="h-72 overflow-hidden rounded-xl border border-neutral-200">
            <LocationPicker position={position} onChange={setPosition} />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 rounded-full bg-brand-500 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:opacity-50"
        >
          {submitting ? "Adding…" : "Add restaurant"}
        </button>
      </form>
    </div>
  );
}
