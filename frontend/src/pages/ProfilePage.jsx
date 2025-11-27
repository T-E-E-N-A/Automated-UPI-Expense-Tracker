import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import api from '../services/api';
import BudgetSettings from '../components/BudgetSettings';

const ProfilePage = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    profileImage: ''
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const profile = await api.getProfile(user);
        setForm({
          name: profile.name || '',
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          phoneNumber: profile.phoneNumber || '',
          profileImage: profile.profileImage || ''
        });
      } catch (e) {
        setError(e.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
  }, [user]);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      setSaving(true);
      const updated = await api.updateProfile({
        name: form.name,
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phoneNumber,
        profileImage: form.profileImage
      }, user);
      setSuccess('Profile updated successfully');
      setForm({
        name: updated.name || '',
        firstName: updated.firstName || '',
        lastName: updated.lastName || '',
        email: updated.email || '',
        phoneNumber: updated.phoneNumber || '',
        profileImage: updated.profileImage || ''
      });
    } catch (e) {
      setError(e.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">My Profile</h1>

      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
      {success && <div className="mb-4 text-sm text-green-600">{success}</div>}

      <form onSubmit={onSave} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
              {form.profileImage ? (
                <img src={form.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-4xl">👤</span>
              )}
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL</label>
            <input
              type="url"
              name="profileImage"
              value={form.profileImage}
              onChange={onChange}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Paste an image URL. File upload can be added later.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={onChange}
              placeholder="e.g. +91 98765 43210"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      <BudgetSettings />
    </div>
  );
};

export default ProfilePage;


