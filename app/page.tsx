'use client';
import { useState } from 'react';

const MOCK_PROFILES = [
  { id: 1, name: "Ananya Sharma, 28", profession: "Senior Product Manager", company: "Google", city: "Bangalore", verified: true, image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80" },
  { id: 2, name: "Rahul Verma, 30", profession: "Management Consultant", company: "McKinsey", city: "Hyderabad", verified: true, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80" },
  { id: 3, name: "Priya Nair, 27", profession: "Corporate Tax Attorney", company: "AZB & Partners", city: "Mumbai", verified: false, image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80" },
  { id: 4, name: "Vikram Malhotra, 31", profession: "VP of Engineering", company: "Microsoft", city: "Bangalore", verified: true, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80" },
  { id: 5, name: "Neha Kulkarni, 29", profession: "Principal Data Scientist", company: "Amazon", city: "Hyderabad", verified: true, image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80" },
  { id: 6, name: "Arjun Reddy, 32", profession: "Investment Banker", company: "Goldman Sachs", city: "Mumbai", verified: true, image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80" }
];

export default function MatrimonyDashboard() {
  const [filterCity, setFilterCity] = useState('All');
  const [interestsSent, setInterestsSent] = useState({});
  const [showModal, setShowModal] = useState(false);

  const filteredProfiles = filterCity === 'All' 
    ? MOCK_PROFILES 
    : MOCK_PROFILES.filter(p => p.city === filterCity);

  const handleExpressInterest = (id) => {
    setInterestsSent(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Header */}
      <header className="border-b bg-white px-8 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Sutra <span className="text-rose-600 font-light">Professionals</span></h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowModal(true)} 
            className="bg-rose-50 text-rose-700 text-sm font-medium px-4 py-2 rounded-full border border-rose-200 hover:bg-rose-100 transition shadow-sm"
          >
            Upgrade to Premium
          </button>
          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-sm">AS</div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Verified Working Professionals</h2>
            <p className="text-sm text-slate-500 mt-1">Connect with verified professionals across top tech, consulting, and legal firms.</p>
          </div>
          {/* Filter Controls */}
          <div className="flex gap-2 flex-wrap">
            {['All', 'Bangalore', 'Hyderabad', 'Mumbai'].map(city => (
              <button 
                key={city}
                onClick={() => setFilterCity(city)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterCity === city ? 'bg-slate-900 text-white' : 'bg-white border text-slate-600 hover:bg-slate-100'}`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Profile Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredProfiles.map(profile => (
            <div key={profile.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition">
              <div className="relative h-72 w-full bg-slate-100">
                <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
                {profile.verified && (
                  <span className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                    ✓ AI Verified
                  </span>
                )}
              </div>
              <div className="p-5 flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{profile.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{profile.profession} at <span className="font-medium text-slate-800">{profile.company}</span></p>
                  <p className="text-xs text-slate-400 mt-2">📍 {profile.city}</p>
                </div>
                <button 
                  onClick={() => handleExpressInterest(profile.id)}
                  disabled={interestsSent[profile.id]}
                  className={`mt-6 w-full py-2.5 rounded-xl font-medium text-sm transition ${interestsSent[profile.id] ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm'}`}
                >
                  {interestsSent[profile.id] ? 'Interest Sent ✓' : 'Express Interest'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Subscription Pricing Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Upgrade to Premium</h3>
            <p className="text-sm text-slate-500 mb-6">Unlock direct phone numbers, unlimited chat requests, and priority AI verification review.</p>
            
            <div className="space-y-4">
              <div className="border rounded-xl p-4 cursor-pointer hover:border-rose-600 transition flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-900">Gold Tier (3 Months)</h4>
                  <p className="text-xs text-slate-500">View contact details & verified badges</p>
                </div>
                <span className="font-bold text-rose-600">₹2,999</span>
              </div>
              <div className="border-2 border-rose-600 bg-rose-50/30 rounded-xl p-4 cursor-pointer relative">
                <span className="absolute -top-2.5 right-4 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Most Popular</span>
                <h4 className="font-bold text-slate-900">Platinum Tier (6 Months)</h4>
                <p className="text-xs text-slate-500">Unlimited interests + dedicated relationship manager</p>
                <div className="mt-2 text-right font-bold text-rose-600">₹5,999</div>
              </div>
            </div>

            <button 
              onClick={() => { alert("Razorpay payment gateway initialized securely for idlyvada.com!"); setShowModal(false); }} 
              className="mt-6 w-full bg-rose-600 text-white py-3 rounded-xl font-medium hover:bg-rose-700 transition shadow-lg shadow-rose-600/20"
            >
              Proceed Securely with Razorpay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}