-- Remover políticas existentes que podem estar causando conflito
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- Desabilitar RLS temporariamente para users (já que estamos usando auth.uid())
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Ou se quiser manter RLS, usar políticas mais permissivas
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Políticas mais permissivas para users
-- CREATE POLICY "Enable read access for authenticated users" ON users FOR SELECT USING (auth.role() = 'authenticated');
-- CREATE POLICY "Enable insert for authenticated users" ON users FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY "Enable update for users based on id" ON users FOR UPDATE USING (auth.uid() = id);

-- Verificar se as outras tabelas estão funcionando
-- Para pix_payments
DROP POLICY IF EXISTS "Users can view own payments" ON pix_payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON pix_payments;

CREATE POLICY "Enable all for authenticated users on pix_payments" ON pix_payments FOR ALL USING (auth.role() = 'authenticated');

-- Para transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Enable read for authenticated users on transactions" ON transactions FOR SELECT USING (auth.role() = 'authenticated');

-- Para chat_messages
DROP POLICY IF EXISTS "Anyone can view chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Authenticated users can insert chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can update own chat messages" ON chat_messages;

CREATE POLICY "Enable all for authenticated users on chat_messages" ON chat_messages FOR ALL USING (auth.role() = 'authenticated');
