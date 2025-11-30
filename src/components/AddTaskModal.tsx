import { X, Calendar, Tag, Flag, FileText } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface AddTaskModalProps {
  onClose: () => void;
  onAdd: (
    title: string,
    category: 'Perso' | 'Travail' | 'Études',
    priority: 'Haute' | 'Moyenne' | 'Basse',
    description?: string,
    dueDate?: Date
  ) => void;
}

function similarity(s1: string, s2: string) {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  if (!longer.length) return 1;
  let same = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (shorter[i] === longer[i]) same++;
  }
  return same / longer.length;
}

export function AddTaskModal({ onClose, onAdd }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [tempTitle, setTempTitle] = useState('');

  const [description, setDescription] = useState('');
  const [tempDescription, setTempDescription] = useState('');

  const [category, setCategory] = useState<'Perso' | 'Travail' | 'Études'>('Perso');
  const [tempCategory, setTempCategory] = useState<'Perso' | 'Travail' | 'Études' | ''>('');

  const [priority, setPriority] = useState<'Haute' | 'Moyenne' | 'Basse'>('Moyenne');
  const [tempPriority, setTempPriority] = useState<'Haute' | 'Moyenne' | 'Basse' | ''>('');

  const [dueDate, setDueDate] = useState('');
  const [tempDueDate, setTempDueDate] = useState('');

  const [listening, setListening] = useState(false);
  const steps: Array<'title'|'description'|'category'|'priority'|'dueDate'|'final'> =
    ['title','description','category','priority','dueDate','final'];
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];
  const recognitionRef = useRef<any>(null);

  // الإعدادات العامة للتعرف على الصوت
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.continuous = false; // كل مرة تسجيل جملة واحدة
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event: any) => {
      const rawText = event.results[0][0].transcript.trim();
      const text = rawText.toLowerCase();

      switch (step) {
        case 'title':
          setTempTitle(rawText);
          break;

        case 'description':
          setTempDescription(rawText);
          break;

        case 'category': {
          const mapCat: Record<string,'Perso'|'Travail'|'Études'> = {
            'perso':'Perso','personal':'Perso','travail':'Travail','travaux':'Travail',
            'études':'Études','etudes':'Études','study':'Études'
          };
          let best = { key:'', score:0 };
          Object.keys(mapCat).forEach(key => {
            const score = similarity(text,key);
            if(score>best.score) best={key,score};
          });
          if(best.score>0.5) setTempCategory(mapCat[best.key]);
          break;
        }

        case 'priority': {
          const mapPrio: Record<string,'Haute'|'Moyenne'|'Basse'> = {
            'haute':'Haute','high':'Haute',
            'moyenne':'Moyenne','medium':'Moyenne',
            'basse':'Basse','low':'Basse'
          };
          let best = { key:'', score:0 };
          Object.keys(mapPrio).forEach(key=>{
            const score = similarity(text,key);
            if(score>best.score) best={key,score};
          });
          if(best.score>0.5) setTempPriority(mapPrio[best.key]);
          break;
        }

        case 'dueDate': {
          const parsedDate = new Date(rawText);
          if(!isNaN(parsedDate.getTime())) setTempDueDate(parsedDate.toISOString().split('T')[0]);
          break;
        }

        case 'final': {
  const mapFinal: Record<string,'Ajouter'|'Annuler'> = {'ajouter':'Ajouter','annuler':'Annuler'};
  let best = { key:'', score:0 };
  Object.keys(mapFinal).forEach(key=>{
    const score = similarity(text,key);
    if(score>best.score) best={key,score};
  });
  if(best.score>0.5){
    if(mapFinal[best.key]==='Ajouter'){
      if(tempTitle.trim()) setTitle(tempTitle);
      if(tempDescription) setDescription(tempDescription);
      if(tempCategory) setCategory(tempCategory);
      if(tempPriority) setPriority(tempPriority);
      if(tempDueDate) setDueDate(tempDueDate);
      onAdd(
        tempTitle,
        tempCategory || category,
        tempPriority || priority,
        tempDescription || undefined,
        tempDueDate ? new Date(tempDueDate) : undefined
      );
    }
    onClose();
  }
  break;
}

   }
    };

    recognitionRef.current = recognition;
  }, [step]);

  const startListening = () => {
    try{recognitionRef.current?.start()}catch(err){console.error(err);}
  }
  const stopListening = () => {
    try{recognitionRef.current?.stop(); setListening(false)}catch(err){console.error(err);}
  }

  const nextStep = () => setStepIndex(prev => (prev+1)%steps.length);

  const handleConfirm = () => {
    // نقل القيمة المؤقتة للقيمة النهائية
    switch(step){
      case 'title': setTitle(tempTitle); break;
      case 'description': setDescription(tempDescription); break;
      case 'category': if(tempCategory) setCategory(tempCategory); break;
      case 'priority': if(tempPriority) setPriority(tempPriority); break;
      case 'dueDate': if(tempDueDate) setDueDate(tempDueDate); break;
    }
    nextStep();
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!title.trim()) return;
    onAdd(title, category, priority, description||undefined, dueDate? new Date(dueDate):undefined);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600">
          <h3 className="text-white">Nouvelle tâche</h3>
          <button onClick={onClose} type="button" className="p-1 hover:bg-white/20 rounded-lg">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-3 border rounded-xl mt-3 mb-4 bg-slate-50">
          <p className="text-sm mb-2">🎤 Champ actuel: <strong>{step}</strong></p>
          <div className="flex gap-2">
            <button type="button" onClick={startListening} className="px-4 py-2 bg-green-600 text-white rounded">
              🎙 Démarrer
            </button>
            <button type="button" onClick={stopListening} className="px-4 py-2 bg-red-600 text-white rounded">
              ⏹ Arrêter
            </button>
          </div>

          {/* عرض النتيجة المؤقتة مع أزرار التأكيد أو إعادة التسجيل */}
          {step === 'title' && tempTitle && (
            <div className="mt-2 flex gap-2 items-center">
              <p className="flex-1">🎤 Vous avez dit: <strong>{tempTitle}</strong></p>
              <button type="button" onClick={handleConfirm} className="px-3 py-1 bg-green-600 text-white rounded">Confirmer</button>
              <button type="button" onClick={() => { setTempTitle(''); startListening(); }} className="px-3 py-1 bg-red-600 text-white rounded">Réessayer</button>
            </div>
          )}

          {step === 'description' && tempDescription && (
            <div className="mt-2 flex gap-2 items-center">
              <p className="flex-1">🎤 Vous avez dit: <strong>{tempDescription}</strong></p>
              <button type="button" onClick={handleConfirm} className="px-3 py-1 bg-green-600 text-white rounded">Confirmer</button>
              <button type="button" onClick={() => { setTempDescription(''); startListening(); }} className="px-3 py-1 bg-red-600 text-white rounded">Réessayer</button>
            </div>
          )}

          {step === 'category' && tempCategory && (
            <div className="mt-2 flex gap-2 items-center">
              <p className="flex-1">🎤 Catégorie détectée: <strong>{tempCategory}</strong></p>
              <button type="button" onClick={handleConfirm} className="px-3 py-1 bg-green-600 text-white rounded">Confirmer</button>
              <button type="button" onClick={() => { setTempCategory(''); startListening(); }} className="px-3 py-1 bg-red-600 text-white rounded">Réessayer</button>
            </div>
          )}

          {step === 'priority' && tempPriority && (
            <div className="mt-2 flex gap-2 items-center">
              <p className="flex-1">🎤 Priorité détectée: <strong>{tempPriority}</strong></p>
              <button type="button" onClick={handleConfirm} className="px-3 py-1 bg-green-600 text-white rounded">Confirmer</button>
              <button type="button" onClick={() => { setTempPriority(''); startListening(); }} className="px-3 py-1 bg-red-600 text-white rounded">Réessayer</button>
            </div>
          )}

          {step === 'dueDate' && tempDueDate && (
            <div className="mt-2 flex gap-2 items-center">
              <p className="flex-1">🎤 Date détectée: <strong>{tempDueDate}</strong></p>
              <button type="button" onClick={handleConfirm} className="px-3 py-1 bg-green-600 text-white rounded">Confirmer</button>
              <button type="button" onClick={() => { setTempDueDate(''); startListening(); }} className="px-3 py-1 bg-red-600 text-white rounded">Réessayer</button>
            </div>
          )}

        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div>
            <label className="block text-sm text-slate-700 mb-2">Titre *</label>
            <input type="text" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex: Réviser..." className="w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 text-sm" autoFocus required/>
          </div>

          {/* الباقي يبقى كما هو مع الحقول النصية والأزرار */}
          {/* Description, Category, Priority, Date, Submit Buttons */}
          <div>
            <label className="flex items-center gap-2 text-sm text-slate-700 mb-2">
              <FileText className="w-4 h-4"/> Description (optionnelle)
            </label>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Ajoutez des détails..." rows={3} className="w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 text-sm resize-none"/>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-slate-700 mb-2">
              <Tag className="w-4 h-4"/> Catégorie
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Perso','Travail','Études'] as const).map(cat=>(
                <button key={cat} type="button" onClick={()=>setCategory(cat)}
                  className={`px-3 py-2 rounded-xl text-xs transition-all ${category===cat?'bg-indigo-600 text-white shadow-md':'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{cat}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-slate-700 mb-2">
              <Flag className="w-4 h-4"/> Priorité
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Haute','Moyenne','Basse'] as const).map(prio=>(
                <button key={prio} type="button" onClick={()=>setPriority(prio)}
                  className={`px-3 py-2 rounded-xl text-xs transition-all ${priority===prio?'bg-red-600 text-white shadow-md':'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{prio}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-slate-700 mb-2">
              <Calendar className="w-4 h-4"/> Date (optionnelle)
            </label>
            <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 text-sm"/>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm">Annuler</button>
            <button type="submit" disabled={!title.trim()} className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl disabled:opacity-50">Ajouter</button>
          </div>
        </form>
      </div>
    </div>
  );
}