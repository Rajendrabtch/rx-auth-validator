'use client';
import { useState, useEffect } from 'react';

export default function Dashboard() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newSid, setNewSid] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newDuration, setNewDuration] = useState('Lifetime');

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/whitelist');
            const data = await res.json();
            
            // PENGAMAN: Cek apakah datanya beneran Array
            if (Array.isArray(data)) {
                setList(data);
            } else {
                console.error("Data dari API bukan Array:", data);
                setList([]); // Set kosong biar ga crash
            }
        } catch (err) {
            console.error(err);
            setList([]);
        }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newSid || !newUsername) return alert('SID dan Username wajib diisi!');
        
        const res = await fetch('/api/whitelist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sid: newSid, username: newUsername, duration: newDuration })
        });
        
        if (res.ok) {
            setNewSid('');
            setNewUsername('');
            fetchData();
        } else {
            const err = await res.json();
            alert('Error: ' + (err.error || 'Gagal menambahkan SID'));
        }
    };

    const handleBan = async (sid, currentStatus) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
        await fetch('/api/whitelist', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sid, status: newStatus })
        });
        fetchData();
    };

    const handleDelete = async (sid) => {
        if (!confirm('Yakin mau hapus SID ini?')) return;
        await fetch(`/api/whitelist?sid=${sid}`, { method: 'DELETE' });
        fetchData();
    };

    const checkExpired = (date) => {
        if (!date) return false;
        return new Date(date) < new Date();
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans">
            {/* ... (SISA KODE UI NYA SAMA PERSIS KAYAK SEBELUMNYA) ... */}
            <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-red-700 w-10 h-10 flex items-center justify-center rounded font-bold text-lg">RX</div>
                    <div>
                        <h1 className="text-xl font-bold tracking-wide">RX AUTH VALIDATOR</h1>
                        <p className="text-xs text-gray-400">RajenX Team • WinAPI Security</p>
                    </div>
                </div>
                <div className="flex gap-4 text-sm">
                    <span className="text-green-500 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> ONLINE
                    </span>
                    <a href="/api/whitelist?format=txt" target="_blank" className="bg-gray-800 px-4 py-1 rounded border border-gray-700 hover:bg-gray-700">Raw Whitelist ↗</a>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-[#111] border border-gray-800 p-6 rounded-lg">
                    <h2 className="font-bold text-lg mb-1">Live SID Inspector</h2>
                    <p className="text-xs text-gray-400 mb-4">Verifikasi status lisensi Windows SID secara real-time</p>
                    <div className="flex gap-2">
                        <input type="text" placeholder="S-1-5-21-..." className="flex-1 bg-[#0a0a0a] border border-gray-700 rounded p-3 text-sm font-mono outline-none focus:border-red-600" />
                        <button className="bg-red-700 px-6 rounded font-semibold hover:bg-red-600">Verify</button>
                    </div>
                </div>

                <div className="bg-[#111] border border-gray-800 p-6 rounded-lg">
                    <h2 className="font-bold text-lg mb-1">Host Machine Identity</h2>
                    <p className="text-xs text-gray-400 mb-4">Windows SID mesin yang menjalankan server</p>
                    <div className="bg-[#0a0a0a] border border-gray-700 p-3 rounded flex justify-between items-center mb-4">
                        <div>
                            <p className="text-[10px] text-gray-500 mb-1">CURRENT WINDOWS SID</p>
                            <p className="font-mono text-red-500 text-sm">S-1-5-21-2756742200-556391283-394996487-1001</p>
                        </div>
                        <button className="bg-gray-800 text-xs px-3 py-1 rounded border border-gray-700">Copy</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-xs text-gray-500">DEVELOPER</p>
                            <p className="font-semibold">RajenX Team</p>
                            <p className="text-xs text-gray-500 mt-2">ACCESS LEVEL</p>
                            <p className="font-semibold">Administrator</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">SYSTEM STATUS</p>
                            <p className="font-semibold text-green-500">Online & Secure</p>
                            <p className="text-xs text-gray-500 mt-2">SERVER UPTIME</p>
                            <p className="font-semibold text-green-500">99.9%</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[#111] border border-gray-800 rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="font-bold text-lg">Registered Whitelist</h2>
                        <p className="text-xs text-gray-400">Daftar Windows SID yang memiliki akses</p>
                    </div>
                </div>
                
                <form onSubmit={handleAdd} className="flex gap-2 mb-6 bg-[#0a0a0a] p-4 rounded border border-gray-800 flex-wrap">
                    <input type="text" placeholder="SID (S-1-5-21...)" value={newSid} onChange={e => setNewSid(e.target.value)} className="flex-1 min-w-[300px] bg-[#111] border border-gray-700 rounded p-2 text-sm font-mono outline-none" />
                    <input type="text" placeholder="Username" value={newUsername} onChange={e => setNewUsername(e.target.value)} className="w-1/5 min-w-[150px] bg-[#111] border border-gray-700 rounded p-2 text-sm outline-none" />
                    <select value={newDuration} onChange={e => setNewDuration(e.target.value)} className="w-1/5 min-w-[150px] bg-[#111] border border-gray-700 rounded p-2 text-sm outline-none">
                        <option value="Lifetime">Lifetime</option>
                        <option value="30">30 Hari</option>
                        <option value="7">7 Hari</option>
                        <option value="1">1 Hari</option>
                    </select>
                    <button type="submit" className="bg-red-700 hover:bg-red-600 px-6 rounded font-semibold">+ Add SID</button>
                </form>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs text-gray-500 uppercase border-b border-gray-800">
                            <tr>
                                <th className="pb-3 px-2">Status</th>
                                <th className="pb-3 px-2">Windows SID</th>
                                <th className="pb-3 px-2">Username</th>
                                <th className="pb-3 px-2">Plan</th>
                                <th className="pb-3 px-2">Expired</th>
                                <th className="pb-3 px-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-4 text-gray-500">Loading data...</td></tr>
                            ) : list.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-4 text-gray-500">Belum ada SID terdaftar.</td></tr>
                            ) : (
                                list.map((item, i) => {
                                    const isExp = checkExpired(item.expired_at);
                                    const isActive = item.status === 'ACTIVE' && !isExp;
                                    
                                    return (
                                    <tr key={i} className="border-b border-gray-800/50 hover:bg-[#1a1a1a] transition">
                                        <td className="py-4 px-2">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold border ${isActive ? 'bg-green-900/30 text-green-500 border-green-800' : 'bg-red-900/30 text-red-500 border-red-800'}`}>
                                                {isExp ? 'EXPIRED' : item.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-2 font-mono text-xs text-gray-300">{item.sid}</td>
                                        <td className="py-4 px-2 text-gray-400">@{item.username}</td>
                                        <td className="py-4 px-2 text-gray-400">{item.plan}</td>
                                        <td className="py-4 px-2 text-gray-400 font-mono text-xs">
                                            {item.expired_at ? new Date(item.expired_at).toLocaleDateString('id-ID') : 'Never (Lifetime)'}
                                        </td>
                                        <td className="py-4 px-2 text-right space-x-2">
                                            <button onClick={() => handleBan(item.sid, item.status)} className="bg-[#1a1a1a] border border-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-700">
                                                {item.status === 'ACTIVE' ? 'Ban' : 'Unban'}
                                            </button>
                                            <button onClick={() => handleDelete(item.sid)} className="bg-red-900/20 text-red-400 border border-red-900/50 px-3 py-1 rounded text-xs hover:bg-red-800 hover:text-white">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                )})
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}