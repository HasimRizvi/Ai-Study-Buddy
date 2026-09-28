import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Alert from '../components/Alert';

export default function Profile() {
  const { user, updateProfile, refreshUser } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    department: user?.department || '',
    year: user?.year || '',
    college: user?.college || '',
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState('');

  const saveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBusy('profile');
    try {
      await updateProfile(profile);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwords.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    setBusy('password');
    try {
      const { data } = await api.put('/auth/password', passwords);
      setSuccess(data.message);
      setPasswords({ currentPassword: '', newPassword: '' });
      await refreshUser();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
      <p className="mt-1 text-sm text-slate-500">Manage your account details and password.</p>

      <Alert type="error" onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card p-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-3xl font-bold text-white">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <p className="mt-4 text-lg font-bold text-slate-900">{user?.name}</p>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <span className={`badge mt-3 ${user?.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-brand-50 text-brand-700'}`}>
            {user?.role === 'admin' ? 'Administrator' : 'Student'}
          </span>
          <dl className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-left text-xs">
            <div className="flex justify-between">
              <dt className="text-slate-400">Department</dt>
              <dd className="font-semibold text-slate-700">{user?.department}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Year</dt>
              <dd className="font-semibold text-slate-700">{user?.year}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Member since</dt>
              <dd className="font-semibold text-slate-700">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <form onSubmit={saveProfile} className="card p-6">
            <h2 className="font-bold text-slate-900">Profile information</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label" htmlFor="p-name">Full name</label>
                <input
                  id="p-name"
                  className="input"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="p-dept">Department</label>
                <input
                  id="p-dept"
                  className="input"
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor="p-year">Year</label>
                <select
                  id="p-year"
                  className="input"
                  value={profile.year}
                  onChange={(e) => setProfile({ ...profile, year: e.target.value })}
                >
                  {['1st Year', '2nd Year', '3rd Year'].map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="p-college">College</label>
                <input
                  id="p-college"
                  className="input"
                  value={profile.college}
                  onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                />
              </div>
            </div>
            <button disabled={busy === 'profile'} className="btn-primary mt-5">
              {busy === 'profile' ? 'Saving...' : 'Save changes'}
            </button>
          </form>

          <form onSubmit={changePassword} className="card p-6">
            <h2 className="font-bold text-slate-900">Change password</h2>
            <p className="mt-1 text-sm text-slate-500">Passwords are stored encrypted using bcrypt.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="p-current">Current password</label>
                <input
                  id="p-current"
                  type="password"
                  className="input"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="p-new">New password</label>
                <input
                  id="p-new"
                  type="password"
                  className="input"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  placeholder="Minimum 8 characters"
                  required
                />
              </div>
            </div>
            <button disabled={busy === 'password'} className="btn-secondary mt-5">
              {busy === 'password' ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
