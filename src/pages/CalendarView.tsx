// src/pages/CalendarView.tsx
// A fully Firestore-backed interactive calendar:
//  • Subscribes to the current user’s events in Firestore
//  • Builds a month grid
//  • Marks days with events (including repeat rules: none/daily/weekly/monthly)
//  • Opens a modal to create/edit/delete events directly in Firestore

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';

interface EventData {
  id: string;
  title: string;
  date: string;             // YYYY-MM-DD
  startTime?: string;       // HH:MM
  endTime?: string;         // HH:MM
  repeatRule?: {
    frequency: 'none' | 'daily' | 'weekly' | 'monthly';
    interval?: number;      // e.g. every 2 weeks
    days?: string[];        // ['Mon','Wed'] for weekly
    dayOfMonth?: number;    // e.g. 15 for monthly
  };
}

const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const CalendarView: React.FC = () => {
  // --- State ---
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<EventData[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Modal for create/edit
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create'|'edit'>('create');
  const [editingEvent, setEditingEvent] = useState<EventData|null>(null);
  const [form, setForm] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    repeat: 'none' as string,
    interval: 1,
    weeklyDays: [] as string[],
    monthlyDay: 1
  });

  // --- Subscribe to Firestore after auth resolves ---
  useEffect(() => {
    let unsubscribeEvents: (() => void)|null = null;

    // Wait for auth state to be ready
    const unsubAuth = onAuthStateChanged(auth, user => {
      if (!user) {
        // No user → clear & stop
        setEvents([]);
        setLoadingEvents(false);
        if (unsubscribeEvents) unsubscribeEvents();
        return;
      }

      // Build query to user's events subcollection
      const eventsRef = collection(db, 'users', user.uid, 'events');
      const q = query(eventsRef);

      // Subscribe in real-time
      unsubscribeEvents = onSnapshot(q, snap => {
        const evts: EventData[] = snap.docs.map(d => ({
          id: d.id,
          ...(d.data() as any)
        }));
        setEvents(evts);
        setLoadingEvents(false);
      });

    });

    // Clean up on unmount
    return () => {
      unsubAuth();
      if (unsubscribeEvents) unsubscribeEvents();
    };
  }, []);

  // --- Calendar grid logic ---
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstIdx = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const totalCells = Math.ceil((firstIdx + daysInMonth)/7)*7;
  const grid: (Date|null)[] = Array.from({ length: totalCells }).map((_,i) => {
    const d = i - firstIdx + 1;
    return d>0 && d<=daysInMonth
      ? new Date(year, month, d)
      : null;
  });

  // --- Group events (incl. repeats) by date string ---
  const eventsByDate: Record<string, EventData[]> = {};
  const addOccurrence = (evt:EventData, dateStr:string) => {
    if (!eventsByDate[dateStr]) eventsByDate[dateStr] = [];
    if (!eventsByDate[dateStr].some(e=>e.id===evt.id)) {
      eventsByDate[dateStr].push(evt);
    }
  };

  // Populate occurrences
  grid.forEach(dt => {
    if (!dt) return;
    const dateStr = dt.toISOString().slice(0,10);
    // Base events
    events.filter(e=>e.date===dateStr).forEach(e=>addOccurrence(e,dateStr));
  });
  // Now repeats
  events.forEach(evt => {
    if (!evt.repeatRule || evt.repeatRule.frequency==='none') return;
    const start = new Date(evt.date);
    grid.forEach(dt => {
      if (!dt || dt<start) return;
      const diffDays = Math.floor((dt.getTime()-start.getTime())/(86400e3));
      const { frequency, interval=1, days=[], dayOfMonth } = evt.repeatRule!;
      const dateStr = dt.toISOString().slice(0,10);

      switch(frequency) {
        case 'daily':
          if (diffDays%interval===0) addOccurrence(evt,dateStr);
          break;
        case 'weekly':
          if (days.includes(weekdays[dt.getDay()]) && Math.floor(diffDays/7)%interval===0) {
            addOccurrence(evt,dateStr);
          }
          break;
        case 'monthly':
          if (dt.getDate()===dayOfMonth) addOccurrence(evt,dateStr);
          break;
      }
    });
  });

  // --- Modal helpers ---
  const openModal = (mode:'create'|'edit', dateStr?:string, evt?:EventData) => {
    setModalMode(mode);
    if (mode==='create') {
      setForm({
        title:'', date: dateStr||'', startTime:'', endTime:'',
        repeat:'none', interval:1, weeklyDays:[], monthlyDay:1
      });
      setEditingEvent(null);
    } else if (evt) {
      const rr = evt.repeatRule || { frequency:'none' };
      setForm({
        title:evt.title, date:evt.date,
        startTime:evt.startTime||'', endTime:evt.endTime||'',
        repeat:rr.frequency,
        interval:rr.interval||1,
        weeklyDays:rr.days||[],
        monthlyDay:rr.dayOfMonth||1
      });
      setEditingEvent(evt);
    }
    setShowModal(true);
  };

  const toggleDay = (day:string) => {
    setForm(f => {
      const has = f.weeklyDays.includes(day);
      return {
        ...f,
        weeklyDays: has ? f.weeklyDays.filter(d=>d!==day) : [...f.weeklyDays,day]
      };
    });
  };

  // --- Firestore CRUD ---
  const handleSave = async () => {
    const user = auth.currentUser; if (!user) return;
    const payload = {
      title: form.title,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      repeatRule: {
        frequency: form.repeat as any,
        interval: form.interval,
        days: form.weeklyDays,
        dayOfMonth: form.monthlyDay
      }
    };
    const ref = collection(db,'users',user.uid,'events');
    if (modalMode==='create') await addDoc(ref,payload);
    else if (editingEvent) await updateDoc(doc(db,'users',user.uid,'events',editingEvent.id),payload);
    setShowModal(false);
  };

  const handleDelete = async () => {
    const user = auth.currentUser; if (!user || !editingEvent) return;
    await deleteDoc(doc(db,'users',user.uid,'events',editingEvent.id));
    setShowModal(false);
  };

  // --- Month navigation ---
  const prevMonth = () => setCurrentMonth(new Date(year,month-1,1));
  const nextMonth = () => setCurrentMonth(new Date(year,month+1,1));

  // --- Render ---
  if (loadingEvents) {
    return <div className="p-6 text-center">Loading events…</div>;
  }

  return (
    <div className="p-4">
      {/* Month header */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="px-2 bg-gray-200 rounded">‹</button>
        <h2 className="text-xl font-semibold">
          {currentMonth.toLocaleString('default',{month:'long',year:'numeric'})}
        </h2>
        <button onClick={nextMonth} className="px-2 bg-gray-200 rounded">›</button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 text-center font-medium text-sm">
        {weekdays.map(d => <div key={d}>{d}</div>)}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 mt-2">
        {grid.map((dt,idx) => {
          const dateStr = dt?.toISOString().slice(0,10) || `empty-${idx}`;
          const dayEvents = eventsByDate[dateStr]||[];
          return (
            <div
              key={idx}
              onClick={()=> dt && openModal('create',dateStr)}
              className="h-24 border rounded p-1 bg-white hover:bg-gray-50 cursor-pointer"
            >
              {dt && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{dt.getDate()}</span>
                    {dayEvents.length>0 && <span className="w-2 h-2 bg-blue-600 rounded-full"></span>}
                  </div>
                  {dayEvents.map(evt=>(
                    <div
                      key={evt.id}
                      onClick={e=>{e.stopPropagation(); openModal('edit', undefined, evt);}}
                      className="mt-1 text-xs text-blue-600 hover:underline cursor-pointer"
                    >
                      {evt.title}
                    </div>
                  ))}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {modalMode==='create' ? 'Add' : 'Edit'} Event
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Title"
                value={form.title}
                onChange={e=>setForm(f=>({...f,title:e.target.value}))}
                className="w-full border p-2 rounded"
              />
              <input
                type="date"
                value={form.date}
                onChange={e=>setForm(f=>({...f,date:e.target.value}))}
                className="w-full border p-2 rounded"
              />
              <div className="flex gap-2">
                <input
                  type="time"
                  value={form.startTime}
                  onChange={e=>setForm(f=>({...f,startTime:e.target.value}))}
                  className="flex-1 border p-2 rounded"
                />
                <input
                  type="time"
                  value={form.endTime}
                  onChange={e=>setForm(f=>({...f,endTime:e.target.value}))}
                  className="flex-1 border p-2 rounded"
                />
              </div>
              <select
                value={form.repeat}
                onChange={e=>setForm(f=>({...f,repeat:e.target.value}))}
                className="w-full border p-2 rounded"
              >
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              {form.repeat!=='none' && (
                <>
                  <input
                    type="number"
                    min={1}
                    value={form.interval}
                    onChange={e=>setForm(f=>({...f,interval:parseInt(e.target.value)||1}))}
                    className="w-full border p-2 rounded"
                    placeholder="Interval"
                  />
                  {form.repeat==='weekly' && (
                    <div className="flex flex-wrap gap-2">
                      {weekdays.map(d=>(
                        <button
                          key={d}
                          type="button"
                          onClick={()=>toggleDay(d)}
                          className={`px-2 py-1 border rounded ${
                            form.weeklyDays.includes(d)
                              ? 'bg-blue-600 text-white'
                              : ''
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  )}
                  {form.repeat==='monthly' && (
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={form.monthlyDay}
                      onChange={e=>setForm(f=>({...f,monthlyDay:parseInt(e.target.value)||1}))}
                      className="w-full border p-2 rounded"
                      placeholder="Day of Month"
                    />
                  )}
                </>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              {modalMode==='edit' && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              )}
              <button
                onClick={()=>setShowModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
