// src/pages/CalendarView.tsx
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

interface EventData {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  repeatRule?: any;
}

const CalendarView: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<EventData[]>([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    repeat: 'none',
    interval: 1,
    weeklyDays: [] as string[],
    monthlyDay: 1
  });

  // Firestore subscription
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'events'));
    const unsub = onSnapshot(q, snap => {
      const evts = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      setEvents(evts);
    });
    return unsub;
  }, []);

  // Group events
  const eventsByDate = events.reduce((acc, e) => {
    acc[e.date] = [...(acc[e.date] || []), e];
    return acc;
  }, {} as Record<string, EventData[]>);

  // Calendar generation
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstIndex = new Date(year, month, 1).getDay();
  const daysCount = new Date(year, month + 1, 0).getDate();
  const cells = Math.ceil((firstIndex + daysCount) / 7) * 7;
  const calendar = Array.from({ length: cells }).map((_, i) => {
    const d = i - firstIndex + 1;
    return d > 0 && d <= daysCount ? new Date(year, month, d) : null;
  });

  // Handlers
  const openCreate = (dateStr: string) => {
    setModalMode('create');
    setEditingId(null);
    setForm({ ...form, title: '', date: dateStr, startTime: '', endTime: '', repeat: 'none', interval: 1, weeklyDays: [], monthlyDay: parseInt(dateStr.split('-')[2]) });
    setShowModal(true);
  };
  const openEdit = (evt: EventData) => {
    setModalMode('edit');
    setEditingId(evt.id);
    setForm({
      title: evt.title,
      date: evt.date,
      startTime: evt.startTime || '',
      endTime: evt.endTime || '',
      repeat: evt.repeatRule?.frequency || 'none',
      interval: evt.repeatRule?.interval || 1,
      weeklyDays: evt.repeatRule?.days || [],
      monthlyDay: evt.repeatRule?.dayOfMonth || parseInt(evt.date.split('-')[2])
    });
    setShowModal(true);
  };
  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const ref = collection(db, 'users', user.uid, 'events');
    const payload = { title: form.title, date: form.date, startTime: form.startTime, endTime: form.endTime, repeatRule: { frequency: form.repeat, interval: form.interval, days: form.weeklyDays, dayOfMonth: form.monthlyDay } };
    if (modalMode === 'create') {
      await addDoc(ref, payload);
    } else if (modalMode === 'edit' && editingId) {
      const dref = doc(db, 'users', user.uid, 'events', editingId);
      await updateDoc(dref, payload);
    }
    setShowModal(false);
  };
  const handleDelete = async () => {
    if (modalMode !== 'edit' || !editingId) return;
    const user = auth.currentUser;
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'events', editingId));
    setShowModal(false);
  };

  const toggleDay = (day: string) =>
    setForm(f => ({ ...f, weeklyDays: f.weeklyDays.includes(day) ? f.weeklyDays.filter(d => d !== day) : [...f.weeklyDays, day] }));

  const prev = () => setCurrentMonth(new Date(year, month - 1, 1));
  const next = () => setCurrentMonth(new Date(year, month + 1, 1));

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={prev} className="px-2 bg-gray-200 rounded">‹</button>
        <h2 className="text-xl font-semibold">{currentMonth.toLocaleString('default',{month:'long',year:'numeric'})}</h2>
        <button onClick={next} className="px-2 bg-gray-200 rounded">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center font-medium text-sm">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 mt-2">
        {calendar.map((dt, i) => {
          const key = dt ? dt.toISOString().slice(0,10) : `b${i}`;
          const dayEv = dt ? eventsByDate[key] || [] : [];
          return (
            <div key={i} onClick={() => dt && openCreate(key)} className="h-24 border rounded p-1 bg-white hover:bg-gray-50 cursor-pointer">
              {dt && <div className="flex justify-between items-center"><span>{dt.getDate()}</span>{dayEv.length>0&&<span className="w-2 h-2 bg-blue-600 rounded-full"></span>}</div>}
              {dayEv.map(e=> <div key={e.id} onClick={ev=>{ev.stopPropagation();openEdit(e);}} className="mt-1 text-xs text-blue-600 hover:underline cursor-pointer">{e.title}</div>)}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{modalMode==='create'?'Add':'Edit'} Event</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Title" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} className="w-full border p-2 rounded" />
              <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} className="w-full border p-2 rounded" />
              <div className="flex gap-2">
                <input type="time" value={form.startTime} onChange={e=>setForm(f=>({...f,startTime:e.target.value}))} className="flex-1 border p-2 rounded" />
                <input type="time" value={form.endTime} onChange={e=>setForm(f=>({...f,endTime:e.target.value}))} className="flex-1 border p-2 rounded" />
              </div>
              <select value={form.repeat} onChange={e=>setForm(f=>({...f,repeat:e.target.value as any}))} className="w-full border p-2 rounded">
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              {form.repeat!=='none' && (
                <>
                  <input type="number" min={1} value={form.interval} onChange={e=>setForm(f=>({...f,interval:parseInt(e.target.value)||1}))} className="w-full border p-2 rounded" placeholder="Interval" />
                  {form.repeat==='weekly' && (
                    <div className="flex flex-wrap gap-2">
                      {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=><button key={d} type="button" onClick={()=>toggleDay(d)} className={`px-2 py-1 border rounded ${form.weeklyDays.includes(d)?'bg-blue-600 text-white':''}`}>{d}</button>)}
                    </div>
                  )}
                  {form.repeat==='monthly' && (<input type="number" min={1} max={31} value={form.monthlyDay} onChange={e=>setForm(f=>({...f,monthlyDay:parseInt(e.target.value)||1}))} className="w-full border p-2 rounded" placeholder="Day of month" />)}
                </>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              {modalMode==='edit' && <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>}
              <button onClick={()=>setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
