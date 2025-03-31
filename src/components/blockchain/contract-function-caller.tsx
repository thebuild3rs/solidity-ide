import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import type { ABIFunction } from '@/lib/types';

interface ContractFunctionCallerProps {
  function: ABIFunction;
  onCall: (args: any[]) => Promise<any>;
}

export function ContractFunctionCaller({ function: func, onCall }: ContractFunctionCallerProps) {
  const [args, setArgs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formattedArgs = func.inputs.map((input) => args[input.name]);
      const response = await onCall(formattedArgs);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      {func.inputs.map((input) => (
        <div key={input.name}>
          <Label>
            {input.name} ({input.type})
          </Label>
          <Input
            value={args[input.name] || ''}
            onChange={(e) => setArgs({ ...args, [input.name]: e.target.value })}
            placeholder={`Enter ${input.type}`}
          />
        </div>
      ))}

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Call {func.name}
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result !== null && (
        <div className="mt-4">
          <Label>Result:</Label>
          <pre className="mt-2 p-2 bg-muted rounded-md text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </form>
  );
}