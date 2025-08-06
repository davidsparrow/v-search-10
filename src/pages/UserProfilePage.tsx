/**
 * User Profile Page
 * Allows users to manage their personal settings including professional mode and timeout preferences
 * @author Eventria Team
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCloudStore } from '../store/cloudStore';

interface UserProfile {
  id: string;
  phone_number: string;
  email?: string;
  nickname?: string;
  professional_mode_always: boolean;
  pref_timeout: number;
  preferred_communication_method: string;
  sms_character_limit: number;
  real_score: number;
  display_score: number;
  social_cred_rating: number;
}

export const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useCloudStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Wait for auth to be initialized
    if (!authLoading) {
      if (!isAuthenticated) {
        // Redirect to home if not authenticated
        navigate('/');
        return;
      }
      loadUserProfile();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setMessage(null);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Loading profile for user:', user.id);

      // Get participant profile
      const { data: participant, error } = await supabase
        .from('participants')
        .select('*')
        .eq('eventria_user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching participant:', error);
        
        // If participant doesn't exist, try to create one
        if (error.code === 'PGRST116') {
          console.log('Participant not found, creating new one...');
          
          const { data: newParticipant, error: createError } = await supabase
            .from('participants')
            .insert({
              eventria_user_id: user.id,
              phone_number: user.phone || 'unknown',
              email: user.email,
              professional_mode_always: false,
              pref_timeout: 300,
              preferred_communication_method: 'sms',
              sms_character_limit: 160,
              real_score: 0,
              display_score: 0,
              social_cred_rating: 0.0
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating participant:', createError);
            throw new Error('Failed to create user profile');
          }

          console.log('Created new participant:', newParticipant);
          
          // Set defaults for new participant
          const profileWithDefaults: UserProfile = {
            ...newParticipant,
            professional_mode_always: newParticipant.professional_mode_always ?? false,
            pref_timeout: newParticipant.pref_timeout ?? 300,
            preferred_communication_method: newParticipant.preferred_communication_method ?? 'sms',
            sms_character_limit: newParticipant.sms_character_limit ?? 160,
            real_score: newParticipant.real_score ?? 0,
            display_score: newParticipant.display_score ?? 0,
            social_cred_rating: newParticipant.social_cred_rating ?? 0
          };

          setProfile(profileWithDefaults);
          return;
        }
        
        throw error;
      }

      console.log('Found existing participant:', participant);

      // Set defaults if values are null
      const profileWithDefaults: UserProfile = {
        ...participant,
        professional_mode_always: participant.professional_mode_always ?? false,
        pref_timeout: participant.pref_timeout ?? 300,
        preferred_communication_method: participant.preferred_communication_method ?? 'sms',
        sms_character_limit: participant.sms_character_limit ?? 160,
        real_score: participant.real_score ?? 0,
        display_score: participant.display_score ?? 0,
        social_cred_rating: participant.social_cred_rating ?? 0
      };

      setProfile(profileWithDefaults);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      setMessage(null);

      const { error } = await supabase
        .from('participants')
        .update({
          professional_mode_always: profile.professional_mode_always,
          pref_timeout: profile.pref_timeout,
          preferred_communication_method: profile.preferred_communication_method,
          sms_character_limit: profile.sms_character_limit,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) {
        throw error;
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'Failed to save profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetTimeout = () => {
    if (profile) {
      setProfile({ ...profile, pref_timeout: 300 });
    }
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">You must be logged in to view your profile</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load profile</p>
          <button 
            onClick={loadUserProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">User Profile Settings</h1>

          {/* Message Display */}
          {message && (
            <div className={`mb-4 p-4 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Profile Information */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.phone_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.email || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nickname</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.nickname || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Social Credit Rating</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.social_cred_rating.toFixed(1)}</p>
                </div>
              </div>
            </div>

            {/* Communication Preferences */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Communication Preferences</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Communication Method
                  </label>
                  <select
                    value={profile.preferred_communication_method}
                    onChange={(e) => setProfile({ ...profile, preferred_communication_method: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sms">SMS</option>
                    <option value="email">Email</option>
                    <option value="both">Both (when available)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMS Character Limit
                  </label>
                  <input
                    type="number"
                    value={profile.sms_character_limit}
                    onChange={(e) => setProfile({ ...profile, sms_character_limit: parseInt(e.target.value) || 160 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="1000"
                  />
                  <p className="mt-1 text-xs text-gray-500">Standard SMS limit is 160 characters</p>
                </div>
              </div>
            </div>

            {/* Professional Mode Settings */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Mode Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="professional_mode"
                    checked={profile.professional_mode_always}
                    onChange={(e) => setProfile({ ...profile, professional_mode_always: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="professional_mode" className="ml-2 block text-sm text-gray-900">
                    Always use Professional Mode
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  When enabled, all messages will be processed in professional mode regardless of context.
                  Admins can override this setting if necessary.
                </p>
              </div>
            </div>

            {/* Timeout Settings */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Response Timeout Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Response Timeout (seconds)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={profile.pref_timeout}
                      onChange={(e) => setProfile({ ...profile, pref_timeout: parseInt(e.target.value) || 300 })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="30"
                      max="3600"
                    />
                    <button
                      onClick={handleResetTimeout}
                      className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Reset to 300
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Default is 300 seconds (5 minutes). This affects how long the system waits for your responses.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="text-sm text-blue-600 font-medium">Real Score</p>
                  <p className="text-2xl font-bold text-blue-900">{profile.real_score}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-md">
                  <p className="text-sm text-green-600 font-medium">Display Score</p>
                  <p className="text-2xl font-bold text-green-900">{profile.display_score}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-md">
                  <p className="text-sm text-purple-600 font-medium">Social Credit</p>
                  <p className="text-2xl font-bold text-purple-900">{profile.social_cred_rating.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 