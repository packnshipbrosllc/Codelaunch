import React from 'react';
import { ArrowRight, Settings, Palette, Database, Shield, CreditCard } from 'lucide-react';
import { AppData, Config } from '@/types';

interface ConfigStageProps {
  config: Config;
  setConfig: (config: Config) => void;
  appData: AppData;
  onContinue: () => void;
}

export default function ConfigStage({ config, setConfig, appData, onContinue }: ConfigStageProps) {
  const colors = [
    { name: 'Blue', value: '#3b82f6', class: 'bg-blue-500' },
    { name: 'Purple', value: '#8b5cf6', class: 'bg-purple-500' },
    { name: 'Green', value: '#10b981', class: 'bg-green-500' },
    { name: 'Red', value: '#ef4444', class: 'bg-red-500' },
    { name: 'Orange', value: '#f97316', class: 'bg-orange-500' },
    { name: 'Pink', value: '#ec4899', class: 'bg-pink-500' }
  ];

  const databases = ['PostgreSQL', 'MySQL', 'MongoDB', 'Supabase', 'Firebase'];
  const authProviders = ['Google', 'GitHub', 'Email', 'Apple', 'Discord'];
  const paymentProviders = ['Stripe', 'PayPal', 'Square', 'Razorpay'];

  const updateConfig = (key: keyof Config, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  const updateFeature = (feature: keyof Config['features'], value: boolean) => {
    setConfig({
      ...config,
      features: { ...config.features, [feature]: value }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <Settings className="w-16 h-16 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Configure Your App
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Customize {appData.name} with your preferred settings and features
          </p>
        </div>

        {/* Configuration Sections */}
        <div className="space-y-8 mb-8">
          {/* App Name */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">App Name</h3>
            <input
              type="text"
              value={config.appName}
              onChange={(e) => updateConfig('appName', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your app name"
            />
          </div>

          {/* Primary Color */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-400" />
              Primary Color
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateConfig('primaryColor', color.value)}
                  className={`w-12 h-12 rounded-lg ${color.class} ${
                    config.primaryColor === color.value ? 'ring-2 ring-white' : ''
                  } hover:scale-110 transition-transform`}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Database */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-green-400" />
              Database
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {databases.map((db) => (
                <button
                  key={db}
                  onClick={() => updateConfig('database', db)}
                  className={`p-3 rounded-lg text-sm font-semibold transition-all ${
                    config.database === db
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {db}
                </button>
              ))}
            </div>
          </div>

          {/* Auth Providers */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              Authentication Providers
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {authProviders.map((provider) => (
                <button
                  key={provider}
                  onClick={() => {
                    const newProviders = config.authProviders.includes(provider)
                      ? config.authProviders.filter(p => p !== provider)
                      : [...config.authProviders, provider];
                    updateConfig('authProviders', newProviders);
                  }}
                  className={`p-3 rounded-lg text-sm font-semibold transition-all ${
                    config.authProviders.includes(provider)
                      ? 'bg-green-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {provider}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Provider */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-yellow-400" />
              Payment Provider
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {paymentProviders.map((provider) => (
                <button
                  key={provider}
                  onClick={() => updateConfig('paymentProvider', provider)}
                  className={`p-3 rounded-lg text-sm font-semibold transition-all ${
                    config.paymentProvider === provider
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {provider}
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(config.features).map(([feature, enabled]) => (
                <label key={feature} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => updateFeature(feature as keyof Config['features'], e.target.checked)}
                    className="w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-300 capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={onContinue}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 flex items-center gap-3 mx-auto"
          >
            Generate Your App
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
