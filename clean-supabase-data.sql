-- Clean existing data in Supabase (remove leading '=' from all fields)

-- Clean session_id
UPDATE public.image_generations 
SET session_id = REGEXP_REPLACE(session_id, '^=', '')
WHERE session_id LIKE '=%';

-- Clean folder_id
UPDATE public.image_generations 
SET folder_id = REGEXP_REPLACE(folder_id, '^=', '')
WHERE folder_id LIKE '=%';

-- Clean folder_url
UPDATE public.image_generations 
SET folder_url = REGEXP_REPLACE(folder_url, '^=', '')
WHERE folder_url LIKE '=%';

-- Clean reference_image_url
UPDATE public.image_generations 
SET reference_image_url = REGEXP_REPLACE(reference_image_url, '^=', '')
WHERE reference_image_url LIKE '=%';

-- Verify the changes
SELECT 
  session_id,
  folder_id,
  LEFT(folder_url, 50) as folder_url_preview,
  generated_count,
  total_images,
  status
FROM public.image_generations
ORDER BY created_at DESC
LIMIT 10;
