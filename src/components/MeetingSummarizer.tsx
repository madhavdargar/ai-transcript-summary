import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  FileText,
  CheckCircle,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SummaryResult {
  summary: string[];
  actionItems: string[];
}

const MeetingSummarizer = () => {
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (!transcript.trim()) {
      toast({
        title: "Transcript Required",
        description: "Please paste a meeting transcript to summarize.",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description:
          "Please enter your OpenAI API key to process the transcript.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-5",
            messages: [
              {
                role: "system",
                content:
                  'You are a professional meeting summarizer. Your task is to analyze meeting transcripts and provide concise summaries with clear action items. Return your response in this exact JSON format: {"summary": ["bullet point 1", "bullet point 2", ...], "actionItems": ["action item 1", "action item 2", ...]}. Keep summary points concise and focus on key decisions, important discussions, and outcomes. Action items should be specific and actionable.',
              },
              {
                role: "user",
                content: `Please summarize this meeting transcript into 8-10 key bullet points and extract all action items:\n\n${transcript}`,
              },
            ],
            temperature: 0.3,
            max_tokens: 1000,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to process transcript");
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      try {
        const parsedResult = JSON.parse(content);
        setResult(parsedResult);
        toast({
          title: "Summary Generated",
          description: "Your meeting has been successfully summarized.",
        });
      } catch (parseError) {
        throw new Error("Failed to parse AI response");
      }
    } catch (error) {
      toast({
        title: "Processing Failed",
        description:
          "Failed to process the transcript. Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-business-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-12 w-12 text-business-primary mr-3" />
            <h1 className="text-4xl font-bold bg-business-gradient bg-clip-text text-transparent">
              AI Meeting Summarizer
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your meeting transcripts into concise summaries and
            actionable insights using advanced AI
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid gap-6">
          {/* API Key Input */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-business-primary" />
                API Configuration
              </CardTitle>
              <CardDescription>
                Enter your OpenAI API key to enable AI-powered summarization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full p-3 border border-input rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </CardContent>
          </Card>

          {/* Input Section */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-business-primary" />
                Meeting Transcript
              </CardTitle>
              <CardDescription>
                Paste your meeting transcript below to generate a summary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste your meeting transcript here..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="min-h-[200px] resize-none focus:ring-2 focus:ring-business-primary"
              />
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-muted-foreground">
                  {transcript.length} characters
                </span>
                <Button
                  onClick={handleSummarize}
                  disabled={isProcessing}
                  variant="business"
                  size="lg"
                  className="min-w-[140px]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Summarize
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          {result && (
            <div className="grid gap-6 animate-slide-up">
              {/* Summary */}
              <Card className="shadow-professional">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-business-primary" />
                    Meeting Summary
                  </CardTitle>
                  <CardDescription>
                    Key points and decisions from your meeting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {result.summary.map((point, index) => (
                      <li key={index} className="flex items-start">
                        <div className="h-2 w-2 rounded-full bg-business-primary mt-2 mr-3 flex-shrink-0" />
                        <span className="text-foreground leading-relaxed">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Action Items */}
              <Card className="shadow-professional">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-business-primary" />
                    Action Items
                    <Badge variant="secondary" className="ml-2">
                      {result.actionItems.length}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Follow-up tasks and responsibilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {result.actionItems.length > 0 ? (
                    <ul className="space-y-3">
                      {result.actionItems.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-business-secondary mt-1 mr-3 flex-shrink-0" />
                          <span className="text-foreground leading-relaxed">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No specific action items identified
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingSummarizer;
