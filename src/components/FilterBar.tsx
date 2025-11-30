import { useEffect, useRef, useState } from "react";
import { FilterType } from "../App";

interface FilterBarProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const filters: { label: string; value: FilterType }[] = [
  { label: 'Toutes', value: 'all' },
  { label: 'En cours', value: 'active' },
  { label: 'Terminées', value: 'completed' },
  { label: "Aujourd'hui", value: 'today' },
];

// Mots vocaux et correspondance avec les filtres
const voiceMap: Record<string, FilterType> = {
  "toutes": "all",
  "tout": "all",
  "en cours": "active",
  "terminées": "completed",
  "terminée": "completed",
  "aujourd'hui": "today",
  "aujourdhui": "today",
};

// Fonction simple pour calculer la similarité entre deux textes
function similarity(s1: string, s2: string) {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) return 1.0;
  let same = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (shorter[i] === longer[i]) same++;
  }
  return same / longer.length;
}

export function FilterBar({ currentFilter, onFilterChange }: FilterBarProps) {
  const recognitionRef = useRef<any>(null);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("SpeechRecognition non supporté par ce navigateur");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.continuous = true; // Écoute continue
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('')
        .trim()
        .toLowerCase();

      console.log("Reconnu:", transcript);

      // Recherche du mot le plus proche
      let bestMatch: { key: string; score: number } = { key: '', score: 0 };
      Object.keys(voiceMap).forEach(key => {
        const score = similarity(transcript, key);
        if (score > bestMatch.score) {
          bestMatch = { key, score };
        }
      });

      // Si la similarité est supérieure à 0.5 (modifiable), appliquer le filtre
      if (bestMatch.score > 0.5) {
        onFilterChange(voiceMap[bestMatch.key]);
      }
    };

    recognitionRef.current = recognition;
  }, [onFilterChange]);

  const startListening = () => {
    try {
      recognitionRef.current?.start();
    } catch (err) {
      console.error("Impossible de démarrer l'écoute:", err);
    }
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
      setListening(false);
    } catch (err) {
      console.error("Impossible d'arrêter l'écoute:", err);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {filters.map(filter => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-4 py-2 rounded-full text-sm transition-all ${
            currentFilter === filter.value
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {filter.label}
        </button>
      ))}

      {/* Bouton pour démarrer l'écoute */}
      <button
        type="button"
        onClick={startListening}
        className="px-4 py-2 rounded text-sm bg-green-600 text-white hover:bg-green-700"
      >
         Démarrer
      </button>

      {/* Bouton pour arrêter l'écoute */}
      <button
        type="button"
        onClick={stopListening}
        className="px-4 py-2 rounded text-sm bg-red-600 text-white hover:bg-red-700"
      >
         Arrêter
      </button>

      {listening && <span className="ml-2 text-green-700 font-medium">J'écoute...</span>}
    </div>
  );
}