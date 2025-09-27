"use client";

import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useAuth } from '@/contexts/AuthContext';
import { AuditLogger } from '@/utils/auditLogger';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Sign in with Supabase
      const result = await signIn(email, password);
      
      if (result.error) {
        setError(result.error.message);
        
        // Log failed login attempt
        await AuditLogger.log({
          action: 'user_login_failed',
          toolName: 'LoginForm',
          inputArguments: { 
            email: AuditLogger.hashPII(email),
            error_type: 'authentication_failed'
          },
          resultStatus: 'failure',
          resultErrorMessage: result.error.message,
          completedAt: new Date()
        });
        
        return;
      }

      // Get user role from profile
      const userRole = result.user?.user_metadata?.role || 'unknown';
      
      // Log successful login
      await AuditLogger.logUserLogin(email, userRole);
      
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[var(--medical-blue)] flex items-center justify-center">
            <LogIn className="h-8 w-8 mr-2" />
            EMR System Login
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Sign in to access your medical records system
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[var(--medical-blue)] hover:bg-[var(--medical-blue)]/90"
              disabled={loading || !email || !password}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Demo Accounts:
            </p>
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <p>Admin: admin@emr.com / admin123</p>
              <p>Clinician: clinician@emr.com / clinician123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}