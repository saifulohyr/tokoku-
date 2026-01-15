-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations (since auth is handled by NestJS)
-- For service role access (backend uses service_role key)

-- Users table
CREATE POLICY "Allow service role full access to users" ON public.users
  FOR ALL USING (true) WITH CHECK (true);

-- Products table  
CREATE POLICY "Allow service role full access to products" ON public.products
  FOR ALL USING (true) WITH CHECK (true);

-- Orders table
CREATE POLICY "Allow service role full access to orders" ON public.orders
  FOR ALL USING (true) WITH CHECK (true);

-- Order Items table
CREATE POLICY "Allow service role full access to order_items" ON public.order_items
  FOR ALL USING (true) WITH CHECK (true);
