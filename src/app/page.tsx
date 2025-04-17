'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {indexWebsiteContent} from '@/ai/flows/index-website-content';
import {answerQuestionsFromWebsite} from '@/ai/flows/answer-questions-from-website';
import {useToast} from '@/hooks/use-toast';

export default function Home() {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const {toast} = useToast();

  const handleIndexWebsite = async () => {
    setLoading(true);
    try {
      const result = await indexWebsiteContent({websiteUrl});
      if (result.success) {
        toast({
          title: 'Website Indexed',
          description: result.message,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to index website: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSubmit = async () => {
    setLoading(true);
    try {
      const result = await answerQuestionsFromWebsite({websiteUrl, question});
      setAnswer(result.answer);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to get answer: ${error.message}`,
      });
      setAnswer('Error answering question.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 space-y-4">
      <h1 className="text-2xl font-bold">SiteSage AI</h1>

      <Input
        type="url"
        placeholder="Enter Website URL"
        className="w-full max-w-md"
        value={websiteUrl}
        onChange={e => setWebsiteUrl(e.target.value)}
      />

      <Button
        onClick={handleIndexWebsite}
        disabled={loading}
        className="w-full max-w-md bg-primary text-primary-foreground hover:bg-primary/80"
      >
        {loading ? 'Indexing...' : 'Index Website'}
      </Button>

      <Textarea
        placeholder="Enter your question"
        className="w-full max-w-md"
        value={question}
        onChange={e => setQuestion(e.target.value)}
      />

      <Button
        onClick={handleQuestionSubmit}
        disabled={loading}
        className="w-full max-w-md bg-primary text-primary-foreground hover:bg-primary/80"
      >
        {loading ? 'Loading...' : 'Get Answer'}
      </Button>

      {answer && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Answer</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{answer}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
