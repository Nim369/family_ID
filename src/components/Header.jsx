import React from 'react';
import { Shield, Phone, Globe, Bell, LogOut, User, Radio } from 'lucide-react';

export default function Header({ 
  lang, 
  setLang,
  loggedCitizen,
  onLogout,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenSmsGateway
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      {/* Indian National Tricolor Ribbon */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#ea580c] via-white to-[#15803d]" />

      {/* Top Utility Bar */}
      <div className="bg-[#091c3d] text-slate-200 text-xs py-1.5 px-4 sm:px-8 flex flex-wrap justify-between items-center gap-2 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <span className="font-medium text-amber-300">
            {lang === 'gu' ? 'ગુજરાત સરકાર' : 'Government of Gujarat'}
          </span>
          <span className="hidden md:inline text-slate-400">|</span>
          <span className="hidden md:inline text-slate-300">
            {lang === 'gu' ? 'સામાજિક ન્યાય અને પરિવાર કલ્યાણ વિભાગ' : 'Social Justice & Family Welfare Department'}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1 text-slate-300">
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{lang === 'gu' ? 'હેલ્પલાઇન:' : 'Toll-Free:'}</span>
            <span className="font-semibold text-white">1800-233-5500</span>
          </div>

          <div className="h-3 w-[1px] bg-slate-700 hidden sm:block" />

          {/* Language Selector */}
          <button 
            onClick={() => setLang(lang === 'gu' ? 'en' : 'gu')}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-0.5 rounded text-xs transition border border-slate-700 font-medium"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'gu' ? 'English' : 'ગુજરાતી'}</span>
          </button>
        </div>
      </div>

      {/* Main Government Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Gujarat Emblem & Portal Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-[#0f2b5c] border-2 border-amber-500 flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <div className="text-center leading-none">
              <span className="text-[10px] block font-bold text-amber-400">GJ</span>
              <Shield className="w-5 h-5 mx-auto text-white my-0.5" />
              <span className="text-[8px] block tracking-tighter">GOVT</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#0f2b5c] tracking-tight">
                {lang === 'gu' ? 'ગુજરાત કુટુંબ પોર્ટલ' : 'Gujarat Kutumb Portal'}
              </h1>
              <span className="bg-amber-100 text-amber-800 text-[11px] font-semibold px-2 py-0.5 rounded border border-amber-200">
                Citizen Welfare
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              {lang === 'gu' 
                ? 'સંકલિત ફેમિલી આઈડી અને યોજના લાભાર્થી પોર્ટલ' 
                : 'Unified Family ID & Welfare Beneficiary Citizen Portal'}
            </p>
          </div>
        </div>

        {/* Citizen Profile Actions */}
        {loggedCitizen && (
          <div className="flex items-center gap-3">
            {/* Notification Bell with SMS count */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-[#0f2b5c] hover:bg-slate-100 rounded-full transition"
              title="View Government SMS & Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-[#ea580c] text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Telecom SMS Gateway Setup */}
            <button
              onClick={onOpenSmsGateway}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-blue-900 bg-slate-100 hover:bg-blue-50 border border-slate-300 rounded transition"
              title="Telecom SMS Gateway Configuration (Deliver SMS to real physical mobile phone)"
            >
              <Radio className="w-3.5 h-3.5 text-amber-600" />
              <span>SMS Gateway</span>
            </button>

            {/* Citizen Identifier Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-xs">
              <User className="w-4 h-4 text-blue-800" />
              <div>
                <span className="font-bold text-blue-950 block leading-tight">
                  {loggedCitizen.members.find(m => m.relationToHead === 'HEAD')?.fullName}
                </span>
                <span className="font-mono text-[10px] text-slate-500">
                  {loggedCitizen.familyIdNumber}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-red-700 hover:bg-red-50 border border-slate-300 rounded transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>

      {/* Official State Broadcast Notification Marquee */}
      <div className="bg-amber-50 border-t border-b border-amber-200 px-4 sm:px-8 py-1.5 text-xs text-amber-900 flex items-center gap-2">
        <span className="bg-[#ea580c] text-white text-[10px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wide flex-shrink-0">
          {lang === 'gu' ? 'સૂચના' : 'NOTICE'}
        </span>
        <marquee className="font-medium" behavior="scroll" direction="left" scrollamount="5">
          {lang === 'gu'
            ? 'નમો સરસ્વતી અને નમો લક્ષ્મી યોજના હેઠળ લાભાર્થીઓની નોંધણી ચાલુ છે. તમામ પરિવારોને આવક પ્રમાણપત્ર અને આધાર નંબર ચકાસી લેવા નમ્ર વિનંતી.'
            : 'Enrollments active under Namo Saraswati and Namo Lakshmi Schemes. Citizens are advised to verify their Family ID and upload authorized Mamlatdar Income Certificates.'}
        </marquee>
      </div>
    </header>
  );
}
