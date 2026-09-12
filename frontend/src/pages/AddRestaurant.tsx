import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api, uploadImage } from "../api/client";
import { LocationPicker } from "../components/LocationPicker";
import { WORLD_CENTER } from "../lib/mapConfig";

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
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Add a restaurant or shop</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            required
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <input
            required
            placeholder="Cuisine (e.g. Portuguese)"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <input
            required
            placeholder="Street address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <input
            required
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        <div>
          <label className="mb-1 block text-sm text-neutral-600">Average price per person (optional)</label>
          <div className="relative w-40">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">$</span>
            <input
              type="number"
              min={1}
              step={1}
              placeholder="20"
              value={avgPrice}
              onChange={(e) => setAvgPrice(e.target.value)}
              className="w-full rounded-md border border-neutral-300 py-2 pl-6 pr-3 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-neutral-600">Cover photo (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} className="text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-neutral-600">
            Click the map to set the location ({position[0].toFixed(4)}, {position[1].toFixed(4)})
          </label>
          <div className="h-72 overflow-hidden rounded-xl border border-neutral-200">
            <LocationPicker position={position} onChange={setPosition} />
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-md bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {submitting ? "Adding…" : "Add restaurant"}
        </button>
      </form>
    </div>
  );
}
