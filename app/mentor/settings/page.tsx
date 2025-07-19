"use client";

import { Settings, Bell, Shield, Globe, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function MentorSettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true
  });

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900">
          Settings
        </h1>
        <p className="text-neutral-600 mt-2">
          Manage your account preferences and security
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Notifications */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="w-5 h-5 text-neutral-600" />
            <h4 className="text-lg font-semibold text-neutral-900">Notifications</h4>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-900">Email Notifications</p>
                <p className="text-sm text-neutral-600">Receive updates via email</p>
              </div>
              <button 
                onClick={() => setNotifications(prev => ({...prev, email: !prev.email}))}
                className={`w-11 h-6 rounded-full transition-colors ${notifications.email ? 'bg-black' : 'bg-neutral-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${notifications.email ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-900">Push Notifications</p>
                <p className="text-sm text-neutral-600">Browser notifications</p>
              </div>
              <button 
                onClick={() => setNotifications(prev => ({...prev, push: !prev.push}))}
                className={`w-11 h-6 rounded-full transition-colors ${notifications.push ? 'bg-black' : 'bg-neutral-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${notifications.push ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-900">SMS Notifications</p>
                <p className="text-sm text-neutral-600">Text message alerts</p>
              </div>
              <button 
                onClick={() => setNotifications(prev => ({...prev, sms: !prev.sms}))}
                className={`w-11 h-6 rounded-full transition-colors ${notifications.sms ? 'bg-black' : 'bg-neutral-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${notifications.sms ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-5 h-5 text-neutral-600" />
            <h4 className="text-lg font-semibold text-neutral-900">Security</h4>
          </div>
          
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Two-Factor Authentication
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Login History
            </Button>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="w-5 h-5 text-neutral-600" />
            <h4 className="text-lg font-semibold text-neutral-900">Preferences</h4>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-neutral-600" />
                <div>
                  <p className="font-medium text-neutral-900">Language</p>
                  <p className="text-sm text-neutral-600">English (US)</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Change
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Moon className="w-5 h-5 text-neutral-600" />
                <div>
                  <p className="font-medium text-neutral-900">Theme</p>
                  <p className="text-sm text-neutral-600">Light mode</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Toggle
              </Button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-red-200">
          <h4 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h4>
          <div className="space-y-4">
            <Button variant="outline" className="w-full border-red-300 text-red-700 hover:bg-red-50">
              Deactivate Account
            </Button>
            <Button variant="outline" className="w-full border-red-300 text-red-700 hover:bg-red-50">
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}