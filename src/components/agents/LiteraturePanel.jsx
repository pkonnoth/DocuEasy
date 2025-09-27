"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import { 
  BookOpen, 
  ExternalLink, 
  Calendar,
  Users,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Star
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

import { mockLiteratureResults } from '@/data/mockData';

export default function LiteraturePanel({ 
  patientId, 
  isVisible = false, 
  onClose 
}) {
  const [expandedStudy, setExpandedStudy] = useState(null);

  if (!isVisible) return null;

  const toggleExpanded = (studyId) => {
    setExpandedStudy(expandedStudy === studyId ? null : studyId);
  };

  const getRelevanceColor = (score) => {
    if (score >= 90) return 'text-[var(--medical-green)]';
    if (score >= 80) return 'text-[var(--warning)]';
    return 'text-muted-foreground';
  };

  return (
    <div className="fixed right-0 top-14 h-[calc(100vh-3.5rem)] w-96 bg-background border-l border-border/40 shadow-lg z-40">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b border-border/40 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-[var(--medical-blue)]" />
              <h3 className="font-semibold">Relevant Literature</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            AI-curated studies based on patient condition
          </p>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {mockLiteratureResults.map((study) => (
              <Card key={study.id} className="border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-sm leading-tight mb-2">
                        {study.title}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {study.authors.slice(0, 3).join(', ')}
                        {study.authors.length > 3 && ` +${study.authors.length - 3} more`}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      <Star className={`h-3 w-3 ${getRelevanceColor(study.relevanceScore)}`} />
                      <span className={`text-xs font-medium ${getRelevanceColor(study.relevanceScore)}`}>
                        {study.relevanceScore}%
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Journal & Date */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium">{study.journal}</span>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(study.publishedDate), 'MMM yyyy')}</span>
                      </div>
                    </div>

                    {/* Keywords */}
                    <div className="flex flex-wrap gap-1">
                      {study.keywords.slice(0, 3).map((keyword) => (
                        <Badge key={keyword} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {study.keywords.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{study.keywords.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Abstract (Expandable) */}
                    <div>
                      <button
                        onClick={() => toggleExpanded(study.id)}
                        className="flex items-center justify-between w-full text-left text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <span>Abstract</span>
                        {expandedStudy === study.id ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>

                      {expandedStudy === study.id && (
                        <div className="mt-2 p-3 bg-muted/30 rounded text-xs leading-relaxed">
                          {study.abstract}
                        </div>
                      )}
                    </div>

                    {/* DOI Link */}
                    {study.doi && (
                      <div className="pt-2 border-t border-border/30">
                        <a 
                          href={`https://doi.org/${study.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-xs text-[var(--medical-blue)] hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>View Full Text</span>
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Attribution */}
          <div className="mt-6 p-3 bg-[var(--agent-card)] rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="h-4 w-4 text-[var(--medical-blue)]" />
              <span className="text-sm font-medium">AI Powered Search</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Results are automatically ranked by relevance to patient condition and recent encounters.
            </p>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}