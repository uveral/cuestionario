import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service_role key
    const supabaseClient = createClient(
      Deno.env.get('CUSTOM_SUPABASE_URL') ?? '',
      Deno.env.get('CUSTOM_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch all data from the 'respuestas' table
    const { data, error } = await supabaseClient
        .from('respuestas')
        .select('respuestas_completas');

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
        return new Response("No hay datos para exportar.", {
            headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
            status: 404,
        });
    }

    // --- CSV Generation Logic ---
    let allKeys = new Set<string>();
    let flattenedData: Record<string, any>[] = [];

    data.forEach(row => {
        if (row.respuestas_completas) {
            let flatRow: Record<string, any> = {};
            for (const key in row.respuestas_completas) {
                if (Object.hasOwnProperty.call(row.respuestas_completas, key)) {
                    const value = row.respuestas_completas[key];
                    if (Array.isArray(value)) {
                        flatRow[key] = value.join('; ');
                    } else if (value === null) {
                        flatRow[key] = '';
                    } else {
                        flatRow[key] = String(value);
                    }
                    allKeys.add(key);
                }
            }
            flattenedData.push(flatRow);
        }
    });

    const headers = Array.from(allKeys).sort();
    let csv = headers.map(header => `"${header.replace(/"/g, '""')}"`).join(',') + '\n';

    flattenedData.forEach(row => {
        const rowValues = headers.map(header => {
            const value = row[header] !== undefined ? row[header] : '';
            return `"${String(value).replace(/"/g, '""')}"`;
        });
        csv += rowValues.join(',') + '\n';
    });

    return new Response(csv, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="cuestionario_respuestas.csv"'
      },
      status: 200,
    });
  } catch (err) {
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
