'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  X, 
  Trash2, 
  AlertTriangle, 
  Loader2,
  UserX
} from 'lucide-react';

interface BulkDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContacts: Array<{
    id: string;
    fullName: string;
    title: string;
    company: {
      name: string;
    };
  }>;
  onBulkDelete: () => Promise<void>;
}

export default function BulkDeleteModal({ 
  isOpen, 
  onClose, 
  selectedContacts, 
  onBulkDelete 
}: BulkDeleteModalProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  const handleDelete = async () => {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      await onBulkDelete();
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Close modal after brief delay
      setTimeout(() => {
        onClose();
        setProgress(0);
        setConfirmed(false);
      }, 500);
    } catch (error) {
      console.error('Bulk delete failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setConfirmed(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-xl text-destructive">
                    {confirmed ? 'Deleting Contacts' : 'Confirm Deletion'}
                  </CardTitle>
                  <CardDescription>
                    {confirmed 
                      ? `Deleting ${selectedContacts.length} contact${selectedContacts.length > 1 ? 's' : ''}`
                      : `This will permanently delete ${selectedContacts.length} contact${selectedContacts.length > 1 ? 's' : ''}`
                    }
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleCancel} disabled={loading}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {loading && (
              <div className="mb-6 p-4 bg-destructive/10 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Loader2 className="w-5 h-5 animate-spin text-destructive" />
                  <span className="font-medium text-destructive">Deleting contacts...</span>
                </div>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-destructive/80 mt-1">
                  Processing {selectedContacts.length} contacts
                </p>
              </div>
            )}

            {!confirmed && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                  <div>
                    <h3 className="font-medium text-destructive">Warning: This action cannot be undone</h3>
                    <p className="text-sm text-destructive/80 mt-1">
                      Deleting these contacts will permanently remove all their information from the system. 
                      This includes their contact details, company associations, and any related data.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Contacts List */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <UserX className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-foreground">
                  Contacts to be deleted ({selectedContacts.length})
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto border rounded-lg p-4 bg-muted">
                <div className="space-y-2">
                  {selectedContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-2 bg-card rounded border"
                    >
                      <div>
                        <div className="font-medium text-foreground">{contact.fullName}</div>
                        <div className="text-sm text-muted-foreground">{contact.title}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {contact.company.name}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Confirmation Steps */}
            {!confirmed && (
              <div className="mb-6 p-4 border border-border rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Before proceeding, please note:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• All contact information will be permanently lost</li>
                  <li>• Company associations will be removed</li>
                  <li>• This action cannot be reversed</li>
                  <li>• Consider exporting data before deletion if needed</li>
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button variant="outline" onClick={handleCancel} disabled={loading}>
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDelete} 
                disabled={loading}
                className="min-w-[140px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : confirmed ? (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Confirm Delete
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete {selectedContacts.length} Contact{selectedContacts.length > 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 