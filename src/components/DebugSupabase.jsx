"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugSupabase() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResults(null);
    
    const tests = [];
    
    try {
      // Test 1: Basic query
      console.log('🔍 Testing basic patients query...');
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .limit(5);
      
      tests.push({
        name: 'Basic Patients Query',
        success: !patientsError,
        data: patientsData,
        error: patientsError,
        details: patientsError ? {
          message: patientsError.message,
          code: patientsError.code,
          details: patientsError.details,
          hint: patientsError.hint
        } : null
      });

      // Test 2: Count query
      console.log('🔍 Testing count query...');
      const { count, error: countError } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });
      
      tests.push({
        name: 'Count Query',
        success: !countError,
        data: { count },
        error: countError,
        details: countError ? {
          message: countError.message,
          code: countError.code,
          details: countError.details,
          hint: countError.hint
        } : null
      });

      // Test 3: Simple select with columns
      console.log('🔍 Testing specific columns...');
      const { data: simpleData, error: simpleError } = await supabase
        .from('patients')
        .select('id, first_name, last_name')
        .limit(3);
      
      tests.push({
        name: 'Specific Columns',
        success: !simpleError,
        data: simpleData,
        error: simpleError,
        details: simpleError ? {
          message: simpleError.message,
          code: simpleError.code,
          details: simpleError.details,
          hint: simpleError.hint
        } : null
      });

      // Test 4: Check user permissions
      console.log('🔍 Testing user info...');
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      tests.push({
        name: 'User Authentication',
        success: !userError,
        data: userData,
        error: userError,
        details: userError ? {
          message: userError.message,
          code: userError.code
        } : null
      });

    } catch (error) {
      tests.push({
        name: 'Unexpected Error',
        success: false,
        error: error,
        details: {
          message: error.message,
          stack: error.stack
        }
      });
    }
    
    setResults(tests);
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Supabase Debug Panel</CardTitle>
        <Button onClick={testConnection} disabled={loading}>
          {loading ? 'Testing...' : 'Run Tests'}
        </Button>
      </CardHeader>
      <CardContent>
        {results && (
          <div className="space-y-4">
            {results.map((test, index) => (
              <div key={index} className={`p-4 rounded-lg ${test.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-sm px-2 py-1 rounded ${test.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {test.success ? '✅ PASS' : '❌ FAIL'}
                  </span>
                  <h3 className="font-semibold">{test.name}</h3>
                </div>
                
                {test.error && (
                  <div className="mb-2">
                    <h4 className="font-medium text-red-700">Error:</h4>
                    <pre className="text-sm bg-red-100 p-2 rounded overflow-auto">
                      {JSON.stringify(test.details, null, 2)}
                    </pre>
                  </div>
                )}
                
                {test.data && (
                  <div>
                    <h4 className="font-medium text-green-700">Data:</h4>
                    <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {!results && !loading && (
          <p className="text-gray-500">Click "Run Tests" to debug your Supabase connection.</p>
        )}
      </CardContent>
    </Card>
  );
}