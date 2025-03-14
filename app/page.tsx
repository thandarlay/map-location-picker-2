import MapLocationPicker from "@/components/map-location-picker"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b bg-background p-4">
        <div className="container flex items-center justify-between">
          <h1 className="text-2xl font-bold">Location Picker</h1>
        </div>
      </header>
      <div className="flex-1 container py-6">
        <MapLocationPicker />
      </div>
    </main>
  )
}

