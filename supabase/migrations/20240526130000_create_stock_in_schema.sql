-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables in reverse order of dependencies
DROP TABLE IF EXISTS batch_items CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS stock_in_details CASCADE;
DROP TABLE IF EXISTS processed_batches CASCADE;
DROP TABLE IF EXISTS stock_in CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS warehouse_locations CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;

-- Create warehouses table
CREATE TABLE public.warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    address TEXT,
    contact_person TEXT,
    contact_phone TEXT,
    is_active BOOLEAN DEFAULT true,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create warehouse_locations table
CREATE TABLE public.warehouse_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_warehouse_location_code UNIQUE (warehouse_id, code)
);

-- Create products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT UNIQUE,
    barcode TEXT UNIQUE,
    category TEXT,
    unit_of_measure TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create stock_in table
CREATE TABLE public.stock_in (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number TEXT UNIQUE,
    status TEXT NOT NULL,
    notes TEXT,
    product_id UUID NOT NULL REFERENCES public.products(id),
    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id),
    batch_id UUID,
    quantity INTEGER NOT NULL,
    received_quantity INTEGER DEFAULT 0,
    created_by UUID,
    submitted_by UUID,
    processed_by UUID,
    submitted_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create processed_batches table
CREATE TABLE public.processed_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_number TEXT NOT NULL,
    product_id UUID NOT NULL REFERENCES public.products(id),
    quantity_processed INTEGER NOT NULL,
    status TEXT NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    processed_by UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_batch_number UNIQUE (batch_number)
);

-- Create stock_in_details table
CREATE TABLE public.stock_in_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stock_in_id UUID NOT NULL REFERENCES public.stock_in(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    batch_number TEXT,
    quantity INTEGER NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    barcode TEXT,
    color TEXT,
    size TEXT,
    warehouse_id UUID REFERENCES public.warehouses(id),
    location_id UUID REFERENCES public.warehouse_locations(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create inventory table
CREATE TABLE public.inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id),
    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id),
    location_id UUID REFERENCES public.warehouse_locations(id),
    batch_id UUID,
    stock_in_id UUID REFERENCES public.stock_in(id),
    stock_in_detail_id UUID REFERENCES public.stock_in_details(id),
    barcode TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    last_updated_by UUID,
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_inventory_item UNIQUE (product_id, warehouse_id, location_id, batch_id)
);

-- Create batch_items table
CREATE TABLE public.batch_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES public.processed_batches(id) ON DELETE CASCADE,
    barcode TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    color TEXT,
    size TEXT,
    warehouse_id UUID REFERENCES public.warehouses(id),
    location_id UUID REFERENCES public.warehouse_locations(id),
    status TEXT DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_inventory_barcode ON public.inventory(barcode);
CREATE INDEX idx_inventory_product ON public.inventory(product_id);
CREATE INDEX idx_inventory_warehouse ON public.inventory(warehouse_id);
CREATE INDEX idx_inventory_location ON public.inventory(location_id);

CREATE INDEX idx_processed_batches_batch ON public.processed_batches(batch_number);
CREATE INDEX idx_processed_batches_product ON public.processed_batches(product_id);

CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_barcode ON public.products(barcode);
CREATE INDEX idx_products_category ON public.products(category);

CREATE INDEX idx_stock_in_status ON public.stock_in(status);
CREATE INDEX idx_stock_in_created_at ON public.stock_in(created_at);
CREATE INDEX idx_stock_in_warehouse ON public.stock_in(warehouse_id);
CREATE INDEX idx_stock_in_batch_id ON public.stock_in(batch_id);

CREATE INDEX idx_stock_in_details_status ON public.stock_in_details(status);
CREATE INDEX idx_stock_in_details_batch_num ON public.stock_in_details(batch_number);

CREATE INDEX idx_locations_warehouse_id ON public.warehouse_locations(warehouse_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW; 
END;
$$ language 'plpgsql';

CREATE TRIGGER update_warehouses_modtime
BEFORE UPDATE ON public.warehouses
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_warehouse_locations_modtime
BEFORE UPDATE ON public.warehouse_locations
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_products_modtime
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_stock_in_modtime
BEFORE UPDATE ON public.stock_in
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_processed_batches_modtime
BEFORE UPDATE ON public.processed_batches
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_stock_in_details_modtime
BEFORE UPDATE ON public.stock_in_details
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_inventory_modtime
BEFORE UPDATE ON public.inventory
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_batch_items_modtime
BEFORE UPDATE ON public.batch_items
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Add comments to tables and columns
COMMENT ON TABLE public.warehouses IS 'Stores warehouse information';
COMMENT ON TABLE public.warehouse_locations IS 'Stores specific locations within warehouses';
COMMENT ON TABLE public.products IS 'Stores product information';
COMMENT ON TABLE public.stock_in IS 'Tracks stock in requests';
COMMENT ON TABLE public.processed_batches IS 'Tracks processed batches of inventory';
COMMENT ON TABLE public.stock_in_details IS 'Detailed information about stock in items';
COMMENT ON TABLE public.inventory IS 'Tracks current inventory levels';
COMMENT ON TABLE public.batch_items IS 'Tracks individual items within a batch';

-- Function to generate batch numbers
CREATE OR REPLACE FUNCTION public.generate_batch_number()
RETURNS TEXT AS $$
DECLARE
    batch_number TEXT;
    batch_count INTEGER;
BEGIN
    LOOP
        batch_number := 'BATCH-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-' || 
                      lpad(floor(random() * 10000)::TEXT, 4, '0');
        
        SELECT COUNT(*) INTO batch_count 
        FROM public.processed_batches 
        WHERE batch_number = batch_number;
        
        EXIT WHEN batch_count = 0;
    END LOOP;
    
    RETURN batch_number;
END;
$$ LANGUAGE plpgsql;

-- Set default batch number
ALTER TABLE public.processed_batches 
ALTER COLUMN batch_number 
SET DEFAULT public.generate_batch_number();

-- Function to update inventory on stock in
CREATE OR REPLACE FUNCTION public.update_inventory_on_stock_in()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert inventory record
    INSERT INTO public.inventory (
        product_id, 
        warehouse_id, 
        location_id, 
        batch_id, 
        stock_in_id, 
        stock_in_detail_id,
        barcode,
        quantity,
        last_updated_by
    )
    VALUES (
        NEW.product_id,
        (SELECT warehouse_id FROM public.stock_in WHERE id = NEW.stock_in_id),
        NEW.location_id,
        (SELECT batch_id FROM public.stock_in WHERE id = NEW.stock_in_id),
        NEW.stock_in_id,
        NEW.id,
        NEW.barcode,
        NEW.quantity,
        (SELECT processed_by FROM public.stock_in WHERE id = NEW.stock_in_id)
    )
    ON CONFLICT (product_id, warehouse_id, COALESCE(location_id, '00000000-0000-0000-0000-000000000000'), COALESCE(batch_id, '00000000-0000-0000-0000-000000000000'))
    DO UPDATE SET
        quantity = inventory.quantity + EXCLUDED.quantity,
        last_updated_by = EXCLUDED.last_updated_by,
        last_updated_at = NOW(),
        updated_at = NOW();
    
    -- Update stock_in received_quantity
    UPDATE public.stock_in
    SET received_quantity = (
        SELECT COALESCE(SUM(quantity), 0)
        FROM public.stock_in_details
        WHERE stock_in_id = NEW.stock_in_id
    )
    WHERE id = NEW.stock_in_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating inventory on stock in
CREATE TRIGGER trigger_update_inventory_on_stock_in
AFTER INSERT OR UPDATE ON public.stock_in_details
FOR EACH ROW
WHEN (NEW.status = 'processed')
EXECUTE FUNCTION public.update_inventory_on_stock_in();

-- Function to generate barcodes for batch items
CREATE OR REPLACE FUNCTION public.generate_batch_item_barcode(batch_number TEXT, item_number INTEGER)
RETURNS TEXT AS $$
BEGIN
    RETURN batch_number || '-' || lpad(item_number::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_in ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processed_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_in_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_items ENABLE ROW LEVEL SECURITY;

-- Create policy functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND raw_user_meta_data->>'role' = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_warehouse_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND (raw_user_meta_data->>'role' = 'warehouse_staff' OR raw_user_meta_data->>'role' = 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Warehouse policies
CREATE POLICY "Enable read access for all users" ON public.warehouses
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.warehouses
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for warehouse staff" ON public.warehouses
    FOR UPDATE USING (public.is_warehouse_staff());

-- Warehouse locations policies
CREATE POLICY "Enable read access for all users" ON public.warehouse_locations
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for warehouse staff" ON public.warehouse_locations
    FOR INSERT WITH CHECK (public.is_warehouse_staff());

CREATE POLICY "Enable update for warehouse staff" ON public.warehouse_locations
    FOR UPDATE USING (public.is_warehouse_staff());

-- Products policies
CREATE POLICY "Enable read access for all users" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for warehouse staff" ON public.products
    FOR INSERT WITH CHECK (public.is_warehouse_staff());

CREATE POLICY "Enable update for warehouse staff" ON public.products
    FOR UPDATE USING (public.is_warehouse_staff());

-- Stock in policies
CREATE POLICY "Enable read access for warehouse staff" ON public.stock_in
    FOR SELECT USING (public.is_warehouse_staff());

CREATE POLICY "Enable insert for warehouse staff" ON public.stock_in
    FOR INSERT WITH CHECK (public.is_warehouse_staff());

CREATE POLICY "Enable update for warehouse staff" ON public.stock_in
    FOR UPDATE USING (public.is_warehouse_staff());

-- Processed batches policies
CREATE POLICY "Enable read access for warehouse staff" ON public.processed_batches
    FOR SELECT USING (public.is_warehouse_staff());

CREATE POLICY "Enable insert for warehouse staff" ON public.processed_batches
    FOR INSERT WITH CHECK (public.is_warehouse_staff());

-- Stock in details policies
CREATE POLICY "Enable read access for warehouse staff" ON public.stock_in_details
    FOR SELECT USING (public.is_warehouse_staff());

CREATE POLICY "Enable insert for warehouse staff" ON public.stock_in_details
    FOR INSERT WITH CHECK (public.is_warehouse_staff());

-- Inventory policies
CREATE POLICY "Enable read access for warehouse staff" ON public.inventory
    FOR SELECT USING (public.is_warehouse_staff());

CREATE POLICY "Enable insert for warehouse staff" ON public.inventory
    FOR INSERT WITH CHECK (public.is_warehouse_staff());

CREATE POLICY "Enable update for warehouse staff" ON public.inventory
    FOR UPDATE USING (public.is_warehouse_staff());

-- Batch items policies
CREATE POLICY "Enable read access for warehouse staff" ON public.batch_items
    FOR SELECT USING (public.is_warehouse_staff());

CREATE POLICY "Enable insert for warehouse staff" ON public.batch_items
    FOR INSERT WITH CHECK (public.is_warehouse_staff());

CREATE POLICY "Enable update for warehouse staff" ON public.batch_items
    FOR UPDATE USING (public.is_warehouse_staff());

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant necessary permissions to anon users (adjust as needed)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Create a function to get the current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT raw_user_meta_data->>'role' 
        FROM auth.users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create a function to get the current user's warehouse access
CREATE OR REPLACE FUNCTION public.get_user_warehouse_access()
RETURNS UUID[] AS $$
BEGIN
    RETURN (
        SELECT ARRAY(
            SELECT jsonb_array_elements_text(
                COALESCE(
                    (SELECT raw_user_meta_data->'warehouse_access' 
                     FROM auth.users 
                     WHERE id = auth.uid()),
                    '[]'::jsonb
                )
            )::uuid
        )
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Add more granular policies based on warehouse access
CREATE POLICY "Users can only access their assigned warehouses" 
ON public.warehouses
FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
        public.is_admin() OR 
        id = ANY(public.get_user_warehouse_access())
    )
);

-- Add policy for warehouse locations based on warehouse access
CREATE POLICY "Users can only access locations in their assigned warehouses" 
ON public.warehouse_locations
FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
        public.is_admin() OR 
        warehouse_id = ANY(public.get_user_warehouse_access())
    )
);

-- Enable RLS on auth.users for profile access
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow users to see their own user data
CREATE POLICY "Users can view their own profile" 
ON auth.users 
FOR SELECT 
USING (id = auth.uid());

-- Create a policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON auth.users 
FOR UPDATE 
USING (id = auth.uid());
