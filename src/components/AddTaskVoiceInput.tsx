import { useEffect, useRef, useState } from "react";

interface Props {
  onFill: (data: {
    title?: string;
    description?: string;
    category?: 'Perso' | 'Travail' | 'Études';
    priority?: 'Haute' | 'Moyenne' | 'Basse';
    dueDate?: string;
    finalAction?: 'Ajouter' | 'Annuler';
  }) => void;
  onSubmit?: () => void;
  onCancel?: () => void;
}

export default function AddTaskVoiceInput({ onFill, onSubmit, onCancel }: Props) {
  const recognitionRef = useRef<any>(null);
  const [listening, setListening] = useState(false);
  const steps: Array<'title'|'description'|'category'|'priority'|'dueDate'|'final'> =
    ['title','description','category','priority','dueDate','final'];
  const [stepIndex, setStepIndex] = useState(0);

  const step = steps[stepIndex];

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("المتصفح لا يدعم الميكروفون");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event: any) => {
      const rawText = event.results[0][0].transcript.trim();
      const text = rawText.toLowerCase();
      let valid = false;

      switch (step) {
        case 'title':
          onFill({ title: rawText });
          valid = true;
          break;

        case 'description':
          onFill({ description: rawText });
          valid = true;
          break;

        case 'category': {
          const mapCat: Record<string, 'Perso' | 'Travail' | 'Études'> = {
            'perso': 'Perso',
            'travail': 'Travail',
            'études': 'Études',
            'etudes': 'Études',
          };
          if (mapCat[text]) {
            onFill({ category: mapCat[text] });
            valid = true;
          }
          break;
        }

        case 'priority': {
          const mapPrio: Record<string, 'Haute' | 'Moyenne' | 'Basse'> = {
            'haute': 'Haute',
            'moyenne': 'Moyenne',
            'basse': 'Basse',
          };
          if (mapPrio[text]) {
            onFill({ priority: mapPrio[text] });
            valid = true;
          }
          break;
        }

        case 'dueDate': {
          const parsedDate = new Date(rawText);
          if (!isNaN(parsedDate.getTime())) {
            const isoDate = parsedDate.toISOString().split('T')[0];
            onFill({ dueDate: isoDate });
            valid = true;
          }
          break;
        }

        case 'final': {
          const mapFinal: Record<string, 'Ajouter' | 'Annuler'> = {
            'ajouter': 'Ajouter',
            'annuler': 'Annuler',
          };
          if (mapFinal[text]) {
            onFill({ finalAction: mapFinal[text] });
            if (mapFinal[text] === 'Ajouter') onSubmit?.();
            else onCancel?.();
            valid = true;
          }
          break;
        }
      }

      if (valid) setStepIndex(prev => (prev + 1) % steps.length);
    };

    recognitionRef.current = recognition;
  }, [step, onFill, onSubmit, onCancel]);

  const startListening = () => recognitionRef.current?.start();
  const nextStep = () => setStepIndex(prev => (prev + 1) % steps.length);

  return (
    <div className="p-3 border rounded-xl mt-3 mb-4 bg-slate-50">
      <p className="text-sm mb-2">
        🎤 Champ actuel: <strong>{step}</strong>
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={startListening}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          {listening ? "J'écoute..." : "Remplir par la voix"}
        </button>
        {step !== 'final' && (
          <button
            type="button"
            onClick={nextStep}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Suivant ➜
          </button>
        )}
      </div>
      {step === 'final' && <p className="mt-2 text-sm">🎯 Dites "Ajouter" أو "Annuler"</p>}
    </div>
  );
}