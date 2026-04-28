-- Enable RLS on card_reviews
ALTER TABLE public.card_reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own card reviews
CREATE POLICY "Users own card_reviews" ON public.card_reviews FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);