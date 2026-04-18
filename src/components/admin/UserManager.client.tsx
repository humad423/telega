'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { toggleAdmin, toggleBan, updateProfile } from '@/app/[locale]/admin/actions';

export function UserManager({ users, locale }: { users: any[]; locale: string }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'banned'>('all');
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const filteredUsers = users.filter(u => {
    // Text Search
    const matchesSearch = 
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    // Type Filter
    if (filter === 'active') return !u.is_banned;
    if (filter === 'banned') return u.is_banned;
    return true;
  });

  const handleEdit = (u: any) => {
    setEditingId(u.id);
    setEditName(u.full_name || '');
  };

  const saveEdit = async (id: string) => {
    setStatus(null);
    startTransition(async () => {
        const res = await updateProfile(id, { full_name: editName });
        if (res.error) setStatus({ type: 'error', msg: res.error });
        else {
            setStatus({ type: 'success', msg: 'Profile updated!' });
            setEditingId(null);
        }
    });
  };

  const onToggleAdmin = (id: string, current: boolean) => {
    setStatus(null);
    startTransition(async () => {
        const res = await toggleAdmin(id, current);
        if (res.error) setStatus({ type: 'error', msg: res.error });
        else setStatus({ type: 'success', msg: 'Rank updated!' });
    });
  };

  const onToggleBan = (id: string, current: boolean) => {
    setStatus(null);
    startTransition(async () => {
        const res = await toggleBan(id, current);
        if (res.error) setStatus({ type: 'error', msg: res.error });
        else setStatus({ type: 'success', msg: current ? 'User unbanned!' : 'User banned!' });
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Access Control</h2>
                {isPending && (
                    <div className="w-5 h-5 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                )}
                {status && (
                    <div className={`px-4 py-1.5 rounded-md text-xs font-black uppercase ${status.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'} animate-bounce`}>
                        {status.msg}
                    </div>
                )}
            </div>
            
            <div className="relative w-full max-w-md">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <span className="material-symbols-outlined text-sm">search</span>
                </span>
                <input 
                    type="text"
                    placeholder="Search systems..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-lg pl-11 pr-4 py-2.5 text-sm font-medium outline-none transition-all shadow-sm"
                />
            </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 w-fit rounded-lg">
            <button 
                onClick={() => setFilter('all')}
                className={`px-6 py-2 rounded-md text-xs font-black uppercase transition-all ${filter === 'all' ? 'bg-white dark:bg-slate-900 text-primary shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
                All ({users.length})
            </button>
            <button 
                onClick={() => setFilter('active')}
                className={`px-6 py-2 rounded-md text-xs font-black uppercase transition-all ${filter === 'active' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Active ({users.filter(u => !u.is_banned).length})
            </button>
            <button 
                onClick={() => setFilter('banned')}
                className={`px-6 py-2 rounded-md text-xs font-black uppercase transition-all ${filter === 'banned' ? 'bg-rose-600 text-white shadow-lg ring-2 ring-rose-300' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Banned ({users.filter(u => u.is_banned).length})
            </button>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-outline-variant/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="p-6 text-xs font-black uppercase text-slate-500 tracking-widest text-right">Identity</th>
                <th className="p-6 text-xs font-black uppercase text-slate-500 tracking-widest text-right">Email Address</th>
                <th className="p-6 text-xs font-black uppercase text-slate-500 tracking-widest text-center">Join Date</th>
                <th className="p-6 text-xs font-black uppercase text-slate-500 tracking-widest text-center">Authority</th>
                <th className="p-6 text-xs font-black uppercase text-slate-500 tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <span className="material-symbols-outlined text-4xl text-slate-200">person_off</span>
                        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">No matching users found</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.map((u) => (
                <tr key={u.id} className={`transition-all font-medium ${u.is_banned ? 'bg-rose-50/50 dark:bg-rose-950/20' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/10'}`}>
                  <td className="p-6">
                    <div className={`flex items-center gap-4 ${u.is_banned ? 'opacity-50' : ''}`}>
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-black uppercase text-lg border-2 ${u.is_banned ? 'bg-rose-100/50 text-rose-600 border-rose-200' : 'bg-primary/5 text-primary border-primary/10'}`}>
                        {u.username?.charAt(0)}
                      </div>
                      <div>
                        {editingId === u.id ? (
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              disabled={isPending}
                              className="px-3 py-1.5 text-sm border-2 rounded-md bg-white dark:bg-slate-800 border-primary/20 outline-none focus:border-primary shadow-sm"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button onClick={() => saveEdit(u.id)} disabled={isPending} className="text-[10px] bg-primary text-white px-3 py-1 rounded font-black uppercase shadow-md hover:scale-105 active:scale-95">Save</button>
                              <button onClick={() => setEditingId(null)} disabled={isPending} className="text-[10px] text-slate-500 font-black uppercase hover:underline">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className={`font-black text-base tracking-tight ${u.is_banned ? 'text-rose-900 dark:text-rose-200 line-through decoration-rose-500/50' : 'text-slate-900 dark:text-white'}`}>{u.full_name || u.username}</p>
                            <p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase opacity-60">ID# {u.id.slice(0, 8)}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className={`flex items-center gap-2 text-slate-600 dark:text-slate-400 ${u.is_banned ? 'opacity-40' : ''}`}>
                      <span className="material-symbols-outlined text-base">mail</span>
                      <span className="text-sm font-bold">{u.email || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <div className={`inline-flex flex-col ${u.is_banned ? 'opacity-40' : ''}`}>
                        <span className="text-xs text-slate-600 font-black uppercase tracking-tighter">
                            {new Date(u.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(u.created_at).getFullYear()}</span>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <div className="flex flex-col gap-1.5 items-center">
                      <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-md border-2 ${u.is_admin ? 'bg-amber-100/50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800/10 dark:border-slate-700'}`}>
                        {u.is_admin ? 'ADMIN' : 'USER'}
                      </span>
                      {u.is_banned && (
                        <span className="text-[10px] font-black uppercase px-3 py-1 rounded-md bg-rose-600 text-white shadow-rose-200 shadow-xl ring-4 ring-rose-500/20">
                          BANNED
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <div className="flex flex-wrap justify-center gap-2 max-w-[240px] mx-auto">
                      {!u.is_banned && editingId !== u.id && (
                        <button 
                            onClick={() => handleEdit(u)}
                            disabled={isPending}
                            className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-50"
                            title="Edit User"
                        >
                            <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                      )}
                      
                       <button 
                        onClick={() => onToggleAdmin(u.id, u.is_admin)}
                        disabled={isPending}
                        className={`text-[9px] font-black uppercase px-4 py-2 rounded-lg border-2 transition-all disabled:opacity-50 ${u.is_admin ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100' : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'}`}
                      >
                        {u.is_admin ? 'Demote' : 'Promote'}
                      </button>

                       <button 
                        onClick={() => onToggleBan(u.id, u.is_banned)}
                        disabled={isPending}
                        className={`text-xs font-black uppercase px-5 py-2 rounded-lg border-2 transition-all shadow-md disabled:opacity-50 ${u.is_banned ? 'bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700 hover:scale-105 active:scale-95' : 'bg-rose-600 border-rose-700 text-white hover:bg-rose-700 hover:scale-105 active:scale-95'}`}
                      >
                        {u.is_banned ? 'Unban User' : 'Ban User'}
                      </button>

                       <Link 
                        href={`/${locale}/admin?tab=directory&userId=${u.id}`}
                        className="text-[9px] font-black uppercase px-4 py-2 rounded-lg border-2 border-sky-200 bg-sky-50 text-sky-600 hover:bg-sky-100 hover:border-sky-300 transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-sm">link</span>
                        Links
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
