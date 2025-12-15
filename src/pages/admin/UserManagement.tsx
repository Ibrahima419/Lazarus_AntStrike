import { useState, useEffect } from 'react';
import { userService, User, CreateUserData } from '../../services/api/user.service';
import { Plus, Trash2, Shield, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

export function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<CreateUserData>({
        name: '',
        email: '',
        role: 'analyst',
        password: ''
    });
    const [tempPassword, setTempPassword] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.getUsers();
            setUsers(data);
        } catch (error) {
            toast.error('Erreur lors du chargement des utilisateurs');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

        try {
            await userService.deleteUser(userId);
            toast.success('Utilisateur supprimé');
            loadUsers();
        } catch (error) {
            toast.error('Erreur lors de la suppression');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await userService.createUser(formData);
            toast.success('Utilisateur créé avec succès');
            setIsModalOpen(false);

            resetForm();

            if (result.temporaryPassword) {
                setTempPassword(result.temporaryPassword);
            }

            loadUsers();
        } catch (error) {
            toast.error('Erreur lors de la création de l\'utilisateur');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            role: 'analyst',
            password: ''
        });
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Gestion des Utilisateurs</h1>
                    <p className="text-slate-400">Gérez les comptes d'analystes et administrateurs</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus size={18} />
                    Nouvel Utilisateur
                </button>
            </div>

            {tempPassword && (
                <div className="bg-green-900/30 border border-green-500/30 p-4 rounded-lg flex flex-col gap-2">
                    <h3 className="text-green-400 font-semibold">Utilisateur créé !</h3>
                    <p className="text-slate-300">Veuillez copier le mot de passe temporaire : <code className="bg-slate-900 px-2 py-1 rounded text-white select-all">{tempPassword}</code></p>
                    <button onClick={() => setTempPassword(null)} className="text-sm text-slate-400 underline self-start">Fermer</button>
                </div>
            )}

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900/80 border-b border-slate-800">
                            <th className="p-4 text-slate-400 font-medium">Nom</th>
                            <th className="p-4 text-slate-400 font-medium">Email</th>
                            <th className="p-4 text-slate-400 font-medium">Rôle</th>
                            <th className="p-4 text-slate-400 font-medium">Date création</th>
                            <th className="p-4 text-slate-400 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">Chargement...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">Aucun utilisateur trouvé</td></tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                                <UserIcon size={16} />
                                            </div>
                                            <span className="text-slate-200 font-medium">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-300">{user.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${user.role === 'admin'
                                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-400 text-sm">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Supprimer"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Création */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-4">Nouvel Utilisateur</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Nom complet</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Rôle</label>
                                <select
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                                >
                                    <option value="analyst">Analyste</option>
                                    <option value="admin">Administrateur</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Mot de passe (optionnel)</label>
                                <input
                                    type="password"
                                    placeholder="Laisser vide pour générer automatiquement"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    Créer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
