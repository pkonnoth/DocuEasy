"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import { 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Clock, 
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AgentSummaryCard({ 
  summary, 
  onConfirm, 
  onReject, 
  timestamp,
  isLoading = false 
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <Card className="bg-[var(--agent-card)] border-[var(--medical-blue)]/30">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-[var(--medical-blue)] border-t-transparent" />
            <div>
              <p className="font-medium">AI is analyzing patient data...</p>
              <p className="text-sm text-muted-foreground">This may take a few moments</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null;

  return (
    <Card className="bg-[var(--agent-card)] border-[var(--medical-blue)]/30 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--medical-blue)] text-[var(--medical-blue-foreground)]">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Summary Generated</CardTitle>
              <CardDescription className="flex items-center space-x-2">
                <Clock className="h-3 w-3" />
                <span>{format(new Date(timestamp), 'MMM d, yyyy at h:mm a')}</span>
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="bg-[var(--medical-blue)]/10 text-[var(--medical-blue)]">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Generated
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Summary */}
        <div className="rounded-lg bg-background/50 p-4">
          <h4 className="font-medium mb-2">Summary</h4>
          <p className="text-sm leading-relaxed">{summary.summary}</p>
        </div>

        {/* Key Points */}
        {summary.keyPoints && summary.keyPoints.length > 0 && (
          <div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between w-full text-left"
            >
              <h4 className="font-medium">Key Points ({summary.keyPoints.length})</h4>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            
            {isExpanded && (
              <div className="mt-3 space-y-2">
                {summary.keyPoints.map((point, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="h-2 w-2 rounded-full bg-[var(--medical-blue)] mt-2 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">{point}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            AI-generated content requires human review and confirmation before use.
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onReject}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4 mr-2" />
            Reject
          </Button>
          <Button 
            size="sm"
            onClick={onConfirm}
            className="bg-[var(--medical-green)] hover:bg-[var(--medical-green)]/90 text-[var(--medical-green-foreground)]"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Confirm & Use
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}