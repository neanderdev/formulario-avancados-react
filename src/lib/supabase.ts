import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
    'https://xhmmffhfzyfrimyhnisl.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhobW1mZmhmenlmcmlteWhuaXNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4MTMyOTM1NywiZXhwIjoxOTk2OTA1MzU3fQ.h0scEFwR262if_QpueiO0-bSvVeY36-yabDqGD48F0Q'
);
