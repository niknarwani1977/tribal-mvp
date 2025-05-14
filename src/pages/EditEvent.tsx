// src/pages/EditEvent.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auth, db } from '../firebase';
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

const EditEvent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [repeat, setRepeat] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [interval, setInterval] = useState(1);
  const [weeklyDays, setWeeklyDays] = useState<string[]>([]);
  const [monthlyDay, setMonthlyDay] = useState(1);

  // Load event data
  useEffect(() => {
    const loadEvent = async () => {
      const user = auth.currentUser;
      if (!user || !id) return;
      try {
        const ref = doc(db, 'users', user.uid, 'events', id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError('Event not found');
          return;
        }
        const data = snap.data() as any;
        setTitle(data.title);
        setDate(data.date);
        setStartTime(data.startTime || '');
        setEndTime(data.endTime || '');
        if (data.repeatRule) {
          setRepeat(data.repeatRule.frequency || 'none');
          setInterval(data.repeatRule.interval || 1);
          if (data.repeatRule.days) setWeeklyDays(data.repeatRule.days);
          if (data.repeatRule.dayOfMonth) setMonthlyDay(data.repeatRule.dayOfMonth);
        }
      } catch (err: any) {
        setError('Error loading event: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadEvent();
  }, [id]);

  const toggleWeeklyDay = (day: string) => {
    setWeeklyDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !id) {
      setError('Not authorized or event missing');
      return;
    }
    try {
      const ref = doc(db, 'users', user.uid, 'events', id);
      const repeatRule: any = { frequency: repeat };
      if (repeat !== 'none') repeatRule.interval = interval;
      if (repeat === 'weekly') repeatRule.days = weeklyDays;
      if (repeat === 'monthly') repeatRule.dayOfMonth = monthlyDay;
      await updateDoc(ref, { title, date, startTime, endTime, repeatRule });
      navigate('/calendar');
    } catch (err: any) {
      setError('Error updating event: ' + err.message);
    }
  };

  const handleDelete = async () => {
    const user = auth.currentUser;
    if (!user || !id) return;
    if (!window.confirm('Delete this event?')) return;
    try {
      const ref = doc(db, 'users', user.uid, 'events', id);
      await deleteDoc(ref);
      navigate('/calendar');
    } catch (err: any) {
      setError('Error deleting event: ' + err.message);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow mt-10">
      <h2 className="text-xl font-semibold mb-4">Edit Event</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="block mb-1">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>
        <div>
          <label className="block mb-1">Repeat</label>
          <select
            value={repeat}
            onChange={e => setRepeat(e.target.value as any)}
            className="w-full border p-2 rounded"
          >
            <option value="none">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        {repeat !== 'none' && (
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Every</label>
              <input
                type="number"
                min={1}
                value={interval}
                onChange={e => setInterval(parseInt(e.target.value) || 1)}
                className="w-full border p-2 rounded"
              />
            </div>
            {repeat === 'weekly' && (
              <div>
                <label className="block mb-1">Repeat on:</label>
                <div className="flex gap-2 flex-wrap">
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleWeeklyDay(day)}
                      className={`px-2 py-1 border rounded ${
                        weeklyDays.includes(day) ? 'bg-blue-600 text-white' : ''
                      }`}>
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {repeat === 'monthly' && (
              <div>
                <label className="block mb-1">Day of month</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={monthlyDay}
                  onChange={e => setMonthlyDay(parseInt(e.target.value) || 1)}
                  className="w-full border p-2 rounded"
                />
              </div>
            )}
          </div>
        )}
        <div className="flex justify-between space-x-2">
          <button
            type="submit"
            className="flex-1 py-2 bg-green-600 text-white rounded"
          >
            Update
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex-1 py-2 bg-red-600 text-white rounded"
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent;
