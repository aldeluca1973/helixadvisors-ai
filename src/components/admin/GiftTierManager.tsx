import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export function GiftTierManager() {
  const [email, setEmail] = useState('');
  const [tierLevel, setTierLevel] = useState('professional');
  const [duration, setDuration] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('admin-grant-access', {
        body: {
          email,
          tierLevel,
          durationDays: duration
        }
      });

      if (error) throw error;

      toast({
        title: 'Success!',
        description: `Granted ${tierLevel} access to ${email} for ${duration} days.`,
      });

      // Reset form
      setEmail('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to grant access',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h3 className="text-xl font-bold text-white mb-4">Grant Tier Access</h3>
      <p className="text-gray-400 mb-4">
        Provide complimentary tier access to users for a specified duration.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            User Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            placeholder="user@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Tier Level
          </label>
          <select
            value={tierLevel}
            onChange={(e) => setTierLevel(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
          >
            <option value="founder">Founder Tier</option>
            <option value="investor">Investor Tier</option>
            <option value="professional">Professional Tier</option>
            <option value="enterprise">Enterprise Tier</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Duration (Days)
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            min="1"
            max="365"
            required
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Processing...' : 'Grant Access'}
        </Button>
      </form>
    </div>
  );
}