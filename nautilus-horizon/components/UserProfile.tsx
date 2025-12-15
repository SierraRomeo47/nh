// User Profile Management Component

import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { UserRole } from '../contexts/UserContext';
import Card from './Card';
import LoadingSpinner from './LoadingSpinner';

const UserProfile: React.FC = () => {
  const { user, switchUserRole } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    position: user?.position || '',
    rank: user?.rank || '',
    language: user?.language || 'en',
    timezone: user?.timezone || 'UTC',
    theme: user?.theme || 'dark'
  });

  if (!user) {
    return <LoadingSpinner text="Loading profile..." />;
  }

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      position: user.position || '',
      rank: user.rank || '',
      language: user.language,
      timezone: user.timezone,
      theme: user.theme
    });
    setIsEditing(false);
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case UserRole.CREW: return 'Crew Member';
      case UserRole.OFFICER: return 'Deck Officer';
      case UserRole.ENGINEER: return 'Marine Engineer';
      case UserRole.CAPTAIN: return 'Captain';
      case UserRole.CHIEF_ENGINEER: return 'Chief Engineer';
      case UserRole.MANAGER: return 'Fleet Manager';
      case UserRole.COMPLIANCE_OFFICER: return 'Compliance Officer';
      case UserRole.TRADER: return 'Emissions Trader';
      case UserRole.TECHNICAL_SUPERINTENDENT: return 'Tech Superintendent';
      case UserRole.OPERATIONS_SUPERINTENDENT: return 'Ops Superintendent';
      case UserRole.PORT_CAPTAIN: return 'Port Captain';
      case UserRole.FLEET_SUPERINTENDENT: return 'Fleet Superintendent';
      case UserRole.INSURER: return 'Maritime Insurer';
      case UserRole.MTO: return 'Multimodal Transport Operator';
      case UserRole.CHARTERER: return 'Charterer';
      case UserRole.BROKER: return 'Ship Broker';
      case UserRole.ADMIN: return 'Administrator';
      default: return 'Marine Professional';
    }
  };

  const getDepartmentDisplayName = (department: UserDepartment) => {
    switch (department) {
      case UserDepartment.DECK: return 'Deck';
      case UserDepartment.ENGINE: return 'Engine';
      case UserDepartment.GALLEY: return 'Galley';
      case UserDepartment.MANAGEMENT: return 'Management';
      case UserDepartment.COMPLIANCE: return 'Compliance';
      case UserDepartment.TRADING: return 'Trading';
      case UserDepartment.IT: return 'IT';
      case UserDepartment.HR: return 'HR';
      default: return department;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">User Profile</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-xl font-semibold text-text-primary mb-6">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <div className="px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary">
                    {user.firstName}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <div className="px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary">
                    {user.lastName}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Email
                </label>
                <div className="px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary">
                  {user.email}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <div className="px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary">
                    {user.phoneNumber || 'Not provided'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Position
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <div className="px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary">
                    {user.position || 'Not specified'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Rank
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                    className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <div className="px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary">
                    {user.rank || 'Not specified'}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Profile Summary */}
        <div>
          <Card>
            <div className="text-center mb-6">
              <img
                src={user.avatar || `https://picsum.photos/seed/${user.id}/120/120`}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold text-text-primary">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-text-secondary">{getRoleDisplayName(user.role)}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Department
                </label>
                <div className="text-text-primary">
                  {getDepartmentDisplayName(user.department)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Organization
                </label>
                <div className="text-text-primary">
                  Poseidon Shipping
                </div>
              </div>

              {user.shipId && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Assigned Ship
                  </label>
                  <div className="text-text-primary">
                    {user.shipId}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Member Since
                </label>
                <div className="text-text-primary">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Last Login
                </label>
                <div className="text-text-primary">
                  {user.lastLoginAt 
                    ? new Date(user.lastLoginAt).toLocaleDateString()
                    : 'Never'
                  }
                </div>
              </div>
            </div>
          </Card>

          {/* Preferences */}
          <Card className="mt-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Preferences</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Language
                </label>
                {isEditing ? (
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                ) : (
                  <div className="px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary">
                    {formData.language === 'en' ? 'English' : formData.language}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Timezone
                </label>
                {isEditing ? (
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Berlin">Berlin</option>
                  </select>
                ) : (
                  <div className="px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary">
                    {formData.timezone}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Theme
                </label>
                {isEditing ? (
                  <select
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value as 'light' | 'dark' | 'auto' })}
                    className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="auto">Auto</option>
                  </select>
                ) : (
                  <div className="px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary">
                    {formData.theme.charAt(0).toUpperCase() + formData.theme.slice(1)}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
