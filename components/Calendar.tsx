import React, { useState } from 'react';
import {
  format,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, X, MapPin, AlignLeft } from 'lucide-react';
import SmartAd from './SmartAd';

// Calendar Component
interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  description?: string;
  location?: string;
  type: 'meeting' | 'task' | 'reminder';
}

const Calendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    time: '12:00',
    type: 'meeting',
    description: ''
  });

  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Meeting with Salam Brothers',
      date: new Date(),
      time: '10:00',
      type: 'meeting',
      description: 'Discuss new supply chain agreement.'
    },
    {
      id: '2',
      title: 'Due Collection: Rahim Store',
      date: addDays(new Date(), 2),
      time: '14:30',
      type: 'task',
      description: 'Collect pending 5000 BDT.'
    },
    {
      id: '3',
      title: 'Inventory Check',
      date: addDays(new Date(), 5),
      time: '09:00',
      type: 'reminder',
      description: 'Monthly stock count.'
    }
  ]);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title) return;

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title || 'New Event',
      date: selectedDate,
      time: newEvent.time || '12:00',
      description: newEvent.description,
      type: (newEvent.type as any) || 'meeting'
    };

    setEvents([...events, event]);
    setIsModalOpen(false);
    setNewEvent({ title: '', time: '12:00', type: 'meeting', description: '' });
  };

  const renderHeader = () => {
    const dateFormat = "MMMM yyyy";

    return (
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600/20 rounded-xl text-blue-500">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {format(currentMonth, dateFormat)}
            </h2>
            <p className="text-slate-400 text-sm">Manage your schedule and due dates</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium text-white transition"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const dateFormat = "EEEE";
    const days = [];
    let startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center text-slate-500 text-xs md:text-sm font-medium py-2 md:py-4 uppercase tracking-wider">
          <span className="hidden md:inline">{format(addDays(startDate, i), "EEEE")}</span>
          <span className="md:hidden">{format(addDays(startDate, i), "EEE")}</span>
        </div>
      );
    }

    return <div className="grid grid-cols-7 mb-2 border-b border-slate-800">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;

        const isSelected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, new Date());
        const isCurrentMonth = isSameMonth(day, monthStart);

        const dayEvents = events.filter(e => isSameDay(e.date, day));

        days.push(
          <div
            key={day.toString()}
            className={`
              min-h-[90px] md:min-h-[120px] p-2 md:p-3 border border-slate-800/50 relative group transition-all cursor-pointer
              ${!isCurrentMonth ? 'bg-slate-900/30 text-slate-600' : 'bg-slate-900/50 text-slate-300'}
              ${isSelected ? 'ring-2 ring-blue-500 z-10 bg-slate-800' : 'hover:bg-slate-800/50'}
              ${isToday ? 'bg-blue-900/10' : ''}
            `}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <div className="flex justify-between items-start mb-1 md:mb-2">
              <span className={`
                text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                ${isToday ? 'bg-blue-600 text-white' : ''}
                ${!isCurrentMonth ? 'text-slate-600' : ''}
              `}>
                {formattedDate}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDate(cloneDay);
                  setIsModalOpen(true);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="space-y-1 mt-1">
              {dayEvents.slice(0, 3).map((event, idx) => (
                <div
                  key={idx}
                  className={`
                    text-[10px] md:text-xs px-1 md:px-2 py-0.5 md:py-1 rounded border truncate
                    ${event.type === 'meeting' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : ''}
                    ${event.type === 'task' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : ''}
                    ${event.type === 'reminder' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : ''}
                  `}
                  title={event.title}
                >
                  <span className="hidden md:inline">{event.title}</span>
                  <span className="md:hidden">{event.title.charAt(0)}..</span>
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-[10px] md:text-xs text-slate-500 pl-1">
                  +{dayEvents.length - 3} <span className="hidden md:inline">more</span>
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }
    return <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">{rows}</div>;
  };

  const selectedDayEvents = events.filter(e => isSameDay(e.date, selectedDate));

  return (
    <div className="p-4 md:p-4 max-w-7xl mx-auto animate-fade-in pb-10">
      {renderHeader()}
      {renderDays()}
      {renderCells()}

      {/* Selected Date Details Panel */}
      <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="text-blue-500" size={20} />
            Schedule for {format(selectedDate, "MMMM d, yyyy")}
          </h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
          >
            <Plus size={16} /> Add Event
          </button>
        </div>

        <div className="space-y-4">
          {selectedDayEvents.length > 0 ? (
            <div className="grid gap-4">
              {selectedDayEvents.map(event => (
                <div key={event.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-start gap-4 hover:border-slate-700 transition">
                  <div className={`
                    p-3 rounded-lg
                    ${event.type === 'meeting' ? 'bg-blue-500/10 text-blue-500' : ''}
                    ${event.type === 'task' ? 'bg-purple-500/10 text-purple-500' : ''}
                    ${event.type === 'reminder' ? 'bg-emerald-500/10 text-emerald-500' : ''}
                  `}>
                    <Clock size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-white font-bold">{event.title}</h4>
                      <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">{event.time}</span>
                    </div>
                    {event.description && <p className="text-slate-400 text-sm mt-1">{event.description}</p>}
                    <div className="flex gap-2 mt-3">
                      <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                        {event.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
              <p>No events scheduled for this day.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 text-blue-500 hover:text-blue-400 font-medium text-sm"
              >
                Create a new event
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Add New Event</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-1 text-sm">Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="e.g. Client Meeting"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 text-sm">Time</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 text-sm">Type</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none appearance-none"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="task">Task</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-sm">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Add details..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none h-24 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition mt-2"
              >
                Save Event
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Ad Banner */}
      <div className="mt-8">
        <SmartAd
          adSenseSlot="2182641593"
          adMobUnitId="ca-app-pub-6195759507222480/6000836790"
        />
      </div>
    </div>
  );
};

export default Calendar;
