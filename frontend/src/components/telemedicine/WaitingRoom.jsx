import Card from '../ui/Card';
import Button from '../ui/Button';
import { Video } from 'lucide-react';

export default function WaitingRoom({ message, appointmentId, onBack }) {
  return (
    <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center">
              <Video size={32} className="text-primary-600" />
            </div>
            <div className="absolute -bottom-1 -right-1 flex gap-0.5">
              <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
              <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </div>
        <h2 className="text-lg font-semibold font-heading text-slate-800 mb-2">
          {message || 'Waiting for the session to start...'}
        </h2>
        {appointmentId && (
          <p className="text-sm text-slate-500 mb-6">Appointment <span className="font-mono">#{appointmentId}</span></p>
        )}
        <Button variant="outline" onClick={onBack}>Go Back</Button>
      </Card>
    </div>
  );
}
