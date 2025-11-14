import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Copy, Check, Send, MessageCircle, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ChatMessage, ConnectedUser } from '@/hooks/useListenTogether';
import { Label } from '@/components/ui/label';

interface ListenTogetherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateRoom: (nickname: string) => void;
  onJoinRoom: (code: string, nickname: string) => void;
  roomCode: string | null;
  isConnected: boolean;
  connectedUsers: ConnectedUser[];
  onDisconnect: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  userNickname: string | null;
  isHost: boolean;
}

export const ListenTogetherDialog = ({
  open,
  onOpenChange,
  onCreateRoom,
  onJoinRoom,
  roomCode,
  isConnected,
  connectedUsers,
  onDisconnect,
  messages,
  onSendMessage,
  userNickname,
  isHost,
}: ListenTogetherDialogProps) => {
  const [joinCode, setJoinCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [copied, setCopied] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isConnected) {
      toast({
        title: 'Connected!',
        description: 'You are now listening together',
      });
    }
  }, [isConnected, toast]);

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

  const primeAudioPlayback = async () => {
    try {
      const audio = new Audio('/audio/sample.mp3');
      audio.muted = true;
      audio.volume = 0;
      await audio.play();
      setTimeout(() => {
        try { audio.pause(); } catch {}
        // @ts-ignore
        audio.src = '';
      }, 120);
      console.log('[AudioUnlock] Primed audio playback');
    } catch (e) {
      console.warn('[AudioUnlock] Failed to prime audio', e);
    }
  };

  const handleCreate = async () => {
    if (!nickname.trim()) {
      toast({
        title: 'Nickname required',
        description: 'Please enter a nickname',
        variant: 'destructive',
      });
      return;
    }
    toast({ title: 'Preparing audio', description: 'Priming audio for playback...' });
    await primeAudioPlayback();
    onCreateRoom(nickname.trim());
  };

  const handleJoin = async () => {
    if (!nickname.trim()) {
      toast({
        title: 'Nickname required',
        description: 'Please enter a nickname',
        variant: 'destructive',
      });
      return;
    }
    if (joinCode.trim()) {
      toast({
        title: 'Connecting...',
        description: 'Attempting to join the room',
      });
      await primeAudioPlayback();
      onJoinRoom(joinCode.trim(), nickname.trim());
    } else {
      toast({
        title: 'Invalid room code',
        description: 'Please enter a valid room code',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      onSendMessage(chatMessage.trim());
      setChatMessage('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Listen Together
          </DialogTitle>
        </DialogHeader>

        {!isConnected ? (
          <div className="space-y-6">
            {/* Nickname Input */}
            {!roomCode && (
              <div className="space-y-2">
                <Label htmlFor="nickname">Your Nickname</Label>
                <Input
                  id="nickname"
                  placeholder="Enter your nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={20}
                />
              </div>
            )}

            {/* Host Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Host a Session</h3>
              {!roomCode ? (
                <Button onClick={handleCreate} className="w-full" disabled={!nickname.trim()}>
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
            {!roomCode && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Join a Session</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter room code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  />
                  <Button onClick={handleJoin} disabled={!nickname.trim()}>Join</Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 flex-1 flex flex-col">
            <div className="rounded-lg bg-gradient-to-r from-primary/20 to-purple-500/20 p-4 border border-primary/20 animate-fade-in">
              <Users className="w-8 h-8 mx-auto mb-2 text-primary animate-pulse" />
              <p className="text-sm font-medium text-center">Connected as {userNickname}</p>
              
              {/* Connected Users List */}
              {connectedUsers.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-muted-foreground text-center">
                    {isHost ? 'Guests' : 'Host'}:
                  </p>
                  <div className="space-y-1">
                    {connectedUsers.map((user) => (
                      <div 
                        key={user.id} 
                        className="flex items-center gap-2 text-sm p-2 rounded bg-background/50"
                      >
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: user.color }}
                        />
                        <User className="w-3 h-3" />
                        <span className="truncate">{user.nickname}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Chat Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowChat(!showChat)}
              className="w-full"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {showChat ? 'Hide Chat' : 'Show Chat'}
              {messages.length > 0 && !showChat && (
                <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {messages.length}
                </span>
              )}
            </Button>

            {/* Chat Section */}
            {showChat && (
              <div className="flex-1 flex flex-col space-y-2 min-h-[200px] animate-scale-in">
                <ScrollArea className="flex-1 border rounded-lg p-3 bg-background/50">
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No messages yet. Start chatting!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                              msg.isOwn
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p>{msg.message}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!chatMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

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
