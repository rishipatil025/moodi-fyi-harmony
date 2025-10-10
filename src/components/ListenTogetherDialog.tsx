import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ListenTogetherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  roomCode: string | null;
  isConnected: boolean;
  connectedUser: string | null;
  onDisconnect: () => void;
}

export const ListenTogetherDialog = ({
  open,
  onOpenChange,
  onCreateRoom,
  onJoinRoom,
  roomCode,
  isConnected,
  connectedUser,
  onDisconnect,
}: ListenTogetherDialogProps) => {
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Room code copied!',
        description: 'Share this code with your friend',
      });
    }
  };

  const handleJoin = () => {
    if (joinCode.trim()) {
      onJoinRoom(joinCode.trim());
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Listen Together
          </DialogTitle>
        </DialogHeader>

        {!isConnected ? (
          <div className="space-y-6">
            {/* Host Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Host a Session</h3>
              {!roomCode ? (
                <Button onClick={onCreateRoom} className="w-full">
                  Create Room
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Share this code with your friend:
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={roomCode}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleCopyCode}
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Waiting for connection...
                  </p>
                </div>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            {/* Join Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Join a Session</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter room code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                />
                <Button onClick={handleJoin}>Join</Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Connected!</p>
              <p className="text-xs text-muted-foreground mt-1">
                Listening with: {connectedUser?.substring(0, 8)}...
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={onDisconnect}
              className="w-full"
            >
              Disconnect
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
