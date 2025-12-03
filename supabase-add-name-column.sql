-- Add name column to image_generations table
ALTER TABLE public.image_generations 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.image_generations.name IS 'User-editable name for the generation session';

-- Set default names for existing records
-- Try to extract filename from reference_image_url, otherwise use timestamp
UPDATE public.image_generations 
SET name = COALESCE(
  -- Try to extract filename from reference_image_url if it exists
  CASE 
    WHEN reference_image_url IS NOT NULL 
    THEN regexp_replace(
      split_part(reference_image_url, '/', -1),  -- Get last part of URL
      '\.[^.]*$',  -- Remove file extension
      ''
    )
    ELSE NULL
  END,
  -- Fallback to timestamp-based name
  'Generation ' || TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI')
)
WHERE name IS NULL;
